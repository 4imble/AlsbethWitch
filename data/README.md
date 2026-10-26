# Game state

The character sheet (`index.html`) renders these two files. They are the single source of truth for Alice's current state. Edit them, commit to `main`, and the sheet picks up the change within about 15 seconds; there is no separate sync step.

| File | What it holds |
| --- | --- |
| `state.json` | Alice's sheet as it stands right now. Overwrite values in place. |
| `log.json` | Story log, one entry per scene. Append to the end; never rewrite old entries. |
| `state.schema.json`, `log.schema.json` | JSON Schemas for the two files. |

Git history is the full audit trail, so `state.json` only ever needs the present. The secret case file lives in `gm/case-file.md`, which the sheet never reads.

## Updating after a beat of play

1. Change the values that moved in `state.json`.
2. Set `updated_at` to the current UTC time, e.g. `2026-10-26T18:05:00Z`.
3. Set `last_log` to one line saying what just happened or what Alice faces. The sheet shows it at the top of the Now tab.
4. At the end of a scene, append an entry to `log.json`: `{ "at": "<UTC time>", "title": "<short>", "text": "<a few sentences>" }`.
5. Run `npm install && npm run validate`, then commit with a message describing the beat.

A GitHub Action runs the same validation on every push and PR touching `data/`, so a malformed file shows up as a red check.

## state.json fields

Values the page works out itself (marked *derived*) must **not** be stored.

| Path | Type | Notes |
| --- | --- | --- |
| `schema_version` | `1` | Bump only with a schema change. |
| `updated_at` | UTC timestamp | `YYYY-MM-DDTHH:MM:SSZ`. |
| `character.name` | string | Required. |
| `character.title`, `.calling`, `.origin`, `.occupation`, `.look` | string, optional | Header badge, subtitle and the "Who she is" panel. |
| `resolve.current`, `.max` | integer | Health and nerve together. `current` may not exceed `max`. The sheet shows a word, *derived*: Steady (over 2/3), Shaken (over 1/3), Frayed (above 0), Spent (0). The number only shows under the hood. |
| `conditions` | string[], optional | Short labels shown as chips under Resolve, e.g. `"Soaked"`, `"Followed"`. |
| `witchlight.current`, `.max`, `.recovery` | integer, integer (0–12), string | Magic. One glowing pip per point of `max`. |
| `powers[]` | `{ name, kind, status, cost, description }` | `kind`: `power`, `charm`, `bond` or `talent` (sets the colour and label). `status`: `active` or `locked`. Locked powers show as "???" with their `description` as a teaser, under "Not yet woken". `cost` is free text (e.g. `"1 witchlight"`, `"Free"`). To unlock: set `status` to `active`, and rewrite `name`, `cost` and `description`. |
| `case.title`, `.day` | string, integer ≥ 1 | `day` counts days since Simon vanished. Shown in the vitals strip. |
| `case.summary` | string, optional | A short paragraph: what Alice currently believes. |
| `case.questions[]` | string[], optional | Open questions she's chasing. Remove them when answered. |
| `case.clues[]` | `{ title, text, source, status }` | `status`: `new`, `following`, `key` or `dead end`. The board sorts key → following → new → dead end. The vitals strip counts every clue that isn't a dead end as a live lead. `source` is where she found it. |
| `case.people[]` | `{ name, role, stance, icon, notes }` | `stance`: `missing`, `ally`, `contact`, `neutral`, `suspect`, `hostile` or `unknown`. `icon` is an emoji. |
| `case.places[]` | `{ name, notes, status }` | `status`: `unvisited`, `visited` or `done` (nothing more to find). |
| `inventory.money[]` | `{ label, amount, notes }` | `amount` is free text so any currency works (`"£46.20"`, `"3,200 sen"`). |
| `inventory.items[]` | `{ name, qty, notes }` | `qty` ≥ 1. Remove an item when it's gone. |
| `inventory.keepsakes` | string[], optional | |
| `world.location`, `.district`, `.time`, `.weather` | string, optional | `location` and `time` also show in the vitals strip. |
| `world.companions[]` | `{ name, role, icon, notes, status, away, resolve_current, resolve_max, conditions }` | Who's with Alice. Only `name` is required. `status` is what they're doing now; `away: true` fades the card. Track `resolve_current`/`resolve_max` and `conditions` only for people who can be hurt. **Saskee and Suki must always be listed and must never have resolve or conditions** (the validator checks). |
| `scene.active` | boolean | `true` shows the Trouble panel on the Now tab. |
| `scene.title`, `.threats[]`, `.environment[]` | string, `{ name, status, notes }[]`, string[] | Only while `active`. `status` is plain words ("Closing in", "Fled"). `environment` lists things Alice could use. Set `scene` to `{ "active": false }` when it's over. |
| `mechanics.level` | integer 1–20 | Milestone levels; see CLAUDE.md. |
| `mechanics.proficiency_bonus` | integer ≥ 2 | |
| `mechanics.defence` | integer | Armour-class equivalent for when something tries to hit her. |
| `mechanics.abilities.<str\|dex\|con\|int\|wis\|cha>` | integer | Scores. Modifiers are *derived*. |
| `mechanics.save_proficiencies` | string[], optional | Ability keys she adds proficiency to on saves. |
| `mechanics.skills[]` | `{ name, ability, proficiency }` | Only skills she's trained in. `proficiency`: `proficient` or `expertise`. Bonus is *derived*. |
| `player_notes[]` | `{ title, text, group, at }`, optional | Things the player asked to have written down. Shown on the Notes tab in the order stored; append new ones at the end. `group` (e.g. `Story`, `People`, `Lore`, `Open threads`) makes a sub-tab once there's more than one; keep spelling consistent. Each note has a button that copies `ooc: delete note #N "Title"`. |
| `last_log` | string | One line for the top of the Now tab. |
| `notes` | string, optional | GM scratch text, not shown on the sheet. Nothing secret about the case: the repo is readable. |

The **Under the hood** panel on the Alice tab (folded away by default) shows the *derived* numbers: ability modifiers, trained skill bonuses and the Craft DC (8 + WIS modifier + proficiency).
