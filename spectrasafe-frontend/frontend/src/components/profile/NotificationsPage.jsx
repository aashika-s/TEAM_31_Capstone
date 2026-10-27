import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card from "../Card";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { ToggleRow } from "./FormField";

export default function NotificationsPage({ backTo }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    notify_email: user?.notify_email ?? true,
    notify_scan_alerts: user?.notify_scan_alerts ?? true,
    notify_weekly_digest: user?.notify_weekly_digest ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleToggle(field, value) {
    const next = { ...prefs, [field]: value };
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      await api.updateNotifications(next);
      await refreshUser();
    } catch (err) {
      setError(err.message);
      setPrefs(prefs); // revert on failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="Notifications" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <ToggleRow
            title="Email notifications"
            sub="Account and security emails"
            checked={prefs.notify_email}
            onChange={(v) => handleToggle("notify_email", v)}
          />
          <ToggleRow
            title="Scan alerts"
            sub="Get notified when a scan comes back non-compliant"
            checked={prefs.notify_scan_alerts}
            onChange={(v) => handleToggle("notify_scan_alerts", v)}
          />
          <ToggleRow
            title="Weekly digest"
            sub="A weekly summary of scans and compliance trends"
            checked={prefs.notify_weekly_digest}
            onChange={(v) => handleToggle("notify_weekly_digest", v)}
          />
        </Card>
        {saving && <p className="text-xs text-text-tertiary">Saving…</p>}
        {error && <p className="text-xs text-fail-text">{error}</p>}
      </ScreenContent>
    </>
  );
}
