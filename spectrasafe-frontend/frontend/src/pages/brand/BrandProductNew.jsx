// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconPlus, IconX } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import SectionLabel from "../../components/SectionLabel";
// import { ButtonPrimary } from "../../components/Button";
// import { api } from "../../lib/api";

// const inputClass =
//   "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent";

// const labelClass =
//   "text-xs text-text-secondary block mb-1";

// const EMPTY = {
//   product_name: "",
//   brand_name: "",
//   description: "",
//   ingredients_raw: "",
//   allergens: "",
//   net_quantity: "",
//   mrp: "",
//   veg_status: "",
//   manufacturer_name: "",
//   manufacturer_address: "",
//   fssai_license: "",
// };

// // Suggested nutrition labels.
// // These are suggestions only and are not mandatory.
// const SUGGESTED_NUTRIENTS = [
//   "Energy (kcal)",
//   "Protein (g)",
//   "Total Fat (g)",
//   "Saturated Fat (g)",
//   "Trans Fat (g)",
//   "Total Carbohydrates (g)",
//   "Total Sugar (g)",
//   "Dietary Fibre (g)",
//   "Sodium (mg)",
// ];

// export default function BrandProductNew() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState(EMPTY);

//   // Nutrition is optional.
//   // Each row contains a nutrient name and its value.
//   const [nutritionRows, setNutritionRows] = useState([
//     { label: "", value: "" },
//   ]);

//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   function update(field, value) {
//     setForm((f) => ({
//       ...f,
//       [field]: value,
//     }));
//   }

//   function updateNutritionRow(index, field, value) {
//     setNutritionRows((rows) =>
//       rows.map((row, i) =>
//         i === index
//           ? { ...row, [field]: value }
//           : row
//       )
//     );
//   }

//   function addNutritionRow() {
//     setNutritionRows((rows) => [
//       ...rows,
//       { label: "", value: "" },
//     ]);
//   }

//   function removeNutritionRow(index) {
//     setNutritionRows((rows) =>
//       rows.filter((_, i) => i !== index)
//     );
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();

//     setError(null);
//     setSubmitting(true);

//     try {
//       // Convert nutrition rows:
//       //
//       // [
//       //   { label: "Energy (kcal)", value: "360" },
//       //   { label: "Protein (g)", value: "6.5" }
//       // ]
//       //
//       // into:
//       //
//       // {
//       //   "Energy (kcal)": "360",
//       //   "Protein (g)": "6.5"
//       // }

//       const nutritionEntries = nutritionRows
//         .map((row) => [
//           row.label.trim(),
//           row.value.trim(),
//         ])
//         .filter(
//           ([label, value]) => label && value
//         );

//       const nutrition =
//         nutritionEntries.length > 0
//           ? Object.fromEntries(nutritionEntries)
//           : null;

//       const payload = {
//         ...form,

//         veg_status:
//           form.veg_status || null,

//         allergens: form.allergens
//           ? form.allergens
//               .split(",")
//               .map((a) => a.trim())
//               .filter(Boolean)
//           : null,

//         nutrition,
//       };

//       const product = await api.createProduct(payload);

//       navigate(`/brand/products/${product.id}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <>
//       <TopBar title="Register a product" />

//       <ScreenContent>
//         <form onSubmit={handleSubmit}>

//           {/* Product name */}
//           <label className={labelClass}>
//             Product name *
//           </label>

//           <input
//             required
//             value={form.product_name}
//             onChange={(e) =>
//               update("product_name", e.target.value)
//             }
//             className={inputClass}
//           />

//           {/* Brand name */}
//           <label className={labelClass}>
//             Brand name *
//           </label>

//           <input
//             required
//             value={form.brand_name}
//             onChange={(e) =>
//               update("brand_name", e.target.value)
//             }
//             className={inputClass}
//           />

//           {/* Description */}
//           <label className={labelClass}>
//             Description
//           </label>

//           <textarea
//             rows={2}
//             value={form.description}
//             onChange={(e) =>
//               update("description", e.target.value)
//             }
//             className={`${inputClass} resize-none`}
//           />

