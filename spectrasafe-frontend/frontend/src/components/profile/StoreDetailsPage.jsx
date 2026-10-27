import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card from "../Card";
import { ButtonPrimary } from "../Button";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import FormField, { fieldInputClass } from "./FormField";

const ORG_LABEL = {
  BRAND: "Company name",
  SHOPKEEPER: "Store name",
};

const ORG_PLACEHOLDER = {
  BRAND: "e.g. ABC Foods Pvt. Ltd.",
  SHOPKEEPER: "e.g. Green Mart",
};

/**
 * "Store details" screen -- shared by Shopkeeper and Brand roles since
 * they need the same three fields (contact name, org name, phone), just
 * with different copy for what "organization" means to that role.
 */
export default function StoreDetailsPage({ backTo }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    organization: user?.organization || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.updateProfile(form);
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const orgLabel = ORG_LABEL[user?.role] || "Organization";
  const orgPlaceholder = ORG_PLACEHOLDER[user?.role] || "";

  return (
    <>
      <TopBar title="Store details" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <form onSubmit={handleSubmit}>
            <FormField label="Contact name">
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={fieldInputClass}
              />
            </FormField>

            <FormField label={orgLabel} optional>
              <input
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                placeholder={orgPlaceholder}
                className={fieldInputClass}
              />
            </FormField>

            <FormField label="Phone number" optional>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="e.g. 98765 43210"
                className={fieldInputClass}
              />
            </FormField>

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
