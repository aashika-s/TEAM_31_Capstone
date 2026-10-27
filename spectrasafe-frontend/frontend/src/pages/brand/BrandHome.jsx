// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconPackage } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Avatar from "../../components/Avatar";
// import MetricRow from "../../components/MetricRow";
// import SectionLabel from "../../components/SectionLabel";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import { ButtonPrimary } from "../../components/Button";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// // Deliberately does NOT show "compliant/needs review/non-compliant"
// // product counts like the wireframe's dashboard -- that data would come
// // from the label studio's compliance checker at registration time, which
// // doesn't exist here (that's the separate, in-progress label studio
// // piece). What's shown is real: total products actually registered.
// export default function BrandHome() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [products, setProducts] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api
//       .listProducts()
//       .then(setProducts)
//       .catch((e) => setError(e.message));
//   }, []);

//   return (
//     <>
//       <TopBar title="SpectraSafe" right={<Avatar initials={initials(user?.name)} />} />
//       <ScreenContent>
//         <p className="text-xs text-text-secondary mb-3">{user?.organization || user?.name}</p>

//         <MetricRow metrics={[{ value: products?.length ?? "—", label: "Products registered" }]} />

//         <ButtonPrimary onClick={() => navigate("/brand/products/new")}>
//           <IconPackage size={16} className="inline mr-1 -mt-0.5" />
//           Register a new product
//         </ButtonPrimary>

//         <SectionLabel>Recently registered</SectionLabel>
//         {error && <p className="text-xs text-fail-text">{error}</p>}
//         {!products && !error && <p className="text-xs text-text-secondary">Loading…</p>}
//         {products && products.length === 0 && (
//           <p className="text-xs text-text-secondary">No products registered yet.</p>
//         )}
//         {products && products.length > 0 && (
//           <Card>
//             {products.slice(0, 10).map((p) => (
//               <ListItem
//                 key={p.id}
//                 title={p.product_name}
//                 sub={`${p.manufacturer_name} · ${timeAgo(p.created_at)}`}
//                 onClick={() => navigate(`/brand/products/${p.id}`)}
//               />
//             ))}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }













// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   IconPackage,
//   IconPlus,
//   IconChevronRight,
//   IconBuildingFactory,
//   IconClock,
//   IconArrowRight,
//   IconShieldCheck,
//   IconSparkles,
// } from "@tabler/icons-react";

// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Avatar from "../../components/Avatar";
// import { ButtonPrimary } from "../../components/Button";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";

// function initials(name) {
//   if (!name) return "?";

//   return name
//     .split(" ")
//     .map((p) => p[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();
// }

// export default function BrandHome() {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [products, setProducts] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api
//       .listProducts()
//       .then(setProducts)
//       .catch((e) => setError(e.message));
//   }, []);

//   const productCount = products?.length ?? null;

//   return (
//     <>
//       <TopBar
//         title="SpectraSafe"
//         right={<Avatar initials={initials(user?.name)} />}
//       />

//       <ScreenContent>
//         <div className="relative">

//           {/* =====================================================
//               SUBTLE BACKGROUND DECORATION
//           ====================================================== */}

//           <div
//             className="
//               pointer-events-none
//               absolute
//               -top-8
//               -right-10
//               w-[280px]
//               h-[280px]
//               rounded-full
//               bg-[#38ca86]
//               opacity-[0.025]
//               blur-3xl
//             "
//           />

//           {/* =====================================================
//               WELCOME HEADER
//           ====================================================== */}

//           <div className="relative mb-7">

//             <div
//               className="
//                 inline-flex
//                 items-center
//                 gap-1.5
//                 px-2.5
//                 py-1
//                 rounded-full
//                 bg-[#f0fcf6]
//                 text-[#38ca86]
//                 text-[9px]
//                 font-bold
//                 tracking-[0.08em]
//                 mb-3
//               "
//             >
//               <IconBuildingFactory size={11} />
//               BRAND PORTAL
//             </div>

//             <h1
//               className="
//                 text-[26px]
//                 sm:text-[30px]
//                 font-semibold
//                 tracking-[-0.035em]
//                 text-[#17251e]
//                 leading-tight
//               "
//             >
//               Welcome back
//             </h1>

