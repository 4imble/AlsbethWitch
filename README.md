# Alice in Yūgure

Living character sheet and game backend for Alice, a newly woken witch searching a neon 1980s city for her abducted husband.

- **Sheet:** `index.html`, served by GitHub Pages. It reads the game state from this repo and refreshes itself every 15 seconds.
- **Game state:** `data/state.json` (current sheet) and `data/log.json` (story log). See [data/README.md](data/README.md).
- **Backstory:** [campaign/backstory.md](campaign/backstory.md). **World guide:** [campaign/world.md](campaign/world.md).
- **Running the game:** [CLAUDE.md](CLAUDE.md) tells a Claude session everything it needs to act as GM.
- **Spoilers:** `gm/case-file.md` holds the secret solution to the mystery. Don't open it if you're the player.

## Hosting

Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`. The site is then at `https://4imble.github.io/AlsbethWitch/`.

## Portrait

Optional. Add `assets/alice-avatar.jpg` (square-ish, used in the header) and `assets/alice-portrait.jpg` (opened when the header image is clicked). Until then the header shows a moon.

## Validating state locally

```sh
npm install
npm run validate
```
