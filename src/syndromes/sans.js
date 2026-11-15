/*
 * SANS module config: which eye parts matter most, and plain-language labels for
 * them. This is UI copy only; measured values come from src/services/api.js.
 */
export const sans = {
  id: "sans",
  name: "SANS",
  short: "SANS",
  fullName: "Spaceflight Associated Neuro-ocular Syndrome",
  available: true,
  keyParts: {
    eye: [
      "optic-disc", "csf", "optic-nerve", "lamina-cribrosa", "choroid", "sclera",
      "retina", "macula", "central-retinal-vein", "vortex-veins", "glymphatic", "intracranial",
    ],
    oct: ["rnfl", "rpe", "bruch", "choriocapillaris", "sattler", "haller", "scleral-stroma"],
  },
  defaultPart: { eye: "optic-disc", oct: "rnfl" },
  plainNames: {
    "optic-disc": "Where the nerve leaves the eye",
    csf: "Fluid around the optic nerve",
    "optic-nerve": "Optic nerve",
    "lamina-cribrosa": "Nerve exit mesh",
    choroid: "Blood-vessel layer behind the retina",
    sclera: "White outer wall",
    retina: "Light-sensing layer",
    macula: "Centre of sharp vision",
    "central-retinal-vein": "Main retina vein",
    "vortex-veins": "Back-of-eye drainage veins",
    glymphatic: "Fluid drainage along the nerve",
    intracranial: "Brain and its fluid",
    rnfl: "Nerve fibre layer",
    rpe: "Retina support layer",
    bruch: "Membrane under the retina",
    choriocapillaris: "Tiny feeding vessels",
    sattler: "Medium choroid vessels",
    haller: "Large choroid vessels",
    "scleral-stroma": "Outer wall collagen",
  },
};
