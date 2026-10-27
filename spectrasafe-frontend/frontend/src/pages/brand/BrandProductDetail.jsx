// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { IconStack } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card, { CardTitle, CardSub } from "../../components/Card";
// import Pill from "../../components/Pill";
// import SectionLabel from "../../components/SectionLabel";
// import ListItem from "../../components/ListItem";
// import { ButtonPrimary, ButtonOutline } from "../../components/Button";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";

// const inputClass =
//   "w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent";

// function KeyValueRow({ label, value }) {
//   if (!value) return null;
//   return (
//     <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
//       <span className="text-text-secondary">{label}</span>
//       <span className="text-text-primary font-medium text-right ml-4">{value}</span>
//     </div>
//   );
// }

// export default function BrandProductDetail() {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [batches, setBatches] = useState(null);
//   const [error, setError] = useState(null);

//   const [batchFormOpen, setBatchFormOpen] = useState(false);
//   const [batchNumber, setBatchNumber] = useState("");
//   const [mfgDate, setMfgDate] = useState("");
//   const [bestBefore, setBestBefore] = useState("");
//   const [batchSubmitting, setBatchSubmitting] = useState(false);
//   const [batchError, setBatchError] = useState(null);

//   function reloadBatches() {
//     api.listBatches(productId).then(setBatches).catch((e) => setError(e.message));
//   }

//   useEffect(() => {
//     api.getProduct(productId).then(setProduct).catch((e) => setError(e.message));
//     reloadBatches();
//   }, [productId]);

//   async function submitBatch() {
//     if (!batchNumber.trim()) return;
//     setBatchSubmitting(true);
//     setBatchError(null);
//     try {
//       await api.createBatch(productId, {
//         batch_number: batchNumber.trim(),
//         manufacturing_date: mfgDate || null,
//         best_before_date: bestBefore || null,
//       });
//       setBatchNumber("");
//       setMfgDate("");
//       setBestBefore("");
//       setBatchFormOpen(false);
//       reloadBatches();
//     } catch (err) {
//       setBatchError(err.message);
//     } finally {
//       setBatchSubmitting(false);
//     }
//   }

//   if (error) {
//     return (
//       <>
//         <TopBar title="Product" onBack={() => navigate("/brand/products")} />
//         <ScreenContent>
//           <p className="text-xs text-fail-text">{error}</p>
//         </ScreenContent>
//       </>
//     );
//   }
//   if (!product) {
//     return (
//       <>
//         <TopBar title="Product" onBack={() => navigate("/brand/products")} />
//         <ScreenContent>
//           <p className="text-xs text-text-secondary">Loading…</p>
//         </ScreenContent>
//       </>
//     );
//   }

//   return (
//     <>
//       <TopBar title={product.product_name} onBack={() => navigate("/brand/products")} />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center justify-between mb-1">
//             <CardTitle className="text-[15px]">{product.product_name}</CardTitle>
//             {product.veg_status && (
//               <Pill variant={product.veg_status === "VEG" ? "pass" : "warn"}>
//                 {product.veg_status === "VEG" ? "Veg" : "Non-veg"}
//               </Pill>
//             )}
//           </div>
//           <CardSub>{product.brand_name}</CardSub>
//         </Card>

//         <Card>
//           <KeyValueRow label="FSSAI license" value={product.fssai_license} />
//           <KeyValueRow label="Manufacturer" value={product.manufacturer_name} />
//           <KeyValueRow label="Net quantity" value={product.net_quantity} />
//           <KeyValueRow label="MRP" value={product.mrp} />
//         </Card>

//         {product.ingredients_raw && (
//           <Card>
//             <CardTitle>Ingredients</CardTitle>
//             <p className="text-[13px] text-text-secondary">{product.ingredients_raw}</p>
//           </Card>
//         )}

//         {product.allergens?.length > 0 && (
//           <Card>
//             <CardTitle>Allergens</CardTitle>
//             <p className="text-[13px] text-text-secondary">{product.allergens.join(", ")}</p>
//           </Card>
//         )}

//         {product.nutrition && Object.keys(product.nutrition).length > 0 && (
//           <Card>
//             <CardTitle className="mb-2">Nutrition (as registered)</CardTitle>
//             {Object.entries(product.nutrition).map(([k, v]) => (
//               <KeyValueRow key={k} label={k} value={v} />
//             ))}
//           </Card>
//         )}

