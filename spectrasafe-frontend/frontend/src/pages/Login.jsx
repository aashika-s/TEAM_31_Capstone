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

const ROLE_HOME = {
  BRAND: "/brand",
  SHOPKEEPER: "/shop",
  FSSAI: "/fssai",
};

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
    <div className="relative min-h-screen overflow-y-auto bg-[#f6f7fb] flex items-center justify-center p-4 sm:p-6">

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
          from-[#faf9f4]/75
          via-[#faf9f4]/55
          to-[#f6f7fb]/85
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
          bg-[#4338ca]/8
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
              bg-[#4338ca]
              text-white
              flex items-center justify-center
              shadow-[0_8px_20px_rgba(67,56,202,0.25)]
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
                text-[#15172a]
              ">
                SpectraSafe
              </h1>

              <p className="text-[11px] text-[#6c7080]">
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
                bg-[#2f9e44]
              " />

              <span className="
                text-[11px]
                font-medium
                text-[#555a68]
              ">
                Built for India's food ecosystem
              </span>

            </div>


            <h2 className="
              text-[42px]
              leading-[1.08]
              tracking-[-0.04em]
              font-semibold
              text-[#111936]
            ">
              Safer products.
              <br />
              <span className="text-[#4338ca]">
                Smarter decisions.
              </span>
            </h2>


            <p className="
              mt-6
              text-[14px]
              leading-6
              text-[#5f6473]
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
              bg-[#4338ca]
              text-white
              flex items-center justify-center
            ">
              <span className="font-bold">
                S
              </span>
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

            <p className="
              text-[11px]
              uppercase
              tracking-[0.14em]
              font-semibold
              text-[#4338ca]
              mb-2
            ">
              Welcome back
            </p>

            <h2 className="
              text-[29px]
              leading-tight
              font-semibold
              tracking-[-0.03em]
              text-[#14161a]
            ">
              Sign in to SpectraSafe
            </h2>

            <p className="
              mt-2
              text-sm
              text-[#6b7280]
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
                text-[#3f4350]
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
                  text-[#3f4350]
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
                border-[#f1caca]
                bg-[#fff6f6]
                px-4
                py-3
              ">

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
                w-full
                h-12
                rounded-xl
                bg-[#4338ca]
                text-white
                text-sm
                font-semibold
                shadow-[0_8px_20px_rgba(67,56,202,0.20)]
                transition-all
                hover:bg-[#3730a3]
                hover:shadow-[0_10px_24px_rgba(67,56,202,0.25)]
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
            border-[#eef0f2]
          ">

            <p className="
              text-xs
              text-center
              text-[#737883]
            ">
              Don't have a SpectraSafe account?{" "}

              <Link
                to="/register"
                className="
                  font-semibold
                  text-[#4338ca]
                  hover:text-[#3126a6]
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
            text-[#9a9ea8]
          ">

            <span className="
              w-5 h-5
              rounded-full
              bg-[#f1f5f1]
              text-[#2f9e44]
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
        text-[#4338ca]
        text-sm
      ">
        ✓
      </div>

      <div>

        <p className="
          text-sm
          font-semibold
          text-[#252a43]
        ">
          {title}
        </p>

        <p className="
          mt-0.5
          text-[11px]
          leading-5
          text-[#666b79]
        ">
          {description}
        </p>

      </div>

    </div>
  );
}