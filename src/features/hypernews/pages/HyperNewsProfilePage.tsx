import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { apiGet } from "../api";
import { useHyperNewsAuth } from "../auth";
import { HyperNewsInterestChart } from "../components/InterestChart";
import { readSessionUserId } from "../session";
import type { Profile } from "../types";

export function HyperNewsProfilePage() {
  const location = useLocation();
  const { user, isAuthenticated } = useHyperNewsAuth();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionUserId, setSessionUserId] = useState("");

  const requestedUserId = params.get("user") || "";
  const fallbackUserId = sessionUserId || String(user?.id || "");
  const userId = requestedUserId || fallbackUserId;

  useEffect(() => {
    setSessionUserId(readSessionUserId());
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    apiGet<Profile>(`/profile/${encodeURIComponent(userId)}`)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [userId]);

  const userLabel =
    requestedUserId ||
    (isAuthenticated ? user?.name || user?.email || user?.id || "Signed-in user" : sessionUserId || "No active session");

  return (
    <div className="hn-profile-wrap">
      <div className="hn-profile-head">
        <Link to="/hypernews" className="hn-back-link">Back to Feed</Link>
        <span className="hn-inline-note">{userLabel}</span>
      </div>

      <h1 className="hn-profile-title">Your HyperNews Profile</h1>
      <p className="hn-profile-subtitle">Session behavior, active location context, recent clicks and skips, and category interest.</p>

      {!userId && (
        <div className="hn-glass-card" style={{ padding: 24 }}>
          <div className="hn-inline-note">No active session was found. Open the feed to start one.</div>
        </div>
      )}

      {profile && (
        <div className="hn-stats-grid">
          {[
            { label: "Articles Read", value: profile.articles_read },
            { label: "Current Mood", value: profile.mood },
            { label: "Time of Day", value: profile.time_of_day },
            { label: "Positive Signals", value: profile.total_positive_interactions },
          ].map((stat) => (
            <div key={stat.label} className="hn-glass-card hn-stat-card">
              <div className="hn-stat-value">{stat.value}</div>
              <div className="hn-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="hn-glass-card" style={{ padding: "24px 20px", marginBottom: 20 }}>
        <h2 className="hn-section-title">Category Interest Profile</h2>
        <HyperNewsInterestChart userId={profile?.user_id || userId} />
      </div>

      {profile && (
        <div className="hn-two-col-grid">
          <ProfileCard title="Recent Clicks" items={profile.recent_clicks.slice(-25)} />
          <ProfileCard title="Recent Skips" items={profile.recent_skips.slice(-25)} negative />

          <div className="hn-glass-card" style={{ padding: 20 }}>
            <h2 className="hn-section-title">Session Topics</h2>
            <div className="hn-tag-row">
              {profile.session_topics.length > 0 ? (
                profile.session_topics.slice(-20).map((topic) => (
                  <span key={topic} className="hn-badge hn-badge-soft">{topic}</span>
                ))
              ) : (
                <div className="hn-inline-note">Topics will appear after you interact with articles.</div>
              )}
            </div>
          </div>

          <div className="hn-glass-card" style={{ padding: 20 }}>
            <h2 className="hn-section-title">Location Context</h2>
            {profile.location ? (
              <div className="hn-list-stack">
                <div className="hn-list-item">{[profile.location.city, profile.location.region, profile.location.country].filter(Boolean).join(", ") || "Location set"}</div>
                <div className="hn-list-item">Source: {profile.location.source || "unknown"}</div>
                {profile.location.timezone && <div className="hn-list-item">Timezone: {profile.location.timezone}</div>}
                {profile.location.language_hint && <div className="hn-list-item">Language hint: {profile.location.language_hint}</div>}
              </div>
            ) : (
              <div className="hn-inline-note">No location context is active for this profile.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ title, items, negative = false }: { title: string; items: string[]; negative?: boolean }) {
  return (
    <div className="hn-glass-card" style={{ padding: 20 }}>
      <h2 className="hn-section-title">{title}</h2>
      <div className="hn-tag-row">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="hn-badge"
              style={
                negative
                  ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }
                  : undefined
              }
            >
              {item}
            </span>
          ))
        ) : (
          <div className="hn-inline-note">No entries yet.</div>
        )}
      </div>
    </div>
  );
}
