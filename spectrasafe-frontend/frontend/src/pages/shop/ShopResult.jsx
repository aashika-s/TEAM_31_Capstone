// // import { useEffect, useState } from "react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
// // import TopBar from "../../components/TopBar";
// // import { ScreenContent } from "../../components/Screen";
// // import Card, { CardTitle, CardSub } from "../../components/Card";
// // import Pill from "../../components/Pill";
// // import SectionLabel from "../../components/SectionLabel";
// // import ProgressBar from "../../components/ProgressBar";
// // import { ButtonOutline } from "../../components/Button";
// // import { api } from "../../lib/api";
// // import { statusLabel } from "../../lib/format";

// // const SCORE_VARIANT = (score) => (score >= 80 ? "pass" : score >= 50 ? "warn" : "fail");

// // function KeyValueRow({ label, value }) {
// //   return (
// //     <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
// //       <span className="text-text-secondary">{label}</span>
// //       <span className="text-text-primary font-medium">{value}</span>
// //     </div>
// //   );
// // }

// // export default function ShopResult() {
// //   const { scanId } = useParams();
// //   const navigate = useNavigate();
// //   const [scan, setScan] = useState(null);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     api
// //       .getScan(scanId)
// //       .then(setScan)
// //       .catch((e) => setError(e.message));
// //   }, [scanId]);

// //   if (error) {
// //     return (
// //       <>
// //         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
// //         <ScreenContent>
// //           <p className="text-xs text-fail-text">{error}</p>
// //         </ScreenContent>
// //       </>
// //     );
// //   }
// //   if (!scan) {
// //     return (
// //       <>
// //         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
// //         <ScreenContent>
// //           <p className="text-xs text-text-secondary">Loading…</p>
// //         </ScreenContent>
// //       </>
// //     );
// //   }

// //   const { ocr_result: ocr, compliance_result: compliance, product_verification: verification } = scan;

// //   return (
// //     <>
// //       <TopBar title="Scan result" onBack={() => navigate("/shop")} />
// //       <ScreenContent>
// //         <Card>
// //           <div className="flex items-center justify-between mb-1">
// //             <CardTitle className="text-[15px]">{scan.image_filename}</CardTitle>
// //             <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
// //           </div>
// //           <CardSub>Compliance score</CardSub>
// //           <ProgressBar value={scan.compliance_score} variant={SCORE_VARIANT(scan.compliance_score)} />
// //           <CardSub className="mt-1">{scan.compliance_score}/100</CardSub>
// //         </Card>

// //         {verification && verification.status !== "NO_LICENSE_EXTRACTED" && (
// //           <>
// //             <SectionLabel>Product registry check</SectionLabel>
// //             <Card>
// //               <div className="flex items-center justify-between mb-2">
// //                 <CardTitle>{verification.matched_product_name || "Not registered"}</CardTitle>
// //                 <Pill status={verification.status}>{statusLabel(verification.status)}</Pill>
// //               </div>
// //               {verification.mismatches?.map((m, i) => (
// //                 <div key={i} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
// //                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
// //                   <span>{m}</span>
// //                 </div>
// //               ))}
// //               {verification.notes?.map((n, i) => (
// //                 <p key={i} className="text-xs text-text-secondary">
// //                   {n}
// //                 </p>
// //               ))}
// //             </Card>
// //           </>
// //         )}

// //         {(compliance?.violations?.length > 0 || compliance?.warnings?.length > 0 || compliance?.missing_fields?.length > 0) && (
// //           <>
// //             <SectionLabel>Compliance details</SectionLabel>
// //             <Card>
// //               {compliance.violations?.map((v, i) => (
// //                 <div key={`v-${i}`} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
// //                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
// //                   <span>{v}</span>
// //                 </div>
// //               ))}
// //               {compliance.warnings?.map((w, i) => (
// //                 <div key={`w-${i}`} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
// //                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
// //                   <span>{w}</span>
// //                 </div>
// //               ))}
// //               {compliance.missing_fields?.length > 0 && (
// //                 <p className="text-[13px] text-text-secondary">
// //                   Missing: {compliance.missing_fields.join(", ")}
// //                 </p>
// //               )}
// //             </Card>
// //           </>
// //         )}