//             <p
//               className="
//                 text-sm
//                 text-[#867c70]
//                 mt-1.5
//               "
//             >
//               {user?.organization || user?.name}
//             </p>

//           </div>


//           {/* =====================================================
//               OVERVIEW
//           ====================================================== */}

//           <div
//             className="
//               relative
//               bg-white
//               border
//               border-[#e4ebe8]
//               rounded-2xl
//               shadow-[0_5px_22px_rgba(20,22,26,0.035)]
//               overflow-hidden
//               mb-5
//             "
//           >

//             <div className="p-5 sm:p-6">

//               <div className="flex items-start justify-between gap-4">

//                 <div>

//                   <div className="flex items-center gap-2 mb-2">

//                     <div
//                       className="
//                         w-9
//                         h-9
//                         rounded-xl
//                         bg-[#f0fcf6]
//                         text-[#38ca86]
//                         flex
//                         items-center
//                         justify-center
//                       "
//                     >
//                       <IconPackage size={18} />
//                     </div>

//                     <div>

//                       <p
//                         className="
//                           text-[10px]
//                           uppercase
//                           tracking-[0.07em]
//                           font-semibold
//                           text-[#a39a8f]
//                         "
//                       >
//                         Product portfolio
//                       </p>

//                       <p
//                         className="
//                           text-[23px]
//                           font-semibold
//                           tracking-tight
//                           text-[#202a25]
//                           leading-tight
//                         "
//                       >
//                         {productCount ?? "—"}
//                       </p>

//                     </div>

//                   </div>

//                   <p
//                     className="
//                       text-[11px]
//                       text-[#988e82]
//                       mt-3
//                     "
//                   >
//                     Products currently registered with SpectraSafe.
//                   </p>

//                 </div>


//                 <div
//                   className="
//                     hidden
//                     sm:flex
//                     w-11
//                     h-11
//                     rounded-2xl
//                     bg-[#f7fbf9]
//                     items-center
//                     justify-center
//                     text-[#9d9387]
//                   "
//                 >
//                   <IconShieldCheck size={21} />
//                 </div>

//               </div>

//             </div>


//             <div
//               className="
//                 h-[3px]
//                 bg-gradient-to-r
//                 from-[#38ca86]
//                 via-[#63d9a2]
//                 to-transparent
//                 opacity-80
//               "
//             />

//           </div>


//           {/* =====================================================
//               PRIMARY ACTION
//           ====================================================== */}

//           <button
//             type="button"
//             onClick={() => navigate("/brand/products/new")}
//             className="
//               group
//               w-full
//               relative
//               overflow-hidden
//               rounded-2xl
//               bg-[#38ca86]
//               text-white
//               px-5
//               py-4
//               mb-7
//               text-left
//               shadow-[0_8px_24px_rgba(31,109,71,0.18)]
//               hover:bg-[#30a36d]
//               transition-all
//             "
//           >

//             <div
//               className="
//                 absolute
//                 -right-5
//                 -top-8
//                 w-28
//                 h-28
//                 rounded-full
//                 bg-white/10
//               "
//             />

//             <div className="relative flex items-center gap-3">

//               <div
//                 className="
//                   w-10
//                   h-10
//                   rounded-xl
//                   bg-white/15
//                   flex
//                   items-center
//                   justify-center
//                   flex-shrink-0
//                 "
//               >
//                 <IconPlus size={19} />
//               </div>

//               <div className="flex-1">

//                 <p className="text-sm font-semibold">
//                   Register a new product
//                 </p>

//                 <p className="text-[10px] text-white/70 mt-0.5">
//                   Add a product to your verified portfolio
//                 </p>

//               </div>

//               <IconArrowRight
//                 size={18}
//                 className="
//                   opacity-70
//                   group-hover:translate-x-1
//                   transition-transform
//                 "
//               />

//             </div>

//           </button>


//           {/* =====================================================
//               RECENT PRODUCTS HEADER
//           ====================================================== */}

//           <div className="flex items-end justify-between mb-3">

//             <div>

//               <p
//                 className="
//                   text-[10px]
//                   uppercase
//                   tracking-[0.08em]
//                   font-bold
//                   text-[#988e82]
//                 "
//               >
//                 Your portfolio
//               </p>

