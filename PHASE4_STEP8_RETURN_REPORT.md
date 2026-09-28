# Phase 4 · Step 8 — Scene 8: The Return, and the Footer

Status: **BUILT, AUDITED, STOPPED.** Scene authoring for Phase 4 is complete (Scenes 0–8 authored). Step 4.9 not begun.

## 0. Inspection findings (reported before building)

- **Contract** (`scenes.ts` `return`): order 8, `static`, budget 0.8, neutral/forward, **`liveCapability: true`** — *not* false as the brief assumed; the 4.1 map marks it true because its door is real. Declared noJsBehaviour: "ENTER A WORLD → /subjects; UNDERSTAND IT → #premise" — a CTA *pair*; Decision 1 (one action, to the choice) supersedes; discrepancy recorded, contract text frozen.
- **Scene 0 verbatim** (`arrival.tsx`): h1 *"Every subject is a place you can enter."* · support *"Each subject is its own environment. Choose one and step inside."* · CTAs *"Enter a world"* → `#for-students` (Scene 3) and *"Understand it"* → `#how-it-works`.
- **4.4 model**: `status !== "draft"` makes a door; today 1 of 6 is `ready` (mathematics); availability line derived in `choice.tsx`.
- **A FOOTER ALREADY EXISTED**: `src/components/layout/site-footer.tsx`, rendered by `src/app/(public)/layout.tsx` after `<main>` — already page chrome, correct location. Its contents violated Decision 3: three link columns (`FOOTER_NAV`), a description claiming "live classrooms, recorded lessons, assignments, assessments and an AI learning assistant in one place" (none built), and `hello@tutorsacademy.example` (not a real mailbox — a fabricated contact). Reported here before touching; **its contents were rewritten in place** (same component, same mount point — the one existing-component edit this step makes, mandated by Decision 3). `FOOTER_NAV` in `config/navigation.ts` left untouched (now unreferenced).
- Nav labels in use: header `nav[aria-label="Primary"]`; footer now `nav[aria-label="Footer"]`; footer landmark `aria-label="Site footer"` — distinct.
- Anchors that resolve: `#how-it-works` (premise), `#for-students` (choice), `#for-tutors`, `#platform`. Routes: `/`, `/subjects`, `/subjects/[id]`, `/login`, `/register`, `/student|tutor|admin` (honest shells).
- Also noticed: `arrival.status` is still `"skeleton"` in the contract although Scene 0 was authored in 4.2. Not changed (not this step's field); flagged for 4.9.

## 1. Files

| File | Change |
|---|---|
| `src/components/spine/scenes/return.tsx` | NEW — Scene 8. |
| `src/components/layout/site-footer.tsx` | REWRITTEN contents (see §0) — mount point and export unchanged. |
| `src/components/spine/slots.tsx` | +1 entry `return`. |
| `src/lib/spine/scenes.ts` | `return.status: skeleton → authored`. Only field touched. |
| `src/app/dev/scene-return/{page,preview}.tsx` | NEW dev specimen; 404 in prod (verified). |
| `audit/scene-return.cjs` | NEW harness extension. |
| `/home/user/shots22/` | end-dark/light-1280, end-nojs, end-rm, end-zoom400, cta-focus, both-320/1280/1920, both-gray, zero-ready. |

Only Scene 8 and the footer were authored. Scenes 0–7, spine, subject system, brand, header, primitives, tokens: untouched.

## 2. Recall candidates

- **A (shipped):** *"Every subject is a place you can enter."* — Scene 0's h1, verbatim, as Scene 8's h2. **What the words mean now:** *place* — at Scene 0 a figure of speech; now a specific object the reader has seen: an environment with five levers (Scene 2) that exists at `/subjects/[id]` (Scene 3). *enter* — at Scene 0 a verb; now the crossing they watched (Scene 4) and the same button they passed at the top. *you can* — at Scene 0 unconditional; now qualified by a derived count ("One of the six is open today.") and by Scenes 5–7's account of what is not built. *every subject* — at Scene 0 a promise; now six named environments, one open, five in foundation.
- **B:** *"A subject is a place. You have seen the one that is open."* — Meaning shift is explicit in the words themselves (it names the qualification). Risk: it is a new sentence, so the circularity is lost; it also leans on the single open subject, which edges toward featuring it.
- Recommendation: **A.** The device only works if the words are the same; the lead beneath carries the change.

## 3. Action-label candidates

- **A (shipped):** *"Enter a world"* → `#for-students` — identical verb, identical destination to Scene 0's primary. Coherent by construction. 3 words.
- **B:** *"Back to the doors"* — honest about the direction of travel, but a different verb from the hero and faintly apologetic. 4 words.
- Recommendation: **A.**

Destination reasoning: the choice lives on this page (Scene 3, `#for-students`) with derived availability and the inert-≠-lesser treatment; `/subjects` is the scaffold index. The brief's rule is "lead TO THE CHOICE" — Scene 3 is the choice, and it is the hero's own door, which is the point of a return. Verified: anchor exists, resolves.

## 4. Closing lines

- Scene 8 (page's last authored words): *"The page ends here. The environment does not."*
- Footer: *"Built in the open. What is not built yet says so."* (differs; chrome register).

## 5. Footer structure and location

Rendered once by `src/app/(public)/layout.tsx`: `<div.flex> <SiteHeader/> <main#main>{spine}</main> <SiteFooter/> </div>`. Harness evidence (server HTML): `footerCount: 1`, `footerParent: DIV.flex`, `prevSibling: MAIN#main`, `footerOutsideSpine: true` (no `footer` inside `[data-spine]`). It has no scene contract entry, no `narrativeFn`, no scroll behaviour; `SPINE` is sorted by `order` inside `HomeSpine` — nothing in that sort can reach the footer, so reordering the spine cannot move it.

## 6. Footer contents and proportion

Elements, in reading order: (1) brand lockup link → `/` (`aria-label="Tutors Academy home"`, brass mark, `markFill` measured `rgb(194,154,69)` dark / `rgb(122,90,31)` light — brand brass, no `[data-subject]` ancestor or descendant); (2) `nav[aria-label="Footer"]` — ONE group of three links; (3) closing line; (4) copyright `© 2026 Tutors Academy.` (exact string; year from `Date`). No headings. 19 words.

Rendered height: **147px at ≥768 (2 rows), 238px at 320/390 (4 rows)** = **1.64% of the 8,996px page** at 1280×800. One group, zero columns.

Did I feel the pull to pad it? Yes — twice: to add a "Create account" link (the header already has it; omitted) and a "Contact" item (no route exists; omitted — it is a blocker, not a link). The footer is four lines and that is correct.

## 7. Link list with resolution (prod :3100)

| where | text | href | status | anchor |
|---|---|---|---|---|
| Scene 8 | Enter a world | `#for-students` | 200/304 (`/`) | `#for-students` exists ✓ |
| footer | Tutors Academy home | `/` | 200/304 | — |
| footer | How it works | `/#how-it-works` | 200/304 | `#how-it-works` exists ✓ |
| footer | Subjects | `/subjects` | **200** | — |
| footer | Sign in | `/login` | **200** | — |

(304s are the harness's cache revalidation of `/`; the page loads.) No dead links.

## 8. Launch blockers — legal and contact (REQUIRED)

| item | blocks | status |
|---|---|---|
| **Privacy policy** | collecting any personal data: sign-up, enrolment, attendance, recordings | absent — no route, no draft |
| **Terms of service** | anyone enrolling or paying; tutor onboarding | absent — no route, no draft |
| **Contact route** (a human) | complaints, data-rights requests, parents reaching someone; also a DPDP grievance-officer requirement | absent — the `.example` address was removed; nothing replaces it yet |
| **DPDP Act, 2023 (India) legal review** | processing any personal data of Indian users, and specifically **children's data** — verifiable parental consent, prohibition on tracking/behavioural monitoring and targeted advertising directed at children — which a school-age tutoring platform will hold; plus notice/consent, purpose limitation, retention, grievance officer | not started — **flagged for legal review; no policy copy drafted** |
| Cookies / analytics disclosure | adding any analytics or third-party script | not needed today (none present); becomes a blocker the day one is added |

The footer omits all of these rather than linking to nothing or stating drafts. No legal text exists anywhere in the repo (sweep: `privacy|terms|cookie|policy` → none in rendered strings).

## 9. Recall-difference finding

The statement is byte-identical to Scene 0; the meaning is not — see §2A. Test: put both beside each other (dev §5): at Scene 0 the sentence is a claim awaiting evidence; at Scene 8 every noun in it has been shown (place → environment; enter → crossing; every subject → six named; you can → one open today, derived). It is a recall, not a repetition. Had the lead been omitted it would have been lazy repetition — the lead is what does the work.

## 10. Every string Scene 8 and the footer render (fabrication audit)

Scene 8: `The return` · `Every subject is a place you can enter.` · `You have now seen what that means: the system, the doors, the crossing, and what is not built yet. The choice is where it was.` · `One of the six is open today.` (derived) · `Enter a world` · `The page ends here. The environment does not.`
Footer: lockup (`Tutors Academy`, link `Tutors Academy home`) · `How it works` · `Subjects` · `Sign in` · `Built in the open. What is not built yet says so.` · `© 2026 Tutors Academy.`
No statistic, testimonial, rank, rating, count of people, address, phone. The only numerals: the copyright year and the derived "One of the six" in words.

## 11. Sweeps

- Capture (`form|input|email|subscribe|newsletter|get updates|join`): **none**; DOM `footer form|input`: 0.
- Claims (social names/handles/`@`, download, app store, accredit, certif, award, partner, trusted by, students, rating): **none**; footer SVG count 1 = brand mark only.
- Dead links: none (§7). Legal copy: none (§8).
- Clichés (4.1 list + Scene 7's list) and urgency/dates: **none** (year in © only).

## 12. Word counts vs budgets

Lead: 2 sentences / 25 words (≤2 ✓). Closing: 1 sentence / 8 words ✓. Action: 3 words (≤4 ✓). Scene total 48 words; footer 19. No overrun.

## 13. Scene 7 vs Scene 8

Scene 7: wide (seven columns), centred in a 1.0vh section, no control, 96 words, a long measure — a held breath. Scene 8: left-set, 40rem measure, 48 words, one brass button, one hairline, then the closing line; content 0.56vh in a 0.8vh section. Seven is a still *centre*; eight is a still *edge*. Screenshots: `shots21/s7-dark-1280.png` vs `shots22/end-dark-1280.png`; side-by-side on the dev route §4.

## 14. End of page

At 1280×800, scrolled to the end: footer bottom = document bottom (`trailingAfterFooter: 0`); the last viewport holds Scene 8's button, closing line and the whole footer (footer top at 652px of 800 — it *begins in the lower fifth* of the final viewport, not mid-viewport; I would call this composed, but it is close to the line and recorded). At 400% zoom: no horizontal scroll, footer bottom at page end, nothing clipped (`shots22/end-zoom400.png`). No orphaned scene; nothing after the footer.

## 15. Full-page read-through — verdict (unsoftened)

Read 0 → 8 in order (`/`, 1280×800, ~9,000px, **741 words, ≈3.2 min at 230 wpm**, plus ~9.0 viewports of scroll).

- **Where attention drops:** twice. First inside **Scene 1 (premise, 106 words)** — the longest block of prose before the reader has seen anything, arriving immediately after a one-line hero. Second, and worse, in **Scene 6 (practice, 166 words)**: four beats that all end "Next · not built yet" read, by the fourth, as a list of absences; the 1.6vh section makes it the physical low point too.
- **Which scene could be cut without loss:** **Scene 5 (people)** could be folded into Scene 6 as a fifth line ("a tutor owns the room; five levers are theirs") with no loss to the argument — its only unique claim is the levers sentence. Scene 6 should not be cut but must be halved (two beats until anything ships, as the 4.6 report recommended). Scenes 2/3/4 are the page; 7 and 8 are short and do their jobs.
- **Does the ending earn the beginning?** Yes, narrowly — because the door is literally the same door, and because Scenes 5–7 spent their words on honesty rather than hype, so the repeated sentence lands as earned rather than insistent. It would earn it more cleanly if the middle were shorter.
- **Is the page too long?** **Yes — by about a quarter.** 741 words is not long as prose; nine viewports with four different scroll grammars is long as an experience, and the middle three scenes (4–6) are 3.4 of those viewports. **Specific recommendation for 4.9:** (1) merge Scene 5 into Scene 6 and cut Scene 6 to two beats → saves ~130 words and ~1.6vh; (2) trim Scene 1 to ≤70 words; (3) leave 0, 2, 3, 4, 7, 8 as they are. Target: ~580 words, ≤7.5 viewports, eight scenes not nine. The spine is data, so this is a contract edit plus two component changes, not a rebuild.

## 16. Page-level totals

- **Scroll budget** (actual vh at 1280×800 vs declared): arrival 1.20/1.2 · premise 1.00/1.0 · difference 1.21/1.2 · choice **1.39/1.2 ✗** · enter 1.60/1.6 · people 1.20/1.2 · practice 1.60/1.6 · promise 1.00/1.0 · return **0.80/0.8 ✓** → **actual 10.0 vs declared 9.8** (the 0.19 overrun is Scene 3's, recorded since 4.4; plus the narrow-width overruns recorded in 4.6/4.7).
- **Words:** 21 + 106 + 74 + 72 + 71 + 68 + 166 + 96 + 48 = **722 in scenes, + 19 footer = 741.**
- **Motif budget:** Scene 8 and the footer add **0 motifs** (the footer SVG is the brand mark). The 3.3 figures stand as last measured by `motifBudget()`: 13 surfaces, ≤786 commands (ceiling 5,200), ≤89 DOM (ceiling 156), generation well under the 8ms/surface cap.

## 17. No-JS, RM, zero-ready

- No-JS (`end-nojs.png`): all six Scene 8 strings, all five links, footer complete; no forms.
- RM (`end-rm.png`): motion classes in scene 0 (declared `static`; none used — "reveal-once or none: **none**"); opacity 1.
- Zero-ready (`zero-ready.png`, dev `?ready=0`): derived line becomes *"No environment is open yet. The doors are still where the choice is made."*; the action still reads "Enter a world" → `#for-students`, where Scene 3 says the same thing in its own derived line. Coherent and honest; the button does not change label because it still leads to the choice, not to a room.

## 18. Grayscale, contrast, screen reader, keyboard

- Grayscale (`both-gray.png`): everything is type + one underline + one brass button; nothing is state-by-colour.
- Contrast: lead/footer links (secondary on base) 16.27 dark / 15.71 light; closing/copyright (muted) 7.65 / 8.93; brass mark on base 7.37 / 6.02; primary button light: white on `#7a5a1f` ≈ 6.0 ✓; **primary button dark: 2.62:1 — pre-existing button-skin defect (recorded since 4.4), unchanged here.** Focus ring: `outline 2px solid` brass on the Stage, visible (`cta-focus.png`).
- Screen reader order (axe tree): `section[aria-labelledby=scene-return]` → h2 "Every subject is a place you can enter." → lead → "One of the six is open today." → link "Enter a world" → closing → `contentinfo "Site footer"` → link "Tutors Academy home" → `navigation "Footer"` → How it works / Subjects / Sign in → closing → ©. Distinct labels: Primary / Footer / Site footer. Nothing announced that is not true.
- Keyboard from Scene 4 onward: … `Enter Mathematics` → **`Enter a world` (Scene 8) → footer: Tutors Academy home → How it works → Subjects → Sign in → end of document** (wraps to skip link). No trap, no dead stop. Only focusable in Scene 8 is the action. Touch targets: CTA 147×48 (full-width 272×48 at 320); footer links 44px tall, min gap 16px at 320.

## 19. Performance

Lighthouse desktop `/` prod: **100/100/100/100**; LCP 0.7s (`h1#scene-arrival`); CLS 0 (and 0 across a full-page scroll probe); TBT 0; 358 KiB; JS 188.8 KB (+19 bytes vs 4.7). Long tasks: none. WebGL: 0 canvas, 0 matching chunk in the waterfall. Hydration warnings: 0 on `/` and on `/dev/scene-return`. axe on Scene 8 + footer: 0 violations; dev route: `skip-link`/`region` on the dev chrome only (pre-existing pattern). Lighthouse's one a11y flag is the pre-existing `label-content-name-mismatch` (Scenes 0/3).

## 20. What the harness surfaced

- The foundation footer's fabricated `.example` contact address and unbuilt-feature description had been shipping on every page since Phase 1 — nothing before this step swept the footer.
- `arrival.status` still `skeleton` in the contract (§0).
- The one-primary rule needs a definition: the header's sticky "Create account" is a primary-styled control visible at *every* scroll position. Within the page body there is exactly one primary at Scene 8's position (Scene 4's "Enter Mathematics" is ~2,400px above and off-screen); the header's belongs to the nav shell (2.6) and is out of scope. Recorded for 4.9.

## 21. Deferred / half-built

Deferred: legal pages, contact route, DPDP review (blockers, §8); the 4.9 length edits (§15). Nothing half-built: no hidden controls, no placeholder routes, no stub legal pages.

## 22. Nothing outside Scene 8 and the footer changed

Confirmed. `git status --porcelain` → `fatal: not a git repository (or any of the parent directories): .git` (exit 128, verbatim). Guard passes. Prod build passes; `/dev/scene-return` → 404.

**STOP.** Step 4.9 not begun.