// //         <SectionLabel>Extracted from label</SectionLabel>
// //         <Card>
// //           <KeyValueRow label="FSSAI license" value={ocr?.fssai_license || "Not found"} />
// //         </Card>

// //         {ocr?.ingredients?.length > 0 && (
// //           <Card>
// //             <CardTitle>Ingredients</CardTitle>
// //             <p className="text-[13px] text-text-secondary">{ocr.ingredients.join(", ")}</p>
// //           </Card>
// //         )}

// //         {ocr?.nutrients && Object.keys(ocr.nutrients).length > 0 && (
// //           <Card>
// //             <CardTitle className="mb-2">Nutrition (per label)</CardTitle>
// //             {Object.entries(ocr.nutrients).map(([k, v]) => (
// //               <KeyValueRow key={k} label={k} value={v} />
// //             ))}
// //           </Card>
// //         )}

// //         {ocr?.trans_fat_check?.status === "compliant" && (
// //           <Card>
// //             <div className="flex items-center gap-2 text-[13px] text-pass-text">
// //               <IconCircleCheck size={14} />
// //               <span>
// //                 Trans fat within FSSAI's 2% limit ({ocr.trans_fat_check.trans_fat_pct_of_total_fat}%)
// //               </span>
// //             </div>
// //           </Card>
// //         )}

// //         <ButtonOutline onClick={() => navigate("/shop/scan")}>Scan another label</ButtonOutline>
// //       </ScreenContent>
// //     </>
// //   );
// // }



// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { IconCircleCheck, IconAlertTriangle, IconFlag } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card, { CardTitle, CardSub } from "../../components/Card";
// import Pill from "../../components/Pill";
// import SectionLabel from "../../components/SectionLabel";
// import ProgressBar from "../../components/ProgressBar";
// import { ButtonOutline, ButtonPrimary } from "../../components/Button";
// import { api } from "../../lib/api";
// import { statusLabel } from "../../lib/format";

// const SCORE_VARIANT = (score) => (score >= 80 ? "pass" : score >= 50 ? "warn" : "fail");

// function KeyValueRow({ label, value }) {
//   return (
//     <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
//       <span className="text-text-secondary">{label}</span>
//       <span className="text-text-primary font-medium">{value}</span>
//     </div>
//   );
// }

// export default function ShopResult() {
//   const { scanId } = useParams();
//   const navigate = useNavigate();
//   const [scan, setScan] = useState(null);
//   const [error, setError] = useState(null);
//   const [flagOpen, setFlagOpen] = useState(false);
//   const [flagReason, setFlagReason] = useState("");
//   const [flagObservations, setFlagObservations] = useState("");
//   const [flagSubmitting, setFlagSubmitting] = useState(false);
//   const [flagged, setFlagged] = useState(false);
//   const [flagError, setFlagError] = useState(null);

//   useEffect(() => {
//     api
//       .getScan(scanId)
//       .then(setScan)
//       .catch((e) => setError(e.message));
//   }, [scanId]);

//   if (error) {
//     return (
//       <>
//         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//         <ScreenContent>
//           <p className="text-xs text-fail-text">{error}</p>
//         </ScreenContent>
//       </>
//     );
//   }
//   if (!scan) {
//     return (
//       <>
//         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//         <ScreenContent>
//           <p className="text-xs text-text-secondary">Loading…</p>
//         </ScreenContent>
//       </>
//     );
//   }

//   const { ocr_result: ocr, compliance_result: compliance, product_verification: verification } = scan;

//   async function submitFlag() {
//     if (!flagReason.trim()) return;
//     setFlagSubmitting(true);
//     setFlagError(null);
//     try {
//       await api.createFlag({
//         scan_id: scan.id,
//         reason: flagReason.trim(),
//         observations: flagObservations.trim() || null,
//       });
//       setFlagged(true);
//       setFlagOpen(false);
//     } catch (err) {
//       setFlagError(err.message);
//     } finally {
//       setFlagSubmitting(false);
//     }
//   }

//   return (
//     <>
//       <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center justify-between mb-1">
//             <CardTitle className="text-[15px]">{scan.image_filename}</CardTitle>
//             <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
//           </div>
//           <CardSub>Compliance score</CardSub>
//           <ProgressBar value={scan.compliance_score} variant={SCORE_VARIANT(scan.compliance_score)} />
//           <CardSub className="mt-1">{scan.compliance_score}/100</CardSub>
//         </Card>

