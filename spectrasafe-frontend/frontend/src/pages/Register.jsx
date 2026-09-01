// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Screen, { ScreenContent } from "../components/Screen";
// import { ButtonPrimary } from "../components/Button";

// const ROLE_HOME = { BRAND: "/brand", SHOPKEEPER: "/shop", FSSAI: "/fssai" };

// const ROLES = [
//   { value: "BRAND", label: "Brand / Manufacturer" },
//   { value: "SHOPKEEPER", label: "Shopkeeper / Retailer" },
//   { value: "FSSAI", label: "FSSAI / Regulatory Official" },
// ];

// const inputClass =
//   "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent";

// export default function Register() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "SHOPKEEPER",
//     organization: "",
//   });
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   function update(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const user = await register(form);
//       navigate(ROLE_HOME[user.role] || "/");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <Screen>
//       <ScreenContent className="flex flex-col justify-center min-h-screen">
//         <h1 className="text-xl font-medium text-text-primary mb-1">Create account</h1>
//         <p className="text-sm text-text-secondary mb-6">Join SpectraSafe</p>

//         <form onSubmit={handleSubmit}>
//           <label className="text-xs text-text-secondary block mb-1">Full name</label>
//           <input
//             required
//             value={form.name}
//             onChange={(e) => update("name", e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs text-text-secondary block mb-1">Email</label>
//           <input
//             type="email"
//             required
//             autoComplete="email"
//             value={form.email}
//             onChange={(e) => update("email", e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs text-text-secondary block mb-1">Password</label>
//           <input
//             type="password"
//             required
//             minLength={8}
//             autoComplete="new-password"
//             value={form.password}
//             onChange={(e) => update("password", e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs text-text-secondary block mb-1">Role</label>
//           <select
//             value={form.role}
//             onChange={(e) => update("role", e.target.value)}
//             className={inputClass}
//           >
//             {ROLES.map((r) => (
//               <option key={r.value} value={r.value}>
//                 {r.label}
//               </option>
//             ))}
//           </select>

//           <label className="text-xs text-text-secondary block mb-1">
//             {form.role === "BRAND" && "Company name"}
//             {form.role === "SHOPKEEPER" && "Store name"}
//             {form.role === "FSSAI" && "Zone / jurisdiction"}
//             {" (optional)"}
//           </label>
//           <input
//             value={form.organization}
//             onChange={(e) => update("organization", e.target.value)}
//             className={inputClass}
//           />

//           {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//           <ButtonPrimary type="submit" disabled={submitting}>
//             {submitting ? "Creating account…" : "Create account"}
//           </ButtonPrimary>
//         </form>

//         <p className="text-xs text-text-secondary text-center mt-4">
//           Already have an account?{" "}
//           <Link to="/login" className="text-accent">
//             Sign in
//           </Link>
//         </p>
//       </ScreenContent>
//     </Screen>
//   );
// }














// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { ButtonPrimary } from "../components/Button";

// const ROLE_HOME = { BRAND: "/brand", SHOPKEEPER: "/shop", FSSAI: "/fssai" };

// const ROLES = [
//   { value: "BRAND", label: "Brand / Manufacturer" },
//   { value: "SHOPKEEPER", label: "Shopkeeper / Retailer" },
//   { value: "FSSAI", label: "FSSAI / Regulatory Official" },
// ];

// const inputClass =
//   "w-full px-3.5 py-2.5 mb-4 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

// export default function Register() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "SHOPKEEPER",
//     organization: "",
//   });
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   function update(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const user = await register(form);
//       navigate(ROLE_HOME[user.role] || "/");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-[440px] bg-bg-primary border border-border-tertiary rounded-app-lg shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
//         <div className="flex items-center gap-2 mb-1">
//           <div className="w-8 h-8 rounded-app-md bg-accent-bg text-accent flex items-center justify-center font-semibold text-sm">
//             S
//           </div>
//           <h1 className="text-lg font-semibold text-text-primary">Create account</h1>
//         </div>
//         <p className="text-sm text-text-secondary mb-6">Join SpectraSafe</p>

//         <form onSubmit={handleSubmit}>
//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Full name</label>
//           <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />

//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Email</label>
//           <input
//             type="email"
//             required
//             autoComplete="email"
//             value={form.email}
//             onChange={(e) => update("email", e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Password</label>
//           <input
//             type="password"
//             required
//             minLength={8}
//             autoComplete="new-password"
//             value={form.password}
//             onChange={(e) => update("password", e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Role</label>
//           <select value={form.role} onChange={(e) => update("role", e.target.value)} className={inputClass}>
//             {ROLES.map((r) => (
//               <option key={r.value} value={r.value}>
//                 {r.label}
//               </option>
//             ))}
//           </select>

//           <label className="text-xs font-medium text-text-secondary block mb-1.5">
//             {form.role === "BRAND" && "Company name"}
//             {form.role === "SHOPKEEPER" && "Store name"}
//             {form.role === "FSSAI" && "Zone / jurisdiction"}
//             {" (optional)"}
//           </label>
//           <input value={form.organization} onChange={(e) => update("organization", e.target.value)} className={inputClass} />

//           {error && <p className="text-xs text-fail-text mb-3">{error}</p>}

//           <ButtonPrimary type="submit" disabled={submitting}>
//             {submitting ? "Creating account…" : "Create account"}
//           </ButtonPrimary>
//         </form>

//         <p className="text-xs text-text-secondary text-center mt-5">
//           Already have an account?{" "}
//           <Link to="/login" className="text-accent font-medium">
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }












import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ButtonPrimary } from "../components/Button";

