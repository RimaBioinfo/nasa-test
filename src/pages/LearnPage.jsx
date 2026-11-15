import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EyeAvatar } from "../components/EyeAvatar.jsx";
import { TrendChart } from "../components/charts.jsx";
import { Icon } from "../components/Icon.jsx";
import { PARTS_BY_ID, partLabels, SEVERITY_TEXT, STATUS_TEXT } from "../components/parts.js";
import { ErrorBox, Loading, PlaceholderNote } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getEyeStatus, getPartInfo } from "../services/api.js";

const isMeasured = (s) => s && s.value != null && s.value !== "Not measured";

/** /learn/:partId: the same layout for every part. */
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

  const back = (
    <Link to="/learn" className="btn btn-ghost back-btn">
      <Icon name="arrowLeft" size={20} /> All parts
    </Link>
  );

  if (!part) {
    return (
      <div className="learn-page">
        {back}
        <h1>Part not found</h1>
        <p className="muted">There is no page for &ldquo;{partId}&rdquo;.</p>
      </div>
    );
  }

  const data = info.data;
  const labels = partLabels(partId);
  const plain = data?.plain ?? labels.plain;
  const medical = part.name !== plain ? part.name : null;
  const s = parts?.[partId];

  return (
    <div className="learn-page">
      {back}

      <div className="learn-eye">
        <EyeAvatar
          view={part.view}
          states={states}
          selectedId={partId}
          onSelect={(id) => id !== partId && navigate(`/learn/${id}`)}
        />
      </div>

      <h1>
        {plain}
        {medical && <span className="term">{medical}</span>}
      </h1>

      {info.error && <ErrorBox error={info.error} />}
      {info.loading ? (
        <Loading what="part details" />
      ) : (
        <>
          <section aria-labelledby="what-title">
            <h2 id="what-title">What it is</h2>
            <p>{data?.whatItIs ?? part.info}</p>
          </section>

          <section aria-labelledby="space-title">
            <h2 id="space-title">Why it matters in space</h2>
            <p>{data?.whySpace ?? "Text to be written."}</p>
          </section>

          {isMeasured(s) && (
            <section aria-labelledby="result-title">
              <h2 id="result-title">Your latest result</h2>
              <p className="result-value">
                {s.value} <span className="muted">{s.unit}</span>
              </p>
              <p className="muted">Normal: {s.normalRange}</p>
              <p className="next-step-sev" style={{ marginTop: 4 }}>
                <span className={`dot dot-${s.status}`} aria-hidden="true" />
                {STATUS_TEXT[s.status]}
                {s.status !== "normal" && <span className="muted">· {SEVERITY_TEXT[s.status]}</span>}
              </p>
              <p style={{ marginTop: 8 }}>{s.meaning}</p>
              {s.history?.length > 1 && (
                <div style={{ marginTop: 12 }} role="img" aria-label={`Trend of ${plain} over the mission`}>
                  <TrendChart data={s.history} unit={s.unit} height={170} />
                </div>
              )}
            </section>
          )}

          <section aria-labelledby="measured-title">
            <h2 id="measured-title">How it&apos;s measured</h2>
            {data?.howMeasured?.length ? (
              <ul className="plain-list">
                {data.howMeasured.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Not measured on board.</p>
            )}
          </section>

          {data?.related?.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title">Related parts</h2>
              <ul className="part-list">
                {data.related.map((id) => {
                  const st = parts?.[id]?.status;
                  return (
                    <li key={id}>
                      <Link to={`/learn/${id}`} className="part-row">
                        <span className={`dot ${st ? `dot-${st}` : "dot-none"}`} aria-hidden="true" />
                        <span className="part-row-name">{partLabels(id).plain}</span>
                        {st && <span className="visually-hidden">, {STATUS_TEXT[st]}</span>}
                        <Icon name="arrowRight" size={18} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="sources-title">
            <h2 id="sources-title">Sources</h2>
            {data?.sources?.length ? (
              <ul className="plain-list">
                {data.sources.map((src) => (
                  <li key={src.url ?? src.title}>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer">
                        {src.title}
                      </a>
                    ) : (
                      src.title
                    )}
                    <span className="muted">
                      {" "}
                      · {src.authors}
                      {src.year ? `, ${src.year}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Sources coming soon</p>
            )}
          </section>

          <PlaceholderNote />
        </>
      )}
    </div>
  );
}
