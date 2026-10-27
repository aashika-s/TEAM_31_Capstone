"""
Converts a free-text location string (typed by the shopkeeper) into
lat/lng via OpenStreetMap's Nominatim -- free, no API key required.
Nominatim rate-limits to ~1 req/sec and asks for a real User-Agent,
and the same handful of locations get reused constantly during
testing, so results are cached in-memory for the life of the process.
"""
import requests

_CACHE: dict[str, tuple[float, float] | None] = {}
_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_HEADERS = {"User-Agent": "SpectraSafe-FSSAI-Capstone/1.0"}


def geocode(location_text: str) -> tuple[float, float] | None:
    """Returns (lat, lng), or None if it couldn't be resolved. Never
    raises -- a bad location string shouldn't fail the whole scan."""
    key = location_text.strip().lower()
    if not key:
        return None
    if key in _CACHE:
        return _CACHE[key]

    try:
        resp = requests.get(
            _NOMINATIM_URL,
            params={"q": location_text, "format": "json", "limit": 1},
            headers=_HEADERS,
            timeout=5,
        )
        resp.raise_for_status()
        results = resp.json()
        if not results:
            _CACHE[key] = None
            return None
        coords = (float(results[0]["lat"]), float(results[0]["lon"]))
        _CACHE[key] = coords
        return coords
    except Exception:
        _CACHE[key] = None
        return None

_REVERSE_CACHE: dict[str, str | None] = {}

def reverse_geocode_state(lat: float, lon: float) -> str | None:
    """
    Resolves a state name from coordinates via Nominatim's reverse
    endpoint -- auto-populates Scan.state for jurisdiction filtering
    without asking the shopkeeper to separately pick a state; they
    already picked a specific location, and the state is implied by it.
    """
    key = f"{round(lat, 4)},{round(lon, 4)}"
    if key in _REVERSE_CACHE:
        return _REVERSE_CACHE[key]
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "json", "addressdetails": 1},
            headers=_HEADERS,
            timeout=5,
        )
        resp.raise_for_status()
        state = resp.json().get("address", {}).get("state")
        _REVERSE_CACHE[key] = state
        return state
    except Exception:
        _REVERSE_CACHE[key] = None
        return None