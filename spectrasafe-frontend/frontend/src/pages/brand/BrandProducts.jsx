import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconPackage,
  IconPlus,
  IconChevronRight,
  IconShieldCheck,
  IconClock,
  IconBuildingFactory,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

export default function BrandProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  const totalProducts = products?.length ?? 0;

  const verifiedProducts =
    products?.filter(
      (p) => p.verification_status === "VERIFIED"
    ).length ?? 0;

  const pendingProducts =
    products?.filter(
      (p) =>
        !p.verification_status ||
        p.verification_status === "PENDING"
    ).length ?? 0;

  return (
    <>
      <TopBar title="My products" />

      <ScreenContent>
        <div className="max-w-[1100px] mx-auto">

          {/* ================= HEADER ================= */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-accent" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Product portfolio
                </span>
              </div>

              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.025em] text-text-primary">
                My products
              </h1>

              <p className="text-sm text-text-secondary mt-1.5">
                Manage your registered products and verification status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/brand/products/new")}
              className="
                inline-flex items-center justify-center gap-2
                h-10 px-4
                rounded-app-md
                bg-accent
                text-white
                text-xs font-semibold
                shadow-[0_2px_6px_rgba(31,109,71,0.22)]
                hover:bg-accent-hover
                hover:-translate-y-[1px]
                transition-all
                flex-shrink-0
              "
            >
              <IconPlus size={16} stroke={2.2} />
              Register product
            </button>
          </div>


          {/* ================= SUMMARY ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

            <SummaryCard
              icon={IconPackage}
              value={products ? totalProducts : "—"}
              label="Total products"
              description="Products registered"
            />

            <SummaryCard
              icon={IconShieldCheck}
              value={products ? verifiedProducts : "—"}
              label="Verified"
              description="FSSAI verified products"
              tone="pass"
            />

            <SummaryCard
              icon={IconClock}
              value={products ? pendingProducts : "—"}
              label="Pending review"
              description="Awaiting verification"
              tone="warn"
            />

          </div>


          {/* ================= ERROR ================= */}

          {error && (
            <div className="rounded-app-lg border border-fail-text/25 bg-fail-bg px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-fail-text">
                Unable to load products
              </p>

              <p className="text-[11px] text-fail-text/80 mt-1">
                {error}
              </p>
            </div>
          )}


          {/* ================= LOADING ================= */}

          {!products && !error && (
            <div className="bg-bg-primary border border-border-secondary rounded-app-lg px-6 py-14 text-center shadow-[var(--shadow-card)]">
              <div className="w-11 h-11 rounded-app-md bg-accent-bg text-accent-text flex items-center justify-center mx-auto mb-3">
                <IconPackage size={21} />
              </div>

              <p className="text-sm font-medium text-text-primary">
                Loading your products…
              </p>

              <p className="text-xs text-text-secondary mt-1">
                Fetching your registered product portfolio.
              </p>
            </div>
          )}


          {/* ================= EMPTY STATE ================= */}

          {products && products.length === 0 && (
            <div className="bg-bg-primary border border-border-secondary rounded-app-lg px-6 py-14 text-center shadow-[var(--shadow-card)]">

              <div className="w-14 h-14 rounded-app-lg bg-accent-bg text-accent-text flex items-center justify-center mx-auto mb-4">
                <IconPackage size={25} />
              </div>

              <h2 className="text-base font-semibold text-text-primary">
                No products registered yet
              </h2>

              <p className="text-xs text-text-secondary mt-1.5 max-w-[360px] mx-auto">
                Register your first product to start building your
                SpectraSafe product portfolio.
              </p>

              <button
                type="button"
                onClick={() => navigate("/brand/products/new")}
                className="
                  mt-5
                  inline-flex items-center gap-2
                  h-10 px-4
                  rounded-app-md
                  bg-accent
                  text-white
                  text-xs font-semibold
                  hover:bg-accent-hover
                  transition-colors
                "
              >
                <IconPlus size={15} />
                Register your first product
              </button>

            </div>
          )}


          {/* ================= PRODUCTS ================= */}

          {products && products.length > 0 && (
            <div>

              {/* Section heading */}

              <div className="flex items-end justify-between mb-3">

                <div>
                  <h2 className="text-[16px] font-semibold text-text-primary">
                    Registered products
                  </h2>

                  <p className="text-xs text-text-secondary mt-1">
                    Products currently associated with your account
                  </p>
                </div>

                <span className="
                  hidden sm:inline-flex
                  px-3 py-1.5
                  rounded-full
                  bg-bg-primary
                  border border-border-secondary
                  text-[10px]
                  font-semibold
                  text-text-secondary
                ">
                  {totalProducts}{" "}
                  {totalProducts === 1 ? "product" : "products"}
                </span>

              </div>


              {/* Product cards */}

              <div className="space-y-3">

                {products.map((product) => {

                  const status =
                    product.verification_status || "PENDING";

                  const isVerified = status === "VERIFIED";
                  const isRejected = status === "REJECTED";

                  const statusLabel = isVerified
                    ? "FSSAI verified"
                    : isRejected
                    ? "Verification rejected"
                    : "Pending review";

                  const statusClasses = isVerified
                    ? "bg-pass-bg text-pass-text border-pass-text/20"
                    : isRejected
                    ? "bg-fail-bg text-fail-text border-fail-text/20"
                    : "bg-warn-bg text-warn-text border-warn-text/20";

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        navigate(`/brand/products/${product.id}`)
                      }
                      className="
                        group
                        w-full
                        text-left
                        bg-bg-primary
                        border border-border-secondary
                        rounded-app-lg
                        px-5 py-4
                        shadow-[var(--shadow-card)]
                        hover:border-accent/50
                        hover:shadow-[var(--shadow-elevated)]
                        hover:-translate-y-[1px]
                        transition-all duration-150
                      "
                    >

                      <div className="flex items-center gap-4">

                        {/* Product icon */}

                        <div className="
                          w-12 h-12
                          rounded-app-md
                          bg-accent-bg
                          text-accent-text
                          flex items-center justify-center
                          flex-shrink-0
                        ">
                          <IconPackage
                            size={22}
                            stroke={1.8}
                          />
                        </div>


                        {/* Product details */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                            <h3 className="
                              text-[14px]
                              font-semibold
                              text-text-primary
                              truncate
                            ">
                              {product.product_name}
                            </h3>

                            <span
                              className={`
                                w-fit
                                inline-flex
                                items-center
                                px-2.5 py-1
                                rounded-full
                                border
                                text-[10px]
                                font-semibold
                                whitespace-nowrap
                                ${statusClasses}
                              `}
                            >
                              {statusLabel}
                            </span>

                          </div>


                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">

                            {product.brand_name && (
                              <>
                                <span className="text-xs text-text-secondary">
                                  {product.brand_name}
                                </span>

                                <span className="text-text-tertiary">
                                  ·
                                </span>
                              </>
                            )}

                            {product.manufacturer_name && (
                              <>
                                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                  <IconBuildingFactory size={12} />
                                  {product.manufacturer_name}
                                </span>

                                <span className="text-text-tertiary">
                                  ·
                                </span>
                              </>
                            )}

                            {product.fssai_license && (
                              <>
                                <span className="text-xs text-text-tertiary">
                                  FSSAI {product.fssai_license}
                                </span>

                                <span className="text-text-tertiary">
                                  ·
                                </span>
                              </>
                            )}

                            {product.created_at && (
                              <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                                <IconClock size={11} />
                                {timeAgo(product.created_at)}
                              </span>
                            )}

                          </div>

                        </div>


                        {/* Right side */}

                        <div className="flex items-center gap-3 flex-shrink-0">

                          <div className={`
                            hidden sm:flex
                            w-9 h-9
                            rounded-app-md
                            items-center justify-center
                            ${
                              isVerified
                                ? "bg-pass-bg text-pass-text"
                                : isRejected
                                ? "bg-fail-bg text-fail-text"
                                : "bg-warn-bg text-warn-text"
                            }
                          `}>
                            {isVerified ? (
                              <IconShieldCheck size={17} />
                            ) : (
                              <IconClock size={17} />
                            )}
                          </div>

                          <IconChevronRight
                            size={18}
                            className="
                              text-text-tertiary
                              group-hover:text-accent-text
                              group-hover:translate-x-0.5
                              transition-all
                            "
                          />

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>
            </div>
          )}


          {/* ================= FOOTER ================= */}

          {products && products.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-7">
              <IconShieldCheck
                size={14}
                className="text-text-tertiary"
              />

              <p className="text-[10px] text-text-tertiary">
                Product information is securely associated with your account.
              </p>
            </div>
          )}

        </div>
      </ScreenContent>
    </>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  value,
  label,
  description,
  tone = "neutral",
}) {
  const styles =
    tone === "pass"
      ? {
          icon: "bg-pass-bg text-pass-text",
          value: "text-pass-text",
        }
      : tone === "warn"
      ? {
          icon: "bg-warn-bg text-warn-text",
          value: "text-warn-text",
        }
      : {
          icon: "bg-bg-secondary text-text-secondary",
          value: "text-text-primary",
        };

  return (
    <div className="
      bg-bg-primary
      border border-border-secondary
      rounded-app-lg
      p-5
      shadow-[var(--shadow-card)]
    ">

      <div className="flex items-start justify-between">

        <div className={`
          w-10 h-10
          rounded-app-md
          flex items-center justify-center
          ${styles.icon}
        `}>
          <Icon size={19} stroke={1.8} />
        </div>

        <span className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-text-tertiary
        ">
          Portfolio
        </span>

      </div>

      <p className={`
        text-[26px]
        font-bold
        tracking-[-0.03em]
        mt-4
        ${styles.value}
      `}>
        {value}
      </p>

      <p className="text-sm font-semibold text-text-primary mt-0.5">
        {label}
      </p>

      <p className="text-[10px] text-text-tertiary mt-1">
        {description}
      </p>

    </div>
  );
}