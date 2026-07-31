# Emergency Contact (SupportNow campaign prototype)

A SupportNow campaign prototype: help moms get the info that lives in their head (pediatrician, allergies, meds, pickup rules) onto one fridge sheet with a QR code per kid, backed by a living digital page. Gateway strategy: kids first, then partner, then aging parents.

Heads up: `../emergency-contact/` is a SEPARATE, parallel build of this same campaign (a vinext/React scaffold produced by a ChatGPT/Codex session on 2026-07-30, its own git repo). This folder is the static Claude-built version. They share nothing.

## The flow

1. `index.html` — landing page. CTA: "Get Your Kids Safety Score".
2. `quiz.html` — 10 scored questions plus kid count. Produces a 0-100 score with four named bands (Running on memory / Getting there / On the board / Fridge-ready). Quiz alone maxes at 55 points; the other 45 come from documenting.
3. `builder.html` — the Emergency Card questionnaire (Home base, Your people, Your kids, House rules). Each section boosts the score live. Autosaves to localStorage.
4. `sheet.html` — the printable fridge sheet: Letter size, one row per kid, QR per kid, 911 + Poison Control band. Print CSS verified via Chrome PDF.
5. `child.html?i=N` — what a QR scan opens: mobile page with tap-to-call numbers, allergies with reactions, meds, care team, insurance, house notes.

## Run it

Served by the `proto` launch config (python http.server on 5190, serves all of `_prototypes/`):

    python3 -m http.server 5190 --directory /Users/morganjlopes/code/_prototypes

Then open http://localhost:5190/supportnow-emergency-contact/

## Notes

- Brand tokens and conventions copied from `supportnow-van-fundraising/` (which took them from `supportnow-2.0/styleguide.html`): DM Sans, `#188aec` brand blue, warm neutrals, Bootstrap 5.3 + Font Awesome via CDN.
- All state is client-side localStorage (`ec_v1`). No backend.
- Demo family (fictional Riveras) seeds via the builder's "Load the fictional demo family" button, `sheet.html?demo=1`, or the footer link on the landing page. Demo end-state scores 91 to match the hero mock.
- QR codes are generated locally (`assets/qrcode.min.js`, kazuhikoarase/qrcode-generator, vendored) and point at `child.html?i=N` on whatever host serves the page.
