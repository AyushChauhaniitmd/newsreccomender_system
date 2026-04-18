import type { CSSProperties } from "react";
import { Link } from "react-router";

interface Mood {
  key: string;
  emoji: string;
  label: string;
}

interface Props {
  isAuthenticated: boolean;
  userLabel: string;
  mood: string;
  setMood: (v: string) => void;
  moods: Mood[];
  query: string;
  setQuery: (v: string) => void;
  suggestions: string[];
  onSearch: () => void;
  onRefresh: () => void;
  onResetProfile: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onRegister: () => void;
  loading: boolean;
  mode: string;
  exploreFocus: number;
  setExploreFocus: (v: number) => void;
}

function getTimeLabel(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

const MODE_COLORS: Record<string, string> = {
  rag: "#6366f1",
  rl: "#22c55e",
  cold_start: "#f59e0b",
};

const secondaryButtonStyle: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--hn-glass-border)",
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--hn-text-secondary)",
  cursor: "pointer",
};

export function HyperNewsContextBar({
  isAuthenticated,
  userLabel,
  mood,
  setMood,
  moods,
  query,
  setQuery,
  suggestions,
  onSearch,
  onRefresh,
  onResetProfile,
  onSignOut,
  onSignIn,
  onRegister,
  loading,
  mode,
  exploreFocus,
  setExploreFocus,
}: Props) {
  return (
    <header className="hn-header">
      <div className="hn-header-row">
        <div className="hn-brand">
          <span className="hn-brand-icon">HN</span>
          <span className="hn-brand-text">HyperNews</span>
        </div>

        <div className="hn-toolbar">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
            className="hn-search-form"
          >
            <input
              list="hypernews-search-suggestions"
              name="newsSearch"
              type="text"
              placeholder="Search with AI, memory, and reranking..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="hn-search-input"
            />
            <datalist id="hypernews-search-suggestions">
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>

            <button type="submit" disabled={loading} className="hn-search-btn">
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="hn-user-chip">
            <span>{isAuthenticated ? "Signed in as" : "Browsing as"}</span>
            <strong>{userLabel}</strong>
          </div>

          <span className="hn-time-label">{getTimeLabel()}</span>

          {mode && (
            <span
              className="hn-mode-pill"
              style={{
                background: `${MODE_COLORS[mode] || "#475569"}22`,
                color: MODE_COLORS[mode] || "#94a3b8",
                border: `1px solid ${MODE_COLORS[mode] || "#475569"}44`,
              }}
            >
              {mode.toUpperCase()}
            </span>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/hypernews/profile" className="hn-link-btn">Profile</Link>
              <button onClick={onResetProfile} disabled={loading} style={secondaryButtonStyle}>Reset Profile</button>
              <button onClick={onRefresh} disabled={loading} style={secondaryButtonStyle}>{loading ? "Loading..." : "Refresh Feed"}</button>
              <button onClick={onSignOut} style={secondaryButtonStyle}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={onRegister} style={secondaryButtonStyle}>Register</button>
              <button onClick={onSignIn} style={secondaryButtonStyle}>Sign In</button>
              <button onClick={onResetProfile} disabled={loading} style={secondaryButtonStyle}>Reset Guest Session</button>
              <button onClick={onRefresh} disabled={loading} style={secondaryButtonStyle}>{loading ? "Loading..." : "Refresh Feed"}</button>
            </>
          )}
        </div>
      </div>

      <div className="hn-header-subrow">
        <div className="hn-moods">
          <span className="hn-mood-label">Mood:</span>
          {moods.map((moodOption) => (
            <button
              key={moodOption.key}
              className={`hn-mood-pill${mood === moodOption.key ? " active" : ""}`}
              onClick={() => setMood(moodOption.key)}
            >
              {moodOption.emoji} {moodOption.label}
            </button>
          ))}
        </div>

        <label className="hn-range-wrap">
          <span>Explore</span>
          <input
            type="range"
            min={0}
            max={100}
            value={exploreFocus}
            onChange={(event) => setExploreFocus(Number(event.target.value))}
          />
          <span>Focus</span>
          <span>{exploreFocus}</span>
        </label>
      </div>
    </header>
  );
}
