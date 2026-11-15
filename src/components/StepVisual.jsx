/* Optional visual aids shown next to a guided-test instruction. */

function AmslerGrid() {
  const lines = [];
  for (let i = 0; i <= 20; i++) {
    const p = 10 + i * 15;
    lines.push(<line key={`v${i}`} x1={p} y1="10" x2={p} y2="310" />);
    lines.push(<line key={`h${i}`} x1="10" y1={p} x2="310" y2={p} />);
  }
  return (
    <svg viewBox="0 0 320 320" role="img" aria-label="Amsler grid: a square grid of straight lines with a dot in the centre">
      <rect x="10" y="10" width="300" height="300" fill="#F4F6F8" />
      <g stroke="#1B2533" strokeWidth="1">{lines}</g>
      <circle cx="160" cy="160" r="5" fill="#1B2533" />
    </svg>
  );
}

const ROWS = ["E", "F P", "T O Z", "L P E D", "P E C F D", "E D F C Z P"];

function LetterChart({ fading }) {
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label={fading ? "Letter chart with rows getting fainter" : "Letter chart with rows getting smaller"}>
      <rect width="320" height="300" fill="#F4F6F8" rx="6" />
      {ROWS.map((row, i) => (
        <text
          key={row}
          x="160"
          y={50 + i * 44}
          textAnchor="middle"
          fontFamily="Barlow, sans-serif"
          fontWeight="600"
          fontSize={fading ? 30 : 40 - i * 5.5}
          letterSpacing="6"
          fill="#111"
          fillOpacity={fading ? 1 - i * 0.17 : 1}
        >
          {row}
        </text>
      ))}
    </svg>
  );
}

/** Pick a visual for a step, based on the test id and the step text. */
export function StepVisual({ testId, text }) {
  const t = text.toLowerCase();
  if (testId === "amsler" && (t.includes("grid") || t.includes("lines") || t.includes("dot"))) return <AmslerGrid />;
  if (testId === "contrast" && t.includes("chart")) return <LetterChart fading />;
  if (testId === "visual-acuity" && (t.includes("letters") || t.includes("row"))) return <LetterChart />;
  return null;
}
