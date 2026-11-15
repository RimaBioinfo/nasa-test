import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkline } from "../components/charts.jsx";
import { CheckupWidget } from "../components/CheckupWidget.jsx";
import { Icon } from "../components/Icon.jsx";
import { CheckupStatusPill, ErrorBox, Loading, SharedNote } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getCheckups, saveExperimentResult } from "../services/api.js";

function trendText(history) {
  if (!history || history.length < 2) return null;
  const first = history[0].value;
  const last = history[history.length - 1].value;
  if (typeof first !== "number" || typeof last !== "number") return null;
  if (last === first) return `Steady since ${history[0].date}`;
  return `${last > first ? "Up" : "Down"} from ${first} on ${history[0].date}`;
}

function CheckupCard({ c }) {
  const trend = trendText(c.history);
  return (
    <article className="panel checkup-card" id={c.id} aria-labelledby={`${c.id}-name`}>
      <div className="checkup-card-head">
        <h3 id={`${c.id}-name`}>{c.name}</h3>
        <CheckupStatusPill status={c.status} />
      </div>
      <p className="muted small">Last result</p>
      <p className="last">{c.lastResult}</p>
      {c.history?.length > 1 && (
        <Sparkline data={c.history} unit={c.unit} label={`${c.name} trend. ${trend ?? ""}`} />
      )}
      <div className="meta">
        <span>{trend}</span>
        <span>Next: {c.nextDue}</span>
      </div>
      {c.steps && c.status !== "done" && (
        <Link className="btn btn-primary" to={`/run/checkup/${c.id}`}>
          Start test <Icon name="arrowRight" size={18} />
        </Link>
      )}
    </article>
  );
}

const SYMPTOMS = [
  { id: "headache", label: "Headache" },
  { id: "blur", label: "Blurry vision" },
  { id: "pressure", label: "Pressure feeling in the eyes" },
];
const LEVELS = ["None", "Mild", "Moderate", "Strong"];

function SymptomCheckin({ checkup }) {
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const complete = SYMPTOMS.every((s) => answers[s.id]);
  const worrying = Object.values(answers).some((v) => v === "Strong");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(await saveExperimentResult("symptoms", answers));
    setSaving(false);
  };

  return (
    <section className="panel" aria-labelledby="symptom-title">
      <div className="panel-head">
        <div>
          <h3 id="symptom-title">Symptom check-in</h3>
          <p className="muted small">How do you feel right now? Takes 30 seconds.</p>
        </div>
        {checkup && <CheckupStatusPill status={saved ? "done" : checkup.status} />}
      </div>
      {saved ? (
        <div>
          <p className="saved-msg">
            <Icon name="check" /> Check-in saved.
          </p>
          {worrying && (
            <p className="offline-note" role="alert">
              <Icon name="alert" size={18} />
              You reported a strong symptom. Open the emergency protocol on the Risk page and follow the steps. You
              don&apos;t need to wait for Earth.
            </p>
          )}
          <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { setSaved(null); setAnswers({}); }}>
            New check-in
          </button>
        </div>
      ) : (
        <form className="symptom-form" onSubmit={submit}>
          {SYMPTOMS.map((s) => (
            <fieldset key={s.id} className="symptom-q">
              <legend>{s.label}</legend>
              <div className="choice-row">
                {LEVELS.map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    className="choice"
                    aria-pressed={answers[s.id] === lvl}
                    onClick={() => setAnswers((a) => ({ ...a, [s.id]: lvl }))}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={!complete || saving}>
              {saving ? "Saving…" : "Save check-in"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

const SECTIONS = [
  { id: "daily", title: "Daily", intro: "Vitals recorded by your Astroskin smart shirt (Canadian Space Agency), plus a short symptom check-in." },
  { id: "weekly", title: "Weekly", intro: "Quick vision tests you do yourself on the tablet." },
  { id: "monthly", title: "Monthly", intro: "Imaging and pressure tests, done with a crewmate's help." },
];

export default function CheckupsPage() {
  const { data, loading, error } = useApi(getCheckups);

  return (
    <div>
      <h1 className="page-title">Checkups</h1>
      <p className="page-intro">Your regular health checks: last result, trend and when the next one is due.</p>
      <SharedNote />
      {data && (
        <div style={{ maxWidth: 520, marginTop: 16 }}>
          <CheckupWidget checkups={data} title="At a glance" showSeeAll={false} />
        </div>
      )}
      {loading && <Loading what="checkups" />}
      {error && <ErrorBox error={error} />}
      {data &&
        SECTIONS.map((s) => {
          const items = data.filter((c) => c.frequency === s.id);
          const vitals = items.filter((c) => c.id !== "symptoms");
          const symptoms = items.find((c) => c.id === "symptoms");
          const todo = items.filter((c) => c.status !== "done").length;
          return (
            <section key={s.id} className="section" aria-labelledby={`sec-${s.id}`}>
              <div className="section-head">
                <h2 id={`sec-${s.id}`}>{s.title}</h2>
                <span className="muted small">{todo > 0 ? `${todo} to do` : "All done"}</span>
              </div>
              <p className="muted" style={{ marginBottom: 12 }}>
                {s.intro}
              </p>
              {s.id === "daily" && (
                <div style={{ marginBottom: 14 }}>
                  <SymptomCheckin checkup={symptoms} />
                </div>
              )}
              <div className="card-grid">
                {vitals.map((c) => (
                  <CheckupCard key={c.id} c={c} />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
