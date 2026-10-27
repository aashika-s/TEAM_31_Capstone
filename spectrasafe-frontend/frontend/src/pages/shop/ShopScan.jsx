// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconCamera, IconUpload } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import { ButtonPrimary, ButtonOutline } from "../../components/Button";
// import { api } from "../../lib/api";

// export default function ShopScan() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [location, setLocation] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   function handleFileChange(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     setFile(f);
//     setError(null);
//     setPreviewUrl(URL.createObjectURL(f));
//   }

//   async function handleAnalyze() {
//     if (!file || !location.trim()) return;
//     setSubmitting(true);
//     setError(null);
//     try {
//       // This is the real call -- runs the actual YOLO + OCR ensemble +
//       // compliance engine + registry verification on the backend. Expect
//       // this to take several seconds (model inference, not a network lag).
//       const scan = await api.createScan(file, location.trim());
//       navigate(`/shop/result/${scan.id}`);
//     } catch (err) {
//       setError(err.message);
//       setSubmitting(false);
//     }
//   }

//   return (
//     <>
//       <TopBar title="Scan a label" onBack={() => navigate("/shop")} />
//       <ScreenContent>
//         {!previewUrl && (
//           <div
//             onClick={() => fileInputRef.current?.click()}
//             className="border-[1.5px] border-dashed border-border-secondary rounded-app-lg py-10 px-4 text-center text-text-secondary mb-3 cursor-pointer"
//           >
//             <IconCamera size={36} className="text-accent mx-auto mb-2" />
//             <p className="text-sm font-medium text-text-primary mb-1">Take or upload a photo</p>
//             <p className="text-[13px]">Point at the ingredients or nutrition panel</p>
//           </div>
//         )}

//         {previewUrl && (
//           <img src={previewUrl} alt="Selected label" className="w-full rounded-app-lg mb-3 border border-border-tertiary" />
//         )}

//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/jpeg,image/jpg,image/png"
//           capture="environment"
//           onChange={handleFileChange}
//           className="hidden"
//         />

//         <input
//           type="text"
//           value={location}
//           onChange={(e) => setLocation(e.target.value)}
//           placeholder="Shop location (e.g. Koramangala, Bengaluru)"
//           className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm mb-3 bg-bg-primary text-text-primary"
//         />

//         {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//         {!previewUrl && (
//           <ButtonOutline onClick={() => fileInputRef.current?.click()}>
//             <IconUpload size={14} className="inline mr-1 -mt-0.5" />
//             Choose a photo
//           </ButtonOutline>
//         )}

//         {previewUrl && (
//           <>
//             <ButtonPrimary onClick={handleAnalyze} disabled={submitting}>
//               {submitting ? "Analyzing… (this can take a bit)" : "Analyze label"}
//             </ButtonPrimary>
//             <ButtonOutline
//               onClick={() => {
//                 setFile(null);
//                 setPreviewUrl(null);
//                 setError(null);
//               }}
//               disabled={submitting}
//             >
//               Choose a different photo
//             </ButtonOutline>
//           </>
//         )}
//       </ScreenContent>
//     </>
//   );
// }





















// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   IconCamera,
//   IconUpload,
//   IconMapPin,
//   IconShieldCheck,
//   IconArrowLeft,
//   IconX,
//   IconSparkles,
// } from "@tabler/icons-react";

// import { api } from "../../lib/api";

// export default function ShopScan() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [location, setLocation] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   function handleFileChange(e) {
//     const f = e.target.files?.[0];

//     if (!f) return;

//     setFile(f);
//     setError(null);

//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     setPreviewUrl(URL.createObjectURL(f));
//   }

//   function resetFile() {
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     setFile(null);
//     setPreviewUrl(null);
//     setError(null);

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }

//   async function handleAnalyze() {
//     if (!file || !location.trim()) {
//       setError("Please select a label image and enter your shop location.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       const scan = await api.createScan(
//         file,
//         location.trim()
//       );

//       navigate(`/shop/result/${scan.id}`);
//     } catch (err) {
//       setError(err.message);
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">

//       {/* =====================================================
//           SUBTLE BACKGROUND
//       ====================================================== */}

//       <div
//         className="
//           absolute
//           top-0
//           right-0
//           w-[520px]
//           h-[420px]
//           pointer-events-none
//           opacity-[0.045]
//         "
//       >
//         <img
//           src="/spectrasafe-india-bg.png"
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
//           CONTENT
//       ====================================================== */}

//       <div
//         className="
//           relative
//           max-w-[1050px]
//           mx-auto
//           px-5
//           sm:px-8
//           lg:px-10
//           pt-7
//           pb-12
//         "
//       >

//         {/* ===================================================
//             BACK
//         ==================================================== */}

//         <button
//           type="button"
//           onClick={() => navigate("/shop")}
//           className="
//             inline-flex
//             items-center
//             gap-2
//             text-xs
//             font-medium
//             text-[#82786d]
//             hover:text-[#38ca86]
//             transition-colors
//             mb-6
//           "
//         >
//           <IconArrowLeft size={15} />
//           Back to dashboard
//         </button>


//         {/* ===================================================
//             HEADER
//         ==================================================== */}

//         <div className="mb-7">

//           <div
//             className="
//               inline-flex
//               items-center
//               gap-2
//               px-2.5
//               py-1
//               rounded-full
//               bg-[#f1fcf7]
//               text-[#38ca86]
//               text-[10px]
//               font-semibold
//               mb-3
//             "
//           >
//             <IconSparkles size={12} />
//             PRODUCT VERIFICATION
//           </div>

//           <h1
//             className="
//               text-[28px]
//               sm:text-[32px]
//               leading-tight
//               tracking-[-0.035em]
//               font-semibold
//               text-[#17251e]
//             "
//           >
//             Scan a product label
//           </h1>

//           <p
//             className="
//               text-sm
//               text-[#867c70]
//               mt-2
//               max-w-[620px]
//             "
//           >
//             Capture the product label clearly and SpectraSafe
//             will analyze it for safety and compliance.
//           </p>

