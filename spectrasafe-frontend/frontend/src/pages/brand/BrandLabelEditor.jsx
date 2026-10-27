// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer } from "react-konva";
// import { IconDownload, IconSparkles, IconTypography, IconSquare, IconPhoto, IconTrash } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import { ButtonPrimary, ButtonOutline } from "../../components/Button";
// import { api } from "../../lib/api";

// const inputClass =
//   "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent";

// const EMPTY_DATA = {
//   product_name: "", brand_name: "", ingredients_list: "", allergens: [],
//   nutrients: {}, net_quantity: "", mrp: "", manufacturer_name: "",
//   manufacturer_address: "", fssai_license: "",
// };

// // Ordered list of the built-in, data-bound "flow" elements. repackFlow()
// // walks this in order, skipping any with no content, so gaps never
// // appear regardless of how much/little the AI draft (or the brand) fills
// // in. Freely-added elements (text/shape/image with no `field`) are never
// // touched by repack -- only these core ids.
// const FLOW_ORDER = ["el-1", "el-2", "el-3", "el-4", "el-allergens", "el-5", "el-6", "el-7", "el-address", "el-license"];

// function defaultLayout() {
//   return [
//     { id: "el-1", type: "text", field: "product_name", x: 30, y: 30, width: 480, fontSize: 26, fontStyle: "bold", rotation: 0 },
//     { id: "el-2", type: "text", field: "brand_name", x: 30, y: 30, width: 480, fontSize: 14, fill: "#666", rotation: 0 },
//     { id: "el-3", type: "rect", x: 30, y: 30, width: 480, height: 2, fill: "#ccc", rotation: 0 },
//     { id: "el-4", type: "text", field: "ingredients_list", x: 30, y: 30, width: 480, fontSize: 12, rotation: 0 },
//     { id: "el-allergens", type: "text", field: "allergens", x: 30, y: 30, width: 480, fontSize: 12, fontStyle: "bold", fill: "#a3332d", rotation: 0 },
//     { id: "el-5", type: "nutrients", field: "nutrients", x: 30, y: 30, width: 480, fontSize: 12, rotation: 0 },
//     { id: "el-6", type: "text", field: "net_quantity", x: 30, y: 30, width: 300, fontSize: 12, rotation: 0 },
//     { id: "el-7", type: "text", field: "manufacturer_name", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
//     { id: "el-address", type: "text", field: "manufacturer_address", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
//     { id: "el-license", type: "text", field: "fssai_license", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
//   ];
// }

// // Estimates rendered height for a flow element given current data, so
// // repack can stack elements with no gaps and no overlap regardless of
// // content length. Rough (character-count based), not pixel-perfect --
// // good enough for layout flow, not a typesetting engine.
// function estimateHeight(el, data) {
//   if (el.type === "rect") return el.height + 20;
//   if (el.type === "nutrients") {
//     const count = Object.keys(data.nutrients || {}).length;
//     return count > 0 ? 30 + 22 * count + 20 : 0;
//   }
//   let content = "";
//   if (el.field === "allergens") content = (data.allergens || []).length ? `Contains: ${data.allergens.join(", ")}` : "";
//   else content = String(data[el.field] || "");
//   if (!content) return 0;
//   const charsPerLine = Math.floor(el.width / (el.fontSize * 0.55));
//   const lines = Math.max(1, Math.ceil(content.length / charsPerLine));
//   return lines * (el.fontSize * 1.3) + 14;
// }

// function repackFlow(layout, data) {
//   let y = 30;
//   const byId = Object.fromEntries(layout.map((e) => [e.id, e]));
//   const flowIds = new Set(FLOW_ORDER);
//   const updated = layout.map((el) => {
//     if (!flowIds.has(el.id)) return el; // freeform elements untouched
//     return el;
//   });
//   FLOW_ORDER.forEach((id) => {
//     const el = byId[id];
//     if (!el) return;
//     const h = estimateHeight(el, data);
//     if (h === 0) return; // empty content -- don't advance y, element won't render anyway
//     el.y = y;
//     y += h;
//   });
//   return updated;
// }

// function useLoadedImage(src) {
//   const [img, setImg] = useState(null);
//   useEffect(() => {
//     if (!src) return;
//     const image = new window.Image();
//     image.crossOrigin = "anonymous"; // needed so canvas.toDataURL() doesn't taint on export
//     const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
//     image.src = src.startsWith("http") ? src : `${base}${src}`;
//     image.onload = () => setImg(image);
//   }, [src]);
//   return img;
// }

// function CanvasElement({ el, data, isSelected, onSelect, onChange }) {
//   const shapeRef = useRef();
//   const trRef = useRef();
//   const loadedImg = useLoadedImage(el.type === "image" ? el.src : null);

//   useEffect(() => {
//     if (isSelected && trRef.current && shapeRef.current) {
//       trRef.current.nodes([shapeRef.current]);
//       trRef.current.getLayer().batchDraw();
//     }
//   }, [isSelected]);

//   let content = "";
//   if (el.type === "text") {
//     if (el.field === "allergens") content = (data.allergens || []).length ? `Contains: ${data.allergens.join(", ")}` : "";
//     else content = el.field ? String(data[el.field] || "") : el.text || "";
//     if (!content) return null; // empty bound field -- render nothing, not a placeholder
//   }

//   const common = {
//     ref: shapeRef,
//     x: el.x, y: el.y, rotation: el.rotation || 0,
//     draggable: true,
//     onClick: () => onSelect(el.id),
//     onTap: () => onSelect(el.id),
//     onDragEnd: (e) => onChange({ ...el, x: e.target.x(), y: e.target.y() }),
//     onTransformEnd: (e) => {
//       const node = shapeRef.current;
//       const scaleX = node.scaleX();
//       const scaleY = node.scaleY();
//       node.scaleX(1);
//       node.scaleY(1);
//       onChange({
//         ...el,
//         x: node.x(), y: node.y(), rotation: node.rotation(),
//         width: Math.max(20, el.width * scaleX),
//         height: el.height ? Math.max(2, el.height * scaleY) : undefined,
//         fontSize: el.type === "text" ? Math.max(6, (el.fontSize || 12) * scaleY) : el.fontSize,
//       });
//     },
//   };

//   return (
//     <>
//       {el.type === "rect" && <Rect {...common} width={el.width} height={el.height} fill={el.fill} />}
//       {el.type === "image" && loadedImg && <KonvaImage {...common} image={loadedImg} width={el.width} height={el.height} />}
//       {(el.type === "text" || el.type === "nutrients") && (
//         <Text
//           {...common}
//           text={el.type === "nutrients" ? Object.entries(data.nutrients || {}).map(([k, v]) => `${k}: ${v}`).join("\n") : content}
//           width={el.width}
//           fontSize={el.fontSize}
//           fontStyle={el.fontStyle}
//           fill={el.fill || "#111"}
//         />
//       )}
//       {isSelected && <Transformer ref={trRef} rotateEnabled boundBoxFunc={(o, n) => (n.width < 20 ? o : n)} />}
//     </>
//   );
// }

