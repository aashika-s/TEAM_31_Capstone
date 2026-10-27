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









// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   IconCamera,
//   IconCircleCheck,
//   IconAlertTriangle,
//   IconCircleX,
//   IconArrowRight,
//   IconShieldCheck,
//   IconClock,
//   IconSearch,
//   IconStack,
// } from "@tabler/icons-react";

// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo, isToday, statusLabel } from "../../lib/format";

// const STATUS_CONFIG = {
//   COMPLIANT: {
//     icon: IconCircleCheck,
//     label: "Compliant",
//     bg: "bg-[#e9f7ed]",
//     text: "text-[#247a3e]",
//     iconBg: "bg-[#d9f1e0]",
//   },

//   NEEDS_REVIEW: {
//     icon: IconAlertTriangle,
//     label: "Needs review",
//     bg: "bg-[#fdf4e7]",
//     text: "text-[#a0650d]",
//     iconBg: "bg-[#fbe7c9]",
//   },

//   NON_COMPLIANT: {
//     icon: IconCircleX,
//     label: "Non-compliant",
//     bg: "bg-[#fdf2f2]",
//     text: "text-[#bd342d]",
//     iconBg: "bg-[#fce4e3]",
//   },

//   SUSPICIOUS: {
//     icon: IconCircleX,
//     label: "Suspicious",
//     bg: "bg-[#fdf2f2]",
//     text: "text-[#bd342d]",
//     iconBg: "bg-[#fce4e3]",
//   },
// };

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

//   const scansToday =
//     scans?.filter((s) => isToday(s.created_at)).length ?? null;

//   const needsAttention =
//     scans?.filter(
//       (s) =>
//         s.compliance_status === "SUSPICIOUS" ||
//         s.compliance_status === "NON_COMPLIANT"
//     ).length ?? null;

//   const compliantCount =
//     scans?.filter(
//       (s) => s.compliance_status === "COMPLIANT"
//     ).length ?? null;

//   const firstName = user?.name
//     ? user.name.split(" ")[0]
//     : "there";

//   return (
//     <div className="relative min-h-[calc(100vh-72px)]">

//       {/* =====================================================
//           SUBTLE INDIA-THEMED BACKGROUND
//       ====================================================== */}

//       <div
//         className="
//           absolute
//           top-0
//           right-0
//           w-[520px]
//           h-[420px]
//           overflow-hidden
//           pointer-events-none
//           opacity-[0.06]
//         "
//       >
//         <img
//           src="/image.png"
//           alt=""
//           className="
//             w-full
//             h-full
//             object-cover
//             object-right
//           "
//         />
//       </div>

//       {/* =====================================================
//           MAIN CONTENT
//       ====================================================== */}

//       <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 pt-8">

//         {/* ===================================================
//             WELCOME HEADER
//         ==================================================== */}

//         <div
//           className="
//             flex
//             flex-col
//             sm:flex-row
//             sm:items-end
//             sm:justify-between
//             gap-5
//             mb-8
//           "
//         >

//           <div>

//             <div
//               className="
//                 inline-flex
//                 items-center
//                 gap-2
//                 px-2.5
//                 py-1
//                 rounded-full
//                 bg-[#f1fcf7]
//                 text-[#38ca86]
//                 text-[10px]
//                 font-semibold
//                 mb-3
//               "
//             >
//               <span className="w-1.5 h-1.5 rounded-full bg-[#38ca86]" />
//               RETAIL WORKSPACE
//             </div>

//             <h1
//               className="
//                 text-[28px]
//                 sm:text-[32px]
//                 leading-tight
//                 tracking-[-0.035em]
//                 font-semibold
//                 text-[#17251e]
//               "
//             >
//               Welcome back, {firstName}.
//             </h1>

//             <p className="mt-2 text-sm text-[#867c70] max-w-[600px]">
//               Monitor product safety and verify labels before they reach
//               your shelves.
//             </p>

//           </div>

//           <div
//             className="
//               hidden
//               sm:flex
//               items-center
//               gap-2
//               text-[11px]
//               text-[#988e82]
//             "
//           >
//             <span className="w-2 h-2 rounded-full bg-[#2f9e50]" />
//             Safety system operational
//           </div>

//         </div>


//         {/* ===================================================
//             QUICK ACTIONS
//         ==================================================== */}

