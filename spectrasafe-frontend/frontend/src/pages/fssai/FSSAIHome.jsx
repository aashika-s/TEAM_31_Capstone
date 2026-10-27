// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconFlag } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Avatar from "../../components/Avatar";
// import MetricRow from "../../components/MetricRow";
// import SectionLabel from "../../components/SectionLabel";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Pill from "../../components/Pill";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// export default function FSSAIHome() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [flags, setFlags] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api
//       .listFlags()
//       .then(setFlags)
//       .catch((e) => setError(e.message));
//   }, []);

//   const openCount = flags?.filter((f) => f.status === "OPEN").length ?? null;

//   return (
//     <>
//       <TopBar title="SpectraSafe — FSSAI" right={<Avatar initials={initials(user?.name)} bg="var(--color-warn-bg)" text="var(--color-warn-text)" />} />
//       <ScreenContent>
//         <p className="text-xs text-text-secondary mb-3">{user?.organization || user?.name}</p>

//         <MetricRow
//           metrics={[
//             { value: flags?.length ?? "—", label: "Total flags" },
//             { value: openCount ?? "—", label: "Open", color: "var(--color-fail-text)" },
//           ]}
//         />

//         <SectionLabel>Recent flags</SectionLabel>
//         {error && <p className="text-xs text-fail-text">{error}</p>}
//         {!flags && !error && <p className="text-xs text-text-secondary">Loading…</p>}
//         {flags && flags.length === 0 && (
//           <p className="text-xs text-text-secondary">No flags raised yet.</p>
//         )}
//         {flags && flags.length > 0 && (
//           <Card>
//             {flags.slice(0, 10).map((f) => (
//               <ListItem
//                 key={f.id}
//                 icon={<IconFlag size={16} />}
//                 iconColor={f.status === "OPEN" ? "red" : f.status === "UNDER_REVIEW" ? "amber" : "green"}
//                 title={f.reason}
//                 sub={timeAgo(f.created_at)}
//                 right={<Pill variant={f.status === "OPEN" ? "fail" : f.status === "UNDER_REVIEW" ? "warn" : "pass"}>{f.status}</Pill>}
//                 onClick={() => navigate(`/fssai/flagged/${f.id}`)}
//               />
//             ))}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }
















import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconFlag,
  IconShieldCheck,
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingFactory2,
  IconClock,
  IconActivity,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Avatar from "../../components/Avatar";
