# Archie Moore’s Wing Slots

A standalone, responsive restaurant reward demo matching the approved Archie Moore’s slot-machine concept.

## Play

Pull the lever down and release, tap the lever, or focus it and press Enter. The three reels stop at 4.2, 4.6, and 5 seconds. Win lights flash before a branded reward coupon opens.

- Three matching symbols: **15% off**
- Two matching symbols: **10% off**
- No match: **5% off**

The four symbols are buffalo wings, beer, celery, and the signature sauce bottle. Idle lights, lever movement, cabinet reflections, optional sound, replay, keyboard support, and reduced-motion handling are included.

This is a visual, browser-only demo. Coupons are clearly marked as demo coupons and are not valid for redemption. There are no forms, accounts, databases, or external service integrations in the application.

## Run locally

No installation or build step is required. From the repository directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in a current browser.

## Host

Serve the repository root with any static website host. Use no framework or build command. The entry point is `index.html`; keep `assets/machine.webp`, `app.js`, and `style.css` beside it in their existing paths.

## Files

- `index.html`: game layout, mechanical lever, and coupon dialog.
- `style.css`: responsive styling, idle effects, and win animations.
- `app.js`: random results, five-second reel animation, interaction, and sound.
- `assets/machine.webp`: approved machine artwork and source for the reel symbols.

Google Fonts is used for optional typography; local font fallbacks are included. The game itself needs no API keys or backend.
