import { GOAL, SPAWN, TILE_CHARS } from './tiles';

export const FORMAT_VERSION = 1;
export const MAX_WIDTH = 120;
export const MAX_HEIGHT = 40;
export const MAX_NAME_LENGTH = 40;
export const MAX_ERRORS = 10;
// The editor's "Play" button stores the level here; the game page reads it back.
export const PLAY_STORAGE_KEY = 'browser-game-level-editor:play';

export interface Level {
  version: number;
  name: string;
  rows: string[];
}

export type Validation = { ok: true; level: Level } | { ok: false; errors: string[] };

// Checks data loaded from a file (or built in the editor) before the game uses it.
export function validateLevel(data: unknown): Validation {
  const errors: string[] = [];
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, errors: ['A level must be a JSON object.'] };
  }
  const obj = data as Record<string, unknown>;

  const version = obj.version ?? FORMAT_VERSION;
  if (version !== FORMAT_VERSION) {
    errors.push(`Unsupported version ${String(version)}. Expected ${FORMAT_VERSION}.`);
  }

  const name = obj.name;
  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('"name" must be a non-empty string.');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`"name" must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }

  const rows = obj.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    errors.push('"rows" must be a non-empty list of strings.');
  } else if (rows.length > MAX_HEIGHT) {
    errors.push(`A level can have at most ${MAX_HEIGHT} rows.`);
  } else {
    const width = typeof rows[0] === 'string' ? rows[0].length : 0;
    if (width === 0) errors.push('The first row is empty or not a string.');
    if (width > MAX_WIDTH) errors.push(`A level can have at most ${MAX_WIDTH} columns.`);

    let spawns = 0;
    let goals = 0;
    rows.forEach((row: unknown, y: number) => {
      if (typeof row !== 'string') {
        errors.push(`Row ${y} is not a string.`);
        return;
      }
      if (row.length !== width) {
        errors.push(`Row ${y} has ${row.length} columns but row 0 has ${width}.`);
      }
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (!TILE_CHARS.includes(ch)) {
          errors.push(`Row ${y}, column ${x} has an unknown character "${ch}".`);
        }
        if (ch === SPAWN) spawns++;
        if (ch === GOAL) goals++;
      }
    });
    if (spawns !== 1) errors.push(`A level needs exactly one spawn "${SPAWN}", found ${spawns}.`);
    if (goals !== 1) errors.push(`A level needs exactly one goal "${GOAL}", found ${goals}.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors.slice(0, MAX_ERRORS) };
  }
  return {
    ok: true,
    level: {
      version: FORMAT_VERSION,
      name: (name as string).trim(),
      rows: rows as string[],
    },
  };
}

// Reads level text from a file. Invalid JSON is reported the same way as invalid levels.
export function parseLevel(text: string): Validation {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error';
    return { ok: false, errors: [`The file is not valid JSON: ${reason}`] };
  }
  return validateLevel(data);
}

// One row per line, so a level stays easy to read and diff in git.
export function serializeLevel(level: Level): string {
  return JSON.stringify({ version: FORMAT_VERSION, name: level.name, rows: level.rows }, null, 2) + '\n';
}
