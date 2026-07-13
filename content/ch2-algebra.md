# intro

Now the algebra — kept to exactly what the five operations need.

A quaternion {{q = w + xi + yj + zk}} has one real part and three imaginary units. Hamilton's whole rulebook fits in one line (he carved it into Dublin's Broom Bridge in 1843):

{{i² = j² = k² = ijk = −1}}

From that line follows the multiplication table you can explore below. The pattern worth memorizing is the **cycle** {{i → j → k → i}}:

- With the cycle: {{ij = k}}, {{jk = i}}, {{ki = j}}.
- Against the cycle: pick up a minus sign — {{ji = −k}}, {{kj = −i}}, {{ik = −j}}.

That sign flip is the algebra's way of encoding what your phone demonstrated on the last page: **order matters in 3D**. The non-commutativity isn't a defect to apologize for — it's the feature that lets four numbers faithfully represent rotations.

## The two other tools: conjugate and norm

The **conjugate** flips the imaginary parts: {{q* = w − xi − yj − zk}}. The **norm** is the ordinary 4D length: {{|q| = √(w² + x² + y² + z²)}}. They're linked by one tidy identity:

{{q ⊗ q* = |q|²}}

which gives the inverse for free: {{q⁻¹ = q*/|q|²}}. And for a **unit** quaternion ({{|q| = 1}}), that collapses to {{q⁻¹ = q*}} — inverting a rotation costs three sign flips. Compare that with inverting a matrix.

:::callout color=cyan
This is also *exactly* why "keep it normalized" is rule zero: the sandwich {{qvq*}} secretly multiplies by {{|q|²}}. Unit length ⇒ pure rotation. Length 1.01 ⇒ rotation *plus* 2% growth per application. Simulations die of compound interest.
:::end

# outro

For completeness, here is the full product of two general quaternions {{q₁ = (w₁, v₁)}} and {{q₂ = (w₂, v₂)}} written scalar-vector style (this is the one formula your code actually implements, and it contains the dot *and* cross product as parts):

{{q₁ ⊗ q₂ = ( w₁w₂ − v₁·v₂ ,  w₁v₂ + w₂v₁ + v₁×v₂ )}}

That {{v₁×v₂}} term is the non-commutative part — cross products flip sign when swapped, and now you know where {{ij = −ji}} lives in code.

:::takehome color=gold
:::major
- One rule generates everything: {{i² = j² = k² = ijk = −1}}, giving the cycle {{i→j→k→i}} (+ with it, − against it).
- Conjugate {{q*}} = flip imaginary signs; {{q ⊗ q* = |q|²}}; so for unit quaternions **the conjugate is the inverse**.
- The general product is {{(w₁w₂ − v₁·v₂, w₁v₂ + w₂v₁ + v₁×v₂)}} — the cross product term is why order matters.
:::minor
- Non-unit quaternions scale by {{|q|²}} in the sandwich — the algebraic root of drift bugs.
- Hamilton, 1843, Broom Bridge, graffiti — the only vandalism with its own plaque.
:::end
