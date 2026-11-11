import type { Cell } from './tiles';

// A box in tile units. x and y are the top-left corner.
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MoveResult {
  x: number;
  y: number;
  blockedX: boolean;
  blockedY: boolean;
}

export type TileTest = (col: number, row: number) => boolean;

// Every tile the box covers, even partly. A box that ends exactly on a tile edge does not cover the next tile.
export function cellsCovered(box: Box, test: TileTest): Cell[] {
  const cells: Cell[] = [];
  const col0 = Math.floor(box.x);
  const col1 = Math.ceil(box.x + box.w) - 1;
  const row0 = Math.floor(box.y);
  const row1 = Math.ceil(box.y + box.h) - 1;
  for (let row = row0; row <= row1; row++) {
    for (let col = col0; col <= col1; col++) {
      if (test(col, row)) cells.push({ col, row });
    }
  }
  return cells;
}

export function touchesTile(box: Box, test: TileTest): boolean {
  return cellsCovered(box, test).length > 0;
}

// Moves the box along x, then along y. Solid tiles stop it at the tile edge.
// Callers must keep one move under one tile per call, or the box can pass through thin walls.
export function moveBox(box: Box, dx: number, dy: number, isSolid: TileTest): MoveResult {
  let x = box.x + dx;
  let y = box.y;
  let blockedX = false;
  let blockedY = false;

  if (dx !== 0) {
    const hits = cellsCovered({ x, y, w: box.w, h: box.h }, isSolid);
    if (hits.length > 0) {
      blockedX = true;
      x = dx > 0
        ? Math.min(...hits.map((c) => c.col - box.w))
        : Math.max(...hits.map((c) => c.col + 1));
    }
  }

  y += dy;
  if (dy !== 0) {
    const hits = cellsCovered({ x, y, w: box.w, h: box.h }, isSolid);
    if (hits.length > 0) {
      blockedY = true;
      y = dy > 0
        ? Math.min(...hits.map((c) => c.row - box.h))
        : Math.max(...hits.map((c) => c.row + 1));
    }
  }

  return { x, y, blockedX, blockedY };
}
