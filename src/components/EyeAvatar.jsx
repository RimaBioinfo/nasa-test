import { useState, useRef } from "react";

/* =========================================================
   EYE AVATAR – SANS monitoring (2D cross-section + OCT zoom)
   Every anatomical part is its own <g data-part="id">.
   Pass states like { "optic-disc": "alert", choroid: "warning" }
   and the matching part glows. States: normal | warning | alert
   ========================================================= */

/* ---------- geometry helpers (eye centred at CX,CY) ---------- */
const CX = 380, CY = 300;
const rad = (d) => (d * Math.PI) / 180;
const P = (r, a) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
const pt = (r, a) => P(r, a).map((n) => n.toFixed(1)).join(",");
// annular sector between radii r1<r2 and angles a1<a2 (0° = back of eye)
const band = (r1, r2, a1, a2) =>
  `M${pt(r2, a1)} A${r2},${r2} 0 0 1 ${pt(r2, a2)} L${pt(r1, a2)} A${r1},${r1} 0 0 0 ${pt(r1, a1)} Z`;
// ring around the back of the eye with a gap where the optic nerve exits
const ring = (r1, r2, a, gap) => `${band(r1, r2, -a, -gap)} ${band(r1, r2, gap, a)}`;
const arc = (r, a1, a2) => `M${pt(r, a1)} A${r},${r} 0 0 ${a2 > a1 ? 1 : 0} ${pt(r, a2)}`;
const Hit = ({ d }) => <path className="hit" d={d} fill="none" stroke="transparent" strokeWidth="12" />;

