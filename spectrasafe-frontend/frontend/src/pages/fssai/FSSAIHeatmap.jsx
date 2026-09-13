// import { useEffect, useMemo, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { IconMapPin } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Pill from "../../components/Pill";
// import { api } from "../../lib/api";

// const STATUS_COLOR = {
//   COMPLIANT: "#639922",
//   NEEDS_REVIEW: "#EF9F27",
//   NON_COMPLIANT: "#E24B4A",
//   SUSPICIOUS: "#E24B4A",
// };

// const FILTERS = [
//   { key: null, label: "All" },
//   { key: "NON_COMPLIANT", label: "Non-compliant" },
//   { key: "SUSPICIOUS", label: "Suspicious" },
//   { key: "NEEDS_REVIEW", label: "Needs review" },
// ];

// function markerIcon(color) {
//   return L.divIcon({
//     className: "",
//     html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.35);"></div>`,
//     iconSize: [16, 16],
//     iconAnchor: [8, 8],
//   });
// }

// export default function FSSAIHeatmap() {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markersLayerRef = useRef(null);
//   const [scans, setScans] = useState(null);
//   const [filter, setFilter] = useState(null);
//   const [error, setError] = useState(null);

//   // Fetch scan data once.
//   useEffect(() => {
//     let cancelled = false;
//     api
//       .listScans()
//       .then((data) => {
//         if (!cancelled) setScans(data.filter((s) => s.latitude != null && s.longitude != null));
//       })
//       .catch((e) => {
//         if (!cancelled) setError(e.message);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const visible = useMemo(() => {
//     if (!scans) return [];
//     return filter ? scans.filter((s) => s.compliance_status === filter) : scans;
//   }, [scans, filter]);

//   // Init the map once. StrictMode-safe (see the _leaflet_id reset).
//   useEffect(() => {
//     if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
//       mapContainerRef.current._leaflet_id = null;
//     }
//     const map = L.map(mapContainerRef.current).setView([22.9734, 78.6569], 5);
//     mapRef.current = map;

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "&copy; OpenStreetMap contributors",
//       maxZoom: 18,
//     }).addTo(map);

//     markersLayerRef.current = L.layerGroup().addTo(map);

//     return () => {
//       map.remove();
//       mapRef.current = null;
//     };
//   }, []);

//   // Redraw markers whenever the filter changes -- clear and re-add rather
//   // than diffing, since the marker count here will always be small.
//   useEffect(() => {
//     const layer = markersLayerRef.current;
//     const map = mapRef.current;
//     if (!layer || !map) return;
//     layer.clearLayers();

//     const markers = visible.map((s) => {
//       const color = STATUS_COLOR[s.compliance_status] || "#6b7280";
//       return L.marker([s.latitude, s.longitude], { icon: markerIcon(color) })
//         .bindPopup(
//           `<strong>${s.location_text || "Unknown location"}</strong><br/>${s.compliance_status}<br/>${s.image_filename}`
//         )
//         .addTo(layer);
//     });

//     if (markers.length > 0) {
//       const group = L.featureGroup(markers);
//       map.fitBounds(group.getBounds().pad(0.2));
//     }
//   }, [visible]);

//   // Group violations by location_text for the "Top hotspot areas" list --
//   // client-side aggregation over whatever scans are currently loaded.
//   const hotspots = useMemo(() => {
//     const counts = {};
//     (scans || []).forEach((s) => {
//       const isViolation = s.compliance_status === "NON_COMPLIANT" || s.compliance_status === "SUSPICIOUS";
//       if (!isViolation || !s.location_text) return;
//       counts[s.location_text] = (counts[s.location_text] || 0) + 1;
//     });
//     return Object.entries(counts)
//       .map(([area, count]) => ({ area, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);
//   }, [scans]);

//   return (
//     <>
//       <TopBar title="Violation heatmap" />
//       <ScreenContent>
//         <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
//           {FILTERS.map((f) => (
//             <button
//               key={f.label}
//               onClick={() => setFilter(f.key)}
//               className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
//                 filter === f.key
//                   ? "bg-accent text-accent-bg border-accent"
//                   : "bg-bg-primary text-text-secondary border-border-tertiary"
//               }`}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//         <div
//           ref={mapContainerRef}
//           className="w-full h-[220px] rounded-app-lg overflow-hidden border border-border-tertiary mb-2"
//         />

//         <div className="flex gap-3 mb-3 text-[11px] text-text-secondary">
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#E24B4A" }} />
//             Non-compliant / suspicious
//           </span>
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#EF9F27" }} />
//             Needs review
//           </span>
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#639922" }} />
//             Compliant
//           </span>
//         </div>

