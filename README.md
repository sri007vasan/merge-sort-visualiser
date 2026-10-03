# Merge Sort Visualiser

A pure static web app that visualises the Merge Sort algorithm step‑by‑step.  
It pre‑computes all sorting steps, supports pause/resume/step, custom arrays, and keyboard shortcuts.  
Built with vanilla JS, CSS and HTML – no build step or external libraries.

## Features

- Random array generation (size 5‑50)
- Custom comma‑separated array input with validation
- Speed control (1 = slow, 10 = fast)
- Pause / Resume / Step / Reset controls
- Keyboard shortcuts: Space (Start/Pause), Right arrow (Step), R (Reset)
- Live stats: comparisons, writes, status
- Step log (last 15 actions)
- Dark theme, responsive design down to 360 px
- Accessible controls and visible focus states

## Run locally

```bash
npx http-server .
```

Open `http://localhost:8080` (or the port shown in the terminal).

## Run tests

```bash
npm install
npx playwright install chromium
npm test
```

The tests are written with Playwright ESM and cover core behaviour and console‑error free loading.

---  
Enjoy exploring Merge Sort!