//         <div
//           className="
//             grid
//             grid-cols-1
//             sm:grid-cols-2
//             gap-4
//             mb-7
//           "
//         >

//           {/* Scan Product */}

//           <button
//             type="button"
//             onClick={() => navigate("/shop/scan")}
//             className="
//               group
//               relative
//               overflow-hidden
//               text-left
//               rounded-2xl
//               bg-[#38ca86]
//               text-white
//               p-5
//               sm:p-6
//               shadow-[0_12px_30px_rgba(31,109,71,0.18)]
//               hover:shadow-[0_16px_36px_rgba(31,109,71,0.24)]
//               transition-all
//             "
//           >

//             <div
//               className="
//                 absolute
//                 -right-8
//                 -top-10
//                 w-32
//                 h-32
//                 rounded-full
//                 bg-white/10
//               "
//             />

//             <div className="relative">

//               <div
//                 className="
//                   w-11
//                   h-11
//                   rounded-xl
//                   bg-white/15
//                   flex
//                   items-center
//                   justify-center
//                   mb-5
//                 "
//               >
//                 <IconCamera size={23} />
//               </div>

//               <div className="flex items-end justify-between gap-4">

//                 <div>

//                   <p className="text-lg font-semibold">
//                     Scan a product
//                   </p>

//                   <p className="text-xs text-white/70 mt-1">
//                     Verify a label instantly
//                   </p>

//                 </div>

//                 <IconArrowRight
//                   size={21}
//                   className="
//                     flex-shrink-0
//                     transition-transform
//                     group-hover:translate-x-1
//                   "
//                 />

//               </div>

//             </div>

//           </button>


//           {/* Product Lookup */}

//           <button
//             type="button"
//             onClick={() => navigate("/shop/lookup")}
//             className="
//               group
//               text-left
//               rounded-2xl
//               bg-white
//               border
//               border-[#e7edea]
//               p-5
//               sm:p-6
//               hover:border-[#d5ede2]
//               hover:shadow-[0_10px_28px_rgba(20,22,26,0.06)]
//               transition-all
//             "
//           >

//             <div
//               className="
//                 w-11
//                 h-11
//                 rounded-xl
//                 bg-[#f3fcf8]
//                 text-[#38ca86]
//                 flex
//                 items-center
//                 justify-center
//                 mb-5
//               "
//             >
//               <IconSearch size={22} />
//             </div>

//             <div className="flex items-end justify-between gap-4">

//               <div>

//                 <p className="text-lg font-semibold text-[#202a25]">
//                   Product lookup
//                 </p>

//                 <p className="text-xs text-[#988e82] mt-1">
//                   Search your product database
//                 </p>

//               </div>

//               <IconArrowRight
//                 size={20}
//                 className="
//                   flex-shrink-0
//                   text-[#b0a89f]
//                   transition-transform
//                   group-hover:translate-x-1
//                 "
//               />

//             </div>

//           </button>

//         </div>


//         {/* ===================================================
//             METRICS
//         ==================================================== */}

//         <div
//           className="
//             grid
//             grid-cols-1
//             sm:grid-cols-3
//             gap-4
//             mb-8
//           "
//         >

//           <MetricCard
//             icon={IconCamera}
//             value={scansToday ?? "—"}
//             label="Scans today"
//             description="Products checked today"
//           />

//           <MetricCard
//             icon={IconCircleCheck}
//             value={compliantCount ?? "—"}
//             label="Compliant products"
//             description="Passed safety checks"
//             iconType="success"
//           />

//           <MetricCard
//             icon={IconAlertTriangle}
//             value={needsAttention ?? "—"}
//             label="Needs attention"
//             description="Suspicious or non-compliant"
//             iconType="danger"
//           />

//         </div>


//         {/* ===================================================
//             RECENT SCANS HEADER
//         ==================================================== */}

//         <div className="flex items-center justify-between mb-3">

//           <div>

//             <h2 className="text-sm font-semibold text-[#24302a]">
//               Recent scans
//             </h2>

//             <p className="text-[11px] text-[#a39a8f] mt-0.5">
//               Your latest product verification activity
//             </p>

//           </div>

//           {scans && scans.length > 0 && (
//             <button
//               type="button"
//               onClick={() => navigate("/shop/history")}
//               className="
//                 text-[11px]
//                 font-semibold
//                 text-[#38ca86]
//                 hover:text-[#26a369]
//               "
//             >
//               View all
//             </button>
//           )}

