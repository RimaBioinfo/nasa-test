import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeAvatar } from "../components/EyeAvatar.jsx";
import { AlertCard } from "../components/AlertCard.jsx";
import { NextStepCard, pickNextStep } from "../components/NextStepCard.jsx";
import { MessageSurgeonButton } from "../components/MessageSurgeonButton.jsx";
import { Sheet } from "../components/Sheet.jsx";
import { Icon } from "../components/Icon.jsx";
import { PARTS_BY_ID, partLabels, SEVERITY_TEXT } from "../components/parts.js";
import { Loading } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getAlerts, getCheckups, getEyeStatus } from "../services/api.js";

const RANK = { alert: 0, warning: 1 };

/*
 * Home answers two questions in 3 seconds: "Am I okay?" and "What do I do now?"
 * Keep it to: status line (in Layout), next step, the eye, and the problem list.
 */
export default function HomePage() {
  const navigate = useNavigate();
  const eye = useApi(getEyeStatus);
  const alerts = useApi(getAlerts);
  const checkups = useApi(getCheckups);

  const [openPart, setOpenPart] = useState(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const parts = eye.data?.parts;
  const states = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(parts ?? {})
          .filter(([, p]) => p.status !== "normal")
          .map(([id, p]) => [id, p.status]),
      ),
    [parts],
  );

  // problems: alerts first, whole-eye parts before retina layers, max 3
  const problems = Object.keys(states)
    .sort(
      (a, b) =>
        RANK[states[a]] - RANK[states[b]] ||
        (PARTS_BY_ID[a]?.view === "eye" ? 0 : 1) - (PARTS_BY_ID[b]?.view === "eye" ? 0 : 1),
    )
    .slice(0, 3);

  const alertList = alerts.data ?? [];
  const checkupList = checkups.data ?? [];
  const step = pickNextStep(alertList, checkupList);
  const others = alertList.filter((a) => step.type !== "alert" || a.id !== step.alert.id);
  const problemText = (id) =>
    alertList.find((a) => a.kind === "warning" && a.partId === id)?.title ?? `${partLabels(id).plain} needs checking`;

  const startCheckup = (id) => navigate(`/run/checkup/${id}`);
  const showPart = (id) => {
    setAlertsOpen(false);
    setOpenPart(id);
  };

  // what the one big button does
  let card = null;
  if (step.type === "alert") {
    const a = step.alert;
    const checkup = checkupList.find((c) => c.id === a.checkupId);
    card = {
      title: a.title,
      severity: a.kind === "task" ? "warning" : a.severity,
      seriousness: a.kind === "task" ? "Test due today" : SEVERITY_TEXT[a.severity],
      todo: a.partId ? (parts?.[a.partId]?.action ?? a.body) : a.body,
      ...(checkup?.steps
        ? { actionLabel: `Start ${checkup.name.toLowerCase()}`, onAction: () => startCheckup(checkup.id) }
        : a.partId
          ? { actionLabel: "See what to do", onAction: () => showPart(a.partId) }
          : {}),
    };
  } else if (step.type === "checkup") {
    const c = step.checkup;
    card = {
      title: `${c.name} is overdue`,
      severity: "warning",
      seriousness: `It was due on ${c.nextDue}`,
      todo: null,
      ...(c.steps ? { actionLabel: "Start test", onAction: () => startCheckup(c.id) } : {}),
    };
  } else {
    card = { title: "Nothing to do right now", severity: "normal", todo: "No tests are due and your eyes look normal." };
  }

  const loading = eye.loading || alerts.loading || checkups.loading;
  const sel = openPart && parts?.[openPart];
  const selLabels = openPart && partLabels(openPart);

  return (
    <div className="home">
      <h1 className="visually-hidden">Home</h1>

      {loading ? (
        <Loading what="your status" />
      ) : (
        <div>
          <NextStepCard {...card} />
          {others.length > 0 && (
            <button type="button" className="link-btn more-alerts" onClick={() => setAlertsOpen(true)}>
              {others.length} more {others.length === 1 ? "alert" : "alerts"}
            </button>
          )}
        </div>
      )}

      <section aria-label="Your eye">
        <EyeAvatar
          view="eye"
          states={states}
          selectedId={openPart ?? undefined}
          onSelect={(id) => states[id] && setOpenPart(id)}
        />
      </section>

      {parts && (
        <section aria-labelledby="problems-title">
          <h2 id="problems-title" className="visually-hidden">
            Problems
          </h2>
          {problems.length === 0 ? (
            <p className="all-normal">
              <Icon name="check" /> All eye checks normal
            </p>
          ) : (
            <ul className="problem-list">
              {problems.map((id) => (
                <li key={id}>
                  <button type="button" className="problem-row" onClick={() => setOpenPart(id)}>
                    <span className={`dot dot-${states[id]}`} aria-hidden="true" />
                    <span className="problem-text">
                      {problemText(id)}
                      <span className="visually-hidden">, {SEVERITY_TEXT[states[id]]}</span>
                    </span>
                    <span className="problem-cta">
                      See what to do <Icon name="arrowRight" size={18} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Sheet open={!!sel} onClose={() => setOpenPart(null)} title={selLabels?.plain ?? ""}>
        {sel && (
          <div className="problem-panel">
            {selLabels.medical && <p className="muted">{selLabels.medical}</p>}
            <div>
              <h3>What happened</h3>
              <p>{sel.meaning}</p>
              <p className="muted">
                Measured {sel.value} {sel.unit}, normal {sel.normalRange}
              </p>
            </div>
            <div>
              <h3>How serious</h3>
              <p className="next-step-sev">
                <span className={`dot dot-${sel.status}`} aria-hidden="true" />
                {SEVERITY_TEXT[sel.status]}
              </p>
            </div>
            <div>
              <h3>What to do now</h3>
              <p>{sel.action}</p>
            </div>
            <div className="btn-row">
              <Link className="btn" to={`/learn/${openPart}`}>
                Read more
              </Link>
              {sel.status === "alert" && <MessageSurgeonButton context={selLabels.plain} />}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={alertsOpen} onClose={() => setAlertsOpen(false)} title="Other alerts">
        <div className="alert-stack">
          {others.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              onDetails={(al) => al.partId && showPart(al.partId)}
              onStart={(al) => al.checkupId && startCheckup(al.checkupId)}
            />
          ))}
        </div>
      </Sheet>
    </div>
  );
}
