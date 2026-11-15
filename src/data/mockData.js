/*
 * Mock data for HMSA. Only src/services/api.js may import this file.
 *
 * Story: mission day 142 of 400, medium SANS risk.
 *   alert   -> optic disc, CSF space around the nerve
 *   warning -> choroid, RNFL
 *   normal  -> everything else
 *
 * PLACEHOLDER CONTENT: all values, ranges and recommendations are invented for the
 * hackathon demo and must be reviewed by a flight surgeon.
 */

const MISSION_DAY = 142;

export const astronaut = {
  id: "astro-001",
  name: "Maya Okafor",
  initials: "MO",
  mission: "Artemis Gateway Expedition 3",
  missionDay: MISSION_DAY,
  missionLength: 400,
};

/* ---------- eye status ---------- */

const normal = (value, unit, normalRange, meaning) => ({
  status: "normal",
  value,
  unit,
  normalRange,
  meaning,
  action: "No action needed. Keep your regular checkup schedule.",
});

export const eyeStatus = {
  updatedAt: "2026-11-14T08:30:00Z",
  parts: {
    // ---- whole-eye view
    "optic-disc": {
      status: "alert",
      value: 2,
      unit: "Frisén grade",
      normalRange: "0",
      meaning:
        "The spot where the nerve leaves your eye is swollen, and the swelling grew since your last scan. This is the main sign of SANS.",
      action:
        "Do the extra OCT scan today and message the flight surgeon. If your vision gets blurry or you get a strong headache, follow the emergency protocol.",
    },
    csf: {
      status: "alert",
      value: 6.4,
      unit: "mm (nerve sheath diameter)",
      normalRange: "4.0–5.7",
      meaning:
        "The fluid space around your optic nerve is wider than normal. Extra fluid here can press on the back of your eye.",
      action:
        "Repeat the optic nerve sheath ultrasound within 48 hours. Use the lower-body negative pressure session tonight if scheduled.",
    },
    choroid: {
      status: "warning",
      value: 412,
      unit: "µm (thickness)",
      normalRange: "250–350",
      meaning:
        "The blood-vessel layer behind your retina is thicker than normal. It can cause small folds in the retina.",
      action: "No change to your day. It will be re-checked at your next monthly OCT scan.",
    },
    "optic-nerve": normal(3.1, "mm (nerve diameter)", "2.6–3.4", "Your optic nerve looks normal in size and shape."),
    "lamina-cribrosa": normal(0.32, "mm (depth)", "0.25–0.45", "The mesh where nerve fibres leave the eye sits in its usual position."),
    sclera: normal(0.02, "mm (globe flattening)", "0–0.05", "The back wall of your eye keeps its normal round shape."),
    retina: normal(278, "µm (central thickness)", "250–300", "Your retina has a normal thickness."),
    macula: normal(0, "folds detected", "0", "The centre of your vision shows no folds."),
    "central-retinal-vein": normal(1.05, "vein/artery ratio", "0.9–1.2", "The main vein draining your retina is not congested."),
    "vortex-veins": normal("Normal", "flow", "Normal", "The veins draining the back of the eye flow normally."),
    glymphatic: normal("Not measured", "", "—", "This fluid outflow route cannot be measured directly in flight yet."),
    intracranial: normal(14, "mmHg (estimated pressure)", "7–15", "The estimated pressure around your brain is at the top of the normal range."),

    // ---- retina layers (OCT) view
    rnfl: {
      status: "warning",
      value: 132,
      unit: "µm (thickness)",
      normalRange: "80–110",
      meaning:
        "The nerve fibre layer near the disc is thicker than normal. This usually goes along with disc swelling.",
      action: "It will be re-measured in today's extra OCT scan. No other action needed.",
    },
    rpe: normal("Smooth", "line shape", "Smooth", "The bright support layer under your retina is smooth, with no ripples."),
    bruch: normal("Smooth", "line shape", "Smooth", "The thin membrane under the retina shows no folds."),
    choriocapillaris: normal("Normal", "flow density", "Normal", "The tiny vessels feeding your retina look normal."),
    sattler: normal(98, "µm (thickness)", "70–110", "The middle vessel layer of the choroid is normal."),
    haller: normal(168, "µm (thickness)", "120–180", "The large vessel layer of the choroid is at the top of normal."),
    "scleral-stroma": normal(1.0, "mm (thickness)", "0.9–1.1", "The outer wall of your eye has a normal thickness."),
  },
};