//         {verification && verification.status !== "NO_LICENSE_EXTRACTED" && (
//           <>
//             <SectionLabel>Product registry check</SectionLabel>
//             <Card>
//               <div className="flex items-center justify-between mb-2">
//                 <CardTitle>{verification.matched_product_name || "Not registered"}</CardTitle>
//                 <Pill status={verification.status}>{statusLabel(verification.status)}</Pill>
//               </div>
//               {verification.mismatches?.map((m, i) => (
//                 <div key={i} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{m}</span>
//                 </div>
//               ))}
//               {verification.notes?.map((n, i) => (
//                 <p key={i} className="text-xs text-text-secondary">
//                   {n}
//                 </p>
//               ))}
//             </Card>
//           </>
//         )}

//         {(compliance?.violations?.length > 0 || compliance?.warnings?.length > 0 || compliance?.missing_fields?.length > 0) && (
//           <>
//             <SectionLabel>Compliance details</SectionLabel>
//             <Card>
//               {compliance.violations?.map((v, i) => (
//                 <div key={`v-${i}`} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{v}</span>
//                 </div>
//               ))}
//               {compliance.warnings?.map((w, i) => (
//                 <div key={`w-${i}`} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{w}</span>
//                 </div>
//               ))}
//               {compliance.missing_fields?.length > 0 && (
//                 <p className="text-[13px] text-text-secondary">
//                   Missing: {compliance.missing_fields.join(", ")}
//                 </p>
//               )}
//             </Card>
//           </>
//         )}

//         <SectionLabel>Extracted from label</SectionLabel>
//         <Card>
//           <KeyValueRow label="FSSAI license" value={ocr?.fssai_license || "Not found"} />
//         </Card>

//         {ocr?.ingredients?.length > 0 && (
//           <Card>
//             <CardTitle>Ingredients</CardTitle>
//             <p className="text-[13px] text-text-secondary">{ocr.ingredients.join(", ")}</p>
//           </Card>
//         )}

//         {ocr?.nutrients && Object.keys(ocr.nutrients).length > 0 && (
//           <Card>
//             <CardTitle className="mb-2">Nutrition (per label)</CardTitle>
//             {Object.entries(ocr.nutrients).map(([k, v]) => (
//               <KeyValueRow key={k} label={k} value={v} />
//             ))}
//           </Card>
//         )}

//         {ocr?.trans_fat_check?.status === "compliant" && (
//           <Card>
//             <div className="flex items-center gap-2 text-[13px] text-pass-text">
//               <IconCircleCheck size={14} />
//               <span>
//                 Trans fat within FSSAI's 2% limit ({ocr.trans_fat_check.trans_fat_pct_of_total_fat}%)
//               </span>
//             </div>
//           </Card>
//         )}

//         {flagged && (
//           <Card>
//             <div className="flex items-center gap-2 text-[13px] text-warn-text">
//               <IconFlag size={14} />
//               <span>Flagged for FSSAI review.</span>
//             </div>
//           </Card>
//         )}

//         {!flagged && !flagOpen && (
//           <ButtonOutline onClick={() => setFlagOpen(true)}>
//             <IconFlag size={14} className="inline mr-1 -mt-0.5" />
//             Flag for FSSAI review
//           </ButtonOutline>
//         )}

//         {flagOpen && (
//           <Card>
//             <CardTitle className="mb-2">Flag this scan</CardTitle>
//             <label className="text-xs text-text-secondary block mb-1">Reason</label>
//             <input
//               value={flagReason}
//               onChange={(e) => setFlagReason(e.target.value)}
//               placeholder="e.g. FSSAI license doesn't match registered product"
//               className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent"
//             />
//             <label className="text-xs text-text-secondary block mb-1">Observations (optional)</label>
//             <textarea
//               value={flagObservations}
//               onChange={(e) => setFlagObservations(e.target.value)}
//               rows={3}
//               className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent resize-none"
//             />
//             {flagError && <p className="text-xs text-fail-text mb-2">{flagError}</p>}
//             <ButtonPrimary onClick={submitFlag} disabled={flagSubmitting || !flagReason.trim()}>
//               {flagSubmitting ? "Submitting…" : "Submit flag"}
//             </ButtonPrimary>
//             <ButtonOutline onClick={() => setFlagOpen(false)} disabled={flagSubmitting}>
//               Cancel
//             </ButtonOutline>
//           </Card>
//         )}

