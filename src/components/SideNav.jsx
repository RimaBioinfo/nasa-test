import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { SYNDROMES } from "../syndromes/index.js";

const LINKS = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/checkups", label: "Checkups", icon: "clipboard" },
  { to: "/risk", label: "Risk and treatment", icon: "gauge" },
  { to: "/experiments", label: "Experiments", icon: "flask" },
  { to: "/learn/optic-disc", label: "Learn", icon: "book", match: "/learn" },
];

export function SideNav({ open, onToggle, onNavigate }) {
  const { pathname } = useLocation();
  return (
    <nav className={`sidenav ${open ? "open" : ""}`} aria-label="Main">
      <div className="brand">
        <button
          type="button"
          className="btn btn-ghost btn-icon nav-toggle"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? "Collapse menu" : "Expand menu"}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
        <span className="brand-name">OcuGuard</span>
      </div>

      <ul className="nav-list">
        {LINKS.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `nav-link ${isActive || (l.match && pathname.startsWith(l.match)) ? "active" : ""}`
              }
              onClick={onNavigate}
              title={l.label}
            >
              <Icon name={l.icon} />
              <span className="label">{l.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div>
        <p className="nav-section-title" id="syndrome-title">
          Health module
        </p>
        <ul className="syndrome-list" aria-labelledby="syndrome-title">
          {SYNDROMES.map((s) => (
            <li
              key={s.id}
              className={`syndrome ${s.available ? "active" : ""}`}
              aria-current={s.available ? "true" : undefined}
              aria-disabled={s.available ? undefined : "true"}
              title={s.available ? `${s.name} (active)` : `${s.name}: coming soon`}
            >
              <span className="label">{s.name}</span>
              <span className="rail-short" aria-hidden="true">
                {s.short}
              </span>
              {!s.available && <span className="soon">Coming soon</span>}
            </li>
          ))}
        </ul>
      </div>

      <p className="nav-foot">Mock data. Backend not connected yet.</p>
    </nav>
  );
}
