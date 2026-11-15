import { NavLink } from "react-router-dom";
import { Icon } from "./Icon.jsx";

const TABS = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/checkups", label: "Checkups", icon: "clipboard" },
  { to: "/risk", label: "Risk", icon: "gauge" },
  { to: "/experiments", label: "Experiments", icon: "flask" },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="tab">
          <Icon name={t.icon} size={24} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