//         <ButtonOutline onClick={() => navigate("/shop/scan")}>Scan another label</ButtonOutline>
//       </ScreenContent>
//     </>
//   );
// }

























// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { IconCircleCheck, IconAlertTriangle, IconFlag } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card, { CardTitle, CardSub } from "../../components/Card";
// import Pill from "../../components/Pill";
// import SectionLabel from "../../components/SectionLabel";
// import ProgressBar from "../../components/ProgressBar";
// import { ButtonOutline, ButtonPrimary } from "../../components/Button";
// import { api } from "../../lib/api";
// import { statusLabel } from "../../lib/format";

// const SCORE_VARIANT = (score) => (score >= 80 ? "pass" : score >= 50 ? "warn" : "fail");

// function KeyValueRow({ label, value }) {
//   return (
//     <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
//       <span className="text-text-secondary">{label}</span>
//       <span className="text-text-primary font-medium">{value}</span>
//     </div>
//   );
// }

// export default function ShopResult() {
//   const { scanId } = useParams();
//   const navigate = useNavigate();
//   const [scan, setScan] = useState(null);
//   const [error, setError] = useState(null);
//   const [flagOpen, setFlagOpen] = useState(false);
//   const [flagReason, setFlagReason] = useState("");
//   const [flagObservations, setFlagObservations] = useState("");
//   const [flagSubmitting, setFlagSubmitting] = useState(false);
//   const [flagged, setFlagged] = useState(false);
//   const [flagError, setFlagError] = useState(null);

//   useEffect(() => {
//     api
//       .getScan(scanId)
//       .then(setScan)
//       .catch((e) => setError(e.message));
//   }, [scanId]);

//   if (error) {
//     return (
//       <>
//         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//         <ScreenContent>
//           <p className="text-xs text-fail-text">{error}</p>
//         </ScreenContent>
//       </>
//     );
//   }
//   if (!scan) {
//     return (
//       <>
//         <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//         <ScreenContent>
//           <p className="text-xs text-text-secondary">Loading…</p>
//         </ScreenContent>
//       </>
//     );
//   }

//   const { ocr_result: ocr, compliance_result: compliance, product_verification: verification } = scan;

//   async function submitFlag() {
//     if (!flagReason.trim()) return;
//     setFlagSubmitting(true);
//     setFlagError(null);
//     try {
//       await api.createFlag({
//         scan_id: scan.id,
//         reason: flagReason.trim(),
//         observations: flagObservations.trim() || null,
//       });
//       setFlagged(true);
//       setFlagOpen(false);
//     } catch (err) {
//       setFlagError(err.message);
//     } finally {
//       setFlagSubmitting(false);
//     }
//   }

//   return (
//     <>
//       <TopBar title="Scan result" onBack={() => navigate("/shop")} />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center justify-between mb-1">
//             <CardTitle className="text-[15px]">{scan.image_filename}</CardTitle>
//             <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
//           </div>
//           <CardSub>Compliance score</CardSub>
//           <ProgressBar value={scan.compliance_score} variant={SCORE_VARIANT(scan.compliance_score)} />
//           <CardSub className="mt-1">{scan.compliance_score}/100</CardSub>
//         </Card>

//         {verification && verification.status !== "NO_LICENSE_EXTRACTED" && (
//           <>
//             <SectionLabel>Product registry check</SectionLabel>
//             <Card>
//               <div className="flex items-center justify-between mb-2">
//                 <CardTitle>{verification.matched_product_name || "Not registered"}</CardTitle>
//                 <Pill status={verification.status}>{statusLabel(verification.status)}</Pill>
//               </div>
//               {verification.mismatches?.map((m, i) => (
//                 <div key={i} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{m}</span>
//                 </div>
//               ))}
//               {verification.notes?.map((n, i) => (
//                 <p key={i} className="text-xs text-text-secondary">
//                   {n}
//                 </p>
//               ))}
//             </Card>
//           </>
//         )}