// optional trend per measured part: monthly values ending on mission day 142
const monthly = (values) => values.map((value, i) => ({ day: MISSION_DAY - (values.length - 1 - i) * 30, value }));
const PART_HISTORY = {
  "optic-disc": [0, 0, 1, 1, 2],
  csf: [5.0, 5.3, 5.6, 6.0, 6.4],
  choroid: [318, 340, 362, 389, 412],
  rnfl: [96, 101, 109, 118, 132],
  "optic-nerve": [3.0, 3.0, 3.1, 3.1, 3.1],
  retina: [272, 274, 275, 277, 278],
  intracranial: [11, 12, 12, 13, 14],
  sattler: [90, 92, 95, 97, 98],
  haller: [150, 155, 160, 165, 168],
};
for (const [id, values] of Object.entries(PART_HISTORY)) eyeStatus.parts[id].history = monthly(values);

/* ---------- alerts ---------- */

export const alerts = [
  {
    id: "al-1",
    kind: "warning",
    severity: "alert",
    title: "Optic disc swelling increased since last scan",
    body: "Swelling went from grade 1 to grade 2. Do an extra OCT scan today and message the flight surgeon.",
    partId: "optic-disc",
    checkupId: "oct",
    createdAt: "2026-11-14T08:30:00Z",
  },
  {
    id: "al-2",
    kind: "warning",
    severity: "alert",
    title: "Fluid space around the optic nerve is wider",
    body: "Nerve sheath diameter is 6.4 mm, above the 5.7 mm limit. Repeat the ultrasound within 48 hours.",
    partId: "csf",
    createdAt: "2026-11-13T17:10:00Z",
  },
  {
    id: "al-3",
    kind: "task",
    severity: "warning",
    title: "Weekly visual acuity test due today",
    body: "Takes about 5 minutes. Use the tablet at arm's length.",
    checkupId: "visual-acuity",
    createdAt: "2026-11-15T06:00:00Z",
  },
  {
    id: "al-4",
    kind: "warning",
    severity: "warning",
    title: "Choroid is thicker than normal",
    body: "412 µm, normal is 250–350 µm. No change to your day; it will be re-checked at the monthly scan.",
    partId: "choroid",
    createdAt: "2026-11-12T09:00:00Z",
  },
];

/* ---------- checkups ---------- */

// build a short history series ending on mission day 142
const series = (values, stepDays) =>
  values.map((value, i) => ({ date: `Day ${MISSION_DAY - (values.length - 1 - i) * stepDays}`, value }));

