import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card, { CardTitle } from "../Card";
import { ButtonPrimary } from "../Button";
import { api } from "../../lib/api";
import FormField, { fieldInputClass } from "./FormField";

export default function SecurityAccessPage({ backTo }) {
  const navigate = useNavigate();

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwError, setPwError] = useState(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError(null);
    setPwSaved(false);
    setPwSubmitting(true);
    try {
      await api.changePassword(pwForm);
      setPwForm({ current_password: "", new_password: "" });
      setPwSaved(true);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <>
      <TopBar title="Security & access" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <CardTitle>Change password</CardTitle>
          <form onSubmit={handlePasswordSubmit}>
            <FormField label="Current password">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={pwForm.current_password}
                onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
                className={fieldInputClass}
              />
            </FormField>
            <FormField label="New password" helper="Minimum 8 characters">
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={pwForm.new_password}
                onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                className={fieldInputClass}
              />
            </FormField>
            {pwError && <p className="text-xs text-fail-text mb-2">{pwError}</p>}
            {pwSaved && !pwError && <p className="text-xs text-pass-text mb-2">Password updated.</p>}
            <ButtonPrimary type="submit" disabled={pwSubmitting}>
              {pwSubmitting ? "Updating…" : "Update password"}
            </ButtonPrimary>
          </form>
        </Card>
      </ScreenContent>
    </>
  );
}
