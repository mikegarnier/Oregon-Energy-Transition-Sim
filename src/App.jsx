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
      ? "top-full mt-2 left-1/2 -translate-x-1/2"
      : position === "right"
      ? "left-full ml-2 top-1/2 -translate-y-1/2"
      : position === "left"
      ? "right-full mr-2 top-1/2 -translate-y-1/2"
      : "bottom-full mb-2 left-1/2 -translate-x-1/2";

  return (
    <div className="group relative">
      {children}
      <div
        className={`pointer-events-none absolute z-50 hidden w-72 rounded-xl border border-cyan-700/70 bg-slate-950/95 px-3 py-2 text-xs leading-relaxed text-cyan-100 shadow-2xl group-hover:block ${positionClass}`}
      >
        {text}
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`p-4 pb-2 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <div className={`font-semibold ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide ${className}`}>{children}</span>;
}

function Progress({ value }) {
  return (
    <div className="h-4 w-full overflow-hidden rounded-full border border-cyan-950 bg-slate-900">
      <div className="h-full bg-cyan-400 transition-all" style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  );
}

function GaugeDial({ label, value, icon, unit = "%", goodHigh = false, tooltip }) {
  const angle = -130 + (clamp(value, 0, 100) / 100) * 260;
  const isGreen = goodHigh ? value >= 70 : value <= 40;
  const isYellow = goodHigh ? value >= 45 && value < 70 : value > 40 && value <= 70;
  const isRed = !isGreen && !isYellow;

  return (
    <TooltipShell text={tooltip}>
      <Card className="border-zinc-700 bg-zinc-900/90 shadow-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-zinc-100">
            <span>{icon}</span> {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="relative h-32 w-44">
            <svg viewBox="0 0 200 120" className="h-full w-full overflow-visible">
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
            <div className="absolute inset-x-0 bottom-1 text-center">
              <div className={`text-3xl font-bold tabular-nums ${isRed ? "text-rose-400" : isYellow ? "text-yellow-300" : "text-emerald-300"}`}>
                {Math.round(value)}
              </div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">{unit}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipShell>
  );
}

function ControlSlider({ label, value, onChange, icon, accent, subtitle, tooltip }) {
  return (
    <TooltipShell text={tooltip} position="top">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/85 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-100">
              <span>{icon}</span> {label}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{subtitle}</div>
          </div>
          <div className={`text-lg font-bold tabular-nums ${accent}`}>{value}%</div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>
    </TooltipShell>
  );
}

function SummaryLine({ text }) {
  return (
    <div className="rounded-2xl border border-cyan-800/70 bg-cyan-950/30 p-4">
      <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-cyan-300">Stage Summary</div>
      <div className="text-[17px] leading-relaxed text-cyan-100 break-words">{text}</div>
    </div>
  );
}

export default function OregonEnergyTransitionCockpit() {
  const [stagePlans, setStagePlans] = useState(STAGE_WINDOWS.map(() => ({ ...DEFAULT })));
  const [selectedStage, setSelectedStage] = useState(0);
  const [lockedStages, setLockedStages] = useState(Array(STAGE_WINDOWS.length).fill(false));
  const [alarmFlash, setAlarmFlash] = useState(false);

  const controls = stagePlans[selectedStage];

  const update = (key, value) => {
    if (lockedStages[selectedStage]) return;
    setStagePlans((plans) => plans.map((plan, idx) => (idx === selectedStage ? { ...plan, [key]: value } : plan)));
  };

  const model = useMemo(() => {
    const expectedProgressByYear = [0, 20, 55, 100, 100, 100, 100, 100, 100, 100, 100];
    const demandByYear = [30, 35, 42, 50, 58, 64, 69, 73, 76, 78, 80];

    const currentPolicySeries = YEARS.map((_, i) => {
      if (i === 0) return { ...DEFAULT };
      return stagePlans[Math.max(0, i - 1)] ?? DEFAULT;
    });

    const cumulativeBuildSeries = [];
    for (let i = 0; i < YEARS.length; i++) {
      if (i === 0) {
        cumulativeBuildSeries.push({ wind: 0, solar: 0, support: 0, retire: 0 });
        continue;
      }

      const previous = cumulativeBuildSeries[i - 1];
      const currentStage = stagePlans[i - 1] ?? DEFAULT;

      cumulativeBuildSeries.push({
        wind: clamp(previous.wind * 0.98 + currentStage.wind * 0.55, 0, 180),
        solar: clamp(previous.solar * 0.98 + currentStage.solar * 0.55, 0, 180),
        support: clamp(previous.support * 0.97 + currentStage.support * 0.5, 0, 180),
        retire: clamp(previous.retire + currentStage.retire * 0.45, 0, 100),
      });
    }

    const reliabilitySeries = YEARS.map((_, i) => {
      const built = cumulativeBuildSeries[i];
      const current = currentPolicySeries[i];

      // NEW: penalty if fossil retirement is ahead of clean replacement
      const replacementGap = built.retire - (built.wind + built.solar) * 0.45;
      const retirementPenalty = replacementGap > 20 ? replacementGap * 0.25 : 0;

      const score =
        64 +
        built.support * 0.32 +
        current.support * 0.1 -
        (built.wind + built.solar) * 0.08 -
        built.retire * 0.1 -
        retirementPenalty;

      return clamp(score, 0, 100);
    });

    const emissionsScoreSeries = YEARS.map((_, i) => {
      const built = cumulativeBuildSeries[i];
      const reliabilityPenalty = reliabilitySeries[i] < 50 ? (50 - reliabilitySeries[i]) * 0.4 : 0;
      // Support should NOT directly reduce emissions; it enables renewables via reliability instead
      const score = 85 - built.wind * 0.26 - built.solar * 0.24 - built.retire * 0.3 + reliabilityPenalty;
      return clamp(score, 0, 100);
    });

    const emissionsProgressSeries = emissionsScoreSeries.map((score) => clamp(((85 - score) / 85) * 100, 0, 100));

    const cleanEnergySurplusSeries = YEARS.map((_, i) => {
      const built = cumulativeBuildSeries[i];
      const cleanCapacity = built.wind * 0.26 + built.solar * 0.24 + built.support * 0.16 + built.retire * 0.08;
      const rawSurplus = cleanCapacity - demandByYear[i];
      const reliabilityGate = reliabilitySeries[i] >= 70 ? 1 : reliabilitySeries[i] >= 60 ? 0.75 : reliabilitySeries[i] >= 50 ? 0.4 : 0;
      const lateStageGate = i >= 5 ? 1 : i >= 4 ? 0.5 : 0;
      return clamp(rawSurplus * reliabilityGate * lateStageGate, 0, 100);
    });

    const budgetSeries = YEARS.map((_, i) => {
      const current = currentPolicySeries[i];
      const built = cumulativeBuildSeries[i];
      const schoolsPressure = Math.max(0, current.schools - 55) * 0.18;
      const transportPressure = Math.max(0, current.transport - 55) * 0.18;
      const schoolsRelief = Math.max(0, 55 - current.schools) * 0.08;
      const transportRelief = Math.max(0, 55 - current.transport) * 0.08;
      const maintenancePressure = built.wind * 0.02 + built.solar * 0.02 + built.support * 0.02 + built.retire * 0.01;
      const surplusBudgetRelief = i >= 5 ? cleanEnergySurplusSeries[i] * 0.35 : i >= 4 ? cleanEnergySurplusSeries[i] * 0.18 : 0;
      const score =
        35 +
        current.wind * 0.16 +
        current.solar * 0.15 +
        current.support * 0.2 +
        current.retire * 0.1 +
        maintenancePressure +
        schoolsPressure +
        transportPressure -
        schoolsRelief -
        transportRelief -
        surplusBudgetRelief;
      return clamp(score, 0, 100);
    });

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
      const built = cumulativeBuildSeries[i];
      const current = currentPolicySeries[i];
      const warnings = [];

      if (reliabilitySeries[i] < 50) warnings.push("Blackout risk increasing");

      // NEW: fossil retirement ahead of replacement warning
      if (built.retire > 35 && built.retire > (built.wind + built.solar) * 0.45 + 20) {
        warnings.push("Retirement risk: fossil fuels are being retired faster than clean energy is replacing them");
      }

      if ((built.wind + built.solar > 40 && built.support < 30) || (current.wind + current.solar > 35 && current.support < 25)) {
        warnings.push("Grid overload risk: renewable growth is outpacing system support");
      }

      if (budgetSeries[i] > 80) warnings.push("Budget overload likely");
      if (emissionsLabels[i] === "High" && i >= 3) warnings.push("Emissions goal is slipping past 2040");
      if (budgetSeries[i] > 70 && current.schools < 40) warnings.push("Schools and services may face cuts");
      if (budgetSeries[i] > 70 && current.transport < 40) warnings.push("Transportation and safety may face cuts");
      if (i >= 5 && cleanEnergySurplusSeries[i] < 5 && emissionsProgressSeries[i] >= 100) {
        warnings.push("Net-zero reached, but surplus clean energy is still limited");
      }

      return warnings;
    });

    return {
      expectedProgressByYear,
      reliabilitySeries,
      budgetSeries,
      emissionsProgressSeries,
      cleanEnergySurplusSeries,
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
    `Emissions Goal Progress ${Math.round(model.emissionsProgressSeries[displayIndex])}% | ` +
    `Clean Energy Surplus ${Math.round(model.cleanEnergySurplusSeries[displayIndex])}%`;

  const lockCurrentStage = () => {
    if (lockedStages[selectedStage]) return;

    setLockedStages((prev) => prev.map((locked, idx) => (idx === selectedStage ? true : locked)));

    if (selectedStage < STAGE_WINDOWS.length - 1) {
      setStagePlans((plans) => {
        const nextPlans = [...plans];
        nextPlans[selectedStage + 1] = { ...DEFAULT };
        return nextPlans;
      });
      setSelectedStage((stage) => stage + 1);
    }
  };

  useEffect(() => {
    setAlarmFlash(selectedWarnings.length >= 2);
  }, [selectedWarnings]);

  const borderClass = alarmFlash ? "animate-pulse border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.35)]" : "border-cyan-800 shadow-[0_0_35px_rgba(34,211,238,0.12)]";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#09090b_45%,#020617_100%)] p-4 text-white md:p-6">
      <div className={`mx-auto max-w-7xl rounded-[32px] border-2 bg-zinc-950/90 p-4 backdrop-blur-md md:p-6 ${borderClass}`}>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.45em] text-cyan-300">State Systems Command</div>
            <h1 className="text-2xl font-black tracking-tight md:text-4xl">OREGON ENERGY TRANSITION COCKPIT</h1>
            <div className="mt-2 max-w-3xl text-zinc-400">
              Build the plan in five-year stages. Select a time window, make decisions for that stage, then move to the next window and watch the dashboard respond. Each 1% of effort is roughly equal to about $100 million per year of investment.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TooltipShell text="Choose which five-year stage you are actively planning. Each stage starts from baseline inputs so students must make a fresh decision each time.">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800 bg-cyan-950/60 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.25em] text-cyan-300">Year Window</span>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(Number(e.target.value))}
                  className="rounded-md border border-cyan-800 bg-zinc-950 px-2 py-1 text-sm text-cyan-100 outline-none"
                >
                  {STAGE_WINDOWS.map((window, idx) => (
                    <option key={window} value={idx}>
                      {window}
                    </option>
                  ))}
                </select>
              </div>
            </TooltipShell>

            <Badge className={`${alarmFlash ? "border border-rose-800 bg-rose-950 text-rose-300" : "border border-emerald-800 bg-emerald-950 text-emerald-300"}`}>
              {alarmFlash ? "ALARM STATE" : "STABLE STATE"}
            </Badge>

            <Button className="border-cyan-700 bg-cyan-950/40 hover:bg-cyan-900/60" onClick={lockCurrentStage} disabled={lockedStages[selectedStage]}>
              {selectedStage < STAGE_WINDOWS.length - 1 ? `Lock in ${STAGE_WINDOWS[selectedStage]} Plan` : "Lock Final Plan"}
            </Button>

            <Button
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
              onClick={() => {
                setStagePlans(STAGE_WINDOWS.map(() => ({ ...DEFAULT })));
                setLockedStages(Array(STAGE_WINDOWS.length).fill(false));
                setSelectedStage(0);
              }}
            >
              Reset to Baseline
            </Button>

            <TooltipShell text="Clean Energy Surplus shows how much clean power Oregon is producing beyond what it needs in the later stages. Each 1% of surplus is worth about $100 million per year that can be added back into the economy.">
              <div className="ml-auto min-w-[190px] rounded-xl border border-cyan-800 bg-cyan-950/40 px-3 py-2 text-right">
                <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">Clean Energy Surplus</div>
                <div className="text-2xl font-black text-cyan-100">{Math.round(model.cleanEnergySurplusSeries[displayIndex])}%</div>
                <div className="text-xs font-semibold text-emerald-300">≈ ${(model.cleanEnergySurplusSeries[displayIndex] * 100).toLocaleString()}M/yr</div>
              </div>
            </TooltipShell>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5 xl:grid-cols-10">
          {STAGE_WINDOWS.map((window, idx) => (
            <button
              key={window}
              onClick={() => setSelectedStage(idx)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${selectedStage === idx ? "border-cyan-400 bg-cyan-950 text-cyan-100" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"}`}
            >
              <div>{window}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em]">{lockedStages[idx] ? "Locked" : "Open"}</div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <SummaryLine text={currentSummaryLine} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-4">
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-zinc-100">Plan Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pb-2 text-xs text-zinc-400">All values are effort levels from 0–100%. Each new stage starts from baseline, but infrastructure built in earlier stages still matters.</div>
                <ControlSlider label="Wind" value={controls.wind} onChange={(v) => update("wind", v)} icon="💨" accent="text-cyan-300" subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Raises wind investment during this stage. It helps lower emissions, but too much without enough support can hurt reliability and increase costs." />
                <ControlSlider label="Solar" value={controls.solar} onChange={(v) => update("solar", v)} icon="☀️" accent="text-yellow-300" subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Raises solar investment during this stage. It helps lower emissions, but too much without enough support can also strain the system and budget." />
                <ControlSlider label="Energy System Support" value={controls.support} onChange={(v) => update("support", v)} icon="🔋" accent="text-emerald-300" subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Represents grid upgrades, storage, and supporting systems. It improves reliability and makes renewable investments work more smoothly, but it is expensive." />
                <ControlSlider label="Fossil Retirement" value={controls.retire} onChange={(v) => update("retire", v)} icon="🏭" accent="text-rose-300" subtitle={`Effort in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Raises the speed of retiring fossil-based electricity. It lowers emissions, but if pushed too hard without support it can create reliability problems." />
                <ControlSlider label="Schools & Services" value={controls.schools} onChange={(v) => update("schools", v)} icon="🏫" accent="text-sky-300" subtitle={`Protection in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Protects schools and other public services during this stage. This lowers social stress, but it increases budget pressure." />
                <ControlSlider label="Transportation & Safety" value={controls.transport} onChange={(v) => update("transport", v)} icon="🚌" accent="text-amber-300" subtitle={`Protection in ${STAGE_WINDOWS[selectedStage]}.`} tooltip="Protects transportation systems and safety-related spending during this stage. This helps preserve stability, but it also adds to the budget burden." />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 xl:col-span-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
              <span className="mr-3 font-semibold uppercase tracking-[0.25em] text-cyan-300">Selected Stage</span>
              <span>{STAGE_WINDOWS[selectedStage]}</span>
              <span className="mx-3 text-zinc-500">|</span>
              <span>Projected conditions by {YEARS[displayIndex]}.</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <GaugeDial label="Reliability" value={model.reliabilitySeries[displayIndex]} icon="⚡" goodHigh tooltip="Shows whether the electricity system is stable enough to keep power flowing during this stage." />
              <GaugeDial label="Budget Risk" value={model.budgetSeries[displayIndex]} icon="💰" tooltip="Shows how much financial pressure this stage is putting on the state. Lower values are safer." />
              <GaugeDial label="Emissions Remaining" value={100 - model.emissionsProgressSeries[displayIndex]} icon="🌍" tooltip="Shows how much emissions burden still remains in the system. Lower is better." />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-zinc-700 bg-zinc-900/90 shadow-2xl">
                <CardContent className="pt-6 text-center">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">Reliability Status</div>
                  <div className={`text-3xl font-black ${model.reliabilityLabels[displayIndex] === "Stable" ? "text-emerald-300" : model.reliabilityLabels[displayIndex] === "Strained" ? "text-amber-300" : "text-rose-400"}`}>{model.reliabilityLabels[displayIndex]}</div>
                </CardContent>
              </Card>
              <Card className="border-zinc-700 bg-zinc-900/90 shadow-2xl">
                <CardContent className="pt-6 text-center">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">Budget Status</div>
                  <div className={`text-3xl font-black ${model.budgetLabels[displayIndex] === "Balanced" ? "text-emerald-300" : model.budgetLabels[displayIndex] === "Tight" || model.budgetLabels[displayIndex] === "Strained" ? "text-amber-300" : model.budgetLabels[displayIndex] === "Under Invested" ? "text-sky-300" : "text-rose-400"}`}>{model.budgetLabels[displayIndex]}</div>
                </CardContent>
              </Card>
              <Card className="border-zinc-700 bg-zinc-900/90 shadow-2xl">
                <CardContent className="pt-6 text-center">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">Emissions Status</div>
                  <div className={`text-3xl font-black ${model.emissionsLabels[displayIndex] === "On Track" ? "text-emerald-300" : model.emissionsLabels[displayIndex] === "Improving" ? "text-amber-300" : "text-rose-400"}`}>{model.emissionsLabels[displayIndex]}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-zinc-100">Active Warnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedWarnings.length === 0 ? (
                  <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 px-3 py-3 text-sm text-emerald-300">No active warnings in this stage.</div>
                ) : (
                  selectedWarnings.map((warning) => (
                    <div key={warning} className="flex items-start gap-2 rounded-xl border border-amber-900 bg-amber-950/20 px-3 py-3 text-sm text-amber-200">
                      <span>⚠️</span>
                      <span>{warning}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-zinc-100">Emissions Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center justify-between text-sm text-zinc-300">
                  <span>Current progress by {YEARS[displayIndex]}</span>
                  <span className="font-bold text-cyan-300">{Math.round(model.emissionsProgressSeries[displayIndex])}%</span>
                </div>
                <Progress value={model.emissionsProgressSeries[displayIndex]} />
                <div className="mt-3 text-xs text-zinc-400">Expected progress by this point: {model.expectedProgressByYear[displayIndex]}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 xl:col-span-3">
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-zinc-100">How To Use This Planner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <p>1. Adjust the six sliders for the selected five-year stage.</p>
                <p>2. Watch the three main gauges and status cards update.</p>
                <p>3. Read any active warnings for risks your plan is creating.</p>
                <p>4. Copy the stage summary into your final report.</p>
                <p>5. Lock in the stage and continue to the next time window.</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-zinc-100">Planning Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <p>Baseline Oregon stays affordable, but emissions remain too high.</p>
                <p>Wind and solar lower emissions, but they need enough support to stay reliable.</p>
                <p>In the later stages, strong clean infrastructure can create surplus energy that adds value back into the economy.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