//         </div>


//         {/* ===================================================
//             RECENT SCANS LIST
//         ==================================================== */}

//         <div
//           className="
//             bg-white
//             border
//             border-[#e7edea]
//             rounded-2xl
//             overflow-hidden
//           "
//         >

//           {/* Error */}

//           {error && (
//             <div className="p-5 text-xs text-[#b9241c]">
//               {error}
//             </div>
//           )}


//           {/* Loading */}

//           {!scans && !error && (
//             <div className="p-10 text-center">

//               <div
//                 className="
//                   w-9
//                   h-9
//                   rounded-full
//                   border-2
//                   border-[#38ca86]/20
//                   border-t-[#38ca86]
//                   animate-spin
//                   mx-auto
//                   mb-3
//                 "
//               />

//               <p className="text-xs text-[#988e82]">
//                 Loading scan history...
//               </p>

//             </div>
//           )}


//           {/* Empty */}

//           {scans && scans.length === 0 && (
//             <EmptyState
//               onScan={() => navigate("/shop/scan")}
//             />
//           )}


//           {/* Scan List */}

//           {scans && scans.length > 0 && (
//             <div>

//               {scans.slice(0, 6).map((scan) => {

//                 const config =
//                   STATUS_CONFIG[scan.compliance_status] ||
//                   STATUS_CONFIG.NEEDS_REVIEW;

//                 const StatusIcon = config.icon;

//                 return (
//                   <button
//                     key={scan.id}
//                     type="button"
//                     onClick={() =>
//                       navigate(`/shop/result/${scan.id}`)
//                     }
//                     className="
//                       w-full
//                       flex
//                       items-center
//                       gap-4
//                       px-5
//                       py-4
//                       text-left
//                       border-b
//                       border-[#f0f3f2]
//                       last:border-b-0
//                       hover:bg-[#fbfefd]
//                       transition-colors
//                     "
//                   >

//                     {/* Status Icon */}

//                     <div
//                       className={`
//                         w-10
//                         h-10
//                         flex-shrink-0
//                         rounded-xl
//                         flex
//                         items-center
//                         justify-center
//                         ${config.iconBg}
//                         ${config.text}
//                       `}
//                     >
//                       <StatusIcon size={19} />
//                     </div>


//                     {/* Scan Information */}

//                     <div className="flex-1 min-w-0">

//                       <p
//                         className="
//                           text-sm
//                           font-medium
//                           text-[#28322d]
//                           truncate
//                         "
//                       >
//                         {scan.image_filename}
//                       </p>

//                       <div
//                         className="
//                           flex
//                           items-center
//                           gap-2
//                           mt-1
//                           text-[10px]
//                           text-[#a39a8f]
//                         "
//                       >
//                         <span>
//                           {statusLabel(scan.compliance_status)}
//                         </span>

//                         <span>•</span>

//                         <span>
//                           {timeAgo(scan.created_at)}
//                         </span>
//                       </div>

//                     </div>


//                     {/* Status Badge */}

//                     <span
//                       className={`
//                         hidden
//                         sm:inline-flex
//                         px-2.5
//                         py-1
//                         rounded-full
//                         text-[10px]
//                         font-semibold
//                         ${config.bg}
//                         ${config.text}
//                       `}
//                     >
//                       {config.label}
//                     </span>


//                     <IconArrowRight
//                       size={16}
//                       className="
//                         flex-shrink-0
//                         text-[#c0bab3]
//                       "
//                     />

//                   </button>
//                 );
//               })}

//             </div>
//           )}

//         </div>


//         {/* ===================================================
//             TRUST STRIP
//         ==================================================== */}

//         <div
//           className="
//             mt-6
//             mb-4
//             flex
//             flex-wrap
//             items-center
//             justify-center
//             gap-x-5
//             gap-y-2
//             text-[10px]
//             text-[#aaa196]
//           "
//         >

//           <span className="flex items-center gap-1.5">
//             <IconShieldCheck size={13} />
//             Food safety focused
//           </span>

//           <span className="flex items-center gap-1.5">
//             <IconClock size={13} />
//             Real-time verification
//           </span>

//           <span className="flex items-center gap-1.5">
//             <IconStack size={13} />
//             Batch tracking
//           </span>

//         </div>

//       </div>
//     </div>
//   );
// }


