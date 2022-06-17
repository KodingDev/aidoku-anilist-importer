import { createError, createJsonResponse } from "@/util/http";
import { Environment } from "@/index";
import { getAccessToken } from "@/util/oauth";
import { createAniListClient } from "@/util/graphql";

const callbackRoute = async (
  req: Request,
  env: Environment,
): Promise<Response> => {
  if (req.method !== "GET") {
    return createError("Method Not Allowed", 405);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return createError("Bad Request", 400);
  }

  const response = await getAccessToken(env, code);
  if (!response.access_token) {
    return createError("Bad Request", 400);
  }

  const client = createAniListClient(response.access_token);
  const user = await client.getSelf();

  if (user.Viewer?.name !== env.ANILIST_USERNAME) {
    return createError("Bad Request", 400);
  }

  await env.KV.put("access_token", response.access_token);
  await env.KV.put("refresh_token", response.refresh_token);
  await env.KV.put("expires_at", `${Date.now() + response.expires_in}`);

  return createJsonResponse({ success: true });
};

export default callbackRoute;
