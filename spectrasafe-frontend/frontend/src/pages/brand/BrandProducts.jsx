import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { ButtonPrimary } from "../../components/Button";
import { api } from "../../lib/api";

export default function BrandProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <TopBar title="My products" />
      <ScreenContent>
        {error && <p className="text-xs text-fail-text mb-2">{error}</p>}
        {!products && !error && <p className="text-xs text-text-secondary">Loading…</p>}
        {products && products.length === 0 && (
          <p className="text-xs text-text-secondary mb-3">
            You haven't registered any products yet.
          </p>
        )}
        {products && products.length > 0 && (
          <Card>
            {products.map((p) => (
              <ListItem
                key={p.id}
                title={p.product_name}
                sub={`${p.brand_name} · FSSAI ${p.fssai_license}`}
                onClick={() => navigate(`/brand/products/${p.id}`)}
              />
            ))}
          </Card>
        )}
        <ButtonPrimary onClick={() => navigate("/brand/products/new")}>
          Register a new product
        </ButtonPrimary>
      </ScreenContent>
    </>
  );
}