// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconCircleCheck, IconAlertTriangle, IconCircleX } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Pill from "../../components/Pill";
// import { api } from "../../lib/api";
// import { timeAgo, statusLabel } from "../../lib/format";

// const STATUS_ICON = {
//   COMPLIANT: { icon: IconCircleCheck, color: "green" },
//   NEEDS_REVIEW: { icon: IconAlertTriangle, color: "amber" },
//   NON_COMPLIANT: { icon: IconCircleX, color: "red" },
//   SUSPICIOUS: { icon: IconCircleX, color: "red" },
// };

// const FILTERS = [
//   { key: null, label: "All" },
//   { key: "COMPLIANT", label: "Compliant" },
//   { key: "NEEDS_REVIEW", label: "Needs review" },
//   { key: "NON_COMPLIANT", label: "Non-compliant" },
//   { key: "SUSPICIOUS", label: "Suspicious" },
// ];

// export default function ShopHistory() {
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState(null);
//   const [scans, setScans] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setScans(null);
//     const params = filter ? { status: filter, limit: 100 } : { limit: 100 };
//     api
//       .listScans(params)
//       .then(setScans)
//       .catch((e) => setError(e.message));
//   }, [filter]);

//   return (
//     <>
//       <TopBar title="Scan history" onBack={() => navigate("/shop")} />
//       <ScreenContent>
//         <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
//           {FILTERS.map((f) => (
//             <button
//               key={f.label}
//               onClick={() => setFilter(f.key)}
//               className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
//                 filter === f.key
//                   ? "bg-accent text-accent-bg border-accent"
//                   : "bg-bg-primary text-text-secondary border-border-tertiary"
//               }`}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {error && <p className="text-xs text-fail-text">{error}</p>}
//         {!scans && !error && <p className="text-xs text-text-secondary">Loading…</p>}
//         {scans && scans.length === 0 && (
//           <p className="text-xs text-text-secondary">No scans match this filter.</p>
//         )}
//         {scans && scans.length > 0 && (
//           <Card>
//             {scans.map((scan) => {
//               const meta = STATUS_ICON[scan.compliance_status] || { icon: IconCircleCheck, color: "purple" };
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
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconHistory,
  IconArrowLeft,
  IconSearch,
  IconFilter,
  IconChevronRight,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";

import { api } from "../../lib/api";
import { timeAgo, statusLabel } from "../../lib/format";

const STATUS_ICON = {
  COMPLIANT: {
    icon: IconCircleCheck,
    bg: "bg-[#eef8f0]",
    text: "text-[#2f8a42]",
    dot: "bg-[#2f9e44]",
  },

  NEEDS_REVIEW: {
    icon: IconAlertTriangle,
    bg: "bg-[#fff7e9]",
    text: "text-[#a46b12]",
    dot: "bg-[#e69a1c]",
  },

  NON_COMPLIANT: {
    icon: IconCircleX,
    bg: "bg-[#fff0f0]",
    text: "text-[#c52b2b]",
    dot: "bg-[#dc2626]",
  },

  SUSPICIOUS: {
    icon: IconCircleX,
    bg: "bg-[#fff0f0]",
    text: "text-[#c52b2b]",
    dot: "bg-[#dc2626]",
  },
};

const FILTERS = [
  { key: null, label: "All" },
  { key: "COMPLIANT", label: "Compliant" },
  { key: "NEEDS_REVIEW", label: "Needs review" },
  { key: "NON_COMPLIANT", label: "Non-compliant" },
  { key: "SUSPICIOUS", label: "Suspicious" },
];

