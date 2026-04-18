import type { Article } from "../types";

interface Props {
  article: Article;
  feedbackState: string | null;
  onFeedback: (action: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Tech",
  sports: "Sports",
  politics: "Politics",
  entertainment: "Culture",
  science: "Science",
  business: "Business",
  lifestyle: "Lifestyle",
  health: "Health",
};

function normalizeCategory(value: string): string {
  return String(value || "").trim().toLowerCase();
}

export function HyperNewsCard({ article, feedbackState, onFeedback }: Props) {
  const categoryKey = normalizeCategory(article.category);
  const categoryLabel = CATEGORY_LABELS[categoryKey] ?? article.category ?? "News";
  const score = typeof article.score === "number" ? Math.min(1, Math.max(0, article.score / 3)) : 0;
  const done = !!feedbackState;
  const reasons = Array.isArray(article.reasons) ? article.reasons.slice(0, 4) : [];
  const matchedEntities = Array.isArray(article.matched_entities) ? article.matched_entities.slice(0, 3) : [];

  const actions: Array<{ key: string; label: string }> = [
    { key: "read_full", label: "Read" },
    { key: "save", label: "Save" },
    { key: "more_like_this", label: "More like this" },
    { key: "skip", label: "Skip" },
    { key: "not_interested", label: "Not interested" },
  ];

  if (article.source) {
    actions.push({ key: "less_from_source", label: `Less from ${article.source}` });
  }

  return (
    <div className="hn-glass-card hn-news-card">
      <div className="hn-news-card-head">
        <span className="hn-badge">{categoryLabel}</span>
        <div className="hn-card-meta">
          {article.candidate_source && <span>{article.candidate_source}</span>}
          <span>Score: {(article.score ?? 0).toFixed(3)}</span>
        </div>
      </div>

      <h3 className="hn-news-title">{article.title}</h3>
      <p className="hn-news-abstract">{article.abstract}</p>

      {(reasons.length > 0 || matchedEntities.length > 0) && (
        <div className="hn-tag-row">
          {reasons.map((reason) => (
            <span key={reason} className="hn-badge hn-badge-soft">{reason}</span>
          ))}
          {matchedEntities.map((entity) => (
            <span key={entity} className="hn-badge hn-badge-entity">{entity}</span>
          ))}
        </div>
      )}

      <div className="hn-score-track">
        <div className="hn-score-fill" style={{ width: `${score * 100}%` }} />
      </div>

      <div className="hn-action-row">
        {actions.map((action) => {
          const active = feedbackState === action.key;
          return (
            <button
              key={action.key}
              className={`hn-action-btn${active ? " active" : ""}`}
              onClick={() => !done && onFeedback(action.key)}
              disabled={done}
              style={{ opacity: done && !active ? 0.4 : 1 }}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
