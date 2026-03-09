import { Game, SteamConfig } from "./types.js";

interface SteamRecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url?: string;
}

interface SteamResponse {
  response: {
    total_count: number;
    games: SteamRecentGame[];
  };
}

export async function fetchSteamGames(config: SteamConfig): Promise<Game[]> {
  const url = new URL(
    "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/"
  );
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("steamid", config.steamId);
  url.searchParams.set("count", "10");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Steam API error: ${res.status} ${res.statusText}`);
  }

  const data: SteamResponse = await res.json();
  if (!data.response?.games) {
    return [];
  }

  return data.response.games.map((game) => ({
    name: game.name,
    playtimeRecent: game.playtime_2weeks,
    playtimeForever: game.playtime_forever,
    platform: "steam" as const,
  }));
}
