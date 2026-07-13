# quaternions_for_simulation

An interactive site teaching the **working kit** of quaternions — the five
operations you need to rotate things, and the one differential equation you
need to simulate rotation over time. Same family as
[matrices_for_11_year_olds](https://jeremydwong.github.io/matrices_for_11_year_olds/),
[fractions_for_6_year_olds](https://github.com/jeremydwong/fractions_for_6_year_olds),
and the imaginary-numbers site.

## The pages

0. **The Working Kit** — the whole cheat sheet: build, sandwich, chain, conjugate, integrate+normalize
1. **Why Not Three Angles?** — non-commutativity you can feel, and gimbal lock
2. **The Algebra You Need** — `i² = j² = k² = ijk = −1`, the cycle, conjugate/norm/inverse
3. **Rotation & the 720°** — the half-angle sandwich, and the double cover
4. **Calculus for Simulation** — `q̇ = ½ q ⊗ (0, ω)`, the integrator loop, and a live
   simulator where you can switch **normalize off** and watch the classic drift bug happen
5. **Capstone** — the card to tape to your monitor, reading list, harder problems

Every page ends with take-home points, reveal-able **take-home test questions**,
and a **working-knowledge** problem list.

## Style

The visual design derives from the reference stylesheets in
[`styles/reference/`](styles/reference/) — `normalize.css`, Skeleton
(`skeleton.css`), and `custom.css` (dark `#242424` default, Raleway,
`#33C3F0` accent, the blue navbar, and the light/dark toggle switch).
`normalize.css` and `skeleton.css` are imported verbatim;
[`styles/site.css`](styles/site.css) documents which `custom.css` rules are
reproduced (scoped) and why that file isn't imported wholesale — its bare
`label`/`input` rules would hide the widgets' sliders. Light mode uses the
same `invert(1) hue-rotate(180deg)` filter trick `custom.css` applies to SVGs.

## Requirements

node.js

## Build & run

```
npm install
npm run dev
```

Production build: `npm run build` (output in `dist/`).

## Editing the words

Prose lives in `content/*.md` (split at `# intro` / `# outro`); widgets and
quiz questions live in `quaternion-explorer.jsx`. See `content/README.md`
in the sibling sites for the directive syntax (`:::callout`, `:::takehome`).

## Deploying

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to
`main` (set **Settings → Pages → Source → GitHub Actions** once).
