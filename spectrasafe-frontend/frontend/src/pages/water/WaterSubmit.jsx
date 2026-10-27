// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IconDroplet, IconUpload, IconCurrentLocation } from "@tabler/icons-react";

// import Card from "../../components/Card";
// import WaterMap from "../../components/WaterMap";
// import { useAuth } from "../../context/AuthContext";
// import { api } from "../../lib/api";
// import { timeAgo } from "../../lib/format";
// import { WATER_META, WaterBadge } from "../../lib/water";

// export default function WaterSubmit() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const base = user?.role === "CPCB" ? "/cpcb" : "/spcb";
//   const fileRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [site, setSite] = useState("");
//   const [notes, setNotes] = useState("");
//   const [pin, setPin] = useState(null); // {lat, lon}
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState(null);
//   const [gpsMsg, setGpsMsg] = useState(null);

//   function loadHistory() {
//     api.listWaterSamples({ limit: 20 }).then(setHistory).catch(() => setHistory([]));
//   }
//   useEffect(loadHistory, []);

//   useEffect(() => {
//     if (!file) return setPreview(null);
//     const url = URL.createObjectURL(file);
//     setPreview(url);
//     return () => URL.revokeObjectURL(url);
//   }, [file]);

//   function useMyLocation() {
//     setGpsMsg(null);
//     if (!navigator.geolocation || !window.isSecureContext) {
//       setGpsMsg("Phone location needs HTTPS. Tap the map or type coordinates instead.");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (p) => setPin({ lat: p.coords.latitude, lon: p.coords.longitude }),
//       () => setGpsMsg("Could not get your location. Tap the map to drop a pin."),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   }

//   function setCoord(key, value) {
//     const n = parseFloat(value);
//     setPin((p) => ({ lat: p?.lat ?? 0, lon: p?.lon ?? 0, [key]: Number.isFinite(n) ? n : 0 }));
//   }

//   async function submit() {
//     if (!file || !pin) return;
//     setSubmitting(true);
//     setError(null);
//     setResult(null);
//     try {
//       const form = new FormData();
//       form.append("image", file);
//       form.append("lat", String(pin.lat));
//       form.append("lon", String(pin.lon));
//       if (site.trim()) form.append("site_name", site.trim());
//       if (notes.trim()) form.append("notes", notes.trim());
//       form.append("captured_at", new Date().toISOString());
//       const res = await api.createWaterSample(form);
//       setResult(res);
//       setFile(null);
//       if (fileRef.current) fileRef.current.value = "";
//       loadHistory();
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   const ready = file && pin && !submitting;
//   const meta = result ? WATER_META[result.result] || WATER_META.inconclusive : null;

//   return (
//     <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 pt-7 pb-12">
//       <div className="mb-7">
//         <h1 className="text-[26px] font-bold tracking-[-0.01em] text-text-primary">New water sample</h1>
//         <p className="text-sm text-text-secondary mt-2 max-w-[620px]">
//           Photograph the laser diffraction spectrum of the sample. The classifier is deterministic
//           (spectral features and a trained model, no generative AI) and reports a screening result.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <Card className="mb-0">
//             <p className="label-caps mb-3">1 · Spectrum photo</p>
//             <button
//               type="button"
//               onClick={() => fileRef.current?.click()}
//               className="w-full border-[1.5px] border-dashed border-border-secondary rounded-app-lg overflow-hidden text-center text-text-secondary hover:border-accent transition-colors"
//             >
//               {preview ? (
//                 <img src={preview} alt="Selected spectrum" className="w-full max-h-[220px] object-contain bg-bg-secondary" />
//               ) : (
//                 <div className="py-9 px-4">
//                   <IconUpload size={28} className="text-accent mx-auto mb-2" />
//                   <p className="text-sm font-medium text-text-primary">Take or choose a photo</p>
//                   <p className="text-[12px] mt-1">Laser spot and spectrum visible</p>
//                 </div>
//               )}
//             </button>
//             <input
//               ref={fileRef}
//               type="file"
//               accept="image/*"
//               capture="environment"
//               className="hidden"
//               onChange={(e) => {
//                 setFile(e.target.files?.[0] || null);
//                 setResult(null);
//                 setError(null);
//               }}
//             />
//           </Card>

