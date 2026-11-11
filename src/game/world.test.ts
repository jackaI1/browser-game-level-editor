import { describe, expect, it } from 'vitest';
import { parseLevel, type Level } from './level';
import { createGame, stepGame, type Controls, type GameState } from './world';
import { STEP_SECONDS } from './loop';
import { BUNDLED_LEVELS } from '../levels';
import { TileMap } from './tiles';

const IDLE: Controls = { left: false, right: false, jump: false };

function levelFrom(rows: string[]): Level {
  const result = parseLevel(JSON.stringify({ name: 'test', rows }));
  if (!result.ok) throw new Error(result.errors.join(' '));
  return result.level;
}

function run(state: GameState, seconds: number, controls: Controls | ((s: GameState) => Controls)) {
  const steps = Math.round(seconds / STEP_SECONDS);
  for (let i = 0; i < steps && state.status === 'playing'; i++) {
    stepGame(state, typeof controls === 'function' ? controls(state) : controls, STEP_SECONDS);
  }
  return state;
}

const flatLevel = levelFrom(['..........', '.P.....G..', '##########']);

describe('createGame', () => {
  it('stands the player on the spawn tile', () => {
    const state = createGame(flatLevel);
    run(state, 0.5, IDLE);
    expect(state.onGround).toBe(true);
    expect(state.box.y + state.box.h).toBeCloseTo(2);
    expect(state.status).toBe('playing');
  });

  it('throws when a level has no spawn', () => {
    expect(() => createGame({ version: 1, name: 'x', rows: ['...', '#..'] })).toThrow('no spawn');
  });
});

describe('stepGame', () => {
  it('runs right when the right key is held', () => {
    const state = createGame(flatLevel);
    const startX = state.box.x;
    run(state, 0.5, { left: false, right: true, jump: false });
    expect(state.box.x).toBeGreaterThan(startX + 2);
  });

  it('jumps off the ground and lands again', () => {
    const state = createGame(flatLevel);
    run(state, 0.2, IDLE);
    stepGame(state, { ...IDLE, jump: true }, STEP_SECONDS);
    expect(state.onGround).toBe(false);
    expect(state.box.y).toBeLessThan(1.1);
    run(state, 1, IDLE);
    expect(state.onGround).toBe(true);
  });

  it('wins when the player touches the goal', () => {
    const state = createGame(flatLevel);
    run(state, 5, { left: false, right: true, jump: false });
    expect(state.status).toBe('won');
  });

  it('dies when the player touches a spike', () => {
    const state = createGame(levelFrom(['..........', '.P.^...G..', '##########']));
    run(state, 5, { left: false, right: true, jump: false });
    expect(state.status).toBe('dead');
  });

  it('dies when the player falls out of the bottom of the level', () => {
    const state = createGame(levelFrom(['P......G', '........', '........']));
    run(state, 5, IDLE);
    expect(state.status).toBe('dead');
  });

  it('stops moving once the game is over', () => {
    const state = createGame(levelFrom(['P......G', '........', '........']));
    run(state, 5, IDLE);
    const { y } = state.box;
    stepGame(state, IDLE, STEP_SECONDS);
    expect(state.box.y).toBe(y);
  });
});

// A simple automatic player: keeps running right, jumps before walls, spikes and gaps.
function botWantsJump(state: GameState): boolean {
  if (!state.onGround) return false;
  const { box, map } = state;
  const footRow = Math.round(box.y + box.h);
  const aheadCol = Math.floor(box.x + box.w + 1.2);
  const standingRow = footRow - 1;
  return (
    map.isSolid(aheadCol, standingRow) ||
    map.isSpike(aheadCol, standingRow) ||
    !map.isSolid(aheadCol, footRow)
  );
}

describe('bundled levels', () => {
  it.each(BUNDLED_LEVELS.map((b) => [b.label, b.level] as const))(
    '%s can be finished by a simple automatic player',
    (_label, level) => {
      const state = createGame(level);
      run(state, 60, (s) => ({ left: false, right: true, jump: botWantsJump(s) }));
      expect(state.status).toBe('won');
    },
  );
});

describe('TileMap edges', () => {
  it('treats the sides and top as walls and the bottom as open', () => {
    const map = new TileMap(['...', '...']);
    expect(map.isSolid(-1, 0)).toBe(true);
    expect(map.isSolid(3, 0)).toBe(true);
    expect(map.isSolid(0, -1)).toBe(true);
    expect(map.isSolid(0, 2)).toBe(false);
  });
});
