import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconSearch } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { api } from "../../lib/api";

/** Manual ingredient/additive search -- the "look it up yourself" option
 * for anything the pipeline didn't automatically match. Reads an initial
 * query from ?q= so ShopResult can link here pre-filled for an
 * unrecognized ingredient, but works as a free-standing search too. */
export default function ShopLookup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const handle = setTimeout(() => {
      api
        .searchEncyclopedia(query.trim())
        .then(setResults)
        .catch((e) => setError(e.message));
    }, 300); // debounce -- avoid firing a request per keystroke
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <>
      <TopBar title="Ingredient lookup" onBack={() => navigate(-1)} />
      <ScreenContent>
        <div className="flex items-center gap-2 mb-3 px-3 py-2 border border-border-tertiary rounded-app-md bg-bg-primary">
          <IconSearch size={16} className="text-text-tertiary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search an ingredient or INS number…"
            className="flex-1 outline-none bg-transparent text-sm text-text-primary"
          />
        </div>

        {error && <p className="text-xs text-fail-text">{error}</p>}
        {query.trim() && results === null && !error && (
          <p className="text-xs text-text-secondary">Searching…</p>
        )}
        {results && results.length === 0 && (
          <p className="text-xs text-text-secondary">
            No matches in the encyclopedia for "{query}".
          </p>
        )}
        {results && results.length > 0 && (
          <Card>
            {results.map((r) => (
              <ListItem
                key={r.slug}
                title={r.name}
                sub={r.category}
                onClick={() => navigate(`/shop/lookup/${r.slug}`)}
              />
            ))}
          </Card>
        )}
      </ScreenContent>
    </>
  );
}