import React, { useEffect, useMemo, useState } from "react";

const YEARS = [2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2065, 2070, 2075];
const STAGE_WINDOWS = [
  "2025–2030",
  "2030–2035",
  "2035–2040",
  "2040–2045",
  "2045–2050",
  "2050–2055",
  "2055–2060",
  "2060–2065",
  "2065–2070",
  "2070–2075",
];

const DEFAULT = {
  wind: 0,
  solar: 0,
  support: 0,
  retire: 0,
  schools: 55,
  transport: 55,
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function TooltipShell({ text, children, position = "top" }) {
  const positionClass =
    position === "bottom"
      ? "tooltip-bottom"
      : position === "right"
      ? "tooltip-right"
      : position === "left"
      ? "tooltip-left"
      : "tooltip-top";

  return (
    <div className="tooltip-shell">
      {children}
      <div className={`tooltip-box ${positionClass}`}>{text}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <div className={`card-title ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = "", disabled = false }) {
  return (
    <button className={`button ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

function Progress({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  );
}

function GaugeDial({ label, value, emoji, dangerHigh = false, goodHigh = false, tooltip }) {
  const angle = -130 + (clamp(value, 0, 100) / 100) * 260;
  const isGreen = goodHigh ? value >= 70 : value <= 40;
  const isYellow = goodHigh ? value >= 45 && value < 70 : value > 40 && value <= 70;
  const isRed = !isGreen && !isYellow;

  return (
    <TooltipShell text={tooltip}>
      <Card className="gauge-card">
        <CardHeader className="gauge-header">
          <CardTitle className="gauge-title">
            <span className="gauge-emoji">{emoji}</span> {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="gauge-content">
          <div className="gauge-wrap">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              {goodHigh ? (
                <>
                  <path d={arcPath(100, 100, 72, -130, -20)} stroke="#ef4444" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path d={arcPath(100, 100, 72, -20, 40)} stroke="#eab308" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path d={arcPath(100, 100, 72, 40, 130)} stroke="#22c55e" strokeWidth="12" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d={arcPath(100, 100, 72, -130, -20)} stroke="#22c55e" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path d={arcPath(100, 100, 72, -20, 40)} stroke="#eab308" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path d={arcPath(100, 100, 72, 40, 130)} stroke="#ef4444" strokeWidth="12" fill="none" strokeLinecap="round" />
                </>
              )}
              <path d={arcPath(100, 100, 56, -130, 130)} stroke="#3f3f46" strokeWidth="2" fill="none" />
              {[0, 25, 50, 75, 100].map((t) => {
                const a = -130 + (t / 100) * 260;
                const p1 = polarToCartesian(100, 100, 52, a);
                const p2 = polarToCartesian(100, 100, 64, a);
                return <line key={t} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#a1a1aa" strokeWidth="2" />;
              })}
              <line
                x1="100"
                y1="100"
                x2={polarToCartesian(100, 100, 48, angle).x}
                y2={polarToCartesian(100, 100, 48, angle).y}
                stroke={isRed ? "#f43f5e" : isYellow ? "#eab308" : "#22c55e"}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="6" fill="#fafafa" />
            </svg>
            <div className="gauge-value-wrap">
              <div className={`gauge-value ${isRed ? "text-red" : isYellow ? "text-yellow" : "text-green"}`}>
                {Math.round(value)}
              </div>
              <div className="gauge-unit">%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipShell>
  );
}

function ControlSlider({ label, value, onChange, accentClass, subtitle, tooltip }) {
  return (
    <TooltipShell text={tooltip} position="top">
      <div className="control-box">
        <div className="control-top">
          <div>
            <div className="control-label">{label}</div>
            <div className="control-subtitle">{subtitle}</div>
          </div>
          <div className={`control-value ${accentClass}`}>{value}%</div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-slider"
        />
      </div>
    </TooltipShell>
  );
}

function SummaryLine({ text }) {
  return (
    <div className="summary-box">
      <div className="summary-label">Stage Summary</div>
      <div className="summary-text">{text}</div>
    </div>
  );
}

export default function App() {
  const [stagePlans, setStagePlans] = useState(STAGE_WINDOWS.map(() => ({ ...DEFAULT })));
  const [selectedStage, setSelectedStage] = useState(0);
  const [lockedStages, setLockedStages] = useState(Array(STAGE_WINDOWS.length).fill(false));
  const [alarmFlash, setAlarmFlash] = useState(false);

  const controls = stagePlans[selectedStage];

  const update = (key, value) => {
    if (lockedStages[selectedStage]) return;
    setStagePlans((plans) =>
      plans.map((plan, idx) => (idx === selectedStage ? { ...plan, [key]: value } : plan))
    );
  };

  const model = useMemo(() => {
    const expectedProgressByYear = [0, 20, 55, 100, 100, 100, 100, 100, 100, 100, 100];

    const reliabilitySeries = YEARS.map((_, i) => {
      const plan = stagePlans[Math.max(0, i - 1)] ?? DEFAULT;
      const score = 65 + plan.support * 0.4 - (plan.wind + plan.solar) * 0.25 - plan.retire * 0.3;
      return clamp(score, 0, 100);
    });

    const budgetSeries = YEARS.map((_, i) => {
      const plan = stagePlans[Math.max(0, i - 1)] ?? DEFAULT;
      const schoolsPressure = Math.max(0, plan.schools - 55) * 0.18;
      const transportPressure = Math.max(0, plan.transport - 55) * 0.18;
      const schoolsRelief = Math.max(0, 55 - plan.schools) * 0.08;
      const transportRelief = Math.max(0, 55 - plan.transport) * 0.08;
      const score =
        35 +
        plan.wind * 0.22 +
        plan.solar * 0.2 +
        plan.support * 0.28 +
        plan.retire * 0.16 +
        schoolsPressure +
        transportPressure -
        schoolsRelief -
        transportRelief;
      return clamp(score, 0, 100);
    });

    const emissionsScoreSeries = YEARS.map((_, i) => {
      const plan = stagePlans[Math.max(0, i - 1)] ?? DEFAULT;
      const reliabilityPenalty = reliabilitySeries[i] < 50 ? (50 - reliabilitySeries[i]) * 0.4 : 0;
      const score =
        85 -
        plan.wind * 0.18 -
        plan.solar * 0.16 -
        plan.support * 0.05 -
        plan.retire * 0.28 +
        reliabilityPenalty;
      return clamp(score, 0, 100);
    });

    const emissionsProgressSeries = emissionsScoreSeries.map((score) =>
      clamp(((85 - score) / 85) * 100, 0, 100)
    );

    const reliabilityLabels = reliabilitySeries.map((score) => {
      if (score >= 70) return "Stable";
      if (score >= 50) return "Strained";
      return "Failing";
    });

    const budgetLabels = budgetSeries.map((score) => {
      if (score <= 30) return "Under Invested";
      if (score <= 40) return "Balanced";
      if (score <= 70) return "Tight";
      if (score <= 90) return "Strained";
      return "Critical";
    });

    const emissionsLabels = emissionsProgressSeries.map((progress, i) => {
      const expected = expectedProgressByYear[i];
      const gap = expected - progress;
      if (gap <= 10) return "On Track";
      if (progress >= 15 && gap <= 35) return "Improving";
      return "High";
    });

    const activeWarnings = YEARS.map((_, i) => {
      const warnings = [];
      const plan = stagePlans[Math.max(0, i - 1)] ?? DEFAULT;

      if (reliabilitySeries[i] < 50) warnings.push("Blackout risk increasing");
      if (budgetSeries[i] > 80) warnings.push("Budget overload likely");
      if (emissionsLabels[i] === "High" && i >= 3) warnings.push("Emissions goal is slipping past 2040");
      if (budgetSeries[i] > 70 && plan.schools < 40) warnings.push("Schools and services may face cuts");
      if (budgetSeries[i] > 70 && plan.transport < 40) warnings.push("Transportation and safety may face cuts");

      return warnings;
    });

    return {
      expectedProgressByYear,
      reliabilitySeries,
      budgetSeries,
      emissionsProgressSeries,
      reliabilityLabels,
      budgetLabels,
      emissionsLabels,
      activeWarnings,
    };
  }, [stagePlans]);

  const displayIndex = selectedStage + 1;
  const selectedWarnings = model.activeWarnings[displayIndex] ?? [];

  const currentSummaryLine =
    `${STAGE_WINDOWS[selectedStage]} | ` +
    `Wind ${controls.wind}% | ` +
    `Solar ${controls.solar}% | ` +
    `Support ${controls.support}% | ` +
    `Fossil Retirement ${controls.retire}% | ` +
    `Schools & Services ${controls.schools}% | ` +
    `Transportation & Safety ${controls.transport}% | ` +
    `Reliability ${model.reliabilityLabels[displayIndex]} | ` +
    `Budget ${model.budgetLabels[displayIndex]} | ` +
    `Emissions ${model.emissionsLabels[displayIndex]} | ` +
    `Emissions Goal Progress ${Math.round(model.emissionsProgressSeries[displayIndex])}%`;

  const lockCurrentStage = () => {
    if (lockedStages[selectedStage]) return;

    setLockedStages((prev) => prev.map((locked, idx) => (idx === selectedStage ? true : locked)));

    if (selectedStage < STAGE_WINDOWS.length - 1) {
      setStagePlans((plans) => {
        const nextPlans = [...plans];
        nextPlans[selectedStage + 1] = { ...DEFAULT };
        return nextPlans;
      });
      setSelectedStage(selectedStage + 1);
    }
  };

  useEffect(() => {
    setAlarmFlash(selectedWarnings.length >= 2);
  }, [selectedWarnings]);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(currentSummaryLine);
    } catch {
      window.prompt("Copy this stage summary:", currentSummaryLine);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: radial-gradient(circle at top, #1e293b 0%, #09090b 45%, #020617 100%);
          color: white;
        }

        .app-shell {
          min-height: 100vh;
          padding: 16px;
        }

        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          border-radius: 32px;
          border: 2px solid ${alarmFlash ? "#f43f5e" : "#155e75"};
          background: rgba(9, 9, 11, 0.9);
          padding: 16px;
          box-shadow: ${alarmFlash
            ? "0 0 35px rgba(244,63,94,0.35)"
            : "0 0 35px rgba(34,211,238,0.12)"};
        }

        .topbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .eyebrow {
          color: #67e8f9;
          font-size: 12px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 900;
          margin: 0;
        }

        .subtitle {
          color: #a1a1aa;
          margin-top: 10px;
          max-width: 900px;
          line-height: 1.5;
          font-weight: 700;
        }

        .controls-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .window-box {
          border: 1px solid #155e75;
          background: rgba(8, 47, 73, 0.55);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .window-label {
          color: #67e8f9;
          font-size: 12px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .window-select {
          background: #09090b;
          color: #cffafe;
          border: 1px solid #155e75;
          border-radius: 8px;
          padding: 6px 10px;
        }

        .badge {
          display: inline-block;
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .badge-safe {
          background: #052e16;
          color: #86efac;
          border-color: #14532d;
        }

        .badge-alarm {
          background: #4c0519;
          color: #fda4af;
          border-color: #881337;
        }

        .button {
          border-radius: 12px;
          border: 1px solid #3f3f46;
          background: #18181b;
          color: white;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 700;
        }

        .button:hover { background: #27272a; }
        .button:disabled { opacity: 0.55; cursor: not-allowed; }

        .button-cyan {
          border-color: #0e7490;
          background: rgba(8, 47, 73, 0.45);
        }

        .button-cyan:hover { background: rgba(8, 47, 73, 0.75); }

        .timeline {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }

        @media (min-width: 900px) {
          .timeline {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (min-width: 1280px) {
          .timeline {
            grid-template-columns: repeat(10, minmax(0, 1fr));
          }
        }

        .stage-button {
          border-radius: 12px;
          border: 1px solid #27272a;
          background: #18181b;
          color: #a1a1aa;
          padding: 10px 12px;
          text-align: center;
          font-weight: 700;
          cursor: pointer;
        }

        .stage-button.active {
          border-color: #22d3ee;
          background: rgba(8, 47, 73, 0.7);
          color: #e0f2fe;
        }

        .stage-sub {
          margin-top: 6px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .summary-box {
          border: 1px solid rgba(8, 145, 178, 0.7);
          background: rgba(8, 47, 73, 0.3);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .summary-label {
          color: #67e8f9;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .summary-text {
          color: #cffafe;
          line-height: 1.5;
          font-size: 17px;
          word-break: break-word;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 1280px) {
          .layout {
            grid-template-columns: 4fr 5fr 3fr;
          }
        }

        .card {
          background: rgba(9, 9, 11, 0.95);
          border: 1px solid #27272a;
          border-radius: 20px;
          overflow: hidden;
        }

        .card-header {
          padding: 16px 16px 0 16px;
        }

        .card-title {
          color: #f4f4f5;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3em;
        }

        .card-content {
          padding: 16px;
        }

        .control-box {
          border: 1px solid #3f3f46;
          background: rgba(24, 24, 27, 0.85);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .control-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .control-label {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fafafa;
        }

        .control-subtitle {
          font-size: 12px;
          color: #a1a1aa;
          margin-top: 4px;
        }

        .control-value {
          font-size: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .range-slider {
          width: 100%;
        }

        .text-cyan { color: #67e8f9; }
        .text-yellow { color: #fde047; }
        .text-green { color: #86efac; }
        .text-red { color: #fb7185; }
        .text-sky { color: #7dd3fc; }
        .text-amber { color: #fcd34d; }

        .stage-readout {
          border: 1px solid #27272a;
          background: rgba(24, 24, 27, 0.6);
          border-radius: 16px;
          padding: 14px 16px;
          color: #d4d4d8;
          font-size: 14px;
        }

        .stage-readout strong {
          color: #67e8f9;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-size: 12px;
          margin-right: 10px;
        }

        .gauge-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 900px) {
          .gauge-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .gauge-card {
          background: rgba(24, 24, 27, 0.9);
          border: 1px solid #3f3f46;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }

        .gauge-header {
          padding-bottom: 8px;
        }

        .gauge-title {
          font-size: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gauge-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .gauge-wrap {
          position: relative;
          width: 176px;
          height: 128px;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .gauge-value-wrap {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 4px;
          text-align: center;
        }

        .gauge-value {
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
        }

        .gauge-unit {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #a1a1aa;
          margin-top: 4px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 900px) {
          .status-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .status-card {
          background: rgba(24, 24, 27, 0.9);
          border: 1px solid #3f3f46;
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }

        .status-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #a1a1aa;
          margin-bottom: 8px;
        }

        .status-value {
          font-size: 34px;
          font-weight: 900;
        }

        .warning-item {
          border: 1px solid #78350f;
          background: rgba(120, 53, 15, 0.18);
          border-radius: 14px;
          padding: 12px;
          color: #fde68a;
          display: flex;
          gap: 8px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .warning-clear {
          border: 1px solid #14532d;
          background: rgba(20, 83, 45, 0.18);
          border-radius: 14px;
          padding: 12px;
          color: #86efac;
        }

        .progress-track {
          width: 100%;
          height: 14px;
          border-radius: 999px;
          background: #111827;
          overflow: hidden;
          border: 1px solid #1f2937;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%);
        }

        .small-note {
          color: #a1a1aa;
          font-size: 12px;
          line-height: 1.5;
        }

        .planner-note p {
          margin: 0 0 12px 0;
          color: #d4d4d8;
          line-height: 1.5;
        }

        .planner-note p:last-child {
          margin-bottom: 0;
        }

        .tooltip-shell {
          position: relative;
        }

        .tooltip-box {
          position: absolute;
          z-index: 50;
          width: 280px;
          border-radius: 12px;
          border: 1px solid rgba(8, 145, 178, 0.7);
          background: rgba(2, 6, 23, 0.95);
          color: #cffafe;
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.5;
          box-shadow: 0 15px 35px rgba(0,0,0,0.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }

        .tooltip-shell:hover .tooltip-box {
          opacity: 1;
        }

        .tooltip-top {
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
        }

        .tooltip-bottom {
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
        }

        .tooltip-right {
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
        }

        .tooltip-left {
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
        }

        @media (max-width: 900px) {
          .tooltip-box {
            width: 240px;
          }
        }
      `}</style>

      <div className="app-shell">
        <div className="dashboard">
          <div className="topbar">
            <div>
              <div className="eyebrow">State Systems Command</div>
              <h1 className="title">OREGON ENERGY TRANSITION COCKPIT</h1>
              <div className="subtitle">
                Build the plan in five-year stages. Select a time window, make decisions for that stage,
                then move to the next window and watch the dashboard respond. Each 1% of "effort" is
                roughly equal to about $100 million per year of investment.
              </div>
            </div>

            <div className="controls-row">
              <TooltipShell text="Choose which five-year stage you are actively planning. Each stage keeps the previous stage's settings as its starting point, so students build a continuous long-term plan.">
                <div className="window-box">
                  <span className="window-label">Year Window</span>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(Number(e.target.value))}
                    className="window-select"
                  >
                    {STAGE_WINDOWS.map((window, idx) => (
                      <option key={window} value={idx}>
                        {window}
                      </option>
                    ))}
                  </select>
                </div>
              </TooltipShell>

              <Badge className={alarmFlash ? "badge-alarm" : "badge-safe"}>
                {alarmFlash ? "Alarm State" : "Stable State"}
              </Badge>

              <Button className="button-cyan" onClick={lockCurrentStage} disabled={lockedStages[selectedStage]}>
                {selectedStage < STAGE_WINDOWS.length - 1
                  ? `Lock in ${STAGE_WINDOWS[selectedStage]} Plan`
                  : "Lock Final Plan"}
              </Button>

              <Button
                onClick={() => {
                  setStagePlans(STAGE_WINDOWS.map(() => ({ ...DEFAULT })));
                  setLockedStages(Array(STAGE_WINDOWS.length).fill(false));
                  setSelectedStage(0);
                }}
              >
                Reset to Baseline
              </Button>
            </div>
          </div>

          <div className="timeline">
            {STAGE_WINDOWS.map((window, idx) => (
              <button
                key={window}
                className={`stage-button ${selectedStage === idx ? "active" : ""}`}
                onClick={() => setSelectedStage(idx)}
              >
                <div>{window}</div>
                <div className="stage-sub">{lockedStages[idx] ? "Locked" : "Open"}</div>
              </button>
            ))}
          </div>

          <SummaryLine text={currentSummaryLine} />

          <div style={{ marginBottom: 16 }}>
            <Button onClick={copySummary}>Copy Stage Summary</Button>
          </div>

          <div className="layout">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Plan Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="small-note" style={{ marginBottom: 12 }}>
                    All values are effort levels from 0–100%. Students can push many categories at once,
                    but doing so can overload the budget or destabilize the system.
                  </div>

                  <ControlSlider
                    label="Wind"
                    value={controls.wind}
                    onChange={(v) => update("wind", v)}
                    accentClass="text-cyan"
                    subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Raises wind investment during this stage. It helps lower emissions, but too much without enough support can hurt reliability and increase costs."
                  />

                  <ControlSlider
                    label="Solar"
                    value={controls.solar}
                    onChange={(v) => update("solar", v)}
                    accentClass="text-yellow"
                    subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Raises solar investment during this stage. It helps lower emissions, but too much without enough support can also strain the system and budget."
                  />

                  <ControlSlider
                    label="Energy System Support"
                    value={controls.support}
                    onChange={(v) => update("support", v)}
                    accentClass="text-green"
                    subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Represents grid upgrades, storage, and supporting systems. It improves reliability and makes renewable investments work more smoothly, but it is expensive."
                  />

                  <ControlSlider
                    label="Fossil Retirement"
                    value={controls.retire}
                    onChange={(v) => update("retire", v)}
                    accentClass="text-red"
                    subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Raises the speed of retiring fossil-based electricity. It lowers emissions, but if pushed too hard without support it can create reliability problems."
                  />

                  <ControlSlider
                    label="Schools & Services"
                    value={controls.schools}
                    onChange={(v) => update("schools", v)}
                    accentClass="text-sky"
                    subtitle={`Protection in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Protects schools and other public services during this stage. This lowers social stress, but it increases budget pressure."
                  />

                  <ControlSlider
                    label="Transportation & Safety"
                    value={controls.transport}
                    onChange={(v) => update("transport", v)}
                    accentClass="text-amber"
                    subtitle={`Protection in ${STAGE_WINDOWS[selectedStage]}.`}
                    tooltip="Protects transportation systems and safety-related spending during this stage. This helps preserve stability, but it also adds to the budget burden."
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="stage-readout">
                <strong>Selected Stage</strong>
                {STAGE_WINDOWS[selectedStage]} <span style={{ color: "#52525b", margin: "0 10px" }}>|</span>
                Projected conditions by {YEARS[displayIndex]}.
              </div>

              <div className="gauge-grid" style={{ marginTop: 16 }}>
                <GaugeDial
                  label="Reliability"
                  value={model.reliabilitySeries[displayIndex]}
                  emoji="⚡"
                  goodHigh
                  tooltip="Shows whether the electricity system is stable enough to keep power flowing during this stage."
                />
                <GaugeDial
                  label="Budget Risk"
                  value={model.budgetSeries[displayIndex]}
                  emoji="💰"
                  dangerHigh
                  tooltip="Shows how much financial pressure this stage is putting on the state. Lower values are safer."
                />
                <GaugeDial
                  label="Emissions"
                  value={100 - model.emissionsProgressSeries[displayIndex]}
                  emoji="🌍"
                  dangerHigh
                  tooltip="Shows how far the plan still is from the long-term emissions target. Lower is better."
                />
              </div>

              <div className="status-grid" style={{ marginTop: 16 }}>
                <div className="status-card">
                  <div className="status-eyebrow">Reliability Status</div>
                  <div
                    className={`status-value ${
                      model.reliabilityLabels[displayIndex] === "Stable"
                        ? "text-green"
                        : model.reliabilityLabels[displayIndex] === "Strained"
                        ? "text-yellow"
                        : "text-red"
                    }`}
                  >
                    {model.reliabilityLabels[displayIndex]}
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-eyebrow">Budget Status</div>
                  <div
                    className={`status-value ${
                      model.budgetLabels[displayIndex] === "Balanced"
                        ? "text-green"
                        : model.budgetLabels[displayIndex] === "Tight" ||
                          model.budgetLabels[displayIndex] === "Strained"
                        ? "text-yellow"
                        : model.budgetLabels[displayIndex] === "Under Invested"
                        ? "text-sky"
                        : "text-red"
                    }`}
                  >
                    {model.budgetLabels[displayIndex]}
                  </div>
                </div>

                <div className="status-card">
                  <div className="status-eyebrow">Emissions Status</div>
                  <div
                    className={`status-value ${
                      model.emissionsLabels[displayIndex] === "On Track"
                        ? "text-green"
                        : model.emissionsLabels[displayIndex] === "Improving"
                        ? "text-yellow"
                        : "text-red"
                    }`}
                  >
                    {model.emissionsLabels[displayIndex]}
                  </div>
                </div>
              </div>

              <Card style={{ marginTop: 16 }}>
                <CardHeader>
                  <CardTitle>Active Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedWarnings.length === 0 ? (
                    <div className="warning-clear">No active warnings in this stage.</div>
                  ) : (
                    selectedWarnings.map((warning) => (
                      <div key={warning} className="warning-item">
                        <span>⚠️</span>
                        <span>{warning}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card style={{ marginTop: 16 }}>
                <CardHeader>
                  <CardTitle>Emissions Goal Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#d4d4d8",
                      fontSize: 14,
                      marginBottom: 12,
                    }}
                  >
                    <span>Current progress by {YEARS[displayIndex]}</span>
                    <strong style={{ color: "#67e8f9" }}>
                      {Math.round(model.emissionsProgressSeries[displayIndex])}%
                    </strong>
                  </div>
                  <Progress value={model.emissionsProgressSeries[displayIndex]} />
                  <div className="small-note" style={{ marginTop: 10 }}>
                    Expected progress by this point: {model.expectedProgressByYear[displayIndex]}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="planner-note">
                <CardHeader>
                  <CardTitle>How To Use This Planner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>1. Adjust the six sliders for the selected five-year stage.</p>
                  <p>2. Watch the three main gauges and status cards update.</p>
                  <p>3. Read any active warnings for risks your plan is creating.</p>
                  <p>4. Copy the stage summary into your final report.</p>
                  <p>5. Lock in the stage and continue to the next time window.</p>
                </CardContent>
              </Card>

              <Card className="planner-note" style={{ marginTop: 16 }}>
                <CardHeader>
                  <CardTitle>Planning Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Baseline Oregon stays affordable, but emissions remain too high.</p>
                  <p>Wind and solar lower emissions, but they need enough support to stay reliable.</p>
                  <p>Students can choose slower or faster transition paths and explain their reasoning afterward.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
