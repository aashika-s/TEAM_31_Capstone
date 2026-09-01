import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBuildingFactory2 } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { api } from "../../lib/api";

export default function FSSAIManufacturers() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetches the FULL registry (real read access granted to FSSAI this
    // phase) and groups client-side -- fine at today's data volume; a
    // dedicated aggregation endpoint would be the move if the registry
    // grows large enough for this to matter.
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  const manufacturers = products
    ? Object.values(
        products.reduce((acc, p) => {
          if (!acc[p.manufacturer_name]) {
            acc[p.manufacturer_name] = { name: p.manufacturer_name, count: 0 };
          }
          acc[p.manufacturer_name].count += 1;
          return acc;
        }, {})
      ).sort((a, b) => b.count - a.count)
    : null;

  return (
    <>
      <TopBar title="Manufacturers" />
      <ScreenContent>
        {error && <p className="text-xs text-fail-text">{error}</p>}
        {!manufacturers && !error && <p className="text-xs text-text-secondary">Loading…</p>}
        {manufacturers && manufacturers.length === 0 && (
          <p className="text-xs text-text-secondary">No products registered in the system yet.</p>
        )}
        {manufacturers && manufacturers.length > 0 && (
          <Card>
            {manufacturers.map((m) => (
              <ListItem
                key={m.name}
                icon={<IconBuildingFactory2 size={16} />}
                iconColor="purple"
                title={m.name}
                sub={`${m.count} product${m.count === 1 ? "" : "s"} registered`}
                onClick={() => navigate(`/fssai/manufacturers/${encodeURIComponent(m.name)}`)}
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}