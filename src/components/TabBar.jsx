import { NavLink } from "react-router-dom";
import { Icon } from "./Icon.jsx";

const TABS = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/checkups", label: "Checkups", icon: "clipboard" },
  { to: "/learn", label: "Learn", icon: "book" },
  { to: "/risk", label: "Risk", icon: "gauge" },
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
