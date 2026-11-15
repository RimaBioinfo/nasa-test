import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, TrendChart } from "../components/charts.jsx";
import { Icon } from "../components/Icon.jsx";
import { MessageSurgeonButton } from "../components/MessageSurgeonButton.jsx";
import { ErrorBox, Loading, PlaceholderNote, RiskBadge, SharedNote } from "../components/ui.jsx";
import { useApi } from "../hooks/useApi.js";
import { getRiskScore, getTreatments } from "../services/api.js";

const GROUP_COLOR = { low: "#4D6582", medium: "#FFD23F", high: "#FF4D4D" };
const GROUP_TEXT = { low: "Low", medium: "Medium", high: "High" };

/** Semicircle gauge for a 0–100 score. */
function Gauge({ score, group }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const angle = Math.PI * (1 - pct);
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  const track = `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`;
  const fill = `M${cx - r},${cy} A${r},${r} 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}`;
  return (
    <svg className="gauge" viewBox="0 0 200 120" role="img" aria-label={`SANS risk score ${score} out of 100, ${GROUP_TEXT[group]} risk`}>
      <path d={track} fill="none" stroke="#2A3E57" strokeWidth="16" strokeLinecap="round" />
      {pct > 0 && <path d={fill} fill="none" stroke={GROUP_COLOR[group]} strokeWidth="16" strokeLinecap="round" />}
      <text x={cx} y={cy - 12} textAnchor="middle" className="gauge-score" fontSize="44" fill="#E6EDF5">
        {score}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="12" fill="#8FA3BA" fontFamily="Barlow, sans-serif">
        out of 100
      </text>
      <text x={cx - r} y={cy + 18} textAnchor="middle" fontSize="11" fill="#8FA3BA" fontFamily="Barlow, sans-serif">
        0
      </text>
      <text x={cx + r} y={cy + 18} textAnchor="middle" fontSize="11" fill="#8FA3BA" fontFamily="Barlow, sans-serif">
        100
      </text>
    </svg>
  );
}

function ContributionTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload;
  return (
    <div className="chart-tip">
      <div>{f.name}</div>
      <div className="muted">
        {f.value} {f.unit} × weight {f.weight}
      </div>
      <div>
        <strong>{f.contribution}</strong> points
      </div>
    </div>
  );
}

export default function RiskPage() {
  const risk = useApi(getRiskScore);
  const treat = useApi(getTreatments);
  const r = risk.data;
  const features = r ? [...r.features].sort((a, b) => b.contribution - a.contribution) : [];
  const total = features.reduce((s, f) => s + f.contribution, 0);

  return (
    <div>
      <h1 className="page-title">Risk and treatment</h1>
      <p className="page-intro">
        Your SANS risk score, what drives it, how it changed over the mission, and what to do about it.
      </p>
      <PlaceholderNote />

      {risk.loading && <Loading what="risk score" />}
      {risk.error && <ErrorBox error={risk.error} />}

      {r && (
        <>
          <div className="risk-top section" style={{ marginTop: 20 }}>
            <section className="panel gauge-wrap" aria-labelledby="score-title">
              <h2 id="score-title">SANS risk score</h2>
              <Gauge score={r.score} group={r.group} />
              <RiskBadge group={r.group} />
              <p className="muted small">
                Calculated on Earth from your latest biomarkers. Higher means a higher chance of SANS getting worse.
              </p>
            </section>

            <section className="panel" aria-labelledby="contrib-title">
              <h2 id="contrib-title">What drives your score</h2>
              <p className="muted small" style={{ marginBottom: 8 }}>
                Each biomarker adds points: its value (scaled 0–1) times its weight.
              </p>
              <div className="chart-box" style={{ height: 300 }} role="img" aria-label="Bar chart of each biomarker's contribution to the risk score. The same numbers are in the table below.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={features} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }} barCategoryGap={6}>
                    <CartesianGrid stroke={CHART.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fill: CHART.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART.grid }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={200}
                      tick={{ fill: "#C3D0DE", fontSize: 12, fontFamily: "Barlow, sans-serif" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ContributionTip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="contribution" fill={CHART.line} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="panel section" aria-labelledby="table-title">
            <h2 id="table-title" style={{ marginBottom: 10 }}>
              Biomarkers
            </h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">Biomarker</th>
                    <th scope="col" className="num">
                      Value
                    </th>
                    <th scope="col" className="num">
                      Weight
                    </th>
                    <th scope="col" className="num">
                      Contribution
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.id}>
                      <td>{f.name}</td>
                      <td className="num">
                        {f.value} {f.unit}
                      </td>
                      <td className="num">{f.weight.toFixed(2)}</td>
                      <td className="num">{f.contribution.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td />
                    <td className="num">{features.reduce((s, f) => s + f.weight, 0).toFixed(2)}</td>
                    <td className="num">{total.toFixed(1)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="section" aria-labelledby="trends-title">
            <div className="section-head">
              <h2 id="trends-title">Trends over the mission</h2>
            </div>
            <div className="trend-grid">
              <article className="panel trend-card">
                <h3>Risk score</h3>
                <TrendChart data={r.history} xKey="day" yKey="score" unit="points" height={180} />
              </article>
              {(r.trends ?? []).map((t) => (
                <article key={t.id} className="panel trend-card">
                  <h3>
                    {t.name} <span className="muted small">({t.unit})</span>
                  </h3>
                  <TrendChart data={t.points} unit={t.unit} limit={t.limit} limitLabel="Limit" height={180} />
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {treat.loading && <Loading what="treatment plan" />}
      {treat.error && <ErrorBox error={treat.error} />}
      {treat.data && (
        <div className="two-col section">
          <section className="panel" aria-labelledby="prev-title">
            <h2 id="prev-title">Prevention (before the hazard)</h2>
            <p className="muted small" style={{ margin: "4px 0 12px" }}>
              Measures for your current risk group{r ? `: ${GROUP_TEXT[r.group]}` : ""}.
            </p>
            <ul className="prevention-list">
              {treat.data.prevention.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}</strong>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 14 }}>
              <PlaceholderNote />
            </div>
          </section>

          <section className="panel emergency" aria-labelledby="emerg-title" id="emergency">
            <h2 id="emerg-title">Emergency protocol</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Use this if your vision suddenly gets worse or you have a strong headache.
            </p>
            <p className="offline-note">
              <Icon name="clock" size={18} />
              <span>
                You can do every step on board. Don&apos;t wait for Earth: messages can take 20 minutes each way.
              </span>
            </p>
            <ol className="emergency-steps">
              {treat.data.emergency.map((s) => (
                <li key={s.step}>
                  <span className="step-num" aria-hidden="true">
                    {s.step}
                  </span>
                  <div>
                    <h3>
                      <span className="visually-hidden">Step {s.step}: </span>
                      {s.title}
                    </h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <MessageSurgeonButton variant="btn-danger" context="Emergency protocol started" />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <SharedNote />
              <PlaceholderNote />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