// export default function BrandLabelEditor() {
//   const { labelId } = useParams();
//   const navigate = useNavigate();
//   const isNew = labelId === "new";

//   const [title, setTitle] = useState("Untitled label");
//   const [data, setData] = useState(EMPTY_DATA);
//   const [layout, setLayout] = useState(() => repackFlow(defaultLayout(), EMPTY_DATA));
//   const [nutrientRows, setNutrientRows] = useState([{ label: "", value: "" }]);
//   const [allergensText, setAllergensText] = useState("");
//   const [selectedId, setSelectedId] = useState(null);
//   const [compliance, setCompliance] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [savedLabelId, setSavedLabelId] = useState(isNew ? null : labelId);
//   const [draftDescription, setDraftDescription] = useState("");
//   const [generating, setGenerating] = useState(false);
//   const stageRef = useRef();
//   const fileInputRef = useRef();

//   useEffect(() => {
//     if (isNew) return;
//     api.getLabel(labelId).then((label) => {
//       setTitle(label.title);
//       setData(label.data);
//       setLayout(label.layout || repackFlow(defaultLayout(), label.data));
//       setAllergensText((label.data.allergens || []).join(", "));
//       const rows = Object.entries(label.data.nutrients || {}).map(([l, v]) => ({ label: l, value: v }));
//       setNutrientRows(rows.length ? rows : [{ label: "", value: "" }]);
//     }).catch((e) => setError(e.message));
//   }, [labelId, isNew]);

//   function currentData() {
//     const nutrients = Object.fromEntries(
//       nutrientRows.filter((r) => r.label.trim() && r.value.trim()).map((r) => [r.label.trim(), r.value.trim()])
//     );
//     const allergens = allergensText.split(",").map((a) => a.trim()).filter(Boolean);
//     return { ...data, nutrients, allergens };
//   }

//   async function handleGenerateDraft() {
//     if (!draftDescription.trim()) return;
//     setGenerating(true);
//     setError(null);
//     try {
//       const draft = await api.generateLabelDraft(draftDescription.trim());
//       const newData = { ...data, ...draft };
//       setData(newData);
//       setAllergensText((draft.allergens || []).join(", "));
//       const rows = Object.entries(draft.nutrients || {}).map(([l, v]) => ({ label: l, value: v }));
//       if (rows.length) setNutrientRows(rows);
//       // Auto-repack so newly-generated (or newly-emptied) content never
//       // leaves gaps or overlaps -- this is exactly what fixes the
//       // "[net_quantity]" / big-blank-space bug.
//       setLayout((prev) => repackFlow(prev, { ...newData, nutrients: Object.fromEntries(rows.map((r) => [r.label, r.value])) }));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setGenerating(false);
//     }
//   }

//   async function handleSave() {
//     setSaving(true);
//     setError(null);
//     try {
//       const payload = currentData();
//       let id = savedLabelId;
//       if (id) {
//         await api.updateLabel(id, payload, layout);
//       } else {
//         const label = await api.createLabel(title, payload, layout);
//         id = label.id;
//         setSavedLabelId(id);
//         navigate(`/brand/labels/${id}`, { replace: true });
//       }
//       const result = await api.checkLabelCompliance(id);
//       setCompliance(result);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   }

//   function updateElement(updated) {
//     setLayout((els) => els.map((e) => (e.id === updated.id ? updated : e)));
//   }

//   function addTextBox() {
//     const id = `free-${Date.now()}`;
//     setLayout((els) => [...els, { id, type: "text", text: "New text", x: 60, y: 60, width: 200, fontSize: 14, fill: "#111", rotation: 0 }]);
//     setSelectedId(id);
//   }

//   function addShape() {
//     const id = `free-${Date.now()}`;
//     setLayout((els) => [...els, { id, type: "rect", x: 60, y: 60, width: 150, height: 80, fill: "#e5ebe8", rotation: 0 }]);
//     setSelectedId(id);
//   }

//   async function handleImageUpload(e) {
//   const file = e.target.files?.[0];
//   if (!file) return;
//   e.target.value = "";

//   if (!savedLabelId) {
//     setError("Save the label at least once before adding an image.");
//     return;
//   }

//   setError(null);
//   try {
//     const asset = await api.uploadLabelAsset(savedLabelId, file);
//     const id = `free-${Date.now()}`;
//     setLayout((els) => [...els, { id, type: "image", src: asset.url, x: 60, y: 60, width: 120, height: 120, rotation: 0 }]);
//     setSelectedId(id);
//   } catch (err) {
//     setError(err.message);
//   }
// }

//   function deleteSelected() {
//     if (!selectedId) return;
//     setLayout((els) => els.filter((e) => e.id !== selectedId));
//     setSelectedId(null);
//   }

//   function updateSelectedFieldText(value) {
//     const el = layout.find((e) => e.id === selectedId);
//     if (!el) return;
//     if (el.field) setData((d) => ({ ...d, [el.field]: value }));
//     else updateElement({ ...el, text: value });
//   }

//   function downloadPng() {
//     if (!stageRef.current) return;
//     setSelectedId(null);
//     setTimeout(() => {
//       const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
//       const a = document.createElement("a");
//       a.href = uri;
//       a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
//       a.click();
//     }, 50);
//   }

//   const selectedEl = layout.find((e) => e.id === selectedId);
//   const liveData = currentData();

//   return (
//     <>
//       <TopBar title="Label editor" onBack={() => navigate("/brand/labels")} />
//       <ScreenContent>
//         <div className="mb-4 p-3 border border-border-tertiary rounded-app-lg bg-bg-secondary">
//           <label className="text-xs text-text-secondary block mb-1">
//             <IconSparkles size={13} className="inline mr-1 -mt-0.5" />
//             Generate a starting draft (optional — you review and edit everything before saving)
//           </label>
//           <div className="flex gap-2">
//             <input
//               value={draftDescription}
//               onChange={(e) => setDraftDescription(e.target.value)}
//               placeholder="e.g. Strawberry low-fat yogurt, 400g, refrigerated, by DairyBest"
//               className="flex-1 px-3 py-2 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary"
//             />
//             <ButtonOutline onClick={handleGenerateDraft} disabled={generating || !draftDescription.trim()}>
//               {generating ? "Generating…" : "Generate"}
//             </ButtonOutline>
//           </div>
//           <p className="text-[11px] text-text-tertiary mt-1">
//             Never auto-fills FSSAI license, manufacturer address, MRP, or batch number — those must be entered by you.
//           </p>
//         </div>

