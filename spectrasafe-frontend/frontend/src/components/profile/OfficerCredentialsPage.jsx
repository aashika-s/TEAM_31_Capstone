import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card from "../Card";
import { ButtonPrimary } from "../Button";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import FormField, { fieldInputClass } from "./FormField";

export default function OfficerCredentialsPage({ backTo }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    officer_id: user?.officer_id || "",
    organization: user?.organization || "",
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

  return (
    <>
      <TopBar title="Officer ID & credentials" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <form onSubmit={handleSubmit}>
            <FormField label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={fieldInputClass}
              />
            </FormField>

            <FormField label="Officer ID" helper="Issued by FSSAI">
              <input
                value={form.officer_id}
                onChange={(e) => update("officer_id", e.target.value)}
                placeholder="e.g. FSO-2024-00381"
                className={fieldInputClass}
              />
            </FormField>

            <FormField label="Department / office" optional>
              <input
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                placeholder="e.g. Chennai Regional Office"
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