import Pill from "../../components/Pill";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FSSAIHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listFlags()
      .then(setFlags)
      .catch((e) => setError(e.message));
  }, []);

  const totalFlags = flags?.length ?? null;

  const openCount =
    flags?.filter((f) => f.status === "OPEN").length ?? null;

  const reviewCount =
    flags?.filter((f) => f.status === "UNDER_REVIEW").length ?? null;

  const resolvedCount =
    flags?.filter((f) => f.status === "RESOLVED").length ?? null;

  const recentFlags = flags?.slice(0, 3) ?? [];

  return (
    <>

      <ScreenContent>
        <div className="max-w-[1100px] mx-auto">

          {/* =====================================================
              HEADER
          ===================================================== */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-4 mb-3">

              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-bg text-accent text-[10px] font-semibold tracking-[0.06em]">
                <IconShieldCheck size={12} />
                REGULATORY WORKSPACE
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[10px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-pass-text" />
                Safety system operational
              </div>
            </div>

            <h1 className="text-[25px] sm:text-[27px] font-semibold text-text-primary tracking-[-0.025em] leading-tight">
              Compliance overview
            </h1>

            <p className="text-xs text-text-secondary mt-1">
              {user?.organization || user?.name}
            </p>

            <p className="text-[11px] text-text-secondary mt-2 max-w-[720px] leading-relaxed">
              Monitor flagged products, review compliance concerns, and oversee
              food safety activity across registered manufacturers.
            </p>
          </div>

          {/* =====================================================
              METRICS
          ===================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">

            {/* OPEN FLAGS */}
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                px-4 py-4
                shadow-[0_4px_16px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-9 h-9 rounded-[9px] bg-fail-bg text-fail-text flex items-center justify-center mb-3">
                <IconFlag size={18} stroke={1.8} />
              </div>

              <p className="text-[24px] font-semibold leading-none text-fail-text">
                {openCount ?? "—"}
              </p>

              <p className="text-[12px] font-semibold text-text-primary mt-2">
                Open flags
              </p>

              <p className="text-[10px] text-text-tertiary mt-0.5">
                Requiring immediate attention
              </p>
            </div>

            {/* UNDER REVIEW */}
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                px-4 py-4
                shadow-[0_4px_16px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-9 h-9 rounded-[9px] bg-warn-bg text-warn-text flex items-center justify-center mb-3">
                <IconClock size={18} stroke={1.8} />
              </div>

              <p className="text-[24px] font-semibold leading-none text-warn-text">
                {reviewCount ?? "—"}
              </p>

              <p className="text-[12px] font-semibold text-text-primary mt-2">
                Under review
              </p>

              <p className="text-[10px] text-text-tertiary mt-0.5">
                Cases currently being assessed
              </p>
            </div>

            {/* RESOLVED */}
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                px-4 py-4
                shadow-[0_4px_16px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-9 h-9 rounded-[9px] bg-pass-bg text-pass-text flex items-center justify-center mb-3">
                <IconShieldCheck size={18} stroke={1.8} />
              </div>

              <p className="text-[24px] font-semibold leading-none text-pass-text">
                {resolvedCount ?? "—"}
              </p>

              <p className="text-[12px] font-semibold text-text-primary mt-2">
                Resolved
              </p>

              <p className="text-[10px] text-text-tertiary mt-0.5">
                Issues successfully addressed
              </p>
            </div>

            {/* MANUFACTURERS */}
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                px-4 py-4
                shadow-[0_4px_16px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-9 h-9 rounded-[9px] bg-accent-bg text-accent flex items-center justify-center mb-3">
                <IconBuildingFactory2 size={18} stroke={1.8} />
              </div>

              <p className="text-[24px] font-semibold leading-none text-text-primary">
                2
              </p>

              <p className="text-[12px] font-semibold text-text-primary mt-2">
                Manufacturers
              </p>

              <p className="text-[10px] text-text-tertiary mt-0.5">
                In your jurisdiction
              </p>
            </div>
          </div>

          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">

            {/* FLAGGED PRODUCTS */}
            <button
              type="button"
              onClick={() => navigate("/fssai/flagged")}
              className="
                relative
                overflow-hidden
                text-left
                min-h-[150px]
                rounded-[12px]
                bg-accent
                text-white
                p-4
                shadow-[0_10px_24px_rgba(31,109,71,0.18)]
                hover:-translate-y-0.5
                hover:shadow-[0_14px_28px_rgba(31,109,71,0.23)]
                transition-all duration-150
                group
              "
            >
              {/* decorative circle */}
              <div className="absolute -right-12 -top-14 w-40 h-40 rounded-full bg-white/10" />

              <div className="relative z-10 h-full flex flex-col justify-between">

                <div>
                  <div className="w-9 h-9 rounded-[9px] bg-white/15 flex items-center justify-center mb-4">
                    <IconFlag size={19} stroke={1.8} />
                  </div>

                  <h2 className="text-[13px] font-semibold">
                    Review flagged products
                  </h2>

                  <p className="text-[10px] text-white/75 mt-1 leading-relaxed">
                    Investigate products requiring regulatory attention
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-medium">
                    {openCount ?? "—"} open flags
                  </span>

                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                    <IconArrowRight
                      size={15}
                      className="text-accent group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>

              </div>
            </button>

            {/* MANUFACTURERS */}
            <button
              type="button"
              onClick={() => navigate("/fssai/manufacturers")}
              className="
                text-left
                min-h-[150px]
                rounded-[12px]
                bg-bg-primary
                border border-border-secondary
                p-4
                shadow-[0_6px_18px_rgba(40,38,80,0.04)]
                hover:border-accent
                hover:-translate-y-0.5
                transition-all duration-150
                group
              "
            >
              <div className="h-full flex flex-col justify-between">

                <div>
                  <div className="w-9 h-9 rounded-[9px] bg-accent-bg text-accent flex items-center justify-center mb-4">
                    <IconBuildingFactory2 size={19} stroke={1.8} />
                  </div>

                  <h2 className="text-[13px] font-semibold text-text-primary">
                    Manufacturer registry
                  </h2>

                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                    Browse manufacturers and their registered products
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-text-secondary">
                    View manufacturers
                  </span>

                  <div className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center">
                    <IconArrowRight
                      size={15}
                      className="text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>

              </div>
            </button>

            {/* RECENT ACTIVITY */}
            <div
              className="
                min-h-[150px]
                rounded-[12px]
                bg-bg-primary
                border border-border-secondary
                p-4
                shadow-[0_6px_18px_rgba(40,38,80,0.04)]
              "
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[12px] font-semibold text-text-primary">
                    Recent activity
                  </p>

                  <p className="text-[9px] text-text-tertiary mt-0.5">
                    Latest compliance activity
                  </p>
                </div>

                <IconActivity
                  size={16}
                  className="text-text-tertiary"
                />
              </div>

              {!flags && !error && (
                <div className="flex items-center justify-center h-[82px]">
                  <p className="text-[10px] text-text-secondary">
                    Loading activity…
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-[82px]">
                  <p className="text-[10px] text-fail-text">
                    Unable to load activity
                  </p>
                </div>
              )}

              {flags && flags.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[82px] text-center">
                  <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center mb-2">
                    <IconActivity
                      size={15}
                      className="text-text-tertiary"
                    />
                  </div>

                  <p className="text-[10px] font-medium text-text-primary">
                    No recent activity
                  </p>

                  <p className="text-[9px] text-text-tertiary mt-0.5">
                    There have been no new flags or updates.
                  </p>
                </div>
              )}

              {flags && flags.length > 0 && (
                <div className="space-y-2">
                  {recentFlags.map((flag) => {
                    const isOpen = flag.status === "OPEN";
                    const isReview = flag.status === "UNDER_REVIEW";

                    return (
                      <button
                        key={flag.id}
                        type="button"
                        onClick={() =>
                          navigate(`/fssai/flagged/${flag.id}`)
                        }
                        className="
                          w-full
                          flex
                          items-center
                          gap-2
                          text-left
                          rounded-[8px]
                          px-2
                          py-1.5
                          hover:bg-bg-secondary
                          transition-colors
                        "
                      >
                        <div
                          className={`
                            w-6 h-6
                            rounded-[6px]
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            ${
                              isOpen
                                ? "bg-fail-bg text-fail-text"
                                : isReview
                                ? "bg-warn-bg text-warn-text"
                                : "bg-pass-bg text-pass-text"
                            }
                          `}
                        >
                          <IconFlag size={12} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-medium text-text-primary truncate">
                            {flag.reason || "Compliance flag"}
                          </p>

                          <p className="text-[8px] text-text-tertiary">
                            {timeAgo(flag.created_at)}
                          </p>
                        </div>

                        <Pill
                          variant={
                            isOpen
                              ? "fail"
                              : isReview
                              ? "warn"
                              : "pass"
                          }
                        >
                          {flag.status}
                        </Pill>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              RECENT FLAGS / MONITORING
          ===================================================== */}
          <div className="flex items-end justify-between mb-2.5">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.08em] text-text-tertiary uppercase">
                Monitoring
              </p>

              <h2 className="text-[14px] font-semibold text-text-primary mt-0.5">
                Recent flags
              </h2>
            </div>

            {flags && flags.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/fssai/flagged")}
                className="text-[10px] font-medium text-accent hover:underline"
              >
                View all
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-[12px] bg-fail-bg border border-fail-text/20 px-4 py-3 mb-4">
              <p className="text-[10px] text-fail-text">
                {error}
              </p>
            </div>
          )}

          {/* LOADING */}
          {!flags && !error && (
            <div className="bg-bg-primary border border-border-secondary rounded-[12px] px-5 py-6">
              <p className="text-[10px] text-text-secondary text-center">
                Loading compliance data…
              </p>
            </div>
          )}

          {/* EMPTY */}
          {flags && flags.length === 0 && (
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                min-h-[145px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                shadow-[0_5px_18px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-9 h-9 rounded-full bg-pass-bg flex items-center justify-center mb-2">
                <IconShieldCheck
                  size={17}
                  className="text-pass-text"
                />
              </div>

              <h3 className="text-[11px] font-semibold text-text-primary">
                No flags raised
              </h3>

              <p className="text-[9px] text-text-secondary mt-1">
                There are currently no compliance issues requiring regulatory attention.
              </p>

              <div className="inline-flex items-center gap-1.5 mt-3 text-[9px] text-pass-text font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-pass-text" />
                Compliance monitoring active
              </div>
            </div>
          )}

          {/* FLAG LIST */}
          {flags && flags.length > 0 && (
            <div className="bg-bg-primary border border-border-secondary rounded-[12px] overflow-hidden">
              {flags.slice(0, 5).map((f, index) => {
                const isOpen = f.status === "OPEN";
                const isReview = f.status === "UNDER_REVIEW";

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      navigate(`/fssai/flagged/${f.id}`)
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      hover:bg-bg-secondary
                      transition-colors
                      ${
                        index !== Math.min(flags.length, 5) - 1
                          ? "border-b border-border-tertiary"
                          : ""
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-[8px]
                        flex items-center justify-center
                        flex-shrink-0
                        ${
                          isOpen
                            ? "bg-fail-bg text-fail-text"
                            : isReview
                            ? "bg-warn-bg text-warn-text"
                            : "bg-pass-bg text-pass-text"
                        }
                      `}
                    >
                      <IconFlag size={15} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-text-primary truncate">
                        {f.reason}
                      </p>

                      <p className="text-[9px] text-text-tertiary mt-0.5">
                        {timeAgo(f.created_at)}
                      </p>
                    </div>

                    <Pill
                      variant={
                        isOpen
                          ? "fail"
                          : isReview
                          ? "warn"
                          : "pass"
                      }
                    >
                      {f.status}
                    </Pill>

                    <IconArrowRight
                      size={14}
                      className="text-text-tertiary"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-center gap-2 py-6 text-[9px] text-text-tertiary">
            <IconShieldCheck size={12} />

            <span>
              Regulatory information is securely associated with your account.
            </span>
          </div>

        </div>
      </ScreenContent>
    </>
  );
}