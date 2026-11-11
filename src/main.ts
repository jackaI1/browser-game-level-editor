import './style.css';
import { BUNDLED_LEVELS } from './levels';
import { parseLevel, PLAY_STORAGE_KEY, type Level } from './game/level';
import { createGame, stepGame, type GameState } from './game/world';
import { drawGame } from './game/render';
import { Keyboard } from './game/input';
import { startLoop, STEP_SECONDS } from './game/loop';

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const ctx = canvas.getContext('2d')!;
const select = document.querySelector<HTMLSelectElement>('#level')!;
const restartButton = document.querySelector<HTMLButtonElement>('#restart')!;
const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;

const options: { label: string; level: Level }[] = [...BUNDLED_LEVELS];

// A level saved from the editor with "Play this level" opens here with ?custom=1.
if (new URLSearchParams(location.search).get('custom') === '1') {
  const saved = localStorage.getItem(PLAY_STORAGE_KEY);
  if (saved) {
    const result = parseLevel(saved);
    if (result.ok) {
      options.unshift({ label: `From editor: ${result.level.name}`, level: result.level });
    } else {
      statusEl.className = 'status error';
      statusEl.textContent = `The level from the editor could not be loaded: ${result.errors.join(' ')}`;
    }
  }
}

options.forEach((option, index) => {
  const item = document.createElement('option');
  item.value = String(index);
  item.textContent = option.label;
  select.append(item);
});

let state: GameState = createGame(options[0].level);
let lastStatus = '';

function startLevel(index: number): void {
  state = createGame(options[index].level);
  select.value = String(index);
}

select.addEventListener('change', () => startLevel(Number(select.value)));
restartButton.addEventListener('click', () => startLevel(Number(select.value)));

const keyboard = new Keyboard(window);

startLoop(
  () => {
    if (keyboard.consumeRestart()) startLevel(Number(select.value));
    stepGame(state, keyboard.controls(), STEP_SECONDS);
  },
  () => {
    drawGame(ctx, state);
    const message = statusMessage(state);
    if (message !== lastStatus) {
      lastStatus = message;
      statusEl.className = state.status === 'won' ? 'status ok' : 'status';
      statusEl.textContent = message;
    }
  },
);

function statusMessage(game: GameState): string {
  switch (game.status) {
    case 'won':
      return `Level complete in ${game.elapsed.toFixed(1)} seconds. Pick another level or press R to play again.`;
    case 'dead':
      return 'You fell or hit a spike. Press R to try again.';
    default:
      return `Playing: ${options[Number(select.value)].level.name}`;
  }
}
