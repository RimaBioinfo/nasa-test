import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ALL_PARTS, EyeAvatar } from "../components/EyeAvatar.jsx";
import { partLabels, STATUS_TEXT } from "../components/parts.js";
import { useApi } from "../hooks/useApi.js";
import { getEyeStatus } from "../services/api.js";

/** Group a view's parts by their `group` field, in drawing order (OCT listed inner → outer). */
function groupParts(view) {
  const parts = ALL_PARTS.filter((p) => p.view === view);
  const ordered = view === "oct" ? [...parts].reverse() : parts;
  const groups = [];
  for (const p of ordered) {
    let g = groups.find((x) => x.name === p.group);
    if (!g) groups.push((g = { name: p.group, parts: [] }));
    g.parts.push(p);
  }
  return groups;
}

export default function LearnHomePage() {
  const navigate = useNavigate();
  const eye = useApi(getEyeStatus);
  const [view, setView] = useState("eye");
  const [hoverId, setHoverId] = useState(null);

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
  const groups = useMemo(() => groupParts(view), [view]);

  return (
    <div className="learn-home">
      <div>
        <h1 className="page-title">Learn</h1>
        <p className="muted">Tap a part of the eye to learn what it is and why it matters in space.</p>
      </div>

      <section aria-label="Eye">
        <div className="seg tabs" role="group" aria-label="Eye view" style={{ marginBottom: 12 }}>
          <button type="button" aria-pressed={view === "eye"} onClick={() => setView("eye")}>
            Whole eye
          </button>
          <button type="button" aria-pressed={view === "oct"} onClick={() => setView("oct")}>
            Retina layers (OCT)
          </button>
        </div>
        <EyeAvatar
          view={view}
          states={states}
          selectedId={hoverId ?? undefined}
          onSelect={(id) => navigate(`/learn/${id}`)}
          onHover={setHoverId}
        />
      </section>

      <section aria-labelledby="parts-title">
        <h2 id="parts-title" className="visually-hidden">
          All parts
        </h2>
        <div className="part-groups">
          {groups.map((g) => (
            <div key={g.name}>
              <h3 className="part-group-title">{g.name}</h3>
              <ul className="part-list">
                {g.parts.map((p) => {
                  const st = parts?.[p.id]?.status;
                  const { plain, medical } = partLabels(p.id);
                  return (
                    <li key={p.id}>
                      <Link
                        to={`/learn/${p.id}`}
                        className="part-row"
                        onMouseEnter={() => setHoverId(p.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onFocus={() => setHoverId(p.id)}
                        onBlur={() => setHoverId(null)}
                      >
                        <span className={`dot ${st ? `dot-${st}` : "dot-none"}`} aria-hidden="true" />
                        <span className="part-row-name">
                          {plain}
                          {medical && <span className="muted"> · {medical}</span>}
                        </span>
                        {st && <span className="visually-hidden">, {STATUS_TEXT[st]}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
