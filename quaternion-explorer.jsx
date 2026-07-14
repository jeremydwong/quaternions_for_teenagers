import { useState, useEffect, useRef } from "react";
import Markdown from "./Markdown.jsx";
import { colors as COLORS, fonts } from "./theme.js";

import ch0Md from "./content/ch0-working-kit.md?raw";
import ch1Md from "./content/ch1-why-not-angles.md?raw";
import ch2Md from "./content/ch2-algebra.md?raw";
import ch3Md from "./content/ch3-rotation.md?raw";
import ch4Md from "./content/ch4-calculus.md?raw";
import ch5Md from "./content/ch5-capstone.md?raw";

// --- split a .md file into # intro / # outro ------------------------------
function splitMd(src) {
  const sections = { intro: "", outro: "" };
  const re = /^#\s+(\w+)\s*$/gim;
  const matches = [...src.matchAll(re)];
  if (matches.length === 0) { sections.intro = src.trim(); return sections; }
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const name = m[1].toLowerCase();
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : src.length;
    sections[name] = src.slice(start, end).trim();
  }
  return sections;
}

const CONTENT = {
  0: splitMd(ch0Md), 1: splitMd(ch1Md), 2: splitMd(ch2Md),
  3: splitMd(ch3Md), 4: splitMd(ch4Md), 5: splitMd(ch5Md),
};

// --- quaternion math ---------------------------------------------------------
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
function qmul(a, b) {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}
const qconj = (q) => [q[0], -q[1], -q[2], -q[3]];
const qnorm = (q) => Math.hypot(q[0], q[1], q[2], q[3]);
const qnormalize = (q) => { const n = qnorm(q) || 1; return q.map((c) => c / n); };
const qFromAxisAngle = (ax, deg) => {
  const th = (deg * Math.PI) / 180, s = Math.sin(th / 2);
  const n = Math.hypot(...ax) || 1;
  return [Math.cos(th / 2), (ax[0] / n) * s, (ax[1] / n) * s, (ax[2] / n) * s];
};
// Sandwich q v q* — deliberately NOT normalizing, so non-unit q visibly scales.
function rotateVec(q, v) {
  const p = [0, v[0], v[1], v[2]];
  const r = qmul(qmul(q, p), qconj(q));
  return [r[1], r[2], r[3]];
}

// --- cube geometry -----------------------------------------------------------
const CUBE_V = [];
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) CUBE_V.push([x, y, z]);
const CUBE_E = [];
for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
  const d = CUBE_V[a].reduce((s, c, i) => s + (c !== CUBE_V[b][i] ? 1 : 0), 0);
  if (d === 1) CUBE_E.push([a, b]);
}
const VIEW = (() => { const a = -0.5, s = Math.sin(a / 2); return [Math.cos(a / 2), s, 0.45 * s, 0]; })();

function CubeSVG({ q, size = 240, color = COLORS.cyan, scaleWarn = false }) {
  const scale = size * 0.19, cx = size / 2, cy = size / 2;
  const proj = CUBE_V.map((v) => {
    let p = rotateVec(q, v);
    p = rotateVec(VIEW, p);
    return { x: cx + p[0] * scale, y: cy - p[1] * scale, z: p[2] };
  });
  const edgeColor = scaleWarn ? COLORS.magenta : color;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, background: "#1e1f22", borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
      {CUBE_E.map(([a, b], i) => {
        const depth = (proj[a].z + proj[b].z) / 2;
        const op = 0.45 + 0.55 * ((depth + 1.8) / 3.6);
        return <line key={i} x1={proj[a].x} y1={proj[a].y} x2={proj[b].x} y2={proj[b].y} stroke={edgeColor} strokeWidth={2} opacity={Math.max(0.2, Math.min(1, op))} strokeLinecap="round" />;
      })}
      {proj.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.6} fill={COLORS.gold} opacity={Math.max(0.3, Math.min(1, 0.45 + 0.55 * ((p.z + 1.8) / 3.6)))} />)}
    </svg>
  );
}

// --- shared UI ----------------------------------------------------------------
function Slider({ label, value, onChange, min = -3, max = 3, step = 0.1, color = COLORS.cyan, fmt = (v) => v.toFixed(1) }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.muted, width: "100%", minWidth: 0, fontWeight: 400 }}>
      <span style={{ flex: "0 0 auto", color, fontFamily: fonts.mono, fontWeight: 700, fontSize: 12, minWidth: 44 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ flex: "1 1 0", minWidth: 0, color, accentColor: color }} />
      <span style={{ flex: "0 0 auto", width: 62, textAlign: "right", fontFamily: fonts.mono, fontSize: 12, color: COLORS.text }}>{fmt(value)}</span>
    </label>
  );
}

