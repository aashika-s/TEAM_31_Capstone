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
import { useNavigate, useParams } from "react-router-dom";
import {
  IconStack,
  IconPackage,
  IconCalendar,
  IconShieldCheck,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle, CardSub } from "../../components/Card";
import Pill from "../../components/Pill";
import SectionLabel from "../../components/SectionLabel";
import ListItem from "../../components/ListItem";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";

import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

const inputClass =
  "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md " +
  "text-[13px] bg-bg-primary text-text-primary outline-none " +
  "focus:border-accent focus:ring-2 focus:ring-accent/10 transition";

function KeyValueRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-border-tertiary last:border-b-0">
      <span className="text-[12px] text-text-secondary">
        {label}
      </span>

      <span className="text-[13px] text-text-primary font-medium text-right">
        {value}
      </span>
    </div>
  );
}

export default function BrandProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState(null);
  const [error, setError] = useState(null);

  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [bestBefore, setBestBefore] = useState("");
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchError, setBatchError] = useState(null);

  function reloadBatches() {
    api
      .listBatches(productId)
      .then(setBatches)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    setError(null);
    setProduct(null);
    setBatches(null);

    api
      .getProduct(productId)
      .then(setProduct)
      .catch((e) => setError(e.message));

    reloadBatches();
  }, [productId]);

  async function submitBatch() {
    if (!batchNumber.trim()) return;

    setBatchSubmitting(true);
    setBatchError(null);

    try {
      await api.createBatch(productId, {
        batch_number: batchNumber.trim(),
        manufacturing_date: mfgDate || null,
        best_before_date: bestBefore || null,
      });

      setBatchNumber("");
      setMfgDate("");
      setBestBefore("");
      setBatchFormOpen(false);

      reloadBatches();
    } catch (err) {
      setBatchError(err.message);
    } finally {
      setBatchSubmitting(false);
    }
  }

  /* ---------------- ERROR STATE ---------------- */

  if (error) {
    return (
      <>
        <TopBar
          title="Product"
          onBack={() => navigate("/brand/products")}
        />

        <ScreenContent>
          <div className="rounded-app-lg border border-fail-text/20 bg-fail-bg p-5">
            <p className="text-sm font-medium text-fail-text mb-1">
              Unable to load product
            </p>

            <p className="text-xs text-fail-text/80">
              {error}
            </p>
          </div>
        </ScreenContent>
      </>
    );
  }

  /* ---------------- LOADING STATE ---------------- */

  if (!product) {
    return (
      <>
        <TopBar
          title="Product"
          onBack={() => navigate("/brand/products")}
        />

        <ScreenContent>
          <div className="rounded-app-lg border border-border-tertiary bg-bg-primary p-6 text-center">
            <p className="text-sm text-text-secondary">
              Loading product…
            </p>
          </div>
        </ScreenContent>
      </>
    );
  }

  return (
    <>
      <TopBar
        title={product.product_name}
        onBack={() => navigate("/brand/products")}
      />

      <ScreenContent>

        {/* ================= PRODUCT HEADER ================= */}

        <div className="mb-6">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-bg text-accent text-[11px] font-semibold tracking-wide mb-3">
            <IconPackage size={14} />
            REGISTERED PRODUCT
          </div>

          <div className="flex items-start justify-between gap-4">

            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                {product.product_name}
              </h1>

              {product.brand_name && (
                <p className="text-sm text-text-secondary mt-1">
                  {product.brand_name}
                </p>
              )}
            </div>

            {product.veg_status && (
              <Pill
                variant={
                  product.veg_status === "VEG"
                    ? "pass"
                    : "warn"
                }
              >
                {product.veg_status === "VEG"
                  ? "Veg"
                  : "Non-veg"}
              </Pill>
            )}

          </div>
        </div>

        {/* ================= PRODUCT OVERVIEW ================= */}

        <Card>
          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-app-md bg-accent-bg flex items-center justify-center">
              <IconShieldCheck
                size={20}
                className="text-accent"
              />
            </div>

            <div>
              <CardTitle>Product information</CardTitle>
              <CardSub>
                Details registered with SpectraSafe
              </CardSub>
            </div>

          </div>

          <KeyValueRow
            label="FSSAI license"
            value={product.fssai_license}
          />

          <KeyValueRow
            label="Manufacturer"
            value={product.manufacturer_name}
          />

          <KeyValueRow
            label="Net quantity"
            value={product.net_quantity}
          />

          <KeyValueRow
            label="MRP"
            value={product.mrp}
          />
        </Card>

        {/* ================= INGREDIENTS ================= */}

        {product.ingredients_raw && (
          <Card>

            <CardTitle className="mb-3">
              Ingredients
            </CardTitle>

            <div className="rounded-app-md bg-bg-secondary border border-border-tertiary p-3">
              <p className="text-[13px] leading-6 text-text-secondary">
                {product.ingredients_raw}
              </p>
            </div>

          </Card>
        )}

        {/* ================= ALLERGENS ================= */}

        {product.allergens?.length > 0 && (
          <Card>

            <CardTitle className="mb-3">
              Allergens
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {product.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="px-2.5 py-1 rounded-full bg-warn-bg text-warn-text text-[11px] font-medium"
                >
                  {allergen}
                </span>
              ))}
            </div>

          </Card>
        )}

        {/* ================= NUTRITION ================= */}

        {product.nutrition &&
          Object.keys(product.nutrition).length > 0 && (
            <Card>

              <CardTitle className="mb-1">
                Nutrition
              </CardTitle>

              <CardSub>
                Values as registered
              </CardSub>

              <div className="mt-3">
                {Object.entries(product.nutrition).map(
                  ([key, value]) => (
                    <KeyValueRow
                      key={key}
                      label={key}
                      value={value}
                    />
                  )
                )}
              </div>

            </Card>
          )}

        {/* ================= BATCHES ================= */}

        <SectionLabel>
          Production batches
        </SectionLabel>

        {batches && batches.length === 0 && !batchFormOpen && (
          <div className="rounded-app-lg border border-border-tertiary bg-bg-primary p-6 text-center mb-3">

            <div className="w-11 h-11 rounded-full bg-accent-bg flex items-center justify-center mx-auto mb-3">
              <IconStack
                size={20}
                className="text-accent"
              />
            </div>

            <p className="text-sm font-medium text-text-primary">
              No batches registered
            </p>

            <p className="text-xs text-text-secondary mt-1">
              Add a production batch to this product.
            </p>

          </div>
        )}

        {batches && batches.length > 0 && (
          <Card>

            {batches.map((batch) => (
              <ListItem
                key={batch.id}
                icon={<IconStack size={16} />}
                iconColor="purple"
                title={batch.batch_number}
                sub={
                  batch.manufacturing_date
                    ? `Mfg ${batch.manufacturing_date}${
                        batch.best_before_date
                          ? ` · BB ${batch.best_before_date}`
                          : ""
                      }`
                    : `Registered ${timeAgo(batch.created_at)}`
                }
              />
            ))}

          </Card>
        )}

        {/* ================= REGISTER BUTTON ================= */}

        {!batchFormOpen && (
          <ButtonPrimary
            onClick={() => {
              setBatchError(null);
              setBatchFormOpen(true);
            }}
          >
            <IconStack
              size={16}
              className="inline mr-1 -mt-0.5"
            />
            Register a batch
          </ButtonPrimary>
        )}

        {/* ================= BATCH FORM ================= */}

        {batchFormOpen && (
          <Card>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-app-md bg-accent-bg flex items-center justify-center">
                <IconCalendar
                  size={19}
                  className="text-accent"
                />
              </div>

              <div>
                <CardTitle>New batch</CardTitle>
                <CardSub>
                  Add production and expiry information
                </CardSub>
              </div>

            </div>

            <label className="text-[11px] font-medium text-text-secondary block mb-1">
              Batch number
            </label>

            <input
              value={batchNumber}
              onChange={(e) =>
                setBatchNumber(e.target.value)
              }
              placeholder="e.g. BATCH-2026-001"
              className={inputClass}
            />

            <label className="text-[11px] font-medium text-text-secondary block mb-1">
              Manufacturing date
            </label>

            <input
              type="date"
              value={mfgDate}
              onChange={(e) =>
                setMfgDate(e.target.value)
              }
              className={inputClass}
            />

            <label className="text-[11px] font-medium text-text-secondary block mb-1">
              Best before date
            </label>

            <input
              type="date"
              value={bestBefore}
              onChange={(e) =>
                setBestBefore(e.target.value)
              }
              className={inputClass}
            />

            {batchError && (
              <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-3 py-2.5 mb-3">
                <p className="text-xs text-fail-text">
                  {batchError}
                </p>
              </div>
            )}

            <ButtonPrimary
              onClick={submitBatch}
              disabled={
                batchSubmitting ||
                !batchNumber.trim()
              }
            >
              {batchSubmitting
                ? "Saving…"
                : "Save batch"}
            </ButtonPrimary>

            <ButtonOutline
              onClick={() => {
                setBatchFormOpen(false);
                setBatchError(null);
              }}
              disabled={batchSubmitting}
            >
              Cancel
            </ButtonOutline>

          </Card>
        )}

      </ScreenContent>
    </>
  );
}