//         <div className="flex gap-2 mb-3">
//           <ButtonOutline onClick={addTextBox}>
//             <IconTypography size={14} className="inline mr-1 -mt-0.5" />
//             Add text
//           </ButtonOutline>
//           <ButtonOutline onClick={addShape}>
//             <IconSquare size={14} className="inline mr-1 -mt-0.5" />
//             Add shape
//           </ButtonOutline>
//           <ButtonOutline onClick={() => fileInputRef.current?.click()}>
//             <IconPhoto size={14} className="inline mr-1 -mt-0.5" />
//             Add image
//           </ButtonOutline>
//           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//           {selectedId && (
//             <ButtonOutline onClick={deleteSelected}>
//               <IconTrash size={14} className="inline mr-1 -mt-0.5" />
//               Delete selected
//             </ButtonOutline>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <div className="border border-border-tertiary rounded-app-lg overflow-hidden bg-white mb-2" style={{ width: 540, maxWidth: "100%" }}>
//               <Stage
//                 ref={stageRef}
//                 width={540}
//                 height={700}
//                 onMouseDown={(e) => {
//                   if (e.target === e.target.getStage()) setSelectedId(null);
//                 }}
//               >
//                 <Layer>
//                   <Rect x={0} y={0} width={540} height={700} fill="white" />
//                   {layout.map((el) => (
//                     <CanvasElement
//                       key={el.id}
//                       el={el}
//                       data={liveData}
//                       isSelected={el.id === selectedId}
//                       onSelect={setSelectedId}
//                       onChange={updateElement}
//                     />
//                   ))}
//                 </Layer>
//               </Stage>
//             </div>
//             <p className="text-[11px] text-text-tertiary mb-3">
//               Click an element to select, drag to move, use the corner handles to resize/rotate.
//             </p>

//             <div className="flex gap-2 mb-4">
//               <ButtonPrimary onClick={handleSave} disabled={saving}>
//                 {saving ? "Saving…" : "Save label"}
//               </ButtonPrimary>
//               <ButtonOutline onClick={downloadPng}>
//                 <IconDownload size={14} className="inline mr-1 -mt-0.5" />
//                 Download PNG (high-res)
//               </ButtonOutline>
//             </div>

//             {error && <p className="text-xs text-fail-text mb-3">{error}</p>}
//           </div>

//           <div>
//             <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
//               {selectedEl ? "Edit selected element" : "Select an element to edit its text"}
//             </p>

//             {selectedEl && selectedEl.type === "text" && selectedEl.field !== "allergens" && (
//               <textarea
//                 rows={selectedEl.field === "ingredients_list" || selectedEl.field === "manufacturer_address" ? 4 : 2}
//                 value={selectedEl.field ? (data[selectedEl.field] || "") : (selectedEl.text || "")}
//                 onChange={(e) => updateSelectedFieldText(e.target.value)}
//                 className={inputClass}
//               />
//             )}
//             {selectedEl && (selectedEl.type === "text") && (
//               <div className="flex gap-2 mb-3">
//                 <input
//                   type="number"
//                   value={selectedEl.fontSize}
//                   onChange={(e) => updateElement({ ...selectedEl, fontSize: Number(e.target.value) })}
//                   className="w-20 px-2 py-1.5 border border-border-tertiary rounded-app-md text-xs"
//                   title="Font size"
//                 />
//                 <input
//                   type="color"
//                   value={selectedEl.fill || "#111111"}
//                   onChange={(e) => updateElement({ ...selectedEl, fill: e.target.value })}
//                   className="w-10 h-8 border border-border-tertiary rounded-app-md"
//                   title="Text color"
//                 />
//               </div>
//             )}
//             {selectedEl && selectedEl.type === "rect" && (
//               <input
//                 type="color"
//                 value={selectedEl.fill || "#e5ebe8"}
//                 onChange={(e) => updateElement({ ...selectedEl, fill: e.target.value })}
//                 className="w-10 h-8 border border-border-tertiary rounded-app-md mb-3"
//                 title="Shape color"
//               />
//             )}
//             {selectedEl && selectedEl.type === "nutrients" && (
//               <div className="mb-3">
//                 {nutrientRows.map((row, i) => (
//                   <div key={i} className="flex gap-2 mb-2">
//                     <input
//                       value={row.label}
//                       onChange={(e) => setNutrientRows((rows) => rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
//                       placeholder="Nutrient"
//                       className="flex-1 px-2 py-1.5 border border-border-tertiary rounded-app-md text-xs"
//                     />
//                     <input
//                       value={row.value}
//                       onChange={(e) => setNutrientRows((rows) => rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
//                       placeholder="Value"
//                       className="w-20 px-2 py-1.5 border border-border-tertiary rounded-app-md text-xs"
//                     />
//                   </div>
//                 ))}
//                 <button onClick={() => setNutrientRows((r) => [...r, { label: "", value: "" }])} className="text-xs text-accent">
//                   + Add nutrient
//                 </button>
//               </div>
//             )}

//             <hr className="my-4 border-border-tertiary" />

//             <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">All fields</p>
//             <label className="text-xs text-text-secondary block mb-1">Label title (internal)</label>
//             <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
//             <label className="text-xs text-text-secondary block mb-1">Allergens (comma-separated)</label>
//             <input value={allergensText} onChange={(e) => setAllergensText(e.target.value)} className={inputClass} />
//             <label className="text-xs text-text-secondary block mb-1">Net quantity</label>
//             <input value={data.net_quantity} onChange={(e) => setData((d) => ({ ...d, net_quantity: e.target.value }))} className={inputClass} />
//             <label className="text-xs text-text-secondary block mb-1">MRP</label>
//             <input value={data.mrp} onChange={(e) => setData((d) => ({ ...d, mrp: e.target.value }))} className={inputClass} />
//             <label className="text-xs text-text-secondary block mb-1">Manufacturer address</label>
//             <textarea rows={2} value={data.manufacturer_address} onChange={(e) => setData((d) => ({ ...d, manufacturer_address: e.target.value }))} className={inputClass} />
//             <label className="text-xs text-text-secondary block mb-1">FSSAI license</label>
//             <input value={data.fssai_license} onChange={(e) => setData((d) => ({ ...d, fssai_license: e.target.value }))} className={inputClass} />

//             <ButtonOutline
//               onClick={() => setLayout((prev) => repackFlow(prev, currentData()))}
//             >
//               Re-flow layout
//             </ButtonOutline>
//             <ButtonOutline onClick={() => api.checkLabelCompliance(savedLabelId).then(setCompliance).catch((e) => setError(e.message))} disabled={!savedLabelId}>
//               Check compliance
//             </ButtonOutline>

