/*
 * OcuGuard data layer. Every component gets its data from here.
 *
 * Right now each function returns mock data after a short delay. When the backend
 * is ready, set VITE_API_URL and replace the body of each function with
 *   fetch(`${import.meta.env.VITE_API_URL}/...`).then((r) => r.json())
 * keeping the same return shape.
 */
import {
  astronaut,
  eyeStatus,
  alerts,
  checkups,
  riskScore,
  treatments,
  experiments,
  partInfo,
} from "../data/mockData.js";

const DELAY_MS = 300;

// deep copy so callers can't mutate the mock "database"
const clone = (v) => JSON.parse(JSON.stringify(v));
const mock = (value) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), DELAY_MS));

/** → { id, name, initials, mission, missionDay, missionLength } */
export function getAstronaut() {
  return mock(astronaut);
}

/** → { updatedAt, parts: { [partId]: { status, value, unit, normalRange, meaning, action } } } */
export function getEyeStatus() {
  return mock(eyeStatus);
}

/** → [{ id, kind: "warning"|"task", severity, title, body, partId?, checkupId?, createdAt }] */
export function getAlerts() {
  return mock(alerts);
}

/**
 * → [{ id, name, frequency: "daily"|"weekly"|"monthly", status: "done"|"due"|"overdue",
 *      lastResult, nextDue, history: [{ date, value }] }]
 * Extra optional fields: unit, source.
 */
export function getCheckups() {
  return mock(checkups);
}

/**
 * → { score, group: "low"|"medium"|"high", features: [{ id, name, value, unit, weight, contribution }],
 *     history: [{ day, score }] }
 * Extra optional field: trends: [{ id, name, unit, limit, points: [{ day, value }] }].
 * The backend computes the score; the frontend only displays it.
 */
export function getRiskScore() {
  return mock(riskScore);
}

/** → { prevention: [{ title, body }], emergency: [{ step, title, body }] } */
export function getTreatments() {
  return mock(treatments);
}

/** → [{ id, name, description, durationMin, steps: [string] }] */
export function getExperiments() {
  return mock(experiments);
}

/** → { id, plain, whySpace, howMeasured: [string], related: [partId] } */
export function getPartInfo(partId) {
  const info = partInfo[partId];
  return mock(
    info
      ? { id: partId, ...info }
      : { id: partId, plain: null, whySpace: null, howMeasured: [], related: [] },
  );
}

/* ---------- writes (mocked in memory) ---------- */

const savedResults = [];

/** Save the result of a guided test. → { id, experimentId, answers, savedAt } */
export function saveExperimentResult(experimentId, answers) {
  const entry = { id: `res-${savedResults.length + 1}`, experimentId, answers, savedAt: new Date().toISOString() };
  savedResults.push(entry);
  return mock(entry);
}

/** → [{ id, experimentId, answers, savedAt }] */
export function getExperimentResults() {
  return mock(savedResults);
}

/** Queue a message to the flight surgeon. → { id, queuedAt, oneWayDelayMin } */
export function messageFlightSurgeon(text, context = {}) {
  return mock({ id: `msg-${Date.now()}`, text, context, queuedAt: new Date().toISOString(), oneWayDelayMin: 20 });
}
