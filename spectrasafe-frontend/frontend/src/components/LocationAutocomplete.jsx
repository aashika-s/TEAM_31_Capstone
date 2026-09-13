import { useState, useRef, useEffect } from "react";

// Get a free key at https://www.geoapify.com/ (no card required, 3,000 req/day free tier).
// Safe to keep client-side — Geoapify's free tier is designed for browser calls,
// but you can still lock it down to your domain(s) in the Geoapify dashboard.
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

function formatLabel(props) {
  // Geoapify's autocomplete returns a mix of shape depending on result type:
  // businesses/POIs have `name`, plain addresses may not.
  const parts = [props.name, props.street, props.city, props.state, props.country].filter(Boolean);
  const deduped = parts.filter((p, i) => p !== parts[i - 1]);
  return deduped.slice(0, 4).join(", ");
}

/**
 * Uber-style business search: debounced type-ahead against Geoapify Places
 * Autocomplete (OSM-based, but purpose-built for POI/business search with
 * relevance ranking -- unlike raw Photon, chain names reliably surface their
 * different branches as separate suggestions). Selecting a suggestion
 * returns real lat/lon directly, so the backend doesn't need to geocode a
 * free-text guess for these submissions.
 */
export default function LocationAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e) {
    const text = e.target.value;
    setQuery(text);
    onChange(null); // typing invalidates any previously selected coordinates
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          text,
          type: "amenity", // biases results toward businesses/POIs over raw addresses
          filter: "countrycode:in",
          limit: "6",
          apiKey: GEOAPIFY_KEY,
        });
        const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`);
        if (!res.ok) throw new Error(`Geoapify request failed (${res.status})`);
        const data = await res.json();
        setSuggestions(data.features || []);
        setOpen(true);
      } catch (err) {
        setSuggestions([]);
        setError("Couldn't load suggestions — check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSelect(feature) {
    const label = formatLabel(feature.properties);
    const [lon, lat] = feature.geometry.coordinates;
    setQuery(label);
    setOpen(false);
    onChange({ label, lat, lon });
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm bg-bg-primary text-text-primary"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-bg-primary border border-border-tertiary rounded-app-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((f, i) => (
            <button
              key={f.properties.place_id || i}
              type="button"
              onClick={() => handleSelect(f)}
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary border-b border-border-tertiary last:border-b-0"
            >
              <div>{f.properties.name || formatLabel(f.properties)}</div>
              {f.properties.name && (
                <div className="text-[11px] text-text-tertiary">
                  {[f.properties.street, f.properties.city].filter(Boolean).join(", ")}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {loading && <p className="text-[11px] text-text-tertiary mt-1">Searching…</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}