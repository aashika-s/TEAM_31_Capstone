import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle, CardSub } from "../../components/Card";
import Pill from "../../components/Pill";
import SectionLabel from "../../components/SectionLabel";
import ProgressBar from "../../components/ProgressBar";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import { api } from "../../lib/api";
import { statusLabel } from "../../lib/format";

const SCORE_VARIANT = (score) => (score >= 80 ? "pass" : score >= 50 ? "warn" : "fail");

function KeyValueRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right ml-4">{value}</span>
    </div>
  );
}

export default function FSSAIFlagDetail() {
  const { flagId } = useParams();
  const navigate = useNavigate();
  const [flag, setFlag] = useState(null);
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api
      .getFlag(flagId)
      .then((f) => {
        setFlag(f);
        return api.getScan(f.scan_id);
      })
      .then(setScan)
      .catch((e) => setError(e.message));
  }, [flagId]);

  async function setStatus(status) {
    setUpdating(true);
    try {
      const updated = await api.updateFlagStatus(flagId, status);
      setFlag(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  if (error) {
    return (
      <>
        <TopBar title="Flag detail" onBack={() => navigate("/fssai/flagged")} />
        <ScreenContent>
          <p className="text-xs text-fail-text">{error}</p>
        </ScreenContent>
      </>
    );
  }
  if (!flag || !scan) {
    return (
      <>
        <TopBar title="Flag detail" onBack={() => navigate("/fssai/flagged")} />
        <ScreenContent>
          <p className="text-xs text-text-secondary">Loading…</p>
        </ScreenContent>
      </>
    );
  }

  return (
    <>
      <TopBar title="Flag detail" onBack={() => navigate("/fssai/flagged")} />
      <ScreenContent>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-[15px]">{flag.reason}</CardTitle>
            <Pill variant={flag.status === "OPEN" ? "fail" : flag.status === "UNDER_REVIEW" ? "warn" : "pass"}>
              {flag.status}
            </Pill>
          </div>
          {flag.observations && <CardSub>{flag.observations}</CardSub>}
        </Card>

        <div className="flex gap-2 mb-3">
  {flag.status !== "UNDER_REVIEW" && (
    <ButtonOutline onClick={() => setStatus("UNDER_REVIEW")} disabled={updating}>
      Mark under review
    </ButtonOutline>
  )}
  {flag.status !== "RESOLVED" && (
    <ButtonPrimary onClick={() => setStatus("RESOLVED")} disabled={updating}>
      Mark resolved
    </ButtonPrimary>
  )}
</div>

<ButtonOutline
  onClick={() =>
    navigate(
      `/fssai/notice/new?flag_id=${flag.id}` +
        (scan.ocr_result?.fssai_license ? `&fssai_license=${encodeURIComponent(scan.ocr_result.fssai_license)}` : "")
    )
  }
>
  Issue notice from this flag
</ButtonOutline>

        <SectionLabel>Scanned label</SectionLabel>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-[15px]">{scan.image_filename}</CardTitle>
            <Pill status={scan.compliance_status}>{statusLabel(scan.compliance_status)}</Pill>
          </div>
          <CardSub>Compliance score</CardSub>
          <ProgressBar value={scan.compliance_score} variant={SCORE_VARIANT(scan.compliance_score)} />
        </Card>

        <Card>
          <KeyValueRow label="FSSAI license" value={scan.ocr_result?.fssai_license} />
        </Card>

        {scan.product_verification && scan.product_verification.status !== "NO_LICENSE_EXTRACTED" && (
          <Card>
            <CardTitle className="mb-1">Registry check</CardTitle>
            <p className="text-[13px] text-text-primary mb-1">
              {scan.product_verification.matched_product_name || "Not registered"}
            </p>
            {scan.product_verification.mismatches?.map((m, i) => (
              <p key={i} className="text-[13px] text-fail-text">
                {m}
              </p>
            ))}
          </Card>
        )}

        {scan.compliance_result?.violations?.length > 0 && (
          <Card>
            <CardTitle className="mb-1">Violations</CardTitle>
            {scan.compliance_result.violations.map((v, i) => (
              <p key={i} className="text-[13px] text-fail-text mb-1">
                {v}
              </p>
            ))}
          </Card>
        )}

        {scan.ocr_result?.ingredients?.length > 0 && (
          <Card>
            <CardTitle>Ingredients</CardTitle>
            <p className="text-[13px] text-text-secondary">{scan.ocr_result.ingredients.join(", ")}</p>
          </Card>
        )}
      </ScreenContent>
    </>
  );
}