//         </div>


//         {/* ===================================================
//             MAIN GRID
//         ==================================================== */}

//         <div
//           className="
//             grid
//             grid-cols-1
//             lg:grid-cols-[1.35fr_0.65fr]
//             gap-6
//             items-start
//           "
//         >

//           {/* =================================================
//               LEFT — SCAN AREA
//           ================================================== */}

//           <div
//             className="
//               bg-white
//               border
//               border-[#e7edea]
//               rounded-2xl
//               p-5
//               sm:p-7
//               shadow-[0_6px_24px_rgba(20,22,26,0.035)]
//             "
//           >

//             <div className="flex items-center justify-between mb-5">

//               <div>

//                 <h2 className="text-sm font-semibold text-[#24302a]">
//                   Product label
//                 </h2>

//                 <p className="text-[11px] text-[#a39a8f] mt-1">
//                   Upload a clear photo of the package
//                 </p>

//               </div>

//               {previewUrl && (
//                 <button
//                   type="button"
//                   onClick={resetFile}
//                   disabled={submitting}
//                   className="
//                     w-8
//                     h-8
//                     rounded-lg
//                     bg-[#f5f7f6]
//                     text-[#8a7f73]
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-[#efefee]
//                     transition-colors
//                   "
//                   aria-label="Remove image"
//                 >
//                   <IconX size={16} />
//                 </button>
//               )}

//             </div>


//             {/* =================================================
//                 EMPTY UPLOAD STATE
//             ================================================== */}

//             {!previewUrl && (
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="
//                   w-full
//                   min-h-[330px]
//                   rounded-2xl
//                   border-[1.5px]
//                   border-dashed
//                   border-[#cfd9d4]
//                   bg-[#fbfefd]
//                   hover:bg-[#f9fdfb]
//                   hover:border-[#8de4bb]
//                   transition-all
//                   flex
//                   flex-col
//                   items-center
//                   justify-center
//                   text-center
//                   px-6
//                   cursor-pointer
//                   group
//                 "
//               >

//                 <div
//                   className="
//                     w-16
//                     h-16
//                     rounded-2xl
//                     bg-[#f1fcf7]
//                     text-[#38ca86]
//                     flex
//                     items-center
//                     justify-center
//                     mb-5
//                     group-hover:scale-105
//                     transition-transform
//                   "
//                 >
//                   <IconCamera size={29} />
//                 </div>

//                 <h3
//                   className="
//                     text-sm
//                     font-semibold
//                     text-[#29342f]
//                   "
//                 >
//                   Take or upload a photo
//                 </h3>

//                 <p
//                   className="
//                     text-xs
//                     text-[#988e82]
//                     mt-2
//                     max-w-[360px]
//                     leading-relaxed
//                   "
//                 >
//                   Capture the ingredients, nutrition panel,
//                   or product label so we can verify it.
//                 </p>

//                 <span
//                   className="
//                     mt-5
//                     inline-flex
//                     items-center
//                     gap-2
//                     px-4
//                     py-2.5
//                     rounded-xl
//                     bg-white
//                     border
//                     border-[#dee5e2]
//                     text-xs
//                     font-semibold
//                     text-[#38ca86]
//                     shadow-sm
//                   "
//                 >
//                   <IconUpload size={15} />
//                   Choose photo
//                 </span>

//                 <p className="text-[10px] text-[#afa79d] mt-4">
//                   JPG or PNG · Clear images work best
//                 </p>

//               </button>
//             )}


//             {/* =================================================
//                 IMAGE PREVIEW
//             ================================================== */}

//             {previewUrl && (
//               <div>

//                 <div
//                   className="
//                     relative
//                     overflow-hidden
//                     rounded-2xl
//                     border
//                     border-[#e2e8e5]
//                     bg-[#f8f8f7]
//                   "
//                 >

//                   <img
//                     src={previewUrl}
//                     alt="Selected product label"
//                     className="
//                       w-full
//                       max-h-[480px]
//                       object-contain
//                     "
//                   />

//                   <div
//                     className="
//                       absolute
//                       left-3
//                       bottom-3
//                       px-2.5
//                       py-1.5
//                       rounded-lg
//                       bg-black/60
//                       backdrop-blur-sm
//                       text-white
//                       text-[10px]
//                       font-medium
//                     "
//                   >
//                     Label preview
//                   </div>

//                 </div>

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                     mt-3
//                     px-1
//                   "
//                 >

//                   <p
//                     className="
//                       text-[11px]
//                       text-[#988e82]
//                       truncate
//                       max-w-[70%]
//                     "
//                   >
//                     {file?.name}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={submitting}
//                     className="
//                       text-[11px]
//                       font-semibold
//                       text-[#38ca86]
//                       hover:text-[#26a369]
//                     "
//                   >
//                     Change photo
//                   </button>

//                 </div>

//               </div>
//             )}


//             {/* =================================================
//                 HIDDEN FILE INPUT
//             ================================================== */}

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/jpeg,image/jpg,image/png"
//               capture="environment"
//               onChange={handleFileChange}
//               className="hidden"
//             />


//             {/* =================================================
//                 LOCATION
//             ================================================== */}

//             <div className="mt-6">

//               <label
//                 className="
//                   block
//                   text-xs
//                   font-semibold
//                   text-[#4b453e]
//                   mb-2
//                 "
//               >
//                 Shop location
//               </label>

//               <div className="relative">

//                 <IconMapPin
//                   size={17}
//                   className="
//                     absolute
//                     left-3.5
//                     top-1/2
//                     -translate-y-1/2
//                     text-[#9d9388]
//                   "
//                 />

//                 <input
//                   type="text"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   placeholder="e.g. Koramangala, Bengaluru"
//                   disabled={submitting}
//                   className="
//                     w-full
//                     h-11
//                     pl-10
//                     pr-3
//                     rounded-xl
//                     border
//                     border-[#dee5e2]
//                     bg-white
//                     text-sm
//                     text-[#29342f]
//                     placeholder:text-[#afa79d]
//                     outline-none
//                     focus:border-[#38ca86]
//                     focus:ring-2
//                     focus:ring-[#38ca86]/10
//                     transition-all
//                   "
//                 />

//               </div>

//               <p className="text-[10px] text-[#a9a095] mt-1.5">
//                 Used to associate the verification with your retail location.
//               </p>

//             </div>


//             {/* =================================================
//                 ERROR
//             ================================================== */}

//             {error && (
//               <div
//                 className="
//                   mt-4
//                   rounded-xl
//                   border
//                   border-[#f1cecc]
//                   bg-[#fef6f6]
//                   px-4
//                   py-3
//                   text-xs
//                   text-[#b9241c]
//                 "
//               >
//                 {error}
//               </div>
//             )}


//             {/* =================================================
//                 ANALYZE BUTTON
//             ================================================== */}

//             <button
//               type="button"
//               onClick={handleAnalyze}
//               disabled={!file || !location.trim() || submitting}
//               className="
//                 w-full
//                 h-12
//                 mt-5
//                 rounded-xl
//                 bg-[#38ca86]
//                 text-white
//                 text-sm
//                 font-semibold
//                 shadow-[0_8px_20px_rgba(31,109,71,0.18)]
//                 hover:bg-[#30a36d]
//                 disabled:bg-[#d1ccc6]
//                 disabled:shadow-none
//                 disabled:cursor-not-allowed
//                 transition-all
//               "
//             >
//               {submitting
//                 ? "Analyzing label…"
//                 : "Analyze label"}
//             </button>

//             {submitting && (
//               <p
//                 className="
//                   text-center
//                   text-[10px]
//                   text-[#988e82]
//                   mt-2
//                 "
//               >
//                 This may take a few seconds while the product
//                 is being verified.
//               </p>
//             )}

//           </div>


//           {/* =================================================
//               RIGHT — INFORMATION PANEL
//           ================================================== */}

//           <div className="space-y-4">

//             {/* How it works */}

//             <div
//               className="
//                 bg-white
//                 border
//                 border-[#e7edea]
//                 rounded-2xl
//                 p-5
//               "
//             >

//               <div className="flex items-center gap-3 mb-5">

//                 <div
//                   className="
//                     w-9
//                     h-9
//                     rounded-xl
//                     bg-[#f1fcf7]
//                     text-[#38ca86]
//                     flex
//                     items-center
//                     justify-center
//                   "
//                 >
//                   <IconShieldCheck size={19} />
//                 </div>

//                 <div>

//                   <h3 className="text-sm font-semibold text-[#29342f]">
//                     What happens next?
//                   </h3>

//                   <p className="text-[10px] text-[#a39a8f] mt-0.5">
//                     Automated product verification
//                   </p>

//                 </div>

//               </div>


//               <Step
//                 number="01"
//                 title="Read the label"
//                 text="Product information is extracted from your image."
//               />

//               <Step
//                 number="02"
//                 title="Check compliance"
//                 text="Ingredients and label details are checked against safety requirements."
//               />

//               <Step
//                 number="03"
//                 title="Get your result"
//                 text="Receive a clear compliance status and verification details."
//                 last
//               />

//             </div>


//             {/* Photo tips */}

//             <div
//               className="
//                 rounded-2xl
//                 bg-[#f9fdfb]
//                 border
//                 border-[#e5f9f0]
//                 p-5
//               "
//             >

//               <h3
//                 className="
//                   text-xs
//                   font-semibold
//                   text-[#38453f]
//                   mb-3
//                 "
//               >
//                 For the best results
//               </h3>

//               <div className="space-y-2.5">

//                 <Tip text="Keep the label flat and fully visible." />
//                 <Tip text="Use good lighting and avoid glare." />
//                 <Tip text="Make sure text is sharp and readable." />

//               </div>

//             </div>


//             {/* India / safety note */}

//             <div
//               className="
//                 rounded-2xl
//                 bg-white
//                 border
//                 border-[#e7edea]
//                 p-5
//               "
//             >

//               <div className="flex gap-3">

//                 <div
//                   className="
//                     w-8
//                     h-8
//                     flex-shrink-0
//                     rounded-lg
//                     bg-[#eef7f1]
//                     text-[#2f8a4a]
//                     flex
//                     items-center
//                     justify-center
//                   "
//                 >
//                   <IconShieldCheck size={16} />
//                 </div>

//                 <div>

//                   <p className="text-xs font-semibold text-[#36423c]">
//                     Built for India's food ecosystem
//                   </p>

//                   <p
//                     className="
//                       text-[10px]
//                       leading-relaxed
//                       text-[#988e82]
//                       mt-1
//                     "
//                   >
//                     SpectraSafe helps retailers make
//                     informed product safety and compliance
//                     decisions.
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }


// /* ============================================================
//    STEP
// ============================================================ */

// function Step({ number, title, text, last }) {
//   return (
//     <div className="flex gap-3">

//       <div className="flex flex-col items-center">

//         <div
//           className="
//             w-7
//             h-7
//             rounded-lg
//             bg-[#f2f5f4]
//             text-[#38ca86]
//             text-[9px]
//             font-bold
//             flex
//             items-center
//             justify-center
//             flex-shrink-0
//           "
//         >
//           {number}
//         </div>

//         {!last && (
//           <div
//             className="
//               w-px
//               h-8
//               bg-[#e7edea]
//               my-1
//             "
//           />
//         )}

//       </div>

//       <div className="pb-4">

//         <p className="text-xs font-semibold text-[#36423c]">
//           {title}
//         </p>

//         <p
//           className="
//             text-[10px]
//             text-[#988e82]
//             leading-relaxed
//             mt-1
//           "
//         >
//           {text}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* ============================================================
//    TIP
// ============================================================ */

// function Tip({ text }) {
//   return (
//     <div className="flex items-start gap-2">

//       <span
//         className="
//           w-1.5
//           h-1.5
//           rounded-full
//           bg-[#38ca86]
//           mt-1.5
//           flex-shrink-0
//         "
//       />

//       <p className="text-[10px] text-[#867c70] leading-relaxed">
//         {text}
//       </p>

