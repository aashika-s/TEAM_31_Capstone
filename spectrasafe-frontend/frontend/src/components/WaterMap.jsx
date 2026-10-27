import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WATER_META } from "../lib/water";

/**
 * Leaflet map used by both water pages.
 *  - samples:   [{id, lat, lon, result}]  drawn as coloured circle markers
 *  - selectedId: highlights one marker
 *  - onSelect(sample)  marker click
 *  - pin / onPick({lat, lon})  optional "drop a pin" mode (used on the submit page)
 * Handles React StrictMode's double mount (same fix as the heatmap).
 */
export default function WaterMap({ samples = [], selectedId, onSelect, pin, onPick, height = 420 }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const pinMarker = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    let cancelled = false;
    const node = el.current;
    if (!node) return;
    if (node._leaflet_id) node._leaflet_id = null;

    const m = L.map(node, { zoomControl: true }).setView([22.5, 78.9], 4);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e) => {
      if (pickRef.current) pickRef.current({ lat: e.latlng.lat, lon: e.latlng.lng });
    });
    if (!cancelled) map.current = m;

    return () => {
      cancelled = true;
      m.remove();
      map.current = null;
      layer.current = null;
      pinMarker.current = null;
    };
  }, []);

  // markers
  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const pts = [];
    samples.forEach((s) => {
      const meta = WATER_META[s.result] || WATER_META.inconclusive;
      const sel = s.id === selectedId;
      const mk = L.circleMarker([s.lat, s.lon], {
        radius: sel ? 11 : 8,
        color: "#fff",
        weight: 2,
        fillColor: meta.hex,
        fillOpacity: 0.95,
      }).addTo(layer.current);
      mk.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelect?.(s);
      });
      pts.push([s.lat, s.lon]);
    });
    if (pts.length && !selectedId) {
      map.current.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
    }
  }, [samples, selectedId, onSelect]);

  // fly to selection
  useEffect(() => {
    if (!map.current || !selectedId) return;
    const s = samples.find((x) => x.id === selectedId);
    if (s) map.current.flyTo([s.lat, s.lon], Math.max(map.current.getZoom(), 12), { duration: 0.6 });
  }, [selectedId, samples]);

  // dropped pin
  useEffect(() => {
    if (!map.current) return;
    if (!pin) {
      pinMarker.current?.remove();
      pinMarker.current = null;
      return;
    }
    if (!pinMarker.current) {
      pinMarker.current = L.marker([pin.lat, pin.lon]).addTo(map.current);
    } else {
      pinMarker.current.setLatLng([pin.lat, pin.lon]);
    }
    map.current.setView([pin.lat, pin.lon], Math.max(map.current.getZoom(), 12));
  }, [pin]);

  return (
    <div
      ref={el}
      style={{ height }}
      className="w-full rounded-app-lg border border-border-tertiary overflow-hidden z-0"
    />
  );
}
