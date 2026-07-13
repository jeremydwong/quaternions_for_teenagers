# intro

This site is for you if you want to **make things rotate** — a game character, a drone, a limb in a physics simulation — and you keep hearing that quaternions are the right tool but the explanations drown you in algebra. Here's the deal: to *use* quaternions you only need **five operations**. This page is the complete kit; the rest of the site explains *why* each one works and lets you play with it.

:::callout color=cyan
Strategy stolen from good pilots: learn the checklist first, the aerodynamics second. Keep this page bookmarked — it's the whole checklist.
:::end

## The five things to remember

**1 — What a quaternion is.** Four numbers, {{q = (w, x, y, z)}}, written {{q = w + xi + yj + zk}}. For rotation you always use **unit** quaternions ({{w² + x² + y² + z² = 1}}). To encode "rotate by angle {{θ}} about unit axis {{û = (uₓ, u_y, u_z)}}":

{{q = ( cos(θ/2),  sin(θ/2)·uₓ,  sin(θ/2)·u_y,  sin(θ/2)·u_z )}}

Note the **half angle** — everything about quaternions has that ½ in it.

**2 — Rotate a vector.** Promote the vector {{v}} to a quaternion {{(0, v)}}, then **sandwich** it:

{{v′ = q v q*}}

where {{q*}} is the **conjugate** (flip the signs of x, y, z). For unit quaternions the conjugate *is* the inverse — that's why the sandwich works.

**3 — Chain rotations.** Multiply: doing {{q₁}} first, then {{q₂}}, is the single rotation {{q₂ ⊗ q₁}}. **Order matters** (rightmost happens first) — and that's correct, because 3D rotations genuinely don't commute.

**4 — Undo a rotation.** The conjugate again: {{q*}} rotates by {{−θ}} about the same axis. Free inverse, no matrix inversion, no singularities.

**5 — Simulate (the calculus).** If the body spins with angular velocity {{ω}} (a 3-vector, radians/sec, in body frame), the orientation evolves by the single most useful differential equation in 3D simulation:

{{q̇ = ½ · q ⊗ (0, ω)}}

Each timestep: {{q ← q + q̇·Δt}}, then **normalize** {{q ← q/|q|}}. That normalize is non-negotiable — numerical integration leaks length, and a non-unit quaternion doesn't just rotate, it *scales*. (Page 4 lets you switch the normalize off and watch things go wrong.)

That's it. That's the kit. Build one below and watch the four numbers respond.

# outro

Everything else you'll ever read about quaternions — Hamilton's {{i² = j² = k² = ijk = −1}}, the double cover, slerp — is *explanation and refinement* of those five moves. The pages that follow take them one at a time: why three angles fail (page 1), the algebra of {{i, j, k}} (page 2), why the half-angle sandwich rotates (page 3), and the simulation loop with its failure modes (page 4).

:::takehome color=gold
:::major
- The whole working kit is **five operations**: build {{q = (cos θ/2, sin θ/2·û)}}, rotate by sandwich {{qvq*}}, chain by multiplying {{q₂⊗q₁}}, undo with the conjugate {{q*}}, and simulate with {{q̇ = ½ q⊗(0,ω)}} + normalize.
- Rotation quaternions are always **unit length**; the conjugate is then the inverse.
- The **half angle** appears in the build formula; the **order** matters in the chain formula.
:::minor
- A non-unit quaternion scales as well as rotates — normalize after integrating.
- Everything else in quaternion-land is commentary on these five moves.
:::end
