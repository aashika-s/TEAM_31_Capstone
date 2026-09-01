// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card, { CardTitle } from "../../components/Card";
// import Pill from "../../components/Pill";
// import { api } from "../../lib/api";

// const SECTION_LABEL = {
//   history_and_sourcing: "History & sourcing",
//   culinary_usage_home: "Culinary use (home cooking)",
//   industrial_applications: "Industrial applications",
//   distinction_and_confusion: "Often confused with",
// };

// export default function ShopLookupDetail() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const [entry, setEntry] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setEntry(null);
//     api
//       .getEncyclopediaEntry(slug)
//       .then(setEntry)
//       .catch((e) => setError(e.message));
//   }, [slug]);

//   if (error) {
//     return (
//       <>
//         <TopBar title="Ingredient" onBack={() => navigate(-1)} />
//         <ScreenContent>
//           <p className="text-xs text-fail-text">{error}</p>
//         </ScreenContent>
//       </>
//     );
//   }
//   if (!entry) {
//     return (
//       <>
//         <TopBar title="Ingredient" onBack={() => navigate(-1)} />
//         <ScreenContent>
//           <p className="text-xs text-text-secondary">Loading…</p>
//         </ScreenContent>
//       </>
//     );
//   }

//   return (
//     <>
//       <TopBar title={entry.name} onBack={() => navigate(-1)} />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center justify-between mb-1">
//             <CardTitle className="text-[15px]">{entry.name}</CardTitle>
//             <Pill variant="purple">{entry.category}</Pill>
//           </div>
//         </Card>

//         {Object.entries(entry.description || {}).map(
//           ([key, text]) =>
//             text && (
//               <Card key={key}>
//                 <CardTitle className="mb-1.5">{SECTION_LABEL[key] || key}</CardTitle>
//                 <p className="text-[13px] text-text-secondary whitespace-pre-line">{text}</p>
//               </Card>
//             )
//         )}

//         {entry.keywords?.length > 0 && (
//           <div className="flex flex-wrap gap-1.5 mt-1">
//             {entry.keywords.map((k) => (
//               <span key={k} className="text-[11px] px-2 py-1 bg-bg-secondary text-text-secondary rounded-full">
//                 {k}
//               </span>
//             ))}
//           </div>
//         )}
//       </ScreenContent>
//     </>
//   );
// }






import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle } from "../../components/Card";
import Pill from "../../components/Pill";
import { api } from "../../lib/api";

const SECTION_LABEL = {
  history_and_sourcing: "History & sourcing",
  culinary_usage_home: "Culinary use (home cooking)",
  industrial_applications: "Industrial applications",
  distinction_and_confusion: "Often confused with",
  // Leaner sections for entries sourced from the INS reference table
  // rather than a full encyclopedia article (see backend's
  // encyclopedia_service._ins_index_record) -- less detail is available,
  // but it's real data, not a placeholder.
  type: "Additive type",
  regulatory_status: "Regulatory status",
  other_names: "Also known as",
};

export default function ShopLookupDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEntry(null);
    api
      .getEncyclopediaEntry(slug)
      .then(setEntry)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <>
        <TopBar title="Ingredient" onBack={() => navigate(-1)} />
        <ScreenContent>
          <p className="text-xs text-fail-text">{error}</p>
        </ScreenContent>
      </>
    );
  }
  if (!entry) {
    return (
      <>
        <TopBar title="Ingredient" onBack={() => navigate(-1)} />
        <ScreenContent>
          <p className="text-xs text-text-secondary">Loading…</p>
        </ScreenContent>
      </>
    );
  }

  return (
    <>
      <TopBar title={entry.name} onBack={() => navigate(-1)} />
      <ScreenContent>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-[15px]">{entry.name}</CardTitle>
            <Pill variant="purple">{entry.category}</Pill>
          </div>
        </Card>

        {Object.entries(entry.description || {}).map(
          ([key, text]) =>
            text && (
              <Card key={key}>
                <CardTitle className="mb-1.5">{SECTION_LABEL[key] || key}</CardTitle>
                <p className="text-[13px] text-text-secondary whitespace-pre-line">{text}</p>
              </Card>
            )
        )}

        {entry.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {entry.keywords.map((k) => (
              <span key={k} className="text-[11px] px-2 py-1 bg-bg-secondary text-text-secondary rounded-full">
                {k}
              </span>
            ))}
          </div>
        )}
      </ScreenContent>
    </>
  );
}