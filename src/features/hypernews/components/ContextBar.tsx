import { useState } from "react";
import { Link } from "react-router";
import { HyperNewsCameraMoodWidget } from "./CameraMoodWidget";
import { HyperNewsLocationWidget } from "./LocationWidget";
import type { LocationContext, LocationStatus, MoodInputMode, MoodKey } from "../types";

interface Mood {
  key: MoodKey;
  emoji: string;
  label: string;
}

interface Props {
  isAuthenticated: boolean;
  authLabel: string;
  currentUserId: string;
  setUserId: (value: string) => void;
  mood: MoodKey;
  setMood: (value: MoodKey) => void;
  moodInputMode: MoodInputMode;
  setMoodInputMode: (mode: MoodInputMode) => void;
  detectedMood: MoodKey | null;
  setDetectedMood: (mood: MoodKey | null) => void;
  confidence: number | null;
  setConfidence: (confidence: number | null) => void;
  lastStableMood: MoodKey | null;
  setLastStableMood: (mood: MoodKey | null) => void;
  moods: Mood[];
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  locationStatus: LocationStatus;
  locationContext: LocationContext | null;
  onEnableLocation: () => void;
  onUseApproximateLocation: () => void;
  onClearLocation: () => void;
  onSaveManualLocation: (input: { city: string; region: string; country: string }) => void;
  onRefresh: () => void;
  onResetProfile: () => void;
  onNewSession: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  onRegister: () => void;
  loading: boolean;
  mode: string;
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

export function HyperNewsContextBar({
  isAuthenticated,
  authLabel,
  currentUserId,
  setUserId,
  mood,
  setMood,
  moodInputMode,
  setMoodInputMode,
  detectedMood,
  setDetectedMood,
  confidence,
  setConfidence,
  lastStableMood,
  setLastStableMood,
  moods,
  query,
  setQuery,
  onSearch,
  locationStatus,
  locationContext,
  onEnableLocation,
  onUseApproximateLocation,
  onClearLocation,
  onSaveManualLocation,
  onRefresh,
  onResetProfile,
  onNewSession,
  onSignOut,
  onSignIn,
  onRegister,
  loading,
  mode,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [draftUserId, setDraftUserId] = useState(currentUserId);

  const activeMood = moods.find((entry) => entry.key === mood);

  const commitUserId = () => {
    const nextUserId = draftUserId.trim();
    if (!nextUserId) {
      setDraftUserId(currentUserId);
      setEditingId(false);
      return;
    }

    setUserId(nextUserId);
    setEditingId(false);
  };

  return (
    <>
      <button
        className="hn-sidebar-toggle"
        onClick={() => setSidebarOpen((previous) => !previous)}
        aria-label="Toggle HyperNews controls"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {sidebarOpen && <div className="hn-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`hn-sidebar ${sidebarOpen ? "open" : ""}`}>
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
          <div className="hn-sidebar-section">
            <div className="hn-user-info">
              <span className="hn-user-status">
                {isAuthenticated ? "Signed in locally as" : "Browsing as"}
              </span>
              <strong className="hn-user-name">{authLabel}</strong>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span className="hn-time-label" style={{ color: "#ffffff", fontSize: 15, fontWeight: 600 }}>
                  {getTimeLabel()}
                </span>
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

              <div style={{ display: "grid", gap: 6 }}>
                <span className="hn-sidebar-label" style={{ marginBottom: 0 }}>Backend User ID</span>
                {editingId ? (
                  <input
                    autoFocus
                    value={draftUserId}
                    onChange={(event) => setDraftUserId(event.target.value)}
                    onBlur={commitUserId}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        commitUserId();
                      }
                    }}
                    className="hn-search-input"
                    style={{ paddingRight: 14 }}
                  />
                ) : (
                  <button
                    type="button"
                    className="hn-sidebar-btn"
                    style={{ textAlign: "left" }}
                    onClick={() => {
                      setDraftUserId(currentUserId);
                      setEditingId(true);
                    }}
                  >
                    {currentUserId || "loading..."}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Search</label>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSearch();
              }}
              className="hn-sidebar-search-form"
            >
              <input
                type="text"
                placeholder="Search with AI reranking..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="hn-search-input"
                style={{ paddingRight: 14 }}
              />
              <button type="submit" disabled={loading} className="hn-sidebar-btn" style={{ textAlign: "center" }}>
                {loading ? "Searching..." : "Search Feed"}
              </button>
            </form>
          </div>

          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Manual Mood</label>
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
            <div className="hn-inline-note" style={{ marginTop: -2 }}>
              {moodInputMode === "camera" ? "Camera mood is currently driving recommendations." : activeMood ? `Current manual mood: ${activeMood.label}` : "Pick the mood that best fits right now."}
            </div>
          </div>

          <div className="hn-sidebar-section">
            <HyperNewsCameraMoodWidget
              moodInputMode={moodInputMode}
              setMoodInputMode={setMoodInputMode}
              setMood={setMood}
              detectedMood={detectedMood}
              setDetectedMood={setDetectedMood}
              confidence={confidence}
              setConfidence={setConfidence}
              lastStableMood={lastStableMood}
              setLastStableMood={setLastStableMood}
            />
          </div>

          <div className="hn-sidebar-section">
            <HyperNewsLocationWidget
              status={locationStatus}
              location={locationContext}
              loading={loading}
              onEnableGps={onEnableLocation}
              onUseApproximate={onUseApproximateLocation}
              onClear={onClearLocation}
              onSaveManual={onSaveManualLocation}
            />
          </div>

          <div className="hn-sidebar-section">
            <label className="hn-sidebar-label">Actions</label>
            <div className="hn-sidebar-actions">
              <Link to="/hypernews/profile" className="hn-sidebar-btn" onClick={() => setSidebarOpen(false)}>
                View Current Profile
              </Link>
              <button onClick={() => { onRefresh(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">
                {loading ? "Loading..." : "Refresh Feed"}
              </button>
              <button onClick={() => { onNewSession(); setSidebarOpen(false); }} className="hn-sidebar-btn">
                Fresh Session
              </button>
              <button onClick={() => { onResetProfile(); setSidebarOpen(false); }} disabled={loading} className="hn-sidebar-btn">
                Reset Profile Memory
              </button>

              {isAuthenticated ? (
                <button onClick={() => { onSignOut(); setSidebarOpen(false); }} className="hn-sidebar-btn">
                  Sign Out
                </button>
              ) : (
                <>
                  <button onClick={() => { onRegister(); setSidebarOpen(false); }} className="hn-sidebar-btn">
                    Register
                  </button>
                  <button onClick={() => { onSignIn(); setSidebarOpen(false); }} className="hn-sidebar-btn">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
