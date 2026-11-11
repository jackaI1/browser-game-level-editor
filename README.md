# browser-game-level-editor

I built a small platformer that runs in the browser, with a level editor for making its levels, because I wanted to design levels for a game myself without editing the game's code every time. You can [play it here](https://jackai1.github.io/browser-game-level-editor/).

The game is the kind where you run and jump across blocks to reach a flag. You avoid spikes, and if you fall off the bottom of the screen you start again. The level editor is a page where you paint a level one tile at a time, save it as a JSON file (a plain text file that stores data in a fixed layout), and load it again later.

## How to play

- Move left and right with the arrow keys or **A** and **D**.
- Jump with **Space**, **W** or the up arrow. Holding jump keeps you hopping.
- Press **R** to restart the level.
- Reach the flag to finish. The page shows how many seconds it took.

There are three levels. Pick one from the menu at the top of the page.

## How to make a level

1. Open the [level editor](https://jackai1.github.io/browser-game-level-editor/editor.html).
2. Pick a size with **Columns** and **Rows**, then click **New level**. You start with a floor and a spawn point and a flag.
3. Choose a tool (**Solid**, **Spike**, **Spawn**, **Goal** or **Erase**) and click or drag on the grid to paint.
4. The message under the buttons says whether the level is valid. A level needs exactly one spawn and one flag.
5. Click **Save as JSON** to download the file. Click **Load JSON** to open a file you saved before.
6. Click **Play this level** to try it in the game. It opens in a new tab.

The file format is described in [docs/level-format.md](docs/level-format.md).

## Running it on your computer

You need [Node.js](https://nodejs.org/) 22 or newer.

```bash
npm install
npm run dev      # starts the game at a local address shown in the terminal
npm test         # runs the unit tests
npm run build    # writes the static site to dist/
```

## How it works

The game keeps a fixed clock. Its update step runs 60 times every second, no matter how fast the screen redraws, so jumps and falls feel the same on any computer. Each step moves the player a little, then checks every block the player's box touches and pushes the box out of it. That is the collision part, and it is what stops the player from walking through walls and floors.

Levels are plain text, so the editor, the game and the tests all read the same format. Before a level is used, a validation step checks it and gives a clear message if something is wrong, such as a row with the wrong length.

## What is in the repository

- `src/game/`: the game. `loop.ts` is the fixed clock, `collision.ts` handles blocks, `world.ts` holds the player's movement and the win and death rules, `level.ts` validates level files, `render.ts` draws the screen.
- `src/editor/`: the editor. `grid.ts` has the painting and resizing rules, `main.ts` connects them to the page.
- `src/levels/`: the three levels that ship with the game.
- `src/main.ts` and `src/editor/main.ts`: the code for the two pages. `index.html` and `editor.html` are their layouts.
- `docs/level-format.md`: the level file format.
- `.github/workflows/ci.yml`: runs the type check, the tests and the build on every push and pull request. Pushes to `main` also publish the site to GitHub Pages.

## Tests and checks

The tests cover:

- **Collision**: landing on a floor, hitting a wall or ceiling, a box that is moving too fast to pass through a thin wall, and boxes that touch a tile edge.
- **Level validation**: missing spawn or goal, two goals, rows of different lengths, unknown characters, bad JSON, and the bundled levels.
- **Game rules**: running, jumping, winning, dying on a spike, and falling out of the level.
- **Bundled levels**: a simple automatic player has to finish all three levels.
- **Fixed clock**: the same number of steps for slow and fast screens, and a cap on very long pauses.
- **Editor grid**: painting, moving the spawn and goal, and resizing.

Current result: 50 tests in 5 files, all passing.

## Limits

There are no enemies, sound or moving platforms yet. The editor has no undo, so use **Load JSON** to get back to a saved version.

Project by Jack Lai
