[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ahmed1813544/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ahmed1813544/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

An unofficial fan-made trophy guide for Grand Theft Auto VI (PlayStation 5), built as an entry for make.fun's gta6-trophy-guide-01 bounty.

makefun anchor 302b4c63749229bbad3ede1f4cfd0e9c22e03659 round 34150838

## What it is

- `app/` — the guide itself: plain static files (HTML, CSS, ES-module JS, JSON), no build step, loads nothing over the network.
  - All 55 official PS5 trophies, each with its official name, description and grade, a guide written for this entry, a kind (story / collectibles / activities), a missable flag where the official description points to a one-off moment, and its sources.
  - A five-stage roadmap to the platinum, filters by grade and kind, search, a spoiler shield that hides story trophies until earned, and a tracker whose progress is saved in localStorage and can be exported to / imported from a JSON file.
  - Trophy data lives in `app/data/trophies.json`.
- `main.ts` — the hand-in program the grader runs (Node 22, standard library only): copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` using `vendor/makefun-frontend.ts` (vendored, unmodified).
- `serve.ts` — a tiny local static server for development: `node serve.ts`, then open http://localhost:8080.
- `screenshots/` — real renders of this app in a browser, per `shots.json`.

Trophy names and descriptions are the official list as published by PlayStation; all guide text is original to this entry and cites its sources on every card. No Rockstar Games logo, artwork or game screenshots are used.