// /* ============================================================
//    METRIC CARD
// ============================================================ */

// function MetricCard({
//   icon: Icon,
//   value,
//   label,
//   description,
//   iconType,
// }) {
//   let iconStyle = "bg-[#f3fcf8] text-[#38ca86]";

//   if (iconType === "success") {
//     iconStyle = "bg-[#e9f7ed] text-[#247a3e]";
//   }

//   if (iconType === "danger") {
//     iconStyle = "bg-[#fdf2f2] text-[#bd342d]";
//   }

//   return (
//     <div
//       className="
//         bg-white
//         border
//         border-[#e7edea]
//         rounded-2xl
//         p-5
//         hover:shadow-[0_8px_24px_rgba(20,22,26,0.04)]
//         transition-shadow
//       "
//     >

//       <div
//         className={`
//           w-9
//           h-9
//           rounded-lg
//           flex
//           items-center
//           justify-center
//           ${iconStyle}
//         `}
//       >
//         <Icon size={18} />
//       </div>

//       <div className="mt-5">

//         <p
//           className="
//             text-[28px]
//             leading-none
//             font-semibold
//             tracking-[-0.03em]
//             text-[#17251e]
//           "
//         >
//           {value}
//         </p>

//         <p
//           className="
//             text-xs
//             font-semibold
//             text-[#5a534b]
//             mt-2
//           "
//         >
//           {label}
//         </p>

//         <p
//           className="
//             text-[10px]
//             text-[#aaa196]
//             mt-1
//           "
//         >
//           {description}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* ============================================================
//    EMPTY STATE
// ============================================================ */

// function EmptyState({ onScan }) {
//   return (
//     <div className="py-12 px-6 text-center">

//       <div
//         className="
//           w-14
//           h-14
//           rounded-2xl
//           bg-[#f3fcf8]
//           text-[#38ca86]
//           flex
//           items-center
//           justify-center
//           mx-auto
//           mb-4
//         "
//       >
//         <IconCamera size={25} />
//       </div>

//       <h3 className="text-sm font-semibold text-[#28322d]">
//         No scans yet
//       </h3>

//       <p
//         className="
//           text-xs
//           text-[#988e82]
//           mt-1.5
//           max-w-[300px]
//           mx-auto
//         "
//       >
//         Scan your first product label to start building
//         your safety history.
//       </p>

//       <button
//         type="button"
//         onClick={onScan}
//         className="
//           mt-5
//           inline-flex
//           items-center
//           gap-2
//           px-4
//           py-2.5
//           rounded-xl
//           bg-[#38ca86]
//           text-white
//           text-xs
//           font-semibold
//           shadow-[0_6px_16px_rgba(31,109,71,0.18)]
//           hover:bg-[#30a36d]
//           transition-colors
//         "
//       >
//         <IconCamera size={15} />
//         Scan first product
//       </button>

//     </div>
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
  IconSearch,
} from "@tabler/icons-react";

import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import Pill from "../../components/Pill";
import DonutBreakdown from "../../components/DonutBreakdown";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo, isToday, statusLabel } from "../../lib/format";

const STATUS_ICON = {
  COMPLIANT: { icon: IconCircleCheck, color: "green" },
  NEEDS_REVIEW: { icon: IconAlertTriangle, color: "amber" },
  NON_COMPLIANT: { icon: IconCircleX, color: "red" },
  SUSPICIOUS: { icon: IconCircleX, color: "red" },
};

