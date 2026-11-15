import { Icon } from "./Icon.jsx";
import { SEVERITY_TEXT } from "./parts.js";
import { MessageSurgeonButton } from "./MessageSurgeonButton.jsx";

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

export function NextStepCard({ step, partStatus, onDetails, onStart }) {
  if (!step || step.type === "none") {
    return (
      <section className="next-step sev-normal" aria-labelledby="next-step-title">
        <span className="next-step-icon">
          <Icon name="check" size={30} />
        </span>
        <p className="eyebrow">Next step</p>
        <h2 id="next-step-title">You&apos;re all caught up</h2>
        <p className="muted">No tests are due and nothing needs your attention right now.</p>
      </section>
    );
  }

  if (step.type === "checkup") {
    const c = step.checkup;
    return (
      <section className="next-step sev-warning" aria-labelledby="next-step-title">
        <span className="next-step-icon">
          <Icon name="clock" size={30} />
        </span>
        <p className="eyebrow">Next step · overdue test</p>
        <h2 id="next-step-title">{c.name} is overdue</h2>
        <div>
          <p>It was due on {c.nextDue}. Last result: {c.lastResult}.</p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => onStart?.(c.id)}>
              Start test <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const a = step.alert;
  const isTask = a.kind === "task";
  const sev = a.severity || "normal";
  const todo = partStatus?.action ?? a.body;

  return (
    <section className={`next-step sev-${sev}`} aria-labelledby="next-step-title">
      <span className="next-step-icon">
        <Icon name={isTask ? "task" : "alert"} size={30} />
      </span>
      <p className="eyebrow">Next step · {isTask ? "test due" : SEVERITY_TEXT[sev]}</p>
      <h2 id="next-step-title">{a.title}</h2>
      <div>
        <p>
          <strong>What to do now: </strong>
          {todo}
        </p>
        <div className="btn-row">
          {isTask ? (
            <button type="button" className="btn btn-primary" onClick={() => onStart?.(a.checkupId)}>
              Start test <Icon name="arrowRight" size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => onDetails?.(a)}>
              See details
            </button>
          )}
          {!isTask && sev === "alert" && <MessageSurgeonButton context={a.title} />}
        </div>
      </div>
    </section>
  );
}
