import { describe, expect, it } from 'vitest';
import { newGrid, paint, resizeGrid, rowsFromGrid, gridFromRows } from './grid';
import { validateLevel } from '../game/level';
import { GOAL, SOLID, SPAWN, SPIKE, EMPTY } from '../game/tiles';

describe('newGrid', () => {
  it('makes a level that passes validation', () => {
    const rows = rowsFromGrid(newGrid(12, 6));
    expect(validateLevel({ name: 'new', rows }).ok).toBe(true);
  });

  it('puts a solid floor on the bottom row', () => {
    const rows = rowsFromGrid(newGrid(8, 5));
    expect(rows[4]).toBe(SOLID.repeat(8));
  });
});

describe('paint', () => {
  it('paints a solid or spike tile', () => {
    const grid = newGrid(6, 4);
    paint(grid, 1, 0, SOLID);
    paint(grid, 2, 0, SPIKE);
    expect(grid[0][1]).toBe(SOLID);
    expect(grid[0][2]).toBe(SPIKE);
  });

  it('moves the spawn instead of making a second one', () => {
    const grid = newGrid(6, 4);
    paint(grid, 4, 0, SPAWN);
    expect(rowsFromGrid(grid).join('').split(SPAWN).length - 1).toBe(1);
    expect(grid[0][4]).toBe(SPAWN);
  });

  it('moves the goal instead of making a second one', () => {
    const grid = newGrid(6, 4);
    paint(grid, 0, 0, GOAL);
    expect(rowsFromGrid(grid).join('').split(GOAL).length - 1).toBe(1);
  });

  it('ignores cells outside the grid', () => {
    const grid = newGrid(6, 4);
    const before = rowsFromGrid(grid);
    paint(grid, -1, 0, SOLID);
    paint(grid, 6, 0, SOLID);
    paint(grid, 0, 4, SOLID);
    expect(rowsFromGrid(grid)).toEqual(before);
  });

  it('erases with the empty tile', () => {
    const grid = gridFromRows(['##', '##']);
    paint(grid, 0, 0, EMPTY);
    expect(grid[0][0]).toBe(EMPTY);
  });
});

describe('resizeGrid', () => {
  it('keeps the cells that still fit and fills the rest with empty tiles', () => {
    const grid = gridFromRows(['abc', 'def']);
    expect(rowsFromGrid(resizeGrid(grid, 2, 3))).toEqual(['ab', 'de', '..']);
    expect(rowsFromGrid(resizeGrid(grid, 4, 2))).toEqual(['abc.', 'def.']);
  });
});