//         <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 mt-3">
//           Top hotspot areas
//         </p>
//         {scans && hotspots.length === 0 && (
//           <p className="text-xs text-text-secondary">No flagged locations yet.</p>
//         )}
//         {hotspots.length > 0 && (
//           <Card>
//             {hotspots.map((h) => (
//               <ListItem
//                 key={h.area}
//                 icon={<IconMapPin size={16} />}
//                 iconColor="red"
//                 title={h.area}
//                 sub={`${h.count} violation${h.count === 1 ? "" : "s"}`}
//                 right={<Pill variant="fail">{h.count >= 5 ? "High" : "Medium"}</Pill>}
//               />
//             ))}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }













// import { useEffect, useMemo, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { IconMapPin } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Pill from "../../components/Pill";
// import { api } from "../../lib/api";

// const STATUS_COLOR = {
//   COMPLIANT: "#639922",
//   NEEDS_REVIEW: "#EF9F27",
//   NON_COMPLIANT: "#E24B4A",
//   SUSPICIOUS: "#E24B4A",
// };

// const FILTERS = [
//   { key: null, label: "All" },
//   { key: "ALLERGEN", label: "Allergen" },
//   { key: "LICENSE", label: "License" },
//   { key: "ADDITIVE", label: "Additive" },
// ];

// function markerIcon(color) {
//   return L.divIcon({
//     className: "",
//     html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.35);"></div>`,
//     iconSize: [16, 16],
//     iconAnchor: [8, 8],
//   });
// }

// export default function FSSAIHeatmap() {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markersLayerRef = useRef(null);
//   const [scans, setScans] = useState(null);
//   const [filter, setFilter] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     api
//       .listScans()
//       .then((data) => {
//         if (!cancelled) setScans(data.filter((s) => s.latitude != null && s.longitude != null));
//       })
//       .catch((e) => {
//         if (!cancelled) setError(e.message);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // Filtering is now by violation_types (real category from the backend
//   // classifier), not compliance_status -- a scan can carry multiple
//   // types, so it shows under every matching chip.
//   const visible = useMemo(() => {
//     if (!scans) return [];
//     return filter ? scans.filter((s) => (s.violation_types || []).includes(filter)) : scans;
//   }, [scans, filter]);

//   useEffect(() => {
//     if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
//       mapContainerRef.current._leaflet_id = null;
//     }
//     const map = L.map(mapContainerRef.current).setView([22.9734, 78.6569], 5);
//     mapRef.current = map;

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "&copy; OpenStreetMap contributors",
//       maxZoom: 18,
//     }).addTo(map);

//     markersLayerRef.current = L.layerGroup().addTo(map);

//     return () => {
//       map.remove();
//       mapRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     const layer = markersLayerRef.current;
//     const map = mapRef.current;
//     if (!layer || !map) return;
//     layer.clearLayers();

//     const markers = visible.map((s) => {
//       const color = STATUS_COLOR[s.compliance_status] || "#6b7280";
//       return L.marker([s.latitude, s.longitude], { icon: markerIcon(color) })
//         .bindPopup(
//           `<strong>${s.location_text || "Unknown location"}</strong><br/>${s.compliance_status}<br/>${s.image_filename}`
//         )
//         .addTo(layer);
//     });

//     if (markers.length > 0) {
//       const group = L.featureGroup(markers);
//       map.fitBounds(group.getBounds().pad(0.2));
//     }
//   }, [visible]);

//   // Hotspots now respect the active filter -- "Allergen" filter shows
//   // hotspots for allergen violations only, not all violations.
//   const hotspots = useMemo(() => {
//     const counts = {};
//     visible.forEach((s) => {
//       const isViolation = s.compliance_status === "NON_COMPLIANT" || s.compliance_status === "SUSPICIOUS";
//       if (!isViolation || !s.location_text) return;
//       counts[s.location_text] = (counts[s.location_text] || 0) + 1;
//     });
//     return Object.entries(counts)
//       .map(([area, count]) => ({ area, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 5);
//   }, [visible]);

//   return (
//     <>
//       <TopBar title="Violation heatmap" />
//       <ScreenContent>
//         <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
//           {FILTERS.map((f) => (
//             <button
//               key={f.label}
//               onClick={() => setFilter(f.key)}
//               className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
//                 filter === f.key
//                   ? "bg-accent text-accent-bg border-accent"
//                   : "bg-bg-primary text-text-secondary border-border-tertiary"
//               }`}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

//         <div
//           ref={mapContainerRef}
//           className="w-full h-[220px] rounded-app-lg overflow-hidden border border-border-tertiary mb-2"
//         />

//         <div className="flex gap-3 mb-3 text-[11px] text-text-secondary">
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#E24B4A" }} />
//             Non-compliant / suspicious
//           </span>
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#EF9F27" }} />
//             Needs review
//           </span>
//           <span className="flex items-center gap-1">
//             <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#639922" }} />
//             Compliant
//           </span>
//         </div>

