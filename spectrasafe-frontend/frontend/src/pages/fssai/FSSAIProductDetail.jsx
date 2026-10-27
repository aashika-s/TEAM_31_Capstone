import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconStack, IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card, { CardTitle, CardSub } from "../../components/Card";
import Pill from "../../components/Pill";
import SectionLabel from "../../components/SectionLabel";
import ListItem from "../../components/ListItem";
import { ButtonPrimary, ButtonOutline } from "../../components/Button";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

function KeyValueRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border-tertiary last:border-b-0 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right ml-4">{value}</span>
    </div>
  );
}

const VERIFICATION_VARIANT = { PENDING: "warn", VERIFIED: "pass", REJECTED: "fail" };
const VERIFICATION_LABEL = { PENDING: "Pending review", VERIFIED: "Verified", REJECTED: "Rejected" };

// Read-only for registry data, on purpose -- FSSAI has oversight access
// (phase-6 addition), not the ability to register products or batches,
// which stays Brand-only both here and on the backend. The one write
// action FSSAI does have here is the verification decision itself,
// which is exactly the authority this role is meant to exercise.
export default function FSSAIProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState(null);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.getProduct(productId).then(setProduct).catch((e) => setError(e.message));
    api.listBatches(productId).then(setBatches).catch(() => {});
  }, [productId]);

  async function review(status) {
    setReviewing(true);
    setReviewError(null);
    try {
      const updated = await api.reviewProduct(productId, status);
      setProduct(updated);
    } catch (e) {
      setReviewError(e.message);
    } finally {
      setReviewing(false);
    }
  }

  if (error) {
    return (
      <>
        <TopBar title="Product" onBack={() => navigate(-1)} />
        <ScreenContent>
          <p className="text-xs text-fail-text">{error}</p>
        </ScreenContent>
      </>
    );
  }
  if (!product) {
    return (
      <>
        <TopBar title="Product" onBack={() => navigate(-1)} />
        <ScreenContent>
          <p className="text-xs text-text-secondary">Loading…</p>
        </ScreenContent>
      </>
    );
  }

  return (
    <>
      <TopBar title={product.product_name} onBack={() => navigate(-1)} />
      <ScreenContent>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-[15px]">{product.product_name}</CardTitle>
            <div className="flex gap-1.5">
              {product.veg_status && (
                <Pill variant={product.veg_status === "VEG" ? "pass" : "warn"}>
                  {product.veg_status === "VEG" ? "Veg" : "Non-veg"}
                </Pill>
              )}
              <Pill variant={VERIFICATION_VARIANT[product.verification_status]}>
                {VERIFICATION_LABEL[product.verification_status]}
              </Pill>
            </div>
          </div>
          <CardSub>{product.brand_name}</CardSub>
          {typeof product.risk_score === "number" && (
            <CardSub className="mt-1">Risk score: {product.risk_score}</CardSub>
          )}
        </Card>

        {product.risk_flags?.length > 0 && (
          <Card>
            <CardTitle className="mb-2">Risk flags</CardTitle>
            {product.risk_flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] text-warn-text mb-1.5">
                <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>{f.label}:</strong> {f.detail}
                </span>
              </div>
            ))}
          </Card>
        )}

        {product.license_conflict && (
          <Card>
            <CardTitle className="mb-1 text-fail-text">License conflict</CardTitle>
            <p className="text-[13px] text-fail-text">{product.license_conflict.detail}</p>
          </Card>
        )}

        {product.verification_status === "PENDING" && (
          <>
            {reviewError && <p className="text-xs text-fail-text mb-2">{reviewError}</p>}
            <div className="flex gap-2 mb-3">
              <ButtonPrimary onClick={() => review("VERIFIED")} disabled={reviewing}>
                <IconCheck size={14} className="inline mr-1 -mt-0.5" />
                Verify
              </ButtonPrimary>
              <ButtonOutline onClick={() => review("REJECTED")} disabled={reviewing}>
                <IconX size={14} className="inline mr-1 -mt-0.5" />
                Reject
              </ButtonOutline>
            </div>
          </>
        )}

        <Card>
          <KeyValueRow label="FSSAI license" value={product.fssai_license} />
          <KeyValueRow label="Manufacturer" value={product.manufacturer_name} />
          <KeyValueRow label="Manufacturer address" value={product.manufacturer_address} />
          <KeyValueRow label="Net quantity" value={product.net_quantity} />
          <KeyValueRow label="MRP" value={product.mrp} />
        </Card>

        {product.ingredients_raw && (
          <Card>
            <CardTitle>Ingredients</CardTitle>
            <p className="text-[13px] text-text-secondary">{product.ingredients_raw}</p>
          </Card>
        )}

        {product.allergens?.length > 0 && (
          <Card>
            <CardTitle>Allergens</CardTitle>
            <p className="text-[13px] text-text-secondary">{product.allergens.join(", ")}</p>
          </Card>
        )}

        {product.nutrition && Object.keys(product.nutrition).length > 0 && (
          <Card>
            <CardTitle className="mb-2">Nutrition (as registered)</CardTitle>
            {Object.entries(product.nutrition).map(([k, v]) => (
              <KeyValueRow key={k} label={k} value={v} />
            ))}
          </Card>
        )}

        <SectionLabel>Batches</SectionLabel>
        {batches && batches.length === 0 && (
          <p className="text-xs text-text-secondary">No batches registered for this product.</p>
        )}
        {batches && batches.length > 0 && (
          <Card>
            {batches.map((b) => (
              <ListItem
                key={b.id}
                icon={<IconStack size={16} />}
                iconColor="purple"
                title={b.batch_number}
                sub={
                  b.manufacturing_date
                    ? `Mfg ${b.manufacturing_date}${b.best_before_date ? ` · BB ${b.best_before_date}` : ""}`
                    : `Registered ${timeAgo(b.created_at)}`
                }
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}