//         <SectionLabel>Batches</SectionLabel>
//         {batches && batches.length === 0 && !batchFormOpen && (
//           <p className="text-xs text-text-secondary mb-2">No batches registered yet.</p>
//         )}
//         {batches && batches.length > 0 && (
//           <Card>
//             {batches.map((b) => (
//               <ListItem
//                 key={b.id}
//                 icon={<IconStack size={16} />}
//                 iconColor="purple"
//                 title={b.batch_number}
//                 sub={
//                   b.manufacturing_date
//                     ? `Mfg ${b.manufacturing_date}${b.best_before_date ? ` · BB ${b.best_before_date}` : ""}`
//                     : `Registered ${timeAgo(b.created_at)}`
//                 }
//               />
//             ))}
//           </Card>
//         )}

//         {!batchFormOpen && <ButtonOutline onClick={() => setBatchFormOpen(true)}>Register a batch</ButtonOutline>}

//         {batchFormOpen && (
//           <Card>
//             <CardTitle className="mb-2">New batch</CardTitle>
//             <input
//               value={batchNumber}
//               onChange={(e) => setBatchNumber(e.target.value)}
//               placeholder="Batch number"
//               className={inputClass}
//             />
//             <label className="text-[11px] text-text-secondary block mb-1">Manufacturing date</label>
//             <input type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} className={inputClass} />
//             <label className="text-[11px] text-text-secondary block mb-1">Best before date</label>
//             <input type="date" value={bestBefore} onChange={(e) => setBestBefore(e.target.value)} className={inputClass} />
//             {batchError && <p className="text-xs text-fail-text mb-2">{batchError}</p>}
//             <ButtonPrimary onClick={submitBatch} disabled={batchSubmitting || !batchNumber.trim()}>
//               {batchSubmitting ? "Saving…" : "Save batch"}
//             </ButtonPrimary>
//             <ButtonOutline onClick={() => setBatchFormOpen(false)} disabled={batchSubmitting}>
//               Cancel
//             </ButtonOutline>
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }





















// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { IconStack } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card, { CardTitle, CardSub } from "../../components/Card";
// import Pill from "../../components/Pill";
// import SectionLabel from "../../components/SectionLabel";
// import ListItem from "../../components/ListItem";
// import { ButtonPrimary, ButtonOutline } from "../../components/Button";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";

// const inputClass =
//   "w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent";

// function KeyValueRow({ label, value }) {
//   if (!value) return null;
//   return (
//     <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
//       <span className="text-text-secondary">{label}</span>
//       <span className="text-text-primary font-medium text-right ml-4">{value}</span>
//     </div>
//   );
// }

// export default function BrandProductDetail() {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [batches, setBatches] = useState(null);
//   const [error, setError] = useState(null);

//   const [batchFormOpen, setBatchFormOpen] = useState(false);
//   const [batchNumber, setBatchNumber] = useState("");
//   const [mfgDate, setMfgDate] = useState("");
//   const [bestBefore, setBestBefore] = useState("");
//   const [batchSubmitting, setBatchSubmitting] = useState(false);
//   const [batchError, setBatchError] = useState(null);

//   function reloadBatches() {
//     api.listBatches(productId).then(setBatches).catch((e) => setError(e.message));
//   }

//   useEffect(() => {
//     api.getProduct(productId).then(setProduct).catch((e) => setError(e.message));
//     reloadBatches();
//   }, [productId]);

//   async function submitBatch() {
//     if (!batchNumber.trim()) return;
//     setBatchSubmitting(true);
//     setBatchError(null);
//     try {
//       await api.createBatch(productId, {
//         batch_number: batchNumber.trim(),
//         manufacturing_date: mfgDate || null,
//         best_before_date: bestBefore || null,
//       });
//       setBatchNumber("");
//       setMfgDate("");
//       setBestBefore("");
//       setBatchFormOpen(false);
//       reloadBatches();
//     } catch (err) {
//       setBatchError(err.message);
//     } finally {
//       setBatchSubmitting(false);
//     }
//   }

//   if (error) {
//     return (
//       <>
//         <TopBar title="Product" onBack={() => navigate("/brand/products")} />
//         <ScreenContent>
//           <p className="text-xs text-fail-text">{error}</p>
//         </ScreenContent>
//       </>
//     );
//   }
//   if (!product) {
//     return (
//       <>
//         <TopBar title="Product" onBack={() => navigate("/brand/products")} />
//         <ScreenContent>
//           <p className="text-xs text-text-secondary">Loading…</p>
//         </ScreenContent>
//       </>
//     );
//   }

