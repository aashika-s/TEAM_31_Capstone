import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconBuildingFactory2,
  IconSearch,
  IconArrowRight,
  IconMapPin,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { api } from "../../lib/api";

export default function FSSAIManufacturers() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  const manufacturers = products
    ? Object.values(
        products.reduce((acc, p) => {
          if (!acc[p.manufacturer_name]) {
            acc[p.manufacturer_name] = {
              name: p.manufacturer_name,
              count: 0,
              products: [],
            };
          }

          acc[p.manufacturer_name].count += 1;
          acc[p.manufacturer_name].products.push(p);

          return acc;
        }, {})
      ).sort((a, b) => b.count - a.count)
    : null;

  return (
    <>

      <ScreenContent>
        <div className="max-w-[1100px] mx-auto">

          {/* =====================================================
              HEADER
          ===================================================== */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">

              <div>
                <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-text-primary leading-tight">
                  Manufacturers
                </h1>

                <p className="text-[11px] text-text-secondary mt-1">
                  View registered manufacturers in your jurisdiction and their products.
                </p>
              </div>

            </div>
          </div>

          {/* =====================================================
              SEARCH BAR
          ===================================================== */}
          <div className="relative mb-4">
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
              placeholder="Search manufacturers..."
              disabled
              className="
                w-full
                h-9
                pl-9
                pr-9
                rounded-[9px]
                bg-bg-primary
                border border-border-secondary
                text-[10px]
                text-text-primary
                placeholder:text-text-tertiary
                outline-none
                opacity-80
              "
            />

            <IconSearch
              size={13}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-text-tertiary
              "
            />
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
          {!manufacturers && !error && (
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                min-h-[260px]
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent-bg flex items-center justify-center mx-auto mb-3">
                  <IconBuildingFactory2
                    size={19}
                    className="text-accent"
                  />
                </div>

                <p className="text-[11px] font-medium text-text-primary">
                  Loading manufacturers...
                </p>

                <p className="text-[9px] text-text-tertiary mt-1">
                  Fetching the registered manufacturer registry.
                </p>
              </div>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}
          {manufacturers && manufacturers.length === 0 && (
            <div
              className="
                bg-bg-primary
                border border-border-secondary
                rounded-[12px]
                min-h-[280px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-6
                shadow-[0_6px_20px_rgba(40,38,80,0.04)]
              "
            >
              <div className="w-[52px] h-[52px] rounded-full bg-accent-bg text-accent flex items-center justify-center mb-4">
                <IconBuildingFactory2
                  size={24}
                  stroke={1.8}
                />
              </div>

              <h2 className="text-[13px] font-semibold text-text-primary">
                No manufacturers found
              </h2>

              <p className="text-[10px] text-text-secondary mt-1 max-w-[280px]">
                No products have been registered in the system yet.
              </p>
            </div>
          )}

          {/* =====================================================
              MANUFACTURER LIST
          ===================================================== */}
          {manufacturers && manufacturers.length > 0 && (
            <div className="space-y-2.5">

              {manufacturers.map((manufacturer) => (
                <button
                  key={manufacturer.name}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/fssai/manufacturers/${encodeURIComponent(
                        manufacturer.name
                      )}`
                    )
                  }
                  className="
                    w-full
                    flex
                    items-center
                    gap-4
                    text-left
                    bg-bg-primary
                    border border-border-secondary
                    rounded-[12px]
                    px-4
                    py-3.5
                    shadow-[0_5px_16px_rgba(40,38,80,0.035)]
                    hover:border-accent
                    hover:shadow-[0_7px_20px_rgba(40,38,80,0.06)]
                    hover:-translate-y-0.5
                    transition-all duration-150
                    group
                  "
                >

                  {/* ICON */}
                  <div
                    className="
                      w-10
                      h-10
                      rounded-[10px]
                      bg-accent-bg
                      text-accent
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      group-hover:bg-accent
                      group-hover:text-white
                      transition-colors
                    "
                  >
                    <IconBuildingFactory2
                      size={19}
                      stroke={1.8}
                    />
                  </div>

                  {/* INFORMATION */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">
                      <h2 className="text-[12px] font-semibold text-text-primary truncate">
                        {manufacturer.name}
                      </h2>
                    </div>

                    <p className="text-[9px] text-text-secondary mt-0.5">
                      {manufacturer.count}{" "}
                      product
                      {manufacturer.count === 1 ? "" : "s"} registered
                    </p>

                    <div className="flex items-center gap-1 mt-1.5">
                      <IconMapPin
                        size={10}
                        className="text-text-tertiary"
                      />

                      <span className="text-[8px] text-text-tertiary">
                        Registered manufacturer
                      </span>
                    </div>

                  </div>

                  {/* PRODUCT COUNT */}
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-[18px] font-semibold text-text-primary leading-none">
                      {manufacturer.count}
                    </span>

                    <span className="text-[8px] text-text-tertiary mt-1">
                      products
                    </span>
                  </div>

                  {/* ARROW */}
                  <div
                    className="
                      w-7
                      h-7
                      rounded-full
                      bg-bg-secondary
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      group-hover:bg-accent-bg
                      transition-colors
                    "
                  >
                    <IconArrowRight
                      size={14}
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

          {/* =====================================================
              FOOTER
          ===================================================== */}
          {manufacturers && manufacturers.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-6">
              <IconBuildingFactory2
                size={11}
                className="text-text-tertiary"
              />

              <p className="text-[9px] text-text-tertiary">
                Showing registered manufacturers and their associated products.
              </p>
            </div>
          )}

        </div>
      </ScreenContent>
    </>
  );
}