import { SOLID, SPIKE, GOAL, type TileMap } from './tiles';
import type { GameState } from './world';

export const CELL_PX = 40;
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

export const COLORS = {
  background: '#16202a',
  empty: '#1d2a36',
  solid: '#5b6b7a',
  spike: '#e0533d',
  goal: '#f2c94c',
  player: '#f4f7fa',
  spawn: '#58c4dd',
};

// Draws the level and the player. The camera follows the player and stays inside the level.
export function drawGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { map, box } = state;
  const viewCols = VIEW_WIDTH / CELL_PX;
  const viewRows = VIEW_HEIGHT / CELL_PX;
  const camX = clamp(box.x + box.w / 2 - viewCols / 2, 0, Math.max(0, map.width - viewCols));
  const camY = clamp(box.y + box.h / 2 - viewRows / 2, 0, Math.max(0, map.height - viewRows));

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  ctx.save();
  ctx.setTransform(CELL_PX, 0, 0, CELL_PX, -camX * CELL_PX, -camY * CELL_PX);
  drawTiles(ctx, map, camX, camY, viewCols, viewRows);
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.restore();
}

function drawTiles(
  ctx: CanvasRenderingContext2D,
  map: TileMap,
  camX: number,
  camY: number,
  viewCols: number,
  viewRows: number,
): void {
  const col0 = Math.max(0, Math.floor(camX));
  const col1 = Math.min(map.width - 1, Math.ceil(camX + viewCols));
  const row0 = Math.max(0, Math.floor(camY));
  const row1 = Math.min(map.height - 1, Math.ceil(camY + viewRows));

  for (let row = row0; row <= row1; row++) {
    for (let col = col0; col <= col1; col++) {
      const ch = map.charAt(col, row);
      if (ch === SOLID) {
        ctx.fillStyle = COLORS.solid;
        ctx.fillRect(col, row, 1, 1);
      } else if (ch === SPIKE) {
        ctx.fillStyle = COLORS.spike;
        ctx.beginPath();
        ctx.moveTo(col, row + 1);
        ctx.lineTo(col + 0.5, row + 0.1);
        ctx.lineTo(col + 1, row + 1);
        ctx.closePath();
        ctx.fill();
      } else if (ch === GOAL) {
        ctx.fillStyle = COLORS.goal;
        ctx.fillRect(col + 0.45, row, 0.1, 1);
        ctx.fillRect(col + 0.55, row + 0.05, 0.4, 0.3);
      }
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
