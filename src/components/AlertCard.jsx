import { Icon } from "./Icon.jsx";
import { SEVERITY_TEXT } from "./parts.js";
import { MessageSurgeonButton } from "./MessageSurgeonButton.jsx";

/**
 * One alert card. Answers: what happened (title), how serious (severity line),
 * what to do now (body).
 */
export function AlertCard({ alert, onDetails, onStart, onDismiss }) {
  const { kind, severity, title, body } = alert;
  const isTask = kind === "task";
  const sev = severity || "normal";

  return (
    <article className={`alert-card sev-${sev}`} aria-label={`${isTask ? "Task" : "Warning"}: ${title}`}>
      <span className="icon">
        <Icon name={isTask ? "task" : "alert"} />
      </span>
      <div>
        <h3>{title}</h3>
        <p className="alert-meta">
          <span className={`dot dot-${sev}`} aria-hidden="true" />
          {isTask ? "Task due" : SEVERITY_TEXT[sev]}
        </p>
        <p className="alert-body">
          <span className="visually-hidden">What to do: </span>
          {body}
        </p>
        <div className="btn-row">
          {isTask ? (
            <button type="button" className="btn" onClick={() => onStart?.(alert)}>
              Start test <Icon name="arrowRight" size={18} />
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => onDetails?.(alert)}>
              See details
            </button>
          )}
          {!isTask && sev === "alert" && <MessageSurgeonButton context={title} />}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn btn-ghost btn-icon alert-dismiss"
          style={{ border: 0 }}
          onClick={() => onDismiss(alert)}
          aria-label={`Dismiss: ${title}`}
        >
          <Icon name="close" />
        </button>
      )}
    </article>
  );
}