//     </div>
//   );
// }
















// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   IconCamera,
//   IconUpload,
//   IconMapPin,
//   IconShieldCheck,
//   IconArrowLeft,
//   IconX,
//   IconSparkles,
// } from "@tabler/icons-react";

// import { api } from "../../lib/api";
// import LocationAutocomplete from "../../components/LocationAutocomplete";

// export default function ShopScan() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   function handleFileChange(e) {
//     const f = e.target.files?.[0];

//     if (!f) return;

//     setFile(f);
//     setError(null);

//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     setPreviewUrl(URL.createObjectURL(f));
//   }

//   function resetFile() {
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }

//     setFile(null);
//     setPreviewUrl(null);
//     setError(null);

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }

//   async function handleAnalyze() {
//     if (!file || !location) return;

//     setSubmitting(true);
//     setError(null);

//     try {
//       const scan = await api.createScan(file, location);

//       navigate(`/shop/result/${scan.id}`);
//     } catch (err) {
//       setError(err.message);
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">

//       {/* =====================================================
//           SUBTLE BACKGROUND
//       ====================================================== */}

//       <div
//         className="
//           absolute
//           top-0
//           right-0
//           w-[520px]
//           h-[420px]
//           pointer-events-none
//           opacity-[0.045]
//         "
//       >
//         <img
//           src="/spectrasafe-india-bg.png"
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
//           CONTENT
//       ====================================================== */}

//       <div
//         className="
//           relative
//           max-w-[1050px]
//           mx-auto
//           px-5
//           sm:px-8
//           lg:px-10
//           pt-7
//           pb-12
//         "
//       >

//         {/* ===================================================
//             BACK
//         ==================================================== */}

//         <button
//           type="button"
//           onClick={() => navigate("/shop")}
//           className="
//             inline-flex
//             items-center
//             gap-2
//             text-xs
//             font-medium
//             text-[#82786d]
//             hover:text-[#38ca86]
//             transition-colors
//             mb-6
//           "
//         >
//           <IconArrowLeft size={15} />
//           Back to dashboard
//         </button>


//         {/* ===================================================
//             HEADER
//         ==================================================== */}

//         <div className="mb-7">

//           <div
//             className="
//               inline-flex
//               items-center
//               gap-2
//               px-2.5
//               py-1
//               rounded-full
//               bg-[#f1fcf7]
//               text-[#38ca86]
//               text-[10px]
//               font-semibold
//               mb-3
//             "
//           >
//             <IconSparkles size={12} />
//             PRODUCT VERIFICATION
//           </div>

//           <h1
//             className="
//               text-[28px]
//               sm:text-[32px]
//               leading-tight
//               tracking-[-0.035em]
//               font-semibold
//               text-[#17251e]
//             "
//           >
//             Scan a product label
//           </h1>

//           <p
//             className="
//               text-sm
//               text-[#867c70]
//               mt-2
//               max-w-[620px]
//             "
//           >
//             Capture the product label clearly and SpectraSafe
//             will analyze it for safety and compliance.
//           </p>

//         </div>


//         {/* ===================================================
//             MAIN GRID
//         ==================================================== */}

//         <div
//           className="
//             grid
//             grid-cols-1
//             lg:grid-cols-[1.35fr_0.65fr]
//             gap-6
//             items-start
//           "
//         >

//           {/* =================================================
//               LEFT — SCAN AREA
//           ================================================== */}

//           <div
//             className="
//               bg-white
//               border
//               border-[#e7edea]
//               rounded-2xl
//               p-5
//               sm:p-7
//               shadow-[0_6px_24px_rgba(20,22,26,0.035)]
//             "
//           >

//             <div className="flex items-center justify-between mb-5">

//               <div>

//                 <h2 className="text-sm font-semibold text-[#24302a]">
//                   Product label
//                 </h2>

//                 <p className="text-[11px] text-[#a39a8f] mt-1">
//                   Upload a clear photo of the package
//                 </p>

//               </div>

//               {previewUrl && (
//                 <button
//                   type="button"
//                   onClick={resetFile}
//                   disabled={submitting}
//                   className="
//                     w-8
//                     h-8
//                     rounded-lg
//                     bg-[#f5f7f6]
//                     text-[#8a7f73]
//                     flex
//                     items-center
//                     justify-center
//                     hover:bg-[#efefee]
//                     transition-colors
//                   "
//                   aria-label="Remove image"
//                 >
//                   <IconX size={16} />
//                 </button>
//               )}

//             </div>


//             {/* =================================================
//                 EMPTY UPLOAD STATE
//             ================================================== */}

//             {!previewUrl && (
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="
//                   w-full
//                   min-h-[330px]
//                   rounded-2xl
//                   border-[1.5px]
//                   border-dashed
//                   border-[#cfd9d4]
//                   bg-[#fbfefd]
//                   hover:bg-[#f9fdfb]
//                   hover:border-[#8de4bb]
//                   transition-all
//                   flex
//                   flex-col
//                   items-center
//                   justify-center
//                   text-center
//                   px-6
//                   cursor-pointer
//                   group
//                 "
//               >

//                 <div
//                   className="
//                     w-16
//                     h-16
//                     rounded-2xl
//                     bg-[#f1fcf7]
//                     text-[#38ca86]
//                     flex
//                     items-center
//                     justify-center
//                     mb-5
//                     group-hover:scale-105
//                     transition-transform
//                   "
//                 >
//                   <IconCamera size={29} />
//                 </div>

//                 <h3
//                   className="
//                     text-sm
//                     font-semibold
//                     text-[#29342f]
//                   "
//                 >
//                   Take or upload a photo
//                 </h3>

