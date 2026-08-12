# YouTube Layout Customizer

YouTube Layout Customizer is a Chrome extension that lets you control how YouTube pages are laid out. You can adjust how many videos and shorts appear per row, tune the sidebar width, and define adaptive breakpoints so the layout responds to window size. Your preferences are stored locally and automatically applied whenever you visit YouTube. 

## Features

- **Manual layout controls** for YouTube browse pages: set how many standard videos and shorts appear per row. 
- **Adaptive layout mode** with JSON-defined breakpoints that automatically adjust the layout at different window widths. 
- **Sidebar width control** on watch pages, so you can make the sidebar narrower or wider. 
- **Enable/disable toggle** to quickly turn layout customization on or off without losing your saved settings. 
- **Instant apply & reset:** apply changes from a toolbar-triggered overlay dialog, or reset settings to return to YouTube’s default layout. 

## How it works

The extension is built on **Chrome Manifest V3**: 

- A background service worker (`background.js`) listens for clicks on the extension’s toolbar icon. If the current tab is a YouTube page, it ensures content scripts are loaded and sends a message to open the settings dialog. 
- Content scripts (`dist/content/*.js`) run on `https://*.youtube.com/*` and expose a `YTLayoutCustomizer` namespace that: 
  - Loads and saves the layout configuration via `chrome.storage.local`.
  - Renders the overlay dialog (`yt-customizer-dialog`) with inputs for layout options.
  - Applies layout changes to YouTube’s DOM based on the active configuration.

All layout preferences are stored locally in Chrome’s extension storage; no data is sent to external services. 

---

## Installation (development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/markoka101/youtube-resizer.git
   cd youtube-resizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the TypeScript sources**

   ```bash
   npm run build
   ```

   This runs `tsc` and writes the compiled JavaScript into the `dist/` directory, which is what the extension uses at runtime. 

4. **Load the unpacked extension in Chrome**

   - Open `chrome://extensions` in Chrome.
   - Enable **Developer mode**.
   - Click **Load unpacked**.
   - Select the project folder (the directory containing `manifest.json`). 

After loading, pin the extension’s icon in the toolbar for quick access.

---

## Usage

1. Open a **YouTube** tab (`youtube.com`).
2. Click the **YouTube Layout Customizer** icon in the Chrome toolbar. 
3. The settings dialog will appear, allowing you to: 
   - Enable or disable layout customization.
   - Toggle adaptive mode.
   - Edit adaptive breakpoint JSON.
   - Set manual videos-per-row and shorts-per-row values.
   - Adjust sidebar width on watch pages.
4. Click **Apply Changes** to save and apply the new layout immediately. 
5. Use **Reset** to clear stored settings and reload the page with YouTube’s default layout. 

---

## Permissions

This extension requests a small set of permissions, all of which are directly tied to its functionality: 

- `storage` – to store layout preferences (videos per row, shorts per row, sidebar width, and adaptive breakpoints) locally via `chrome.storage.local`. 
- `scripting` – to inject the content scripts into YouTube tabs when needed, especially if the content script isn’t yet ready when the toolbar icon is clicked. 
- Host access to `https://*.youtube.com/*` – so content scripts can modify the layout of YouTube pages only. The extension does not run on other sites. 

No personal data or browsing history is collected or sent off the device.

---

## Development

- **TypeScript configuration:** see `tsconfig.json` for compile targets and output settings. 
- **Build scripts:** 
  - `npm run build` – compile TypeScript to JavaScript in `dist/`.
  - `npm run watch` – compile on file changes.
  - `npm run format` / `npm run format:check` – run Prettier on source files.

Source files live in the `src/` directory, and compiled files used by the extension live under `dist/content/`. 

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details. 
