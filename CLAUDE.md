# OcuGuard: astronaut eye health monitor (NASA hackathon)

A health-monitoring web app for astronauts on long space missions, focused on SANS
(Spaceflight Associated Neuro-ocular Syndrome). SANS is the first "syndrome module";
the structure must let us add more syndromes later (bone loss, muscle loss, radiation,
cardiovascular) without rewriting pages.

My role is the frontend (UX/UI). The backend is built by teammates later, technology
not decided yet, so the frontend runs fully on mock data for now.

## Hard rules

- **Never modify or redraw `src/components/EyeAvatar.jsx`.** It is a finished, hand-built
  anatomical SVG. Import from it; don't edit it. If something in it seems wrong, tell me
  instead of changing it.
- All data goes through `src/services/api.js`. Components never import `mockData.js`
  directly and never hard-code medical values.
- JavaScript, not TypeScript. React + Vite + React Router. Plain CSS (CSS variables in
  `src/styles/theme.css`), no Tailwind.
- After any change, run `npm run build` and fix every error before telling me you're done.
- Commit after each working step with a clear message.

## The EyeAvatar component (already exists)

```js
import { EyeAvatar, ALL_PARTS } from "./components/EyeAvatar.jsx";

<EyeAvatar
  view="eye"                 // "eye" = whole-eye cross-section, "oct" = retina layers
  states={{ "optic-disc": "alert", choroid: "warning" }}  // "normal" | "warning" | "alert"
  selectedId="optic-disc"     // selected part glows light green
  onSelect={(id) => {}}       // called when a part is clicked
  onHover={(id) => {}}        // optional
/>
```

`ALL_PARTS` is an array of `{ id, name, group, sans, info, view }`. `sans: true` marks the
parts that matter most for SANS. The file also has a default export `EyeMonitorDemo`; don't use it.

SANS-key part ids for mock data and chips:
- eye view: `optic-disc`, `optic-nerve`, `csf`, `lamina-cribrosa`, `choroid`, `sclera`,
  `retina`, `macula`, `central-retinal-vein`, `vortex-veins`, `glymphatic`, `intracranial`
- oct view: `rnfl`, `rpe`, `bruch`, `choriocapillaris`, `sattler`, `haller`, `scleral-stroma`

## Main user: the astronaut on board

- Plain language first, medical term second in smaller text, e.g.
  "Swelling where the nerve leaves the eye (optic disc edema)".
- Every warning or alert answers three things: what happened, how serious it is, what to do now.
- The home page always shows one clear "Next step" card (the most urgent task or action).
- Touch targets at least 48px: astronauts may use a tablet while floating or wearing gloves.
- Tests and experiments use a guided flow: one instruction per screen, with a progress indicator.
- The flight surgeon is a contact, not a user: a "Message flight surgeon" button on alerts and in
  the emergency protocol, plus a note that results are shared with the medical team on Earth.
- Deep-space missions have communication delay: emergency steps must be doable without Earth.
- English only.

## Pages

### Home `/`
- Top bar: astronaut name and initials avatar, mission name, mission day ("Day 142 of 400"),
  overall SANS risk badge (Low / Medium / High).
- "Next step" card, then a stack of dismissible alert cards above the eye. Two kinds:
  - Warning: something changed ("Optic disc swelling increased since last scan") → "See details"
  - Task: a test is due ("Weekly visual acuity test due today") → "Start test"
- Center (the hero): `EyeAvatar` with a toggle "Whole eye" / "Retina layers (OCT)".
- Under the eye: chips for the SANS-key parts of the current view, colored by status
  (gray normal, yellow warning, red alert). Clicking a chip or a part on the eye selects it.
  A "Show all parts" button expands the full list from `ALL_PARTS`.
- Side panel for the selected part: name, status, measured value vs normal range
  ("RNFL thickness 132 µm, normal 80–110"), what it means in plain language, recommended action,
  and "Read more" → `/learn/:partId`.
- Checkups widget with tabs Daily / Weekly / Monthly, each item: done, due today, or overdue.

