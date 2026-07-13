# intro

This is the page the whole site exists for. If you simulate anything that tumbles — a rigid body, a drone, a satellite, a ragdoll limb — you need orientation as a function of time, and that means **quaternion calculus**. The good news: it's one equation.

## Angular velocity, then the equation

A spinning body's state of spin is the vector {{ω}} (omega): its direction is the spin axis, its length is the spin rate in radians per second. Your physics engine hands you {{ω}} (from torques via {{Iω̇ = τ − ω×Iω}}); your gyroscope literally measures it. The question is: given {{ω}}, how does the orientation quaternion {{q(t)}} change?

{{q̇ = ½ · q ⊗ (0, ω)}}

(with {{ω}} in **body** frame; for world-frame {{ω}} it's {{q̇ = ½ (0, ω) ⊗ q}} — same idea, other side).

Where does it come from? Over a tiny time {{dt}}, the body turns by the tiny angle {{|ω|dt}} about axis {{ω̂}}. Build that with the page-3 recipe, half-angle and all: {{Δq ≈ (1, ½ω·dt)}} — for small angles, {{cos ≈ 1}} and {{sin(x) ≈ x}}, and there's the {{½}} straight from the half-angle. Chaining it (rule 3, on the correct side) gives {{q(t+dt) = q ⊗ Δq ≈ q + ½ q⊗(0,ω)·dt}}. Subtract, divide by {{dt}} — done. **The ½ in the ODE is the same ½ as the half-angle.**

## The integrator loop

Turn the ODE into code and you have the heartbeat of every 3D physics engine (Euler integration shown; RK4 is the same idea four times):

- {{q̇ = ½ · q ⊗ (0, ωₓ, ω_y, ω_z)}}
- {{q ← q + q̇ · Δt}}
- {{q ← q / |q|}}   ← **the step everyone forgets**

Why normalize *every step*? The true solution stays on the unit sphere, but the Euler step moves along the **tangent** — always slightly *off* the sphere, always outward. Each step, {{|q|}} creeps above 1. And page 2 told you the price: the sandwich scales by {{|q|²}}, so your object doesn't just rotate, it **grows**. Slowly, then all at once.

:::callout color=magenta
The simulator below runs this exact loop. Set it spinning, then switch **normalize off** and watch {{|q|}} drift and the cube inflate — then turn it back on. Crank {{Δt}} to make the failure fast. This is the most instructive bug in 3D graphics, and now you get to cause it on purpose.
:::end

# outro

That's genuinely all of it. Orientation state = one unit quaternion. Each frame: form {{½ q⊗(0,ω)}}, step, normalize. Everything else in rigid-body simulation (torques, inertia, constraints) happens on the {{ω}} side in ordinary vector land — the quaternion only ever integrates and normalizes.

Two closing pro-tips from the trenches:

- **Bigger steps, done properly:** instead of the Euler step you can apply the *exact* rotation for the frame: {{q ← q ⊗ (cos(|ω|Δt/2), sin(|ω|Δt/2)·ω̂)}} — build-and-multiply, rules 1 + 3. Stays unit by construction (up to roundoff); this is what careful engines do.
- **Sensors love it too:** drone/phone attitude filters (Madgwick, Mahony, Kalman) are all "integrate gyro {{ω}} through {{q̇ = ½q⊗ω}}, nudge with accelerometer/magnetometer." Same equation, all the way down.

:::takehome color=gold
:::major
- The one ODE of orientation: {{q̇ = ½ · q ⊗ (0, ω)}} (body-frame {{ω}}; flip the product order for world frame).
- Its {{½}} **is** the half-angle: it comes from {{Δq ≈ (1, ½ω·dt)}} for a small rotation.
- The loop: step {{q ← q + q̇Δt}}, then **normalize** — Euler steps leave the unit sphere, and {{|q| ≠ 1}} makes the sandwich *scale* objects by {{|q|²}}.
:::minor
- Exact alternative: multiply by the built quaternion {{(cos(|ω|Δt/2), sin(|ω|Δt/2)·ω̂)}} each frame.
- The same equation runs drone attitude filters — gyros output {{ω}}, quaternions integrate it.
:::end