//                 <p
//                   className="
//                     text-xs
//                     text-[#988e82]
//                     mt-2
//                     max-w-[360px]
//                     leading-relaxed
//                   "
//                 >
//                   Capture the ingredients, nutrition panel,
//                   or product label so we can verify it.
//                 </p>

//                 <span
//                   className="
//                     mt-5
//                     inline-flex
//                     items-center
//                     gap-2
//                     px-4
//                     py-2.5
//                     rounded-xl
//                     bg-white
//                     border
//                     border-[#dee5e2]
//                     text-xs
//                     font-semibold
//                     text-[#38ca86]
//                     shadow-sm
//                   "
//                 >
//                   <IconUpload size={15} />
//                   Choose photo
//                 </span>

//                 <p className="text-[10px] text-[#afa79d] mt-4">
//                   JPG or PNG · Clear images work best
//                 </p>

//               </button>
//             )}


//             {/* =================================================
//                 IMAGE PREVIEW
//             ================================================== */}

//             {previewUrl && (
//               <div>

//                 <div
//                   className="
//                     relative
//                     overflow-hidden
//                     rounded-2xl
//                     border
//                     border-[#e2e8e5]
//                     bg-[#f8f8f7]
//                   "
//                 >

//                   <img
//                     src={previewUrl}
//                     alt="Selected product label"
//                     className="
//                       w-full
//                       max-h-[480px]
//                       object-contain
//                     "
//                   />

//                   <div
//                     className="
//                       absolute
//                       left-3
//                       bottom-3
//                       px-2.5
//                       py-1.5
//                       rounded-lg
//                       bg-black/60
//                       backdrop-blur-sm
//                       text-white
//                       text-[10px]
//                       font-medium
//                     "
//                   >
//                     Label preview
//                   </div>

//                 </div>

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                     mt-3
//                     px-1
//                   "
//                 >

//                   <p
//                     className="
//                       text-[11px]
//                       text-[#988e82]
//                       truncate
//                       max-w-[70%]
//                     "
//                   >
//                     {file?.name}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={submitting}
//                     className="
//                       text-[11px]
//                       font-semibold
//                       text-[#38ca86]
//                       hover:text-[#26a369]
//                     "
//                   >
//                     Change photo
//                   </button>

//                 </div>

//               </div>
//             )}


//             {/* =================================================
//                 HIDDEN FILE INPUT
//             ================================================== */}

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/jpeg,image/jpg,image/png"
//               capture="environment"
//               onChange={handleFileChange}
//               className="hidden"
//             />


//             {/* =================================================
//                 LOCATION
//             ================================================== */}

//             <div className="mt-6">

//               <label
//                 className="
//                   block
//                   text-xs
//                   font-semibold
//                   text-[#4b453e]
//                   mb-2
//                 "
//               >
//                 Shop location
//               </label>

//               <LocationAutocomplete
//                 value={location}
//                 onChange={setLocation}
//                 placeholder="Shop location — start typing an area or city"
//               />

//               <p className="text-[10px] text-[#a9a095] mt-1.5">
//                 Used to associate the verification with your retail location.
//               </p>

//             </div>


//             {/* =================================================
//                 ERROR
//             ================================================== */}

//             {error && (
//               <div
//                 className="
//                   mt-4
//                   rounded-xl
//                   border
//                   border-[#f1cecc]
//                   bg-[#fef6f6]
//                   px-4
//                   py-3
//                   text-xs
//                   text-[#b9241c]
//                 "
//               >
//                 {error}
//               </div>
//             )}


//             {/* =================================================
//                 ANALYZE BUTTON
//             ================================================== */}

//             <button
//               type="button"
//               onClick={handleAnalyze}
//               disabled={!file || !location || submitting}
//               className="
//                 w-full
//                 h-12
//                 mt-5
//                 rounded-xl
//                 bg-[#38ca86]
//                 text-white
//                 text-sm
//                 font-semibold
//                 shadow-[0_8px_20px_rgba(31,109,71,0.18)]
//                 hover:bg-[#30a36d]
//                 disabled:bg-[#d1ccc6]
//                 disabled:shadow-none
//                 disabled:cursor-not-allowed
//                 transition-all
//               "
//             >
//               {submitting
//                 ? "Analyzing label…"
//                 : "Analyze label"}
//             </button>

//             {submitting && (
//               <p
//                 className="
//                   text-center
//                   text-[10px]
//                   text-[#988e82]
//                   mt-2
//                 "
//               >
//                 This may take a few seconds while the product
//                 is being verified.
//               </p>
//             )}

//           </div>


//           {/* =================================================
//               RIGHT — INFORMATION PANEL
//           ================================================== */}

//           <div className="space-y-4">

//             {/* How it works */}

//             <div
//               className="
//                 bg-white
//                 border
//                 border-[#e7edea]
//                 rounded-2xl
//                 p-5
//               "
//             >

//               <div className="flex items-center gap-3 mb-5">

//                 <div
//                   className="
//                     w-9
//                     h-9
//                     rounded-xl
//                     bg-[#f1fcf7]
//                     text-[#38ca86]
//                     flex
//                     items-center
//                     justify-center
//                   "
//                 >
//                   <IconShieldCheck size={19} />
//                 </div>

//                 <div>

//                   <h3 className="text-sm font-semibold text-[#29342f]">
//                     What happens next?
//                   </h3>

//                   <p className="text-[10px] text-[#a39a8f] mt-0.5">
//                     Automated product verification
//                   </p>

//                 </div>

//               </div>


//               <Step
//                 number="01"
//                 title="Read the label"
//                 text="Product information is extracted from your image."
//               />

//               <Step
//                 number="02"
//                 title="Check compliance"
//                 text="Ingredients and label details are checked against safety requirements."
//               />

//               <Step
//                 number="03"
//                 title="Get your result"
//                 text="Receive a clear compliance status and verification details."
//                 last
//               />

//             </div>


//             {/* Photo tips */}

//             <div
//               className="
//                 rounded-2xl
//                 bg-[#f9fdfb]
//                 border
//                 border-[#e5f9f0]
//                 p-5
//               "
//             >

