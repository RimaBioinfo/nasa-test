import { STATUS_TEXT } from "./parts.js";

const RANK = { normal: 0, warning: 1, alert: 2 };

/** Worst status across all measured eye parts. */
export function overallEyeStatus(eyeStatus) {
  const all = Object.values(eyeStatus?.parts ?? {}).map((p) => p.status);
  return all.reduce((worst, s) => (RANK[s] > RANK[worst] ? s : worst), "normal");
}

/** Slim top line: who, which day, and one overall eye status. */
export function TopBar({ astronaut, eyeStatus }) {
  const status = eyeStatus ? overallEyeStatus(eyeStatus) : null;
  return (
    <header className="statusline">
      <p className="statusline-who">
        <span className="statusline-app">HMSA</span>
        {astronaut && (
          <>
            <span>{astronaut.name}</span>
            <span className="muted">
              Day {astronaut.missionDay} of {astronaut.missionLength}
            </span>
          </>
        )}
      </p>
      {status && (
        <p className={`statusline-eyes st-${status}`} role="status">
          <span className={`dot dot-${status}`} aria-hidden="true" />
          Eyes: {STATUS_TEXT[status]}
        </p>
      )}
    </header>
  );
}
