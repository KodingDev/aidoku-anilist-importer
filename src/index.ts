// eslint-disable-next-line @typescript-eslint/no-empty-interface
import updateRoute from "@/routes/update";
import { createError } from "@/util/http";
import callbackRoute from "@/routes/callback";
import { getAuthorizeUrl } from "@/util/oauth";

export interface Environment {
  ANILIST_APP_ID: string;
  ANILIST_APP_SECRET: string;
  ANILIST_REDIRECT_URI: string;
  API_KEY: string;

  KV: KVNamespace;

  ANILIST_USERNAME: string;
}

// noinspection JSUnusedGlobalSymbols
export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/") {
      return updateRoute(request, env);
    } else if (path === "/callback") {
      return callbackRoute(request, env);
    } else if (path === "/login") {
      return Response.redirect(getAuthorizeUrl(env));
    } else {
      return createError("Not Found", 404);
    }
  },
};
