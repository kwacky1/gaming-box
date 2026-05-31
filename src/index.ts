import "dotenv/config";
import { resolve } from "node:path";
import { fetchSteamGames } from "./steam.js";
import { fetchXboxGames } from "./xbox.js";
import { formatGames } from "./format.js";
import { updateGist } from "./gist.js";
import { exportJson } from "./export.js";
import { Game, SteamConfig, XboxConfig, GistConfig } from "./types.js";

const jsonMode = process.argv.includes("--json");

async function main(): Promise<void> {
  // Gist config is only required when not in --json mode
  let gistConfig: GistConfig | undefined;
  if (!jsonMode) {
    gistConfig = {
      token: requireEnv("GH_TOKEN"),
      gistId: requireEnv("GIST_ID"),
    };
  }

  const allGames: Game[] = [];

  // Fetch Steam games (optional — only if configured)
  const steamKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;
  if (steamKey && steamId) {
    const steamConfig: SteamConfig = { apiKey: steamKey, steamId };
    try {
      console.log("🔵 Fetching Steam games...");
      const games = await fetchSteamGames(steamConfig);
      console.log(`   Found ${games.length} recently played Steam games`);
      allGames.push(...games);
    } catch (err) {
      console.error("⚠️  Steam fetch failed:", err);
    }
  } else {
    console.log("ℹ️  Steam not configured (STEAM_API_KEY / STEAM_ID missing)");
  }

  // Fetch Xbox games (optional — only if configured)
  const xboxKey = process.env.OPENXBL_API_KEY;
  if (xboxKey) {
    const xboxConfig: XboxConfig = { apiKey: xboxKey };
    try {
      console.log("🟢 Fetching Xbox games...");
      const games = await fetchXboxGames(xboxConfig);
      console.log(`   Found ${games.length} recently played Xbox games`);
      allGames.push(...games);
    } catch (err) {
      console.error("⚠️  Xbox fetch failed:", err);
    }
  } else {
    console.log("ℹ️  Xbox not configured (OPENXBL_API_KEY missing)");
  }

  if (allGames.length === 0 && !steamKey && !xboxKey) {
    throw new Error(
      "No platforms configured. Set STEAM_API_KEY + STEAM_ID and/or OPENXBL_API_KEY."
    );
  }

  // Merge, format, and update gist (or export JSON)
  const { title, content } = formatGames(allGames);
  console.log(`\n${title}\n${content}\n`);

  if (jsonMode) {
    const outputPath = resolve("dist", "gaming-data.json");
    exportJson(allGames, outputPath);
  } else {
    await updateGist(gistConfig!, title, content);
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
