import { createError, createJsonResponse } from "@/util/http";
import { Environment } from "@/index";
import { refreshAccessToken } from "@/util/oauth";
import { createAniListClient, matchMangaFromList } from "@/util/graphql";
import { AidokuBackup, AidokuChapter } from "@/util/aidoku";
import { MediaListStatus } from "@/generated/graphql";

interface UpdateData {
  manga: string;
  action: string;
}

const updateRoute = async (
  req: Request,
  env: Environment,
): Promise<Response> => {
  const auth = req.headers.get("X-API-Key") || "";
  if (auth !== env.API_KEY) {
    return createError("Unauthorized", 401);
  }

  if (req.method !== "POST") {
    return createError("Method Not Allowed", 405);
  }

  if (!req.body) {
    return createError("No body", 400);
  }

  const body = await req.json<AidokuBackup>();
  if (!body.history) {
    return createError("No history", 400);
  }

  if (!body.manga) {
    return createError("No manga", 400);
  }

  if (!body.chapters) {
    return createError("No chapters", 400);
  }

  // Authenticate with AniList
  const expiresAt = await env.KV.get("expires_at");
  if (!expiresAt) {
    return createError("Not authenticated", 401);
  }

  if (Date.now() > parseInt(expiresAt)) {
    const refreshToken = await env.KV.get("refresh_token");
    if (!refreshToken) {
      return createError("Not authenticated", 401);
    }

    const response = await refreshAccessToken(env, refreshToken);
    if (!response.access_token) {
      return createError("Not authenticated", 401);
    }

    await env.KV.put("access_token", response.access_token);
    await env.KV.put("refresh_token", response.refresh_token);
    await env.KV.put(
      "expires_at",
      (Date.now() + response.expires_in).toString(),
    );
  }

  const accessToken = await env.KV.get("access_token");
  if (!accessToken) {
    return createError("Not authenticated", 401);
  }

  const client = createAniListClient(accessToken);
  const user = await client.getSelf();
  const list = await client.getManga({ id: user.Viewer?.id ?? 0 });

  const updates: UpdateData[] = [];

  for (const manga of body.manga) {
    const chapter = body.history
      .filter((c) => c.mangaId === manga.id && c.completed)
      .map((c) => body.chapters.find((c2) => c2.id === c.chapterId))
      .filter((c) => c)
      .map((c) => c as AidokuChapter)
      .sort((a, b) => a.chapter - b.chapter)
      .pop();

    if (!chapter || chapter.chapter === 0) {
      continue;
    }

    const media = matchMangaFromList(list, manga);
    if (media) {
      if (!media.progress || !media.media?.id) {
        continue;
      }

      if (media.progress < chapter.chapter) {
        updates.push({
          manga: manga.title,
          action: `Update chapter to ${Math.floor(chapter.chapter)}`,
        });

        await client.setMangaProgress({
          id: media.media?.id,
          progress: Math.floor(chapter.chapter),
          progressVolumes: chapter.volume,
          status: media.status,
        });
      }

      continue;
    }

    const mangaSearch = await client.search({ query: manga.title });
    if (!mangaSearch.Media) {
      continue;
    }

    const mediaId = mangaSearch.Media.id;
    await client.setMangaProgress({
      id: mediaId,
      progress: Math.floor(chapter.chapter),
      progressVolumes: chapter.volume,
      status: MediaListStatus.Current,
    });

    updates.push({
      manga: manga.title,
      action: `Add to list with chapter ${Math.floor(chapter.chapter)}`,
    });
  }

  return createJsonResponse({ updates });
};

export default updateRoute;
