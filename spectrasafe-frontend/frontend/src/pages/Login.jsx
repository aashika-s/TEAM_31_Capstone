// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Screen, { ScreenContent } from "../components/Screen";
// import { ButtonPrimary } from "../components/Button";

// const ROLE_HOME = { BRAND: "/brand", SHOPKEEPER: "/shop", FSSAI: "/fssai" };

// const inputClass =
//   "w-full px-3 py-2.5 mb-3 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const user = await login(email, password);
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
//         <h1 className="text-xl font-medium text-text-primary mb-1">SpectraSafe</h1>
//         <p className="text-sm text-text-secondary mb-6">Sign in to continue</p>

//         <form onSubmit={handleSubmit}>
//           <label className="text-xs text-text-secondary block mb-1">Email</label>
//           <input
//             type="email"
//             required
//             autoComplete="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs text-text-secondary block mb-1">Password</label>
//           <input
//             type="password"
//             required
//             autoComplete="current-password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className={inputClass}
//           />

//           {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//           <ButtonPrimary type="submit" disabled={submitting}>
//             {submitting ? "Signing in…" : "Sign in"}
//           </ButtonPrimary>
//         </form>

//         <p className="text-xs text-text-secondary text-center mt-4">
//           No account?{" "}
//           <Link to="/register" className="text-accent">
//             Register
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

// const inputClass =
//   "w-full px-3.5 py-2.5 mb-4 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const user = await login(email, password);
//       navigate(ROLE_HOME[user.role] || "/");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-bg-tertiary flex items-center justify-center px-4">
//       <div className="w-full max-w-[400px] bg-bg-primary border border-border-tertiary rounded-app-lg shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
//         <div className="flex items-center gap-2 mb-1">
//           <div className="w-8 h-8 rounded-app-md bg-accent-bg text-accent flex items-center justify-center font-semibold text-sm">
//             S
//           </div>
//           <h1 className="text-lg font-semibold text-text-primary">SpectraSafe</h1>
//         </div>
//         <p className="text-sm text-text-secondary mb-6">Sign in to your account</p>

//         <form onSubmit={handleSubmit}>
//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Email</label>
//           <input
//             type="email"
//             required
//             autoComplete="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className={inputClass}
//           />

//           <label className="text-xs font-medium text-text-secondary block mb-1.5">Password</label>
//           <input
//             type="password"
//             required
//             autoComplete="current-password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className={inputClass}
//           />

//           {error && <p className="text-xs text-fail-text mb-3">{error}</p>}

//           <ButtonPrimary type="submit" disabled={submitting}>
//             {submitting ? "Signing in…" : "Sign in"}
//           </ButtonPrimary>
//         </form>

//         <p className="text-xs text-text-secondary text-center mt-5">
//           No account?{" "}
//           <Link to="/register" className="text-accent font-medium">
//             Register
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

