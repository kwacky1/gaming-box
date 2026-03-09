import { Game } from "./types.js";

const MAX_LINES = 5;
const BAR_LENGTH = 12;
const MAX_NAME_LENGTH = 24;

const PLATFORM_ICON: Record<string, string> = {
  steam: "🔵",
  xbox: "🟢",
};

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

function formatHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 10) return `${Math.round(hours)} hrs`;
  if (hours >= 1) return `${hours.toFixed(1)} hrs`;
  return `${minutes} min`;
}

function formatLastPlayed(isoDate?: string): string {
  if (!isoDate) return "recently";
  const days = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days}d ago`;
}

function makeBar(ratio: number, length: number): string {
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Merges games from all platforms, deduplicates by name (preferring
 * the entry with playtime data), sorts, and formats for the gist.
 */
export function formatGames(games: Game[]): { title: string; content: string } {
  if (games.length === 0) {
    return {
      title: "🎮 Recently Played Games",
      content: "No recently played games found.",
    };
  }

  // Deduplicate: if the same game appears on both platforms, keep the
  // one with playtime data (Steam), since Xbox doesn't provide hours.
  const seen = new Map<string, Game>();
  for (const game of games) {
    const key = game.name.toLowerCase();
    const existing = seen.get(key);
    if (!existing || game.playtimeRecent > existing.playtimeRecent) {
      seen.set(key, game);
    }
  }
  const deduped = [...seen.values()];

  // Sort: Steam games by playtime desc, then Xbox games by lastPlayed desc
  const sorted = [...deduped].sort((a, b) => {
    // Games with playtime data come first (sorted by playtime)
    if (a.playtimeRecent > 0 && b.playtimeRecent > 0) {
      return b.playtimeRecent - a.playtimeRecent;
    }
    if (a.playtimeRecent > 0) return -1;
    if (b.playtimeRecent > 0) return 1;

    // For games without playtime (Xbox), sort by lastPlayed date
    const aTime = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
    const bTime = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
    return bTime - aTime;
  });

  const top = sorted.slice(0, MAX_LINES);
  const maxPlaytime = Math.max(...top.map((g) => g.playtimeRecent));

  const lines = top.map((game) => {
    const name = truncate(game.name, MAX_NAME_LENGTH).padEnd(MAX_NAME_LENGTH);
    const icon = PLATFORM_ICON[game.platform] ?? "🎮";

    if (game.playtimeRecent > 0) {
      // Steam-style: bar chart + hours
      const ratio = maxPlaytime > 0 ? game.playtimeRecent / maxPlaytime : 0;
      const bar = makeBar(ratio, BAR_LENGTH);
      const hours = formatHours(game.playtimeRecent);
      return `${name} ${bar} ${hours.padStart(7)} ${icon}`;
    } else {
      // Xbox-style: last played date
      const lastPlayed = formatLastPlayed(game.lastPlayed);
      const padding = BAR_LENGTH + 1 + 7; // bar + space + hours width
      return `${name} ${lastPlayed.padStart(padding)} ${icon}`;
    }
  });

  return {
    title: "🎮 Recently Played Games",
    content: lines.join("\n"),
  };
}