export default function ShopHistory() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState(null);
  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setScans(null);
    setError(null);

    const params = filter
      ? { status: filter, limit: 100 }
      : { limit: 100 };

    api
      .listScans(params)
      .then(setScans)
      .catch((e) => setError(e.message));
  }, [filter]);

  const filteredScans =
    scans?.filter((scan) =>
      scan.image_filename
        ?.toLowerCase()
        .includes(search.toLowerCase())
    ) ?? null;

  const totalScans = scans?.length ?? 0;

  const compliantCount =
    scans?.filter(
      (s) => s.compliance_status === "COMPLIANT"
    ).length ?? 0;

  const attentionCount =
    scans?.filter(
      (s) =>
        s.compliance_status === "NON_COMPLIANT" ||
        s.compliance_status === "SUSPICIOUS" ||
        s.compliance_status === "NEEDS_REVIEW"
    ).length ?? 0;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">

      {/* =====================================================
          SUBTLE INDIA BACKGROUND
      ====================================================== */}

      <div
        className="
          absolute
          top-0
          right-0
          w-[520px]
          h-[450px]
          pointer-events-none
          opacity-[0.035]
        "
      >
        <img
          src="/image.png"
          alt=""
          className="w-full h-full object-cover object-right"
        />
      </div>


      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <div
        className="
          relative
          max-w-[1100px]
          mx-auto
          px-5
          sm:px-8
          lg:px-10
          pt-7
          pb-12
        "
      >

        {/* ===================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-[#737783]
            hover:text-[#4338ca]
            transition-colors
            mb-6
          "
        >
          <IconArrowLeft size={15} />
          Back to dashboard
        </button>


        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-4
            mb-7
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
              <IconHistory size={12} />
              VERIFICATION HISTORY
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
              Scan history
            </h1>

            <p
              className="
                text-sm
                text-[#737783]
                mt-2
              "
            >
              Review previously scanned products and their
              compliance results.
            </p>

          </div>


          {/* Scan new label */}

          <button
            type="button"
            onClick={() => navigate("/shop/scan")}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              h-10
              px-4
              rounded-xl
              bg-[#4338ca]
              text-white
              text-m
              font-semibold
              shadow-[0_6px_16px_rgba(67,56,202,0.18)]
              hover:bg-[#3730a3]
              transition-all
              flex-shrink-0
            "
          >
            <IconSparkles size={15} />
            Scan new label
          </button>

        </div>


        {/* ===================================================
            SUMMARY METRICS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-3
            mb-6
          "
        >

          <SummaryCard
            label="Total scans"
            value={scans ? totalScans : "—"}
            icon={IconHistory}
          />

          <SummaryCard
            label="Compliant"
            value={scans ? compliantCount : "—"}
            icon={IconCircleCheck}
            positive
          />

          <SummaryCard
            label="Needs attention"
            value={scans ? attentionCount : "—"}
            icon={IconAlertTriangle}
            warning
          />

        </div>


        {/* ===================================================
            HISTORY CARD
        ==================================================== */}

        <div
          className="
            bg-white
            border
            border-[#e7e8ed]
            rounded-2xl
            shadow-[0_6px_24px_rgba(20,22,26,0.035)]
            overflow-hidden
          "
        >

          {/* =================================================
              CARD HEADER
          ================================================== */}

          <div
            className="
              px-5
              sm:px-6
              pt-5
              pb-4
              border-b
              border-[#eeeeF1]
            "
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-4
              "
            >

              <div>

                <h2 className="text-xl font-semibold text-text-primary">
                  Previous scans
                </h2>

                <p className="text-sm text-text-secondary mt-1">
                  Select a scan to view its complete verification result.
                </p>

              </div>


              {/* Search */}

              <div className="relative w-full lg:w-[250px]">

                <IconSearch
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[#9a9da6]
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scans..."
                  className="
                    w-full
                    h-9
                    pl-9
                    pr-3
                    rounded-lg
                    border
                    border-[#dedfe5]
                    bg-[#fafafa]
                    text-xs
                    text-[#292b34]
                    placeholder:text-[#a0a3ac]
                    outline-none
                    focus:border-[#4338ca]
                    focus:ring-2
                    focus:ring-[#4338ca]/10
                    transition-all
                  "
                />

              </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-2
                overflow-x-auto
                pt-4
                pb-1
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-lg
                  bg-[#f4f4f6]
                  text-[#858995]
                  flex-shrink-0
                "
              >
                <IconFilter size={14} />
              </div>

              {FILTERS.map((f) => {
                const active = filter === f.key;

                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`
                      h-7
                      px-3
                      rounded-lg
                      text-[10px]
                      font-semibold
                      whitespace-nowrap
                      border
                      transition-all
                      ${
                        active
                          ? "bg-[#4338ca] text-white border-[#4338ca] shadow-sm"
                          : "bg-white text-[#737783] border-[#dedfe5] hover:border-[#b9b9c2] hover:text-[#4338ca]"
                      }
                    `}
                  >
                    {f.label}
                  </button>
                );
              })}

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="px-5 sm:px-6 py-4">

              <div
                className="
                  rounded-xl
                  border
                  border-[#f1cccc]
                  bg-[#fff5f5]
                  px-4
                  py-3
                  text-xs
                  text-[#b91c1c]
                "
              >
                {error}
              </div>

            </div>
          )}


          {/* =================================================
              LOADING
          ================================================== */}

          {!scans && !error && (
            <div className="px-5 sm:px-6 py-12 text-center">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[#eeefff]
                  text-[#4338ca]
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-3
                  animate-pulse
                "
              >
                <IconHistory size={19} />
              </div>

              <p className="text-xs text-[#737783]">
                Loading scan history…
              </p>

            </div>
          )}


          {/* =================================================
              EMPTY
          ================================================== */}

          {scans && filteredScans.length === 0 && (
            <div className="px-5 sm:px-6 py-14 text-center">

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-[#f4f4f6]
                  text-[#8b8e98]
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-4
                "
              >
                <IconHistory size={22} />
              </div>

              <h3 className="text-sm font-semibold text-[#363842]">
                No scans found
              </h3>

              <p className="text-[11px] text-[#858995] mt-1.5">
                {search
                  ? "Try a different search term."
                  : "No scans match this filter."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => navigate("/shop/scan")}
                  className="
                    mt-4
                    text-[11px]
                    font-semibold
                    text-[#4338ca]
                    hover:text-[#3026a3]
                  "
                >
                  Scan your first product →
                </button>
              )}

            </div>
          )}


          {/* =================================================
              SCAN LIST
          ================================================== */}

          {filteredScans && filteredScans.length > 0 && (
            <div>

              {filteredScans.map((scan, index) => {
                const meta =
                  STATUS_ICON[scan.compliance_status] ||
                  STATUS_ICON.COMPLIANT;

                const Icon = meta.icon;

                return (
                  <button
                    key={scan.id}
                    type="button"
                    onClick={() =>
                      navigate(`/shop/result/${scan.id}`)
                    }
                    className="
                      w-full
                      text-left
                      flex
                      items-center
                      gap-3
                      px-5
                      sm:px-6
                      py-4
                      border-b
                      border-[#f0f0f2]
                      last:border-b-0
                      hover:bg-[#fafaff]
                      transition-colors
                      group
                    "
                  >

                    {/* Status icon */}

                    <div
                      className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        ${meta.bg}
                        ${meta.text}
                      `}
                    >
                      <Icon size={19} />
                    </div>


                    {/* Main information */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <p
                          className="
                            text-xs
                            font-semibold
                            text-[#292b34]
                            truncate
                          "
                        >
                          {scan.image_filename || "Product label"}
                        </p>

                        <span
                          className={`
                            w-1.5
                            h-1.5
                            rounded-full
                            flex-shrink-0
                            ${meta.dot}
                          `}
                        />

                      </div>

                      <p
                        className="
                          text-[10px]
                          text-[#858995]
                          mt-1
                        "
                      >
                        {statusLabel(scan.compliance_status)}
                        {" · "}
                        {timeAgo(scan.created_at)}
                      </p>

                    </div>


                    {/* Status */}

                    <div className="hidden sm:block flex-shrink-0">

                      <span
                        className={`
                          inline-flex
                          items-center
                          px-2.5
                          py-1.5
                          rounded-lg
                          text-[10px]
                          font-semibold
                          ${meta.bg}
                          ${meta.text}
                        `}
                      >
                        {statusLabel(scan.compliance_status)}
                      </span>

                    </div>


                    {/* Arrow */}

                    <IconChevronRight
                      size={16}
                      className="
                        text-[#b0b2ba]
                        group-hover:text-[#4338ca]
                        group-hover:translate-x-0.5
                        transition-all
                        flex-shrink-0
                      "
                    />

                  </button>
                );
              })}

            </div>
          )}

        </div>


        {/* ===================================================
            FOOTER NOTE
        ==================================================== */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            mt-5
            text-[10px]
            text-[#9a9da6]
          "
        >

          <IconShieldCheck size={13} />

          Your scan history is securely associated with your account.

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  label,
  value,
  icon: Icon,
  positive,
  warning,
}) {
  return (
    <div
      className="
        bg-white
        border
        border-[#e7e8ed]
        rounded-2xl
        px-4
        py-4
        shadow-[0_4px_18px_rgba(20,22,26,0.025)]
      "
    >

      <div className="flex items-center justify-between">

        <div>

          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.06em]
              font-semibold
              text-[#9296a0]
            "
          >
            {label}
          </p>

          <p
            className={`
              text-[22px]
              font-semibold
              tracking-tight
              mt-1
              ${
                positive
                  ? "text-[#2f8a42]"
                  : warning
                  ? "text-[#b87916]"
                  : "text-[#20222a]"
              }
            `}
          >
            {value}
          </p>

        </div>


        <div
          className={`
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            ${
              positive
                ? "bg-[#eef8f0] text-[#2f8a42]"
                : warning
                ? "bg-[#fff7e9] text-[#a46b12]"
                : "bg-[#eeefff] text-[#4338ca]"
            }
          `}
        >
          <Icon size={18} />
        </div>

      </div>

    </div>
  );
}