const ROLE_HOME = {
  BRAND: "/brand",
  SHOPKEEPER: "/shop",
  FSSAI: "/fssai",
};

const ROLES = [
  {
    value: "BRAND",
    label: "Brand / Manufacturer",
    description: "Manage products and compliance",
    icon: "▣",
  },
  {
    value: "SHOPKEEPER",
    label: "Shopkeeper / Retailer",
    description: "Verify products before selling",
    icon: "⌂",
  },
  {
    value: "FSSAI",
    label: "FSSAI / Regulatory Official",
    description: "Monitor safety and compliance",
    icon: "✓",
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SHOPKEEPER",
    organization: "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await register(form);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 sm:p-6">

      {/* Main container */}
      <div className="relative w-full max-w-[1180px] min-h-[720px] grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(20,22,26,0.12)] border border-[#e7e8ed]">

        {/* =====================================================
            LEFT — INDIA / SPECTRASAFE BRANDING
        ====================================================== */}
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#f9f8f2]">

          {/* India background image */}
          <img
            src="/image.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-left"
          />

          {/* Soft overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f4]/95 via-[#faf9f4]/65 to-[#faf9f4]/10" />

          {/* Purple atmospheric glow */}
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#4338ca]/10 blur-[100px]" />

          {/* Content */}
          <div className="relative z-10 p-10">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#4338ca] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(67,56,202,0.28)]">
                <span className="text-lg font-bold">S</span>
              </div>

              <div>
                <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[#15172a]">
                  SpectraSafe
                </h1>

                <p className="text-[11px] text-[#6c7080]">
                  Product Safety Intelligence
                </p>
              </div>

            </div>

            {/* Hero */}
            <div className="mt-24 max-w-[390px]">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-white shadow-sm mb-5">

                <span className="w-1.5 h-1.5 rounded-full bg-[#2f9e44]" />

                <span className="text-[11px] font-medium text-[#555a68]">
                  Built for India's food ecosystem
                </span>

              </div>

              <h2 className="text-[42px] leading-[1.08] tracking-[-0.04em] font-semibold text-[#111936]">
                Building a safer
                <br />
                <span className="text-[#4338ca]">India,</span> together.
              </h2>

              <p className="mt-6 text-[14px] leading-6 text-[#5f6473] max-w-[350px]">
                Empowering brands, retailers and regulatory teams
                to make smarter product safety and compliance decisions.
              </p>

            </div>

            {/* Features */}
            <div className="mt-10 space-y-4 max-w-[390px]">

              <Feature
                number="01"
                title="Verify with confidence"
                description="Instant product verification and compliance checks."
              />

              <Feature
                number="02"
                title="Stay compliant"
                description="Meet FSSAI standards and regulatory requirements."
              />

              <Feature
                number="03"
                title="Drive better decisions"
                description="Data-driven insights for a safer food ecosystem."
              />

            </div>

          </div>

          {/* Bottom */}
          <div className="relative z-10 px-10 pb-8">

            <div className="flex items-center gap-2 text-[11px] text-[#6e7280]">

              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/80 border border-white">
                ✓
              </span>

              Secure compliance workspace

            </div>

          </div>

        </section>


        {/* =====================================================
            RIGHT — REGISTER FORM
        ====================================================== */}
        <section className="flex flex-col justify-center bg-white">

          <div className="w-full max-w-[510px] mx-auto px-7 py-10 sm:px-10 lg:px-12">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-9">

              <div className="w-10 h-10 rounded-xl bg-[#4338ca] text-white flex items-center justify-center">
                <span className="font-bold">S</span>
              </div>

              <div>
                <p className="font-semibold text-[#15161b]">
                  SpectraSafe
                </p>

                <p className="text-[10px] text-[#9297a3]">
                  Product Safety Intelligence
                </p>
              </div>

            </div>


            {/* Header */}
            <div className="mb-8">

              <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#4338ca] mb-2">
                Get started
              </p>

              <h2 className="text-[29px] leading-tight font-semibold tracking-[-0.03em] text-[#14161a]">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-[#6b7280]">
                Set up your SpectraSafe workspace in a few steps.
              </p>

            </div>


            <form onSubmit={handleSubmit}>

              {/* Name */}
              <FormField label="Full name">

                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />

              </FormField>


              {/* Email */}
              <FormField label="Email address">

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@company.com"
                  className="form-input"
                />

              </FormField>


              {/* Password */}
              <FormField
                label="Password"
                helper="Minimum 8 characters"
              >

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Create a secure password"
                  className="form-input"
                />

              </FormField>


              {/* Account type */}
              <div className="mb-5">

                <label className="block text-xs font-semibold text-[#3f4350] mb-2.5">
                  Account type
                </label>

                <div className="space-y-2">

                  {ROLES.map((role) => {

                    const active = form.role === role.value;

                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => update("role", role.value)}
                        className={`
                          w-full flex items-center gap-3
                          rounded-xl border px-3.5 py-3
                          text-left transition-all duration-150
                          ${
                            active
                              ? "border-[#4338ca] bg-[#f7f6ff] shadow-[0_0_0_1px_#4338ca]"
                              : "border-[#e0e2e7] bg-white hover:bg-[#fafafa] hover:border-[#c9cbd2]"
                          }
                        `}
                      >

                        {/* Icon */}
                        <div
                          className={`
                            w-9 h-9 flex-shrink-0 rounded-lg
                            flex items-center justify-center
                            text-sm font-semibold
                            ${
                              active
                                ? "bg-[#4338ca] text-white"
                                : "bg-[#f1f2f5] text-[#777c87]"
                            }
                          `}
                        >
                          {role.icon}
                        </div>


                        {/* Text */}
                        <div className="flex-1 min-w-0">

                          <p
                            className={`text-sm font-semibold ${
                              active
                                ? "text-[#302a79]"
                                : "text-[#25272d]"
                            }`}
                          >
                            {role.label}
                          </p>

                          <p className="text-[11px] text-[#858a95] mt-0.5">
                            {role.description}
                          </p>

                        </div>


                        {/* Radio */}
                        <div
                          className={`
                            w-4 h-4 rounded-full border
                            flex items-center justify-center
                            ${
                              active
                                ? "border-[#4338ca]"
                                : "border-[#cdd0d7]"
                            }
                          `}
                        >
                          {active && (
                            <div className="w-2 h-2 rounded-full bg-[#4338ca]" />
                          )}
                        </div>

                      </button>
                    );

                  })}

                </div>

              </div>


              {/* Organization */}
              <FormField
                label={
                  form.role === "BRAND"
                    ? "Company name"
                    : form.role === "SHOPKEEPER"
                    ? "Store name"
                    : "Zone / jurisdiction"
                }
                optional
              >

                <input
                  value={form.organization}
                  onChange={(e) =>
                    update("organization", e.target.value)
                  }
                  placeholder={
                    form.role === "BRAND"
                      ? "e.g. ABC Foods Pvt. Ltd."
                      : form.role === "SHOPKEEPER"
                      ? "e.g. Green Mart"
                      : "e.g. Chennai Zone"
                  }
                  className="form-input"
                />

              </FormField>


              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl border border-[#f1caca] bg-[#fff6f6] px-4 py-3">

                  <p className="text-xs text-[#b91c1c]">
                    {error}
                  </p>

                </div>
              )}


              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full h-12
                  rounded-xl
                  bg-[#4338ca]
                  text-white
                  text-sm font-semibold
                  shadow-[0_8px_20px_rgba(67,56,202,0.20)]
                  transition-all
                  hover:bg-[#3730a3]
                  hover:shadow-[0_10px_24px_rgba(67,56,202,0.25)]
                  active:scale-[0.99]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {submitting ? "Creating account…" : "Create account"}
              </button>

            </form>


            {/* Sign in */}
            <div className="mt-6 pt-5 border-t border-[#eef0f2]">

              <p className="text-xs text-center text-[#737883]">

                Already have a SpectraSafe account?{" "}

                <Link
                  to="/login"
                  className="font-semibold text-[#4338ca] hover:text-[#3126a6]"
                >
                  Sign in
                </Link>

              </p>

            </div>


            {/* Legal */}
            <p className="mt-5 text-[10px] leading-4 text-center text-[#a0a4ad]">
              By creating an account, you agree to our{" "}
              <span className="text-[#777b87]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-[#777b87]">
                Privacy Policy
              </span>
              .
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}


/* ============================================================
   SMALL REUSABLE COMPONENTS
============================================================ */

function FormField({ label, helper, optional, children }) {
  return (
    <div className="mb-5">

      <div className="flex items-center justify-between mb-2">

        <label className="text-xs font-semibold text-[#3f4350]">
          {label}
          {optional && (
            <span className="font-normal text-[#a0a4ad]">
              {" "}· Optional
            </span>
          )}
        </label>

        {helper && (
          <span className="text-[10px] text-[#9a9ea8]">
            {helper}
          </span>
        )}

      </div>

      {children}

    </div>
  );
}


function Feature({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">

      <div className="
        w-8 h-8 flex-shrink-0
        rounded-lg
        bg-white/85
        border border-white
        shadow-sm
        flex items-center justify-center
        text-[10px]
        font-semibold
        text-[#4338ca]
      ">
        {number}
      </div>

      <div>

        <p className="text-sm font-semibold text-[#252a43]">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-5 text-[#666b79] max-w-[280px]">
          {description}
        </p>

      </div>

    </div>
  );
}