function MathBlock({ children, center = false }) {
  return (
    <div style={{
      background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8,
      padding: "12px 16px", fontFamily: fonts.mono, fontSize: 14.5, color: COLORS.gold,
      margin: "10px 0", overflowX: "auto", lineHeight: 1.7, textAlign: center ? "center" : "left",
    }}>{children}</div>
  );
}

function Widget({ kicker, children }) {
  return (
    <div style={{ margin: "22px 0", padding: "18px 18px 22px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14 }}>
      {kicker && <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, fontFamily: fonts.mono }}>{kicker}</div>}
      {children}
    </div>
  );
}

function PickRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
      {label && <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, minWidth: 60 }}>{label}</span>}
      {children}
    </div>
  );
}

function PickButton({ active, onClick, color = COLORS.cyan, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 13px", borderRadius: 9, cursor: "pointer", fontFamily: fonts.mono, fontWeight: 700, fontSize: 13,
      border: `1.5px solid ${active ? color : COLORS.border}`, textTransform: "none", letterSpacing: 0,
      background: active ? `${color}22` : COLORS.surfaceLight, color: active ? color : COLORS.text, transition: "all 0.15s",
    }}>{children}</button>
  );
}

function QReadout({ q, label = "q", warn = false }) {
  const n = qnorm(q);
  return (
    <MathBlock>
      <div>{label} = ({round(q[0])}, {round(q[1])}, {round(q[2])}, {round(q[3])})</div>
      <div style={{ color: warn ? COLORS.magenta : COLORS.muted, fontSize: 12, fontWeight: warn ? 700 : 400 }}>
        |{label}| = {round(n, 3)}{warn ? "  ← not unit! the sandwich now scales by |q|²" : ""}
      </div>
    </MathBlock>
  );
}

