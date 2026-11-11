import { EMPTY, GOAL, SOLID, SPAWN, SPIKE } from '../game/tiles';

export type Tool = typeof SOLID | typeof SPIKE | typeof EMPTY | typeof SPAWN | typeof GOAL;
export const TOOLS: readonly Tool[] = [SOLID, SPIKE, EMPTY, SPAWN, GOAL];

// grid[row][col] holds one tile character.
export type Grid = string[][];

export const MIN_SIZE = { width: 4, height: 3 };
export const MAX_SIZE = { width: 120, height: 40 };

export function gridFromRows(rows: readonly string[]): Grid {
  return rows.map((row) => row.split(''));
}

export function rowsFromGrid(grid: Grid): string[] {
  return grid.map((row) => row.join(''));
}

// A new level: a solid floor on the bottom row, a spawn near the left and a goal near the right.
export function newGrid(width: number, height: number): Grid {
  const grid: Grid = Array.from({ length: height }, () => Array<string>(width).fill(EMPTY));
  grid[height - 1].fill(SOLID);
  grid[height - 2][Math.min(2, width - 1)] = SPAWN;
  grid[height - 2][Math.max(0, width - 3)] = GOAL;
  return grid;
}

// Keeps the cells that still fit when the level gets smaller, and fills new cells with empty tiles.
export function resizeGrid(grid: Grid, width: number, height: number): Grid {
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => grid[row]?.[col] ?? EMPTY),
  );
}

// Paints one cell. Spawn and goal exist only once per level, so painting one moves it.
export function paint(grid: Grid, col: number, row: number, tool: Tool): void {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return;
  if (tool === SPAWN || tool === GOAL) {
    for (const line of grid) {
      for (let x = 0; x < line.length; x++) {
        if (line[x] === tool) line[x] = EMPTY;
      }
    }
  }
  grid[row][col] = tool;
}