//   return (
//     <>
//       <TopBar title={product.product_name} onBack={() => navigate("/brand/products")} />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center justify-between mb-1">
//             <CardTitle className="text-[15px]">{product.product_name}</CardTitle>
//             {product.veg_status && (
//               <Pill variant={product.veg_status === "VEG" ? "pass" : "warn"}>
//                 {product.veg_status === "VEG" ? "Veg" : "Non-veg"}
//               </Pill>
//             )}
//           </div>
//           <CardSub>{product.brand_name}</CardSub>
//         </Card>

//         <Card>
//           <KeyValueRow label="FSSAI license" value={product.fssai_license} />
//           <KeyValueRow label="Manufacturer" value={product.manufacturer_name} />
//           <KeyValueRow label="Net quantity" value={product.net_quantity} />
//           <KeyValueRow label="MRP" value={product.mrp} />
//         </Card>

//         {product.ingredients_raw && (
//           <Card>
//             <CardTitle>Ingredients</CardTitle>
//             <p className="text-[13px] text-text-secondary">{product.ingredients_raw}</p>
//           </Card>
//         )}

//         {product.allergens?.length > 0 && (
//           <Card>
//             <CardTitle>Allergens</CardTitle>
//             <p className="text-[13px] text-text-secondary">{product.allergens.join(", ")}</p>
//           </Card>
//         )}

//         {product.nutrition && Object.keys(product.nutrition).length > 0 && (
//           <Card>
//             <CardTitle className="mb-2">Nutrition (as registered)</CardTitle>
//             {Object.entries(product.nutrition).map(([k, v]) => (
//               <KeyValueRow key={k} label={k} value={v} />
//             ))}
//           </Card>
//         )}

//         <SectionLabel>Batches</SectionLabel>
//         {batches && batches.length === 0 && !batchFormOpen && (
//           <p className="text-xs text-text-secondary mb-2">No batches registered yet.</p>
//         )}
//         {batches && batches.length > 0 && (
//           <Card>
//             {batches.map((b) => (
//               <ListItem
//                 key={b.id}
//                 icon={<IconStack size={16} />}
//                 iconColor="purple"
//                 title={b.batch_number}
//                 sub={
//                   b.manufacturing_date
//                     ? `Mfg ${b.manufacturing_date}${b.best_before_date ? ` · BB ${b.best_before_date}` : ""}`
//                     : `Registered ${timeAgo(b.created_at)}`
//                 }
//               />
//             ))}
//           </Card>
//         )}

//         {!batchFormOpen && <ButtonOutline onClick={() => setBatchFormOpen(true)}>Register a batch</ButtonOutline>}

