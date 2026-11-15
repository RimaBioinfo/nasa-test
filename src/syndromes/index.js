/*
 * Syndrome modules. SANS is the first one; each future module (bone loss, muscle
 * loss, radiation, cardiovascular) registers here with its own config so pages
 * don't need rewriting.
 */
import { sans } from "./sans.js";

export const SYNDROMES = [
  sans,
  { id: "bone", name: "Bone loss", short: "Bone", available: false },
  { id: "muscle", name: "Muscle loss", short: "Musc", available: false },
  { id: "radiation", name: "Radiation", short: "Rad", available: false },
  { id: "cardio", name: "Cardiovascular", short: "CV", available: false },
];

export const ACTIVE_SYNDROME = sans;
