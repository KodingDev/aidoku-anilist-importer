export interface AidokuBackup {
  history: AidokuHistory[];
  manga: AidokuManga[];
  chapters: AidokuChapter[];
}

export interface AidokuHistory {
  progress: number;
  mangaId: string;
  chapterId: string;
  completed: boolean;
  sourceId: string;
  dateRead: number;
}

export interface AidokuManga {
  id: string;
  author: string;
  url: string;
  nsfw: number;
  desc: string;
  title: string;
  tags: string[];
  artist: string;
}

export interface AidokuChapter {
  volume: number;
  mangaId: string;
  lang: string;
  id: string;
  dateUploaded: number;
  title: string;
  sourceId: string;
  chapter: number;
}