//           {/* Ingredients */}
//           <label className={labelClass}>
//             Ingredients
//           </label>

//           <textarea
//             rows={3}
//             value={form.ingredients_raw}
//             onChange={(e) =>
//               update("ingredients_raw", e.target.value)
//             }
//             className={`${inputClass} resize-none`}
//             placeholder="e.g. Wheat Flour, Sugar, Vegetable Oil…"
//           />

//           {/* Allergens */}
//           <label className={labelClass}>
//             Allergens (comma-separated)
//           </label>

//           <input
//             value={form.allergens}
//             onChange={(e) =>
//               update("allergens", e.target.value)
//             }
//             className={inputClass}
//             placeholder="e.g. wheat, soy, milk"
//           />

//           {/* Net quantity + MRP */}
//           <div className="flex gap-2">

//             <div className="flex-1">
//               <label className={labelClass}>
//                 Net quantity
//               </label>

//               <input
//                 value={form.net_quantity}
//                 onChange={(e) =>
//                   update("net_quantity", e.target.value)
//                 }
//                 className={inputClass}
//                 placeholder="e.g. 500g"
//               />
//             </div>

//             <div className="flex-1">
//               <label className={labelClass}>
//                 MRP
//               </label>

//               <input
//                 value={form.mrp}
//                 onChange={(e) =>
//                   update("mrp", e.target.value)
//                 }
//                 className={inputClass}
//                 placeholder="e.g. ₹99"
//               />
//             </div>

//           </div>

//           {/* Veg / Non-veg */}
//           <label className={labelClass}>
//             Veg / Non-veg
//           </label>

//           <select
//             value={form.veg_status}
//             onChange={(e) =>
//               update("veg_status", e.target.value)
//             }
//             className={inputClass}
//           >
//             <option value="">
//               Not specified
//             </option>

//             <option value="VEG">
//               Veg
//             </option>

//             <option value="NON_VEG">
//               Non-veg
//             </option>
//           </select>

//           {/* Manufacturer name */}
//           <label className={labelClass}>
//             Manufacturer name *
//           </label>

//           <input
//             required
//             value={form.manufacturer_name}
//             onChange={(e) =>
//               update(
//                 "manufacturer_name",
//                 e.target.value
//               )
//             }
//             className={inputClass}
//           />

//           {/* Manufacturer address */}
//           <label className={labelClass}>
//             Manufacturer address
//           </label>

//           <textarea
//             rows={2}
//             value={form.manufacturer_address}
//             onChange={(e) =>
//               update(
//                 "manufacturer_address",
//                 e.target.value
//               )
//             }
//             className={`${inputClass} resize-none`}
//           />

//           {/* FSSAI license */}
//           <label className={labelClass}>
//             FSSAI license number *
//           </label>

//           <input
//             required
//             value={form.fssai_license}
//             onChange={(e) =>
//               update(
//                 "fssai_license",
//                 e.target.value
//               )
//             }
//             className={inputClass}
//             placeholder="14-digit license number"
//           />

//           {/* ========================= */}
//           {/* NUTRITION SECTION */}
//           {/* ========================= */}

//           <SectionLabel>
//             Nutrition (optional)
//           </SectionLabel>

//           {nutritionRows.map((row, i) => (
//             <div
//               key={i}
//               className="flex gap-2 mb-2 items-start"
//             >

//               {/* Nutrient name */}
//               <input
//                 value={row.label}
//                 onChange={(e) =>
//                   updateNutritionRow(
//                     i,
//                     "label",
//                     e.target.value
//                   )
//                 }
//                 placeholder="e.g. Energy (kcal)"
//                 list="nutrient-suggestions"
//                 className={`${inputClass} mb-0 flex-1`}
//               />

//               {/* Nutrient value */}
//               <input
//                 value={row.value}
//                 onChange={(e) =>
//                   updateNutritionRow(
//                     i,
//                     "value",
//                     e.target.value
//                   )
//                 }
//                 placeholder="e.g. 360"
//                 className={`${inputClass} mb-0 flex-1`}
//               />

