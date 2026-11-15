import { Link } from "react-router-dom";
import { PARTS_BY_ID, partLabels } from "./parts.js";
import { StatusPill } from "./ui.jsx";
import { Icon } from "./Icon.jsx";
import { MessageSurgeonButton } from "./MessageSurgeonButton.jsx";

/** Side panel for the selected eye part. */
export function PartPanel({ partId, partStatus, compact = false }) {
  const part = PARTS_BY_ID[partId];
  if (!part) {
    return (
      <section className="panel part-panel">
        <p className="muted">Select a part of the eye to see its details.</p>
      </section>
    );
  }
  const { plain, medical } = partLabels(partId);
  const s = partStatus;
  const status = s?.status ?? "normal";

  return (
    <section className="panel part-panel" aria-live="polite" aria-labelledby="part-title">
      <h2 id="part-title">
        {plain}
        {medical && <span className="term">{medical}</span>}
      </h2>
      <div className="status-row">
        <StatusPill status={status} />
        {part.sans && <span className="pill">Key for SANS</span>}
      </div>

      {s ? (
        <>
          <div className="measure">
            <p className="measure-value">
              {s.value} <small>{s.unit}</small>
            </p>
            <p className={`measure-range ${status !== "normal" ? "out" : ""}`}>Normal: {s.normalRange}</p>
          </div>
          <div className="panel-block">
            <h3>What it means</h3>
            <p>{s.meaning}</p>
          </div>
          <div className="panel-block">
            <h3>What to do</h3>
            <p>{s.action}</p>
          </div>
        </>
      ) : (
        <div className="panel-block">
          <h3>About this part</h3>
          <p>{part.info}</p>
          <p className="muted small" style={{ marginTop: 6 }}>
            Not measured in your regular checkups.
          </p>
        </div>
      )}

      <div className="btn-row">
        <Link className="btn" to={`/learn/${partId}`}>
          Read more <Icon name="arrowRight" size={18} />
        </Link>
        {!compact && status === "alert" && <MessageSurgeonButton context={plain} />}
      </div>
    </section>
  );
}
