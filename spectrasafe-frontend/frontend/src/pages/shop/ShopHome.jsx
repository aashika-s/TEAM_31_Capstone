// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconCircleCheck, IconAlertTriangle, IconCircleX, IconHelpCircle } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Avatar from "../../components/Avatar";
// import MetricRow from "../../components/MetricRow";
// import SectionLabel from "../../components/SectionLabel";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Pill from "../../components/Pill";
// import ScanBox from "../../components/ScanBox";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo, isToday, statusLabel } from "../../lib/format";

// const STATUS_ICON = {
//   COMPLIANT: { icon: IconCircleCheck, color: "green" },
//   NEEDS_REVIEW: { icon: IconAlertTriangle, color: "amber" },
//   NON_COMPLIANT: { icon: IconCircleX, color: "red" },
//   SUSPICIOUS: { icon: IconCircleX, color: "red" },
// };

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// export default function ShopHome() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [scans, setScans] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api
//       .listScans()
//       .then(setScans)
//       .catch((e) => setError(e.message));
//   }, []);

//   // Both metrics are computed client-side from the real scan list -- there's
//   // no dedicated aggregation endpoint yet. "Flagged" is a stand-in based on
//   // compliance_status (SUSPICIOUS/NON_COMPLIANT), NOT a real flag-to-FSSAI
//   // count -- that's a separate feature (a Flag model + endpoint) that
//   // doesn't exist until phase 4. Labeled accordingly below, not as if it's
//   // the real flagging feature.
//   const scansToday = scans?.filter((s) => isToday(s.created_at)).length ?? null;
//   const needsAttention =
//     scans?.filter((s) => s.compliance_status === "SUSPICIOUS" || s.compliance_status === "NON_COMPLIANT").length ?? null;

//   return (
//     <>
//       <TopBar title="SpectraSafe" right={<Avatar initials={initials(user?.name)} />} />
//       <ScreenContent>
//         <p className="text-xs text-text-secondary mb-3">
//           {user?.organization || user?.name}
//         </p>

//         <MetricRow
//           metrics={[
//             { value: scansToday ?? "—", label: "Scans today" },
//             { value: needsAttention ?? "—", label: "Non-compliant/suspicious", color: "var(--color-fail-text)" },
//           ]}
//         />

//         <ScanBox onClick={() => navigate("/shop/scan")} />

//         <SectionLabel>Recent scans</SectionLabel>
//         {error && <p className="text-xs text-fail-text">{error}</p>}
//         {!scans && !error && <p className="text-xs text-text-secondary">Loading…</p>}
//         {scans && scans.length === 0 && (
//           <p className="text-xs text-text-secondary">No scans yet — tap above to scan your first label.</p>
//         )}
//         {scans && scans.length > 0 && (
//           <Card>
//             {scans.slice(0, 10).map((scan) => {
//               const meta = STATUS_ICON[scan.compliance_status] || { icon: IconHelpCircle, color: "purple" };
//               const Icon = meta.icon;
//               return (
//                 <ListItem
//                   key={scan.id}
//                   icon={<Icon size={16} />}
//                   iconColor={meta.color}
//                   title={scan.image_filename}
//                   sub={`${statusLabel(scan.compliance_status)} · ${timeAgo(scan.created_at)}`}
//                   right={<Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>}
//                   onClick={() => navigate(`/shop/result/${scan.id}`)}
//                 />
//               );
//             })}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }









import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconCamera,
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconSearch,
  IconStack,
} from "@tabler/icons-react";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo, isToday, statusLabel } from "../../lib/format";

