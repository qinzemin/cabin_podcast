# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a **zero-dependency static front-end prototype** — an AI news assistant for a car infotainment system (1260×600 resolution). There is no build step, no package manager, no backend, and no test framework.

### Running the app

Serve the project root with any static HTTP server, then open in a browser:

```bash
python3 -m http.server 8080 --directory /workspace
# Then visit http://localhost:8080/index.html
```

### Linting / Testing / Building

- **No lint, test, or build tooling is configured.** The project is pure HTML/CSS/vanilla JS with no `package.json`.
- To validate HTML/CSS/JS correctness, open the browser DevTools console and check for errors.

### Key files

| File | Purpose |
|---|---|
| `index.html` | Single-page entry (all views/modals inline) |
| `styles/reset.css` | CSS reset |
| `styles/main.css` | All UI styles (~800 lines) |
| `scripts/app.js` | All interaction logic, routing, mock data |

### Notes for future agents

- The viewport is fixed at 1260×600. Use Chrome DevTools device toolbar or set browser window size accordingly.
- All data is hardcoded in `scripts/app.js` — there are no API calls or external dependencies.
- The update script is intentionally a no-op (`echo ok`) because there are no dependencies to install.
