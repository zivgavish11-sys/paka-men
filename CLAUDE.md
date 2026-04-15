# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

- **Remote:** `https://github.com/zivgavish11-sys/paka-men.git`
- **Branch:** `maim` (GitHub renamed it to `main` on the remote — both point to the same branch)
- **Workflow:** managed via **GitHub Desktop** — use it to commit and push changes
- To push via CLI: `git add <files> && git commit -m "message" && git push origin maim`

## Running

No server or build process. Open `index.html` directly in any modern browser (double-click or drag into browser).

## Project Structure

Pure Pac-Man: HTML5 Canvas + CSS + Vanilla JavaScript, no external dependencies.

| File | Role |
|------|------|
| `index.html` | DOM skeleton, canvas, four div screens (select / add-player / game / gameover) |
| `style.css` | Retro/arcade styling — Rubik for Hebrew text, Press Start 2P for English titles only |
| `game.js` | All game logic — maze, movement, ghost AI, scoring |
| `*.jpeg` | Character photos: `רגל שלישית.jpeg`, `גשם שוטף.jpeg`, `קוטל הצעירים.jpeg` |

## game.js Architecture

**State machine:** `SELECT → READY → PLAYING → DEAD → WIN / GAMEOVER`

**Game loop:** `requestAnimationFrame` with dt-based movement. `update(dt)` → `render(dt)`. `dt` is capped at 50ms to handle tab-switch lag.

**Maze:** `MAZE_DATA[31][28]` constant array with tile types `EMPTY=0 WALL=1 DOT=2 PELLET=3 DOOR=4 HOUSE=5`. The live `maze[][]` is copied from it on every `initGame()`.

**Player object:** `{x, y, col, row, dir, nextDir, speed, color, charKey}`

**Character speeds:**
- רגל שלישית: 190 px/s
- גשם שוטף: 200 px/s
- קוטל הצעירים: 75 px/s (very slow)

**Ghost objects (array `ghosts`):** Each ghost has `{scared, scaredTimer, flashing, eaten, inHouse, exitDelay, pathTimer}`. BFS pathfinding recalculated every 200ms.

**Ghost personalities:** Blinky=direct chase, Pinky=4-tile ambush, Inky=flanking, Clyde=chase if dist>8 else corner.

## Player Movement — Tile-Targeting (IMPORTANT)

The player uses the **same tile-targeting approach as ghosts**, NOT a raw pixel approach. This avoids the snapback bug where `atCenter = distX <= spd+1` would trap the player at their starting tile.

**How it works:**
1. Player starts stopped (`dir={0,0}`) — waits for first input.
2. On direction input: `nextDir` is set. `movePlayer` checks if `canMoveTo(col+nd.x, row+nd.y)` — if open, sets `dir` and starts moving toward `(col+dir.x, row+dir.y)` tile center.
3. Each frame: player moves toward target tile center using `Math.hypot(dx,dy)` distance. When `dist <= spd`, snaps to tile center, tries to apply `nextDir` (turn), then checks if continuing direction is open.
4. Wall ahead → stop at current tile center, `dir={0,0}`.
5. Tunnel: row 14 wraps left↔right.

**DO NOT revert to `atCenter = distX <= spd + 1` — this breaks movement** (player oscillates in place every frame).

## Keyboard Input

- `keysHeld` Set tracks which arrow keys are currently held.
- `keydown`: adds to `keysHeld`, sets `player.nextDir`.
- `keyup`: removes from `keysHeld`. If no direction key remains held → snap player to current tile center, `dir={0,0}`, `nextDir={0,0}` (stop immediately).
- D-pad (mobile): `pointerdown` only → calls `setDir()` which sets `nextDir`. No keyup equivalent — player keeps moving until wall.
- Swipe on canvas: touchstart/touchend → `setDir()`.

## Screens (index.html)

| Screen | id | Description |
|--------|----|-------------|
| Character select | `screen-select` | PAKA-MEN title, "הוספת שחקן" button above cards, 3 char cards |
| Add player | `screen-add-player` | "ימניאק רק גביש מוסיף דמויות" + back button |
| Game | `screen-game` | HUD + canvas + D-pad (mobile only) |
| Game over | `screen-gameover` | Win/lose + final score |

## Styling (style.css)

- `body { height: 100vh; overflow: hidden; }` — no page scroll
- `.screen { height: 100vh; overflow-y: auto; direction: rtl; }` — each screen fills viewport
- D-pad hidden on desktop: `@media (hover: hover) and (pointer: fine) { #dpad { display: none; } }`
- `fitCanvas()` in JS sets canvas CSS width/height dynamically: `availH = window.innerHeight - hudH - dpadH`, maintains 560:620 aspect ratio.

## Character Photos

Real face photos. Shown in selection cards and HUD. On canvas, drawn inside a pac-man arc clip path (`ctx.save / arc / clip / drawImage / restore`) with a colored stroke border.

## Hebrew UI

All interface text in Hebrew. `direction: rtl` on body and `.screen`. Canvas draws text directly with `ctx.fillText` — Hebrew strings should NOT include `!` prefix (RTL renders it on the wrong side); write `'מוכן'` not `'!מוכן'`.