// --- quiz ----------------------------------------------------------------------
function Quiz({ kind, questions }) {
  const [open, setOpen] = useState({});
  const accent = kind === "working" ? COLORS.orange : COLORS.green;
  const title = kind === "working" ? "Working knowledge — try these to actually use it" : "Take-home check";
  const blurb = kind === "working"
    ? "These need pencil, paper, or an editor. They turn knowing-about into using."
    : "If you absorbed the take-homes, you can answer these. Reveal to check.";
  return (
    <div style={{ margin: "18px 0", padding: "16px 18px", borderRadius: 12, background: COLORS.surface, border: `1px solid ${accent}40` }}>
      <div style={{ fontSize: 12, color: accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, fontFamily: fonts.mono }}>
        {kind === "working" ? "⚙ " : "✓ "}{title}
      </div>
      <div style={{ fontSize: 13, color: COLORS.muted, margin: "6px 0 12px", fontStyle: "italic" }}>{blurb}</div>
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 12, listStyle: "decimal outside" }}>
        {questions.map((q, i) => (
          <li key={i} style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, marginBottom: 0 }}>
            <span style={{ fontFamily: fonts.mono }}>{q.q}</span>
            {q.a && (
              <div style={{ marginTop: 6 }}>
                <button onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                  style={{ fontSize: 11, fontFamily: fonts.mono, color: accent, background: "transparent", border: `1px solid ${accent}55`, borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>
                  {open[i] ? "Hide answer" : "Show answer"}
                </button>
                {open[i] && (
                  <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 8, background: `${accent}12`, border: `1px solid ${accent}33`, fontSize: 13.5, color: COLORS.text, lineHeight: 1.65, fontFamily: fonts.mono }}>
                    {q.a}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// =============================================================================
// CH0 — build a quaternion (the kit's rule 1)
// =============================================================================
const AXES = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1], "X+Y+Z": [1, 1, 1] };

function BuildDemo() {
  const [axisName, setAxisName] = useState("Y");
  const [angle, setAngle] = useState(60);
  const q = qFromAxisAngle(AXES[axisName], angle);
  return (
    <Widget kicker="Rule 1, live — build q = (cos θ/2, sin θ/2 · axis)">
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto" }}><CubeSVG q={q} /></div>
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <PickRow label="axis û:">
            {Object.keys(AXES).map((n) => <PickButton key={n} active={axisName === n} onClick={() => setAxisName(n)} color={COLORS.purple}>{n}</PickButton>)}
          </PickRow>
          <Slider label="θ" value={angle} onChange={setAngle} min={0} max={360} step={1} color={COLORS.cyan} fmt={(v) => `${Math.round(v)}°`} />
          <QReadout q={q} />
          <div style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.6 }}>
            Watch <b style={{ color: COLORS.text }}>w = cos(θ/2)</b> fall as θ grows, and the vector part rise along your axis.
            |q| stays exactly 1 — the recipe can't produce an invalid rotation.
          </div>
        </div>
      </div>
    </Widget>
  );
}

function Ch0() {
  return (
    <div>
      <Markdown src={CONTENT[0].intro} />
      <BuildDemo />
      <Markdown src={CONTENT[0].outro} />
      <Quiz kind="takehome" questions={[
        { q: "List the five operations of the working kit, one phrase each.", a: "1) Build q = (cos θ/2, sin θ/2·û). 2) Rotate by the sandwich v′ = qvq*. 3) Chain rotations by multiplying: q₂⊗q₁ (rightmost first). 4) Undo with the conjugate q*. 5) Simulate with q̇ = ½ q⊗(0,ω), integrate, then normalize." },
        { q: "Which two places does a factor of ½ (or half-angle) appear in the kit, and are they related?", a: "In the build formula (θ/2) and in the ODE q̇ = ½q⊗(0,ω). They're the same ½ — the ODE comes from building a tiny rotation Δq ≈ (1, ½ω·dt)." },
        { q: "Why must a rotation quaternion be unit length?", a: "The sandwich qvq* scales by |q|². Unit length ⇒ pure rotation; anything else rotates AND scales the object." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "Write the quaternion for a 180° rotation about the x-axis, then sandwich v = (0, 1, 0) by hand and confirm it flips to (0, −1, 0).", a: "q = (cos90°, sin90°·x̂) = (0,1,0,0) = i. Then qvq* = i·j·(−i) = k·(−i) = −(ki)·... working it through: i j (−i) = (ij)(−i) = k(−i) = −(ki) = −j. So v′ = −j = (0,−1,0). ✓" },
        { q: "Your renderer's cubes slowly inflate over minutes of simulation. Using the kit, name the bug and the one-line fix.", a: "The orientation quaternion is drifting off unit length (numerical integration), and the sandwich scales by |q|². Fix: renormalize q ← q/|q| every step (or at least periodically)." },
      ]} />
    </div>
  );
}

// =============================================================================
// CH1 — order matters (two cubes, both orders)
// =============================================================================
const ROT_CHOICES = [
  { name: "X 90°", ax: [1, 0, 0], deg: 90 },
  { name: "Y 90°", ax: [0, 1, 0], deg: 90 },
  { name: "Z 90°", ax: [0, 0, 1], deg: 90 },
  { name: "X 45°", ax: [1, 0, 0], deg: 45 },
];

function OrderDemo() {
  const [ia, setIa] = useState(0);
  const [ib, setIb] = useState(1);
  const A = ROT_CHOICES[ia], B = ROT_CHOICES[ib];
  const qA = qFromAxisAngle(A.ax, A.deg), qB = qFromAxisAngle(B.ax, B.deg);
  const qAB = qmul(qB, qA); // A first, then B
  const qBA = qmul(qA, qB); // B first, then A
  const same = ia === ib || qnorm(qAB.map((c, i) => c - qBA[i])) < 1e-9 || qnorm(qAB.map((c, i) => c + qBA[i])) < 1e-9;
  return (
    <Widget kicker="Feel the non-commutativity — same two rotations, both orders">
      <PickRow label="first:">
        {ROT_CHOICES.map((r, i) => <PickButton key={i} active={ia === i} onClick={() => setIa(i)} color={COLORS.cyan}>{r.name}</PickButton>)}
      </PickRow>
      <PickRow label="then:">
        {ROT_CHOICES.map((r, i) => <PickButton key={i} active={ib === i} onClick={() => setIb(i)} color={COLORS.magenta}>{r.name}</PickButton>)}
      </PickRow>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
        <div style={{ textAlign: "center" }}>
          <CubeSVG q={qAB} size={210} color={COLORS.cyan} />
          <div style={{ fontFamily: fonts.mono, fontSize: 12.5, color: COLORS.cyan, marginTop: 6 }}>{A.name} then {B.name}  (q_B ⊗ q_A)</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <CubeSVG q={qBA} size={210} color={COLORS.magenta} />
          <div style={{ fontFamily: fonts.mono, fontSize: 12.5, color: COLORS.magenta, marginTop: 6 }}>{B.name} then {A.name}  (q_A ⊗ q_B)</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6, color: same ? COLORS.muted : COLORS.text, textAlign: "center" }}>
        {same
          ? "These agree — rotations about the same axis (or with identity) do commute. Pick two different axes!"
          : <span><b style={{ color: COLORS.orange }}>Different results.</b> Same two rotations, opposite orders, different final orientation — this is the fact any honest orientation algebra must encode, and quaternions do it via q₂⊗q₁ ≠ q₁⊗q₂.</span>}
      </div>
    </Widget>
  );
}