//               <h3
//                 className="
//                   text-xs
//                   font-semibold
//                   text-[#38453f]
//                   mb-3
//                 "
//               >
//                 For the best results
//               </h3>

//               <div className="space-y-2.5">

//                 <Tip text="Keep the label flat and fully visible." />
//                 <Tip text="Use good lighting and avoid glare." />
//                 <Tip text="Make sure text is sharp and readable." />

//               </div>

//             </div>


//             {/* India / safety note */}

//             <div
//               className="
//                 rounded-2xl
//                 bg-white
//                 border
//                 border-[#e7edea]
//                 p-5
//               "
//             >

//               <div className="flex gap-3">

//                 <div
//                   className="
//                     w-8
//                     h-8
//                     flex-shrink-0
//                     rounded-lg
//                     bg-[#eef7f1]
//                     text-[#2f8a4a]
//                     flex
//                     items-center
//                     justify-center
//                   "
//                 >
//                   <IconShieldCheck size={16} />
//                 </div>

//                 <div>

//                   <p className="text-xs font-semibold text-[#36423c]">
//                     Built for India's food ecosystem
//                   </p>

//                   <p
//                     className="
//                       text-[10px]
//                       leading-relaxed
//                       text-[#988e82]
//                       mt-1
//                     "
//                   >
//                     SpectraSafe helps retailers make
//                     informed product safety and compliance
//                     decisions.
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }


// /* ============================================================
//    STEP
// ============================================================ */

// function Step({ number, title, text, last }) {
//   return (
//     <div className="flex gap-3">

//       <div className="flex flex-col items-center">

//         <div
//           className="
//             w-7
//             h-7
//             rounded-lg
//             bg-[#f2f5f4]
//             text-[#38ca86]
//             text-[9px]
//             font-bold
//             flex
//             items-center
//             justify-center
//             flex-shrink-0
//           "
//         >
//           {number}
//         </div>

//         {!last && (
//           <div
//             className="
//               w-px
//               h-8
//               bg-[#e7edea]
//               my-1
//             "
//           />
//         )}

//       </div>

//       <div className="pb-4">

//         <p className="text-xs font-semibold text-[#36423c]">
//           {title}
//         </p>

//         <p
//           className="
//             text-[10px]
//             text-[#988e82]
//             leading-relaxed
//             mt-1
//           "
//         >
//           {text}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* ============================================================
//    TIP
// ============================================================ */

// function Tip({ text }) {
//   return (
//     <div className="flex items-start gap-2">

//       <span
//         className="
//           w-1.5
//           h-1.5
//           rounded-full
//           bg-[#38ca86]
//           mt-1.5
//           flex-shrink-0
//         "
//       />

//       <p className="text-[10px] text-[#867c70] leading-relaxed">
//         {text}
//       </p>

//     </div>
//   );
// }












// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   IconCamera,
//   IconUpload,
//   IconMapPin,
//   IconX,
// } from "@tabler/icons-react";

// import { api } from "../../lib/api";
// import LocationAutocomplete from "../../components/LocationAutocomplete";

// /* ============================================================
//    PALETTE (used inline via arbitrary Tailwind values, matching
//    how this file already worked before — no new build config needed)

//    paper        #F7F3EA   warm receipt/tag-stock background
//    ink          #211C16   near-black warm ink, headline text
//    ink-soft     #6B6255   secondary text
//    rule         #DED5C4   hairline borders, warm not cool grey
//    amber        #C1701E   single accent — spice-market orange
//    amber-wash   #F3E3D0   light amber tint
//    verified     #3D6B4C   compliance/success, used sparingly
//    error        #B23A2E   warm red-brown, not lipstick red

//    TYPE: headline uses Fraunces (serif, has real character at display
//    size); everything else stays on your existing UI sans. Add this to
//    index.html <head> once:
//    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
// ============================================================ */

// export default function ShopScan() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   function handleFileChange(e) {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     setFile(f);
//     setError(null);
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     setPreviewUrl(URL.createObjectURL(f));
//   }

//   function resetFile() {
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     setFile(null);
//     setPreviewUrl(null);
//     setError(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   }

