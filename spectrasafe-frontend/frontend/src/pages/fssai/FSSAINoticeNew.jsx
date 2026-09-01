// import { useState } from "react";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { IconFileText, IconBan, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import { ButtonPrimary, ButtonOutline } from "../../components/Button";
// import Card, { CardTitle } from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import { api } from "../../lib/api";

// const NOTICE_TYPES = [
//   { key: "SHOW_CAUSE", label: "Show cause notice", desc: "Request explanation from manufacturer", icon: IconAlertTriangle },
//   { key: "STOP_SALE", label: "Stop sale order", desc: "Immediate halt on product sales", icon: IconBan },
//   { key: "RECALL", label: "Recall notice", desc: "Product recall from market", icon: IconFileText },
// ];

// export default function FSSAINoticeNew() {
//   const { manufacturerName } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [noticeType, setNoticeType] = useState(null);
//   const [details, setDetails] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [issuedNotice, setIssuedNotice] = useState(null);

//   const fssaiLicense = searchParams.get("fssai_license") || null;

//   async function handleSubmit() {
//     if (!noticeType || !details.trim()) return;
//     setSubmitting(true);
//     setError(null);
//     try {
//       const notice = await api.createNotice({
//         manufacturer_name: decodeURIComponent(manufacturerName),
//         fssai_license: fssaiLicense,
//         notice_type: noticeType,
//         details: details.trim(),
//       });
//       setIssuedNotice(notice);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (issuedNotice) {
//     return (
//       <>
//         <TopBar title="Notice issued" onBack={() => navigate(`/fssai/manufacturers/${manufacturerName}`)} />
//         <ScreenContent>
//           <Card>
//             <CardTitle>Notice issued successfully</CardTitle>
//             <p className="text-xs text-text-secondary mb-3">
//               {NOTICE_TYPES.find((t) => t.key === issuedNotice.notice_type)?.label} sent for{" "}
//               {issuedNotice.manufacturer_name}.
//             </p>
//             <ButtonPrimary onClick={() => api.downloadNoticePdf(issuedNotice.id)}>
//               Download PDF
//             </ButtonPrimary>
//             <ButtonOutline onClick={() => navigate(`/fssai/manufacturers/${manufacturerName}`)}>
//               Back to manufacturer
//             </ButtonOutline>
//           </Card>
//         </ScreenContent>
//       </>
//     );
//   }

//   return (
//     <>
//       <TopBar title="Take action" onBack={() => navigate(-1)} />
//       <ScreenContent>
//         <p className="text-xs text-text-secondary mb-3">
//           Issuing against <strong>{decodeURIComponent(manufacturerName)}</strong>
//         </p>

//         <Card>
//   {NOTICE_TYPES.map((t) => (
//     <ListItem
//       key={t.key}
//       icon={<t.icon size={16} />}
//       title={t.label}
//       sub={t.desc}
//       onClick={() => setNoticeType(t.key)}
//       className={noticeType === t.key ? "bg-bg-secondary" : ""}
//       right={noticeType === t.key ? <IconCircleCheck size={18} className="text-accent" /> : null}
//     />
//   ))}
// </Card>

//         <textarea
//           value={details}
//           onChange={(e) => setDetails(e.target.value)}
//           placeholder="Grounds for this notice (cite specific findings — missing license, allergen non-declaration, etc.)"
//           rows={5}
//           className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm mt-3 mb-3 bg-bg-primary text-text-primary"
//         />

//         {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//         <ButtonPrimary onClick={handleSubmit} disabled={!noticeType || !details.trim() || submitting}>
//           {submitting ? "Issuing notice…" : "Issue notice"}
//         </ButtonPrimary>
//       </ScreenContent>
//     </>
//   );
// }



















import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconFileText, IconBan, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import Card, { CardTitle } from "../../components/Card";
import ListItem from "../../components/ListItem";
import { api } from "../../lib/api";

const NOTICE_TYPES = [
  { key: "SHOW_CAUSE", label: "Show cause notice", desc: "Request explanation from manufacturer", icon: IconAlertTriangle },
  { key: "STOP_SALE", label: "Stop sale order", desc: "Immediate halt on product sales", icon: IconBan },
  { key: "RECALL", label: "Recall notice", desc: "Product recall from market", icon: IconFileText },
];

export default function FSSAINoticeNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [manufacturerName, setManufacturerName] = useState(searchParams.get("manufacturer_name") || "");
  const [noticeType, setNoticeType] = useState(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [issuedNotice, setIssuedNotice] = useState(null);

  const fssaiLicense = searchParams.get("fssai_license") || null;
  const flagId = searchParams.get("flag_id") || null;

  async function handleSubmit() {
    if (!manufacturerName.trim() || !noticeType || !details.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const notice = await api.createNotice({
        manufacturer_name: manufacturerName.trim(),
        fssai_license: fssaiLicense,
        notice_type: noticeType,
        details: details.trim(),
        flag_id: flagId,
      });
      setIssuedNotice(notice);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (issuedNotice) {
    return (
      <>
        <TopBar title="Notice issued" onBack={() => navigate("/fssai")} />
        <ScreenContent>
          <Card>
            <CardTitle>Notice issued successfully</CardTitle>
            <p className="text-xs text-text-secondary mb-3">
              {NOTICE_TYPES.find((t) => t.key === issuedNotice.notice_type)?.label} sent for{" "}
              {issuedNotice.manufacturer_name}.
            </p>
            <ButtonPrimary onClick={() => api.downloadNoticePdf(issuedNotice.id)}>
              Download PDF
            </ButtonPrimary>
            <ButtonOutline onClick={() => navigate("/fssai")}>Back to home</ButtonOutline>
          </Card>
        </ScreenContent>
      </>
    );
  }

  return (
    <>
      <TopBar title="Take action" onBack={() => navigate(-1)} />
      <ScreenContent>
        <label className="text-xs text-text-secondary mb-1 block">Manufacturer name</label>
        <input
          type="text"
          value={manufacturerName}
          onChange={(e) => setManufacturerName(e.target.value)}
          placeholder="e.g. Test Snack Co"
          className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm mb-3 bg-bg-primary text-text-primary"
        />

        <Card>
          {NOTICE_TYPES.map((t) => (
            <ListItem
              key={t.key}
              icon={<t.icon size={16} />}
              title={t.label}
              sub={t.desc}
              onClick={() => setNoticeType(t.key)}
              className={noticeType === t.key ? "bg-bg-secondary" : ""}
              right={noticeType === t.key ? <IconCircleCheck size={18} className="text-accent" /> : null}
            />
          ))}
        </Card>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Grounds for this notice (cite specific findings — missing license, allergen non-declaration, etc.)"
          rows={5}
          className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm mt-3 mb-3 bg-bg-primary text-text-primary"
        />

        {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

        <ButtonPrimary
          onClick={handleSubmit}
          disabled={!manufacturerName.trim() || !noticeType || !details.trim() || submitting}
        >
          {submitting ? "Issuing notice…" : "Issue notice"}
        </ButtonPrimary>
      </ScreenContent>
    </>
  );
}