function Ch1() {
  return (
    <div>
      <Markdown src={CONTENT[1].intro} />
      <OrderDemo />
      <Markdown src={CONTENT[1].outro} />
      <Quiz kind="takehome" questions={[
        { q: "What is gimbal lock, in one sentence, and why can't clever coding fix it within a three-angle scheme?", a: "It's the configuration where two of the three rotation axes align (e.g. at pitch 90°), collapsing three degrees of freedom to two — and it's unavoidable because no three-number chart of orientation space can be free of singular points (like flat maps of Earth)." },
        { q: "What do quaternions pay, and what do they buy, compared to Euler angles?", a: "Pay: one extra number plus the duty to keep it normalized. Buy: no singularities anywhere, composition by simple multiplication, and clean interpolation." },
        { q: "When are Euler angles still the right choice?", a: "At the edges — human interfaces, display readouts, artist-facing controls. Convert to quaternions for storage, composition, interpolation, and integration." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "With a physical object (phone, book): rotate 90° about vertical then 90° about a horizontal axis; repeat in the other order. Record both final orientations. Then verify with the demo above.", a: "The two experiments end in different orientations — matching the two cubes. (X 90° then Y 90° vs Y 90° then X 90° in the demo.)" },
        { q: "A drone controller stores yaw/pitch/roll and misbehaves in near-vertical climbs. Explain the failure mechanism and the standard fix.", a: "Near pitch = ±90° the yaw and roll axes align (gimbal lock); tiny orientation changes need huge, discontinuous yaw/roll swings, destabilizing control. Fix: keep the attitude state as a unit quaternion (integrate q̇ = ½q⊗ω) and only convert to angles for display." },
      ]} />
    </div>
  );
}

// =============================================================================
// CH2 — the algebra (multiplication table)
// =============================================================================
const QNAMES = ["1", "i", "j", "k"];
const QVEC = { "1": [1, 0, 0, 0], "i": [0, 1, 0, 0], "j": [0, 0, 1, 0], "k": [0, 0, 0, 1] };
function fmtBasis(v) {
  for (let idx = 0; idx < 4; idx++) if (Math.abs(v[idx]) > 0.5) return (v[idx] < 0 ? "−" : "") + QNAMES[idx];
  return "0";
}

function TableDemo() {
  const [left, setLeft] = useState("i");
  const [right, setRight] = useState("j");
  const prod = qmul(QVEC[left], QVEC[right]);
  const prodRev = qmul(QVEC[right], QVEC[left]);
  const noncommute = fmtBasis(prod) !== fmtBasis(prodRev) && left !== right && left !== "1" && right !== "1";
  return (
    <Widget kicker="Hamilton's table — with the cycle i→j→k→i, against it a minus sign">
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>left</div>
          <div style={{ display: "flex", gap: 6 }}>{QNAMES.map((n) => <PickButton key={n} active={left === n} onClick={() => setLeft(n)} color={COLORS.cyan}>{n}</PickButton>)}</div>
        </div>
        <div style={{ fontSize: 22, color: COLORS.muted, paddingBottom: 4 }}>⊗</div>
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>right</div>
          <div style={{ display: "flex", gap: 6 }}>{QNAMES.map((n) => <PickButton key={n} active={right === n} onClick={() => setRight(n)} color={COLORS.magenta}>{n}</PickButton>)}</div>
        </div>
        <div style={{ fontSize: 22, color: COLORS.muted, paddingBottom: 4 }}>=</div>
        <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, color: COLORS.gold, padding: "5px 16px", border: `1.5px solid ${COLORS.gold}`, borderRadius: 9, minWidth: 52, textAlign: "center" }}>{fmtBasis(prod)}</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: noncommute ? COLORS.orange : COLORS.muted, lineHeight: 1.6, fontFamily: fonts.mono }}>
        {noncommute
          ? `Swapped: ${right}⊗${left} = ${fmtBasis(prodRev)} — opposite sign. This sign IS 3D's order-dependence, in algebra form.`
          : "Try i⊗j, then j⊗i. Squares: any of i,j,k times itself gives −1."}
      </div>
    </Widget>
  );
}