//         <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 mt-3">
//           Top hotspot areas
//         </p>
//         {scans && hotspots.length === 0 && (
//           <p className="text-xs text-text-secondary">No flagged locations match this filter.</p>
//         )}
//         {hotspots.length > 0 && (
//           <Card>
//             {hotspots.map((h) => (
//               <ListItem
//                 key={h.area}
//                 icon={<IconMapPin size={16} />}
//                 iconColor="red"
//                 title={h.area}
//                 sub={`${h.count} violation${h.count === 1 ? "" : "s"}`}
//                 right={<Pill variant="fail">{h.count >= 5 ? "High" : "Medium"}</Pill>}
//               />
//             ))}
//           </Card>
//         )}
//       </ScreenContent>
//     </>
//   );
// }















import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconMapPin } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import Pill from "../../components/Pill";
import { api } from "../../lib/api";

const STATUS_COLOR = {
  COMPLIANT: "#639922",
  NEEDS_REVIEW: "#EF9F27",
  NON_COMPLIANT: "#E24B4A",
  SUSPICIOUS: "#E24B4A",
};

const FILTERS = [
  { key: null, label: "All" },
  { key: "ALLERGEN", label: "Allergen" },
  { key: "LICENSE", label: "License" },
  { key: "ADDITIVE", label: "Additive" },
];

function markerIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function FSSAIHeatmap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [scans, setScans] = useState(null);
  const [filter, setFilter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listScans()
      .then((data) => {
        if (!cancelled) setScans(data.filter((s) => s.latitude != null && s.longitude != null));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (!scans) return [];
    return filter ? scans.filter((s) => (s.violation_types || []).includes(filter)) : scans;
  }, [scans, filter]);

  // Init the map. The dashboard shell's sidebar layout means the
  // container's final width isn't guaranteed to be settled the instant
  // L.map() runs -- Leaflet measures size at init time and can lock in
  // a broken 0-size layout if it runs too early. invalidateSize() after
  // mount (and on any later resize) forces it to re-measure and repaint.
  useEffect(() => {
    if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current).setView([22.9734, 78.6569], 5);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    const invalidate = () => map.invalidateSize();
    // A couple of delayed passes covers layout settling after mount
    // (fonts loading, sidebar transition, etc.) without relying on a
    // single fragile timing guess.
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 400);

    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw markers whenever the filtered set changes. Scans sharing (or
  // nearly sharing) a geocoded point get spread into a small visible
  // cluster instead of stacking into one hidden marker.
  useEffect(() => {
    const layer = markersLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    const groups = {};
    visible.forEach((s) => {
      const key = `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`;
      (groups[key] ||= []).push(s);
    });

    const markers = [];
    Object.values(groups).forEach((group) => {
      group.forEach((s, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        const offset = group.length > 1 ? 0.0015 : 0;
        const lat = s.latitude + offset * Math.cos(angle);
        const lng = s.longitude + offset * Math.sin(angle);

        const color = STATUS_COLOR[s.compliance_status] || "#6b7280";
        const marker = L.marker([lat, lng], { icon: markerIcon(color) })
          .bindPopup(
            `<strong>${s.location_text || "Unknown location"}</strong><br/>${s.compliance_status}<br/>${s.image_filename}`
          )
          .addTo(layer);
        markers.push(marker);
      });
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [visible]);

  const hotspots = useMemo(() => {
    const counts = {};
    visible.forEach((s) => {
      const isViolation = s.compliance_status === "NON_COMPLIANT" || s.compliance_status === "SUSPICIOUS";
      if (!isViolation || !s.location_text) return;
      counts[s.location_text] = (counts[s.location_text] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [visible]);

  return (
    <>
      <TopBar title="Violation heatmap" />
      <ScreenContent>
        <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
                filter === f.key
                  ? "bg-accent text-accent-bg border-accent"
                  : "bg-bg-primary text-text-secondary border-border-tertiary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-fail-text mb-2">{error}</p>}

        <div
          ref={mapContainerRef}
          className="w-full h-[420px] rounded-app-lg overflow-hidden border border-border-tertiary mb-2"
        />

        <div className="flex gap-3 mb-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#E24B4A" }} />
            Non-compliant / suspicious
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#EF9F27" }} />
            Needs review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#639922" }} />
            Compliant
          </span>
        </div>

        <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 mt-3">
          Top hotspot areas
        </p>
        {scans && hotspots.length === 0 && (
          <p className="text-xs text-text-secondary">No flagged locations match this filter.</p>
        )}
        {hotspots.length > 0 && (
          <Card>
            {hotspots.map((h) => (
              <ListItem
                key={h.area}
                icon={<IconMapPin size={16} />}
                iconColor="red"
                title={h.area}
                sub={`${h.count} violation${h.count === 1 ? "" : "s"}`}
                right={<Pill variant="fail">{h.count >= 5 ? "High" : "Medium"}</Pill>}
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}