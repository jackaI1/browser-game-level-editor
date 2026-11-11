import '../style.css';
import { parseLevel, PLAY_STORAGE_KEY, serializeLevel, validateLevel, type Level } from '../game/level';
import { EMPTY, SOLID, SPIKE, SPAWN, GOAL } from '../game/tiles';
import { COLORS } from '../game/render';
import {
  MAX_SIZE,
  MIN_SIZE,
  gridFromRows,
  newGrid,
  paint,
  resizeGrid,
  rowsFromGrid,
  type Grid,
  type Tool,
} from './grid';

const CELL_PX = 24;
const canvas = document.querySelector<HTMLCanvasElement>('#editor')!;
const ctx = canvas.getContext('2d')!;
const nameInput = document.querySelector<HTMLInputElement>('#level-name')!;
const widthInput = document.querySelector<HTMLInputElement>('#width')!;
const heightInput = document.querySelector<HTMLInputElement>('#height')!;
const messages = document.querySelector<HTMLParagraphElement>('#messages')!;
const fileInput = document.querySelector<HTMLInputElement>('#file')!;
const saveButton = document.querySelector<HTMLButtonElement>('#save')!;
const playButton = document.querySelector<HTMLButtonElement>('#play')!;
const toolButtons = [...document.querySelectorAll<HTMLButtonElement>('.tool')];

const TILE_COLORS: Record<string, string> = {
  [EMPTY]: COLORS.empty,
  [SOLID]: COLORS.solid,
  [SPIKE]: COLORS.spike,
  [SPAWN]: COLORS.spawn,
  [GOAL]: COLORS.goal,
};

let grid: Grid = newGrid(30, 15);
let tool: Tool = SOLID;
let painting = false;

function currentLevel(): unknown {
  return { version: 1, name: nameInput.value, rows: rowsFromGrid(grid) };
}

function draw(): void {
  const height = grid.length;
  const width = grid[0].length;
  canvas.width = width * CELL_PX;
  canvas.height = height * CELL_PX;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      ctx.fillStyle = TILE_COLORS[grid[row][col]] ?? COLORS.empty;
      ctx.fillRect(col * CELL_PX, row * CELL_PX, CELL_PX, CELL_PX);
    }
  }
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  for (let i = 0; i <= width; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_PX + 0.5, 0);
    ctx.lineTo(i * CELL_PX + 0.5, height * CELL_PX);
    ctx.stroke();
  }
  for (let j = 0; j <= height; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * CELL_PX + 0.5);
    ctx.lineTo(width * CELL_PX, j * CELL_PX + 0.5);
    ctx.stroke();
  }
  showValidation();
}

// Shows whether the level can be saved and played, and why not if it can't.
function showValidation(): void {
  const result = validateLevel(currentLevel());
  saveButton.disabled = !result.ok;
  playButton.disabled = !result.ok;
  if (result.ok) {
    messages.className = 'status ok';
    messages.textContent = `Valid level: ${result.level.rows[0].length} x ${result.level.rows.length} tiles.`;
  } else {
    messages.className = 'status error';
    messages.textContent = result.errors.join(' ');
  }
}

function cellAt(event: PointerEvent): { col: number; row: number } {
  const rect = canvas.getBoundingClientRect();
  const width = grid[0].length;
  const height = grid.length;
  return {
    col: Math.floor(((event.clientX - rect.left) / rect.width) * width),
    row: Math.floor(((event.clientY - rect.top) / rect.height) * height),
  };
}

canvas.addEventListener('pointerdown', (event) => {
  painting = true;
  canvas.setPointerCapture(event.pointerId);
  const { col, row } = cellAt(event);
  paint(grid, col, row, tool);
  draw();
});
canvas.addEventListener('pointermove', (event) => {
  if (!painting) return;
  const { col, row } = cellAt(event);
  paint(grid, col, row, tool);
  draw();
});
const stopPainting = () => {
  painting = false;
};
canvas.addEventListener('pointerup', stopPainting);
canvas.addEventListener('pointercancel', stopPainting);

for (const button of toolButtons) {
  button.addEventListener('click', () => {
    tool = button.dataset.tool as Tool;
    toolButtons.forEach((b) => b.classList.toggle('active', b === button));
  });
}

function readSize(): { width: number; height: number } {
  const width = clampInt(widthInput.valueAsNumber, MIN_SIZE.width, MAX_SIZE.width);
  const height = clampInt(heightInput.valueAsNumber, MIN_SIZE.height, MAX_SIZE.height);
  widthInput.value = String(width);
  heightInput.value = String(height);
  return { width, height };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

document.querySelector('#new-level')!.addEventListener('click', () => {
  const { width, height } = readSize();
  grid = newGrid(width, height);
  draw();
});

widthInput.addEventListener('change', () => {
  const { width, height } = readSize();
  grid = resizeGrid(grid, width, height);
  draw();
});
heightInput.addEventListener('change', () => {
  const { width, height } = readSize();
  grid = resizeGrid(grid, width, height);
  draw();
});
nameInput.addEventListener('input', showValidation);

saveButton.addEventListener('click', () => {
  const result = validateLevel(currentLevel());
  if (!result.ok) return showValidation();
  const blob = new Blob([serializeLevel(result.level)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileSlug(result.level.name)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});

document.querySelector('#open')!.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file) return;
  const result = parseLevel(await file.text());
  if (!result.ok) {
    messages.className = 'status error';
    messages.textContent = `Could not load ${file.name}: ${result.errors.join(' ')}`;
    return;
  }
  loadLevel(result.level);
});

playButton.addEventListener('click', () => {
  const result = validateLevel(currentLevel());
  if (!result.ok) return showValidation();
  localStorage.setItem(PLAY_STORAGE_KEY, serializeLevel(result.level));
  window.open('./?custom=1', '_blank');
});

function loadLevel(level: Level): void {
  grid = gridFromRows(level.rows);
  nameInput.value = level.name;
  widthInput.value = String(level.rows[0].length);
  heightInput.value = String(level.rows.length);
  draw();
}

function fileSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'level';
}

widthInput.value = '30';
heightInput.value = '15';
draw();
