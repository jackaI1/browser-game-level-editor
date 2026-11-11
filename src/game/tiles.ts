// Level files are lists of rows. Each character in a row is one tile.
export const EMPTY = '.';
export const SOLID = '#';
export const SPIKE = '^';
export const SPAWN = 'P';
export const GOAL = 'G';

export const TILE_CHARS: readonly string[] = [EMPTY, SOLID, SPIKE, SPAWN, GOAL];

export interface Cell {
  col: number;
  row: number;
}

// A grid of tiles with simple edge rules:
// the left, right and top edges are walls, the bottom edge is open (falling out is a death).
export class TileMap {
  readonly width: number;
  readonly height: number;

  constructor(readonly rows: readonly string[]) {
    this.height = rows.length;
    this.width = rows.length > 0 ? rows[0].length : 0;
  }

  charAt(col: number, row: number): string {
    if (col < 0 || row < 0 || col >= this.width || row >= this.height) return EMPTY;
    return this.rows[row][col];
  }

  isSolid(col: number, row: number): boolean {
    if (col < 0 || col >= this.width || row < 0) return true;
    if (row >= this.height) return false;
    return this.rows[row][col] === SOLID;
  }

  isSpike(col: number, row: number): boolean {
    return this.charAt(col, row) === SPIKE;
  }

  isGoal(col: number, row: number): boolean {
    return this.charAt(col, row) === GOAL;
  }

  find(char: string): Cell | undefined {
    for (let row = 0; row < this.height; row++) {
      const col = this.rows[row].indexOf(char);
      if (col !== -1) return { col, row };
    }
    return undefined;
  }
}
