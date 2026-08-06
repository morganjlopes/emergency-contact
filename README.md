# Emergency Contact

A campaign prototype for **SupportNow**. Static, no build step, no backend.

Live: **https://morganjlopes.github.io/emergency-contact/**

> Everything about your kids lives in your head. Put a copy on the fridge.

## The idea

Families prepare for the emergencies they can picture. What actually knocks a week sideways is the
thing nobody wrote down, on the day the one person who knows it is unreachable. That person is
usually Mom.

Certain moments already force this information out of her head and onto paper: back to school, a new
babysitter, a weekend away, grandparents taking the kids. Every one of those makes her rebuild the
same list from memory. This campaign gets it built once.

## The product and the promotion are two different things

This is the organising idea of the whole build, and it is easy to break by accident.

**The product** is the **Emergency Card**: one printed page on your fridge. You get one by
completing the questionnaire. It is evergreen.

**The promotion** is the **Kids Safety Score**: a campaign that exists to get attention and route
people into that same questionnaire. It runs for a while and then stops.

Two paths reach the deliverable, and both are first class:

| Path | Route |
|---|---|
| Direct | `index.html` → `questionnaire.html` → `sheet.html` |
| Campaign | `safety-score.html` → `quiz.html` → `questionnaire.html` → `sheet.html` |

| Page | Belongs to | Role |
|---|---|---|
| `index.html` | product | What an Emergency Card is and how to get one, with the promo highlighted in the header |
| `questionnaire.html` | product | Five sections. Answer once. |
| `sheet.html` | product | The Emergency Card itself, printable |
| `child.html` | product | What a QR code opens. No shell nav: a sitter opens this mid-emergency |
| `safety-score.html` | campaign | Landing page for cold traffic from ads and social |
| `quiz.html` | campaign | The nine questions and the result |

The expansion is deliberate: kids first because they are the easiest yes, then the same card for a
partner, for yourself, and for aging parents.

## Ending the promotion

Set `active: false` in `EC.PROMO` (`assets/ec.js`) and the campaign retires everywhere in one edit:

- the header call to action falls back to **Create My Emergency Card**
- the hero promo badge, the promo band, and the closing footnote are removed
- the Safety Score link drops out of the nav, on every page, via `shell-app.js`
- the score chip never appears in the questionnaire or on the card

Verified by flipping it: with the promo off, the string "safety score" does not appear anywhere on
the homepage.

**The score never leaks into the product.** `EC.tookQuiz()` is the single test. Someone who came
the direct route sees section progress ("3 of 5 sections done") in the questionnaire dock and no
score chip on their card, because they never opted into that game.

## Scoring

Nine items, ten points each, normalized to 100. Defined in `assets/ec.js` as `EC.ITEMS`, and read
directly by `safety-score.html` so the campaign page can never drift out of step with the quiz.

Each item scores `max(what you said in the quiz, what your answers actually document)`, so filling
in the questionnaire can only ever raise the number, and it raises it honestly, because the thing is
now genuinely written down and printable.

Three deliberate choices in the model:

- **"No" scores 2, not 0.** You know all of it. The missing points are for it being reachable by
  someone else, not for ignorance. A parent who has written nothing down lands at 20.
- **"Does not apply" earns full credit.** Two questions (allergies and medicines, school pickup)
  offer it. A family whose kids have no allergies is not less prepared, so they are not scored lower.
- **One item is unreachable by the tool.** `kids_know` ("do your kids know a parent's number by
  heart") stays a self-report, and the results page turns it into a real-world action. A fully
  completed questionnaire lands at 96, not 100.

A typical mixed set of answers lands at 51. Bands: 0 to 44 mostly in your head, 45 to 64 some of it
is written down, 65 to 84 good coverage, 85 and up ready for the unexpected.

## What prints and what does not

The questionnaire marks every answer as **prints** or **scan only**, because a page on the fridge is
readable by anyone standing in the kitchen. Insurance carrier, member ID and group are scan only for
that reason. The printed sheet says "Insurance: scan a code" instead.

## Running it

```bash
python3 -m http.server 5194 --directory /Users/morganjlopes/code/_prototypes/emergency-contact-sn
```

Registered in `_prototypes/.claude/launch.json` as `emergency-contact-sn` on port **5194**. Opening
`index.html` from the filesystem also works, though the QR codes then encode a placeholder
`supportnow.org/e/CODE` address since there is no host to point at.

## Notes

- **The shell.** Nav and footer come from `supportnow-portfolio-shell`. `shell-app.js` is the
  live-app build: the shell's own `shell.js` re-renders the nav from `apps.js` to drive its
  walkthrough demo, which would overwrite a real app's links. Pages set `window.EC_SHELL` to pick
  the active link and a page specific footer CTA, and the nav and footer mount into
  `#pfNavMount` / `#pfFootMount`. `child.html` deliberately has no shell: a sitter opens it
  mid-emergency and should not land on marketing chrome.
- **State is local.** Everything lives in `localStorage` under `ec.sn.v1`, with an in-memory
  fallback for browsers that block storage on `file://`. Nothing is sent anywhere.
- **QR codes** render via `qrcodejs` from cdnjs and fall back to a labelled placeholder offline.
  Over http they encode a real, scannable `child.html?c=CODE` link on the current origin.
- **Sample family.** The Whitakers of Kailua load from `EC.sample()`. `sheet.html` falls back to
  them when no answers exist yet, with a banner saying so. Loading or clearing warns first if there
  is real work to lose. All names and numbers are fictional.
- **Print.** The sheet is sized for letter and fits one page up to three children. A fourth pushes
  to page two, with `break-inside: avoid` keeping rows intact.
- **Not wired up:** the email capture on the results page and the six and twelve month reminder on
  the sheet are both stubs, the three expansion buttons all point back at the questionnaire, and
  there is no real link revocation behind the privacy copy.

Brand tokens match `supportnow-family-advocacy/intake.css` and `supportnow-2.0/styleguide.html`.
Emergency Contact is presented as part of SupportNow, the Official Family Support Platform.
