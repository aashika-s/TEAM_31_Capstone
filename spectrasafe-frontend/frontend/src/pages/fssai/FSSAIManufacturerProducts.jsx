// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import { api } from "../../lib/api";

// export default function FSSAIManufacturerProducts() {
//   const { manufacturerName } = useParams();
//   const navigate = useNavigate();
//   const [products, setProducts] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api
//       .listProducts({ manufacturer: manufacturerName })
//       .then(setProducts)
//       .catch((e) => setError(e.message));
//   }, [manufacturerName]);

//   return (
//     <>
//       <TopBar title={decodeURIComponent(manufacturerName)} onBack={() => navigate("/fssai/manufacturers")} />
//       <ScreenContent>
//         {error && <p className="text-xs text-fail-text">{error}</p>}
//         {!products && !error && <p className="text-xs text-text-secondary">Loading…</p>}
//         {products && products.length > 0 && (
//           <Card>
//             {products.map((p) => (
//               <ListItem
//                 key={p.id}
//                 title={p.product_name}
//                 sub={`${p.brand_name} · FSSAI ${p.fssai_license}`}
//                 onClick={() => navigate(`/fssai/products/${p.id}`)}
//               />
//             ))}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }




import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { ButtonPrimary } from "../../components/Button";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { api } from "../../lib/api";

export default function FSSAIManufacturerProducts() {
  const { manufacturerName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listProducts({ manufacturer: manufacturerName })
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [manufacturerName]);

  return (
    <>
      <TopBar title={decodeURIComponent(manufacturerName)} onBack={() => navigate("/fssai/manufacturers")} />
      <ScreenContent>
        {error && <p className="text-xs text-fail-text">{error}</p>}
        {!products && !error && <p className="text-xs text-text-secondary">Loading…</p>}
        {products && products.length > 0 && (
          <Card>
            {products.map((p) => (
              <ListItem
                key={p.id}
                title={p.product_name}
                sub={`${p.brand_name} · FSSAI ${p.fssai_license}`}
                onClick={() => navigate(`/fssai/products/${p.id}`)}
              />
            ))}
          </Card>
        )}

        {products && (
          <ButtonPrimary
  onClick={() =>
    navigate(
      `/fssai/notice/new?manufacturer_name=${encodeURIComponent(manufacturerName)}` +
        (products[0]?.fssai_license ? `&fssai_license=${encodeURIComponent(products[0].fssai_license)}` : "")
    )
  }
>
  Take action
</ButtonPrimary>
        )}
      </ScreenContent>
    </>
  );
}