//               <h2
//                 className="
//                   text-base
//                   font-semibold
//                   text-[#29342f]
//                   mt-1
//                 "
//               >
//                 Recently registered
//               </h2>

//             </div>

//             {products && products.length > 0 && (
//               <button
//                 type="button"
//                 onClick={() => navigate("/brand/products")}
//                 className="
//                   text-[10px]
//                   font-semibold
//                   text-[#38ca86]
//                   hover:text-[#26a369]
//                 "
//               >
//                 View all
//               </button>
//             )}

//           </div>


//           {/* =====================================================
//               ERROR
//           ====================================================== */}

//           {error && (
//             <div
//               className="
//                 bg-[#fef6f6]
//                 border
//                 border-[#f0cecc]
//                 rounded-xl
//                 px-4
//                 py-3
//                 mb-4
//                 text-xs
//                 text-[#b9241c]
//               "
//             >
//               {error}
//             </div>
//           )}


//           {/* =====================================================
//               LOADING
//           ====================================================== */}

//           {!products && !error && (
//             <div
//               className="
//                 bg-white
//                 border
//                 border-[#e4ebe8]
//                 rounded-2xl
//                 px-5
//                 py-10
//                 text-center
//               "
//             >

//               <div
//                 className="
//                   w-10
//                   h-10
//                   rounded-xl
//                   bg-[#f0fcf6]
//                   text-[#38ca86]
//                   flex
//                   items-center
//                   justify-center
//                   mx-auto
//                   mb-3
//                   animate-pulse
//                 "
//               >
//                 <IconPackage size={19} />
//               </div>

//               <p className="text-xs text-[#867c70]">
//                 Loading your products…
//               </p>

//             </div>
//           )}


//           {/* =====================================================
//               EMPTY STATE
//           ====================================================== */}

//           {products && products.length === 0 && (
//             <div
//               className="
//                 bg-white
//                 border
//                 border-dashed
//                 border-[#d8e2dd]
//                 rounded-2xl
//                 px-6
//                 py-12
//                 text-center
//               "
//             >

//               <div
//                 className="
//                   w-12
//                   h-12
//                   rounded-2xl
//                   bg-[#f3f9f6]
//                   text-[#988e82]
//                   flex
//                   items-center
//                   justify-center
//                   mx-auto
//                   mb-4
//                 "
//               >
//                 <IconPackage size={22} />
//               </div>

//               <h3
//                 className="
//                   text-sm
//                   font-semibold
//                   text-[#36423c]
//                 "
//               >
//                 No products registered
//               </h3>

//               <p
//                 className="
//                   text-[11px]
//                   text-[#988e82]
//                   mt-1.5
//                   max-w-[280px]
//                   mx-auto
//                 "
//               >
//                 Register your first product to start building
//                 your verified portfolio.
//               </p>

//               <button
//                 type="button"
//                 onClick={() => navigate("/brand/products/new")}
//                 className="
//                   mt-4
//                   inline-flex
//                   items-center
//                   gap-1.5
//                   text-[11px]
//                   font-semibold
//                   text-[#38ca86]
//                   hover:text-[#26a369]
//                 "
//               >
//                 Register your first product
//                 <IconArrowRight size={13} />
//               </button>

//             </div>
//           )}


//           {/* =====================================================
//               PRODUCT LIST
//           ====================================================== */}

//           {products && products.length > 0 && (
//             <div
//               className="
//                 bg-white
//                 border
//                 border-[#e4ebe8]
//                 rounded-2xl
//                 shadow-[0_5px_20px_rgba(20,22,26,0.03)]
//                 overflow-hidden
//               "
//             >

//               {products.slice(0, 10).map((product, index) => (
//                 <button
//                   key={product.id}
//                   type="button"
//                   onClick={() =>
//                     navigate(`/brand/products/${product.id}`)
//                   }
//                   className="
//                     w-full
//                     flex
//                     items-center
//                     gap-3
//                     px-5
//                     py-4
//                     text-left
//                     border-b
//                     border-[#f1f1f1]
//                     last:border-b-0
//                     hover:bg-[#fbfefd]
//                     transition-colors
//                     group
//                   "
//                 >