export const checkups = [
  // daily: Astroskin smart shirt vitals + symptom check-in
  {
    id: "heart-rate", name: "Heart rate", frequency: "daily", status: "done", unit: "bpm", source: "Astroskin",
    lastResult: "64 bpm (resting)", nextDue: "Day 143",
    history: series([62, 63, 61, 64, 65, 63, 64], 1),
  },
  {
    id: "blood-pressure", name: "Blood pressure", frequency: "daily", status: "done", unit: "mmHg (systolic)", source: "Astroskin",
    lastResult: "118/76 mmHg", nextDue: "Day 143",
    history: series([115, 117, 116, 119, 118, 120, 118], 1),
  },
  {
    id: "spo2", name: "Blood oxygen (SpO2)", frequency: "daily", status: "done", unit: "%", source: "Astroskin",
    lastResult: "97 %", nextDue: "Day 143",
    history: series([98, 97, 97, 98, 97, 96, 97], 1),
  },
  {
    id: "breathing-rate", name: "Breathing rate", frequency: "daily", status: "done", unit: "breaths/min", source: "Astroskin",
    lastResult: "14 breaths/min", nextDue: "Day 143",
    history: series([14, 15, 14, 13, 14, 15, 14], 1),
  },
  {
    id: "skin-temp", name: "Skin temperature", frequency: "daily", status: "done", unit: "°C", source: "Astroskin",
    lastResult: "33.8 °C", nextDue: "Day 143",
    history: series([33.6, 33.7, 33.9, 33.8, 33.7, 33.9, 33.8], 1),
  },
  {
    id: "sleep", name: "Sleep", frequency: "daily", status: "done", unit: "hours", source: "Astroskin",
    lastResult: "6.2 h", nextDue: "Day 143",
    history: series([6.8, 6.5, 6.1, 5.9, 6.4, 6.0, 6.2], 1),
  },
  {
    id: "symptoms", name: "Symptom check-in", frequency: "daily", status: "due", unit: "symptom score (0–10)",
    lastResult: "Mild headache (2/10)", nextDue: "Today",
    steps: [
      "Find a calm moment and settle into a restraint.",
      "Do you have a headache right now?",
      "Has your vision been blurry today, near or far?",
      "Do you feel pressure behind your eyes?",
      "Add a short note about anything else you noticed (optional).",
      "Done. Your check-in is saved.",
    ],
    history: series([0, 1, 0, 1, 2, 2, 2], 1),
  },

  // weekly
  {
    id: "visual-acuity", name: "Visual acuity test", frequency: "weekly", status: "due", unit: "logMAR",
    lastResult: "0.10 logMAR (20/25)", nextDue: "Today",
    steps: [
      "Put on your usual distance glasses.",
      "Fix the tablet in the wall mount, 3 metres away, at eye level.",
      "Cover your left eye with your palm. Don't press on the eye.",
      "Read the letters on the screen out loud, row by row, until you can't read them anymore.",
      "Can you read the row marked 20/20?",
      "Now cover your right eye and repeat with your left eye.",
      "Done. Your result is saved.",
    ],
    history: series([0.0, 0.0, 0.02, 0.04, 0.06, 0.1], 7),
  },
  {
    id: "amsler", name: "Amsler grid", frequency: "weekly", status: "done", unit: "distorted squares",
    lastResult: "No distortion", nextDue: "Day 147",
    steps: [
      "Put on your reading glasses. Hold the tablet about 35 cm from your face.",
      "Cover your left eye.",
      "Look only at the dot in the middle of the grid.",
      "Do any lines look wavy, blurred or missing?",
      "Cover your right eye and repeat with your left eye.",
      "Done. Your result is saved.",
    ],
    history: series([0, 0, 0, 0, 0, 0], 7),
  },
  {
    id: "near-vision", name: "Near-vision test", frequency: "weekly", status: "overdue", unit: "N-point",
    lastResult: "N6 (needs +0.5 D glasses)", nextDue: "Day 140",
    steps: [
      "Put on your adjustable glasses at the 0 setting.",
      "Hold the reading card 40 cm from your face, in good light.",
      "Read the smallest paragraph you can read comfortably.",
      "Is the smallest text (N5) sharp?",
      "Done. Your result is saved.",
    ],
    history: series([5, 5, 5, 6, 6, 6], 7),
  },

  // monthly
  {
    id: "oct", name: "OCT scan", frequency: "monthly", status: "due", unit: "µm (RNFL thickness)",
    lastResult: "RNFL 132 µm, choroid 412 µm", nextDue: "Today (extra scan)",
    steps: [
      "Ask a crewmate to help you. Power on the OCT unit and wait for the green light.",
      "Wipe the chin rest and forehead bar.",
      "Rest your chin and forehead. Look at the blinking target.",
      "Keep still while your crewmate captures the scan of each eye.",
      "Done. The scan is saved and sent to Earth with the next data pass.",
    ],
    history: series([96, 101, 109, 118, 132], 30),
  },
  {
    id: "fundus", name: "Fundus photo", frequency: "monthly", status: "done", unit: "Frisén grade",
    lastResult: "Disc edema grade 2", nextDue: "Day 165",
    history: series([0, 0, 1, 1, 2], 30),
  },
  {
    id: "onsd-ultrasound", name: "Optic nerve sheath ultrasound", frequency: "monthly", status: "overdue", unit: "mm (ONSD)",
    lastResult: "6.4 mm", nextDue: "Day 141",
    steps: [
      "Ask a crewmate to help. Settle into the restraint with your eyes closed.",
      "Your crewmate puts a clear protective film and gel over your closed eyelid.",
      "Keep your eye still and look straight ahead under the lid.",
      "Your crewmate follows the guidance on the ultrasound screen to capture each eye.",
      "Done. The images are saved.",
    ],
    history: series([5.0, 5.3, 5.6, 6.0, 6.4], 30),
  },
  {
    id: "tonometry", name: "Eye pressure (tonometry)", frequency: "monthly", status: "done", unit: "mmHg (IOP)",
    lastResult: "15 mmHg", nextDue: "Day 165",
    history: series([14, 15, 16, 15, 15], 30),
  },
];

