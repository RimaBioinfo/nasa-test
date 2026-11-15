import { Icon } from "./Icon.jsx";
import { STATUS_TEXT } from "./parts.js";

export function StatusPill({ status = "normal" }) {
  return (
    <span className={`pill pill-${status}`}>
      <span className={`dot dot-${status}`} aria-hidden="true" />
      {STATUS_TEXT[status] ?? status}
    </span>
  );
}

const CHECKUP_TEXT = { done: "Done", due: "Due today", overdue: "Overdue" };
export function CheckupStatusPill({ status }) {
  const icon = status === "done" ? "check" : status === "overdue" ? "alert" : "clock";
  return (
    <span className={`pill pill-${status}`}>
      <Icon name={icon} size={15} />
      {CHECKUP_TEXT[status] ?? status}
    </span>
  );
}

const RISK_TEXT = { low: "Low", medium: "Medium", high: "High" };
export function RiskBadge({ group }) {
  if (!group) return null;
  return (
    <span className={`risk-badge risk-${group}`}>
      <Icon name="shield" size={18} />
      SANS risk: {RISK_TEXT[group] ?? group}
    </span>
  );
}

export function PlaceholderNote({ children = "Placeholder content, to be reviewed by a flight surgeon." }) {
  return (
    <p className="placeholder-note" role="note">
      <Icon name="info" size={18} />
      <span>{children}</span>
    </p>
  );
}

export function SharedNote() {
  return (
    <p className="shared-note">
      <Icon name="earth" size={16} />
      <span>Your results are shared with the medical team on Earth.</span>
    </p>
  );
}

export function Loading({ what = "data" }) {
  return (
    <p className="loading" role="status">
      Loading {what}…
    </p>
  );
}

export function ErrorBox({ error }) {
  return (
    <p className="error-box" role="alert">
      Could not load data. {error?.message}
    </p>
  );
}