function Ch2() {
  return (
    <div>
      <Markdown src={CONTENT[2].intro} />
      <TableDemo />
      <Markdown src={CONTENT[2].outro} />
      <Quiz kind="takehome" questions={[
        { q: "From i² = j² = k² = ijk = −1, state the products ij, jk, ki and their reverses.", a: "With the cycle: ij = k, jk = i, ki = j. Against it: ji = −k, kj = −i, ik = −j." },
        { q: "Define the conjugate and state the identity linking it to the norm. What does it give you for unit quaternions?", a: "q* flips the signs of the imaginary parts: (w, −x, −y, −z). Identity: q ⊗ q* = |q|². For |q| = 1 this means q⁻¹ = q* — the inverse is three sign flips." },
        { q: "In the scalar-vector product formula, which term carries the non-commutativity?", a: "The cross product v₁×v₂ in the vector part — it flips sign when the factors swap, which is exactly ij = −ji at the component level." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "Using only the one-line rule (and associativity), derive ij = k. Hint: start from ijk = −1 and multiply both sides on the right by k.", a: "ijk = −1 ⇒ (ij)k·k = −k ⇒ (ij)(k²) = −k ⇒ (ij)(−1) = −k ⇒ ij = k." },
        { q: "Show that q ⊗ q* = |q|² for q = w + xi + yj + zk (expand, or use the scalar-vector formula with v₂ = −v₁).", a: "Scalar-vector: (w, v)⊗(w, −v) = (w² − v·(−v), −wv + wv + v×(−v)) = (w² + |v|², 0). That's |q|² as a real number. ✓" },
        { q: "Implement qmul(a, b) in your language of choice from the scalar-vector formula, and unit-test it against ij = k and (2+i)⊗its-conjugate = 5.", a: "w = a.w*b.w − dot(a.v, b.v); v = a.w*b.v + b.w*a.v + cross(a.v, b.v). Tests: (0,1,0,0)⊗(0,0,1,0) = (0,0,0,1) = k; (2,1,0,0)⊗(2,−1,0,0) = (5,0,0,0) = |q|² = 4+1. ✓" },
      ]} />
    </div>
  );
}

