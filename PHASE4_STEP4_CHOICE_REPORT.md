# Phase 4 · Step 4 — Scene 3 “The Choice” (`for-students`)

Status: **built, verified, stopped.** No Scene 4 work was done. `/subjects` scaffold, subject system, brand, nav, shell, primitives, switch untouched. Scene 0 change is the CTA `href` only.

---

## 1. What shipped

| File | Change |
|---|---|
| `src/components/spine/scenes/choice.tsx` | **new** — the scene |
| `src/components/spine/slots.tsx`, `spine/scene-slot.tsx` | register `choice` slot |
| `src/lib/spine/scenes.ts` | `for-students` → `choice` (contract field values unchanged) |
| `src/app/(public)/page.tsx` | mounts Scene 3 after Scene 2 (extension, nothing replaced) |
| `src/components/spine/scenes/arrival.tsx` | primary CTA `href` `/subjects` → `#for-students` (only change) |
| `src/app/dev/scene-choice/page.tsx` + `preview.tsx` | **new** dev harness page (404 in prod) |

No new tokens, colours, marks, motifs, motion, primitives or dependencies. Guards: subject-import guard ✓, subject validator ✓, tsc ✓, eslint ✓.

## 2. The scene, in one paragraph

Six rows, one per subject, in **3.1 config order**. Every row carries the same mark (32px, 24px ≤48rem), the same name, the environment name, the tagline, and a purpose-`door` edge motif from the subject’s own room scope. The action column is the only difference: an open subject shows the outline button **Enter →** (the whole row is one `<a href="/subjects/[id]">`), a draft subject shows the plain text **In foundation** (the row is a `<div>`, not focusable, no href, no pointer affordance). Above the list a derived sentence states the truth of the config; below it a single narrative line ends the scene.

## 3. Copy (verbatim, `CHOICE_COPY`)

- Eyebrow: `The choice`
- H2: `Six environments. This is the threshold.`
- **Lead A — SHIPPED:** `Each door below is a subject built as a place. Behind it is the environment itself, as it stands today.`
- Lead B (candidate): `You have seen the system. This is where you stop reading. Pick the subject you are here for and go in.`
- **CTA 1 — SHIPPED:** `Enter`
- CTA 2 (candidate): `Enter the environment`
- CTA 3 (candidate): `Go in`
- Inert label: `In foundation`
- Derived availability: `One of the six is open today: Mathematics. The rest are in foundation.` · two open: `…open today: Mathematics and Physics.…` · all six: `All six environments are open.`
- Closing line: `The door opens onto the environment, and the environment becomes the page.`

Promise is entry, not outcomes. No feature promises, no “soon”, no countdown, no waitlist, no urgency. No digits anywhere in the scene (counts are spelled).

## 4. Taglines — used from config, one display decision

Environment name = tagline prefix before ` — ` (`environmentName()`); the visible tagline is the **remainder** (`taglineRest()`) so the config text is not printed twice (“The Lattice / The Lattice — structure…”). Nothing is rewritten; the split is on the config’s own separator. Weak ones to report, not changed: `History — layered, archival.` (adjectives, no verb; reads as a caption) and `Biology — life, layered.` (repeats “layered”, colliding with History).

## 5. Eligibility — config-driven, honest at both extremes

- Enforcement point: `choice.tsx` — `status !== "draft"` decides `<a>` vs inert `<div>`. Same predicate as `SubjectContext.tsx:30` and `subjects/[subject]/page.tsx:44`.
- **Flip test (performed, reverted):** set `physics.status: "ready"` in `subjects.ts` with no other change → SSR emitted `data-open-count="2"`, a second `<a aria-label="Physics — The Field" href="/subjects/physics">`, availability sentence “Mathematics and Physics”. Reverted; `diff` against backup: identical.
- **Route truth matches the doors:** production build — `/subjects/mathematics` 200; `/subjects/{physics,chemistry,biology,english,history}` **404**. So no inert row ever points at a page that would 404, and no link exists that the server would refuse. (Dev shows draft banners instead of 404 — dev only.)
- `?allReady=1` on the dev page renders the six-open extreme: six equal `<a>` rows, six “Enter”. Both extremes are visually judgeable side by side.

