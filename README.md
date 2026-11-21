# Moon Palace · Web beta 0.24.09

Open: https://cpfortune1111.github.io/palace-web-beta/Web-beta/0.24.09/online.html?revision=effects2

Online browser trial. Public HTML/JS/CSS; automatically decrypted AES-256-GCM media/data. No mandatory offline download or storage permission. All runtime dependencies remain in this folder.

Mobile Movelist / Settings popups use the desktop 1280x720 coordinate system fitted to the visible browser area, including orientation / browser-toolbar changes.

Selection: Trail Blur disabled, GLB Glow meshes hidden, diagnostic HUD removed; remaining approved effects enabled.

Battle Loading downloads all required fighter sprites / sounds first. Atlas decoding and immutable sprite preparation proceed page by page; completed source image decodes are released. Battle sprites and sound buffers are resident before combat. HUD character emblems reuse prepared sprites. Hidden selection GPU allocations are released. Mobile battle HUD layers use the battle pixel density; clipping and debug text avoid redundant per-frame DOM writes. CNS queries calculate only the requested value, preserving original formulas.

Tests include original CNS query parity, five fighter preparation / repeat match, popup geometry, repeated sprites / SFX and live AI with zero in-combat downloads or decoding. Encrypted / clear-asset comparisons retain the same runtime; decrypt counters remain unchanged during battle. Physical Samsung performance still requires device verification.

Mobile resident display copies use a memory budget and may be resampled; editable originals remain preserved separately. Automatic client-side decryption is not DRM or guaranteed extraction prevention.

Install: Safari → Share → Add to Home Screen; Android browser menu → Install app / Add to Home Screen. Internet required.
