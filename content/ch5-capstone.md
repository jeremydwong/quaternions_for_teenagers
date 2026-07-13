# intro

The whole site compressed to a card you could tape to your monitor:

- **State:** orientation = one unit quaternion {{q = (w, x, y, z)}}.
- **Build:** {{q = (cos(θ/2), sin(θ/2)·û)}} — half angle, auto-unit.
- **Rotate:** {{v′ = q v q*}} — two half-turns; conjugate = inverse (unit q).
- **Chain:** {{q₂ ⊗ q₁}} = "do 1, then 2" — order matters, cross-product deep down.
- **Simulate:** {{q̇ = ½ q ⊗ (0, ω)}}; step; **normalize** — or your world inflates by {{|q|²}}.
- **Blend:** slerp (or nlerp), after sign-matching the endpoints ({{q ≡ −q}}).

And the two ideas underneath: three angles must have a singular point somewhere (gimbal lock), which is *why* we carry four numbers; and the unit quaternions double-cover the rotations, which is why 360° flips {{q}}'s sign and 720° restores it.

## Where to go next

- **Andrew Hanson, *Visualizing Quaternions*** — the Needham of quaternions; geometry-first, gorgeous.
- **Ken Shoemake, "Animating Rotation with Quaternion Curves" (1985)** — the short, readable paper that brought slerp to graphics.
- **3Blue1Brown & Ben Eater's interactive quaternion series** (eater.net/quaternions) — the best hands-on double-cover intuition on the internet.
- **Your own integrator** — port the page-4 loop to 50 lines of anything and make a cube tumble. Nothing teaches like the bug you cause yourself.

# outro

The questions below check the take-homes across all five pages, then the working-knowledge list is the "could you actually build it" tier — the page-4 simulator is the answer key to most of them.

:::takehome color=gold
:::major
- Five operations are the entire practical interface: **build, sandwich, chain, conjugate, integrate-and-normalize**.
- Quaternions win because they're **singularity-free** and compose by multiplication; the cost is one extra number and a normalize.
:::minor
- Angles at the edges (UI), quaternions in the middle (state), {{ω}} for the dynamics.
:::end