// =============================================================================
// CH3 — rotation & the double cover
// =============================================================================
function DoubleCoverDemo() {
  const [axisName, setAxisName] = useState("Y");
  const [angle, setAngle] = useState(45);
  const q = qFromAxisAngle(AXES[axisName], angle);
  const near360 = Math.abs(angle - 360) < 6;
  const near720 = Math.abs(angle - 720) < 6;
  return (
    <Widget kicker="The sandwich at work — and the 720° surprise">
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto" }}><CubeSVG q={q} /></div>
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <PickRow label="axis û:">
            {Object.keys(AXES).map((n) => <PickButton key={n} active={axisName === n} onClick={() => setAxisName(n)} color={COLORS.purple}>{n}</PickButton>)}
          </PickRow>
          <Slider label="θ" value={angle} onChange={setAngle} min={0} max={720} step={1} color={COLORS.cyan} fmt={(v) => `${Math.round(v)}°`} />
          <PickRow label="jump:">
            <PickButton onClick={() => setAngle(360)} color={COLORS.gold}>θ = 360°</PickButton>
            <PickButton onClick={() => setAngle(720)} color={COLORS.green}>θ = 720°</PickButton>
          </PickRow>
          <QReadout q={q} />
          {near360 && (
            <div style={{ margin: "6px 0", padding: "8px 12px", borderRadius: 8, background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}55`, fontSize: 13, color: COLORS.gold, fontFamily: fonts.mono, fontWeight: 700 }}>
              ★ Cube: back to start. Quaternion: (−1, 0, 0, 0). Same rotation, opposite sign — the double cover.
            </div>
          )}
          {near720 && (
            <div style={{ margin: "6px 0", padding: "8px 12px", borderRadius: 8, background: `${COLORS.green}18`, border: `1px solid ${COLORS.green}55`, fontSize: 13, color: COLORS.green, fontFamily: fonts.mono, fontWeight: 700 }}>
              ★ Two full turns: q is truly home at (+1, 0, 0, 0).
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
}

function Ch3() {
  return (
    <div>
      <Markdown src={CONTENT[3].intro} />
      <DoubleCoverDemo />
      <Markdown src={CONTENT[3].outro} />
      <Quiz kind="takehome" questions={[
        { q: "Why does the build formula use θ/2 rather than θ?", a: "The sandwich qvq* applies q twice (once as q, once as q*), each contributing half the turn. Building with θ/2 makes the two halves add to a rotation of θ." },
        { q: "What are two sanity checks that q = (cos θ/2, sin θ/2·û) is always a valid rotation quaternion?", a: "At θ = 0 it's (1,0,0,0), the identity; and its norm is cos² + sin² = 1, automatically unit for any θ and unit axis." },
        { q: "State the double cover in one sentence, and its practical consequence for interpolation.", a: "q and −q represent the same rotation, and q returns to itself only after 720°. Consequence: before slerping between q_a and q_b, negate one if their dot product is negative, or the blend rotates the long way." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "Compute the quaternion for 90° about Z, apply it to v = (1, 0, 0) by sandwich, and confirm v′ = (0, 1, 0).", a: "q = (√2/2, 0, 0, √2/2). qvq* works out to (0,1,0): x̂ rotates to ŷ under +90° about Z. (Grind the two products or trust your qmul from page 2.)" },
        { q: "Show algebraically that −q performs the same rotation as q.", a: "(−q)v(−q)* = (−1)q v (−1)q* = (+1) qvq* — the two minus signs cancel in the sandwich." },
        { q: "Implement slerp(q_a, q_b, t) including the sign fix, and test t = 0, 1, 0.5 between 0° and 180° about Y.", a: "If dot(q_a,q_b) < 0, negate q_b. Ω = acos(dot); result = (sin((1−t)Ω)q_a + sin(tΩ)q_b)/sinΩ. t=0.5 between those endpoints gives 90° about Y: (√2/2, 0, √2/2, 0)." },
      ]} />
    </div>
  );
}

// =============================================================================
// CH4 — calculus & the simulator
// =============================================================================
function SimDemo() {
  const [q, setQ] = useState([1, 0, 0, 0]);
  const [wx, setWx] = useState(1.2);
  const [wy, setWy] = useState(2.0);
  const [wz, setWz] = useState(0.6);
  const [dt, setDt] = useState(0.05);
  const [normalize, setNormalize] = useState(true);
  const [running, setRunning] = useState(true);
  const [simT, setSimT] = useState(0);
  const stateRef = useRef({ q: [1, 0, 0, 0], t: 0 });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      let { q: cur, t } = stateRef.current;
      // q̇ = ½ q ⊗ (0, ω);   q ← q + q̇·Δt;   (optionally) q ← q/|q|
      const qdot = qmul(cur, [0, wx, wy, wz]).map((c) => 0.5 * c);
      let next = cur.map((c, i) => c + qdot[i] * dt);
      if (normalize) next = qnormalize(next);
      if (qnorm(next) > 3.5) { next = cur; }  // safety: stop inflating off-screen
      stateRef.current = { q: next, t: t + dt };
      setQ(next); setSimT(t + dt);
    }, 33);
    return () => clearInterval(id);
  }, [running, wx, wy, wz, dt, normalize]);

  const reset = () => { stateRef.current = { q: [1, 0, 0, 0], t: 0 }; setQ([1, 0, 0, 0]); setSimT(0); };
  const n = qnorm(q);
  const drifting = Math.abs(n - 1) > 0.02;
  const exploded = n > 3.4;

  return (
    <Widget kicker="The integrator, live:  q̇ = ½ q ⊗ (0, ω)  →  step  →  (normalize?)">
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto" }}>
          <CubeSVG q={q} size={250} scaleWarn={drifting} />
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: COLORS.muted, marginTop: 6, textAlign: "center" }}>
            sim time: {simT.toFixed(1)} s
          </div>
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, marginBottom: 4 }}>Angular velocity ω (rad/s, body frame)</div>
          <Slider label="ωx" value={wx} onChange={setWx} min={-3} max={3} color={COLORS.cyan} />
          <Slider label="ωy" value={wy} onChange={setWy} min={-3} max={3} color={COLORS.magenta} />
          <Slider label="ωz" value={wz} onChange={setWz} min={-3} max={3} color={COLORS.gold} />
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700, margin: "10px 0 4px" }}>Integrator</div>
          <Slider label="Δt" value={dt} onChange={setDt} min={0.01} max={0.3} step={0.01} color={COLORS.orange} fmt={(v) => `${v.toFixed(2)} s`} />
          <PickRow label="">
            <PickButton active={running} onClick={() => setRunning((r) => !r)} color={COLORS.green}>{running ? "⏸ pause" : "▶ run"}</PickButton>
            <PickButton active={normalize} onClick={() => setNormalize((v) => !v)} color={normalize ? COLORS.green : COLORS.magenta}>
              normalize: {normalize ? "ON" : "OFF"}
            </PickButton>
            <PickButton onClick={reset} color={COLORS.blue}>↺ reset</PickButton>
          </PickRow>
          <QReadout q={q} warn={drifting} />
          {exploded && (
            <div style={{ margin: "6px 0", padding: "8px 12px", borderRadius: 8, background: `${COLORS.magenta}18`, border: `1px solid ${COLORS.magenta}66`, fontSize: 13, color: COLORS.magenta, fontFamily: fonts.mono, fontWeight: 700 }}>
              ☠ |q| blew past 3.4 — growth capped so the cube stays on screen. Turn normalize back ON and reset.
            </div>
          )}
          {!normalize && !exploded && (
            <div style={{ fontSize: 12.5, color: COLORS.orange, lineHeight: 1.55 }}>
              Normalize is off: every Euler step leaves the unit sphere slightly, |q| compounds upward, and the sandwich scales the cube by |q|². Crank Δt to fail faster.
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
}

function Ch4() {
  return (
    <div>
      <Markdown src={CONTENT[4].intro} />
      <SimDemo />
      <Markdown src={CONTENT[4].outro} />
      <Quiz kind="takehome" questions={[
        { q: "Write the orientation ODE for body-frame angular velocity, and describe each symbol.", a: "q̇ = ½ · q ⊗ (0, ω). q is the unit orientation quaternion, ω = (ωx, ωy, ωz) is angular velocity in rad/s expressed in the body frame, (0, ω) promotes it to a quaternion, ⊗ is quaternion multiplication." },
        { q: "Where does the ½ in the ODE come from?", a: "From the half-angle in the build formula: a tiny rotation over dt is Δq ≈ (cos(|ω|dt/2), sin(|ω|dt/2)·ω̂) ≈ (1, ½ω·dt). Chaining q⊗Δq and taking the limit leaves the ½." },
        { q: "State the three-line integrator loop, and what goes physically wrong if the third line is omitted.", a: "1) q̇ = ½ q⊗(0,ω); 2) q ← q + q̇Δt; 3) q ← q/|q|. Without (3), Euler steps move along the tangent, |q| drifts above 1, and since the sandwich scales by |q|², simulated objects visibly grow (and orientation accuracy degrades)." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "For pure spin about Z at ω rad/s, solve the ODE in closed form and check it matches the build formula.", a: "q(t) = q(0) ⊗ (cos(ωt/2), 0, 0, sin(ωt/2)) — exactly the axis-angle build with θ = ωt about ẑ. (The ODE's solution is the exponential; for a fixed axis it's this circle in the (w, z) plane.)" },
        { q: "One Euler step from q = (1,0,0,0) with ω = (0, 0, 2) and Δt = 0.1: compute q_new and |q_new| before normalizing.", a: "q̇ = ½(1,0,0,0)⊗(0,0,0,2) = (0,0,0,1). q_new = (1, 0, 0, 0.1); |q_new| = √1.01 ≈ 1.005 — already 0.5% off the sphere in one step." },
        { q: "Write the 'exact step' alternative to Euler and say why it doesn't drift.", a: "q ← q ⊗ (cos(|ω|Δt/2), sin(|ω|Δt/2)·ω̂). It's a product of two unit quaternions, so it stays unit by construction (up to floating-point roundoff) — no tangent-line leakage." },
        { q: "Port the demo's loop to real code: 60 FPS, ω from user input, render the matrix from q. What do you convert, and when?", a: "Keep state as q. Each frame: integrate (Euler or exact step) with Δt = 1/60, normalize, then convert q → 3×3 rotation matrix (or pass q straight to the shader/engine) only for rendering. Angles, if shown in UI, are derived at the end — never stored." },
      ]} />
    </div>
  );
}

// =============================================================================
// CH5 — capstone
// =============================================================================
function Ch5() {
  return (
    <div>
      <Markdown src={CONTENT[5].intro} />
      <Markdown src={CONTENT[5].outro} />
      <Quiz kind="takehome" questions={[
        { q: "From memory: the five operations, with formulas.", a: "Build q = (cos θ/2, sin θ/2·û). Rotate v′ = qvq*. Chain q₂⊗q₁. Undo q* (= q⁻¹ for unit q). Simulate q̇ = ½q⊗(0,ω), step, normalize." },
        { q: "Why four numbers instead of three, in one sentence?", a: "Three-number charts of orientation space necessarily have singular points (gimbal lock); four numbers with a unit constraint cover it smoothly everywhere." },
        { q: "What's the double cover, and name one practical and one physical place it shows up.", a: "q and −q give the same rotation (720° to return). Practical: sign-matching before slerp. Physical: spin-½ particles like electrons." },
      ]} />
      <Quiz kind="working" questions={[
        { q: "Build a minimal quaternion library — qmul, qconj, qnormalize, qFromAxisAngle, rotateVec, slerp — with unit tests from this site's examples.", a: "Tests to hit: ij=k, ji=−k, q⊗q* = |q|²; 90°-about-Z sends x̂→ŷ; θ=360° gives q=−1 but identical rotation; one Euler step with ω=(0,0,2), Δt=0.1 gives |q|≈1.005 before normalize." },
        { q: "Simulate a torque-free tumbling body: couple q̇ = ½q⊗(0,ω) with Euler's equations Iω̇ = −ω×(Iω) for unequal inertias, and look for the tennis-racket (intermediate-axis) instability.", a: "Integrate both ODEs together (RK4 recommended). With I = diag(1, 2, 3) and spin nearly about the middle axis plus a tiny perturbation, the body periodically flips — the Dzhanibekov effect. The quaternion happily tracks orientation straight through configurations that would gimbal-lock an Euler-angle integrator." },
      ]} />
    </div>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================
const btnStyle = {
  padding: "10px 18px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
  background: COLORS.surfaceLight, color: COLORS.text, fontFamily: "inherit",
  fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: ".05rem",
};

const chapterData = [
  { num: 0, title: "The Working Kit", component: Ch0, color: COLORS.cyan },
  { num: 1, title: "Why Not Three Angles?", component: Ch1, color: COLORS.orange },
  { num: 2, title: "The Algebra You Need", component: Ch2, color: COLORS.magenta },
  { num: 3, title: "Rotation & the 720°", component: Ch3, color: COLORS.purple },
  { num: 4, title: "Calculus for Simulation", component: Ch4, color: COLORS.gold },
  { num: 5, title: "Capstone", component: Ch5, color: COLORS.green },
];

export default function QuaternionExplorer() {
  const [chapter, setChapter] = useState(0);
  const [light, setLight] = useState(false);
  const ch = chapterData[chapter];
  const Comp = ch.component;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [chapter]);
  useEffect(() => { document.body.classList.toggle("light-mode", light); }, [light]);

  return (
    <div style={{ minHeight: "100vh", color: COLORS.text }}>
      <style>{`button:hover { filter: brightness(1.12); }`}</style>

      {/* Sticky nav on top, toggle pinned at its right end — mirrors the fixed
          navbar on jeremydwong.github.io. The title sits BELOW it, in .app-body. */}
      <nav className="site-navbar">
        <div className="nav-scroll">
          {chapterData.map((c, i) => (
            <button key={i} className={i === chapter ? "active" : ""} onClick={() => setChapter(i)}
              style={{ borderBottom: `3px solid ${i === chapter ? "#33C3F0" : "transparent"}` }}>
              {c.num}. {c.title}
            </button>
          ))}
        </div>
        <div className="toggle-container">
          <input id="theme-toggle" type="checkbox" checked={light} onChange={(e) => setLight(e.target.checked)} />
          <label htmlFor="theme-toggle" aria-label="Toggle light mode" />
        </div>
      </nav>

      {/* Content region — the only part that flips in light mode (keeps the
          blue navbar + yellow toggle true, and keeps the navbar sticky). */}
      <div className="app-body">
        <header style={{
          padding: "26px 24px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface,
        }}>
          <h1 className="docs-header" style={{ color: COLORS.text, fontSize: "2rem", margin: 0 }}>
            Quaternions <span style={{ color: COLORS.cyan }}>for Simulation</span>
          </h1>
          <div style={{ fontSize: 13.5, color: COLORS.muted, marginTop: 4 }}>
            the five operations you need to rotate things — and the one equation to simulate them
          </div>
        </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "26px 20px 52px" }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: ch.color, fontFamily: fonts.mono, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
            Page {ch.num}
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: COLORS.text, marginTop: 2, letterSpacing: ".05rem" }}>{ch.title}</h2>
        </div>
        <Comp />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setChapter(Math.max(0, chapter - 1))} disabled={chapter === 0} style={{ ...btnStyle, opacity: chapter === 0 ? 0.3 : 1 }}>← Previous</button>
          <button onClick={() => setChapter(Math.min(chapterData.length - 1, chapter + 1))} disabled={chapter === chapterData.length - 1}
            style={{ ...btnStyle, opacity: chapter === chapterData.length - 1 ? 0.3 : 1, background: ch.color + "22", borderColor: ch.color + "55", color: ch.color }}>Next →</button>
        </div>
      </main>
      </div>
    </div>
  );
}
