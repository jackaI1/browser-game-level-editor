import { moveBox, touchesTile, type Box } from './collision';
import type { Level } from './level';
import { TileMap } from './tiles';

export const GRAVITY = 40; // tiles per second squared
export const RUN_SPEED = 6; // tiles per second
export const JUMP_SPEED = 13.5; // tiles per second, upward
export const MAX_FALL_SPEED = 24; // tiles per second
export const PLAYER_WIDTH = 0.7;
export const PLAYER_HEIGHT = 0.9;

export interface Controls {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export type Status = 'playing' | 'won' | 'dead';

export interface GameState {
  level: Level;
  map: TileMap;
  box: Box;
  vx: number;
  vy: number;
  onGround: boolean;
  status: Status;
  elapsed: number;
}

// Starts the player standing on the spawn tile.
export function createGame(level: Level): GameState {
  const map = new TileMap(level.rows);
  const spawn = map.find('P');
  if (!spawn) throw new Error('Level has no spawn tile');
  return {
    level,
    map,
    box: {
      x: spawn.col + (1 - PLAYER_WIDTH) / 2,
      y: spawn.row + 1 - PLAYER_HEIGHT,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
    },
    vx: 0,
    vy: 0,
    onGround: false,
    status: 'playing',
    elapsed: 0,
  };
}

// Advances the game by dt seconds. Call it with the fixed step from loop.ts.
export function stepGame(state: GameState, controls: Controls, dt: number): void {
  if (state.status !== 'playing') return;
  state.elapsed += dt;

  const direction = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
  state.vx = direction * RUN_SPEED;

  if (controls.jump && state.onGround) {
    state.vy = -JUMP_SPEED;
    state.onGround = false;
  }
  state.vy = Math.min(state.vy + GRAVITY * dt, MAX_FALL_SPEED);

  const { map } = state;
  const isSolid = (col: number, row: number) => map.isSolid(col, row);
  const result = moveBox(state.box, state.vx * dt, state.vy * dt, isSolid);
  state.box.x = result.x;
  state.box.y = result.y;

  if (result.blockedY) {
    state.onGround = state.vy > 0;
    state.vy = 0;
  } else {
    state.onGround = false;
  }

  if (touchesTile(state.box, (c, r) => map.isSpike(c, r))) {
    state.status = 'dead';
  } else if (touchesTile(state.box, (c, r) => map.isGoal(c, r))) {
    state.status = 'won';
  } else if (state.box.y >= map.height) {
    state.status = 'dead';
  }
}