### Learn `/learn/:partId`
What the part is, why it matters in space, what the astronaut's numbers mean, how it is
measured (OCT, ultrasound, fundus photo, tonometry), and clickable related parts.
Show a small `EyeAvatar` with this part selected.

### Checkups `/checkups`
- Daily: vitals from the Astroskin smart shirt (Canadian Space Agency): heart rate, blood
  pressure, SpO2, breathing rate, skin temperature, sleep, as small trend charts; plus a
  symptom check-in (headache, blurry vision, eye pressure feeling).
- Weekly: visual acuity, Amsler grid, near-vision test.
- Monthly: OCT scan, fundus photo, optic nerve sheath ultrasound, eye pressure (tonometry).
- Each checkup: last result, trend, next due date.

### Risk and treatment `/risk`
- SANS risk score 0–100 as a gauge, plus risk group (Low / Medium / High).
- The score is a weighted function of a biomarker feature vector. Show a table per biomarker
  (value, weight, contribution) and a bar chart of contributions. The backend will compute the
  real score; the frontend only displays what `getRiskScore()` returns.
- Biomarker trends over the mission (line charts) for continuous monitoring.
- "Prevention (before the hazard)": preventive measures for the current risk group.
- "Emergency protocol": numbered steps and a "Message flight surgeon" button.
- Label all medical content: "Placeholder content, to be reviewed by a flight surgeon."

### Experiments `/experiments`
Extra self-tests the astronaut can run (Amsler grid, contrast sensitivity, symptom diary).
Each has "Start", which opens a guided step-by-step screen and saves a mock result.

### Navigation
Side nav (collapses on tablet) with the pages above and a syndrome selector:
"SANS" active, others shown as "Coming soon".

## Data layer

`src/services/api.js` exports async functions that return mock data after a ~300ms delay.
Later each one switches to `fetch(\`${import.meta.env.VITE_API_URL}/...\`)`, so keep the
return shapes stable:

- `getAstronaut()` → `{ id, name, initials, mission, missionDay, missionLength }`
- `getEyeStatus()` → `{ updatedAt, parts: { [partId]: { status, value, unit, normalRange, meaning, action } } }`
- `getAlerts()` → `[{ id, kind: "warning"|"task", severity, title, body, partId?, checkupId?, createdAt }]`
- `getCheckups()` → `[{ id, name, frequency: "daily"|"weekly"|"monthly", status: "done"|"due"|"overdue", lastResult, nextDue, history: [{ date, value }] }]`
- `getRiskScore()` → `{ score, group: "low"|"medium"|"high", features: [{ id, name, value, unit, weight, contribution }], history: [{ day, score }] }`
- `getTreatments()` → `{ prevention: [{ title, body }], emergency: [{ step, title, body }] }`
- `getExperiments()` → `[{ id, name, description, durationMin, steps: [string] }]`
- `getPartInfo(partId)` → `{ id, plain, whySpace, howMeasured, related: [partId] }`

Mock data should tell a consistent story: mission day 142, medium risk, optic disc and CSF
space in alert, choroid and RNFL in warning, everything else normal.

## Design

- Dark mission-control look. Tokens: background `#0F1B2A`, panel `#15263A`, border `#2A3E57`,
  text `#E6EDF5`, muted text `#8FA3BA`.
- Status colors everywhere: normal `#4D6582`, warning `#FFD23F`, alert `#FF4D4D`,
  selected `#9CF7B4` (same as the avatar).
- Fonts: Barlow (body) and Barlow Condensed (headings) from Google Fonts.
- Sentence case, no all-caps labels. The eye is the hero; everything around it stays calm.
- Responsive down to tablet. Visible keyboard focus. Respect `prefers-reduced-motion`.
- Charts: use `recharts`.

## Folder structure

```
src/
  components/   EyeAvatar.jsx, AlertCard.jsx, PartChips.jsx, PartPanel.jsx, CheckupWidget.jsx, ...
  pages/        HomePage.jsx, LearnPage.jsx, CheckupsPage.jsx, RiskPage.jsx, ExperimentsPage.jsx
  services/     api.js
  data/         mockData.js
  styles/       theme.css
  App.jsx, main.jsx
```
