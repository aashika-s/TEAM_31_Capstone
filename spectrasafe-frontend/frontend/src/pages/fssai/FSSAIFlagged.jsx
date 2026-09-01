import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconFlag } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import Pill from "../../components/Pill";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";

const FILTERS = [
  { key: null, label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "UNDER_REVIEW", label: "Under review" },
  { key: "RESOLVED", label: "Resolved" },
];

const STATUS_COLOR = { OPEN: "red", UNDER_REVIEW: "amber", RESOLVED: "green" };
const STATUS_PILL = { OPEN: "fail", UNDER_REVIEW: "warn", RESOLVED: "pass" };

export default function FSSAIFlagged() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState(null);
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listFlags()
      .then(setFlags)
      .catch((e) => setError(e.message));
  }, []);

  const visible = flags ? (filter ? flags.filter((f) => f.status === filter) : flags) : null;

  return (
    <>
      <TopBar title="Flagged products" />
      <ScreenContent>
        <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap border ${
                filter === f.key
                  ? "bg-accent text-accent-bg border-accent"
                  : "bg-bg-primary text-text-secondary border-border-tertiary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-fail-text">{error}</p>}
        {!visible && !error && <p className="text-xs text-text-secondary">Loading…</p>}
        {visible && visible.length === 0 && (
          <p className="text-xs text-text-secondary">No flags match this filter.</p>
        )}
        {visible && visible.length > 0 && (
          <Card>
            {visible.map((f) => (
              <ListItem
                key={f.id}
                icon={<IconFlag size={16} />}
                iconColor={STATUS_COLOR[f.status]}
                title={f.reason}
                sub={timeAgo(f.created_at)}
                right={<Pill variant={STATUS_PILL[f.status]}>{f.status}</Pill>}
                onClick={() => navigate(`/fssai/flagged/${f.id}`)}
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}