import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { ErrorBox, Loading, SharedNote } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getExperimentResults, getExperiments } from "../services/api.js";

export default function ExperimentsPage() {
  const { data, loading, error } = useApi(getExperiments);
  const results = useApi(getExperimentResults);
  const nameById = Object.fromEntries((data ?? []).map((e) => [e.id, e.name]));

  return (
    <div>
      <h1 className="page-title">Experiments</h1>
      <p className="page-intro">
        Extra self-tests you can run any time. Each one guides you step by step, one instruction per screen.
      </p>
      <SharedNote />

      {loading && <Loading what="experiments" />}
      {error && <ErrorBox error={error} />}
      {data && (
        <div className="card-grid section" style={{ marginTop: 16 }}>
          {data.map((e) => (
            <article key={e.id} className="panel exp-card" aria-labelledby={`exp-${e.id}`}>
              <h2 id={`exp-${e.id}`}>{e.name}</h2>
              <p>{e.description}</p>
              <p className="meta">
                <Icon name="clock" size={16} /> About {e.durationMin} min · {e.steps.length - 1} steps
              </p>
              <Link className="btn btn-primary" to={`/run/experiment/${e.id}`}>
                Start <Icon name="arrowRight" size={18} />
              </Link>
            </article>
          ))}
        </div>
      )}

      {results.data?.length > 0 && (
        <section className="panel section" aria-labelledby="results-title">
          <h2 id="results-title" style={{ marginBottom: 10 }}>
            Saved this session
          </h2>
          <ul className="checkup-list">
            {[...results.data].reverse().map((r) => (
              <li key={r.id} className="checkup-row">
                <div>
                  <p className="checkup-row-name">{nameById[r.experimentId] ?? r.experimentId}</p>
                  <p className="checkup-row-sub">
                    {Object.keys(r.answers).length} answers ·{" "}
                    {new Date(r.savedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="pill pill-done">
                  <Icon name="check" size={15} /> Saved
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