//         {(compliance?.violations?.length > 0 || compliance?.warnings?.length > 0 || compliance?.missing_fields?.length > 0) && (
//           <>
//             <SectionLabel>Compliance details</SectionLabel>
//             <Card>
//               {compliance.violations?.map((v, i) => (
//                 <div key={`v-${i}`} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{v}</span>
//                 </div>
//               ))}
//               {compliance.warnings?.map((w, i) => (
//                 <div key={`w-${i}`} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
//                   <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
//                   <span>{w}</span>
//                 </div>
//               ))}
//               {compliance.missing_fields?.length > 0 && (
//                 <p className="text-[13px] text-text-secondary">
//                   Missing: {compliance.missing_fields.join(", ")}
//                 </p>
//               )}
//             </Card>
//           </>
//         )}

//         <SectionLabel>Extracted from label</SectionLabel>
//         <Card>
//           <KeyValueRow label="FSSAI license" value={ocr?.fssai_license || "Not found"} />
//         </Card>

//         {ocr?.ingredients?.length > 0 && (
//           <Card>
//             <CardTitle>Ingredients</CardTitle>
//             <p className="text-[13px] text-text-secondary">{ocr.ingredients.join(", ")}</p>
//           </Card>
//         )}

//         {ocr?.nutrients && Object.keys(ocr.nutrients).length > 0 && (
//           <Card>
//             <CardTitle className="mb-2">Nutrition (per label)</CardTitle>
//             {Object.entries(ocr.nutrients).map(([k, v]) => (
//               <KeyValueRow key={k} label={k} value={v} />
//             ))}
//           </Card>
//         )}

//         {ocr?.trans_fat_check?.status === "compliant" && (
//           <Card>
//             <div className="flex items-center gap-2 text-[13px] text-pass-text mb-1">
//               <IconCircleCheck size={14} />
//               <span>
//                 Trans fat is {ocr.trans_fat_check.trans_fat_pct_of_declared_total_fat}% of declared
//                 Total Fat, within FSSAI's 2% limit
//               </span>
//             </div>
//             <p className="text-[11px] text-text-secondary">
//               Approximation from label data — the regulation's limit is against total
//               oils/fats used as an ingredient, which isn't printed on any label.
//             </p>
//           </Card>
//         )}

//         {flagged && (
//           <Card>
//             <div className="flex items-center gap-2 text-[13px] text-warn-text">
//               <IconFlag size={14} />
//               <span>Flagged for FSSAI review.</span>
//             </div>
//           </Card>
//         )}

//         {!flagged && !flagOpen && (
//           <ButtonOutline onClick={() => setFlagOpen(true)}>
//             <IconFlag size={14} className="inline mr-1 -mt-0.5" />
//             Flag for FSSAI review
//           </ButtonOutline>
//         )}

//         {flagOpen && (
//           <Card>
//             <CardTitle className="mb-2">Flag this scan</CardTitle>
//             <label className="text-xs text-text-secondary block mb-1">Reason</label>
//             <input
//               value={flagReason}
//               onChange={(e) => setFlagReason(e.target.value)}
//               placeholder="e.g. FSSAI license doesn't match registered product"
//               className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent"
//             />
//             <label className="text-xs text-text-secondary block mb-1">Observations (optional)</label>
//             <textarea
//               value={flagObservations}
//               onChange={(e) => setFlagObservations(e.target.value)}
//               rows={3}
//               className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent resize-none"
//             />
//             {flagError && <p className="text-xs text-fail-text mb-2">{flagError}</p>}
//             <ButtonPrimary onClick={submitFlag} disabled={flagSubmitting || !flagReason.trim()}>
//               {flagSubmitting ? "Submitting…" : "Submit flag"}
//             </ButtonPrimary>
//             <ButtonOutline onClick={() => setFlagOpen(false)} disabled={flagSubmitting}>
//               Cancel
//             </ButtonOutline>
//           </Card>
//         )}

//         <ButtonOutline onClick={() => navigate("/shop/scan")}>Scan another label</ButtonOutline>
//       </ScreenContent>
//     </>
//   );
// }








import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconCircleCheck, IconAlertTriangle, IconFlag } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle, CardSub } from "../../components/Card";
import Pill from "../../components/Pill";
import CircularScore from "../../components/CircularScore";
import { ButtonOutline, ButtonPrimary } from "../../components/Button";
import { api } from "../../lib/api";
import { statusLabel } from "../../lib/format";

