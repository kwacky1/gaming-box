# 🎮 gaming-box

> Update a pinned gist to show your recently played games across **Steam** and **Xbox**.

Displays your recently played games in a unified leaderboard on your GitHub profile, combining data from Steam and Xbox (via OpenXBL).

```
🎮 Recently Played Games
Elden Ring               ████████████  42 hrs 🔵
Counter-Strike 2         █████░░░░░░░  18 hrs 🔵
Cyberpunk 2077           ██░░░░░░░░░░ 6.0 hrs 🔵
Halo Infinite                       1 day ago 🟢
Forza Horizon 5                        3d ago 🟢
```

🔵 = Steam · 🟢 = Xbox

---

## Setup

### 1. Create a GitHub Gist

Create a [new public gist](https://gist.github.com/) with any filename and content. Copy the **Gist ID** from the URL (the hash after your username).

### 2. Create a GitHub Token

Create a [personal access token](https://github.com/settings/tokens/new) with the **`gist`** scope.

### 3. Get Your API Keys

#### Steam (optional)

1. Get a Steam Web API key from [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Find your SteamID64 from [steamid.io](https://steamid.io/)

#### Xbox (optional)

1. Sign up at [xbl.io](https://xbl.io/) and get your free API key

> At least one platform must be configured. If only one is set up, the gist will show just that platform's games.

### 4. Fork and Configure

1. Fork this repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret | Required | Description |
|--------|----------|-------------|
| `GH_TOKEN` | ✅ | GitHub token with `gist` scope |
| `GIST_ID` | ✅ | ID of the gist to update |
| `STEAM_API_KEY` | ❌ | Steam Web API key |
| `STEAM_ID` | ❌ | Your 64-bit Steam ID |
| `OPENXBL_API_KEY` | ❌ | OpenXBL API key from xbl.io |

### 5. Enable the Workflow

Go to the **Actions** tab in your fork, enable workflows, and either wait for the schedule (every 6 hours) or trigger it manually.

---

## Local Development

```bash
cp sample.env .env
# Fill in your keys in .env
npm install
npm run dev
```

## How It Works

- **Steam**: Fetches recently played games (last 2 weeks) via the [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API), showing playtime with a bar chart
- **Xbox**: Fetches title history via [OpenXBL](https://xbl.io), showing "last played X days ago" (Xbox doesn't expose playtime through its API)
- Games are merged into a single list: Steam games sorted by playtime, then Xbox games sorted by last played date
- The gist is updated via the GitHub API every 6 hours

## Related Projects

Part of a collection of pinned gist boxes:

- [music-box](https://github.com/kwacky1/music-box) — 🎵 Weekly listening stats
- [fitbit-box](https://github.com/kwacky1/fitbit-box) — 🏃 Fitness & sleep stats
- [book-stats](https://github.com/kwacky1/book-stats) — 📚 Reading stats

See also [awesome-pinned-gists](https://github.com/matchai/awesome-pinned-gists) for more.

## Licence

MIT