export default function ShopHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listScans()
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
    scans?.filter((s) => s.compliance_status === "COMPLIANT").length ?? null;

  const needsReviewCount =
    scans?.filter((s) => s.compliance_status === "NEEDS_REVIEW").length ?? null;

  const nonCompliantCount =
    scans?.filter(
      (s) =>
        s.compliance_status === "NON_COMPLIANT" ||
        s.compliance_status === "SUSPICIOUS"
    ).length ?? null;

  const avgScore =
    scans && scans.length > 0
      ? Math.round(
          scans.reduce(
            (sum, s) => sum + s.compliance_score,
            0
          ) / scans.length
        )
      : null;

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "there";

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12">

      {/* =========================================================
          HERO
      ========================================================= */}
      <div
        className="relative rounded-app-lg overflow-hidden mb-6 px-6 py-8 sm:px-8 sm:py-10 min-h-[210px] flex items-center"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(43,38,32,0.86) 0%,
              rgba(43,38,32,0.62) 48%,
              rgba(43,38,32,0.18) 100%
            ),
            url('https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-green-300" />
            Safety system operational
          </div>

          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] text-white">
            Good morning, {firstName}.
          </h1>

          <p className="mt-2 text-sm text-white/85 max-w-[440px]">
            Monitor product safety and verify labels before they reach your
            shelves.
          </p>
        </div>
      </div>


      {/* =========================================================
          PRIMARY ACTIONS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">

        {/* Scan Product */}
        <button
          type="button"
          onClick={() => navigate("/shop/scan")}
          className="
            group relative text-left rounded-app-lg overflow-hidden
            min-h-[178px]
            bg-accent text-white
            shadow-[var(--shadow-elevated)]
            hover:brightness-95
            transition-all
          "
        >
          {/* Product image on right */}
          <div
            className="absolute inset-y-0 right-0 w-[46%]"
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(22,105,69,1) 0%,
                  rgba(22,105,69,0.48) 45%,
                  rgba(22,105,69,0.05) 100%
                ),
                url('https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg')
              `,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-5 sm:p-6 h-full flex flex-col justify-between">

            <div className="w-11 h-11 rounded-app-md bg-white/15 flex items-center justify-center">
              <IconCamera size={23} />
            </div>

            <div className="flex items-end justify-between gap-4 mt-7">
              <div>
                <p className="text-lg font-semibold">
                  Scan a product
                </p>

                <p className="text-xs text-white/75 mt-1">
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
            group text-left
            rounded-app-lg
            bg-bg-primary
            border border-border-tertiary
            p-5 sm:p-6
            min-h-[178px]
            hover:shadow-[var(--shadow-card)]
            transition-all
          "
        >
          <div className="w-11 h-11 rounded-app-md bg-accent-bg text-accent-text flex items-center justify-center mb-5">
            <IconSearch size={22} />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-text-primary">
                Product lookup
              </p>

              <p className="text-xs text-text-secondary mt-1">
                Search your product database
              </p>
            </div>

            <IconArrowRight
              size={20}
              className="
                flex-shrink-0
                text-text-tertiary
                transition-transform
                group-hover:translate-x-1
              "
            />
          </div>
        </button>
      </div>


      {/* =========================================================
          METRICS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <MetricTile
          icon={IconCamera}
          value={scansToday ?? "—"}
          label="Scans today"
          description="Products checked today"
        />

        <MetricTile
          icon={IconCircleCheck}
          value={compliantCount ?? "—"}
          label="Compliant products"
          description="Passed safety checks"
          tone="pass"
        />

        <MetricTile
          icon={IconAlertTriangle}
          value={needsAttention ?? "—"}
          label="Needs attention"
          description="Suspicious or non-compliant"
          tone="fail"
        />

      </div>


      {/* =========================================================
          RECENT SCANS + COMPLIANCE OVERVIEW
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* =====================================================
            RECENT SCANS
        ===================================================== */}
        <div className="lg:col-span-2">

          <div className="flex items-center justify-between mb-3">

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Recent scans
              </h2>

              <p className="text-[11px] text-text-tertiary mt-0.5">
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
                  text-accent-text
                  hover:text-accent
                "
              >
                View all
              </button>
            )}

          </div>


          <div className="bg-bg-primary border border-border-tertiary rounded-app-lg overflow-hidden">

            {/* Error */}
            {error && (
              <p className="p-5 text-xs text-fail-text">
                {error}
              </p>
            )}


            {/* Loading */}
            {!scans && !error && (
              <p className="p-10 text-center text-xs text-text-secondary">
                Loading scan history…
              </p>
            )}


            {/* Empty state */}
            {scans && scans.length === 0 && (
              <div className="py-12 px-6 text-center">

                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-accent-bg text-accent-text flex items-center justify-center">
                  <IconCamera size={20} />
                </div>

                <h3 className="text-sm font-semibold text-text-primary">
                  No scans yet
                </h3>

                <p className="text-xs text-text-secondary mt-1.5 max-w-[300px] mx-auto">
                  Scan your first product label to start building your
                  safety history.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/shop/scan")}
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-app-md
                    bg-accent
                    text-white
                    text-xs
                    font-semibold
                    hover:brightness-95
                    transition-colors
                  "
                >
                  <IconCamera size={15} />
                  Scan first product
                </button>

              </div>
            )}


            {/* Scan list */}
            {scans && scans.length > 0 && (
              <div className="px-2">

                {scans.slice(0, 6).map((scan) => {

                  const meta =
                    STATUS_ICON[scan.compliance_status] ||
                    STATUS_ICON.COMPLIANT;

                  const Icon = meta.icon;

                  return (
                    <ListItem
                      key={scan.id}
                      icon={<Icon size={16} />}
                      iconColor={meta.color}
                      title={scan.image_filename}
                      sub={`${statusLabel(
                        scan.compliance_status
                      )} · ${timeAgo(scan.created_at)}`}
                      right={
                        <Pill status={scan.compliance_status}>
                          {statusLabel(scan.compliance_status)}
                        </Pill>
                      }
                      onClick={() =>
                        navigate(`/shop/result/${scan.id}`)
                      }
                    />
                  );
                })}

              </div>
            )}

          </div>
        </div>


        {/* =====================================================
            COMPLIANCE OVERVIEW
        ===================================================== */}
        <div>

          <div className="flex items-center justify-between mb-3">

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Compliance overview
              </h2>

              <p className="text-[11px] text-text-tertiary mt-0.5">
                Overall product verification status
              </p>
            </div>

          </div>


          <Card className="mb-0 h-full">

            {scans && scans.length > 0 ? (
              <>

                {/* Score */}
                <div className="flex justify-center relative mb-5">

                  <DonutBreakdown
                    segments={[
                      {
                        value: compliantCount,
                        color: "var(--color-progress-pass)",
                      },
                      {
                        value: needsReviewCount,
                        color: "var(--color-progress-warn)",
                      },
                      {
                        value: nonCompliantCount,
                        color: "var(--color-progress-fail)",
                      },
                    ]}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-[27px] font-bold tracking-[-0.03em] text-text-primary">
                      {avgScore}%
                    </span>

                    <span className="text-[10px] text-text-tertiary">
                      avg score
                    </span>

                  </div>

                </div>


                {/* Status legend */}
                <div className="space-y-3">

                  <LegendRow
                    color="var(--color-progress-pass)"
                    label="Compliant"
                    count={compliantCount}
                    total={scans.length}
                  />

                  <LegendRow
                    color="var(--color-progress-warn)"
                    label="Needs review"
                    count={needsReviewCount}
                    total={scans.length}
                  />

                  <LegendRow
                    color="var(--color-progress-fail)"
                    label="Non-compliant"
                    count={nonCompliantCount}
                    total={scans.length}
                  />

                </div>

              </>
            ) : (

              <div className="py-10 text-center">

                <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-accent-bg text-accent-text flex items-center justify-center">
                  <IconCircleCheck size={19} />
                </div>

                <p className="text-xs text-text-secondary max-w-[220px] mx-auto">
                  Scan a product to see your compliance breakdown.
                </p>

              </div>

            )}

          </Card>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   COMPLIANCE LEGEND
============================================================= */

function LegendRow({
  color,
  label,
  count,
  total,
}) {
  const pct =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <div className="flex items-center justify-between text-[12px]">

      <div className="flex items-center gap-2">

        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: color }}
        />

        <span className="text-text-secondary">
          {label}
        </span>

      </div>

      <span className="text-text-primary font-medium">
        {count} ({pct}%)
      </span>

    </div>
  );
}


/* =============================================================
   METRIC TILE
============================================================= */

function MetricTile({
  icon: Icon,
  value,
  label,
  description,
  tone,
}) {
  const toneStyles =
    tone === "pass"
      ? "bg-pass-bg text-pass-text"
      : tone === "fail"
      ? "bg-fail-bg text-fail-text"
      : "bg-accent-bg text-accent-text";

  return (
    <Card className="mb-0 hover:shadow-[var(--shadow-elevated)] transition-shadow">

      <div
        className={`
          w-9 h-9
          rounded-app-md
          flex
          items-center
          justify-center
          ${toneStyles}
        `}
      >
        <Icon size={18} />
      </div>

      <div className="mt-5">

        <p className="text-[26px] leading-none font-bold tracking-[-0.02em] text-text-primary">
          {value}
        </p>

        <p className="text-xs font-semibold text-text-secondary mt-2">
          {label}
        </p>

        <p className="text-[11px] text-text-tertiary mt-1">
          {description}
        </p>

      </div>

    </Card>
  );
}