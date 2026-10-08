# Tutors Academy — homepage

A scroll-choreographed 3D homepage for Tutors Academy, composed after the Halo
landing page: a spacious page on `#F5F5F5`, one large rounded hero container,
bold display type, black pill buttons, and an asymmetric card grid. All copy is
about education; nothing is carried over from the reference's finance content.

This is a **new, self-contained Vite app**. The existing Next.js portal in this
repository (`src/`, `supabase/`, `audit/`) is untouched — the homepage reuses
that app's *content*: the six subjects, their accents and their motifs come from
`src/lib/subjects/subjects.ts`, and the tone follows `COPY_VOICE.md`.

```
homepage/          ← this app
src/               ← the existing Next.js portal (unchanged)
```

## Run it

```bash
cd homepage
npm install
npm run dev        # http://localhost:5173, bound to 0.0.0.0
npm run build      # production bundle in dist/
npm test           # typecheck + sculpture math + two UI runs (jsdom)
```

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · lucide-react ·
Three.js through React Three Fiber · GSAP ScrollTrigger.

## How the 3D works

One `<Canvas>` is fixed behind the page at `z-0`. Page sections have no
background of their own; only the cards are opaque. The layout leaves four
transparent rectangles — marked `data-sculpture-window` — and the rig is pulled
into whichever one is most present, scaled to fit it. That is what puts the
sculpture *inside* the feature card rather than behind it.

The sculpture is six elements, each built from the same four pools of meshes
(beads, struts, frames, leaves). Nothing is swapped in or out, so every
transition is a genuine morph.

**Scroll is the input.** `ScrollTrigger` scrubs `scrollState.progress` across
the whole document. `three/choreography.ts` turns it into a single monotonic
`phase` from 0 to 4; `three/layouts.ts` holds a baked layout for every element
in every phase. Each frame the rig blends the two phases the scroll position
sits between — position, quaternion, scale and opacity per mesh.

| phase | where | what the sculpture does |
| ----- | ----- | ----------------------- |
| 0 assembled | hero | interlocking rounded frames, brass beads and teal rings orbiting, gentle ambient drift |
| 1 open | approach | the camera moves in and the armature separates into six distinct elements |
| 2 motif | subject explorer | each element becomes its subject's motif: lattice, field lines, molecular bonds, branching, layered pages, stacked rings |
| 3 unified | learning experience | the elements return to the centre and weave back into one structure, re-forming per stage (Explore / Practise / Reflect) |
| 4 emblem | final call to action | settles into a compact academy seal, rotation unwound so it faces the visitor |

Camera distance, rig rotation and rig position are separate scrubbed tracks, so
scrolling controls rotation and position as well as form. One restrained pin
(under half a viewport) holds the learning-experience panel while the three
stages are compared; nothing else is pinned.

## Accessibility

- **`prefers-reduced-motion: reduce`** — no scrub, no pin, no reveals, and the
  live canvas is not mounted at all. Every window renders the static
  composition that belongs to it (armature / motifs / unified / emblem), so the
  page is complete and stable rather than merely still.
- **No WebGL** — the same static compositions, detected before the canvas is
  ever mounted.
- **Rendering pauses** when the tab is hidden or when a subject panel is
  covering the page; `frameloop` goes to `"never"` rather than drawing frames
  nobody sees.
- **Small devices** get fewer meshes per element, a lower pixel-ratio ceiling,
  cheaper shadows and no antialiasing.
- Subject panels are real dialogs: `aria-modal`, Escape, focus moved in and
  restored to the card that opened it, Tab trapped, page scroll locked.
- Stage tabs are a proper `tablist` with roving tabindex and arrow keys.
- Every practice interaction is keyboard operable and reports through a live
  region, with the working shown for wrong answers too.
- Nav collapses into a disclosure panel with Escape, a focus trap and focus
  restoration. The nav pill hides below `sm` so a 320px row never overflows.

## Honest-content rules

Carried over from the repository's copy voice. No invented affiliations,
endorsements, testimonials, tutor credentials, prices or results. Every subject
panel and sample question is labelled a preview, and says plainly that there is
no live tutoring, no student account and no saved progress behind it.

## Tests

`npm test` runs four things. They execute the shipped modules — no parallel
reimplementation.

- `typecheck` — `tsc -b` over `src`, `scripts` and the Vite config.
- `smoke` — the real `layouts.ts` and `choreography.ts` under Node: every pool
  count, every quaternion normalised, every scale positive, the six motifs
  geometrically distinct, the state weights summing to 1 at 1001 scroll
  positions, all five choreographed beats actually reached, slots inside the
  frame, stage scalars interpolating.
- `smoke:ui` — mounts the real `App` in jsdom and drives it: all six subject
  panels open, each of the four practice interactions rejects a wrong answer and
  accepts a right one, the ordering interactions are sorted with the same buttons
  a keyboard user presses, the stages switch, the mobile menu opens and closes,
  and every 3D window carries a composition.
- `smoke:ui:reduced` — the same run with `prefers-reduced-motion` forced on.

## Fonts

TT Norms Pro was not supplied, so `--font-display` and `--font-sans` name it
first and fall back to a clean system sans. Drop the woff2 into `public/` and add
an `@font-face` block in `src/index.css` to switch the real face on; nothing else
needs to change.
