import { ALL_PARTS } from "./EyeAvatar.jsx";
import { ACTIVE_SYNDROME } from "../syndromes/index.js";

export const PARTS_BY_ID = Object.fromEntries(ALL_PARTS.map((p) => [p.id, p]));

/** Plain-language label first, medical name second. */
export function partLabels(id) {
  const part = PARTS_BY_ID[id];
  const medical = part?.name ?? id;
  const plain = ACTIVE_SYNDROME.plainNames[id] ?? medical;
  return { plain, medical: plain === medical ? null : medical };
}

export const STATUS_TEXT = { normal: "Normal", warning: "Watch", alert: "Alert" };
export const SEVERITY_TEXT = {
  alert: "Serious: act today",
  warning: "Watch: no rush, keep an eye on it",
  normal: "For your information",
};
