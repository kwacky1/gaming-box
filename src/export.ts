import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Game } from "./types.js";

export interface GamingData {
  updatedAt: string;
  games: Game[];
}

/**
 * Writes merged game data to a JSON file for consumption by other projects.
 */
export function exportJson(games: Game[], outputPath: string): void {
  const data: GamingData = {
    updatedAt: new Date().toISOString(),
    games,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`📄 Exported ${games.length} games to ${outputPath}`);
}
