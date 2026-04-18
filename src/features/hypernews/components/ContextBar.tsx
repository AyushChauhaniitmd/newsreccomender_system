import { useState, type CSSProperties } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Fixed Toggle Button */}
      <button
        className="hn-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="hn-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`hn-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="hn-sidebar-header">
          <h2 className="hn-sidebar-title">HyperNews Controls</h2>
          <button className="hn-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="hn-sidebar-content">
          {/* User Info */}
          <div className="hn-sidebar-section">
            <div className="hn-user-info">
              <span className="hn-user-status">
                {isAuthenticated ? "Signed in as : " : "Browsing as : "}
                <strong className="hn-user-name" style={{ display: "inline" }}>{userLabel}</strong>
              </span>
              <span className="hn-time-label" style={{ color: "#ffffff", fontSize: "16px", fontWeight: "600" }}>{getTimeLabel()}</span>
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
            </div>
          </div>

          {/* Mood Selection */}
          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Mood</label>
            <div className="hn-moods-sidebar">
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
          </div>

          {/* Explore Focus */}
          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Explore vs Focus</label>
            <div className="hn-range-wrap-sidebar">
              <span>Explore</span>
              <input
                type="range"
                min={0}
                max={100}
                value={exploreFocus}
                onChange={(event) => setExploreFocus(Number(event.target.value))}
              />
              <span>Focus</span>
              <span className="hn-range-value">{exploreFocus}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Actions</label>
            <div className="hn-sidebar-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/hypernews/profile" className="hn-sidebar-btn" onClick={() => setSidebarOpen(false)}>Profile</Link>
                  <button onClick={() => { onResetProfile(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">Reset Profile</button>
                  <button onClick={() => { onRefresh(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">{loading ? "Loading..." : "Refresh Feed"}</button>
                  <button onClick={() => { onSignOut(); setSidebarOpen(false); }} className="hn-sidebar-btn">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onRegister(); setSidebarOpen(false); }} className="hn-sidebar-btn">Register</button>
                  <button onClick={() => { onSignIn(); setSidebarOpen(false); }} className="hn-sidebar-btn">Sign In</button>
                  <button onClick={() => { onResetProfile(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">Reset Guest Session</button>
                  <button onClick={() => { onRefresh(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">{loading ? "Loading..." : "Refresh Feed"}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
