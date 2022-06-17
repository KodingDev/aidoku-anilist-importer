import { GraphQLClient } from "graphql-request";
import { GetMangaQuery, getSdk, MediaList } from "@/generated/graphql";
import { AidokuManga } from "@/util/aidoku";

export const createAniListClient = (token: string | undefined = undefined) => {
  const client = new GraphQLClient("https://graphql.anilist.co", {
    fetch,
  });

  if (token) {
    client.setHeader("Authorization", `Bearer ${token}`);
  }

  return getSdk(client);
};

export const matchMangaFromList = (
  query: GetMangaQuery,
  manga: AidokuManga,
): MediaList | null => {
  const lists = query.MediaListCollection?.lists;
  if (!lists) {
    return null;
  }

  for (const list of lists) {
    for (const entry of list?.entries ?? []) {
      const list = entry as MediaList;
      const media = entry?.media;

      if (media?.id?.toString() === manga.id) {
        return list;
      }

      if (media?.title?.native === manga.title) {
        return list;
      }

      if (media?.title?.romaji === manga.title) {
        return list;
      }

      if (media?.title?.english === manga.title) {
        return list;
      }
    }
  }

  return null;
};