/* ---------- risk score ---------- */
// contribution = weight × normalised value (0–1). The backend will compute these.

export const riskScore = {
  score: 58,
  group: "medium",
  features: [
    { id: "disc-edema", name: "Optic disc swelling (Frisén grade)", value: 2, unit: "grade", weight: 0.25, contribution: 16.7 },
    { id: "onsd", name: "Nerve sheath diameter (ONSD)", value: 6.4, unit: "mm", weight: 0.2, contribution: 14.0 },
    { id: "rnfl", name: "Nerve fibre layer thickness (RNFL)", value: 132, unit: "µm", weight: 0.15, contribution: 9.8 },
    { id: "choroid", name: "Choroid thickness", value: 412, unit: "µm", weight: 0.15, contribution: 8.6 },
    { id: "refraction", name: "Focus shift (hyperopic)", value: 0.5, unit: "D", weight: 0.1, contribution: 3.3 },
    { id: "iop", name: "Eye pressure (IOP)", value: 15, unit: "mmHg", weight: 0.05, contribution: 1.5 },
    { id: "co2", name: "Cabin CO2 exposure", value: 3.1, unit: "mmHg", weight: 0.05, contribution: 2.6 },
    { id: "mission-day", name: "Time in microgravity", value: 142, unit: "days", weight: 0.05, contribution: 1.8 },
  ],
  history: [
    { day: 0, score: 8 }, { day: 15, score: 12 }, { day: 30, score: 17 }, { day: 45, score: 21 },
    { day: 60, score: 26 }, { day: 75, score: 30 }, { day: 90, score: 36 }, { day: 105, score: 41 },
    { day: 120, score: 47 }, { day: 135, score: 54 }, { day: 142, score: 58 },
  ],
  // biomarker trends over the mission (continuous monitoring)
  trends: [
    { id: "onsd", name: "Nerve sheath diameter", unit: "mm", limit: 5.7,
      points: [{ day: 0, value: 4.8 }, { day: 30, value: 5.0 }, { day: 60, value: 5.3 }, { day: 90, value: 5.6 }, { day: 120, value: 6.0 }, { day: 142, value: 6.4 }] },
    { id: "rnfl", name: "RNFL thickness", unit: "µm", limit: 110,
      points: [{ day: 0, value: 94 }, { day: 30, value: 96 }, { day: 60, value: 101 }, { day: 90, value: 109 }, { day: 120, value: 118 }, { day: 142, value: 132 }] },
    { id: "choroid", name: "Choroid thickness", unit: "µm", limit: 350,
      points: [{ day: 0, value: 300 }, { day: 30, value: 318 }, { day: 60, value: 340 }, { day: 90, value: 362 }, { day: 120, value: 389 }, { day: 142, value: 412 }] },
    { id: "iop", name: "Eye pressure", unit: "mmHg", limit: 21,
      points: [{ day: 0, value: 14 }, { day: 30, value: 14 }, { day: 60, value: 15 }, { day: 90, value: 16 }, { day: 120, value: 15 }, { day: 142, value: 15 }] },
  ],
};

