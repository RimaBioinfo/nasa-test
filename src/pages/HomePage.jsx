import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeAvatar } from "../components/EyeAvatar.jsx";
import { AlertCard } from "../components/AlertCard.jsx";
import { NextStepCard, pickNextStep } from "../components/NextStepCard.jsx";
import { PartChips } from "../components/PartChips.jsx";
import { PartPanel } from "../components/PartPanel.jsx";
import { CheckupWidget } from "../components/CheckupWidget.jsx";
import { PARTS_BY_ID } from "../components/parts.js";
import { Loading, SharedNote } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getAlerts, getCheckups, getEyeStatus } from "../services/api.js";
import { ACTIVE_SYNDROME } from "../syndromes/index.js";

const DISMISS_KEY = "ocuguard.dismissedAlerts";
const readDismissed = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISS_KEY)) ?? [];
  } catch {
    return [];
  }
};
const writeDismissed = (ids) => {
  try {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: dismissals last until reload */
  }
};

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function HomePage() {
  const navigate = useNavigate();
  const eye = useApi(getEyeStatus);
  const alerts = useApi(getAlerts);
  const checkups = useApi(getCheckups);

  const [view, setView] = useState("eye");
  const [selectedId, setSelectedId] = useState(ACTIVE_SYNDROME.defaultPart.eye);
  const [dismissed, setDismissed] = useState(readDismissed);
  const panelRef = useRef(null);

  const parts = eye.data?.parts ?? {};
  const statusById = useMemo(
    () => Object.fromEntries(Object.entries(parts).map(([id, p]) => [id, p.status])),
    [parts],
  );
  const avatarStates = useMemo(
    () => Object.fromEntries(Object.entries(statusById).filter(([, s]) => s !== "normal")),
    [statusById],
  );

  const nextStep = pickNextStep(alerts.data ?? [], checkups.data ?? []);
  const nextAlertId = nextStep.type === "alert" ? nextStep.alert.id : null;
  const stack = (alerts.data ?? []).filter((a) => a.id !== nextAlertId && !dismissed.includes(a.id));
  const hiddenCount = (alerts.data ?? []).filter((a) => dismissed.includes(a.id)).length;

  const switchView = (v) => {
    setView(v);
    if (PARTS_BY_ID[selectedId]?.view !== v) setSelectedId(ACTIVE_SYNDROME.defaultPart[v]);
  };

  const selectPart = (id, { scroll = false } = {}) => {
    const part = PARTS_BY_ID[id];
    if (!part) return;
    if (part.view !== view) setView(part.view);
    setSelectedId(id);
    if (scroll) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" }),
      );
    }
  };

  const onDetails = (alert) => alert.partId && selectPart(alert.partId, { scroll: true });
  const onStart = (checkupId) => checkupId && navigate(`/run/checkup/${checkupId}`);
  const dismiss = (alert) => {
    const next = [...dismissed, alert.id];
    setDismissed(next);
    writeDismissed(next);
  };
  const restore = () => {
    setDismissed([]);
    writeDismissed([]);
  };

  const loading = eye.loading || alerts.loading || checkups.loading;
  const nextPartStatus = nextStep.type === "alert" && nextStep.alert.partId ? parts[nextStep.alert.partId] : null;

  return (
    <div className="home-grid">
      <div className="home-main">
        <h1 className="visually-hidden">Home</h1>
        {loading ? (
          <Loading what="your status" />
        ) : (
          <>
            <NextStepCard
              step={nextStep}
              partStatus={nextPartStatus}
              onDetails={onDetails}
              onStart={onStart}
            />

            {(stack.length > 0 || hiddenCount > 0) && (
              <section className="alert-stack" aria-label="Alerts and tasks">
                {stack.map((a) => (
                  <AlertCard
                    key={a.id}
                    alert={a}
                    onDetails={onDetails}
                    onStart={(al) => onStart(al.checkupId)}
                    onDismiss={dismiss}
                  />
                ))}
                {hiddenCount > 0 && (
                  <p className="dismissed-note">
                    <span>
                      {hiddenCount} {hiddenCount === 1 ? "alert" : "alerts"} hidden
                    </span>
                    <button type="button" className="btn btn-ghost" onClick={restore}>
                      Show again
                    </button>
                  </p>
                )}
              </section>
            )}
          </>
        )}

        <section className="eye-stage" aria-labelledby="eye-title">
          <div className="eye-stage-head">
            <div>
              <h2 id="eye-title">Your eye today</h2>
              <p className="muted small">
                Tap a part to see its details.
                {eye.data && ` Last scan ${new Date(eye.data.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`}
              </p>
            </div>
            <div className="seg" role="group" aria-label="Eye view">
              <button type="button" aria-pressed={view === "eye"} onClick={() => switchView("eye")}>
                Whole eye
              </button>
              <button type="button" aria-pressed={view === "oct"} onClick={() => switchView("oct")}>
                Retina layers (OCT)
              </button>
            </div>
          </div>

          <EyeAvatar view={view} states={avatarStates} selectedId={selectedId} onSelect={(id) => selectPart(id)} />

          <div className="legend" aria-hidden="true">
            <span>
              <i className="dot" /> Normal
            </span>
            <span>
              <i className="dot dot-warning" /> Watch
            </span>
            <span>
              <i className="dot dot-alert" /> Alert
            </span>
            <span>
              <i className="dot dot-selected" /> Selected
            </span>
          </div>

          <PartChips view={view} statusById={statusById} selectedId={selectedId} onSelect={(id) => selectPart(id)} />
        </section>
        <SharedNote />
      </div>

      <aside className="home-side" ref={panelRef} aria-label="Details">
        {eye.loading ? <Loading what="eye details" /> : <PartPanel partId={selectedId} partStatus={parts[selectedId]} />}
        {checkups.data && <CheckupWidget checkups={checkups.data} />}
      </aside>
    </div>
  );
}
