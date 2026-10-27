import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card from "../Card";
import { ButtonPrimary } from "../Button";
import LocationAutocomplete from "../LocationAutocomplete";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import FormField, { fieldInputClass } from "./FormField";

/**
 * "Location settings" (Shopkeeper/Brand) / "Jurisdiction zone" (FSSAI) --
 * same underlying address fields for every role, just a different title
 * and helper copy depending on how that role actually uses a location.
 */
export default function LocationSettingsPage({ backTo, title = "Location settings", helperText }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address_line: user?.address_line || "",
    city: user?.city || "",
    state: user?.state || "",
    postal_code: user?.postal_code || "",
    latitude: user?.latitude ?? null,
    longitude: user?.longitude ?? null,
  });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handlePlaceSelect(place) {
    if (!place) return;
    setForm((f) => ({
      ...f,
      address_line: place.label,
      city: place.city || f.city,
      state: place.state || f.state,
      postal_code: place.postcode || f.postal_code,
      latitude: place.lat,
      longitude: place.lon,
    }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.updateLocation(form);
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopBar title={title} onBack={() => navigate(backTo)} />
      <ScreenContent>
        {helperText && <p className="text-xs text-text-secondary mb-3">{helperText}</p>}
        <Card>
          <form onSubmit={handleSubmit}>
            <FormField label="Search for an address" helper="Optional shortcut">
              <LocationAutocomplete
                value={form.address_line ? { label: form.address_line } : null}
                onChange={handlePlaceSelect}
                placeholder="Search address, area, or landmark…"
              />
            </FormField>

            <FormField label="Address line">
              <input
                value={form.address_line}
                onChange={(e) => update("address_line", e.target.value)}
                className={fieldInputClass}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="City">
                <input value={form.city} onChange={(e) => update("city", e.target.value)} className={fieldInputClass} />
              </FormField>
              <FormField label="State">
                <input value={form.state} onChange={(e) => update("state", e.target.value)} className={fieldInputClass} />
              </FormField>
            </div>

            <FormField label="Postal code" optional>
              <input
                value={form.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
                className={fieldInputClass}
              />
            </FormField>

            {form.latitude != null && form.longitude != null && (
              <p className="text-[11px] text-text-tertiary mb-3">
                Pinned at {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
              </p>
            )}

            {error && <p className="text-xs text-fail-text mb-2">{error}</p>}
            {saved && !error && <p className="text-xs text-pass-text mb-2">Saved.</p>}

            <ButtonPrimary type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </ButtonPrimary>
          </form>
        </Card>
      </ScreenContent>
    </>
  );
}
