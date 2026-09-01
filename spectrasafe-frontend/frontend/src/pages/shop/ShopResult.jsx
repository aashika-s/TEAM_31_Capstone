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
import SectionLabel from "../../components/SectionLabel";
import ProgressBar from "../../components/ProgressBar";
import { ButtonOutline, ButtonPrimary } from "../../components/Button";
import { api } from "../../lib/api";
import { statusLabel } from "../../lib/format";

const SCORE_VARIANT = (score) => (score >= 80 ? "pass" : score >= 50 ? "warn" : "fail");

function KeyValueRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

export default function ShopResult() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
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
    api
      .getScan(scanId)
      .then(setScan)
      .catch((e) => setError(e.message));
  }, [scanId]);

  if (error) {
    return (
      <>
        <TopBar title="Scan result" onBack={() => navigate("/shop")} />
        <ScreenContent>
          <p className="text-xs text-fail-text">{error}</p>
        </ScreenContent>
      </>
    );
  }
  if (!scan) {
    return (
      <>
        <TopBar title="Scan result" onBack={() => navigate("/shop")} />
        <ScreenContent>
          <p className="text-xs text-text-secondary">Loading…</p>
        </ScreenContent>
      </>
    );
  }

  const { ocr_result: ocr, compliance_result: compliance, product_verification: verification } = scan;

  async function submitFlag() {
    if (!flagReason.trim()) return;
    setFlagSubmitting(true);
    setFlagError(null);
    try {
      await api.createFlag({
        scan_id: scan.id,
        reason: flagReason.trim(),
        observations: flagObservations.trim() || null,
      });
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

  return (
    <>
      <TopBar title="Scan result" onBack={() => navigate("/shop")} />
      <ScreenContent>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-[15px]">{scan.image_filename}</CardTitle>
            <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
          </div>
          <CardSub>Compliance score</CardSub>
          <ProgressBar value={scan.compliance_score} variant={SCORE_VARIANT(scan.compliance_score)} />
          <CardSub className="mt-1">{scan.compliance_score}/100</CardSub>
        </Card>

        {verification && verification.status !== "NO_LICENSE_EXTRACTED" && (
          <>
            <SectionLabel>Product registry check</SectionLabel>
            <Card>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{verification.matched_product_name || "Not registered"}</CardTitle>
                <Pill status={verification.status}>{statusLabel(verification.status)}</Pill>
              </div>
              {verification.mismatches?.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
                  <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
              {verification.notes?.map((n, i) => (
                <p key={i} className="text-xs text-text-secondary">
                  {n}
                </p>
              ))}
            </Card>
          </>
        )}

        {(compliance?.violations?.length > 0 || compliance?.warnings?.length > 0 || compliance?.missing_fields?.length > 0) && (
          <>
            <SectionLabel>Compliance details</SectionLabel>
            <Card>
              {compliance.violations?.map((v, i) => (
                <div key={`v-${i}`} className="flex items-start gap-2 text-[13px] text-fail-text mb-1.5">
                  <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{v}</span>
                </div>
              ))}
              {compliance.warnings?.map((w, i) => (
                <div key={`w-${i}`} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
                  <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
              {compliance.missing_fields?.length > 0 && (
                <p className="text-[13px] text-text-secondary">
                  Missing: {compliance.missing_fields.join(", ")}
                </p>
              )}
            </Card>
          </>
        )}

        <SectionLabel>Extracted from label</SectionLabel>
<Card>
  <KeyValueRow label="FSSAI license" value={ocr?.fssai_license || "Not found"} />
</Card>

{!rescanOpen && (
  <ButtonOutline onClick={() => setRescanOpen(true)}>
    Rescan FSSAI license only
  </ButtonOutline>
)}

{rescanOpen && (
  <Card>
    <CardTitle className="mb-2">Rescan FSSAI license</CardTitle>
    <CardSub className="mb-2">
      Take a closer photo of just the FSSAI license number — useful if it's printed away
      from the nutrition panel or wasn't legible in the original scan.
    </CardSub>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png"
      capture="environment"
      onChange={(e) => setRescanFile(e.target.files?.[0] || null)}
      className="text-[13px] mb-2 block"
    />
    {rescanError && <p className="text-xs text-fail-text mb-2">{rescanError}</p>}
    <ButtonPrimary onClick={submitRescan} disabled={!rescanFile || rescanSubmitting}>
      {rescanSubmitting ? "Rescanning…" : "Submit"}
    </ButtonPrimary>
    <ButtonOutline
      onClick={() => {
        setRescanOpen(false);
        setRescanFile(null);
        setRescanError(null);
      }}
      disabled={rescanSubmitting}
    >
      Cancel
    </ButtonOutline>
  </Card>
)}
        {/* Fallback for older scans made before ingredient_details existed */}
        {!ocr?.ingredient_details?.length && ocr?.ingredients?.length > 0 && (
          <Card>
            <CardTitle>Ingredients</CardTitle>
            <p className="text-[13px] text-text-secondary">{ocr.ingredients.join(", ")}</p>
          </Card>
        )}

        {ocr?.ins_details?.length > 0 && (
          <Card>
            <CardTitle className="mb-2">Additives (INS numbers)</CardTitle>
            {ocr.ins_details.map((d, i) => (
              <div key={i} className="py-2 border-b border-border-tertiary last:border-b-0">
                <p className="text-[13px] text-text-primary font-medium">
                  INS {d.code}
                  {d.names ? ` — ${d.names}` : ""}
                </p>
                {d.encyclopedia_summary && (
                  <p className="text-[11px] text-text-secondary mt-0.5">{d.encyclopedia_summary}</p>
                )}
                {d.encyclopedia_slug && (
                  <button
                    onClick={() => navigate(`/shop/lookup/${d.encyclopedia_slug}`)}
                    className="text-[11px] text-accent mt-0.5"
                  >
                    Read more →
                  </button>
                )}
                {d.not_found && (
                  <button
                    onClick={() => navigate(`/shop/lookup?q=INS ${d.code}`)}
                    className="text-[11px] text-text-tertiary mt-0.5 underline"
                  >
                    Not recognized — search for it
                  </button>
                )}
              </div>
            ))}
          </Card>
        )}

        <ButtonOutline onClick={() => navigate("/shop/lookup")}>Look up any ingredient</ButtonOutline>

        {ocr?.nutrients && Object.keys(ocr.nutrients).length > 0 && (
          <Card>
            <CardTitle className="mb-2">Nutrition (per label)</CardTitle>
            {Object.entries(ocr.nutrients).map(([k, v]) => (
              <KeyValueRow key={k} label={k} value={v} />
            ))}
          </Card>
        )}

        {ocr?.trans_fat_check?.status === "compliant" && (
          <Card>
            <div className="flex items-center gap-2 text-[13px] text-pass-text mb-1">
              <IconCircleCheck size={14} />
              <span>
                Trans fat is {ocr.trans_fat_check.trans_fat_pct_of_declared_total_fat}% of declared
                Total Fat, within FSSAI's 2% limit
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Approximation from label data — the regulation's limit is against total
              oils/fats used as an ingredient, which isn't printed on any label.
            </p>
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
            <input
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. FSSAI license doesn't match registered product"
              className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent"
            />
            <label className="text-xs text-text-secondary block mb-1">Observations (optional)</label>
            <textarea
              value={flagObservations}
              onChange={(e) => setFlagObservations(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 mb-2 border border-border-tertiary rounded-app-md text-[13px] bg-bg-primary text-text-primary outline-none focus:border-accent resize-none"
            />
            {flagError && <p className="text-xs text-fail-text mb-2">{flagError}</p>}
            <ButtonPrimary onClick={submitFlag} disabled={flagSubmitting || !flagReason.trim()}>
              {flagSubmitting ? "Submitting…" : "Submit flag"}
            </ButtonPrimary>
            <ButtonOutline onClick={() => setFlagOpen(false)} disabled={flagSubmitting}>
              Cancel
            </ButtonOutline>
          </Card>
        )}

        <ButtonOutline onClick={() => navigate("/shop/scan")}>Scan another label</ButtonOutline>
      </ScreenContent>
    </>
  );
}