//               {/* Remove row */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   removeNutritionRow(i)
//                 }
//                 className="p-2.5 text-text-tertiary hover:text-fail-text flex-shrink-0"
//                 aria-label="Remove nutrient row"
//               >
//                 <IconX size={16} />
//               </button>

//             </div>
//           ))}

//           {/* Nutrient suggestions */}
//           <datalist id="nutrient-suggestions">
//             {SUGGESTED_NUTRIENTS.map((nutrient) => (
//               <option
//                 key={nutrient}
//                 value={nutrient}
//               />
//             ))}
//           </datalist>

//           {/* Add nutrient */}
//           <button
//             type="button"
//             onClick={addNutritionRow}
//             className="flex items-center gap-1 text-xs text-accent mb-4"
//           >
//             <IconPlus size={14} />
//             Add nutrient
//           </button>

//           {/* Error */}
//           {error && (
//             <p className="text-xs text-fail-text mb-2">
//               {error}
//             </p>
//           )}

//           {/* Submit */}
//           <ButtonPrimary
//             type="submit"
//             disabled={submitting}
//           >
//             {submitting
//               ? "Registering…"
//               : "Register product"}
//           </ButtonPrimary>

//         </form>
//       </ScreenContent>
//     </>
//   );
// }
















// // PHASE 6
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconPlus, IconX } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import SectionLabel from "../../components/SectionLabel";
// import { ButtonPrimary } from "../../components/Button";
// import { api } from "../../lib/api";

// const inputClass =
//   "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent";
// const labelClass = "text-xs text-text-secondary block mb-1";

// const EMPTY = {
//   product_name: "",
//   brand_name: "",
//   description: "",
//   ingredients_raw: "",
//   allergens: "",
//   net_quantity: "",
//   mrp: "",
//   veg_status: "",
//   manufacturer_name: "",
//   manufacturer_address: "",
//   fssai_license: "",
// };

// // Suggested labels only -- not enforced. Matching the same phrasing the
// // OCR pipeline itself tends to extract (e.g. "Energy (kcal)") means a
// // Brand-entered value and a later scanned value for the same nutrient
// // are more likely to line up as the same key if that comparison ever
// // gets built into verification_service.
// const SUGGESTED_NUTRIENTS = [
//   "Energy (kcal)", "Protein(g)", "Total Fat (g)", "Saturated Fat(g)",
//   "Trans Fat(g)", "Total Carbs (g)", "Total Sugar(g)", "Dietary Fibre(g)", "Sodium (mg)",
// ];