//                   {/* Product icon */}

//                   <div
//                     className="
//                       w-10
//                       h-10
//                       rounded-xl
//                       bg-[#f2fbf7]
//                       text-[#38ca86]
//                       flex
//                       items-center
//                       justify-center
//                       flex-shrink-0
//                     "
//                   >
//                     <IconPackage size={18} />
//                   </div>


//                   {/* Product details */}

//                   <div className="min-w-0 flex-1">

//                     <p
//                       className="
//                         text-xs
//                         font-semibold
//                         text-[#29342f]
//                         truncate
//                       "
//                     >
//                       {product.product_name}
//                     </p>

//                     <div
//                       className="
//                         flex
//                         items-center
//                         gap-1.5
//                         mt-1
//                       "
//                     >

//                       <span
//                         className="
//                           text-[10px]
//                           text-[#988e82]
//                           truncate
//                         "
//                       >
//                         {product.manufacturer_name}
//                       </span>

//                       <span className="text-[#ccc7c1]">
//                         ·
//                       </span>

//                       <span
//                         className="
//                           text-[10px]
//                           text-[#aaa196]
//                           flex
//                           items-center
//                           gap-1
//                           whitespace-nowrap
//                         "
//                       >
//                         <IconClock size={10} />
//                         {timeAgo(product.created_at)}
//                       </span>

//                     </div>

//                   </div>


//                   {/* Arrow */}

//                   <IconChevronRight
//                     size={16}
//                     className="
//                       text-[#bfb8b1]
//                       group-hover:text-[#38ca86]
//                       group-hover:translate-x-0.5
//                       transition-all
//                       flex-shrink-0
//                     "
//                   />

//                 </button>
//               ))}

//             </div>
//           )}


//           {/* =====================================================
//               FOOTER
//           ====================================================== */}

//           <div
//             className="
//               flex
//               items-center
//               justify-center
//               gap-2
//               mt-5
//               text-[10px]
//               text-[#aaa196]
//             "
//           >
//             <IconShieldCheck size={13} />
//             Product information is securely associated with your account.
//           </div>

//         </div>
//       </ScreenContent>
//     </>
//   );
// }








import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconPackage,
  IconPlus,
  IconChevronRight,
  IconClock,
  IconArrowRight,
  IconShieldCheck,
  IconFileText,
} from "@tabler/icons-react";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

