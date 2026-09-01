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
  IconMap,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Avatar from "../../components/Avatar";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
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

  return (
    <>
      <TopBar
        title="Compliance Dashboard"
        right={
          <Avatar
            initials={initials(user?.name)}
            bg="var(--color-warn-bg)"
            text="var(--color-warn-text)"
          />
        }
      />

      <ScreenContent>
        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-bg text-accent text-[11px] font-semibold tracking-wide">
                <IconShieldCheck size={14} />
                REGULATORY WORKSPACE
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-pass-text" />
              Safety system operational
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-text-primary tracking-tight">
            Compliance overview
          </h1>

          <p className="text-base text-text-secondary mt-1">
            {user?.organization || user?.name}
          </p>

          <p className="text-sm text-text-secondary mt-3 max-w-2xl">
            Monitor flagged products, review compliance concerns, and oversee
            food safety activity across registered manufacturers.
          </p>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Flagged products */}
          <button
            type="button"
            onClick={() => navigate("/fssai/flagged")}
            className="
              relative
              overflow-hidden
              text-left
              rounded-app-lg
              bg-accent
              text-white
              p-6
              min-h-[175px]
              shadow-[0_12px_30px_rgba(83,74,183,0.22)]
              hover:shadow-[0_16px_36px_rgba(83,74,183,0.28)]
              hover:-translate-y-0.5
              transition-all
              group
            "
          >
            {/* Decorative circle */}
            <div className="absolute -right-10 -top-14 w-44 h-44 rounded-full bg-white/10" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-app-md bg-white/15 flex items-center justify-center mb-5">
                  <IconFlag size={25} />
                </div>

                <h2 className="text-lg font-semibold">
                  Review flagged products
                </h2>

                <p className="text-sm text-white/75 mt-1">
                  Investigate products requiring regulatory attention
                </p>
              </div>

              <div className="flex items-center justify-between mt-5">
                <span className="text-sm font-medium">
                  {openCount ?? "—"} open flags
                </span>

                <IconArrowRight
                  size={21}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </button>

          {/* Manufacturers */}
          <button
            type="button"
            onClick={() => navigate("/fssai/manufacturers")}
            className="
              relative
              overflow-hidden
              text-left
              rounded-app-lg
              bg-bg-primary
              border
              border-border-tertiary
              p-6
              min-h-[175px]
              shadow-[0_8px_24px_rgba(40,38,80,0.06)]
              hover:border-accent
              hover:-translate-y-0.5
              transition-all
              group
            "
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-app-md bg-accent-bg text-accent flex items-center justify-center mb-5">
                  <IconBuildingFactory2 size={25} />
                </div>

                <h2 className="text-lg font-semibold text-text-primary">
                  Manufacturer registry
                </h2>

                <p className="text-sm text-text-secondary mt-1">
                  Browse manufacturers and their registered products
                </p>
              </div>

              <div className="flex items-center justify-between mt-5">
                <span className="text-sm text-text-secondary">
                  View manufacturers
                </span>

                <IconArrowRight
                  size={21}
                  className="text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all"
                />
              </div>
            </div>
          </button>
        </div>

        {/* ================= METRICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total flags */}
          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 shadow-[0_6px_20px_rgba(40,38,80,0.04)]">
            <div className="w-10 h-10 rounded-app-md bg-accent-bg text-accent flex items-center justify-center mb-5">
              <IconFlag size={20} />
            </div>

            <p className="text-3xl font-semibold text-text-primary">
              {totalFlags ?? "—"}
            </p>

            <p className="text-sm font-medium text-text-primary mt-1">
              Total flags
            </p>

            <p className="text-xs text-text-tertiary mt-1">
              Compliance issues recorded
            </p>
          </div>

          {/* Open */}
          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 shadow-[0_6px_20px_rgba(40,38,80,0.04)]">
            <div className="w-10 h-10 rounded-app-md bg-fail-bg text-fail-text flex items-center justify-center mb-5">
              <IconAlertTriangle size={20} />
            </div>

            <p className="text-3xl font-semibold text-fail-text">
              {openCount ?? "—"}
            </p>

            <p className="text-sm font-medium text-text-primary mt-1">
              Open flags
            </p>

            <p className="text-xs text-text-tertiary mt-1">
              Requiring immediate attention
            </p>
          </div>

          {/* Under review */}
          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 shadow-[0_6px_20px_rgba(40,38,80,0.04)]">
            <div className="w-10 h-10 rounded-app-md bg-warn-bg text-warn-text flex items-center justify-center mb-5">
              <IconShieldCheck size={20} />
            </div>

            <p className="text-3xl font-semibold text-warn-text">
              {reviewCount ?? "—"}
            </p>

            <p className="text-sm font-medium text-text-primary mt-1">
              Under review
            </p>

            <p className="text-xs text-text-tertiary mt-1">
              Cases currently being assessed
            </p>
          </div>
        </div>

        {/* ================= ATTENTION PANEL ================= */}
        <button
          type="button"
          onClick={() => navigate("/fssai/flagged")}
          className="
            w-full
            text-left
            rounded-app-lg
            bg-bg-primary
            border
            border-border-tertiary
            p-5
            mb-7
            shadow-[0_8px_24px_rgba(40,38,80,0.05)]
            hover:border-accent
            transition-all
            group
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-app-md bg-fail-bg text-fail-text flex items-center justify-center flex-shrink-0">
                <IconAlertTriangle size={23} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Items requiring attention
                </h2>

                <p className="text-xs text-text-secondary mt-1">
                  Review flagged products and unresolved compliance concerns
                </p>
              </div>
            </div>

            <IconArrowRight
              size={21}
              className="text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0"
            />
          </div>

          <div className="flex items-center gap-7 mt-5">
            <div>
              <p className="text-2xl font-semibold text-fail-text">
                {openCount ?? "—"}
              </p>

              <p className="text-xs text-text-secondary mt-0.5">
                Open flags
              </p>
            </div>

            <div className="w-px h-9 bg-border-tertiary" />

            <div>
              <p className="text-2xl font-semibold text-warn-text">
                {reviewCount ?? "—"}
              </p>

              <p className="text-xs text-text-secondary mt-0.5">
                Under review
              </p>
            </div>
          </div>
        </button>

        {/* ================= RECENT FLAGS ================= */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
              Monitoring
            </p>

            <h2 className="text-lg font-semibold text-text-primary mt-1">
              Recent flags
            </h2>
          </div>

          {flags && flags.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/fssai/flagged")}
              className="text-xs font-medium text-accent hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-app-lg bg-fail-bg border border-border-tertiary px-4 py-4 mb-4">
            <p className="text-xs text-fail-text">
              {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {!flags && !error && (
          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-6">
            <p className="text-sm text-text-secondary">
              Loading compliance data…
            </p>
          </div>
        )}

        {/* Empty state */}
        {flags && flags.length === 0 && (
          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-8 text-center shadow-[0_6px_20px_rgba(40,38,80,0.04)]">
            <div className="w-14 h-14 rounded-full bg-pass-bg flex items-center justify-center mx-auto mb-4">
              <IconShieldCheck
                size={26}
                className="text-pass-text"
              />
            </div>

            <h3 className="text-sm font-semibold text-text-primary">
              No flags raised
            </h3>

            <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
              There are currently no compliance issues requiring regulatory
              attention.
            </p>

            <div className="inline-flex items-center gap-2 mt-4 text-xs text-pass-text font-medium">
              <span className="w-2 h-2 rounded-full bg-pass-text" />
              Compliance monitoring active
            </div>
          </div>
        )}

        {/* Flag list */}
        {flags && flags.length > 0 && (
          <Card>
            {flags.slice(0, 10).map((f) => {
              const isOpen = f.status === "OPEN";
              const isReview = f.status === "UNDER_REVIEW";

              return (
                <ListItem
                  key={f.id}
                  icon={<IconFlag size={16} />}
                  iconColor={
                    isOpen
                      ? "red"
                      : isReview
                      ? "amber"
                      : "green"
                  }
                  title={f.reason}
                  sub={timeAgo(f.created_at)}
                  right={
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
                  }
                  onClick={() =>
                    navigate(`/fssai/flagged/${f.id}`)
                  }
                />
              );
            })}
          </Card>
        )}

        {/* ================= FOOTER INFO ================= */}
        <div className="flex items-center justify-center gap-2 py-7 text-xs text-text-tertiary">
          <IconShieldCheck size={14} />
          <span>
            Regulatory information is securely associated with your account.
          </span>
        </div>
      </ScreenContent>
    </>
  );
}