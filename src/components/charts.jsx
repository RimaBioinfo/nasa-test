import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* One data hue for all single-series charts; status colors stay reserved for state. */
export const CHART = {
  line: "#6FB9DC",
  grid: "#22364F",
  axis: "#8FA3BA",
  limit: "#8FA3BA",
};
const AXIS_TICK = { fill: CHART.axis, fontSize: 12, fontFamily: "Barlow, sans-serif" };

export function ChartTip({ active, payload, label, unit, labelPrefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <div className="muted">
        {labelPrefix}
        {label}
      </div>
      <div>
        <strong>{payload[0].value}</strong> {unit}
      </div>
    </div>
  );
}

/** Tiny trend line with hover tooltip; x = date label, y = value. */
export function Sparkline({ data, unit, xKey = "date", label }) {
  return (
    <div className="spark" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, bottom: 2, left: 6 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <XAxis dataKey={xKey} hide />
          <Tooltip content={<ChartTip unit={unit} />} cursor={{ stroke: CHART.grid }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART.line}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "#15263A", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Line chart over mission days with an optional dashed limit line. */
export function TrendChart({ data, unit, xKey = "day", yKey = "value", limit, limitLabel = "Upper limit", height }) {
  return (
    <div className="chart-box" style={height ? { height } : undefined}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
            tickFormatter={(d) => `Day ${d}`}
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
          <Tooltip content={<ChartTip unit={unit} labelPrefix="Day " />} cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }} />
          {limit != null && (
            <ReferenceLine
              y={limit}
              stroke={CHART.limit}
              strokeDasharray="5 4"
              label={{ value: `${limitLabel} ${limit}`, position: "insideTopLeft", fill: CHART.axis, fontSize: 12 }}
            />
          )}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={CHART.line}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART.line, strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: "#15263A", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
