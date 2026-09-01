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





















import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconCamera,
  IconUpload,
  IconMapPin,
  IconShieldCheck,
  IconArrowLeft,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";

import { api } from "../../lib/api";

export default function ShopScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];

    if (!f) return;

    setFile(f);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(f));
  }

  function resetFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAnalyze() {
    if (!file || !location.trim()) {
      setError("Please select a label image and enter your shop location.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scan = await api.createScan(
        file,
        location.trim()
      );

      navigate(`/shop/result/${scan.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">

      {/* =====================================================
          SUBTLE BACKGROUND
      ====================================================== */}

      <div
        className="
          absolute
          top-0
          right-0
          w-[520px]
          h-[420px]
          pointer-events-none
          opacity-[0.045]
        "
      >
        <img
          src="/spectrasafe-india-bg.png"
          alt=""
          className="
            w-full
            h-full
            object-cover
            object-right
          "
        />
      </div>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          max-w-[1050px]
          mx-auto
          px-5
          sm:px-8
          lg:px-10
          pt-7
          pb-12
        "
      >

        {/* ===================================================
            BACK
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-[#6f7380]
            hover:text-[#4338ca]
            transition-colors
            mb-6
          "
        >
          <IconArrowLeft size={15} />
          Back to dashboard
        </button>


        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="mb-7">

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-2.5
              py-1
              rounded-full
              bg-[#eeefff]
              text-[#4338ca]
              text-[10px]
              font-semibold
              mb-3
            "
          >
            <IconSparkles size={12} />
            PRODUCT VERIFICATION
          </div>

          <h1
            className="
              text-[28px]
              sm:text-[32px]
              leading-tight
              tracking-[-0.035em]
              font-semibold
              text-[#171925]
            "
          >
            Scan a product label
          </h1>

          <p
            className="
              text-sm
              text-[#737783]
              mt-2
              max-w-[620px]
            "
          >
            Capture the product label clearly and SpectraSafe
            will analyze it for safety and compliance.
          </p>

        </div>


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1.35fr_0.65fr]
            gap-6
            items-start
          "
        >

          {/* =================================================
              LEFT — SCAN AREA
          ================================================== */}

          <div
            className="
              bg-white
              border
              border-[#e7e8ed]
              rounded-2xl
              p-5
              sm:p-7
              shadow-[0_6px_24px_rgba(20,22,26,0.035)]
            "
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-sm font-semibold text-[#242630]">
                  Product label
                </h2>

                <p className="text-[11px] text-[#9296a0] mt-1">
                  Upload a clear photo of the package
                </p>

              </div>

              {previewUrl && (
                <button
                  type="button"
                  onClick={resetFile}
                  disabled={submitting}
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-[#f5f5f7]
                    text-[#777b86]
                    flex
                    items-center
                    justify-center
                    hover:bg-[#eeeeef]
                    transition-colors
                  "
                  aria-label="Remove image"
                >
                  <IconX size={16} />
                </button>
              )}

            </div>


            {/* =================================================
                EMPTY UPLOAD STATE
            ================================================== */}

            {!previewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  w-full
                  min-h-[330px]
                  rounded-2xl
                  border-[1.5px]
                  border-dashed
                  border-[#cfd1d9]
                  bg-[#fafaff]
                  hover:bg-[#f7f7ff]
                  hover:border-[#8f89e8]
                  transition-all
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  px-6
                  cursor-pointer
                  group
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-[#eeefff]
                    text-[#4338ca]
                    flex
                    items-center
                    justify-center
                    mb-5
                    group-hover:scale-105
                    transition-transform
                  "
                >
                  <IconCamera size={29} />
                </div>

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[#292b34]
                  "
                >
                  Take or upload a photo
                </h3>

                <p
                  className="
                    text-xs
                    text-[#858995]
                    mt-2
                    max-w-[360px]
                    leading-relaxed
                  "
                >
                  Capture the ingredients, nutrition panel,
                  or product label so we can verify it.
                </p>

                <span
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-white
                    border
                    border-[#dedfe5]
                    text-xs
                    font-semibold
                    text-[#4338ca]
                    shadow-sm
                  "
                >
                  <IconUpload size={15} />
                  Choose photo
                </span>

                <p className="text-[10px] text-[#a0a3ac] mt-4">
                  JPG or PNG · Clear images work best
                </p>

              </button>
            )}


            {/* =================================================
                IMAGE PREVIEW
            ================================================== */}

            {previewUrl && (
              <div>

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#e2e3e8]
                    bg-[#f7f7f8]
                  "
                >

                  <img
                    src={previewUrl}
                    alt="Selected product label"
                    className="
                      w-full
                      max-h-[480px]
                      object-contain
                    "
                  />

                  <div
                    className="
                      absolute
                      left-3
                      bottom-3
                      px-2.5
                      py-1.5
                      rounded-lg
                      bg-black/60
                      backdrop-blur-sm
                      text-white
                      text-[10px]
                      font-medium
                    "
                  >
                    Label preview
                  </div>

                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mt-3
                    px-1
                  "
                >

                  <p
                    className="
                      text-[11px]
                      text-[#858995]
                      truncate
                      max-w-[70%]
                    "
                  >
                    {file?.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="
                      text-[11px]
                      font-semibold
                      text-[#4338ca]
                      hover:text-[#3026a3]
                    "
                  >
                    Change photo
                  </button>

                </div>

              </div>
            )}


            {/* =================================================
                HIDDEN FILE INPUT
            ================================================== */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />


            {/* =================================================
                LOCATION
            ================================================== */}

            <div className="mt-6">

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  text-[#3e414b]
                  mb-2
                "
              >
                Shop location
              </label>

              <div className="relative">

                <IconMapPin
                  size={17}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-[#8c8f99]
                  "
                />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Koramangala, Bengaluru"
                  disabled={submitting}
                  className="
                    w-full
                    h-11
                    pl-10
                    pr-3
                    rounded-xl
                    border
                    border-[#dedfe5]
                    bg-white
                    text-sm
                    text-[#292b34]
                    placeholder:text-[#a0a3ac]
                    outline-none
                    focus:border-[#4338ca]
                    focus:ring-2
                    focus:ring-[#4338ca]/10
                    transition-all
                  "
                />

              </div>

              <p className="text-[10px] text-[#999ca5] mt-1.5">
                Used to associate the verification with your retail location.
              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-[#f1cccc]
                  bg-[#fff5f5]
                  px-4
                  py-3
                  text-xs
                  text-[#b91c1c]
                "
              >
                {error}
              </div>
            )}


            {/* =================================================
                ANALYZE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || !location.trim() || submitting}
              className="
                w-full
                h-12
                mt-5
                rounded-xl
                bg-[#4338ca]
                text-white
                text-sm
                font-semibold
                shadow-[0_8px_20px_rgba(67,56,202,0.18)]
                hover:bg-[#3730a3]
                disabled:bg-[#c7c8d0]
                disabled:shadow-none
                disabled:cursor-not-allowed
                transition-all
              "
            >
              {submitting
                ? "Analyzing label…"
                : "Analyze label"}
            </button>

            {submitting && (
              <p
                className="
                  text-center
                  text-[10px]
                  text-[#858995]
                  mt-2
                "
              >
                This may take a few seconds while the product
                is being verified.
              </p>
            )}

          </div>


          {/* =================================================
              RIGHT — INFORMATION PANEL
          ================================================== */}

          <div className="space-y-4">

            {/* How it works */}

            <div
              className="
                bg-white
                border
                border-[#e7e8ed]
                rounded-2xl
                p-5
              "
            >

              <div className="flex items-center gap-3 mb-5">

                <div
                  className="
                    w-9
                    h-9
                    rounded-xl
                    bg-[#eeefff]
                    text-[#4338ca]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <IconShieldCheck size={19} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold text-[#292b34]">
                    What happens next?
                  </h3>

                  <p className="text-[10px] text-[#9296a0] mt-0.5">
                    Automated product verification
                  </p>

                </div>

              </div>


              <Step
                number="01"
                title="Read the label"
                text="Product information is extracted from your image."
              />

              <Step
                number="02"
                title="Check compliance"
                text="Ingredients and label details are checked against safety requirements."
              />

              <Step
                number="03"
                title="Get your result"
                text="Receive a clear compliance status and verification details."
                last
              />

            </div>


            {/* Photo tips */}

            <div
              className="
                rounded-2xl
                bg-[#f7f7ff]
                border
                border-[#e5e4fa]
                p-5
              "
            >

              <h3
                className="
                  text-xs
                  font-semibold
                  text-[#383a45]
                  mb-3
                "
              >
                For the best results
              </h3>

              <div className="space-y-2.5">

                <Tip text="Keep the label flat and fully visible." />
                <Tip text="Use good lighting and avoid glare." />
                <Tip text="Make sure text is sharp and readable." />

              </div>

            </div>


            {/* India / safety note */}

            <div
              className="
                rounded-2xl
                bg-white
                border
                border-[#e7e8ed]
                p-5
              "
            >

              <div className="flex gap-3">

                <div
                  className="
                    w-8
                    h-8
                    flex-shrink-0
                    rounded-lg
                    bg-[#eef7ef]
                    text-[#2f8a42]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <IconShieldCheck size={16} />
                </div>

                <div>

                  <p className="text-xs font-semibold text-[#363842]">
                    Built for India's food ecosystem
                  </p>

                  <p
                    className="
                      text-[10px]
                      leading-relaxed
                      text-[#858995]
                      mt-1
                    "
                  >
                    SpectraSafe helps retailers make
                    informed product safety and compliance
                    decisions.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   STEP
============================================================ */

function Step({ number, title, text, last }) {
  return (
    <div className="flex gap-3">

      <div className="flex flex-col items-center">

        <div
          className="
            w-7
            h-7
            rounded-lg
            bg-[#f2f2f5]
            text-[#4338ca]
            text-[9px]
            font-bold
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >
          {number}
        </div>

        {!last && (
          <div
            className="
              w-px
              h-8
              bg-[#e7e8ed]
              my-1
            "
          />
        )}

      </div>

      <div className="pb-4">

        <p className="text-xs font-semibold text-[#363842]">
          {title}
        </p>

        <p
          className="
            text-[10px]
            text-[#858995]
            leading-relaxed
            mt-1
          "
        >
          {text}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   TIP
============================================================ */

function Tip({ text }) {
  return (
    <div className="flex items-start gap-2">

      <span
        className="
          w-1.5
          h-1.5
          rounded-full
          bg-[#4338ca]
          mt-1.5
          flex-shrink-0
        "
      />

      <p className="text-[10px] text-[#737783] leading-relaxed">
        {text}
      </p>

    </div>
  );
}