# Level file format

A level is a JSON file with three fields:

```json
{
  "version": 1,
  "name": "First steps",
  "rows": [
    "........................",
    "..................G.....",
    "...P............#####...",
    "########..##############"
  ]
}
```

- `version` is the format version. It must be `1` (it can be left out).
- `name` is a short title, 1 to 40 characters.
- `rows` is a list of strings from top to bottom. Every row must have the same length. The longest level is 120 columns by 40 rows.

## Tile characters

| Character | Meaning |
| --- | --- |
| `.` | Empty space |
| `#` | Solid block. The player stands on it and cannot walk through it |
| `^` | Spike. Touching it ends the run |
| `P` | Spawn point. Exactly one per level |
| `G` | Goal (the flag). Exactly one per level |

The edges of the level are walls on the left, right and top. The bottom edge is open, so falling below the level ends the run.

## Validation

The game and the editor both run `validateLevel` in `src/game/level.ts` before a level is used. It reports up to 10 problems, each with its row and column where that helps, for example:

- `Row 1 has 4 columns but row 0 has 5.`
- `Row 1, column 4 has an unknown character "?".`
- `A level needs exactly one spawn "P", found 0.`