//             {compliance && (
//               <div className="mt-4 space-y-2">
//                 {Object.entries(compliance).map(([code, result]) => (
//                   <div key={code} className="border border-border-tertiary rounded-app-md p-2">
//                     <div className="flex items-center justify-between">
//                       <p className="text-xs font-semibold text-text-primary">{result.country || code}</p>
//                       {result.status !== "RULES_INCOMPLETE" && (
//                         <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${result.status === "COMPLIANT" ? "bg-pass-bg text-pass-text" : "bg-fail-bg text-fail-text"}`}>
//                           {result.score_pct}%
//                         </span>
//                       )}
//                     </div>
//                     {result.status === "RULES_INCOMPLETE" ? (
//                       <p className="text-[10px] text-text-tertiary italic">{result.message}</p>
//                     ) : (
//                       result.field_checklist.filter((f) => !f.present).map((f) => (
//                         <p key={f.key} className="text-[10px] text-fail-text">✗ {f.label}</p>
//                       ))
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </ScreenContent>
//     </>
//   );
// }



import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer } from "react-konva";
import { IconDownload, IconSparkles, IconTypography, IconSquare, IconPhoto, IconTrash } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import { api } from "../../lib/api";
import CollapsibleSection from "../../components/CollapsibleSection";

const inputClass =
  "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-border-secondary";

const DEFAULT_ACCENT = "#957039";

const MARKETS = [
  { code: "FSSAI", label: "India (domestic)" },
  { code: "FDA", label: "United States" },
  { code: "EU_1169", label: "European Union" },
  { code: "UK_FSA", label: "United Kingdom" },
  { code: "CANADA_CFIA", label: "Canada" },
  { code: "AUSTRALIA_FSANZ", label: "Australia / NZ" },
  { code: "UAE_GCC", label: "UAE / GCC" },
  { code: "JAPAN_CAA", label: "Japan" },
  { code: "SINGAPORE_SFA", label: "Singapore" },
  { code: "CHINA_GB", label: "China" },
];

const EMPTY_DATA = {
  product_name: "", brand_name: "", ingredients_list: "", allergens: [],
  nutrients: {}, net_quantity: "", mrp: "", manufacturer_name: "",
  manufacturer_address: "", fssai_license: "",
  veg_status: "", date_of_manufacture: "", best_before_date: "",
  batch_number: "", country_of_origin: "", storage_conditions: "",
  quid: "", alcoholic_strength_abv: "",
};

// Vetted, deterministic templates. AI only chooses between these layouts;
// it never generates arbitrary canvas coordinates.
const TEMPLATES = {
  clean: {
    background: "#ffffff",
    build: (accent) => [
      { id: "el-1", type: "text", field: "product_name", x: 30, y: 30, width: 480, fontSize: 26, fontStyle: "bold", fill: "#111", rotation: 0 },
      { id: "el-2", type: "text", field: "brand_name", x: 30, y: 30, width: 480, fontSize: 14, fill: "#666", rotation: 0 },
      { id: "el-3", type: "rect", x: 30, y: 30, width: 480, height: 2, fill: "#ccc", rotation: 0 },
      { id: "el-4", type: "text", field: "ingredients_list", x: 30, y: 30, width: 480, fontSize: 12, fill: "#222", rotation: 0 },
      { id: "el-allergens", type: "text", field: "allergens", x: 30, y: 30, width: 480, fontSize: 12, fontStyle: "bold", fill: accent, rotation: 0 },
      { id: "el-5", type: "nutrients", field: "nutrients", x: 30, y: 30, width: 480, fontSize: 12, fill: "#111", rotation: 0 },
      { id: "el-6", type: "text", field: "net_quantity", x: 30, y: 30, width: 300, fontSize: 12, fill: "#111", rotation: 0 },
      { id: "el-extra", type: "text", field: "_extra_declarations", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
      { id: "el-7", type: "text", field: "manufacturer_name", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
      { id: "el-address", type: "text", field: "manufacturer_address", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
      { id: "el-license", type: "text", field: "fssai_license", x: 30, y: 30, width: 480, fontSize: 11, fill: "#555", rotation: 0 },
      
    ],
  },
  organic: {
    background: "#faf5ee",
    build: (accent) => [
      { id: "el-band", type: "rect", x: 0, y: 0, width: 540, height: 90, fill: accent, rotation: 0 },
      { id: "el-1", type: "text", field: "product_name", x: 30, y: 25, width: 480, fontSize: 24, fontStyle: "bold", fill: "#ffffff", rotation: 0 },
      { id: "el-2", type: "text", field: "brand_name", x: 30, y: 60, width: 480, fontSize: 13, fill: "#f0f0f0", rotation: 0 },
      { id: "el-3", type: "rect", x: 30, y: 110, width: 480, height: 1, fill: "#e1cdaf", rotation: 0 },
      { id: "el-4", type: "text", field: "ingredients_list", x: 30, y: 30, width: 480, fontSize: 12, fill: "#46341a", rotation: 0 },
      { id: "el-allergens", type: "text", field: "allergens", x: 30, y: 30, width: 480, fontSize: 12, fontStyle: "bold", fill: "#8a642a", rotation: 0 },
      { id: "el-5", type: "nutrients", field: "nutrients", x: 30, y: 30, width: 480, fontSize: 12, fill: "#46341a", rotation: 0 },
      { id: "el-6", type: "text", field: "net_quantity", x: 30, y: 30, width: 300, fontSize: 12, fill: "#46341a", rotation: 0 },
      { id: "el-extra", type: "text", field: "_extra_declarations", x: 30, y: 30, width: 480, fontSize: 11, fill: "#896734", rotation: 0 },
      { id: "el-7", type: "text", field: "manufacturer_name", x: 30, y: 30, width: 480, fontSize: 11, fill: "#896734", rotation: 0 },
      { id: "el-address", type: "text", field: "manufacturer_address", x: 30, y: 30, width: 480, fontSize: 11, fill: "#896734", rotation: 0 },
      { id: "el-license", type: "text", field: "fssai_license", x: 30, y: 30, width: 480, fontSize: 11, fill: "#896734", rotation: 0 },
    ],
  },
  premium: {
    background: "#1c1a18",
    build: (accent) => [
      { id: "el-1", type: "text", field: "product_name", x: 30, y: 30, width: 480, fontSize: 28, fontStyle: "bold", fill: accent, rotation: 0 },
      { id: "el-2", type: "text", field: "brand_name", x: 30, y: 30, width: 480, fontSize: 13, fill: "#d4cfca", rotation: 0 },
      { id: "el-3", type: "rect", x: 30, y: 30, width: 480, height: 1, fill: accent, rotation: 0 },
      { id: "el-4", type: "text", field: "ingredients_list", x: 30, y: 30, width: 480, fontSize: 12, fill: "#eae8e6", rotation: 0 },
      { id: "el-allergens", type: "text", field: "allergens", x: 30, y: 30, width: 480, fontSize: 12, fontStyle: "bold", fill: "#e08e8a", rotation: 0 },
      { id: "el-5", type: "nutrients", field: "nutrients", x: 30, y: 30, width: 480, fontSize: 12, fill: "#eae8e6", rotation: 0 },
      { id: "el-6", type: "text", field: "net_quantity", x: 30, y: 30, width: 300, fontSize: 12, fill: "#eae8e6", rotation: 0 },
      { id: "el-extra", type: "text", field: "_extra_declarations", x: 30, y: 30, width: 480, fontSize: 11, fill: "#999", rotation: 0 },
      { id: "el-7", type: "text", field: "manufacturer_name", x: 30, y: 30, width: 480, fontSize: 11, fill: "#999", rotation: 0 },
      { id: "el-address", type: "text", field: "manufacturer_address", x: 30, y: 30, width: 480, fontSize: 11, fill: "#999", rotation: 0 },
      { id: "el-license", type: "text", field: "fssai_license", x: 30, y: 30, width: 480, fontSize: 11, fill: "#999", rotation: 0 },
    ],
  },
};

const FLOW_ORDER = ["el-1", "el-2", "el-3", "el-4", "el-allergens", "el-5", "el-6", "el-extra", "el-7", "el-address", "el-license"];
const FIXED_HEADER_IDS = new Set(["el-band"]);

// Estimates rendered height for a flow element given current data, so
// repack can stack elements with no gaps and no overlap regardless of
// content length. Rough (character-count based), not pixel-perfect --
// good enough for layout flow, not a typesetting engine.
function estimateHeight(el, data) {
  if (el.type === "rect") return el.height + 20;
  if (el.type === "nutrients") {
    const count = Object.keys(data.nutrients || {}).length;
    return count > 0 ? 30 + 22 * count + 20 : 0;
  }
  let content = "";
  if (el.field === "allergens") {
    content = (data.allergens || []).length ? `Contains: ${data.allergens.join(", ")}` : "";
  } else if (el.field === "_extra_declarations") {
    content = [
      data.veg_status ? (data.veg_status === "VEG" ? "● VEG" : "● NON-VEG") : "",
      data.date_of_manufacture ? `Mfg: ${data.date_of_manufacture}` : "",
      data.best_before_date ? `Best before: ${data.best_before_date}` : "",
      data.batch_number ? `Batch: ${data.batch_number}` : "",
      data.country_of_origin ? `Origin: ${data.country_of_origin}` : "",
      data.storage_conditions,
    ].filter(Boolean).join(" · ");
  } else {
    content = String(data[el.field] || "");
  }
  if (!content) return 0;
  const charsPerLine = Math.floor(el.width / (el.fontSize * 0.55));
  const lines = Math.max(1, Math.ceil(content.length / charsPerLine));
  return lines * (el.fontSize * 1.3) + 14;
}

function repackFlow(layout, data, template = "clean") {
  let y = template === "organic" ? 130 : 30;
  const byId = Object.fromEntries(layout.map((e) => [e.id, e]));
  const flowIds = new Set(FLOW_ORDER);
  const updated = layout.map((el) => {
    if (!flowIds.has(el.id) && !FIXED_HEADER_IDS.has(el.id)) return el;
    return el;
  });

  FLOW_ORDER.forEach((id) => {
    const el = byId[id];
    if (!el) return;

    // Organic template keeps the product name and brand inside its fixed header.
    if (template === "organic" && (id === "el-1" || id === "el-2")) return;

    const h = estimateHeight(el, data);
    if (h === 0) return;
    el.y = y;
    y += h;
  });

  return updated;
}

function useLoadedImage(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!src) return;
    const image = new window.Image();
    image.crossOrigin = "anonymous"; // needed so canvas.toDataURL() doesn't taint on export
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    image.src = src.startsWith("http") ? src : `${base}${src}`;
    image.onload = () => setImg(image);
  }, [src]);
  return img;
}

