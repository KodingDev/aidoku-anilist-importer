import { Environment } from "@/index";

export const getAuthorizeUrl = (env: Environment) =>
  `https://anilist.co/api/v2/oauth/authorize
?client_id=${env.ANILIST_APP_ID}
&redirect_uri=${encodeURI(env.ANILIST_REDIRECT_URI)}
&response_type=code`.replace(/\n/g, "");

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const getAccessToken = async (
  env: Environment,
  code: string,
): Promise<OAuthTokenResponse> =>
  await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: env.ANILIST_APP_ID,
      client_secret: env.ANILIST_APP_SECRET,
      redirect_uri: env.ANILIST_REDIRECT_URI,
      code,
    }),
  }).then((res) => res.json());

interface OAuthRefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const refreshAccessToken = async (
  env: Environment,
  refreshToken: string,
): Promise<OAuthRefreshTokenResponse> =>
  await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: env.ANILIST_APP_ID,
      client_secret: env.ANILIST_APP_SECRET,
      refresh_token: refreshToken,
    }),
  }).then((res) => res.json());
