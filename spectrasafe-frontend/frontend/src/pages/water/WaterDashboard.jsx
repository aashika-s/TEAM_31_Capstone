import { useCallback, useEffect, useMemo, useState } from "react";
import { IconDroplet, IconCircleX, IconCircleCheck, IconAlertTriangle, IconMapPinOff } from "@tabler/icons-react";

import WaterMap from "../../components/WaterMap";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import { WATER_FILTERS, WaterBadge } from "../../lib/water";

const TONES = {
  neutral: { chip: "bg-accent-bg text-accent-text", bar: "#8A7F70" },
  fail: { chip: "bg-fail-bg text-fail-text", bar: "#C0392B" },
  warn: { chip: "bg-warn-bg text-warn-text", bar: "#C1701E" },
  pass: { chip: "bg-pass-bg text-pass-text", bar: "#2E7D4F" },
};

function Tile({ icon: Icon, value, label, tone = "neutral", pct }) {
  const t = TONES[tone];
  return (
    <div className="bg-bg-primary border border-border-tertiary rounded-app-lg shadow-card p-4">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 shrink-0 rounded-app-md flex items-center justify-center ${t.chip}`}>
          <Icon size={17} />
        </div>
        <p className="text-xs font-medium text-text-secondary leading-tight">{label}</p>
      </div>
      <div className="flex items-end justify-between mt-3">
        <p className="text-[28px] leading-none font-bold tracking-tight text-text-primary tabular-nums">{value}</p>
        {pct != null && <p className="text-[11px] text-text-tertiary tabular-nums pb-0.5">{pct}%</p>}
      </div>
      <div className="h-1 rounded-full bg-bg-secondary mt-3 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct ?? 100}%`, background: t.bar, opacity: pct == null ? 0.25 : 1 }} />
      </div>
    </div>
  );
}