const ROLE_HOME = { BRAND: "/brand", SHOPKEEPER: "/shop", FSSAI: "/fssai", SPCB: "/spcb", CPCB: "/cpcb" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-y-auto bg-[#f6fbf9] flex items-center justify-center p-4 sm:p-6">

      {/* =====================================================
          FULL INDIA-THEMED BACKGROUND
      ====================================================== */}

      <img
        src="/image.png"
        alt=""
        className="
          fixed inset-0
          w-full h-full
          object-cover
          object-left
          pointer-events-none
        "
      />

      {/* Soft readability overlay */}
      <div
        className="
          fixed inset-0
          bg-gradient-to-r
          from-[#fbf8f3]/75
          via-[#fbf8f3]/55
          to-[#f6fbf9]/85
          pointer-events-none
        "
      />

      {/* Subtle purple glow */}
      <div
        className="
          fixed
          -top-40
          -right-40
          w-[500px]
          h-[500px]
          rounded-full
          bg-[#38ca86]/8
          blur-[110px]
          pointer-events-none
        "
      />


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 w-full max-w-[1000px] grid lg:grid-cols-[1fr_420px] gap-12 items-center">

        {/* ===================================================
            LEFT BRANDING
        ==================================================== */}

        <div className="hidden lg:block max-w-[460px]">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">

            <div className="
              w-11 h-11
              rounded-xl
              bg-[#38ca86]
              text-white
              flex items-center justify-center
              shadow-[0_8px_20px_rgba(31,109,71,0.25)]
            ">
              <span className="text-lg font-bold">
                S
              </span>
            </div>

            <div>

              <h1 className="
                text-[18px]
                font-semibold
                tracking-[-0.02em]
                text-[#152a20]
              ">
                SpectraSafe
              </h1>

              <p className="text-[11px] text-[#81776b]">
                Product Safety Intelligence
              </p>

            </div>

          </div>


          {/* Heading */}

          <div>

            <div className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-white/80
              border border-white
              shadow-sm
              mb-5
            ">

              <span className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#2f9e50]
              " />

              <span className="
                text-[11px]
                font-medium
                text-[#55685f]
              ">
                Built for India's food ecosystem
              </span>

            </div>


            <h2 className="
              text-[42px]
              leading-[1.08]
              tracking-[-0.04em]
              font-semibold
              text-[#113625]
            ">
              Safer products.
              <br />
              <span className="text-[#38ca86]">
                Smarter decisions.
              </span>
            </h2>


            <p className="
              mt-6
              text-[14px]
              leading-6
              text-[#726a60]
              max-w-[400px]
            ">
              Verify products, identify compliance risks,
              and make confident safety decisions with
              SpectraSafe.
            </p>

          </div>


          {/* Trust points */}

          <div className="mt-10 space-y-4">

            <TrustPoint
              title="Product verification"
              description="Check products against safety requirements."
            />

            <TrustPoint
              title="Compliance intelligence"
              description="Identify potential regulatory issues early."
            />

            <TrustPoint
              title="Built for India's ecosystem"
              description="Designed around brands, retailers and regulators."
            />

          </div>

        </div>


        {/* ===================================================
            LOGIN CARD
        ==================================================== */}

        <div className="
          w-full
          bg-white/95
          backdrop-blur-xl
          border border-white
          rounded-[26px]
          shadow-[0_25px_70px_rgba(20,22,26,0.14)]
          p-7
          sm:p-9
          lg:p-10
        ">

          {/* Mobile logo */}

          <div className="
            flex
            lg:hidden
            items-center
            gap-3
            mb-9
          ">

            <div className="
              w-10 h-10
              rounded-xl
              bg-[#38ca86]
              text-white
              flex items-center justify-center
            ">
              <span className="font-bold">
                S
              </span>
            </div>

            <div>

              <p className="font-semibold text-[#151b18]">
                SpectraSafe
              </p>

              <p className="text-[10px] text-[#a59b90]">
                Product Safety Intelligence
              </p>

            </div>

          </div>


          {/* Header */}

          <div className="mb-8">

            <p className="
              text-[11px]
              uppercase
              tracking-[0.14em]
              font-semibold
              text-[#38ca86]
              mb-2
            ">
              Welcome back
            </p>

            <h2 className="
              text-[29px]
              leading-tight
              font-semibold
              tracking-[-0.03em]
              text-[#141a17]
            ">
              Sign in to SpectraSafe
            </h2>

            <p className="
              mt-2
              text-sm
              text-[#80766b]
            ">
              Continue to your safety and compliance workspace.
            </p>

          </div>


          {/* Form */}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="mb-5">

              <label className="
                block
                text-xs
                font-semibold
                text-[#3f5048]
                mb-2
              ">
                Email address
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="form-input"
              />

            </div>


            {/* Password */}

            <div className="mb-5">

              <div className="
                flex
                items-center
                justify-between
                mb-2
              ">

                <label className="
                  text-xs
                  font-semibold
                  text-[#3f5048]
                ">
                  Password
                </label>

              </div>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />

            </div>


            {/* Error */}

            {error && (
              <div className="
                mb-5
                rounded-xl
                border
                border-[#f1ccca]
                bg-[#fef7f7]
                px-4
                py-3
              ">

                <p className="text-xs text-[#b9241c]">
                  {error}
                </p>

              </div>
            )}


            {/* Submit */}

            <button
              type="submit"
              disabled={submitting}
              className="
                w-full
                h-12
                rounded-xl
                bg-[#38ca86]
                text-white
                text-sm
                font-semibold
                shadow-[0_8px_20px_rgba(31,109,71,0.20)]
                transition-all
                hover:bg-[#30a36d]
                hover:shadow-[0_10px_24px_rgba(31,109,71,0.25)]
                active:scale-[0.99]
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {submitting
                ? "Signing in…"
                : "Sign in"}
            </button>

          </form>


          {/* Register */}

          <div className="
            mt-7
            pt-6
            border-t
            border-[#eef2f0]
          ">

            <p className="
              text-xs
              text-center
              text-[#867c70]
            ">
              Don't have a SpectraSafe account?{" "}

              <Link
                to="/register"
                className="
                  font-semibold
                  text-[#38ca86]
                  hover:text-[#27a56a]
                "
              >
                Create an account
              </Link>
            </p>

          </div>


          {/* Security */}

          <div className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            text-[10px]
            text-[#aaa298]
          ">

            <span className="
              w-5 h-5
              rounded-full
              bg-[#eff7f1]
              text-[#2f9e50]
              flex items-center justify-center
            ">
              ✓
            </span>

            Secure compliance workspace

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   TRUST POINT
============================================================ */

function TrustPoint({ title, description }) {
  return (
    <div className="flex items-start gap-3">

      <div className="
        w-8 h-8
        flex-shrink-0
        rounded-lg
        bg-white/90
        border border-white
        shadow-sm
        flex items-center justify-center
        text-[#38ca86]
        text-sm
      ">
        ✓
      </div>

      <div>

        <p className="
          text-sm
          font-semibold
          text-[#254335]
        ">
          {title}
        </p>

        <p className="
          mt-0.5
          text-[11px]
          leading-5
          text-[#7a7065]
        ">
          {description}
        </p>

      </div>

    </div>
  );
}