## 6. Equal weight — measured

| viewport | door boxes (w×h) | equal |
|---|---|---|
| 320 | 272×167 ×6 | ✓ (after fix) |
| 390 | 342×167 ×6 | ✓ |
| 768 | 704×173 ×6 | ✓ |
| 1280 | 1024×116 ×6 | ✓ |
| 1920 | 992×116 ×6 | ✓ |
| 320, all-ready | 272×167 ×6 | ✓ |

Fixes: `[data-door-action]` min-height = control height (equal at ≥390); ≤48rem `[data-door-tagline]` reserves two lines (copy length can no longer change a door’s size — this was the 320 defect, 167 vs 149). Row gaps 1px throughout; same mark size, same type, same motif budget per row. Nothing is featured, badged, recommended or reordered.

## 7. Distinction from Scene 2

Scene 2 (`difference`): display-only specimens, no interactive, no imperatives. Scene 3: one heading, a list of doors, exactly one focusable element per open subject. Sweep of Scene 3 DOM: 0 buttons, 0 dialogs, 0 badges, 0 live regions, 0 inputs. Scene 2 was not edited; its closing line **“One of these six is the subject you are here for. It is next.”** is flagged: it now sits directly above a list where five of six are inert, so “the subject you are here for” may be a door that does not open. Recommend a Scene 2 copy decision in a later step; not changed here (out of scope).

## 8. Interaction

- Hover/focus: `translateY(-2px)` + inset 3px accent box-shadow, 150ms. Reduced motion: transform none, inset shadow kept. CLS during hover 0 (both themes).
- No preview takeover, no two-step, no modal, no hover-only content, no auto-focus.
- No-JS: 6 doors, 1 `<a>`, 5 inert divs; click lands `/subjects/mathematics` with maths scope. Screenshot `shots18/s3-nojs.png`.
- Hydration warnings: 0.

## 9. Scene 0 CTA

Before: `href="/subjects"`. After: `href="#for-students"`; target top at 158px after jump (heading visible under the nav). Secondary CTA `#how-it-works` unchanged. `/subjects` route still exists and is untouched.

## 10. Accessibility

- `ul[data-doors] aria-labelledby="scene-choice"`; each link `aria-label="Name — Environment"` + `aria-describedby` → tagline remainder; button label and arrow `aria-hidden` (name comes from the link).
- SR order per row: name → environment → tagline → (link: “Enter” is not announced separately; “link, Mathematics — The Lattice, structure you can stand on.”). Inert rows: name, environment, tagline, “In foundation”. Motifs and marks `aria-hidden`.
- Tab order: arrival cue → Mathematics door → return CTAs → footer. Tab CLS 0. Live-region mutations 0.
- Focus ring: `--ta-focus-ring` solid 2px on the link, both themes, all six in the all-ready frame (`shots18/focus-{theme}-{id}.png`). Ring vs surface: dark ≈4.83:1, light ≈4.13:1 (≥3:1). (Earlier “≈1.0” numbers were ring-vs-accent-text, not the relevant pair.)
- Contrast (dark / light): name 17.75 / 18.36; environment (accent mono) 7.96–12.74 / 4.75–6.01; tagline 16.27 / 15.71; “In foundation” 7.65 / 8.93. All ≥4.5.
- axe on Scene 3: 0 violations (dark). Page-level: `color-contrast`×3 on `buttonClass("primary")` in dark — **pre-existing**, not from this step. Dev page: `scrollable-region-focusable`×3 fixed (tabIndex + label on width frames).
- Grayscale (`s3-grayscale.png`): open vs inert readable by “Enter” button vs text; subjects distinguished by name, environment and mark. Edge motifs nearly disappear in grayscale for physics/chemistry/english — decorative only, nothing depends on them.
- Touch @320: all six rows ≥44px, gaps ≥8px handled by row height (167px) and the action column; the button is 44px tall.
- Text spacing @360: no clipping, no overflow. Zoom 400% proxy (320 viewport) and 200% proxy (640-ish via 768 frame): single column, no horizontal scroll.

## 11. Widths / overflow

`scrollWidth === viewport` at 320/390/768/1280/1920. Stacked layout ≤48rem, action under text at ≤30rem.

