import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card, { CardTitle, CardSub } from "../Card";
import { ButtonPrimary, ButtonOutline } from "../Button";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import FormField, { fieldInputClass, ToggleRow } from "./FormField";

export default function DataPrivacyPage({ backTo }) {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [sharingOptIn, setSharingOptIn] = useState(user?.data_sharing_opt_in ?? true);
  const [sharingError, setSharingError] = useState(null);
  const [sharingSaving, setSharingSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwError, setPwError] = useState(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleSharingToggle(value) {
    setSharingOptIn(value);
    setSharingSaving(true);
    setSharingError(null);
    try {
      await api.updatePrivacy({ data_sharing_opt_in: value });
      await refreshUser();
    } catch (err) {
      setSharingError(err.message);
      setSharingOptIn(!value);
    } finally {
      setSharingSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await api.exportMyData();
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  }

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

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAccount();
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <>
      <TopBar title="Data & privacy" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <CardTitle>Data sharing</CardTitle>
          <CardSub className="mb-2">
            Share anonymized scan data to help improve SpectraSafe's compliance detection.
          </CardSub>
          <ToggleRow
            title="Share anonymized data"
            checked={sharingOptIn}
            onChange={handleSharingToggle}
          />
          {sharingSaving && <p className="text-[11px] text-text-tertiary mt-1">Saving…</p>}
          {sharingError && <p className="text-[11px] text-fail-text mt-1">{sharingError}</p>}
        </Card>

        <Card>
          <CardTitle>Your data</CardTitle>
          <CardSub className="mb-2">Download everything SpectraSafe stores on your account.</CardSub>
          <ButtonOutline onClick={handleExport} disabled={exporting}>
            {exporting ? "Preparing export…" : "Export my data"}
          </ButtonOutline>
          {exportError && <p className="text-[11px] text-fail-text mt-1">{exportError}</p>}
        </Card>

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

        <Card className="border-fail-text/30">
          <CardTitle className="text-fail-text">Delete account</CardTitle>
          <CardSub className="mb-2">
            This permanently deletes your login and profile. It cannot be undone.
          </CardSub>
          {!confirmingDelete ? (
            <ButtonOutline onClick={() => setConfirmingDelete(true)}>Delete my account</ButtonOutline>
          ) : (
            <>
              <FormField label={`Type "${user?.email || "your email"}" to confirm`}>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
              {deleteError && <p className="text-xs text-fail-text mb-2">{deleteError}</p>}
              <div className="flex gap-2">
                <ButtonOutline onClick={() => setConfirmingDelete(false)} className="mt-0">
                  Cancel
                </ButtonOutline>
                <button
                  type="button"
                  disabled={deleteConfirmText !== user?.email || deleting}
                  onClick={handleDelete}
                  className="w-full py-[11px] bg-fail-text text-white border-none rounded-app-md text-sm font-medium cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting…" : "Permanently delete"}
                </button>
              </div>
            </>
          )}
        </Card>
      </ScreenContent>
    </>
  );
}