//           <Card className="mb-0">
//             <p className="label-caps mb-3">2 · Where was it taken</p>
//             <input
//               className="form-input mb-3"
//               placeholder="Site name (optional), e.g. Ulsoor Lake inlet"
//               maxLength={120}
//               value={site}
//               onChange={(e) => setSite(e.target.value)}
//             />
//             <div className="grid grid-cols-2 gap-3 mb-3">
//               <input className="form-input" placeholder="Latitude" inputMode="decimal"
//                 value={pin ? pin.lat.toFixed(5) : ""} onChange={(e) => setCoord("lat", e.target.value)} />
//               <input className="form-input" placeholder="Longitude" inputMode="decimal"
//                 value={pin ? pin.lon.toFixed(5) : ""} onChange={(e) => setCoord("lon", e.target.value)} />
//             </div>
//             <button
//               type="button"
//               onClick={useMyLocation}
//               className="inline-flex items-center gap-2 h-9 px-3 rounded-app-md border border-border-secondary text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent-text transition-colors"
//             >
//               <IconCurrentLocation size={15} /> Use my location
//             </button>
//             <p className="text-[11px] text-text-tertiary mt-2">{gpsMsg || "Or tap the map to drop a pin."}</p>
//             <textarea className="form-input mt-3" rows={2} maxLength={1000} placeholder="Notes (optional)"
//               value={notes} onChange={(e) => setNotes(e.target.value)} />
//           </Card>

//           {error && (
//             <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-3 py-2.5">
//               <p className="text-xs text-fail-text">{error}</p>
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={submit}
//             disabled={!ready}
//             className="w-full h-11 rounded-app-md bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {submitting ? "Analysing…" : "Analyse sample"}
//           </button>
//         </div>

//         <div className="lg:col-span-3 space-y-4">
//           <WaterMap
//             samples={(history || []).map((s) => ({ id: s.id, lat: s.lat, lon: s.lon, result: s.result }))}
//             pin={pin}
//             onPick={setPin}
//             height={320}
//           />

//           {result && meta && (
//             <Card className="mb-0">
//               <div className="flex items-start gap-4">
//                 <div className={`w-11 h-11 rounded-app-md flex items-center justify-center flex-shrink-0 ${meta.pill}`}>
//                   <meta.icon size={22} />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-base font-semibold text-text-primary">{meta.label}</p>
//                   <p className="text-xs text-text-secondary mt-1">{meta.detail}</p>
//                   {result.p_unsafe != null ? (
//                     <p className="text-xs text-text-tertiary mt-2">
//                       Model score P(unsafe) = {(result.p_unsafe * 100).toFixed(0)}%
//                       {result.state ? ` · ${result.state}` : ""}
//                     </p>
//                   ) : (
//                     <p className="text-xs text-warn-text mt-2">{result.quality?.reason || "Could not analyse this image."}</p>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => navigate(base)}
//                     className="mt-3 text-xs font-semibold text-accent-text hover:text-accent"
//                   >
//                     View on dashboard →
//                   </button>
//                 </div>
//               </div>
//             </Card>
//           )}
//         </div>
//       </div>

//       <div className="mt-8">
//         <h2 className="text-sm font-semibold text-text-primary mb-3">Recent samples</h2>
//         <div className="bg-bg-primary border border-border-tertiary rounded-app-lg overflow-hidden">
//           {!history && <p className="p-8 text-center text-xs text-text-secondary">Loading…</p>}
//           {history && history.length === 0 && (
//             <div className="py-10 px-6 text-center">
//               <IconDroplet size={22} className="text-accent mx-auto mb-2" />
//               <p className="text-sm font-semibold text-text-primary">No samples yet</p>
//               <p className="text-xs text-text-secondary mt-1">Submit the first spectrum above.</p>
//             </div>
//           )}
//           {history?.map((s) => (
//             <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-border-tertiary last:border-b-0">
//               <img src={api.waterImageUrl(s.image_filename)} alt=""
//                 className="w-12 h-12 rounded-app-md object-cover bg-bg-secondary flex-shrink-0" />
//               <div className="min-w-0 flex-1">
//                 <p className="text-[13px] font-medium text-text-primary truncate">{s.site_name || "Unnamed site"}</p>
//                 <p className="text-[11px] text-text-tertiary">{timeAgo(s.created_at)}{s.state ? ` · ${s.state}` : ""}</p>
//               </div>
//               <WaterBadge result={s.result} />
//             </div>
//           ))}
//         </div>
//       </div>

//       <p className="text-center text-[11px] text-text-tertiary mt-6">
//         Screening aid only. Not a drinking-water certification; confirm with a certified lab.
//       </p>
//     </div>
//   );
// }













import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconDroplet, IconUpload, IconCurrentLocation, IconCamera, IconPlayerStop, IconRefresh } from "@tabler/icons-react";

