// Validates data/state.json and data/log.json against their JSON Schemas,
// plus a few cross-field rules a schema can't express.
// Usage: npm install && npm run validate
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const ajv = new Ajv2020({ allErrors: true });
let failed = false;

function check(dataPath, schemaPath) {
  const validate = ajv.compile(read(schemaPath));
  const data = read(dataPath);
  if (!validate(data)) {
    failed = true;
    for (const err of validate.errors) console.error(`${dataPath}${err.instancePath || '/'}: ${err.message}`);
  }
  return data;
}

const state = check('data/state.json', 'data/state.schema.json');
const log = check('data/log.json', 'data/log.schema.json');

const rule = (ok, msg) => { if (!ok) { failed = true; console.error(`data/state.json: ${msg}`); } };
rule(state.resolve.current <= state.resolve.max, 'resolve.current is above resolve.max');
rule(state.witchlight.current <= state.witchlight.max, 'witchlight.current is above witchlight.max');
for (const c of state.world?.companions ?? []) {
  if (c.resolve_current != null && c.resolve_max != null) rule(c.resolve_current <= c.resolve_max, `world.companions "${c.name}" resolve_current is above resolve_max`);
}
// Saskee and Suki can never come to harm (see CLAUDE.md), so nothing on the sheet may say otherwise.
for (const cat of ['Saskee', 'Suki']) {
  const c = (state.world?.companions ?? []).find((x) => x.name === cat);
  rule(c != null, `world.companions must include ${cat}`);
  if (c) {
    rule(c.resolve_current == null && c.resolve_max == null, `${cat} must not have resolve tracked (the cats can't be hurt)`);
    rule(!(c.conditions ?? []).length, `${cat} must not have conditions (the cats can't be hurt)`);
  }
}
const noteGroups = new Map();
for (const n of state.player_notes ?? []) {
  if (!n.group) continue;
  const key = n.group.trim().toLowerCase();
  const seen = noteGroups.get(key);
  rule(seen == null || seen === n.group, `player_notes group "${n.group}" differs from "${seen}" only by case or spacing (use the same spelling so they share a sub-tab)`);
  if (seen == null) noteGroups.set(key, n.group);
}
if (Array.isArray(log) && log.length > 1) {
  for (let i = 1; i < log.length; i++) rule(log[i - 1].at <= log[i].at, `data/log.json entry ${i} is older than the one before it (append new entries at the end)`);
}

if (failed) process.exit(1);
console.log('data/state.json and data/log.json are valid.');
