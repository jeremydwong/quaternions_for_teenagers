# intro

Time to see the two star operations actually rotate something: **build** and **sandwich**.

**Build:** {{q = (cos(θ/2), sin(θ/2)·û)}}. Two sanity checks that make the formula trustworthy: at {{θ = 0}} it gives {{q = (1, 0, 0, 0)}} — the quaternion "1," which rotates nothing. And its length is {{cos²(θ/2) + sin²(θ/2) = 1}} — automatically unit. So the recipe always hands you a valid rotation.

**Sandwich:** {{v′ = q v q*}}. Why *two* multiplications? A one-sided product {{q·v}} would drag the vector partly into the scalar slot — it mixes the 4 dimensions. The sandwich's second, conjugated factor cancels the scalar leakage exactly, leaving a pure 3-vector out — and each factor contributes **half the turn**. That's the honest origin of the half-angle: build with {{θ/2}} because the vector gets hit twice.

:::callout color=purple
Play with the cube: pick an axis, drag the angle, and watch {{q}}'s four numbers. Notice {{w = cos(θ/2)}} falling as the angle grows, and the vector part growing along your chosen axis.
:::end

## The famous 720°

Drag the angle to {{360°}} and look at the readout: the cube is back where it started, but the quaternion reads {{(−1, 0, 0, 0)}} — **negative** one. It takes {{720°}} for {{q}} itself to return to {{(+1, 0, 0, 0)}}.

Both {{q}} and {{−q}} produce the *same* rotation (the sandwich uses q twice, so the signs cancel), so no harm done — but the sign is real state. This "two quaternions per rotation" is called the **double cover**, and it's not a quirk to shrug off: electrons track exactly this sign (spin-½), and your game engine's slerp code checks it (if two quaternions have negative dot product, negate one before interpolating, or the blend takes the long way around).

# outro

Practical footnote on **interpolation**, since it's the fifth-and-a-halfth operation everyone eventually needs: to blend smoothly from orientation {{q_a}} to {{q_b}}, interpolate *on the unit sphere* — **slerp** — rather than lerping the four numbers (which cuts a chord through the sphere and wobbles the speed). Cheap version: lerp then normalize ("nlerp") — fine for small angles, and most engines use it per-frame.

:::takehome color=gold
:::major
- Build: {{q = (cos(θ/2), sin(θ/2)·û)}} — automatically unit, identity at {{θ = 0}}.
- Sandwich {{qvq*}}: two half-turns, one from each factor — that's **why** the half-angle exists.
- {{q}} and {{−q}} are the same rotation; {{q}} returns to itself only after **720°** (the double cover).
:::minor
- Slerp for smooth blends; nlerp (lerp + normalize) is the cheap workhorse; flip one endpoint's sign if their dot product is negative.
- The double cover is physical: it's the mathematics of spin-½ particles.
:::end