/* ---------- treatments ---------- */

export const treatments = {
  group: "medium",
  prevention: [
    { title: "Lower-body negative pressure", body: "30 minutes a day in the LBNP device pulls fluid back toward your legs and may ease pressure behind the eyes." },
    { title: "Thigh cuffs in the evening", body: "Wear venous thigh cuffs for 2–4 hours before sleep to limit the headward fluid shift." },
    { title: "Keep cabin CO2 low", body: "Ask the crew to keep CO2 under 2.5 mmHg. Avoid sleeping in areas with poor airflow." },
    { title: "Limit salt and keep exercising", body: "Stay within your sodium plan and keep your daily resistance exercise. Avoid long breath-holds while lifting." },
    { title: "Wear your adjustable glasses", body: "If near vision blurs, switch to the +0.5 D or +1.0 D setting so you don't strain your eyes." },
  ],
  emergency: [
    { step: 1, title: "Stop and stay calm", body: "Stop what you are doing. Secure yourself in a restraint so you are not floating." },
    { step: 2, title: "Check your vision", body: "Cover one eye at a time. Read the acuity chart on the tablet and look at the Amsler grid. Note any blur, dark spots or wavy lines." },
    { step: 3, title: "Rate your symptoms", body: "Record headache (0–10), nausea, and any double vision in the symptom diary." },
    { step: 4, title: "Tell a crewmate", body: "Ask the crew medical officer to stay with you and to help with the next steps." },
    { step: 5, title: "Run the onboard scans", body: "With help, do an optic nerve sheath ultrasound and an OCT scan. Results save automatically." },
    { step: 6, title: "Start onboard countermeasures", body: "Begin a lower-body negative pressure session and put on thigh cuffs unless the crew medical officer says otherwise." },
    { step: 7, title: "Message the flight surgeon", body: "Send your results. Do not wait for a reply before doing steps 1–6: messages may take up to 20 minutes each way." },
  ],
};

/* ---------- experiments ---------- */

export const experiments = [
  {
    id: "amsler",
    name: "Amsler grid",
    description: "Spot wavy or missing lines that can point to retina folds or swelling.",
    durationMin: 3,
    steps: [
      "Put on your usual glasses. Hold the tablet about 35 cm (an arm's length bent) from your face.",
      "Cover your left eye with your hand.",
      "Look only at the dot in the middle of the grid. Don't move your eye.",
      "Do any lines look wavy, blurred or missing?",
      "Now cover your right eye and repeat with your left eye.",
      "Done. Your answers are saved.",
    ],
  },
  {
    id: "contrast",
    name: "Contrast sensitivity",
    description: "Check how well you see faint shapes, an early sign of nerve changes.",
    durationMin: 5,
    steps: [
      "Dim the cabin lights to the 'reading' level.",
      "Hold the tablet at arm's length.",
      "Look at the chart. Can you read the faintest row of letters?",
      "Repeat with each eye covered in turn.",
      "Done. Your answers are saved.",
    ],
  },
  {
    id: "symptom-diary",
    name: "Symptom diary",
    description: "Record headaches, blur and eye pressure feelings so trends become visible.",
    durationMin: 2,
    steps: [
      "Do you have a headache right now?",
      "Has your vision been blurry today, near or far?",
      "Do you feel pressure behind your eyes?",
      "Add a short note about anything else you noticed (optional).",
      "Done. Your entry is saved.",
    ],
  },
];

