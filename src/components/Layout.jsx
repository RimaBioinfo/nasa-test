import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TabBar } from "./TabBar.jsx";
import { TopBar } from "./TopBar.jsx";
import { useApi } from "../hooks/useApi.js";
import { getAstronaut, getEyeStatus } from "../services/api.js";

export function Layout() {
  const { data: astronaut } = useApi(getAstronaut);
  const { data: eyeStatus } = useApi(getEyeStatus);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <main className="shell-main" id="main">
        <TopBar astronaut={astronaut} eyeStatus={eyeStatus} />
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
