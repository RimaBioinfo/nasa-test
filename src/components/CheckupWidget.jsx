import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckupStatusPill } from "./ui.jsx";

const TABS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function CheckupWidget({ checkups = [], title = "Checkups", showSeeAll = true }) {
  const [tab, setTab] = useState("daily");
  const items = checkups.filter((c) => c.frequency === tab);
  const count = (f) => checkups.filter((c) => c.frequency === f && c.status !== "done").length;

  return (
    <section className="panel" aria-labelledby="checkups-title">
      <div className="panel-head" style={{ marginBottom: 10 }}>
        <h2 id="checkups-title">{title}</h2>
        {showSeeAll && <Link to="/checkups">See all</Link>}
      </div>
      <div className="seg tabs" role="tablist" aria-label="Checkup frequency">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="checkup-tabpanel"
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {count(t.id) > 0 && <span className="visually-hidden">, {count(t.id)} to do</span>}
            {count(t.id) > 0 && (
              <span className="dot dot-warning" style={{ marginLeft: 6 }} aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      <ul className="checkup-list" id="checkup-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {items.map((c) => (
          <li key={c.id} className="checkup-row">
            <div style={{ minWidth: 0 }}>
              <p className="checkup-row-name">
                {c.steps && c.status !== "done" ? <Link to={`/run/checkup/${c.id}`}>{c.name}</Link> : c.name}
              </p>
              <p className="checkup-row-sub">
                {c.status === "done" ? `Last: ${c.lastResult}` : `Due: ${c.nextDue}`}
              </p>
            </div>
            <CheckupStatusPill status={c.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
