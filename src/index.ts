import "dotenv/config";
import { fetchSteamGames } from "./steam.js";
import { fetchXboxGames } from "./xbox.js";
import { formatGames } from "./format.js";
import { updateGist } from "./gist.js";
import { Game, SteamConfig, XboxConfig, GistConfig } from "./types.js";

async function main(): Promise<void> {
  const gistConfig: GistConfig = {
    token: requireEnv("GH_TOKEN"),
    gistId: requireEnv("GIST_ID"),
  };

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

  // Merge, format, and update gist
  const { title, content } = formatGames(allGames);
  console.log(`\n${title}\n${content}\n`);

  await updateGist(gistConfig, title, content);
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