function CanvasElement({ el, data, isSelected, onSelect, onChange }) {
  const shapeRef = useRef();
  const trRef = useRef();
  const loadedImg = useLoadedImage(el.type === "image" ? el.src : null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  let content = "";
  if (el.type === "text") {
    if (el.field === "allergens") {
      content = (data.allergens || []).length ? `Contains: ${data.allergens.join(", ")}` : "";
    } else if (el.field === "_extra_declarations") {
      content = [
        data.veg_status ? (data.veg_status === "VEG" ? "● VEG" : "● NON-VEG") : "",
        data.date_of_manufacture ? `Mfg: ${data.date_of_manufacture}` : "",
        data.best_before_date ? `Best before: ${data.best_before_date}` : "",
        data.batch_number ? `Batch: ${data.batch_number}` : "",
        data.country_of_origin ? `Origin: ${data.country_of_origin}` : "",
        data.storage_conditions,
      ].filter(Boolean).join(" · ");
    } else {
      content = el.field ? String(data[el.field] || "") : el.text || "";
    }
    if (!content) return null;
  }

  const common = {
    ref: shapeRef,
    x: el.x, y: el.y, rotation: el.rotation || 0,
    draggable: true,
    onClick: () => onSelect(el.id),
    onTap: () => onSelect(el.id),
    onDragEnd: (e) => onChange({ ...el, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...el,
        x: node.x(), y: node.y(), rotation: node.rotation(),
        width: Math.max(20, el.width * scaleX),
        height: el.height ? Math.max(2, el.height * scaleY) : undefined,
        fontSize: el.type === "text" ? Math.max(6, (el.fontSize || 12) * scaleY) : el.fontSize,
      });
    },
  };

  return (
    <>
      {el.type === "rect" && <Rect {...common} width={el.width} height={el.height} fill={el.fill} />}
      {el.type === "image" && loadedImg && <KonvaImage {...common} image={loadedImg} width={el.width} height={el.height} />}
      {(el.type === "text" || el.type === "nutrients") && (
        <Text
          {...common}
          text={el.type === "nutrients" ? Object.entries(data.nutrients || {}).map(([k, v]) => `${k}: ${v}`).join("\n") : content}
          width={el.width}
          fontSize={el.fontSize}
          fontStyle={el.fontStyle}
          fontFamily={el.fontFamily || "Inter"}
          align={el.align || "left"}
          lineHeight={el.lineHeight || 1.2}
          letterSpacing={el.letterSpacing || 0}
          fill={el.fill || "#111"}
        />
      )}
      {isSelected && <Transformer ref={trRef} rotateEnabled boundBoxFunc={(o, n) => (n.width < 20 ? o : n)} />}
    </>
  );
}

const FONT_OPTIONS = ["Inter", "Poppins", "Montserrat", "Roboto", "Arial"];

// Load the professional UI/label fonts before Konva renders text.
function useLabelFonts() {
  useEffect(() => {
    const href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap";

    const existing = document.querySelector('link[data-label-fonts="true"]');
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.labelFonts = "true";
      document.head.appendChild(link);
    }

    // Ask the browser to load Inter before Konva measures/renders the text.
    if (document.fonts?.load) {
      Promise.all([
        document.fonts.load('400 14px "Inter"'),
        document.fonts.load('600 14px "Inter"'),
        document.fonts.load('700 14px "Inter"'),
      ]).catch(() => {});
    }
  }, []);
}

