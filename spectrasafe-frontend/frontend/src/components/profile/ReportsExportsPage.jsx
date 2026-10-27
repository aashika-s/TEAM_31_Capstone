import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import { ScreenContent } from "../Screen";
import Card, { CardTitle, CardSub } from "../Card";
import ListItem from "../ListItem";
import { ButtonOutline } from "../Button";
import { IconFileText, IconDownload } from "@tabler/icons-react";
import { api } from "../../lib/api";

export default function ReportsExportsPage({ backTo }) {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api
      .listNotices()
      .then(setNotices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  async function handleDownloadPdf(id) {
    setDownloadingId(id);
    try {
      await api.downloadNoticePdf(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      <TopBar title="Reports & exports" onBack={() => navigate(backTo)} />
      <ScreenContent>
        <Card>
          <CardTitle>Account data export</CardTitle>
          <CardSub className="mb-2">Download a JSON summary of your account and activity.</CardSub>
          <ButtonOutline onClick={handleExport} disabled={exporting}>
            {exporting ? "Preparing export…" : "Export my data"}
          </ButtonOutline>
          {exportError && <p className="text-[11px] text-fail-text mt-1">{exportError}</p>}
        </Card>

        <Card>
          <CardTitle>Issued notices</CardTitle>
          <CardSub className="mb-2">Formal notices you've issued, with downloadable PDFs.</CardSub>

          {loading && <p className="text-xs text-text-tertiary">Loading…</p>}
          {error && <p className="text-xs text-fail-text">{error}</p>}
          {!loading && !error && notices.length === 0 && (
            <p className="text-xs text-text-tertiary">No notices issued yet.</p>
          )}
          {notices.map((n) => (
            <ListItem
              key={n.id}
              icon={<IconFileText size={16} />}
              title={n.manufacturer_name}
              sub={`${n.notice_type} · ${new Date(n.created_at).toLocaleDateString()}`}
              right={
                n.pdf_filename && (
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(n.id)}
                    disabled={downloadingId === n.id}
                    className="text-text-secondary hover:text-accent p-1"
                    aria-label="Download PDF"
                  >
                    <IconDownload size={16} />
                  </button>
                )
              }
            />
          ))}
        </Card>
      </ScreenContent>
    </>
  );
}