const TABS = ["All Fields", "Product Info", "Nutrition", "Ingredients", "Allergens", "Other"];

function KeyValueRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border-tertiary last:border-b-0 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right ml-4">{value}</span>
    </div>
  );
}

// Dense 2-column key/value grid, matching the reference layout -- each
// column is its own independent stack of rows, not a strict paired grid,
// so an odd number of fields doesn't leave an awkward empty cell.
function FieldGrid({ pairs }) {
  const visible = pairs.filter(([, v]) => v);
  const mid = Math.ceil(visible.length / 2);
  const left = visible.slice(0, mid);
  const right = visible.slice(mid);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
      <div>{left.map(([label, value]) => <KeyValueRow key={label} label={label} value={value} />)}</div>
      <div>{right.map(([label, value]) => <KeyValueRow key={label} label={label} value={value} />)}</div>
    </div>
  );
}

export default function ShopResult() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All Fields");

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagObservations, setFlagObservations] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flagError, setFlagError] = useState(null);

  const [rescanOpen, setRescanOpen] = useState(false);
  const [rescanFile, setRescanFile] = useState(null);
  const [rescanSubmitting, setRescanSubmitting] = useState(false);
  const [rescanError, setRescanError] = useState(null);

  useEffect(() => {
    api.getScan(scanId).then(setScan).catch((e) => setError(e.message));
  }, [scanId]);

  if (error) {
    return (
      <>
        <TopBar title="Scan result" onBack={() => navigate("/shop")} />
        <ScreenContent><p className="text-xs text-fail-text">{error}</p></ScreenContent>
      </>
    );
  }
  if (!scan) {
    return (
      <>
        <TopBar title="Scan result" onBack={() => navigate("/shop")} />
        <ScreenContent><p className="text-xs text-text-secondary">Loading…</p></ScreenContent>
      </>
    );
  }

  const { ocr_result: ocr, compliance_result: compliance, product_verification: verification } = scan;
  // Same base URL as every other API call, so it works on the laptop AND on a phone.
  const imageUrl = scan.stored_image_filename ? api.scanImageUrl(scan.stored_image_filename) : null;

  async function submitFlag() {
    if (!flagReason.trim()) return;
    setFlagSubmitting(true);
    setFlagError(null);
    try {
      await api.createFlag({ scan_id: scan.id, reason: flagReason.trim(), observations: flagObservations.trim() || null });
      setFlagged(true);
      setFlagOpen(false);
    } catch (err) {
      setFlagError(err.message);
    } finally {
      setFlagSubmitting(false);
    }
  }

  async function submitRescan() {
    if (!rescanFile) return;
    setRescanSubmitting(true);
    setRescanError(null);
    try {
      const updated = await api.rescanLicense(scan.id, rescanFile);
      setScan(updated);
      setRescanOpen(false);
      setRescanFile(null);
    } catch (err) {
      setRescanError(err.message);
    } finally {
      setRescanSubmitting(false);
    }
  }

  const showProductInfo = activeTab === "All Fields" || activeTab === "Product Info";
  const showNutrition = activeTab === "All Fields" || activeTab === "Nutrition";
  const showIngredients = activeTab === "All Fields" || activeTab === "Ingredients";
  const showAllergens = activeTab === "All Fields" || activeTab === "Allergens";
  const showOther = activeTab === "All Fields" || activeTab === "Other";

  const allergenLines = [
    ...(compliance?.violations || []).filter((v) => v.toLowerCase().includes("allergen")),
    ...(compliance?.warnings || []).filter((w) => w.toLowerCase().includes("allergen")),
  ];
  const otherFindings = [
    ...(compliance?.violations || []).filter((v) => !v.toLowerCase().includes("allergen")),
    ...(compliance?.warnings || []).filter((w) => !w.toLowerCase().includes("allergen")),
  ];

  return (
    <>
      <TopBar title="Scan result" onBack={() => navigate("/shop")} />
      <ScreenContent>
        {/* Summary card: stacks on phones, three columns from sm: up */}
        <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 mb-4 p-4 border border-border-tertiary rounded-app-lg bg-bg-primary">
          {/* thumbnail */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 sm:row-span-2 rounded-app-md overflow-hidden border border-border-tertiary bg-bg-secondary flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt="Scanned label" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs text-center px-2">
                Image not available
              </div>
            )}
          </div>

          {/* filename, date, status */}
          <div className="min-w-0 self-start sm:self-end">
            <p className="text-sm font-semibold text-text-primary truncate">{scan.image_filename}</p>
            <p className="text-xs text-text-tertiary mt-1">
              Scanned {scan.created_at ? new Date(scan.created_at).toLocaleString() : "recently"}
            </p>
            <div className="mt-2.5">
              <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
            </div>
          </div>

          {/* stats + score. On phones this is one row under the thumbnail; on sm: up,
              `contents` dissolves the wrapper so the two children take their own grid cells. */}
          <div className="col-span-2 flex items-center justify-between gap-4 pt-3 border-t border-border-tertiary sm:contents">
            <div className="flex flex-col gap-3 text-xs sm:flex-row sm:gap-6 sm:col-start-2 sm:row-start-2 sm:pt-3 sm:border-t sm:border-border-tertiary sm:self-start">
              <div>
                <p className="text-text-tertiary">FSSAI license</p>
                <p className="text-text-primary font-medium mt-0.5 break-all">{ocr?.fssai_license || "Not found"}</p>
              </div>
              <div>
                <p className="text-text-tertiary">Fields extracted</p>
                <p className="text-text-primary font-medium mt-0.5">
                  {(ocr?.nutrients ? Object.keys(ocr.nutrients).length : 0) + (ocr?.ingredient_details?.length || 0)}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-1.5 sm:col-start-3 sm:row-start-1 sm:row-span-2 sm:self-center">
              <CircularScore value={scan.compliance_score} />
              <p className="text-[11px] text-text-tertiary">Compliance score</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto mb-4 border-b border-border-tertiary">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab ? "border-accent text-accent" : "border-transparent text-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {showProductInfo && (
          <Card>
            <CardTitle className="mb-2">Product info</CardTitle>
            <FieldGrid
              pairs={[
                ["FSSAI license", ocr?.fssai_license || "Not found"],
                ["Registry status", verification?.matched_product_name || (verification?.status !== "NO_LICENSE_EXTRACTED" ? "Not registered" : null)],
              ]}
            />
            {!rescanOpen && (
              <ButtonOutline onClick={() => setRescanOpen(true)} className="mt-3">Rescan FSSAI license only</ButtonOutline>
            )}
            {rescanOpen && (
              <div className="mt-3 p-3 border border-border-tertiary rounded-app-md">
                <p className="text-xs text-text-secondary mb-2">Take a closer photo of just the FSSAI license number.</p>
                <input
                  type="file" accept="image/jpeg,image/jpg,image/png" capture="environment"
                  onChange={(e) => setRescanFile(e.target.files?.[0] || null)}
                  className="text-[13px] mb-2 block"
                />
                {rescanError && <p className="text-xs text-fail-text mb-2">{rescanError}</p>}
                <div className="flex gap-2">
                  <ButtonPrimary onClick={submitRescan} disabled={!rescanFile || rescanSubmitting}>
                    {rescanSubmitting ? "Rescanning…" : "Submit"}
                  </ButtonPrimary>
                  <ButtonOutline onClick={() => { setRescanOpen(false); setRescanFile(null); setRescanError(null); }} disabled={rescanSubmitting}>
                    Cancel
                  </ButtonOutline>
                </div>
              </div>
            )}
            {verification?.mismatches?.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] text-fail-text mt-2">
                <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{m}</span>
              </div>
            ))}
          </Card>
        )}

        {showNutrition && ocr?.nutrients && Object.keys(ocr.nutrients).length > 0 && (
          <Card>
            <CardTitle className="mb-2">Nutrition (per label)</CardTitle>
            <FieldGrid pairs={Object.entries(ocr.nutrients)} />
            {ocr?.trans_fat_check?.status === "compliant" && (
              <div className="flex items-center gap-2 text-[13px] text-pass-text mt-3">
                <IconCircleCheck size={14} />
                <span>Trans fat within FSSAI's 2% limit</span>
              </div>
            )}
          </Card>
        )}

        {showIngredients && (
          <Card>
            <CardTitle className="mb-2">Ingredients</CardTitle>
            {ocr?.ingredient_details?.length > 0 ? (
              ocr.ingredient_details.map((d, i) => (
                <div key={i} className="py-2 border-b border-border-tertiary last:border-b-0">
                  <p className="text-[13px] text-text-primary font-medium">{d.item}</p>
                  {d.matched_name ? (
                    <>
                      <p className="text-[11px] text-text-secondary mt-0.5">{d.summary}</p>
                      <button onClick={() => navigate(`/shop/lookup/${d.slug}`)} className="text-[11px] text-accent mt-0.5">Read more →</button>
                    </>
                  ) : (
                    <button onClick={() => navigate(`/shop/lookup?q=${encodeURIComponent(d.item)}`)} className="text-[11px] text-text-tertiary mt-0.5 underline">
                      Not recognized — search for it
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[13px] text-text-secondary">{ocr?.ingredients?.join(", ") || "No ingredients extracted"}</p>
            )}
            <ButtonOutline onClick={() => navigate("/shop/lookup")} className="mt-3">Look up any ingredient</ButtonOutline>

            {ocr?.ins_details?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-tertiary">
                <CardTitle className="mb-2">Additives (INS numbers)</CardTitle>
                {ocr.ins_details.map((d, i) => (
                  <div key={i} className="py-2 border-b border-border-tertiary last:border-b-0">
                    <p className="text-[13px] text-text-primary font-medium">INS {d.code}{d.names ? ` — ${d.names}` : ""}</p>
                    {d.encyclopedia_summary && <p className="text-[11px] text-text-secondary mt-0.5">{d.encyclopedia_summary}</p>}
                    {d.encyclopedia_slug && (
                      <button onClick={() => navigate(`/shop/lookup/${d.encyclopedia_slug}`)} className="text-[11px] text-accent mt-0.5">Read more →</button>
                    )}
                    {d.not_found && (
                      <button onClick={() => navigate(`/shop/lookup?q=INS ${d.code}`)} className="text-[11px] text-text-tertiary mt-0.5 underline">
                        Not recognized — search for it
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {showAllergens && (
          <Card>
            <CardTitle className="mb-2">Allergens</CardTitle>
            {allergenLines.length > 0 ? (
              allergenLines.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
                  <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-text-secondary">No allergen concerns flagged.</p>
            )}
          </Card>
        )}

        {showOther && (
          <>
            {(otherFindings.length > 0 || compliance?.missing_fields?.length > 0) && (
              <Card>
                <CardTitle className="mb-2">Other findings</CardTitle>
                {otherFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
                    <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
                {compliance?.missing_fields?.length > 0 && (
                  <p className="text-[13px] text-text-secondary">Missing: {compliance.missing_fields.join(", ")}</p>
                )}
              </Card>
            )}

            {flagged && (
              <Card>
                <div className="flex items-center gap-2 text-[13px] text-warn-text">
                  <IconFlag size={14} />
                  <span>Flagged for FSSAI review.</span>
                </div>
              </Card>
            )}
            {!flagged && !flagOpen && (
              <ButtonOutline onClick={() => setFlagOpen(true)}>
                <IconFlag size={14} className="inline mr-1 -mt-0.5" />
                Flag for FSSAI review
              </ButtonOutline>
            )}
            {flagOpen && (
              <Card>
                <CardTitle className="mb-2">Flag this scan</CardTitle>
                <label className="text-xs text-text-secondary block mb-1">Reason</label>
                <input value={flagReason} onChange={(e) => setFlagReason(e.target.value)} placeholder="e.g. FSSAI license doesn't match registered product" className="form-input mb-2" />
                <label className="text-xs text-text-secondary block mb-1">Observations (optional)</label>
                <textarea value={flagObservations} onChange={(e) => setFlagObservations(e.target.value)} rows={3} className="form-input mb-2" />
                {flagError && <p className="text-xs text-fail-text mb-2">{flagError}</p>}
                <ButtonPrimary onClick={submitFlag} disabled={flagSubmitting || !flagReason.trim()}>
                  {flagSubmitting ? "Submitting…" : "Submit flag"}
                </ButtonPrimary>
                <ButtonOutline onClick={() => setFlagOpen(false)} disabled={flagSubmitting}>Cancel</ButtonOutline>
              </Card>
            )}
          </>
        )}

        <ButtonOutline onClick={() => navigate("/shop/scan")} className="mt-3">Scan another label</ButtonOutline>
      </ScreenContent>
    </>
  );
}