export default function BrandHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState(null);
  const [labels, setLabels] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listProducts().then(setProducts).catch((e) => setError(e.message));
    api.listLabels().then(setLabels).catch(() => {});
  }, []);

  const productCount = products?.length ?? null;
  const labelCount = labels?.length ?? null;

  const verifiedPct =
    products && products.length > 0
      ? Math.round(
          (products.filter(
            (p) => p.verification_status === "VERIFIED"
          ).length /
            products.length) *
            100
        )
      : null;

  return (
    <div className="max-w-[1050px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12">

      {/* HERO */}
      <div
        className="relative rounded-app-lg overflow-hidden mb-6 px-6 py-8 sm:px-8 sm:py-10"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(43,38,32,0.82) 0%,
              rgba(43,38,32,0.55) 55%,
              rgba(43,38,32,0.18) 100%
            ),
            url("https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.01em] text-white">
          Welcome back, {user?.organization || user?.name}.
        </h1>

        <p className="mt-2 text-sm text-white/85 max-w-[420px]">
          Manage your product portfolio and create compliant labels with ease.
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricTile
          icon={IconPackage}
          value={productCount ?? "—"}
          label="Product portfolio"
          description="Products registered"
        />

        <MetricTile
          icon={IconFileText}
          value={labelCount ?? "—"}
          label="Labels created"
          description="Total label designs"
          tone="info"
        />

        <MetricTile
          icon={IconShieldCheck}
          value={verifiedPct !== null ? `${verifiedPct}%` : "—"}
          label="FSSAI verified"
          description="Of registered products"
          tone="pass"
        />
      </div>

      {/* PRIMARY ACTION */}
      <button
        type="button"
        onClick={() => navigate("/brand/products/new")}
        className="group w-full rounded-app-lg bg-accent text-white px-5 py-4 mb-7 text-left shadow-[var(--shadow-elevated)] hover:brightness-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-app-md bg-white/15 flex items-center justify-center flex-shrink-0">
            <IconPlus size={19} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold">
              Register a new product
            </p>

            <p className="text-[11px] text-white/75 mt-0.5">
              Add a product to your verified portfolio
            </p>
          </div>

          <IconArrowRight
            size={18}
            className="opacity-80 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </button>

      {/* RECENT PRODUCTS HEADER */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold text-text-tertiary">
            Your portfolio
          </p>

          <h2 className="text-base font-semibold text-text-primary mt-1">
            Recently registered
          </h2>
        </div>

        {products && products.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/brand/products")}
            className="text-[11px] font-semibold text-accent-text hover:text-accent"
          >
            View all
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-4 py-3 mb-4 text-xs text-fail-text">
          {error}
        </div>
      )}

      {/* LOADING */}
      {!products && !error && (
        <div className="bg-bg-primary border border-border-tertiary rounded-app-lg px-5 py-10 text-center">
          <p className="text-xs text-text-secondary">
            Loading your products…
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {products && products.length === 0 && (
        <div className="bg-bg-primary border border-dashed border-border-secondary rounded-app-lg px-6 py-12 text-center">
          <div className="w-12 h-12 rounded-app-lg bg-bg-secondary text-text-tertiary flex items-center justify-center mx-auto mb-4">
            <IconPackage size={22} />
          </div>

          <h3 className="text-sm font-semibold text-text-primary">
            No products registered
          </h3>

          <p className="text-[11px] text-text-secondary mt-1.5 max-w-[280px] mx-auto">
            Register your first product to start building your verified portfolio.
          </p>

          <button
            type="button"
            onClick={() => navigate("/brand/products/new")}
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent-text hover:text-accent"
          >
            Register your first product
            <IconArrowRight size={13} />
          </button>
        </div>
      )}

      {/* RECENT PRODUCTS */}
      {products && products.length > 0 && (
        <div className="bg-bg-primary border border-border-tertiary rounded-app-lg shadow-[var(--shadow-card)] overflow-hidden">
          {products.slice(0, 10).map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => navigate(`/brand/products/${product.id}`)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left border-b border-border-tertiary last:border-b-0 hover:bg-bg-secondary transition-colors group"
            >
              <div className="w-10 h-10 rounded-app-md bg-accent-bg text-accent-text flex items-center justify-center flex-shrink-0">
                <IconPackage size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {product.product_name}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-text-secondary truncate">
                    {product.manufacturer_name}
                  </span>

                  <span className="text-text-tertiary">·</span>

                  <span className="text-[10px] text-text-tertiary flex items-center gap-1 whitespace-nowrap">
                    <IconClock size={10} />
                    {timeAgo(product.created_at)}
                  </span>
                </div>
              </div>

              <IconChevronRight
                size={16}
                className="text-text-tertiary group-hover:text-accent-text group-hover:translate-x-0.5 transition-all flex-shrink-0"
              />
            </button>
          ))}
        </div>
      )}

      {/* FOOTER NOTE */}
      <div className="flex items-center justify-center gap-2 mt-5 text-[10px] text-text-tertiary">
        <IconShieldCheck size={13} />
        Product information is securely associated with your account.
      </div>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  value,
  label,
  description,
  tone,
}) {
  const toneStyles =
    tone === "pass"
      ? "bg-pass-bg text-pass-text"
      : tone === "info"
      ? "bg-info-bg text-info-text"
      : "bg-accent-bg text-accent-text";

  return (
    <div className="bg-bg-primary border border-border-tertiary rounded-app-lg shadow-[var(--shadow-card)] p-4">
      <div
        className={`w-9 h-9 rounded-app-md flex items-center justify-center ${toneStyles}`}
      >
        <Icon size={18} />
      </div>

      <p className="text-[22px] font-bold tracking-tight text-text-primary mt-3">
        {value}
      </p>

      <p className="text-xs font-semibold text-text-secondary mt-0.5">
        {label}
      </p>

      <p className="text-[10px] text-text-tertiary mt-0.5">
        {description}
      </p>
    </div>
  );
}