export default function BrandLabelEditor() {
  useLabelFonts();

  const { labelId } = useParams();
  const navigate = useNavigate();
  const isNew = labelId === "new";

  const [title, setTitle] = useState("Untitled label");
  const [data, setData] = useState(EMPTY_DATA);
  const [activeTemplate, setActiveTemplate] = useState("clean");
  const [background, setBackground] = useState("#ffffff");
  const [layout, setLayout] = useState(() => repackFlow(TEMPLATES.clean.build(DEFAULT_ACCENT), EMPTY_DATA, "clean"));
  const [nutrientRows, setNutrientRows] = useState([{ label: "", value: "" }]);
  const [allergensText, setAllergensText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedLabelId, setSavedLabelId] = useState(isNew ? null : labelId);
  const [draftDescription, setDraftDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isExport, setIsExport] = useState(false);
  const [targetMarkets, setTargetMarkets] = useState(["FSSAI"]);
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const stageRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    if (isNew) return;
    api.getLabel(labelId).then((label) => {
      setTitle(label.title);
      setData({ ...EMPTY_DATA, ...label.data });
      setLayout(label.layout || repackFlow(TEMPLATES.clean.build(DEFAULT_ACCENT), label.data, "clean"));
      setAllergensText((label.data.allergens || []).join(", "));
      const rows = Object.entries(label.data.nutrients || {}).map(([l, v]) => ({ label: l, value: v }));
      setNutrientRows(rows.length ? rows : [{ label: "", value: "" }]);
    }).catch((e) => setError(e.message));
  }, [labelId, isNew]);

  function currentData() {
    const nutrients = Object.fromEntries(
      nutrientRows.filter((r) => r.label.trim() && r.value.trim()).map((r) => [r.label.trim(), r.value.trim()])
    );
    const allergens = allergensText.split(",").map((a) => a.trim()).filter(Boolean);
    return { ...data, nutrients, allergens };
  }

  async function handleGenerateDraft() {
    if (!draftDescription.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const draft = await api.generateLabelDraft(draftDescription.trim());
      const newData = { ...data, ...draft };
      setData(newData);
      setAllergensText((draft.allergens || []).join(", "));
      const rows = Object.entries(draft.nutrients || {}).map(([l, v]) => ({ label: l, value: v }));
      if (rows.length) setNutrientRows(rows);
      if (title === "Untitled label" && draft.product_name) setTitle(draft.product_name);
      const templateKey = TEMPLATES[draft.recommended_template] ? draft.recommended_template : "clean";
      const accent = draft.accent_color || DEFAULT_ACCENT;
      setActiveTemplate(templateKey);
      setBackground(TEMPLATES[templateKey].background);
      const newLayout = TEMPLATES[templateKey].build(accent);
      setLayout(repackFlow(newLayout, { ...newData, nutrients: Object.fromEntries(rows.map((r) => [r.label, r.value])) }, templateKey));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = currentData();
      let id = savedLabelId;
      if (id) {
        await api.updateLabel(id, payload, layout);
      } else {
        const label = await api.createLabel(title, payload, layout);
        id = label.id;
        setSavedLabelId(id);
        navigate(`/brand/labels/${id}`, { replace: true });
      }
      const result = await api.checkLabelCompliance(id);
      setCompliance(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateElement(updated) {
    setLayout((els) => els.map((e) => (e.id === updated.id ? updated : e)));
  }

  function addTextBox() {
    const id = `free-${Date.now()}`;
    setLayout((els) => [...els, { id, type: "text", text: "New text", x: 60, y: 60, width: 200, fontSize: 14, fill: "#111", fontFamily: "Inter", align: "left", lineHeight: 1.2, letterSpacing: 0, rotation: 0 }]);
    setSelectedId(id);
  }

  function addShape() {
    const id = `free-${Date.now()}`;
    setLayout((els) => [...els, { id, type: "rect", x: 60, y: 60, width: 150, height: 80, fill: "#e5ebe8", rotation: 0 }]);
    setSelectedId(id);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!savedLabelId) {
      setError("Save the label at least once before adding an image.");
      return;
    }
    setError(null);
    try {
      const asset = await api.uploadLabelAsset(savedLabelId, file);
      const id = `free-${Date.now()}`;
      setLayout((els) => [...els, { id, type: "image", src: asset.url, x: 60, y: 60, width: 120, height: 120, rotation: 0 }]);
      setSelectedId(id);
    } catch (err) {
      setError(err.message);
    }
  }

  function deleteSelected() {
    if (!selectedId) return;
    setLayout((els) => els.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  }

  function deleteLayer(id) {
    setLayout((els) => els.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Konva draws array order back-to-front, so moving an element later in
  // the array visually brings it forward -- this IS z-ordering, not a
  // separate concept needing its own field.
  function moveLayer(id, direction) {
    setLayout((els) => {
      const index = els.findIndex((e) => e.id === id);
      const swapWith = direction === "up" ? index + 1 : index - 1;
      if (swapWith < 0 || swapWith >= els.length) return els;
      const copy = [...els];
      [copy[index], copy[swapWith]] = [copy[swapWith], copy[index]];
      return copy;
    });
  }

  function updateSelectedFieldText(value) {
    const el = layout.find((e) => e.id === selectedId);
    if (!el) return;
    if (el.field) setData((d) => ({ ...d, [el.field]: value }));
    else updateElement({ ...el, text: value });
  }

  function downloadPng() {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
      const a = document.createElement("a");
      a.href = uri;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    }, 50);
  }

  function layerLabel(el) {
    if (el.field) return el.field.replace(/_/g, " ");
    if (el.type === "rect") return "Shape";
    if (el.type === "image") return "Image";
    return el.text ? el.text.slice(0, 20) : "Text";
  }

  const selectedEl = layout.find((e) => e.id === selectedId);
  const liveData = currentData();

  return (
    <>
      <TopBar
        title="Label editor"
        onBack={() => navigate("/brand/labels")}
        right={
          <div className="flex gap-2">
            <ButtonOutline className="!w-auto !mt-0" onClick={() => setPreviewMode((p) => !p)}>
              {previewMode ? "Exit preview" : "Preview"}
            </ButtonOutline>
            <ButtonPrimary className="!w-auto !mt-0" onClick={downloadPng}>
              <IconDownload size={14} className="inline mr-1 -mt-0.5" />
              Export
            </ButtonPrimary>
          </div>
        }
      />
      <ScreenContent>
        {!previewMode && (
          <>
            <div className="mb-4 p-3 border border-border-tertiary rounded-app-lg">
              <label className="text-xs text-text-secondary block mb-2">Is this product for export?</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setIsExport(false); setTargetMarkets(["FSSAI"]); }}
                  className={`text-xs px-3 py-1.5 rounded-full border ${!isExport ? "bg-accent text-accent-bg border-accent" : "bg-bg-primary text-text-secondary border-border-tertiary"}`}
                >
                  Domestic only (India)
                </button>
                <button
                  type="button"
                  onClick={() => setIsExport(true)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${isExport ? "bg-accent text-accent-bg border-accent" : "bg-bg-primary text-text-secondary border-border-tertiary"}`}
                >
                  Export
                </button>
              </div>
              {isExport && (
                <div className="flex flex-wrap gap-2">
                  {MARKETS.map((market) => (
                    <button
                      type="button"
                      key={market.code}
                      onClick={() => setTargetMarkets((prev) => (prev.includes(market.code) ? prev.filter((c) => c !== market.code) : [...prev, market.code]))}
                      className={`text-xs px-2.5 py-1 rounded-full border ${targetMarkets.includes(market.code) ? "bg-accent text-accent-bg border-accent" : "bg-bg-primary text-text-secondary border-border-tertiary"}`}
                    >
                      {market.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4 p-3 border border-border-tertiary rounded-app-lg bg-bg-secondary">
              <label className="text-xs text-text-secondary block mb-1">
                <IconSparkles size={13} className="inline mr-1 -mt-0.5" />
                Generate a starting draft (optional — you review and edit everything before saving)
              </label>
              <div className="flex gap-2">
                <input
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="e.g. Strawberry low-fat yogurt, 400g, refrigerated, by DairyBest"
                  className="form-input flex-1"
                />
                <ButtonOutline className="!w-auto !mt-0" onClick={handleGenerateDraft} disabled={generating || !draftDescription.trim()}>
                  {generating ? "Generating…" : "Generate"}
                </ButtonOutline>
              </div>
              <p className="text-[11px] text-text-tertiary mt-1">
                Never auto-fills FSSAI license, manufacturer address, MRP, or batch number — those must be entered by you.
              </p>
            </div>

            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex gap-2">
                <ButtonOutline className="!w-auto !mt-0" onClick={addTextBox}>
                  <IconTypography size={14} className="inline mr-1 -mt-0.5" />
                  Add text
                </ButtonOutline>
                <ButtonOutline className="!w-auto !mt-0" onClick={addShape}>
                  <IconSquare size={14} className="inline mr-1 -mt-0.5" />
                  Add shape
                </ButtonOutline>
                <ButtonOutline className="!w-auto !mt-0" onClick={() => fileInputRef.current?.click()}>
                  <IconPhoto size={14} className="inline mr-1 -mt-0.5" />
                  Add image
                </ButtonOutline>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {selectedId && (
                  <ButtonOutline className="!w-auto !mt-0" onClick={deleteSelected}>
                    <IconTrash size={14} className="inline mr-1 -mt-0.5" />
                    Delete selected
                  </ButtonOutline>
                )}
              </div>

              <div className="flex items-center gap-1 border border-border-tertiary rounded-app-md px-1">
                <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary">−</button>
                <span className="text-xs text-text-secondary w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary">+</button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {Object.keys(TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTemplate(key);
                    setBackground(TEMPLATES[key].background);
                    const newLayout = TEMPLATES[key].build(DEFAULT_ACCENT);
                    setLayout(repackFlow(newLayout, liveData, key));
                    setSelectedId(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border capitalize ${activeTemplate === key ? "bg-text-primary text-white border-text-primary" : "bg-bg-primary text-text-secondary border-border-tertiary"}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className="border border-border-tertiary rounded-app-lg overflow-auto bg-bg-secondary mb-2 flex justify-center p-4"
              style={{ maxHeight: 780 }}
            >
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 150ms ease" }}>
                <div className="shadow-[var(--shadow-elevated)]" style={{ width: 540 }}>
                  <Stage
                    ref={stageRef}
                    width={540}
                    height={700}
                    onMouseDown={(e) => {
                      if (e.target === e.target.getStage()) setSelectedId(null);
                    }}
                  >
                    <Layer>
                      <Rect x={0} y={0} width={540} height={700} fill={background} />
                      {layout.map((el) => (
                        <CanvasElement
                          key={el.id}
                          el={el}
                          data={liveData}
                          isSelected={!previewMode && el.id === selectedId}
                          onSelect={previewMode ? () => {} : setSelectedId}
                          onChange={updateElement}
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
            {!previewMode && (
              <p className="text-[11px] text-text-tertiary mb-3">
                Click an element to select, drag to move, use the corner handles to resize/rotate.
              </p>
            )}

            {!previewMode && (
              <div className="flex gap-2 mb-4">
                <ButtonPrimary onClick={handleSave} className="!w-auto !mt-0 px-5" disabled={saving}>
                  {saving ? "Saving…" : "Save label"}
                </ButtonPrimary>
              </div>
            )}

            {error && <p className="text-xs text-fail-text mb-3">{error}</p>}
          </div>

          {!previewMode && (
            <div>
              <CollapsibleSection title="Text properties" defaultOpen>
                {!selectedEl && <p className="text-xs text-text-tertiary">Select an element on the canvas to edit it.</p>}

                {selectedEl && selectedEl.type === "text" && selectedEl.field !== "allergens" && (
                  <>
                    <label className="text-xs text-text-secondary block mb-1">Text content</label>
                    <textarea
                      rows={selectedEl.field === "ingredients_list" || selectedEl.field === "manufacturer_address" ? 4 : 2}
                      value={selectedEl.field ? (data[selectedEl.field] || "") : (selectedEl.text || "")}
                      onChange={(e) => updateSelectedFieldText(e.target.value)}
                      className="form-input mb-3"
                    />
                  </>
                )}

                {selectedEl && selectedEl.type === "text" && (
                  <>
                    <label className="text-xs text-text-secondary block mb-1">Font</label>
                    <select
                      value={selectedEl.fontFamily || "Inter"}
                      onChange={(e) => updateElement({ ...selectedEl, fontFamily: e.target.value })}
                      className="form-input mb-3"
                    >
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="text-xs text-text-secondary block mb-1">Size</label>
                        <input
                          type="number"
                          value={selectedEl.fontSize}
                          onChange={(e) => updateElement({ ...selectedEl, fontSize: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary block mb-1">Weight</label>
                        <select
                          value={selectedEl.fontStyle || "normal"}
                          onChange={(e) => updateElement({ ...selectedEl, fontStyle: e.target.value })}
                          className="form-input"
                        >
                          <option value="normal">Regular</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </div>

                    <label className="text-xs text-text-secondary block mb-1">Color</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="color"
                        value={selectedEl.fill || "#111111"}
                        onChange={(e) => updateElement({ ...selectedEl, fill: e.target.value })}
                        className="w-10 h-9 border border-border-tertiary rounded-app-md"
                      />
                      <input
                        value={selectedEl.fill || "#111111"}
                        onChange={(e) => updateElement({ ...selectedEl, fill: e.target.value })}
                        className="form-input flex-1"
                      />
                    </div>

                    <label className="text-xs text-text-secondary block mb-1">Alignment</label>
                    <div className="flex gap-1 mb-3">
                      {["left", "center", "right", "justify"].map((a) => (
                        <button
                          key={a}
                          onClick={() => updateElement({ ...selectedEl, align: a })}
                          className={`flex-1 h-8 rounded-app-md border text-xs capitalize ${
                            (selectedEl.align || "left") === a ? "bg-accent text-white border-accent" : "border-border-tertiary text-text-secondary"
                          }`}
                        >
                          {a[0].toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <label className="text-xs text-text-secondary block mb-1">Spacing</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-text-tertiary block mb-1">Line height</label>
                        <input
                          type="number" step="0.1"
                          value={selectedEl.lineHeight || 1.2}
                          onChange={(e) => updateElement({ ...selectedEl, lineHeight: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-tertiary block mb-1">Letter spacing</label>
                        <input
                          type="number"
                          value={selectedEl.letterSpacing || 0}
                          onChange={(e) => updateElement({ ...selectedEl, letterSpacing: Number(e.target.value) })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedEl && selectedEl.type === "rect" && (
                  <>
                    <label className="text-xs text-text-secondary block mb-1">Shape color</label>
                    <input
                      type="color"
                      value={selectedEl.fill || "#e5ebe8"}
                      onChange={(e) => updateElement({ ...selectedEl, fill: e.target.value })}
                      className="w-10 h-9 border border-border-tertiary rounded-app-md"
                    />
                  </>
                )}

                {selectedEl && selectedEl.type === "nutrients" && (
                  <div>
                    {nutrientRows.map((row, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          value={row.label}
                          onChange={(e) => setNutrientRows((rows) => rows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
                          placeholder="Nutrient"
                          className="form-input flex-1"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => setNutrientRows((rows) => rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))}
                          placeholder="Value"
                          className="form-input w-20"
                        />
                      </div>
                    ))}
                    <button onClick={() => setNutrientRows((r) => [...r, { label: "", value: "" }])} className="text-xs text-accent">
                      + Add nutrient
                    </button>
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Background properties">
                <label className="text-xs text-text-secondary block mb-1">Canvas background</label>
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-10 h-9 border border-border-tertiary rounded-app-md"
                />
              </CollapsibleSection>

              <CollapsibleSection title="Element layers">
                {layout.length === 0 && <p className="text-xs text-text-tertiary">No elements yet.</p>}
                {[...layout].reverse().map((el) => (
                  <div
                    key={el.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-app-md mb-1 cursor-pointer ${selectedId === el.id ? "bg-accent-bg" : "hover:bg-bg-secondary"}`}
                    onClick={() => setSelectedId(el.id)}
                  >
                    <span className="text-xs text-text-primary truncate capitalize">{layerLabel(el)}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, "up"); }} className="text-text-tertiary hover:text-text-primary text-xs px-1">↑</button>
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, "down"); }} className="text-text-tertiary hover:text-text-primary text-xs px-1">↓</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteLayer(el.id); }} className="text-fail-text hover:text-fail-text text-xs px-1">✕</button>
                    </div>
                  </div>
                ))}
              </CollapsibleSection>

              <div className="mt-4">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">All fields</p>
                <label className="text-xs text-text-secondary block mb-1">Label title (internal)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Allergens (comma-separated)</label>
                <input value={allergensText} onChange={(e) => setAllergensText(e.target.value)} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Net quantity</label>
                <input value={data.net_quantity} onChange={(e) => setData((d) => ({ ...d, net_quantity: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">MRP</label>
                <input value={data.mrp} onChange={(e) => setData((d) => ({ ...d, mrp: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Manufacturer address</label>
                <textarea rows={2} value={data.manufacturer_address} onChange={(e) => setData((d) => ({ ...d, manufacturer_address: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">FSSAI license</label>
                <input value={data.fssai_license} onChange={(e) => setData((d) => ({ ...d, fssai_license: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Veg / Non-veg</label>
                <select value={data.veg_status} onChange={(e) => setData((d) => ({ ...d, veg_status: e.target.value }))} className="form-input mb-3">
                  <option value="">Not specified</option>
                  <option value="VEG">Veg</option>
                  <option value="NON_VEG">Non-veg</option>
                </select>
                <label className="text-xs text-text-secondary block mb-1">Date of manufacture (must be entered by you)</label>
                <input type="date" value={data.date_of_manufacture} onChange={(e) => setData((d) => ({ ...d, date_of_manufacture: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Best before / use by (must be entered by you)</label>
                <input type="date" value={data.best_before_date} onChange={(e) => setData((d) => ({ ...d, best_before_date: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Batch/lot number (must be entered by you)</label>
                <input value={data.batch_number} onChange={(e) => setData((d) => ({ ...d, batch_number: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Country of origin (must be entered by you)</label>
                <input value={data.country_of_origin} onChange={(e) => setData((d) => ({ ...d, country_of_origin: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Storage conditions</label>
                <input value={data.storage_conditions} onChange={(e) => setData((d) => ({ ...d, storage_conditions: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">QUID (EU only, if applicable)</label>
                <input value={data.quid} onChange={(e) => setData((d) => ({ ...d, quid: e.target.value }))} className="form-input mb-3" />
                <label className="text-xs text-text-secondary block mb-1">Alcoholic strength % ABV (if applicable)</label>
                <input value={data.alcoholic_strength_abv} onChange={(e) => setData((d) => ({ ...d, alcoholic_strength_abv: e.target.value }))} className="form-input mb-3" />

                <ButtonOutline className="!w-auto !mt-0" onClick={() => setLayout((prev) => repackFlow(prev, currentData(), activeTemplate))}>
                  Re-flow layout
                </ButtonOutline>
                <ButtonOutline className="!w-auto !mt-0" onClick={() => api.checkLabelCompliance(savedLabelId).then(setCompliance).catch((e) => setError(e.message))} disabled={!savedLabelId}>
                  Check compliance
                </ButtonOutline>

                {compliance && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(compliance).map(([code, result]) => (
                      <div key={code} className="border border-border-tertiary rounded-app-md p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-text-primary">{result.country || code}</p>
                          {result.status !== "RULES_INCOMPLETE" && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${result.status === "COMPLIANT" ? "bg-pass-bg text-pass-text" : "bg-fail-bg text-fail-text"}`}>
                              {result.score_pct}%
                            </span>
                          )}
                        </div>
                        {result.status === "RULES_INCOMPLETE" ? (
                          <p className="text-[10px] text-text-tertiary italic">{result.message}</p>
                        ) : (
                          result.field_checklist.filter((f) => !f.present).map((f) => (
                            <p key={f.key} className="text-[10px] text-fail-text">✗ {f.label}</p>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScreenContent>
    </>
  );
}