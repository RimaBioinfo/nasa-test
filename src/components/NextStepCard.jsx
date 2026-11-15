import { Icon } from "./Icon.jsx";

const RANK = { alert: 0, warning: 1, normal: 2 };

/**
 * Pick the single most urgent thing to do:
 * serious warnings → overdue checkups → tasks due today → other warnings.
 */
export function pickNextStep(alerts = [], checkups = []) {
  const warnings = alerts.filter((a) => a.kind === "warning").sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  const serious = warnings.find((a) => a.severity === "alert");
  if (serious) return { type: "alert", alert: serious };

  const overdue = checkups.find((c) => c.status === "overdue");
  if (overdue) return { type: "checkup", checkup: overdue };

  const task = alerts.find((a) => a.kind === "task");
  if (task) return { type: "alert", alert: task };

  if (warnings[0]) return { type: "alert", alert: warnings[0] };
  return { type: "none" };
}

/** The one "Next step" card: what to do now, with one large button. */
export function NextStepCard({ title, severity = "normal", seriousness, todo, actionLabel, onAction }) {
  return (
    <section className={`next-step sev-${severity}`} aria-labelledby="next-step-title">
      <p className="next-step-label">Next step</p>
      <h2 id="next-step-title">{title}</h2>
      {seriousness && (
        <p className="next-step-sev">
          <span className={`dot dot-${severity}`} aria-hidden="true" />
          {seriousness}
        </p>
      )}
      {todo && <p>{todo}</p>}
      {actionLabel && (
        <button type="button" className="btn btn-primary btn-big" onClick={onAction}>
          {actionLabel} <Icon name="arrowRight" size={22} />
        </button>
      )}
    </section>
  );
}