import Card from "../../components/Card";
import WaterMap from "../../components/WaterMap";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import { WATER_META, WaterBadge } from "../../lib/water";

export default function WaterSubmit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = user?.role === "CPCB" ? "/cpcb" : "/spcb";
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [site, setSite] = useState("");
  const [notes, setNotes] = useState("");
  const [pin, setPin] = useState(null); // {lat, lon}
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [gpsMsg, setGpsMsg] = useState(null);

  function loadHistory() {
    api.listWaterSamples({ limit: 20 }).then(setHistory).catch(() => setHistory([]));
  }
  useEffect(loadHistory, []);

  // Attach the live stream after React has rendered the video element, and release it on exit.
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) refreshCameras();
  }, []);

  async function refreshCameras() {
    setCameraError("");
    try {
      // Camera labels are normally available after permission is granted.
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      setCameraDevices(cameras);
      if (!selectedCamera && cameras[0]) setSelectedCamera(cameras[0].deviceId);
    } catch {
      setCameraError("Could not list cameras. Check browser permissions and USB connection.");
    }
  }

  async function startCamera(deviceId = selectedCamera) {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access requires a supported browser and a secure context (localhost or HTTPS).");
      return;
    }
    setCameraBusy(true);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      streamRef.current = stream;
      setCameraActive(true);
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      setCameraDevices(devices);
      const activeTrack = stream.getVideoTracks()[0];
      const activeId = activeTrack?.getSettings?.().deviceId;
      if (activeId) setSelectedCamera(activeId);
    } catch (e) {
      const message = e?.name === "NotAllowedError"
        ? "Camera permission was denied. Allow camera access in your browser's site settings."
        : e?.name === "NotFoundError"
          ? "No camera found. Check that your USB camera is connected and not being used exclusively by another app."
          : "Could not start the camera. Close Windows Camera or other apps using it, then try again.";
      setCameraError(message);
      setCameraActive(false);
    } finally {
      setCameraBusy(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  function captureCameraImage() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("The camera is not ready yet. Wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Could not capture the image. Please try again.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Could not create the captured image. Please try again.");
        return;
      }
      const capturedFile = new File([blob], `spectrum-${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`, { type: "image/jpeg" });
      setFile(capturedFile);
      setResult(null);
      setError(null);
      setCameraError("");
    }, "image/jpeg", 0.95);
  }

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function useMyLocation() {
    setGpsMsg(null);
    if (!navigator.geolocation || !window.isSecureContext) {
      setGpsMsg("Phone location needs HTTPS. Tap the map or type coordinates instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPin({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setGpsMsg("Could not get your location. Tap the map to drop a pin."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function setCoord(key, value) {
    const n = parseFloat(value);
    setPin((p) => ({ lat: p?.lat ?? 0, lon: p?.lon ?? 0, [key]: Number.isFinite(n) ? n : 0 }));
  }

  async function submit() {
    if (!file || !pin) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("lat", String(pin.lat));
      form.append("lon", String(pin.lon));
      if (site.trim()) form.append("site_name", site.trim());
      if (notes.trim()) form.append("notes", notes.trim());
      form.append("captured_at", new Date().toISOString());
      const res = await api.createWaterSample(form);
      setResult(res);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadHistory();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const ready = file && pin && !submitting;
  const meta = result ? WATER_META[result.result] || WATER_META.inconclusive : null;

  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 pt-7 pb-12">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-text-primary">New water sample</h1>
        <p className="text-sm text-text-secondary mt-2 max-w-[620px]">
          Photograph the laser diffraction spectrum of the sample. The classifier is deterministic
          (spectral features and a trained model, no generative AI) and reports a screening result.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="mb-0">
            <p className="label-caps mb-3">1 · Spectrum photo</p>
            <div className="space-y-3">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-h-[280px] rounded-app-md bg-black object-contain"
                />
              ) : preview ? (
                <img src={preview} alt="Captured spectrum" className="w-full max-h-[260px] rounded-app-md object-contain bg-bg-secondary" />
              ) : (
                <div className="py-8 px-4 border-[1.5px] border-dashed border-border-secondary rounded-app-lg text-center">
                  <IconCamera size={28} className="text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-text-primary">Capture directly from your USB camera</p>
                  <p className="text-[12px] mt-1">Connect the camera, start the preview, then capture.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="form-input min-w-0 flex-1"
                  value={selectedCamera}
                  onChange={(e) => {
                    setSelectedCamera(e.target.value);
                    if (cameraActive) startCamera(e.target.value);
                  }}
                  aria-label="Select camera"
                >
                  <option value="">Default camera</option>
                  {cameraDevices.map((device, index) => (
                    <option key={device.deviceId || index} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
                {!cameraActive ? (
                  <button type="button" onClick={() => startCamera()} disabled={cameraBusy}
                    className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-app-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover disabled:opacity-50">
                    <IconCamera size={16} /> {cameraBusy ? "Starting…" : "Start camera"}
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={captureCameraImage}
                      className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-app-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover">
                      <IconCamera size={16} /> Capture
                    </button>
                    <button type="button" onClick={stopCamera}
                      className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-app-md border border-border-secondary text-text-secondary text-xs font-semibold hover:border-accent">
                      <IconPlayerStop size={15} /> Stop
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={refreshCameras}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-text hover:text-accent">
                  <IconRefresh size={14} /> Refresh camera list
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-text">
                  <IconUpload size={14} /> Choose existing image instead
                </button>
              </div>
              {preview && <p className="text-[11px] text-text-secondary">Image ready for analysis. Capture again or choose another image to replace it.</p>}
              {cameraError && <p role="alert" className="text-xs text-fail-text">{cameraError}</p>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
                setError(null);
                e.target.value = "";
              }}
            />
          </Card>

          <Card className="mb-0">
            <p className="label-caps mb-3">2 · Where was it taken</p>
            <input
              className="form-input mb-3"
              placeholder="Site name (optional), e.g. Ulsoor Lake inlet"
              maxLength={120}
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input className="form-input" placeholder="Latitude" inputMode="decimal"
                value={pin ? pin.lat.toFixed(5) : ""} onChange={(e) => setCoord("lat", e.target.value)} />
              <input className="form-input" placeholder="Longitude" inputMode="decimal"
                value={pin ? pin.lon.toFixed(5) : ""} onChange={(e) => setCoord("lon", e.target.value)} />
            </div>
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-app-md border border-border-secondary text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent-text transition-colors"
            >
              <IconCurrentLocation size={15} /> Use my location
            </button>
            <p className="text-[11px] text-text-tertiary mt-2">{gpsMsg || "Or tap the map to drop a pin."}</p>
            <textarea className="form-input mt-3" rows={2} maxLength={1000} placeholder="Notes (optional)"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Card>

          {error && (
            <div className="rounded-app-md bg-fail-bg border border-fail-text/20 px-3 py-2.5">
              <p className="text-xs text-fail-text">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!ready}
            className="w-full h-11 rounded-app-md bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Analysing…" : "Analyse sample"}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <WaterMap
            samples={(history || []).map((s) => ({ id: s.id, lat: s.lat, lon: s.lon, result: s.result }))}
            pin={pin}
            onPick={setPin}
            height={320}
          />

          {result && meta && (
            <Card className="mb-0">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-app-md flex items-center justify-center flex-shrink-0 ${meta.pill}`}>
                  <meta.icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-text-primary">{meta.label}</p>
                  <p className="text-xs text-text-secondary mt-1">{meta.detail}</p>
                  {result.p_unsafe != null ? (
                    <p className="text-xs text-text-tertiary mt-2">
                      Model score P(unsafe) = {(result.p_unsafe * 100).toFixed(0)}%
                      {result.state ? ` · ${result.state}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-warn-text mt-2">{result.quality?.reason || "Could not analyse this image."}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(base)}
                    className="mt-3 text-xs font-semibold text-accent-text hover:text-accent"
                  >
                    View on dashboard →
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Recent samples</h2>
        <div className="bg-bg-primary border border-border-tertiary rounded-app-lg overflow-hidden">
          {!history && <p className="p-8 text-center text-xs text-text-secondary">Loading…</p>}
          {history && history.length === 0 && (
            <div className="py-10 px-6 text-center">
              <IconDroplet size={22} className="text-accent mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-primary">No samples yet</p>
              <p className="text-xs text-text-secondary mt-1">Submit the first spectrum above.</p>
            </div>
          )}
          {history?.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-border-tertiary last:border-b-0">
              <img src={api.waterImageUrl(s.image_filename)} alt=""
                className="w-12 h-12 rounded-app-md object-cover bg-bg-secondary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-text-primary truncate">{s.site_name || "Unnamed site"}</p>
                <p className="text-[11px] text-text-tertiary">{timeAgo(s.created_at)}{s.state ? ` · ${s.state}` : ""}</p>
              </div>
              <WaterBadge result={s.result} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-text-tertiary mt-6">
        Screening aid only. Not a drinking-water certification; confirm with a certified lab.
      </p>
    </div>
  );
}