//   async function handleAnalyze() {
//     if (!file || !location) return;
//     setSubmitting(true);
//     setError(null);
//     try {
//       const scan = await api.createScan(file, location);
//       navigate(`/shop/result/${scan.id}`);
//     } catch (err) {
//       setError(err.message);
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-[calc(100vh-72px)] bg-[#F7F3EA]">
//       <div className="max-w-[1050px] mx-auto px-5 sm:px-8 lg:px-10 pt-7 pb-16">
//         {/* BACK */}
//         <button
//           type="button"
//           onClick={() => navigate("/shop")}
//           className="text-xs font-medium text-[#6B6255] hover:text-[#211C16] transition-colors mb-8"
//         >
//           ← Back to dashboard
//         </button>

//         {/* HEADER — serif headline carries the personality, no eyebrow pill */}
//         <div className="mb-9 max-w-[560px]">
//           <h1
//             className="text-[34px] sm:text-[40px] leading-[1.05] text-[#211C16]"
//             style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
//           >
//             Scan a product label
//           </h1>
//           <p className="text-[14px] text-[#6B6255] mt-3 leading-relaxed">
//             Photograph the ingredients or nutrition panel clearly. SpectraSafe
//             reads it and checks it against Indian food-safety requirements.
//           </p>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
//           {/* ============================================
//               LEFT — the one bold element on the page
//           ============================================= */}
//           <div>
//             {!previewUrl && (
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="relative w-full min-h-[380px] bg-[#FBF9F4] hover:bg-white transition-colors flex flex-col items-center justify-center text-center px-6 cursor-pointer group"
//               >
//                 {/* viewfinder corner brackets — references the physical
//                     act of framing a label photo, instead of a generic
//                     dashed-rectangle uploader */}
//                 <CornerBracket className="absolute top-0 left-0" />
//                 <CornerBracket className="absolute top-0 right-0 rotate-90" />
//                 <CornerBracket className="absolute bottom-0 right-0 rotate-180" />
//                 <CornerBracket className="absolute bottom-0 left-0 -rotate-90" />

//                 <IconCamera
//                   size={34}
//                   strokeWidth={1.5}
//                   className="text-[#C1701E] mb-5 group-hover:scale-105 transition-transform"
//                 />

//                 <h3 className="text-[15px] font-semibold text-[#211C16]">
//                   Frame the label and capture
//                 </h3>
//                 <p className="text-[13px] text-[#8A8074] mt-2 max-w-[320px] leading-relaxed">
//                   Ingredients list or nutrition table, flat and fully lit.
//                 </p>

//                 <span className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-[#DED5C4] text-[13px] font-medium text-[#211C16] bg-white">
//                   <IconUpload size={14} strokeWidth={1.75} />
//                   Choose photo instead
//                 </span>
//               </button>
//             )}

//             {previewUrl && (
//               <div>
//                 <div className="relative bg-[#211C16]">
//                   <img
//                     src={previewUrl}
//                     alt="Selected product label"
//                     className="w-full max-h-[480px] object-contain"
//                   />
//                   <button
//                     type="button"
//                     onClick={resetFile}
//                     disabled={submitting}
//                     aria-label="Remove image"
//                     className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
//                   >
//                     <IconX size={16} />
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-between mt-3">
//                   <p className="text-[12px] text-[#8A8074] truncate max-w-[65%]">
//                     {file?.name}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={submitting}
//                     className="text-[12px] font-semibold text-[#C1701E] hover:text-[#9C5A16]"
//                   >
//                     Change photo
//                   </button>
//                 </div>
//               </div>
//             )}

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/jpeg,image/jpg,image/png"
//               capture="environment"
//               onChange={handleFileChange}
//               className="hidden"
//             />

//             {/* LOCATION */}
//             <div className="mt-8 pt-6 border-t border-[#DED5C4]">
//               <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#211C16] mb-2">
//                 <IconMapPin size={14} strokeWidth={2} className="text-[#8A8074]" />
//                 Shop location
//               </label>

//               <LocationAutocomplete
//                 value={location}
//                 onChange={setLocation}
//                 placeholder="Start typing an area or city"
//               />

//               <p className="text-[11px] text-[#8A8074] mt-1.5">
//                 Associates this verification with your retail location.
//               </p>
//             </div>

//             {error && (
//               <div className="mt-4 border-l-2 border-[#B23A2E] bg-[#FBF0EE] px-4 py-3 text-[13px] text-[#B23A2E]">
//                 {error}
//               </div>
//             )}

//             <button
//               type="button"
//               onClick={handleAnalyze}
//               disabled={!file || !location || submitting}
//               className="w-full h-12 mt-6 bg-[#C1701E] text-white text-[14px] font-semibold hover:bg-[#9C5A16] disabled:bg-[#DED5C4] disabled:text-[#8A8074] disabled:cursor-not-allowed transition-colors"
//             >
//               {submitting ? "Analyzing label…" : "Analyze label"}
//             </button>

//             {submitting && (
//               <p className="text-center text-[11px] text-[#8A8074] mt-2">
//                 This can take a few seconds — the model is reading the label.
//               </p>
//             )}
//           </div>

//           {/* ============================================
//               RIGHT — quiet, typographic, no card chrome
//           ============================================= */}
//           <div className="lg:pt-1">
//             <ol className="space-y-5">
//               <ProcessStep n="1" title="Read the label">
//                 Ingredients and nutrition values are extracted from your photo.
//               </ProcessStep>
//               <ProcessStep n="2" title="Check compliance">
//                 Cross-checked against FSSAI rules and additive limits.
//               </ProcessStep>
//               <ProcessStep n="3" title="Get your result">
//                 A clear pass/flag status with the specific reasons behind it.
//               </ProcessStep>
//             </ol>

//             <div className="mt-8 pt-6 border-t border-[#DED5C4]">
//               <h3 className="text-[12px] font-semibold text-[#211C16] mb-2.5">
//                 For a clean read
//               </h3>
//               <ul className="space-y-1.5 text-[12px] text-[#6B6255] leading-relaxed">
//                 <li>Keep the label flat, not curved around the jar</li>
//                 <li>Natural light beats flash — avoid glare on foil or plastic</li>
//                 <li>Fill the frame; text should be sharp, not thumbnail-sized</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CornerBracket({ className = "" }) {
//   return (
//     <svg
//       width="28"
//       height="28"
//       viewBox="0 0 28 28"
//       fill="none"
//       className={`${className} text-[#C1701E] opacity-70`}
//     >
//       <path d="M2 14V2H14" stroke="currentColor" strokeWidth="2" />
//     </svg>
//   );
// }

// function ProcessStep({ n, title, children }) {
//   return (
//     <li className="flex gap-4">
//       <span
//         className="text-[22px] text-[#C1701E] leading-none flex-shrink-0"
//         style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
//       >
//         {n}
//       </span>
//       <div>
//         <p className="text-[13px] font-semibold text-[#211C16]">{title}</p>
//         <p className="text-[12px] text-[#8A8074] leading-relaxed mt-0.5">
//           {children}
//         </p>
//       </div>
//     </li>
//   );
// }











import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconCamera,
  IconUpload,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";

import { api } from "../../lib/api";
import LocationAutocomplete from "../../components/LocationAutocomplete";

/* ============================================================
   PALETTE (used inline via arbitrary Tailwind values, matching
   how this file already worked before — no new build config needed)

   paper        #F7F3EA   warm receipt/tag-stock background
   ink          #211C16   near-black warm ink, headline text
   ink-soft     #6B6255   secondary text
   rule         #DED5C4   hairline borders, warm not cool grey
   amber        #C1701E   single accent — spice-market orange
   amber-wash   #F3E3D0   light amber tint
   verified     #3D6B4C   compliance/success, used sparingly
   error        #B23A2E   warm red-brown, not lipstick red

   TYPE: headline uses Fraunces (serif, has real character at display
   size); everything else stays on your existing UI sans. Add this to
   index.html <head> once:
   <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
============================================================ */

export default function ShopScan() {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function resetFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!file || !location) return;
    setSubmitting(true);
    setError(null);
    try {
      const scan = await api.createScan(file, location);
      navigate(`/shop/result/${scan.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F7F3EA]">
      <div className="max-w-[1050px] mx-auto px-5 sm:px-8 lg:px-10 pt-7 pb-16">
        {/* BACK */}
        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="text-xs font-medium text-[#6B6255] hover:text-[#211C16] transition-colors mb-8"
        >
          ← Back to dashboard
        </button>

        {/* HEADER — serif headline carries the personality, no eyebrow pill */}
        <div className="mb-9 max-w-[560px]">
          <h1
            className="text-[34px] sm:text-[40px] leading-[1.05] text-[#211C16]"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
          >
            Scan a product label
          </h1>
          <p className="text-[14px] text-[#6B6255] mt-3 leading-relaxed">
            Photograph the ingredients or nutrition panel clearly. SpectraSafe
            reads it and checks it against Indian food-safety requirements.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
          {/* ============================================
              LEFT — the one bold element on the page
          ============================================= */}
          <div>
            {!previewUrl && (
              <div className="relative w-full min-h-[380px] bg-[#FBF9F4] hover:bg-white transition-colors flex flex-col items-center justify-center text-center px-6 group">
                <button
                  type="button"
                  aria-label="Capture label with rear camera"
                  onClick={() => cameraInputRef.current?.click()}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                />
                {/* viewfinder corner brackets — references the physical
                    act of framing a label photo, instead of a generic
                    dashed-rectangle uploader */}
                <CornerBracket className="absolute top-0 left-0" />
                <CornerBracket className="absolute top-0 right-0 rotate-90" />
                <CornerBracket className="absolute bottom-0 right-0 rotate-180" />
                <CornerBracket className="absolute bottom-0 left-0 -rotate-90" />

                <IconCamera
                  size={34}
                  strokeWidth={1.5}
                  className="text-[#C1701E] mb-5 group-hover:scale-105 transition-transform"
                />

                <h3 className="text-[15px] font-semibold text-[#211C16]">
                  Frame the label and capture
                </h3>
                <p className="text-[13px] text-[#8A8074] mt-2 max-w-[320px] leading-relaxed">
                  Ingredients list or nutrition table, flat and fully lit.
                </p>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="relative z-10 mt-6 inline-flex items-center gap-2 px-4 py-2 border border-[#DED5C4] text-[13px] font-medium text-[#211C16] bg-white hover:bg-[#F3E3D0]"
                >
                  <IconUpload size={14} strokeWidth={1.75} />
                  Choose photo instead
                </button>
              </div>
            )}

            {previewUrl && (
              <div>
                <div className="relative bg-[#211C16]">
                  <img
                    src={previewUrl}
                    alt="Selected product label"
                    className="w-full max-h-[480px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={resetFile}
                    disabled={submitting}
                    aria-label="Remove image"
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <IconX size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-[12px] text-[#8A8074] truncate max-w-[65%]">
                    {file?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={submitting}
                    className="text-[12px] font-semibold text-[#C1701E] hover:text-[#9C5A16]"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* LOCATION */}
            <div className="mt-8 pt-6 border-t border-[#DED5C4]">
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#211C16] mb-2">
                <IconMapPin size={14} strokeWidth={2} className="text-[#8A8074]" />
                Shop location
              </label>

              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Start typing an area or city"
              />

              <p className="text-[11px] text-[#8A8074] mt-1.5">
                Associates this verification with your retail location.
              </p>
            </div>

            {error && (
              <div className="mt-4 border-l-2 border-[#B23A2E] bg-[#FBF0EE] px-4 py-3 text-[13px] text-[#B23A2E]">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || !location || submitting}
              className="w-full h-12 mt-6 bg-[#C1701E] text-white text-[14px] font-semibold hover:bg-[#9C5A16] disabled:bg-[#DED5C4] disabled:text-[#8A8074] disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Analyzing label…" : "Analyze label"}
            </button>

            {submitting && (
              <p className="text-center text-[11px] text-[#8A8074] mt-2">
                This can take a few seconds — the model is reading the label.
              </p>
            )}
          </div>

          {/* ============================================
              RIGHT — quiet, typographic, no card chrome
          ============================================= */}
          <div className="lg:pt-1">
            <ol className="space-y-5">
              <ProcessStep n="1" title="Read the label">
                Ingredients and nutrition values are extracted from your photo.
              </ProcessStep>
              <ProcessStep n="2" title="Check compliance">
                Cross-checked against FSSAI rules and additive limits.
              </ProcessStep>
              <ProcessStep n="3" title="Get your result">
                A clear pass/flag status with the specific reasons behind it.
              </ProcessStep>
            </ol>

            <div className="mt-8 pt-6 border-t border-[#DED5C4]">
              <h3 className="text-[12px] font-semibold text-[#211C16] mb-2.5">
                For a clean read
              </h3>
              <ul className="space-y-1.5 text-[12px] text-[#6B6255] leading-relaxed">
                <li>Keep the label flat, not curved around the jar</li>
                <li>Natural light beats flash — avoid glare on foil or plastic</li>
                <li>Fill the frame; text should be sharp, not thumbnail-sized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerBracket({ className = "" }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} text-[#C1701E] opacity-70`}
    >
      <path d="M2 14V2H14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ProcessStep({ n, title, children }) {
  return (
    <li className="flex gap-4">
      <span
        className="text-[22px] text-[#C1701E] leading-none flex-shrink-0"
        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
      >
        {n}
      </span>
      <div>
        <p className="text-[13px] font-semibold text-[#211C16]">{title}</p>
        <p className="text-[12px] text-[#8A8074] leading-relaxed mt-0.5">
          {children}
        </p>
      </div>
    </li>
  );
}