/* ---------- LEVEL 1: whole eye + connection to the brain ---------- */
const EYE_PARTS = [
  // --- background structures behind the eye
  { id: "intracranial", name: "Brain and CSF space", group: "Optic nerve and sheath", sans: true,
    info: "Intracranial pressure (ICP) pushes CSF down the optic nerve sheath. The headward fluid shift in microgravity is the leading SANS theory.",
    render: () => <rect x="905" y="190" width="110" height="220" rx="20" fill="#22324A" stroke="#3A506E" strokeWidth="1.5" /> },
  { id: "dura", name: "Dura mater (nerve sheath)", group: "Optic nerve and sheath",
    info: "Tough outer sheath, continuous with the sclera. Its diameter (ONSD) can be measured by ultrasound in flight.",
    render: () => <path d="M566,262 H905 V270 H566 Z M566,330 H905 V338 H566 Z" fill="#CDBFA6" /> },
  { id: "arachnoid", name: "Arachnoid mater", group: "Optic nerve and sheath",
    info: "Thin middle sheath layer that encloses the CSF space around the nerve.",
    render: () => <path d="M566,270 H905 V272 H566 Z M566,328 H905 V330 H566 Z" fill="#AFC0D2" /> },
  { id: "csf", name: "Subarachnoid space (CSF)", group: "Optic nerve and sheath", sans: true,
    info: "CSF surrounding the optic nerve. In SANS this space distends and presses on the back of the eye.",
    render: () => <path d="M566,272 H905 V280 H566 Z M566,320 H905 V328 H566 Z" fill="#6FB9DC" fillOpacity="0.75" /> },
  { id: "pia", name: "Pia mater", group: "Optic nerve and sheath",
    info: "Delicate inner sheath bonded to the nerve; carries small vessels into it.",
    render: () => <path d="M566,280 H905 V282 H566 Z M566,318 H905 V320 H566 Z" fill="#C9A98A" /> },
  { id: "optic-nerve", name: "Optic nerve", group: "Optic nerve and sheath", sans: true,
    info: "Carries about 1.2 million nerve fibres from the retina to the brain. Nerve kinking and sheath distension are seen after long flights.",
    render: () => (<>
      <rect x="548" y="282" width="357" height="36" fill="url(#gNerve)" />
      <path d="M578,288 H905 M578,312 H905" fill="none" stroke="#CDBB93" strokeWidth="0.8" />
    </>) },

  // --- eye wall (outer to inner)
  { id: "episclera", name: "Episclera", group: "Eye wall",
    info: "Thin vascular layer on the outer sclera, linking it to the surrounding orbit.",
    render: () => <path d={ring(200, 204, 148, 10)} fill="#D6C7B2" /> },
  { id: "sclera", name: "Sclera", group: "Eye wall", sans: true,
    info: "The white outer wall. Posterior globe flattening, seen on MRI and ultrasound, is a hallmark SANS sign and causes a hyperopic shift.",
    render: () => <path d={ring(186, 200, 150, 5.5)} fill="url(#gSclera)" /> },
  { id: "suprachoroid", name: "Suprachoroidal space", group: "Eye wall",
    info: "Potential space between choroid and sclera where fluid can collect.",
    render: () => <path d={ring(183, 186, 138, 6)} fill="#4A2228" /> },
  { id: "choroid", name: "Choroid", group: "Eye wall", sans: true, oct: true,
    info: "Dense vascular bed feeding the outer retina. It thickens in microgravity, and choroidal folds are a key SANS finding.",
    render: () => <path d={ring(172, 183, 138, 6)} fill="url(#gChoroid)" /> },
  { id: "retina", name: "Retina", group: "Eye wall", sans: true, oct: true,
    info: "Light-sensitive inner layer. Open the retina layers view to see each layer as it appears on OCT.",
    render: () => <path d={ring(162, 172, 122, 6)} fill="#E39C8E" /> },
  { id: "vitreous", name: "Vitreous body", group: "Front of the eye",
    info: "Clear gel that fills the eye and holds the retina in place.",
    render: () => <circle cx={CX} cy={CY} r="161.5" fill="url(#gVit)" clipPath="url(#vitClip)" /> },

  // --- retina landmarks + nerve head
  { id: "lamina-cribrosa", name: "Lamina cribrosa", group: "Optic nerve and sheath", sans: true,
    info: "Mesh where nerve fibres leave the eye. Eye pressure pushes on one side and CSF pressure on the other; this translaminar pressure gradient is central to SANS theories.",
    render: () => (<>
      <rect x="565" y="282" width="13" height="36" fill="#F1E5D0" />
      <path d="M565,288 L578,294 M565,296 L578,302 M565,304 L578,310 M565,312 L578,318 M565,294 L578,288 M565,302 L578,296 M565,310 L578,304" fill="none" stroke="#B89E78" strokeWidth="0.8" />
    </>) },
  { id: "optic-disc", name: "Optic disc", group: "Retina landmarks", sans: true,
    info: "Where the nerve fibres exit the eye. Optic disc edema (graded on the Frisén scale) is the signature finding of SANS.",
    render: () => <path d={`M${pt(183, -6)} L${pt(162, -6)} Q526,300 ${pt(162, 6)} L${pt(183, 6)} Z`} fill="#F0BF8C" /> },
  { id: "optic-cup", name: "Optic cup", group: "Retina landmarks",
    info: "Central dip in the disc. It shrinks as the disc swells.",
    render: () => <ellipse cx="538" cy="300" rx="4.5" ry="7" fill="#FBE5C4" /> },
  { id: "macula", name: "Macula", group: "Retina landmarks", sans: true,
    info: "Central retina for sharp vision. Retinal and choroidal folds often cross this area.",
    render: () => <path d={band(162, 172, 12, 30)} fill="#E7B25B" /> },
  { id: "fovea", name: "Fovea", group: "Retina landmarks",
    info: "Pit at the centre of the macula with the highest cone density, where detailed vision happens.",
    render: () => { const [x, y] = P(163.5, 21); return <circle cx={x} cy={y} r="5" fill="#A8722A" />; } },

  // --- front of the eye
  { id: "anterior-chamber", name: "Anterior chamber (aqueous)", group: "Front of the eye",
    info: "Aqueous humour nourishes the cornea and lens and sets the eye pressure (IOP).",
    render: () => <path d="M212,203 A150,150 0 0 0 212,397 L226,390 L232,330 L232,270 L226,210 Z" fill="#9FD0E6" fillOpacity="0.35" /> },
  { id: "cornea", name: "Cornea", group: "Front of the eye",
    info: "Clear front window that does most of the eye's focusing.",
    render: () => <path d="M206.8,200 A154,154 0 0 0 206.8,400 L212,397 A150,150 0 0 1 212,203 Z" fill="#BFE6F4" fillOpacity="0.9" /> },
  { id: "iris", name: "Iris", group: "Front of the eye",
    info: "Muscle ring that sets the size of the pupil.",
    render: () => <path d="M214,206 L230,214 L236,272 L229,272 Z M214,394 L230,386 L236,328 L229,328 Z" fill="#6B4A3A" /> },
  { id: "lens", name: "Lens", group: "Front of the eye",
    info: "Fine-tunes focus. Globe flattening shortens the eye, shifting focus; astronauts carry adjustable-focus glasses for this.",
    render: () => <ellipse cx="262" cy="300" rx="24" ry="56" fill="url(#gLens)" /> },
  { id: "ciliary-body", name: "Ciliary body and zonules", group: "Front of the eye",
    info: "Produces aqueous humour and changes the lens shape for near focus.",
    render: () => (<>
      <path d="M219,207 L251,166 Q262,200 256,232 Q240,226 228,214 Z M219,393 L251,434 Q262,400 256,368 Q240,374 228,386 Z" fill="#8A4B4B" />
      <path d="M256,232 L262,244 M250,229 L257,245 M256,368 L262,356 M250,371 L257,355" fill="none" stroke="#D9C2B0" strokeWidth="0.8" />
    </>) },
  { id: "trabecular-meshwork", name: "Trabecular meshwork", group: "Fluid drainage",
    info: "Filter that drains aqueous humour; its resistance sets the eye pressure.",
    render: () => <path d="M212,208 L220,207 L215,213 Z M212,392 L220,393 L215,387 Z" fill="#E8D7A8" /> },
  { id: "schlemm", name: "Schlemm's canal", group: "Fluid drainage",
    info: "Collects aqueous humour and returns it to the veins. Higher venous pressure in space can slow this outflow.",
    render: () => <path d="M206.5,204 a3.5,2.2 0 1,0 7,0 a3.5,2.2 0 1,0 -7,0 M206.5,396 a3.5,2.2 0 1,0 7,0 a3.5,2.2 0 1,0 -7,0" fill="#5C8FE0" /> },

  // --- blood supply and drainage
  { id: "ophthalmic-artery", name: "Ophthalmic artery", group: "Blood supply",
    info: "Main arterial supply of the eye, branching from the internal carotid artery.",
    render: () => { const d = "M1000,500 C930,505 860,500 790,490 C750,485 720,484 700,480"; return <><path d={d} fill="none" stroke="#D23B3B" strokeWidth="4" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "posterior-ciliary-arteries", name: "Posterior ciliary arteries", group: "Blood supply",
    info: "Pierce the sclera around the nerve to feed the choroid and the optic nerve head.",
    render: () => { const d = `M770,489 C700,470 610,420 ${pt(186, 16)} M735,485 C660,480 590,450 ${pt(186, 30)}`; return <><path d={d} fill="none" stroke="#D84A4A" strokeWidth="2" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "central-retinal-artery", name: "Central retinal artery", group: "Blood supply",
    info: "Runs inside the optic nerve and feeds the inner retina.",
    render: () => { const d = `M700,480 C700,420 690,330 676,296 L540,296 L${pt(160, -6)} ${arc(160, -6, -62)} M540,296 L${pt(160, 6)} ${arc(160, 6, 62)}`; return <><path d={d} fill="none" stroke="#E04848" strokeWidth="2" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "central-retinal-vein", name: "Central retinal vein", group: "Blood supply", sans: true,
    info: "Drains the retina back through the nerve. Venous congestion from the headward fluid shift may add to disc edema.",
    render: () => { const d = `M538,304 L676,304 C690,300 712,250 728,205 C742,165 760,120 792,96 M538,304 L${pt(157, -8)} ${arc(157, -8, -54)} M538,304 L${pt(157, 8)} ${arc(157, 8, 54)}`; return <><path d={d} fill="none" stroke="#4A78DC" strokeWidth="2.2" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "vortex-veins", name: "Vortex veins", group: "Blood supply", sans: true,
    info: "Drain the choroid out through the sclera. Higher venous pressure here may explain choroidal thickening.",
    render: () => { const d = `M${pt(176, -70)} L${pt(232, -70)} M${pt(176, 70)} L${pt(232, 70)} C480,560 540,575 610,585`; return <><path d={d} fill="none" stroke="#3D6FD6" strokeWidth="3" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "superior-ophthalmic-vein", name: "Superior ophthalmic vein", group: "Blood supply",
    info: "Carries blood from the eye back to the cavernous sinus.",
    render: () => { const d = `M${pt(232, -70)} C540,40 690,55 790,92 C830,106 855,110 878,110`; return <><path d={d} fill="none" stroke="#3D6FD6" strokeWidth="4" strokeLinecap="round" /><Hit d={d} /></>; } },
  { id: "cavernous-sinus", name: "Cavernous sinus", group: "Blood supply",
    info: "Venous chamber behind the eyes. The headward fluid shift raises pressure here.",
    render: () => <ellipse cx="925" cy="110" rx="48" ry="26" fill="#34539A" /> },

  // --- fluid drainage
  { id: "glymphatic", name: "Glymphatic and lymphatic outflow", group: "Fluid drainage", sans: true,
    info: "Proposed route where fluid leaves along the optic nerve to the dural lymphatics and neck lymph nodes. Impaired outflow in microgravity is a leading SANS hypothesis.",
    render: () => { const d = "M548,289 L770,289 C790,289 800,300 800,320 L800,345 C800,420 830,500 868,546 M600,334 L800,334"; return <><path className="flow" d={d} fill="none" stroke="#49D6A0" strokeWidth="2" strokeDasharray="6 5" /><Hit d={d} /></>; } },
  { id: "lymph-nodes", name: "Cervical lymph nodes", group: "Fluid drainage",
    info: "End point of lymphatic drainage from the eye and the optic nerve sheath.",
    render: () => <path d="M868,556 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0 M894,570 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 M859,575 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0" fill="#2F9E78" /> },
].map((p) => ({ ...p, view: "eye" }));

const EYE_LABELS = [
  { x: 40, y: 296, t: "Light enters" },
  { x: 960, y: 238, t: "Brain", a: "middle" },
  { x: 925, y: 152, t: "Cavernous sinus", a: "middle" },
  { x: 990, y: 486, t: "From carotid", a: "end" },
  { x: 880, y: 596, t: "Neck lymph nodes", a: "middle" },
];

/* ---------- LEVEL 2: OCT-style retina layers (bottom → top) ---------- */
const OCT_LAYERS = [
  { id: "oct-episclera", name: "Episclera", group: "Outer wall", t: [8, 8], c: "#5E6977", info: "Thin outer covering of the sclera." },
  { id: "scleral-stroma", name: "Scleral stroma", group: "Outer wall", t: [46, 46], c: "#8D99A7", sans: true, info: "Dense collagen bundles and fibrocytes. Flattening of this back wall changes the eye's focus." },
  { id: "lamina-fusca", name: "Lamina fusca", group: "Outer wall", t: [5, 5], c: "#4A5462", info: "Pigmented inner edge of the sclera." },
  { id: "oct-suprachoroid", name: "Suprachoroidal lamina and space", group: "Choroid", t: [7, 7], c: "#222A35", info: "Boundary between choroid and sclera; fluid here thickens the measured choroid." },
  { id: "haller", name: "Haller's layer", group: "Choroid", t: [34, 40], c: "#4F5A68", sans: true, ves: { every: 6, off: 2, rx: 13, ry: 10, c: "#1A2029" }, info: "Outer layer of large choroidal vessels. Engorgement here drives much of the choroidal thickening in SANS." },
  { id: "sattler", name: "Sattler's layer", group: "Choroid", t: [20, 22], c: "#626D7B", sans: true, ves: { every: 3, off: 1, rx: 5, ry: 4.5, c: "#252D38" }, info: "Middle layer of medium choroidal vessels." },
  { id: "choriocapillaris", name: "Choriocapillaris", group: "Choroid", t: [8, 8], c: "#7F8A98", sans: true, info: "Dense capillary sheet (endothelium and pericytes) that feeds the photoreceptors through Bruch's membrane." },
  { id: "bruch", name: "Bruch's membrane", group: "RPE and Bruch's", t: [4, 4], c: "#D5DCE4", sans: true, info: "Five sub-layers: RPE basement membrane, inner collagen, elastic layer, outer collagen and choriocapillaris basement membrane. Choroidal folds show up as waves in this line." },
  { id: "rpe", name: "Retinal pigment epithelium (RPE)", group: "RPE and Bruch's", t: [12, 12], c: "#EEF2F6", sans: true, info: "Brightest band on OCT. Supports the photoreceptors; ripples here are how choroidal folds are seen." },
  { id: "interdigitation", name: "Interdigitation zone", group: "Photoreceptors", t: [4, 5], c: "#B4BECA", info: "Where RPE processes wrap the tips of the photoreceptors." },
  { id: "outer-segments", name: "Photoreceptor outer segments", group: "Photoreceptors", t: [12, 17], c: "#3A4451", info: "Stacked discs holding the light-sensitive pigment." },
  { id: "ellipsoid", name: "Ellipsoid zone", group: "Photoreceptors", t: [6, 7], c: "#DFE6ED", info: "Mitochondria-rich band; a break here signals photoreceptor damage." },
  { id: "myoid", name: "Myoid zone (inner segments)", group: "Photoreceptors", t: [7, 9], c: "#2E3743", info: "Inner segments that build the proteins for the outer segments." },
  { id: "elm", name: "External limiting membrane", group: "Photoreceptors", t: [3, 3], c: "#A3AEBA", info: "Junctions between Müller cells and photoreceptors." },
  { id: "onl", name: "Outer nuclear layer", group: "Middle retina", t: [30, 48], c: "#252D38", info: "Cell bodies of rods and cones; thickest at the fovea." },
  { id: "henle", name: "Henle fibre layer", group: "Middle retina", t: [8, 15], c: "#39434F", info: "Slanted photoreceptor axons radiating out from the fovea." },
  { id: "opl", name: "Outer plexiform layer", group: "Middle retina", t: [8, 3], c: "#BEC8D2", info: "Synapses between photoreceptors and bipolar cells." },
  { id: "inl", name: "Inner nuclear layer", group: "Middle retina", t: [20, 3], c: "#343E4A", info: "Bipolar, horizontal, amacrine and Müller cell bodies." },
  { id: "ipl", name: "Inner plexiform layer", group: "Inner retina", t: [20, 2], c: "#AAB5C1", info: "Synapses between bipolar and ganglion cells." },
  { id: "gcl", name: "Ganglion cell layer", group: "Inner retina", t: [22, 2], c: "#56606D", info: "Cell bodies of the neurons whose axons form the optic nerve." },
  { id: "rnfl", name: "Retinal nerve fibre layer (RNFL)", group: "Inner retina", t: [14, 1], nasal: 22, c: "#E2E9F0", sans: true, info: "Ganglion cell axons heading to the optic disc. Peripapillary RNFL thickening on OCT is the main in-flight measure of disc edema." },
  { id: "ilm", name: "Internal limiting membrane", group: "Inner retina", t: [2, 1.5], c: "#FFFFFF", info: "Boundary between retina and vitreous; retinal folds show up as ripples here." },
];

const OX = [];
for (let x = 60; x <= 940; x += 8) OX.push(x);
const fov = (x) => Math.exp(-(((x - 500) / 78) ** 2));
const bowl = (x) => -0.00011 * (x - 500) ** 2;
const OCT_PARTS = (() => {
  const thick = (L, x) => 1.28 * (L.t[0] + (L.t[1] - L.t[0]) * fov(x) + (L.nasal || 0) * Math.max(0, (x - 500) / 440));
  // Bruch's membrane is the flat reference line: retina stacks up from it, choroid and sclera stack down
  const anchor = OX.map((x) => 380 + bowl(x));
  const ai = OCT_LAYERS.findIndex((L) => L.id === "bruch");
  const bounds = [];
  let cur = anchor;
  for (let i = ai; i < OCT_LAYERS.length; i++) {
    const top = cur.map((y, k) => y - thick(OCT_LAYERS[i], OX[k]));
    bounds[i] = [top, cur]; cur = top;
  }
  cur = anchor;
  for (let i = ai - 1; i >= 0; i--) {
    const bot = cur.map((y, k) => y + thick(OCT_LAYERS[i], OX[k]));
    bounds[i] = [cur, bot]; cur = bot;
  }
  return OCT_LAYERS.map((L, i) => {
    const [top, bot] = bounds[i];
    const d = "M" + OX.map((x, k) => `${x},${top[k].toFixed(1)}`).join(" L") + " L" +
      OX.map((x, k) => `${x},${bot[k].toFixed(1)}`).reverse().join(" L") + " Z";
    const ves = [];
    if (L.ves) for (let k = L.ves.off; k < OX.length - 1; k += L.ves.every) ves.push([OX[k], (top[k] + bot[k]) / 2]);
    return {
      id: L.id, name: L.name, group: L.group, sans: L.sans, info: L.info, view: "oct",
      render: () => (<>
        <path d={d} fill={L.c} />
        {ves.map(([x, y], k) => <ellipse key={k} cx={x} cy={y} rx={L.ves.rx} ry={L.ves.ry} fill={L.ves.c} />)}
      </>),
    };
  });
})();

export const ALL_PARTS = [...EYE_PARTS, ...OCT_PARTS];
const BY_ID = Object.fromEntries(ALL_PARTS.map((p) => [p.id, p]));
const GROUPS = {
  eye: ["Front of the eye", "Eye wall", "Retina landmarks", "Optic nerve and sheath", "Blood supply", "Fluid drainage"],
  oct: ["Inner retina", "Middle retina", "Photoreceptors", "RPE and Bruch's", "Choroid", "Outer wall"],
};

const SANS_PRESET = {
  eye: { "optic-disc": "alert", csf: "alert", "lamina-cribrosa": "warning", "optic-nerve": "warning", choroid: "warning", sclera: "warning", macula: "warning", glymphatic: "warning", "central-retinal-vein": "warning", "vortex-veins": "warning" },
  oct: { rnfl: "alert", choriocapillaris: "warning", sattler: "warning", haller: "warning", rpe: "warning", bruch: "warning", "scleral-stroma": "warning" },
};

const AVATAR_CSS = `
.eye-svg{--warn:#FFD23F;--alert:#FF4D4D;--sel:#9CF7B4}
.eye-svg .glow-selected{--g:var(--sel);opacity:.75}
.part{cursor:pointer}
.part:hover{filter:brightness(1.18)}
.labels text{fill:#7F93AB;font-size:13px;font-family:Barlow,sans-serif}
.glow [fill]:not([fill="none"]){fill:var(--g)}
.glow [stroke]:not([stroke="none"]){stroke:var(--g)}
.glow *{fill-opacity:1;stroke-opacity:1}
.glow .hit,.sel .hit{display:none}
.glow-warning{--g:var(--warn);opacity:.85}
.glow-alert{--g:var(--alert);opacity:.9;animation:eyePulse 1.4s ease-in-out infinite}
@keyframes eyePulse{0%,100%{opacity:.5}50%{opacity:1}}
.sel [fill]{fill:none}
.sel *{stroke:var(--sel);stroke-width:1.6px;stroke-dasharray:none}
.flow{animation:eyeFlow 1.6s linear infinite}
@keyframes eyeFlow{to{stroke-dashoffset:-22}}
@media (prefers-reduced-motion:reduce){.glow-alert,.flow{animation:none}}
`;

/* =========================================================
   <EyeAvatar /> – the reusable piece for your Bolt project
   ========================================================= */
export function EyeAvatar({ view = "eye", states = {}, selectedId, onSelect, onHover }) {
  const parts = view === "eye" ? EYE_PARTS : OCT_PARTS;
  const glowing = parts.filter((p) => states[p.id] && states[p.id] !== "normal");
  const sel = parts.find((p) => p.id === selectedId);

  return (
    <svg viewBox="0 0 1000 600" className="eye-svg" role="img"
      aria-label={view === "eye" ? "Cross-section of the eye and optic nerve" : "OCT view of retina and choroid layers"}>
      <style>{AVATAR_CSS}</style>
      <defs>
        <radialGradient id="gBg" cx="40%" cy="50%" r="75%">
          <stop offset="0" stopColor="#17283D" /><stop offset="1" stopColor="#0E1826" />
        </radialGradient>
        <linearGradient id="gSclera" x1="0" x2="1"><stop offset="0" stopColor="#F3EDE2" /><stop offset="1" stopColor="#DCD1BF" /></linearGradient>
        <linearGradient id="gChoroid" x1="0" x2="1"><stop offset="0" stopColor="#8E2C3A" /><stop offset="1" stopColor="#6B1F2B" /></linearGradient>
        <radialGradient id="gVit" cx="45%" cy="45%" r="60%"><stop offset="0" stopColor="#9CC9E6" stopOpacity="0.16" /><stop offset="1" stopColor="#5D8DB0" stopOpacity="0.1" /></radialGradient>
        <radialGradient id="gLens" cx="40%" cy="40%" r="70%"><stop offset="0" stopColor="#F4FAFD" /><stop offset="1" stopColor="#B9D3E2" /></radialGradient>
        <linearGradient id="gNerve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E2D2A9" /><stop offset=".5" stopColor="#EFE3C4" /><stop offset="1" stopColor="#E2D2A9" /></linearGradient>
        <clipPath id="vitClip"><rect x="240" y="0" width="440" height="600" /></clipPath>
        <filter id="eyeGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="1000" height="600" fill="url(#gBg)" />
      {view === "oct" && <rect x="60" y="40" width="880" height="530" fill="#0B121C" rx="6" />}

      {/* base anatomy – each part is clickable */}
      {parts.map((p) => (
        <g key={p.id} data-part={p.id} className="part"
          onClick={() => onSelect?.(p.id)}
          onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}>
          {p.render()}
        </g>
      ))}

      {/* glow overlay – redraws glowing parts in the state colour */}
      <g pointerEvents="none">
        {glowing.map((p) => (
          <g key={p.id} className={`glow glow-${states[p.id]}`} filter="url(#eyeGlow)">{p.render()}</g>
        ))}
        {sel && (!states[sel.id] || states[sel.id] === "normal") && (
          <g className="glow glow-selected" filter="url(#eyeGlow)">{sel.render()}</g>
        )}
        {sel && <g className="sel">{sel.render()}</g>}
      </g>

      {/* static labels */}
      <g className="labels" pointerEvents="none">
        {view === "eye" ? (<>
          {EYE_LABELS.map((l) => <text key={l.t} x={l.x} y={l.y} textAnchor={l.a || "start"}>{l.t}</text>)}
          <path d="M120,300 H160" stroke="#7F93AB" strokeWidth="1.2" />
          <path d="M152,295 L160,300 L152,305" fill="none" stroke="#7F93AB" strokeWidth="1.2" />
        </>) : (<>
          <text x="80" y="72">Vitreous</text>
          <text x="500" y="112" textAnchor="middle">Fovea</text>
          <path d="M500,120 V196" stroke="#7F93AB" strokeWidth="1" strokeDasharray="3 3" />
          <text x="920" y="72" textAnchor="end">Toward optic disc</text>
        </>)}
      </g>
    </svg>
  );
}

/* =========================================================
   Demo page – controls you can delete once the backend
   sends real states
   ========================================================= */
const STATE_LABEL = { normal: "Normal", warning: "Watch", alert: "Alert" };

export default function EyeMonitorDemo() {
  const [view, setView] = useState("eye");
  const [states, setStates] = useState({});
  const [selectedId, setSelectedId] = useState("optic-disc");
  const [hoverId, setHoverId] = useState(null);
  const [tip, setTip] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  const parts = view === "eye" ? EYE_PARTS : OCT_PARTS;
  const selected = BY_ID[selectedId];
  const setState = (id, s) => setStates((prev) => ({ ...prev, [id]: s }));
  const switchView = (v) => {
    setView(v);
    if (!BY_ID[selectedId] || BY_ID[selectedId].view !== v) setSelectedId(v === "eye" ? "optic-disc" : "rnfl");
  };
  const onMove = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const activeStates = Object.fromEntries(Object.entries(states).filter(([, s]) => s !== "normal"));

  return (
    <div className="eye-app">
      <style>{CSS}</style>

      <header className="topbar">
        <div>
          <h1>Ocular health monitor</h1>
          <p className="sub">SANS watch for long-duration crews</p>
        </div>
        <div className="controls">
          <div className="seg" role="tablist" aria-label="View">
            <button role="tab" aria-selected={view === "eye"} className={view === "eye" ? "on" : ""} onClick={() => switchView("eye")}>Whole eye</button>
            <button role="tab" aria-selected={view === "oct"} className={view === "oct" ? "on" : ""} onClick={() => switchView("oct")}>Retina layers (OCT)</button>
          </div>
          <button className="btn" onClick={() => setStates((p) => ({ ...p, ...SANS_PRESET[view] }))}>Simulate SANS findings</button>
          <button className="btn ghost" onClick={() => setStates({})}>Clear all</button>
        </div>
      </header>

      <main className="layout">
        <section className="stage" ref={stageRef} onMouseMove={onMove}>
          <p className="caption">
            {view === "eye" ? "Horizontal section through the right eye and optic nerve" : "Simulated OCT scan through the fovea"}
          </p>
          <EyeAvatar view={view} states={states} selectedId={selectedId} onSelect={setSelectedId} onHover={setHoverId} />
          {hoverId && (
            <div className="tip" style={{ left: tip.x, top: tip.y }}>
              {BY_ID[hoverId].name}
              {states[hoverId] && states[hoverId] !== "normal" && <span className={`dot ${states[hoverId]}`} />}
            </div>
          )}
          <div className="legend">
            <span><i className="dot normal" />Normal</span>
            <span><i className="dot warning" />Watch</span>
            <span><i className="dot alert" />Alert</span>
            <span><i className="dot selg" />Selected</span>
          </div>
        </section>

        <aside className="panel">
          {selected && (
            <div className="card">
              <h2>{selected.name}</h2>
              {selected.sans && <p className="tag">SANS marker</p>}
              <p className="info">{selected.info}</p>
              <div className="seg states" aria-label="Status">
                {["normal", "warning", "alert"].map((s) => (
                  <button key={s} className={`${(states[selected.id] || "normal") === s ? "on" : ""} s-${s}`}
                    onClick={() => setState(selected.id, s)}>{STATE_LABEL[s]}</button>
                ))}
              </div>
              {selected.oct && <button className="btn link" onClick={() => switchView("oct")}>Open retina layers</button>}
            </div>
          )}

          <nav className="list" aria-label="Parts">
            {GROUPS[view].map((g) => (
              <div key={g} className="group">
                <h3>{g}</h3>
                {(view === "oct" ? [...parts].reverse() : parts).filter((p) => p.group === g)
                  .map((p) => (
                    <button key={p.id} className={`row ${p.id === selectedId ? "on" : ""}`} onClick={() => setSelectedId(p.id)}
                      onMouseEnter={() => setHoverId(null)}>
                      <span className={`dot ${states[p.id] || "normal"}`} />
                      <span className="nm">{p.name}</span>
                      {p.sans && <span className="mini">SANS</span>}
                    </button>
                  ))}
              </div>
            ))}
          </nav>

          <details className="json">
            <summary>State the backend sends</summary>
            <pre>{JSON.stringify(activeStates, null, 2)}</pre>
          </details>
        </aside>
      </main>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600&display=swap');
.eye-app{--bg:#0F1B2A;--panel:#15263A;--line:#2A3E57;--ink:#E6EDF5;--muted:#8FA3BA;
  --warn:#FFD23F;--alert:#FF4D4D;--sel:#9CF7B4;--ok:#4D6582;
  background:var(--bg);color:var(--ink);font-family:Barlow,"Segoe UI",system-ui,sans-serif;min-height:100vh;padding:20px 24px;box-sizing:border-box}
.eye-app *{box-sizing:border-box}
.topbar{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between;margin-bottom:16px}
h1{font-family:"Barlow Condensed",Barlow,sans-serif;font-weight:600;font-size:30px;margin:0;line-height:1.05;letter-spacing:.2px}
.sub{margin:4px 0 0;color:var(--muted);font-size:15px}
.controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.seg button{background:transparent;color:var(--muted);border:0;padding:8px 12px;font:inherit;font-size:14px;cursor:pointer}
.seg button+button{border-left:1px solid var(--line)}
.seg button.on{background:#22395A;color:var(--ink)}
.btn{background:#22395A;color:var(--ink);border:1px solid #33507A;border-radius:8px;padding:8px 14px;font:inherit;font-size:14px;cursor:pointer}
.btn:hover{background:#2A4570}
.btn.ghost{background:transparent;border-color:var(--line);color:var(--muted)}
.btn.link{background:none;border:0;padding:8px 0 0;color:var(--sel);text-decoration:underline;text-underline-offset:3px}
button:focus-visible{outline:2px solid var(--sel);outline-offset:2px}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px}
@media (max-width:900px){.layout{grid-template-columns:1fr}}
.stage{position:relative;background:#0D1724;border:1px solid var(--line);border-radius:12px;padding:12px 12px 8px}
.caption{margin:0 0 6px 4px;color:var(--muted);font-size:14px}
.eye-svg{width:100%;height:auto;display:block}
.tip{position:absolute;transform:translate(12px,-130%);background:#0A121D;border:1px solid var(--line);color:var(--ink);font-size:13px;padding:5px 9px;border-radius:6px;pointer-events:none;white-space:nowrap;display:flex;gap:6px;align-items:center}
.legend{display:flex;flex-wrap:wrap;gap:14px;padding:8px 4px 2px;color:var(--muted);font-size:13px}
.legend span{display:flex;align-items:center;gap:6px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--ok);flex:none}
.dot.warning{background:var(--warn);box-shadow:0 0 6px var(--warn)}
.dot.alert{background:var(--alert);box-shadow:0 0 6px var(--alert)}
.dot.selg{background:var(--sel);box-shadow:0 0 6px var(--sel)}
.panel{display:flex;flex-direction:column;gap:12px;min-width:0}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px}
.card h2{font-family:"Barlow Condensed",Barlow,sans-serif;font-weight:600;font-size:24px;margin:0;line-height:1.1}
.tag{display:inline-block;margin:8px 0 0;font-size:12px;color:var(--warn);border:1px solid #5A4A2A;border-radius:999px;padding:2px 9px}
.info{color:#C3D0DE;font-size:15px;line-height:1.5;margin:10px 0 14px}
.states{width:100%}
.states button{flex:1}
.states .on.s-normal{background:#2A3E57;color:var(--ink)}
.states .on.s-warning{background:var(--warn);color:#2A1C00}
.states .on.s-alert{background:var(--alert);color:#2A0705}
.list{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px;max-height:420px;overflow:auto}
.group h3{font-size:13px;font-weight:600;color:var(--muted);margin:10px 8px 4px}
.row{display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;color:var(--ink);font:inherit;font-size:14px;text-align:left;padding:6px 8px;border-radius:6px;cursor:pointer}
.row:hover{background:#1C3049}
.row.on{background:#22395A;box-shadow:inset 2px 0 0 var(--sel)}
.nm{flex:1;min-width:0}
.mini{font-size:11px;color:var(--warn)}
.json{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:14px}
.json summary{cursor:pointer;color:var(--muted)}
.json pre{margin:8px 0 0;font-size:12px;color:#BFE6F4;white-space:pre-wrap}
`;