// export default function BrandProductNew() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState(EMPTY);
//   const [nutritionRows, setNutritionRows] = useState([{ label: "", value: "" }]);
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   function update(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   function updateNutritionRow(index, field, value) {
//     setNutritionRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
//   }

//   function addNutritionRow() {
//     setNutritionRows((rows) => [...rows, { label: "", value: "" }]);
//   }

//   function removeNutritionRow(index) {
//     setNutritionRows((rows) => rows.filter((_, i) => i !== index));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const nutritionEntries = nutritionRows
//         .map((r) => [r.label.trim(), r.value.trim()])
//         .filter(([label, value]) => label && value);
//       const nutrition = nutritionEntries.length > 0 ? Object.fromEntries(nutritionEntries) : null;

//       const payload = {
//         ...form,
//         veg_status: form.veg_status || null,
//         allergens: form.allergens
//           ? form.allergens.split(",").map((a) => a.trim()).filter(Boolean)
//           : null,
//         nutrition,
//       };
//       const product = await api.createProduct(payload);
//       navigate(`/brand/products/${product.id}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <>
//       <TopBar title="Register a product" />
//       <ScreenContent>
//         <form onSubmit={handleSubmit}>
//           <label className={labelClass}>Product name *</label>
//           <input required value={form.product_name} onChange={(e) => update("product_name", e.target.value)} className={inputClass} />

//           <label className={labelClass}>Brand name *</label>
//           <input required value={form.brand_name} onChange={(e) => update("brand_name", e.target.value)} className={inputClass} />

//           <label className={labelClass}>Description</label>
//           <textarea rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} />

//           <label className={labelClass}>Ingredients</label>
//           <textarea rows={3} value={form.ingredients_raw} onChange={(e) => update("ingredients_raw", e.target.value)} className={`${inputClass} resize-none`} placeholder="e.g. Wheat Flour, Sugar, Vegetable Oil…" />

//           <label className={labelClass}>Allergens (comma-separated)</label>
//           <input value={form.allergens} onChange={(e) => update("allergens", e.target.value)} className={inputClass} placeholder="e.g. wheat, soy, milk" />

//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label className={labelClass}>Net quantity</label>
//               <input value={form.net_quantity} onChange={(e) => update("net_quantity", e.target.value)} className={inputClass} placeholder="e.g. 500g" />
//             </div>
//             <div className="flex-1">
//               <label className={labelClass}>MRP</label>
//               <input value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className={inputClass} placeholder="e.g. ₹99" />
//             </div>
//           </div>

//           <label className={labelClass}>Veg / Non-veg</label>
//           <select value={form.veg_status} onChange={(e) => update("veg_status", e.target.value)} className={inputClass}>
//             <option value="">Not specified</option>
//             <option value="VEG">Veg</option>
//             <option value="NON_VEG">Non-veg</option>
//           </select>

//           <label className={labelClass}>Manufacturer name *</label>
//           <input required value={form.manufacturer_name} onChange={(e) => update("manufacturer_name", e.target.value)} className={inputClass} />

//           <label className={labelClass}>Manufacturer address</label>
//           <textarea rows={2} value={form.manufacturer_address} onChange={(e) => update("manufacturer_address", e.target.value)} className={`${inputClass} resize-none`} />

//           <label className={labelClass}>FSSAI license number *</label>
//           <input
//             required
//             value={form.fssai_license}
//             onChange={(e) => update("fssai_license", e.target.value)}
//             className={inputClass}
//             placeholder="14-digit license number"
//           />

//           <SectionLabel>Nutrition (optional)</SectionLabel>
//           {nutritionRows.map((row, i) => (
//             <div key={i} className="flex gap-2 mb-2 items-start">
//               <input
//                 value={row.label}
//                 onChange={(e) => updateNutritionRow(i, "label", e.target.value)}
//                 placeholder="e.g. Energy (kcal)"
//                 list="nutrient-suggestions"
//                 className={`${inputClass} mb-0 flex-1`}
//               />
//               <input
//                 value={row.value}
//                 onChange={(e) => updateNutritionRow(i, "value", e.target.value)}
//                 placeholder="e.g. 360"
//                 className={`${inputClass} mb-0 flex-1`}
//               />
//               <button
//                 type="button"
//                 onClick={() => removeNutritionRow(i)}
//                 className="p-2.5 text-text-tertiary hover:text-fail-text flex-shrink-0"
//                 aria-label="Remove nutrient row"
//               >
//                 <IconX size={16} />
//               </button>
//             </div>
//           ))}
//           <datalist id="nutrient-suggestions">
//             {SUGGESTED_NUTRIENTS.map((n) => (
//               <option key={n} value={n} />
//             ))}
//           </datalist>
//           <button
//             type="button"
//             onClick={addNutritionRow}
//             className="flex items-center gap-1 text-xs text-accent mb-4"
//           >
//             <IconPlus size={14} />
//             Add nutrient
//           </button>

//           {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//           <ButtonPrimary type="submit" disabled={submitting}>
//             {submitting ? "Registering…" : "Register product"}
//           </ButtonPrimary>
//         </form>
//       </ScreenContent>
//     </>
//   );
// }















// PHASE 6
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconPlus,
  IconX,
  IconPackage,
  IconBuildingFactory2,
  IconFileText,
  IconFlask,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import SectionLabel from "../../components/SectionLabel";
import { ButtonPrimary } from "../../components/Button";
import { api } from "../../lib/api";

const EMPTY = {
  product_name: "",
  brand_name: "",
  description: "",
  ingredients_raw: "",
  allergens: "",
  net_quantity: "",
  mrp: "",
  veg_status: "",
  manufacturer_name: "",
  manufacturer_address: "",
  fssai_license: "",
};

const SUGGESTED_NUTRIENTS = [
  "Energy (kcal)",
  "Protein(g)",
  "Total Fat (g)",
  "Saturated Fat(g)",
  "Trans Fat(g)",
  "Total Carbs (g)",
  "Total Sugar(g)",
  "Dietary Fibre(g)",
  "Sodium (mg)",
];

const inputClass =
  "w-full px-3.5 py-3.5 border border-border-tertiary rounded-app-md " +
  "text-base bg-bg-primary text-text-primary outline-none " +
  "placeholder:text-text-tertiary focus:border-accent focus:ring-2 " +
  "focus:ring-accent/10 transition-all";

const labelClass =
  "text-sm font-medium text-text-primary block mb-1.5";

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-app-md bg-accent-bg flex items-center justify-center flex-shrink-0">
        <Icon size={19} className="text-accent" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-primary">
          {title}
        </h2>

        {description && (
          <p className="text-xs text-text-secondary mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function BrandProductNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [nutritionRows, setNutritionRows] = useState([
    { label: "", value: "" },
  ]);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNutritionRow(index, field, value) {
    setNutritionRows((rows) =>
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function addNutritionRow() {
    setNutritionRows((rows) => [
      ...rows,
      {
        label: "",
        value: "",
      },
    ]);
  }

  function removeNutritionRow(index) {
    setNutritionRows((rows) =>
      rows.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const nutritionEntries = nutritionRows
        .map((row) => [
          row.label.trim(),
          row.value.trim(),
        ])
        .filter(([label, value]) => label && value);

      const nutrition =
        nutritionEntries.length > 0
          ? Object.fromEntries(nutritionEntries)
          : null;

      const payload = {
        ...form,

        veg_status: form.veg_status || null,

        allergens: form.allergens
          ? form.allergens
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : null,

        nutrition,
      };

      const product = await api.createProduct(payload);

      navigate(`/brand/products/${product.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopBar
        title="Register a product"
        onBack={() => navigate("/brand/products")}
      />

      <ScreenContent>
        <div className="max-w-3xl mx-auto">

          {/* PAGE HEADER */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-bg text-accent text-[11px] font-semibold tracking-wide mb-3">
              <IconPackage size={14} />
              PRODUCT REGISTRATION
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight">
              Register a new product
            </h1>

            <p className="text-sm text-text-secondary mt-1">
              Add product details to your verified SpectraSafe portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* PRODUCT INFORMATION */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <SectionHeader
                icon={IconPackage}
                title="Product information"
                description="Basic information about the product."
              />

              <div className="space-y-4">

                <div>
                  <label className={labelClass}>
                    Product name *
                  </label>

                  <input
                    required
                    value={form.product_name}
                    onChange={(e) =>
                      update("product_name", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. Crunchy Wheat Biscuits"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Brand name *
                  </label>

                  <input
                    required
                    value={form.brand_name}
                    onChange={(e) =>
                      update("brand_name", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. FreshBite"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      update("description", e.target.value)
                    }
                    className={`${inputClass} resize-none`}
                    placeholder="Brief description of the product..."
                  />
                </div>

              </div>
            </div>


            {/* INGREDIENTS & ALLERGENS */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <SectionHeader
                icon={IconFlask}
                title="Ingredients & allergens"
                description="Declare ingredients and known allergens."
              />

              <div className="space-y-4">

                <div>
                  <label className={labelClass}>
                    Ingredients
                  </label>

                  <textarea
                    rows={4}
                    value={form.ingredients_raw}
                    onChange={(e) =>
                      update("ingredients_raw", e.target.value)
                    }
                    className={`${inputClass} resize-none`}
                    placeholder="e.g. Wheat Flour, Sugar, Vegetable Oil..."
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Allergens
                  </label>

                  <input
                    value={form.allergens}
                    onChange={(e) =>
                      update("allergens", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. wheat, soy, milk"
                  />

                  <p className="text-[11px] text-text-tertiary mt-1.5">
                    Separate multiple allergens with commas.
                  </p>
                </div>

              </div>
            </div>


            {/* PACKAGING & PRODUCT DETAILS */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <SectionHeader
                icon={IconFileText}
                title="Packaging & product details"
                description="Quantity, pricing and product classification."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className={labelClass}>
                    Net quantity
                  </label>

                  <input
                    value={form.net_quantity}
                    onChange={(e) =>
                      update("net_quantity", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. 500g"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    MRP
                  </label>

                  <input
                    value={form.mrp}
                    onChange={(e) =>
                      update("mrp", e.target.value)
                    }
                    className={inputClass}
                    placeholder="e.g. ₹99"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Veg / Non-veg
                  </label>

                  <select
                    value={form.veg_status}
                    onChange={(e) =>
                      update("veg_status", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-veg</option>
                  </select>
                </div>

              </div>
            </div>


            {/* MANUFACTURER */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <SectionHeader
                icon={IconBuildingFactory2}
                title="Manufacturer details"
                description="Registered manufacturer and licensing information."
              />

              <div className="space-y-4">

                <div>
                  <label className={labelClass}>
                    Manufacturer name *
                  </label>

                  <input
                    required
                    value={form.manufacturer_name}
                    onChange={(e) =>
                      update(
                        "manufacturer_name",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="e.g. Fresh Foods Pvt Ltd"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Manufacturer address
                  </label>

                  <textarea
                    rows={3}
                    value={form.manufacturer_address}
                    onChange={(e) =>
                      update(
                        "manufacturer_address",
                        e.target.value
                      )
                    }
                    className={`${inputClass} resize-none`}
                    placeholder="Complete manufacturing address..."
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    FSSAI license number *
                  </label>

                  <input
                    required
                    value={form.fssai_license}
                    onChange={(e) =>
                      update(
                        "fssai_license",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="14-digit license number"
                  />

                  <p className="text-[11px] text-text-tertiary mt-1.5">
                    Enter the valid FSSAI license associated with this product.
                  </p>
                </div>

              </div>
            </div>


            {/* NUTRITION */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <SectionHeader
                icon={IconFlask}
                title="Nutrition information"
                description="Optional nutritional values for the product."
              />

              <div className="space-y-3">

                {nutritionRows.map((row, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-start"
                  >

                    <div className="flex-1">
                      <input
                        value={row.label}
                        onChange={(e) =>
                          updateNutritionRow(
                            i,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Nutrient name"
                        list="nutrient-suggestions"
                        className={inputClass}
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        value={row.value}
                        onChange={(e) =>
                          updateNutritionRow(
                            i,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Value"
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeNutritionRow(i)
                      }
                      disabled={nutritionRows.length === 1}
                      className="
                        p-3
                        rounded-app-md
                        border
                        border-border-tertiary
                        text-text-tertiary
                        hover:text-fail-text
                        hover:bg-fail-bg
                        transition-colors
                        disabled:opacity-30
                        disabled:hover:bg-transparent
                      "
                      aria-label="Remove nutrient row"
                    >
                      <IconX size={16} />
                    </button>

                  </div>
                ))}

                <datalist id="nutrient-suggestions">
                  {SUGGESTED_NUTRIENTS.map((nutrient) => (
                    <option
                      key={nutrient}
                      value={nutrient}
                    />
                  ))}
                </datalist>

                <button
                  type="button"
                  onClick={addNutritionRow}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    text-accent
                    hover:text-accent-text
                    transition-colors
                    mt-1
                  "
                >
                  <IconPlus size={15} />
                  Add nutrient
                </button>

              </div>
            </div>


            {/* ERROR */}
            {error && (
              <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-4 py-3">
                <p className="text-xs text-fail-text">
                  {error}
                </p>
              </div>
            )}


            {/* SUBMIT */}
            <div className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[0_4px_20px_rgba(40,38,80,0.04)]">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Ready to register?
                  </p>

                  <p className="text-xs text-text-secondary mt-1">
                    The product will be added to your verified portfolio.
                  </p>
                </div>

                <div className="md:w-52">
                  <ButtonPrimary
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Registering..."
                      : "Register product"}
                  </ButtonPrimary>
                </div>

              </div>

            </div>

          </form>

        </div>
      </ScreenContent>
    </>
  );
}