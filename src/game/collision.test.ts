import { describe, expect, it } from 'vitest';
import { cellsCovered, moveBox, touchesTile } from './collision';

// Solid tiles are given as "col,row" strings.
function solidAt(...cells: string[]) {
  const set = new Set(cells);
  return (col: number, row: number) => set.has(`${col},${row}`);
}

const none = () => false;

describe('moveBox', () => {
  it('moves freely through empty space', () => {
    const result = moveBox({ x: 1, y: 1, w: 0.5, h: 0.5 }, 0.3, 0.2, none);
    expect(result.x).toBeCloseTo(1.3);
    expect(result.y).toBeCloseTo(1.2);
    expect(result.blockedX).toBe(false);
    expect(result.blockedY).toBe(false);
  });

  it('lands on a floor and stops on its top edge', () => {
    // Floor at row 5. The box bottom is at 5.0 and falls by 0.3.
    const result = moveBox({ x: 1, y: 4.5, w: 0.5, h: 0.5 }, 0, 0.3, solidAt('1,5'));
    expect(result.y).toBeCloseTo(4.5);
    expect(result.blockedY).toBe(true);
  });

  it('stops at a wall on its left edge', () => {
    // Wall at column 3. The box right edge is at 3.0 and moves right by 0.4.
    const result = moveBox({ x: 2.5, y: 1, w: 0.5, h: 0.5 }, 0.4, 0, solidAt('3,1'));
    expect(result.x).toBeCloseTo(2.5);
    expect(result.blockedX).toBe(true);
    expect(result.blockedY).toBe(false);
  });

  it('stops under a ceiling', () => {
    // Ceiling at row 0. The box top is at 1.2 and rises by 0.5.
    const result = moveBox({ x: 1, y: 1.2, w: 0.5, h: 0.5 }, 0, -0.5, solidAt('1,0'));
    expect(result.y).toBeCloseTo(1);
    expect(result.blockedY).toBe(true);
  });

  it('stops against a wall when moving left', () => {
    // Wall at column 2. The box left edge is at 3.0 and moves left by 0.6.
    const result = moveBox({ x: 3, y: 1, w: 0.5, h: 0.5 }, -0.6, 0, solidAt('2,1'));
    expect(result.x).toBeCloseTo(3);
    expect(result.blockedX).toBe(true);
  });

  it('does not pass through a thin wall when it moves in small steps', () => {
    let box = { x: 0.2, y: 1, w: 0.5, h: 0.5 };
    const wall = solidAt('5,1');
    for (let i = 0; i < 100; i++) {
      const result = moveBox(box, 0.4, 0, wall);
      box = { ...box, x: result.x };
    }
    expect(box.x + box.w).toBeCloseTo(5);
  });

  it('treats a box that ends exactly on a tile edge as not touching that tile', () => {
    expect(cellsCovered({ x: 2, y: 0, w: 1, h: 1 }, (c) => c === 3)).toEqual([]);
    expect(cellsCovered({ x: 2, y: 0, w: 1, h: 1 }, (c) => c === 2)).toEqual([{ col: 2, row: 0 }]);
  });
});

describe('touchesTile', () => {
  it('detects a hazard the box overlaps', () => {
    expect(touchesTile({ x: 2.8, y: 2.5, w: 0.5, h: 0.5 }, solidAt('3,2'))).toBe(true);
    expect(touchesTile({ x: 2.5, y: 2.5, w: 0.5, h: 0.5 }, solidAt('5,5'))).toBe(false);
  });
});
