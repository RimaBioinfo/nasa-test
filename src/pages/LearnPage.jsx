import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EyeAvatar } from "../components/EyeAvatar.jsx";
import { PartChips } from "../components/PartChips.jsx";
import { Icon } from "../components/Icon.jsx";
import { PARTS_BY_ID, partLabels, STATUS_TEXT } from "../components/parts.js";
import { ErrorBox, Loading, PlaceholderNote, StatusPill } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getEyeStatus, getPartInfo } from "../services/api.js";

export default function LearnPage() {
  const { partId } = useParams();
  const navigate = useNavigate();
  const part = PARTS_BY_ID[partId];
  const info = useApi(() => getPartInfo(partId), [partId]);
  const eye = useApi(getEyeStatus);

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
  const statusById = useMemo(
    () => Object.fromEntries(Object.entries(parts ?? {}).map(([id, p]) => [id, p.status])),
    [parts],
  );

  // the view follows the part being read, and can be switched by hand
  const [view, setView] = useState(part?.view ?? "eye");
  useEffect(() => {
    if (part) setView(part.view);
  }, [part]);

  if (!part) {
    return (
      <section className="panel">
        <h1>Part not found</h1>
        <p className="muted" style={{ margin: "8px 0 16px" }}>
          We don&apos;t have a page for &ldquo;{partId}&rdquo;.
        </p>
        <Link className="btn" to="/">
          Back to home
        </Link>
      </section>
    );
  }

  const { plain, medical } = partLabels(partId);
  const status = parts?.[partId];
  const data = info.data;

  return (
    <div>
      <Link to="/" className="back-link">
        <Icon name="arrowLeft" size={18} /> Back to your eye
      </Link>
      <h1 className="page-title">
        {plain}
        {medical && <span className="term">{medical}</span>}
      </h1>
      <p className="page-intro">{data?.plain && data.plain !== plain ? data.plain : part.group}</p>

      <div className="learn-grid">
        <div className="learn-main">
          {info.error && <ErrorBox error={info.error} />}

          <section className="panel" aria-labelledby="what-title">
            <h2 id="what-title">What it is</h2>
            <p style={{ marginTop: 8 }}>
              {part.info}
            </p>
          </section>

          <section className="panel" aria-labelledby="space-title">
            <h2 id="space-title">Why it matters in space</h2>
            {info.loading ? (
              <Loading what="details" />
            ) : (
              <p style={{ marginTop: 8 }}>
                {data?.whySpace ??
                  "This part is not a main focus of SANS monitoring, so there is no space-specific guidance for it yet."}
              </p>
            )}
          </section>

          <section className="panel" aria-labelledby="numbers-title">
            <h2 id="numbers-title">What your numbers mean</h2>
            {eye.loading ? (
              <Loading what="your numbers" />
            ) : status ? (
              <div style={{ marginTop: 10 }}>
                <div className="status-row" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <StatusPill status={status.status} />
                </div>
                <div className="measure">
                  <p className="measure-value">
                    {status.value} <small>{status.unit}</small>
                  </p>
                  <p className="measure-range">Normal: {status.normalRange}</p>
                </div>
                <p>{status.meaning}</p>
                <p style={{ marginTop: 8 }}>
                  <strong>What to do: </strong>
                  {status.action}
                </p>
              </div>
            ) : (
              <p style={{ marginTop: 8 }} className="muted">
                This part is not measured in your regular checkups.
              </p>
            )}
          </section>

          <section className="panel" aria-labelledby="measured-title">
            <h2 id="measured-title">How it is measured</h2>
            {info.loading ? (
              <Loading what="methods" />
            ) : data?.howMeasured?.length ? (
              <ul className="method-list" style={{ marginTop: 10 }}>
                {data.howMeasured.map((m) => (
                  <li key={m}>
                    <Icon name="clipboard" size={20} />
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 8 }} className="muted">
                Not measured on board.
              </p>
            )}
          </section>

          <PlaceholderNote />
        </div>

        <aside className="learn-side">
          <section className="eye-stage" aria-label={`Where the ${plain.toLowerCase()} is`}>
            <div className="seg tabs" role="group" aria-label="Eye view" style={{ marginBottom: 10 }}>
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
              selectedId={partId}
              onSelect={(id) => id !== partId && navigate(`/learn/${id}`)}
            />
            <p className="muted small" style={{ marginTop: 8 }}>
              Highlighted in green. Tap a part or a chip to learn about it.
            </p>
            <PartChips
              view={view}
              statusById={statusById}
              selectedId={partId}
              onSelect={(id) => id !== partId && navigate(`/learn/${id}`)}
            />
          </section>

          {data?.related?.length > 0 && (
            <section className="panel" aria-labelledby="related-title">
              <h2 id="related-title" style={{ marginBottom: 12 }}>
                Related parts
              </h2>
              <div className="chips">
                {data.related.map((id) => {
                  const st = parts?.[id]?.status ?? "normal";
                  return (
                    <Link key={id} to={`/learn/${id}`} className={`chip st-${st}`} style={{ textDecoration: "none" }}>
                      <span className={`dot dot-${st}`} aria-hidden="true" />
                      {partLabels(id).plain}
                      <span className="visually-hidden">, {STATUS_TEXT[st]}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
