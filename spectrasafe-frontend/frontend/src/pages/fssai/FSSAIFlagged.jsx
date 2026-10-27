import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconFlag,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Pill from "../../components/Pill";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

const FILTERS = [
  { key: null, label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "UNDER_REVIEW", label: "Under review" },
  { key: "RESOLVED", label: "Resolved" },
];

const STATUS_PILL = {
  OPEN: "fail",
  UNDER_REVIEW: "warn",
  RESOLVED: "pass",
};

export default function FSSAIFlagged() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState(null);
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listFlags()
      .then(setFlags)
      .catch((e) => setError(e.message));
  }, []);

  const visible = flags
    ? filter
      ? flags.filter((f) => f.status === filter)
      : flags
    : null;

  return (
    <>

      <ScreenContent>
        <div className="max-w-[1100px] mx-auto">

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}
          <div className="mb-4">
            <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-text-primary leading-tight">
              Flagged products
            </h1>

            <p className="text-[11px] text-text-secondary mt-1">
              Products that may require regulatory attention based on compliance checks.
            </p>
          </div>

          {/* =====================================================
              FILTER / TOOLBAR
          ===================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">

            {/* FILTERS */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {FILTERS.map((f) => {
                const active = filter === f.key;

                const count =
                  flags && f.key
                    ? flags.filter((item) => item.status === f.key).length
                    : flags?.length;

                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      whitespace-nowrap
                      px-3
                      py-1.5
                      rounded-full
                      border
                      text-[10px]
                      font-medium
                      transition-all
                      duration-150
                      ${
                        active
                          ? "bg-accent text-white border-accent shadow-[0_2px_6px_rgba(31,109,71,0.15)]"
                          : "bg-bg-primary text-text-secondary border-border-secondary hover:border-accent hover:text-accent"
                      }
                    `}
                  >
                    {f.label}

                    {flags && (
                      <span
                        className={`
                          text-[9px]
                          ${
                            active
                              ? "text-white/75"
                              : "text-text-tertiary"
                          }
                        `}
                      >
                        {count ?? 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SEARCH / FILTER CONTROLS */}
            <div className="flex items-center gap-2">

              <div className="relative w-full sm:w-[230px]">
                <IconSearch
                  size={14}
                  stroke={1.8}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-text-tertiary
                    pointer-events-none
                  "
                />

                <input
                  type="text"
                  placeholder="Search products..."
                  disabled
                  className="
                    w-full
                    h-9
                    pl-9
                    pr-3
                    rounded-[9px]
                    bg-bg-primary
                    border
                    border-border-secondary
                    text-[10px]
                    text-text-primary
                    placeholder:text-text-tertiary
                    outline-none
                    opacity-80
                  "
                />
              </div>

              <button
                type="button"
                className="
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-bg-primary
                  border
                  border-border-secondary
                  text-text-secondary
                  hover:border-accent
                  hover:text-accent
                  transition-colors
                "
                title="Filter options"
              >
                <IconAdjustmentsHorizontal size={15} />
              </button>

            </div>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}
          {error && (
            <div className="bg-fail-bg border border-fail-text/20 rounded-[12px] px-4 py-3 mb-4">
              <p className="text-[10px] text-fail-text">
                {error}
              </p>
            </div>
          )}

          {/* =====================================================
              LOADING
          ===================================================== */}
          {!visible && !error && (
            <div
              className="
                bg-bg-primary
                border
                border-border-secondary
                rounded-[12px]
                min-h-[330px]
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent-bg flex items-center justify-center mx-auto mb-3">
                  <IconFlag
                    size={19}
                    className="text-accent"
                  />
                </div>

                <p className="text-[11px] font-medium text-text-primary">
                  Loading flagged products...
                </p>

                <p className="text-[9px] text-text-tertiary mt-1">
                  Fetching the latest compliance records.
                </p>
              </div>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}
          {visible && visible.length === 0 && (
            <div
              className="
                bg-bg-primary
                border
                border-border-secondary
                rounded-[12px]
                min-h-[350px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-6
                shadow-[0_6px_20px_rgba(40,38,80,0.04)]
              "
            >
              {/* ICON */}
              <div
                className="
                  w-[52px]
                  h-[52px]
                  rounded-full
                  bg-pass-bg
                  text-pass-text
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <IconFlag
                  size={24}
                  stroke={1.8}
                />
              </div>

              <h2 className="text-[13px] font-semibold text-text-primary">
                No flagged products found
              </h2>

              <p className="text-[10px] text-text-secondary mt-1 max-w-[260px]">
                No products match the selected filter.
              </p>

              <button
                type="button"
                onClick={() => setFilter(null)}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  mt-4
                  px-3.5
                  py-2
                  rounded-[8px]
                  bg-accent
                  text-white
                  text-[10px]
                  font-semibold
                  shadow-[0_3px_10px_rgba(31,109,71,0.16)]
                  hover:bg-accent-hover
                  transition-colors
                "
              >
                <IconRefresh size={13} />
                Clear filters
              </button>
            </div>
          )}

          {/* =====================================================
              FLAGGED PRODUCTS LIST
          ===================================================== */}
          {visible && visible.length > 0 && (
            <div
              className="
                bg-bg-primary
                border
                border-border-secondary
                rounded-[12px]
                overflow-hidden
                shadow-[0_6px_20px_rgba(40,38,80,0.04)]
              "
            >
              {/* TABLE HEADER */}
              <div className="hidden sm:grid grid-cols-[1fr_150px_110px_30px] gap-3 px-5 py-3 bg-bg-secondary border-b border-border-tertiary">
                <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-text-tertiary">
                  Product / issue
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-text-tertiary">
                  Date
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-text-tertiary">
                  Status
                </p>

                <span />
              </div>

              {visible.map((f, index) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    navigate(`/fssai/flagged/${f.id}`)
                  }
                  className={`
                    w-full
                    flex
                    sm:grid
                    sm:grid-cols-[1fr_150px_110px_30px]
                    gap-3
                    items-center
                    px-4
                    sm:px-5
                    py-3.5
                    text-left
                    hover:bg-bg-secondary
                    transition-colors
                    group
                    ${
                      index !== visible.length - 1
                        ? "border-b border-border-tertiary"
                        : ""
                    }
                  `}
                >
                  {/* ISSUE */}
                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-9 h-9 rounded-[9px] bg-fail-bg text-fail-text flex items-center justify-center flex-shrink-0">
                      <IconFlag
                        size={16}
                        stroke={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-text-primary truncate">
                        {f.reason || "Compliance flag"}
                      </p>

                      <p className="text-[9px] text-text-tertiary mt-0.5 truncate">
                        Flagged product
                      </p>
                    </div>
                  </div>

                  {/* DATE */}
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-text-secondary">
                      {timeAgo(f.created_at)}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>
                    <Pill variant={STATUS_PILL[f.status]}>
                      {f.status}
                    </Pill>
                  </div>

                  {/* ARROW */}
                  <div className="flex justify-end">
                    <IconArrowRight
                      size={15}
                      className="
                        text-text-tertiary
                        group-hover:text-accent
                        group-hover:translate-x-0.5
                        transition-all
                      "
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-center gap-2 py-6">
            <IconFlag
              size={11}
              className="text-text-tertiary"
            />

            <p className="text-[9px] text-text-tertiary">
              Flagged products are reviewed based on compliance status.
            </p>
          </div>

        </div>
      </ScreenContent>
    </>
  );
}