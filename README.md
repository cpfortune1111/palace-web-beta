# Moon Palace · Web beta 0.24.09

Open: https://cpfortune1111.github.io/palace-web-beta/Web-beta/0.24.09/online.html?revision=recovery2

Mobile hides the debug HUD while preserving life bars, touch controls and pause controls. Movelist magnifier center is tap + (0,88) design pixels.

Stage Moon now adds softly blurred fighter ground shadows, the title-menu ocean material and rippled reflection, and procedural white coastal mist. Authored ocean/fog meshes are hidden; fallback bounds allow later GLBs without those meshes. No new battle-time fetches.

Stage list: Training Room; Silver Millennium (Stage Moon); Moon Palace (Swatheshia). Stage labels share the Training Room center and height, with original image proportions retained.

Loading has a single visible owner. Boot loading finishes on logo-free checkpoint recovery. All loaders close before battle unpauses; any visible loader blocks simulation and battle controls. Recovery cancels stale work, resets the encrypted worker, restarts progress from zero through the entry page and refreshes corrupt cached downloads. Invalid legacy checkpoints return safely to home or selection. Audio gesture restrictions preserve loaded data and present Continue instead of triggering resource retries.

Battle sprites are prepared into a small set of padded resident atlas pages, retaining the existing memory budget and logical sprite geometry. The Jupiter/Moon test uses 9 texture pages for 2,934 sprites instead of thousands of separate images. No battle-canvas pixel readback is used for prewarming. Encrypted loading concurrency and cache size are limited on mobile; decoded encrypted buffers are trimmed before battle. Original editable art, code and build inputs remain preserved privately.

Prior selection / ACS / versus preloading, masked Loading percentage, pause Endgame control, mobile popup fitting and disabled Trail Blur / GLB Glow are retained. Public HTML/JS/CSS; automatically decrypted AES-256-GCM media/data; no mandatory offline preparation. All dependencies stay in this folder. Client-side automatic decryption is not DRM.

Install: Safari → Share → Add to Home Screen; Android browser menu → Install app / Add to Home Screen. Internet required. Physical low-end phone performance still requires device verification.
