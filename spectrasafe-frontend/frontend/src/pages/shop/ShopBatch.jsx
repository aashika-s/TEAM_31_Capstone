import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconUpload,
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
} from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import Card, { CardTitle } from "../../components/Card";
import ListItem from "../../components/ListItem";
import Pill from "../../components/Pill";
import MetricRow from "../../components/MetricRow";
import { api } from "../../lib/api";
import { statusLabel } from "../../lib/format";

const STATUS_ICON = {
  COMPLIANT: { icon: IconCircleCheck, color: "green" },
  NEEDS_REVIEW: { icon: IconAlertTriangle, color: "amber" },
  NON_COMPLIANT: { icon: IconCircleX, color: "red" },
  SUSPICIOUS: { icon: IconCircleX, color: "red" },
};

export default function ShopBatch() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { scans, errors }
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");

  function handleFileChange(e) {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (files.length === 0 || !location.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createBatchScan(files, location.trim());
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const compliant =
    result?.scans.filter(
      (s) => s.compliance_status === "COMPLIANT"
    ).length ?? 0;

  const needsReview =
    result?.scans.filter(
      (s) => s.compliance_status !== "COMPLIANT"
    ).length ?? 0;

  return (
    <>
      <TopBar title="Batch scan" onBack={() => navigate("/shop")} />

      <ScreenContent>
        {!result && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-[1.5px] border-dashed border-border-secondary rounded-app-lg py-8 px-4 text-center text-text-secondary mb-3 cursor-pointer"
            >
              <IconUpload
                size={32}
                className="text-accent mx-auto mb-2"
              />

              <p className="text-sm font-medium text-text-primary mb-1">
                {files.length > 0
                  ? `${files.length} photo(s) selected`
                  : "Select multiple label photos"}
              </p>

              <p className="text-[13px]">Up to 20 at once</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Shop location (e.g. Koramangala, Bengaluru)"
              className="w-full border border-border-tertiary rounded-app-lg px-3 py-2 text-sm mb-3 bg-bg-primary text-text-primary"
            />

            {error && (
              <p className="text-xs text-fail-text mb-2">{error}</p>
            )}

            <ButtonPrimary
              onClick={handleAnalyze}
              disabled={
                files.length === 0 ||
                !location.trim() ||
                submitting
              }
            >
              {submitting
                ? `Analyzing ${files.length} photos…`
                : `Analyze ${files.length || ""} photos`}
            </ButtonPrimary>
          </>
        )}

        {result && (
          <>
            <MetricRow
              metrics={[
                { value: compliant, label: "Compliant" },
                {
                  value: needsReview,
                  label: "Needs attention",
                  color: "var(--color-fail-text)",
                },
              ]}
            />

            {result.errors.length > 0 && (
              <Card>
                <CardTitle className="text-fail-text mb-1">
                  {result.errors.length} image(s) failed
                </CardTitle>

                {result.errors.map((e, i) => (
                  <p
                    key={i}
                    className="text-xs text-text-secondary"
                  >
                    {e.filename}: {e.error}
                  </p>
                ))}
              </Card>
            )}

            <Card>
              {result.scans.map((scan) => {
                const meta =
                  STATUS_ICON[scan.compliance_status] || {
                    icon: IconCircleCheck,
                    color: "purple",
                  };

                const Icon = meta.icon;

                return (
                  <ListItem
                    key={scan.id}
                    icon={<Icon size={16} />}
                    iconColor={meta.color}
                    title={scan.image_filename}
                    sub={statusLabel(scan.compliance_status)}
                    right={
                      <Pill status={scan.compliance_status}>
                        {statusLabel(scan.compliance_status)}
                      </Pill>
                    }
                    onClick={() =>
                      navigate(`/shop/result/${scan.id}`)
                    }
                  />
                );
              })}
            </Card>

            <ButtonOutline
              onClick={() => {
                setFiles([]);
                setLocation("");
                setResult(null);
              }}
            >
              Scan another batch
            </ButtonOutline>
          </>
        )}
      </ScreenContent>
    </>
  );
}