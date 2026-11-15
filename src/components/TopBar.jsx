import { RiskBadge } from "./ui.jsx";

export function TopBar({ astronaut, riskGroup }) {
  if (!astronaut) return <header className="topbar" aria-busy="true" style={{ minHeight: 52 }} />;
  const { name, initials, mission, missionDay, missionLength } = astronaut;
  const pct = Math.min(100, Math.round((missionDay / missionLength) * 100));
  return (
    <header className="topbar">
      <div className="who">
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="who-name">{name}</p>
          <p className="who-mission">{mission}</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="mission-day">
          <strong>
            Day {missionDay} of {missionLength}
          </strong>
          <div
            className="day-bar"
            role="progressbar"
            aria-label="Mission progress"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <RiskBadge group={riskGroup} />
      </div>
    </header>
  );
}
