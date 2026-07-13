# intro

The obvious way to store an orientation is three angles — yaw, pitch, roll. It's how we *talk* about orientation, so why not compute with it? Two reasons, one annoying and one fatal.

**The annoying one: order.** "Yaw 90°, then pitch 45°" and "pitch 45°, then yaw 90°" put you in **different orientations**. Try it with your phone: flat on the table, (a) spin it 90° about vertical then tip it up, versus (b) tip it up then spin about vertical. Different result. Any angle scheme has to pick an order convention, and every library picks a different one — an endless source of bugs. The demo below lets you feel this: apply two rotations to a cube in both orders and compare.

**The fatal one: gimbal lock.** Store orientation as three angles and there are configurations where two of your rotation axes **line up** — at pitch = 90°, yaw and roll become *the same motion*. You've got three knobs but only two directions of control, and near that configuration tiny orientation changes require huge, whipsawing angle changes. Interpolation and control go haywire. This isn't a software bug; it's baked into the geometry of the three-angle chart. (It nearly bit Apollo 13 — the real spacecraft had a physical gimbal with the same failure, and the astronauts had to steer around it.)

:::callout color=orange
The deep fact: the space of 3D orientations simply **cannot be covered by three numbers without singular points** — like how no flat map of Earth avoids distortion at some point. You need either patches-and-caution, or a smarter chart.
:::end

The smarter chart is the quaternion: **four** numbers with one constraint (unit length). The redundancy is the cure — the unit quaternions wrap around the space of rotations smoothly, with **no locked configurations anywhere**, and (bonus) rotations compose by simple multiplication instead of trig-heavy matrix stacking.

# outro

So the trade is: carry one extra number, keep it normalized, and in exchange rotation becomes **singularity-free algebra**. Angles remain fine as a *human interface* — read them out for display, accept them as input — but the moment orientations need to be composed, interpolated, or integrated through time, convert to quaternions and stay there.

:::takehome color=gold
:::major
- 3D rotations **don't commute** — the same two rotations in different order give different results.
- Any three-angle scheme has **gimbal lock**: configurations where two axes align and you lose a control direction. It's geometric, not a bug.
- Quaternions trade one extra number (4, unit-length) for **no singularities** and composition-by-multiplication.
:::minor
- Use angles at the edges (UI, display); use quaternions in the middle (state, math).
- The map-of-Earth analogy: three numbers can't chart orientation space without a bad point somewhere.
:::end
