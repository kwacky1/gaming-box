import { Game, XboxConfig } from "./types.js";

interface XboxTitle {
  titleId: string;
  name: string;
  type: string;
  lastTimePlayed?: string;
  displayImage?: string;
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
  console.log(`   OpenXBL returned ${data.titles?.length ?? 0} total titles`);
  if (data.titles?.length) {
    // Log first few titles for debugging
    for (const t of data.titles.slice(0, 3)) {
      console.log(`   - "${t.name}" type=${t.type} lastPlayed=${t.lastTimePlayed}`);
    }
  }
  if (!data.titles?.length) {
    return [];
  }

  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  return data.titles
    .filter((title) => {
      // Only include titles played in the last 2 weeks to match Steam's window
      if (!title.lastTimePlayed) return false;
      const lastPlayed = new Date(title.lastTimePlayed).getTime();
      return now - lastPlayed <= twoWeeksMs;
    })
    .map((title) => ({
      name: title.name,
      playtimeRecent: 0, // Xbox API doesn't expose playtime
      playtimeForever: 0,
      lastPlayed: title.lastTimePlayed,
      platform: "xbox" as const,
    }))
    .slice(0, 10);
}