const STATUS_CONFIG = {
  COMPLIANT: {
    icon: IconCircleCheck,
    label: "Compliant",
    bg: "bg-[#e9f7ed]",
    text: "text-[#247a37]",
    iconBg: "bg-[#d9f1df]",
  },

  NEEDS_REVIEW: {
    icon: IconAlertTriangle,
    label: "Needs review",
    bg: "bg-[#fff6e5]",
    text: "text-[#a56a08]",
    iconBg: "bg-[#ffedc5]",
  },

  NON_COMPLIANT: {
    icon: IconCircleX,
    label: "Non-compliant",
    bg: "bg-[#fff0f0]",
    text: "text-[#bd2d2d]",
    iconBg: "bg-[#ffe0e0]",
  },

  SUSPICIOUS: {
    icon: IconCircleX,
    label: "Suspicious",
    bg: "bg-[#fff0f0]",
    text: "text-[#bd2d2d]",
    iconBg: "bg-[#ffe0e0]",
  },
};

export default function ShopHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listScans()
      .then(setScans)
      .catch((e) => setError(e.message));
  }, []);

  const scansToday =
    scans?.filter((s) => isToday(s.created_at)).length ?? null;

  const needsAttention =
    scans?.filter(
      (s) =>
        s.compliance_status === "SUSPICIOUS" ||
        s.compliance_status === "NON_COMPLIANT"
    ).length ?? null;

  const compliantCount =
    scans?.filter(
      (s) => s.compliance_status === "COMPLIANT"
    ).length ?? null;

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "there";

  return (
    <div className="relative min-h-[calc(100vh-72px)]">

      {/* =====================================================
          SUBTLE INDIA-THEMED BACKGROUND
      ====================================================== */}

      <div
        className="
          absolute
          top-0
          right-0
          w-[520px]
          h-[420px]
          overflow-hidden
          pointer-events-none
          opacity-[0.06]
        "
      >
        <img
          src="/image.png"
          alt=""
          className="
            w-full
            h-full
            object-cover
            object-right
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 pt-8">

        {/* ===================================================
            WELCOME HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-5
            mb-8
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-2.5
                py-1
                rounded-full
                bg-[#eeefff]
                text-[#4338ca]
                text-[10px]
                font-semibold
                mb-3
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca]" />
              RETAIL WORKSPACE
            </div>

            <h1
              className="
                text-[28px]
                sm:text-[32px]
                leading-tight
                tracking-[-0.035em]
                font-semibold
                text-[#171925]
              "
            >
              Welcome back, {firstName}.
            </h1>

            <p className="mt-2 text-sm text-[#737783] max-w-[600px]">
              Monitor product safety and verify labels before they reach
              your shelves.
            </p>

          </div>

          <div
            className="
              hidden
              sm:flex
              items-center
              gap-2
              text-[11px]
              text-[#858995]
            "
          >
            <span className="w-2 h-2 rounded-full bg-[#2f9e44]" />
            Safety system operational
          </div>

        </div>


        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
            mb-7
          "
        >

          {/* Scan Product */}

          <button
            type="button"
            onClick={() => navigate("/shop/scan")}
            className="
              group
              relative
              overflow-hidden
              text-left
              rounded-2xl
              bg-[#4338ca]
              text-white
              p-5
              sm:p-6
              shadow-[0_12px_30px_rgba(67,56,202,0.18)]
              hover:shadow-[0_16px_36px_rgba(67,56,202,0.24)]
              transition-all
            "
          >

            <div
              className="
                absolute
                -right-8
                -top-10
                w-32
                h-32
                rounded-full
                bg-white/10
              "
            />

            <div className="relative">

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-white/15
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <IconCamera size={23} />
              </div>

              <div className="flex items-end justify-between gap-4">

                <div>

                  <p className="text-lg font-semibold">
                    Scan a product
                  </p>

                  <p className="text-xs text-white/70 mt-1">
                    Verify a label instantly
                  </p>

                </div>

                <IconArrowRight
                  size={21}
                  className="
                    flex-shrink-0
                    transition-transform
                    group-hover:translate-x-1
                  "
                />

              </div>

            </div>

          </button>


          {/* Product Lookup */}

          <button
            type="button"
            onClick={() => navigate("/shop/lookup")}
            className="
              group
              text-left
              rounded-2xl
              bg-white
              border
              border-[#e7e8ed]
              p-5
              sm:p-6
              hover:border-[#d5d5ed]
              hover:shadow-[0_10px_28px_rgba(20,22,26,0.06)]
              transition-all
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-[#f0f0ff]
                text-[#4338ca]
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <IconSearch size={22} />
            </div>

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-lg font-semibold text-[#20222a]">
                  Product lookup
                </p>

                <p className="text-xs text-[#858995] mt-1">
                  Search your product database
                </p>

              </div>

              <IconArrowRight
                size={20}
                className="
                  flex-shrink-0
                  text-[#a1a4ae]
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            </div>

          </button>

        </div>


        {/* ===================================================
            METRICS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            mb-8
          "
        >

          <MetricCard
            icon={IconCamera}
            value={scansToday ?? "—"}
            label="Scans today"
            description="Products checked today"
          />

          <MetricCard
            icon={IconCircleCheck}
            value={compliantCount ?? "—"}
            label="Compliant products"
            description="Passed safety checks"
            iconType="success"
          />

          <MetricCard
            icon={IconAlertTriangle}
            value={needsAttention ?? "—"}
            label="Needs attention"
            description="Suspicious or non-compliant"
            iconType="danger"
          />

        </div>


        {/* ===================================================
            RECENT SCANS HEADER
        ==================================================== */}

        <div className="flex items-center justify-between mb-3">

          <div>

            <h2 className="text-sm font-semibold text-[#242630]">
              Recent scans
            </h2>

            <p className="text-[11px] text-[#9296a0] mt-0.5">
              Your latest product verification activity
            </p>

          </div>

          {scans && scans.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/shop/history")}
              className="
                text-[11px]
                font-semibold
                text-[#4338ca]
                hover:text-[#3026a3]
              "
            >
              View all
            </button>
          )}

        </div>


        {/* ===================================================
            RECENT SCANS LIST
        ==================================================== */}

        <div
          className="
            bg-white
            border
            border-[#e7e8ed]
            rounded-2xl
            overflow-hidden
          "
        >

          {/* Error */}

          {error && (
            <div className="p-5 text-xs text-[#b91c1c]">
              {error}
            </div>
          )}


          {/* Loading */}

          {!scans && !error && (
            <div className="p-10 text-center">

              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  border-2
                  border-[#4338ca]/20
                  border-t-[#4338ca]
                  animate-spin
                  mx-auto
                  mb-3
                "
              />

              <p className="text-xs text-[#858995]">
                Loading scan history...
              </p>

            </div>
          )}


          {/* Empty */}

          {scans && scans.length === 0 && (
            <EmptyState
              onScan={() => navigate("/shop/scan")}
            />
          )}


          {/* Scan List */}

          {scans && scans.length > 0 && (
            <div>

              {scans.slice(0, 6).map((scan) => {

                const config =
                  STATUS_CONFIG[scan.compliance_status] ||
                  STATUS_CONFIG.NEEDS_REVIEW;

                const StatusIcon = config.icon;

                return (
                  <button
                    key={scan.id}
                    type="button"
                    onClick={() =>
                      navigate(`/shop/result/${scan.id}`)
                    }
                    className="
                      w-full
                      flex
                      items-center
                      gap-4
                      px-5
                      py-4
                      text-left
                      border-b
                      border-[#f0f1f3]
                      last:border-b-0
                      hover:bg-[#fafaff]
                      transition-colors
                    "
                  >

                    {/* Status Icon */}

                    <div
                      className={`
                        w-10
                        h-10
                        flex-shrink-0
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${config.iconBg}
                        ${config.text}
                      `}
                    >
                      <StatusIcon size={19} />
                    </div>


                    {/* Scan Information */}

                    <div className="flex-1 min-w-0">

                      <p
                        className="
                          text-sm
                          font-medium
                          text-[#282a32]
                          truncate
                        "
                      >
                        {scan.image_filename}
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mt-1
                          text-[10px]
                          text-[#9296a0]
                        "
                      >
                        <span>
                          {statusLabel(scan.compliance_status)}
                        </span>

                        <span>•</span>

                        <span>
                          {timeAgo(scan.created_at)}
                        </span>
                      </div>

                    </div>


                    {/* Status Badge */}

                    <span
                      className={`
                        hidden
                        sm:inline-flex
                        px-2.5
                        py-1
                        rounded-full
                        text-[10px]
                        font-semibold
                        ${config.bg}
                        ${config.text}
                      `}
                    >
                      {config.label}
                    </span>


                    <IconArrowRight
                      size={16}
                      className="
                        flex-shrink-0
                        text-[#b4b7bf]
                      "
                    />

                  </button>
                );
              })}

            </div>
          )}

        </div>


        {/* ===================================================
            TRUST STRIP
        ==================================================== */}

        <div
          className="
            mt-6
            mb-4
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-5
            gap-y-2
            text-[10px]
            text-[#9a9da6]
          "
        >

          <span className="flex items-center gap-1.5">
            <IconShieldCheck size={13} />
            Food safety focused
          </span>

          <span className="flex items-center gap-1.5">
            <IconClock size={13} />
            Real-time verification
          </span>

          <span className="flex items-center gap-1.5">
            <IconStack size={13} />
            Batch tracking
          </span>

        </div>

      </div>
    </div>
  );
}


/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  icon: Icon,
  value,
  label,
  description,
  iconType,
}) {
  let iconStyle = "bg-[#f0f0ff] text-[#4338ca]";

  if (iconType === "success") {
    iconStyle = "bg-[#e9f7ed] text-[#247a37]";
  }

  if (iconType === "danger") {
    iconStyle = "bg-[#fff0f0] text-[#bd2d2d]";
  }

  return (
    <div
      className="
        bg-white
        border
        border-[#e7e8ed]
        rounded-2xl
        p-5
        hover:shadow-[0_8px_24px_rgba(20,22,26,0.04)]
        transition-shadow
      "
    >

      <div
        className={`
          w-9
          h-9
          rounded-lg
          flex
          items-center
          justify-center
          ${iconStyle}
        `}
      >
        <Icon size={18} />
      </div>

      <div className="mt-5">

        <p
          className="
            text-[28px]
            leading-none
            font-semibold
            tracking-[-0.03em]
            text-[#171925]
          "
        >
          {value}
        </p>

        <p
          className="
            text-xs
            font-semibold
            text-[#4b4f5a]
            mt-2
          "
        >
          {label}
        </p>

        <p
          className="
            text-[10px]
            text-[#9a9da6]
            mt-1
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ onScan }) {
  return (
    <div className="py-12 px-6 text-center">

      <div
        className="
          w-14
          h-14
          rounded-2xl
          bg-[#f0f0ff]
          text-[#4338ca]
          flex
          items-center
          justify-center
          mx-auto
          mb-4
        "
      >
        <IconCamera size={25} />
      </div>

      <h3 className="text-sm font-semibold text-[#282a32]">
        No scans yet
      </h3>

      <p
        className="
          text-xs
          text-[#858995]
          mt-1.5
          max-w-[300px]
          mx-auto
        "
      >
        Scan your first product label to start building
        your safety history.
      </p>

      <button
        type="button"
        onClick={onScan}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          px-4
          py-2.5
          rounded-xl
          bg-[#4338ca]
          text-white
          text-xs
          font-semibold
          shadow-[0_6px_16px_rgba(67,56,202,0.18)]
          hover:bg-[#3730a3]
          transition-colors
        "
      >
        <IconCamera size={15} />
        Scan first product
      </button>

    </div>
  );
}

