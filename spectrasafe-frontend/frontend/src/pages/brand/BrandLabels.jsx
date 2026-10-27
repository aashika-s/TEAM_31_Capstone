import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconFileText } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { ButtonPrimary } from "../../components/Button";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

export default function BrandLabels() {
  const navigate = useNavigate();
  const [labels, setLabels] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listLabels().then(setLabels).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <TopBar title="Labels" />
      <ScreenContent>
        <ButtonPrimary onClick={() => navigate("/brand/labels/new")}>Create new label</ButtonPrimary>

        {error && <p className="text-xs text-fail-text mt-3">{error}</p>}
        {labels && labels.length === 0 && <p className="text-xs text-text-secondary mt-3">No labels yet.</p>}
        {labels && labels.length > 0 && (
          <Card className="mt-3">
            {labels.map((l) => (
              <ListItem
                key={l.id}
                icon={<IconFileText size={16} />}
                iconColor="purple"
                title={l.title}
                sub={`v${l.current_version} · updated ${timeAgo(l.updated_at)}`}
                onClick={() => navigate(`/brand/labels/${l.id}`)}
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}