import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "./SideNav.jsx";
import { TopBar } from "./TopBar.jsx";
import { useApi } from "../hooks/useApi.js";
import { getAstronaut, getRiskScore } from "../services/api.js";

export function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const { data: astronaut } = useApi(getAstronaut);
  const { data: risk } = useApi(getRiskScore);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <SideNav open={navOpen} onToggle={() => setNavOpen((o) => !o)} onNavigate={() => setNavOpen(false)} />
      {navOpen && (
        <button type="button" className="nav-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />
      )}
      <main className="shell-main" id="main">
        <TopBar astronaut={astronaut} riskGroup={risk?.group} />
        <Outlet />
      </main>
    </div>
  );
}
