export interface Game {
  name: string;
  /** Minutes played in last 2 weeks (Steam) — not available for Xbox */
  playtimeRecent: number;
  /** Total minutes played all-time (Steam) — not available for Xbox */
  playtimeForever: number;
  /** ISO date string of when the game was last played */
  lastPlayed?: string;
  /** Which platform this game is from */
  platform: "steam" | "xbox";
}

export interface SteamConfig {
  apiKey: string;
  steamId: string;
}

export interface XboxConfig {
  apiKey: string;
}

export interface GistConfig {
  token: string;
  gistId: string;
}
