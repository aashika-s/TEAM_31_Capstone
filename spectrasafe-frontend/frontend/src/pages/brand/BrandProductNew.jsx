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
import { IconPlus, IconX, IconPackage } from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import { api } from "../../lib/api";

const EMPTY = {
  product_name: "", brand_name: "", description: "", ingredients_raw: "",
  allergens: "", net_quantity: "", mrp: "", veg_status: "",
  manufacturer_name: "", manufacturer_address: "", fssai_license: "", state: "",
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const SUGGESTED_NUTRIENTS = [
  "Energy (kcal)", "Protein(g)", "Total Fat (g)", "Saturated Fat(g)", "Trans Fat(g)",
  "Total Carbs (g)", "Total Sugar(g)", "Dietary Fibre(g)", "Sodium (mg)",
];

function NumberedSection({ number, title, description, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
          {number}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

export default function BrandProductNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [nutritionRows, setNutritionRows] = useState([{ label: "", value: "" }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateNutritionRow(index, field, value) {
    setNutritionRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addNutritionRow() {
    setNutritionRows((rows) => [...rows, { label: "", value: "" }]);
  }

  function removeNutritionRow(index) {
    setNutritionRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const nutritionEntries = nutritionRows.map((r) => [r.label.trim(), r.value.trim()]).filter(([l, v]) => l && v);
      const nutrition = nutritionEntries.length > 0 ? Object.fromEntries(nutritionEntries) : null;
      const payload = {
        ...form,
        veg_status: form.veg_status || null,
        allergens: form.allergens ? form.allergens.split(",").map((a) => a.trim()).filter(Boolean) : null,
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
      <TopBar title="Register a product" onBack={() => navigate("/brand/products")} />
      <ScreenContent>
        <div className="max-w-2xl mx-auto">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Register a new product</h1>
            <p className="text-xs text-text-secondary mt-1">Add product details to your portfolio. All fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-bg-primary border border-border-tertiary rounded-app-lg p-5 md:p-6 shadow-[var(--shadow-card)]">

            <NumberedSection number={1} title="Basic information" description="Enter the basic details of your product.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Product name *</label>
                  <input required value={form.product_name} onChange={(e) => update("product_name", e.target.value)} className="form-input" placeholder="e.g. Organic Tomato Basil Pasta Sauce" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Brand name *</label>
                  <input required value={form.brand_name} onChange={(e) => update("brand_name", e.target.value)} className="form-input" placeholder="e.g. LAYS ptd." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Net quantity *</label>
                  <input required value={form.net_quantity} onChange={(e) => update("net_quantity", e.target.value)} className="form-input" placeholder="e.g. 500 g" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">MRP</label>
                  <input value={form.mrp} onChange={(e) => update("mrp", e.target.value)} className="form-input" placeholder="e.g. ₹99" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Veg / Non-veg</label>
                  <select value={form.veg_status} onChange={(e) => update("veg_status", e.target.value)} className="form-input">
                    <option value="">Not specified</option>
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-veg</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Description</label>
                  <input value={form.description} onChange={(e) => update("description", e.target.value)} className="form-input" placeholder="Brief description" />
                </div>
              </div>
            </NumberedSection>

            <hr className="border-border-tertiary mb-5" />

            <NumberedSection number={2} title="Composition" description="Ingredients and allergen declaration.">
              <label className="text-xs font-medium text-text-secondary block mb-1">Ingredients</label>
              <textarea rows={3} value={form.ingredients_raw} onChange={(e) => update("ingredients_raw", e.target.value)} className="form-input mb-3" placeholder="e.g. Wheat Flour, Sugar, Vegetable Oil..." />
              <label className="text-xs font-medium text-text-secondary block mb-1">Allergens</label>
              <input value={form.allergens} onChange={(e) => update("allergens", e.target.value)} className="form-input" placeholder="e.g. wheat, soy, milk" />
              <p className="text-[11px] text-text-tertiary mt-1">Separate multiple allergens with commas.</p>
            </NumberedSection>

            <hr className="border-border-tertiary mb-5" />

            <NumberedSection number={3} title="Manufacturer details" description="Enter manufacturer information as per label.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Manufacturer name *</label>
                  <input required value={form.manufacturer_name} onChange={(e) => update("manufacturer_name", e.target.value)} className="form-input" placeholder="e.g. LAYS ptd." />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Manufacturing state *</label>
                  <select required value={form.state} onChange={(e) => update("state", e.target.value)} className="form-input">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Manufacturer address</label>
                  <textarea rows={2} value={form.manufacturer_address} onChange={(e) => update("manufacturer_address", e.target.value)} className="form-input" placeholder="Enter complete address" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">FSSAI license number *</label>
                  <input required value={form.fssai_license} onChange={(e) => update("fssai_license", e.target.value)} className="form-input" placeholder="14-digit number" />
                  <p className="text-[11px] text-text-tertiary mt-1">Determines FSSAI jurisdiction that reviews this registration.</p>
                </div>
              </div>
            </NumberedSection>

            <hr className="border-border-tertiary mb-5" />

            <NumberedSection number={4} title="Nutrition information" description="Optional nutritional values, per 100g/100ml.">
              <div className="space-y-2">
                {nutritionRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      value={row.label}
                      onChange={(e) => updateNutritionRow(i, "label", e.target.value)}
                      placeholder="Nutrient name"
                      list="nutrient-suggestions"
                      className="form-input flex-1"
                    />
                    <input
                      value={row.value}
                      onChange={(e) => updateNutritionRow(i, "value", e.target.value)}
                      placeholder="Value"
                      className="form-input w-28"
                    />
                    <button
                      type="button"
                      onClick={() => removeNutritionRow(i)}
                      disabled={nutritionRows.length === 1}
                      className="w-10 h-[42px] flex items-center justify-center rounded-app-md border border-border-tertiary text-text-tertiary hover:text-fail-text hover:bg-fail-bg transition-colors disabled:opacity-30"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                <datalist id="nutrient-suggestions">
                  {SUGGESTED_NUTRIENTS.map((n) => <option key={n} value={n} />)}
                </datalist>
                <button type="button" onClick={addNutritionRow} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
                  <IconPlus size={13} />
                  Add nutrient
                </button>
              </div>
            </NumberedSection>

            {error && (
              <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-3 py-2.5 mb-4 text-xs text-fail-text">{error}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <ButtonOutline type="button" className="!w-auto !mt-0" onClick={() => navigate("/brand/products")}>
                Cancel
              </ButtonOutline>
              <ButtonPrimary type="submit" className="!w-auto !mt-0 px-5" disabled={submitting}>
                {submitting ? "Registering…" : "Register product"}
              </ButtonPrimary>
            </div>
          </form>

          <p className="text-center text-[11px] text-text-tertiary mt-4">
            Your registration will be reviewed by FSSAI before it's marked verified.
          </p>
        </div>
      </ScreenContent>
    </>
  );
}