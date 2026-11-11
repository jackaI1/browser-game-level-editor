import { describe, expect, it } from 'vitest';
import { FORMAT_VERSION, MAX_NAME_LENGTH, parseLevel, serializeLevel, validateLevel, type Level } from './level';
import { BUNDLED_LEVELS } from '../levels';

const valid = {
  version: 1,
  name: 'Test',
  rows: ['.....', '.P.G.', '#####'],
};

function errorsFor(data: unknown): string[] {
  const result = validateLevel(data);
  if (result.ok) throw new Error('expected the level to be invalid');
  return result.errors;
}

describe('validateLevel', () => {
  it('accepts a level with one spawn and one goal', () => {
    const result = validateLevel(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.level.rows).toEqual(valid.rows);
  });

  it('accepts a missing version and treats it as the current version', () => {
    const { version: _version, ...withoutVersion } = valid;
    const result = validateLevel(withoutVersion);
    expect(result.ok && result.level.version).toBe(FORMAT_VERSION);
  });

  it('rejects something that is not an object', () => {
    expect(errorsFor(null)).toEqual(['A level must be a JSON object.']);
    expect(errorsFor([1, 2])).toEqual(['A level must be a JSON object.']);
  });

  it('rejects an unsupported version', () => {
    expect(errorsFor({ ...valid, version: 2 })[0]).toContain('Unsupported version 2');
  });

  it('rejects a missing or empty name', () => {
    expect(errorsFor({ ...valid, name: '' })[0]).toContain('"name"');
    expect(errorsFor({ ...valid, name: undefined })[0]).toContain('"name"');
  });

  it('rejects a name that is too long', () => {
    const errors = errorsFor({ ...valid, name: 'x'.repeat(MAX_NAME_LENGTH + 1) });
    expect(errors[0]).toContain(`${MAX_NAME_LENGTH} characters`);
  });

  it('rejects a level with no spawn', () => {
    expect(errorsFor({ ...valid, rows: ['.....', '..G..', '#####'] })).toContain(
      'A level needs exactly one spawn "P", found 0.',
    );
  });

  it('rejects a level with two goals', () => {
    expect(errorsFor({ ...valid, rows: ['G...G', '.P...', '#####'] })).toContain(
      'A level needs exactly one goal "G", found 2.',
    );
  });

  it('rejects rows of different lengths', () => {
    expect(errorsFor({ ...valid, rows: ['.....', '.P.G', '#####'] })).toContain(
      'Row 1 has 4 columns but row 0 has 5.',
    );
  });

  it('rejects an unknown tile character and names its position', () => {
    expect(errorsFor({ ...valid, rows: ['.....', '.P.G?', '#####'] })).toContain(
      'Row 1, column 4 has an unknown character "?".',
    );
  });

  it('rejects an empty rows list and non-string rows', () => {
    expect(errorsFor({ ...valid, rows: [] })[0]).toContain('"rows"');
    expect(errorsFor({ ...valid, rows: ['.P.G', 7, '####'] })).toContain('Row 1 is not a string.');
  });

  it('rejects a level that is too large', () => {
    const wide = ['P' + '.'.repeat(120), '.'.repeat(120), 'G' + '.'.repeat(120)];
    expect(errorsFor({ ...valid, rows: wide })).toContain('A level can have at most 120 columns.');
  });

  it('limits the number of errors it reports', () => {
    const rows = Array.from({ length: 30 }, () => '?????');
    expect(errorsFor({ ...valid, rows }).length).toBeLessThanOrEqual(10);
  });
});

describe('parseLevel and serializeLevel', () => {
  it('reports invalid JSON as an error instead of throwing', () => {
    const result = parseLevel('{ not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain('not valid JSON');
  });

  it('round-trips a level through JSON text', () => {
    const level: Level = { version: 1, name: 'Round trip', rows: valid.rows };
    const result = parseLevel(serializeLevel(level));
    expect(result).toEqual({ ok: true, level });
  });

  it('writes one row per line so the file is easy to read and diff', () => {
    const text = serializeLevel({ version: 1, name: 'Lines', rows: valid.rows });
    expect(text.split('\n').filter((line) => line.includes('"#####"'))).toHaveLength(1);
    expect(text.endsWith('\n')).toBe(true);
  });
});

describe('bundled levels', () => {
  it('ships at least three levels, all valid', () => {
    expect(BUNDLED_LEVELS.length).toBeGreaterThanOrEqual(3);
    for (const { level } of BUNDLED_LEVELS) {
      expect(validateLevel(level).ok).toBe(true);
    }
  });
});