## 12. Scroll budget — **overrun defect, declaration untouched**

Contract declares 1.2 vh. Measured scene height / viewport: 320→2.71, 390→1.73, 768→1.43, 1280→1.39, 1920→1.20, landscape 667×375→3.12. Only 1920 meets it. Six equal rows with mark+name+env+tagline cannot fit 1.2 vh at 1280×800 without shrinking rows below the touch/legibility floor. Per standing rule this is reported as a defect against the declaration, not edited. Recommendation for the owner: raise `for-students` to 1.6 (same as `enter`) or accept.

## 13. Motif budgets

12 motifs (6 subjects × 2 themes) combined: 530 commands / 84 DOM / 2.14 ms vs ceilings 4800 / 144 / 96 ms. Per-surface max well under 400/12/8 ms. No coverage reduction needed.

## 14. Performance (production, `next start`, Lighthouse desktop)

Performance 100 · Accessibility 100 · Best-practices 100 · LCP 0.5 s · CLS 0 · TBT 0 ms · color-contrast pass (light default). Dev-mode LCP 284 ms (h1). No ambient/WebGL chunk requested on `/`.

## 15. Build / route truth

`next build` clean. Prod: `/` 200, `/dev/scene-choice` **404**, `/subjects/mathematics` 200, five drafts 404 (see §5). `git status --porcelain` →
```
fatal: not a git repository (or any of the parent directories): .git
```
(exit 128; no repo, not initialised.)

Pre-existing, unrelated: `check-breakpoints` reports `nav-shell.tsx` media width 479px (not touched in this step).

## 16. Contract discrepancy

Brief: reveal-once. Frozen contract for `for-students`: `scrollBehaviour: "static"`. Kept **static**. Doors render fully at first paint (no `.ta-reveal` opacity gating on the list) so no-JS and hydration are identical.

## 17. Handoff to Scene 4 (documented, not implemented — `CHOICE_HANDOFF`)

- Each row exposes `data-door="<id>"`, `data-subject`, `data-spatial="room"`.
- When Scene 4 exists, an open door may dispatch `CustomEvent("ta:door", {detail:{id}})` on hover/focus intent; **the click is never intercepted** — navigation stays the `<a>`.
- Default subject for Scene 4 = first `ready` in config order. Nothing persisted (no storage, no cookie).
- Scene 4 must derive from the same predicate; if Scene 4 shows a subject that is a draft it is a Scene 4 defect.

## 18. 28-test summary

no-JS screenshot ✓ · six URLs (dev 200×6 / prod 200+404×5 = truth) ✓ · draft enforcement point ✓ · flip test ✓ · equal-weight boxes ✓ (fixed at 320) · touch 44/8 @320 ✓ · focus rings six×two themes ✓ · CLS 0 (tab, hover, load) ✓ · grayscale ✓ · contrast ✓ · widths 320–1920 ✓ · zoom 400/200 proxies ✓ · text spacing ✓ · SR order ✓ · Scene2-vs-3 distinction ✓ · hero CTA before/after ✓ · payload/LCP/CLS ✓ · WebGL absent ✓ · hydration 0 ✓ · harness boundary 10/10 ✓ · motif budgets ✓ · axe scene 0 ✓ (page ×3 pre-existing) · Lighthouse 100/100/100 ✓ · guards ✓ · tsc/lint ✓ · prod build + dev 404 ✓ · git 128 ✓ · **scroll budget ✗ (defect, §12)**.

## 19. Open items for the owner

1. Scroll declaration 1.2 vs measured (§12).
2. Scene 2 closing line vs five inert doors (§7).
3. Weak taglines History / Biology (§4).
4. Pre-existing: primary button dark contrast 2.62:1; nav-shell 479px breakpoint.

## 20. Artifacts

Screenshots `shots18/`: `s3-dark-1280`, `s3-light-1280`, `s3-grayscale`, `s3-nojs`, `s3-reduced`, `s3-{dark,light}-allready`, `s3-320/390/768/1920`, `focus-{dark,light}-{id}`, `dev-scene-choice`. Dev page: `/dev/scene-choice` (`?frame=1&theme=dark|light&allReady=1`).
