import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle, CardSub } from "../../components/Card";
import Pill from "../../components/Pill";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

const TIER_VARIANT = { HIGH: "fail", MEDIUM: "warn", LOW: "info" };

export default function FSSAIReviewQueue() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [actingOn, setActingOn] = useState(null);
  const [lastAction, setLastAction] = useState(null); // { productName, status } | null

  function load() {
    api
      .getReviewQueue()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);



  async function act(product, status) {
  const verb = status === "VERIFIED" ? "verify" : "reject";
  const flagSummary = product.risk_flags?.length
    ? `\n\nFlags on this registration:\n${product.risk_flags.map((f) => `• ${f.label}: ${f.detail}`).join("\n")}`
    : "\n\nNo risk flags on this registration.";

  const confirmed = window.confirm(
    `${verb === "verify" ? "Verify" : "Reject"} "${product.product_name}" (${product.manufacturer_name}, FSSAI ${product.fssai_license})?${flagSummary}`
  );
  if (!confirmed) return;

  setActingOn(product.id);
  try {
    await api.reviewProduct(product.id, status);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setLastAction({ productName: product.product_name, status });
  } catch (e) {
    setError(e.message);
  } finally {
    setActingOn(null);
  }
}

  function tierOf(score) {
    return score >= 50 ? "HIGH" : score >= 20 ? "MEDIUM" : "LOW";
  }

  return (
    <>
      <TopBar title="Review queue" onBack={() => navigate("/fssai")} />
      <ScreenContent>
        <CardSub className="mb-3">
          Pending product registrations, sorted highest-risk first.
        </CardSub>

        {error && <p className="text-xs text-fail-text mb-2">{error}</p>}
        {!products && !error && <p className="text-xs text-text-secondary">Loading…</p>}
        {products && products.length === 0 && (
          <p className="text-xs text-text-secondary">Nothing pending review.</p>
        )}

        {lastAction && (
  <Card className="border-pass-text">
    <p className="text-[13px] text-pass-text">
      "{lastAction.productName}" marked{" "}
      {lastAction.status === "VERIFIED" ? "Verified" : "Rejected"}.
    </p>
  </Card>
)}

        {products?.map((p) => {
          const tier = tierOf(p.risk_score);
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-[15px]">{p.product_name}</CardTitle>
                <Pill variant={TIER_VARIANT[tier]}>{tier} RISK · {p.risk_score}</Pill>
              </div>
              <CardSub className="mb-2">
                {p.manufacturer_name} · FSSAI {p.fssai_license} · {timeAgo(p.created_at)}
              </CardSub>

              {p.risk_flags?.length > 0 && (
                <div className="mb-3">
                  {p.risk_flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px] text-warn-text mb-1">
                      <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{f.label}:</strong> {f.detail}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <ButtonPrimary onClick={() => act(p, "VERIFIED")} disabled={actingOn === p.id}>
  <IconCheck size={14} className="inline mr-1 -mt-0.5" />
  Verify
</ButtonPrimary>
<ButtonOutline onClick={() => act(p, "REJECTED")} disabled={actingOn === p.id}>
  <IconX size={14} className="inline mr-1 -mt-0.5" />
  Reject
</ButtonOutline>
                <ButtonOutline onClick={() => navigate(`/fssai/products/${p.id}`)} disabled={actingOn === p.id}>
                  View details
                </ButtonOutline>
              </div>
            </Card>
          );
        })}
      </ScreenContent>
    </>
  );
}