//         {batchFormOpen && (
//           <Card>
//             <CardTitle className="mb-2">New batch</CardTitle>
//             <input
//               value={batchNumber}
//               onChange={(e) => setBatchNumber(e.target.value)}
//               placeholder="Batch number"
//               className={inputClass}
//             />
//             <label className="text-[11px] text-text-secondary block mb-1">Manufacturing date</label>
//             <input type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} className={inputClass} />
//             <label className="text-[11px] text-text-secondary block mb-1">Best before date</label>
//             <input type="date" value={bestBefore} onChange={(e) => setBestBefore(e.target.value)} className={inputClass} />
//             {batchError && <p className="text-xs text-fail-text mb-2">{batchError}</p>}
//             <ButtonPrimary onClick={submitBatch} disabled={batchSubmitting || !batchNumber.trim()}>
//               {batchSubmitting ? "Saving…" : "Save batch"}
//             </ButtonPrimary>
//             <ButtonOutline onClick={() => setBatchFormOpen(false)} disabled={batchSubmitting}>
//               Cancel
//             </ButtonOutline>
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }


















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
      (product) => product.verification_status === "VERIFIED"
    ).length ?? 0;

  const pendingProducts =
    products?.filter(
      (product) =>
        !product.verification_status ||
        product.verification_status === "PENDING"
    ).length ?? 0;

  return (
    <div className="min-h-full bg-[#F5F2EA]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 py-8">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6F756E]">
                Product portfolio
              </span>
            </div>

            <h1 className="text-[30px] sm:text-[34px] font-bold tracking-[-0.025em] text-[#1F2521]">
              My products
            </h1>

            <p className="mt-2 text-[13px] sm:text-sm text-[#6F756E] max-w-[520px]">
              Manage your registered food products and their verification
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/brand/products/new")}
            className="
              inline-flex items-center justify-center gap-2
              h-11 px-5
              rounded-xl
              bg-[#1F7A4D]
              text-white
              text-sm font-semibold
              shadow-[0_3px_8px_rgba(31,122,77,0.20)]
              hover:bg-[#17643E]
              hover:-translate-y-[1px]
              transition-all
              flex-shrink-0
            "
          >
            <IconPlus size={17} stroke={2.2} />
            Register product
          </button>

        </div>


        {/* =========================================================
            SUMMARY
        ========================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <SummaryCard
            icon={IconPackage}
            value={products ? totalProducts : "—"}
            label="Total products"
            description="Registered in your portfolio"
          />

          <SummaryCard
            icon={IconShieldCheck}
            value={products ? verifiedProducts : "—"}
            label="Verified products"
            description="FSSAI verification status"
            tone="green"
          />

          <SummaryCard
            icon={IconClock}
            value={products ? pendingProducts : "—"}
            label="Pending review"
            description="Awaiting verification"
            tone="amber"
          />

        </div>


        {/* =========================================================
            ERROR
        ========================================================= */}

        {error && (
          <div
            className="
              mb-6
              rounded-xl
              border border-[#E6B8B5]
              bg-[#FFF1F0]
              px-5 py-4
            "
          >
            <p className="text-sm font-semibold text-[#B42318]">
              Unable to load products
            </p>

            <p className="text-xs text-[#B42318]/80 mt-1">
              {error}
            </p>
          </div>
        )}


        {/* =========================================================
            LOADING
        ========================================================= */}

        {!products && !error && (
          <div
            className="
              bg-white
              border border-[#D8D4CA]
              rounded-2xl
              px-6 py-16
              text-center
              shadow-[0_2px_8px_rgba(35,32,25,0.05)]
            "
          >
            <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] mx-auto flex items-center justify-center mb-3">
              <IconPackage
                size={21}
                className="text-[#1F7A4D]"
              />
            </div>

            <p className="text-sm font-semibold text-[#252A27]">
              Loading your products…
            </p>

            <p className="text-xs text-[#858A84] mt-1">
              Please wait while your portfolio is loaded.
            </p>
          </div>
        )}


        {/* =========================================================
            EMPTY STATE
        ========================================================= */}

        {products && products.length === 0 && (
          <div
            className="
              bg-white
              border border-[#D8D4CA]
              rounded-2xl
              px-6 py-16
              text-center
              shadow-[0_2px_8px_rgba(35,32,25,0.05)]
            "
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EAF4EE] mx-auto flex items-center justify-center mb-4">
              <IconPackage
                size={25}
                className="text-[#1F7A4D]"
              />
            </div>

            <h2 className="text-base font-semibold text-[#242925]">
              No products registered yet
            </h2>

            <p className="text-sm text-[#777C76] mt-1.5 max-w-[380px] mx-auto">
              Register your first food product to start building your
              SpectraSafe portfolio.
            </p>

            <button
              type="button"
              onClick={() => navigate("/brand/products/new")}
              className="
                mt-6
                inline-flex items-center gap-2
                h-10 px-4
                rounded-lg
                bg-[#1F7A4D]
                text-white
                text-xs font-semibold
                hover:bg-[#17643E]
                transition-colors
              "
            >
              <IconPlus size={15} />
              Register your first product
            </button>
          </div>
        )}


        {/* =========================================================
            PRODUCT LIST
        ========================================================= */}

        {products && products.length > 0 && (
          <div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[17px] font-semibold text-[#252A27]">
                  Registered products
                </h2>

                <p className="text-xs text-[#858A84] mt-1">
                  Products currently associated with your account
                </p>
              </div>

              <span
                className="
                  hidden sm:inline-flex
                  items-center
                  px-3 py-1.5
                  rounded-full
                  bg-white
                  border border-[#D8D4CA]
                  text-[11px]
                  font-semibold
                  text-[#5F665F]
                "
              >
                {totalProducts}{" "}
                {totalProducts === 1 ? "product" : "products"}
              </span>
            </div>


            <div className="space-y-3">

              {products.map((product) => {

                const status =
                  product.verification_status || "PENDING";

                const isVerified = status === "VERIFIED";

                const statusLabel = isVerified
                  ? "FSSAI verified"
                  : status === "REJECTED"
                  ? "Verification rejected"
                  : "Pending FSSAI review";

                const statusStyle = isVerified
                  ? {
                      wrapper: "bg-[#EAF6EE] border-[#CBE7D5]",
                      icon: "bg-[#D8EFDF] text-[#1F7A4D]",
                      text: "text-[#17643E]",
                    }
                  : status === "REJECTED"
                  ? {
                      wrapper: "bg-[#FFF1F0] border-[#F1CECB]",
                      icon: "bg-[#FBE1DF] text-[#B42318]",
                      text: "text-[#B42318]",
                    }
                  : {
                      wrapper: "bg-[#FFF8E8] border-[#F0DEB0]",
                      icon: "bg-[#FFF0C9] text-[#A56A00]",
                      text: "text-[#9A6200]",
                    };

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
                      bg-white
                      border border-[#D8D4CA]
                      rounded-2xl
                      px-5 py-5
                      shadow-[0_2px_8px_rgba(35,32,25,0.045)]
                      hover:border-[#AEB8B0]
                      hover:shadow-[0_5px_18px_rgba(35,32,25,0.08)]
                      hover:-translate-y-[1px]
                      transition-all duration-150
                    "
                  >

                    <div className="flex items-center gap-4">

                      {/* PRODUCT ICON */}

                      <div
                        className="
                          w-12 h-12
                          rounded-xl
                          bg-[#EAF4EE]
                          flex items-center justify-center
                          flex-shrink-0
                        "
                      >
                        <IconPackage
                          size={22}
                          stroke={1.8}
                          className="text-[#1F7A4D]"
                        />
                      </div>


                      {/* PRODUCT INFORMATION */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                          <h3 className="text-[15px] font-semibold text-[#202522] truncate">
                            {product.product_name}
                          </h3>

                          <span
                            className={`
                              inline-flex
                              w-fit
                              items-center
                              px-2.5 py-1
                              rounded-full
                              border
                              text-[10px]
                              font-semibold
                              whitespace-nowrap
                              ${statusStyle.wrapper}
                              ${statusStyle.text}
                            `}
                          >
                            {statusLabel}
                          </span>

                        </div>


                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">

                          {product.manufacturer_name && (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs text-[#6F756E]">
                                <IconBuildingFactory size={13} />
                                {product.manufacturer_name}
                              </span>

                              <span className="text-[#C3C0B8]">
                                ·
                              </span>
                            </>
                          )}

                          {product.fssai_license && (
                            <>
                              <span className="text-xs text-[#6F756E]">
                                FSSAI {product.fssai_license}
                              </span>

                              <span className="text-[#C3C0B8]">
                                ·
                              </span>
                            </>
                          )}

                          <span className="inline-flex items-center gap-1 text-xs text-[#8A8E88]">
                            <IconClock size={12} />
                            {timeAgo(product.created_at)}
                          </span>

                        </div>

                      </div>


                      {/* RIGHT STATUS ICON */}

                      <div className="flex items-center gap-3 flex-shrink-0">

                        <div
                          className={`
                            hidden sm:flex
                            w-9 h-9
                            rounded-lg
                            items-center justify-center
                            ${statusStyle.icon}
                          `}
                        >
                          {isVerified ? (
                            <IconShieldCheck size={18} />
                          ) : (
                            <IconClock size={17} />
                          )}
                        </div>

                        <IconChevronRight
                          size={19}
                          className="
                            text-[#A6AAA5]
                            group-hover:text-[#1F7A4D]
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


        {/* =========================================================
            FOOTER NOTE
        ========================================================= */}

        {products && products.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-7">
            <IconShieldCheck
              size={14}
              className="text-[#8A908A]"
            />

            <p className="text-[11px] text-[#858A84]">
              Product information is securely associated with your account.
            </p>
          </div>
        )}

      </div>
    </div>
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
    tone === "green"
      ? {
          iconBg: "bg-[#EAF4EE]",
          iconColor: "text-[#1F7A4D]",
          value: "text-[#17643E]",
        }
      : tone === "amber"
      ? {
          iconBg: "bg-[#FFF6DF]",
          iconColor: "text-[#A56A00]",
          value: "text-[#8D5C00]",
        }
      : {
          iconBg: "bg-[#F0EEE8]",
          iconColor: "text-[#555C56]",
          value: "text-[#252A27]",
        };

  return (
    <div
      className="
        bg-white
        border border-[#D8D4CA]
        rounded-2xl
        p-5
        shadow-[0_2px_8px_rgba(35,32,25,0.045)]
      "
    >
      <div className="flex items-start justify-between">

        <div
          className={`
            w-10 h-10
            rounded-xl
            flex items-center justify-center
            ${styles.iconBg}
            ${styles.iconColor}
          `}
        >
          <Icon size={19} stroke={1.8} />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#A0A49F]">
          Portfolio
        </span>

      </div>

      <p
        className={`
          text-[27px]
          font-bold
          tracking-[-0.03em]
          mt-4
          ${styles.value}
        `}
      >
        {value}
      </p>

      <p className="text-sm font-semibold text-[#343A35] mt-0.5">
        {label}
      </p>

      <p className="text-[11px] text-[#858A84] mt-1">
        {description}
      </p>
    </div>
  );
}