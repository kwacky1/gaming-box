import { Game, XboxConfig } from "./types.js";

interface XboxTitle {
  titleId: string;
  name: string;
  type: string;
  displayImage?: string;
  titleHistory?: {
    lastTimePlayed: string;
    visible: boolean;
  };
  achievement?: {
    currentGamerscore: number;
    totalGamerscore: number;
  };
}

interface XboxTitleHistoryResponse {
  titles: XboxTitle[];
}

/**
 * Fetches recently played Xbox games from OpenXBL.
 * Uses the /api/v2/player/titleHistory endpoint.
 */
export async function fetchXboxGames(config: XboxConfig): Promise<Game[]> {
  const res = await fetch("https://xbl.io/api/v2/player/titleHistory", {
    headers: {
      "X-Authorization": config.apiKey,
      "Accept": "application/json",
      "Accept-Language": "en-AU",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenXBL API error: ${res.status} ${res.statusText} ${body}`);
  }

  const data: XboxTitleHistoryResponse = await res.json();
  if (!data.titles?.length) {
    return [];
  }

  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  return data.titles
    .filter((title) => {
      if (title.type !== "Game") return false;
      const lastPlayed = title.titleHistory?.lastTimePlayed;
      if (!lastPlayed) return false;
      return now - new Date(lastPlayed).getTime() <= twoWeeksMs;
    })
    .map((title) => ({
      name: title.name,
      playtimeRecent: 0,
      playtimeForever: 0,
      lastPlayed: title.titleHistory?.lastTimePlayed,
      platform: "xbox" as const,
    }))
    .slice(0, 10);
}