function useMapHeight() {
  const calc = () => (typeof window !== "undefined" && window.innerWidth >= 1024 ? 560 : 320);
  const [h, setH] = useState(calc);
  useEffect(() => {
    const on = () => setH(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return h;
}

function Dot({ color }) {
  return <i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />;
}

export default function WaterDashboard() {
  const { user } = useAuth();
  const isCentral = user?.role === "CPCB";
  const mapHeight = useMapHeight();
  const [filter, setFilter] = useState(null);
  const [samples, setSamples] = useState(null);
  const [stats, setStats] = useState(null);
  const [info, setInfo] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.waterStats().then(setStats).catch(() => {});
    api.waterModelInfo().then(setInfo).catch(() => {});
  }, []);

  useEffect(() => {
    setSamples(null);
    setError(null);
    api
      .listWaterSamples(filter ? { result: filter, limit: 1000 } : { limit: 1000 })
      .then(setSamples)
      .catch((e) => setError(e.message));
  }, [filter]);

  const onSelect = useCallback((s) => setSelected(s.id), []);
  const mapPoints = useMemo(
    () => (samples || []).map((s) => ({ id: s.id, lat: s.lat, lon: s.lon, result: s.result })),
    [samples]
  );
  const current = samples?.find((s) => s.id === selected) || null;

  const byState = useMemo(() => {
    if (!isCentral || !samples) return [];
    const m = {};
    samples.forEach((s) => {
      const k = s.state || "Unknown";
      m[k] = m[k] || { state: k, total: 0, unsafe: 0, inconclusive: 0, clear: 0 };
      m[k].total += 1;
      if (s.result === "unsafe") m[k].unsafe += 1;
      else if (s.result === "inconclusive") m[k].inconclusive += 1;
      else m[k].clear += 1;
    });
    return Object.values(m).sort((a, b) => b.unsafe - a.unsafe || b.total - a.total);
  }, [isCentral, samples]);

  const total = stats?.total ?? 0;
  const pct = (n) => (stats && total ? Math.round(((n ?? 0) / total) * 100) : null);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-10 pt-6 lg:pt-8 pb-12">
      {/* Heading + filters */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-[-0.01em] text-text-primary">Water quality</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {isCentral
              ? "Laser-spectrum screening samples across all states."
              : `Laser-spectrum screening samples in ${user?.state || "your state"}.`}
          </p>
        </div>
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="inline-flex p-1 gap-1 rounded-app-md bg-bg-secondary border border-border-tertiary">
            {WATER_FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => { setFilter(f.key); setSelected(null); }}
                  className={`h-8 px-3.5 rounded-app-sm text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-bg-primary text-text-primary shadow-card"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Tile icon={IconDroplet} value={stats?.total ?? "—"} label="Samples" />
        <Tile icon={IconCircleX} value={stats?.unsafe ?? "—"} label="Unsafe" tone="fail" pct={pct(stats?.unsafe)} />
        <Tile icon={IconAlertTriangle} value={stats?.inconclusive ?? "—"} label="Inconclusive" tone="warn" pct={pct(stats?.inconclusive)} />
        <Tile icon={IconCircleCheck} value={stats?.no_contaminant_detected ?? "—"} label="No contaminant" tone="pass" pct={pct(stats?.no_contaminant_detected)} />
      </div>

      {error && <p className="text-xs text-fail-text mb-3">{error}</p>}

      {/* Map + side panel, same height */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
        <div className="lg:col-span-3 bg-bg-primary border border-border-tertiary rounded-app-lg shadow-card overflow-hidden flex flex-col">
          <WaterMap samples={mapPoints} selectedId={selected} onSelect={onSelect} height={mapHeight} />
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-4 py-3 border-t border-border-tertiary text-[11px] text-text-secondary">
            <span className="inline-flex items-center gap-1.5"><Dot color="#C0392B" /> Unsafe</span>
            <span className="inline-flex items-center gap-1.5"><Dot color="#C1701E" /> Inconclusive</span>
            <span className="inline-flex items-center gap-1.5"><Dot color="#2E7D4F" /> No contaminant detected</span>
            <span className="ml-auto text-text-tertiary tabular-nums">{samples ? `${samples.length} on map` : ""}</span>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 lg:h-[calc(560px+43px)]">
          {current && (
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg shadow-card p-4 shrink-0">
              <div className="flex gap-3">
                <img
                  src={api.waterImageUrl(current.image_filename)}
                  alt="Spectrum"
                  className="w-24 h-24 shrink-0 object-cover rounded-app-md bg-bg-secondary"
                />
                <div className="min-w-0 flex-1">
                  <WaterBadge result={current.result} />
                  <p className="text-sm font-semibold text-text-primary mt-2 truncate">{current.site_name || "Unnamed site"}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {timeAgo(current.created_at)}{current.state ? ` · ${current.state}` : ""}
                    {current.submitted_by ? ` · by ${current.submitted_by}` : ""}
                  </p>
                </div>
              </div>
              {current.p_unsafe != null && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                    <span>Model score P(unsafe)</span>
                    <span className="font-semibold tabular-nums text-text-primary">{(current.p_unsafe * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${current.p_unsafe * 100}%`, background: current.p_unsafe > 0.58 ? "#C0392B" : current.p_unsafe > 0.31 ? "#C1701E" : "#2E7D4F" }} />
                  </div>
                </div>
              )}
              {current.notes && <p className="text-xs text-text-secondary mt-3">{current.notes}</p>}
            </div>
          )}

          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg shadow-card overflow-hidden flex flex-col flex-1 min-h-0 max-h-[360px] lg:max-h-none">
            <div className="px-4 py-3 border-b border-border-tertiary flex items-center justify-between shrink-0">
              <p className="text-[13px] font-semibold text-text-primary">Samples</p>
              <p className="text-[11px] text-text-tertiary">{current ? "Tap another to compare" : "Tap a row or map marker"}</p>
            </div>
            <div className="overflow-y-auto flex-1">
              {!samples && !error && <p className="p-6 text-center text-xs text-text-secondary">Loading…</p>}
              {samples && samples.length === 0 && (
                <div className="p-8 text-center text-xs text-text-secondary">
                  <IconMapPinOff size={22} className="mx-auto mb-2 text-text-tertiary" />
                  No samples yet.
                </div>
              )}
              {samples?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-border-tertiary last:border-b-0 border-l-2 hover:bg-bg-secondary transition-colors ${
                    s.id === selected ? "bg-accent-bg/50 border-l-accent" : "border-l-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-text-primary truncate">{s.site_name || "Unnamed site"}</p>
                    <p className="text-[11px] text-text-tertiary">{timeAgo(s.created_at)}{s.state ? ` · ${s.state}` : ""}</p>
                  </div>
                  <WaterBadge result={s.result} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CPCB per-state breakdown */}
      {isCentral && byState.length > 0 && (
        <div className="mt-5 bg-bg-primary border border-border-tertiary rounded-app-lg shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border-tertiary">
            <p className="text-[13px] font-semibold text-text-primary">By state</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {byState.map((r, i) => (
              <div key={r.state} className={`px-4 py-3 border-border-tertiary ${i > 0 ? "border-t" : ""} ${i === 1 ? "md:border-t-0" : ""} ${i % 2 === 0 ? "md:border-r" : ""}`}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-medium text-text-primary">{r.state}</span>
                  <span className="text-[11px] text-text-secondary tabular-nums">
                    {r.total} samples{r.unsafe ? <> · <span className="text-fail-text font-semibold">{r.unsafe} unsafe</span></> : ""}
                  </span>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-bg-secondary mt-2">
                  <div style={{ width: `${(r.unsafe / r.total) * 100}%`, background: "#C0392B" }} />
                  <div style={{ width: `${(r.inconclusive / r.total) * 100}%`, background: "#C1701E" }} />
                  <div style={{ width: `${(r.clear / r.total) * 100}%`, background: "#2E7D4F" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {info?.loaded && info.metrics && (
        <p className="text-[11px] text-text-tertiary leading-relaxed mt-5 max-w-[720px]">
          Model reliability: cross-validated AUC {info.metrics.auc} on {info.metrics.n_images} training images
          ({info.metrics.n_safe} safe-water), with each contaminant held out. Treat results as a screening aid, not a verdict.
        </p>
      )}
      {info && !info.loaded && <p className="text-[11px] text-fail-text mt-5">Water model not loaded: {info.error}</p>}
    </div>
  );
}