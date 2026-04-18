import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiGet } from "../api";
import { useHyperNewsAuth } from "../auth";
import { HyperNewsInterestChart } from "../components/InterestChart";
import type { Profile } from "../types";

export function HyperNewsProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useHyperNewsAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/hypernews/login", { replace: true });
      return;
    }

    const userId = String(user?.id || "");
    if (!userId) {
      return;
    }

    apiGet<Profile>(`/me/profile?user_id=${encodeURIComponent(userId)}`)
      .then(setProfile)
      .catch(() => {});
  }, [isAuthenticated, navigate, user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="hn-loader-wrap">
        <div className="hn-glass-card" style={{ padding: 24 }}>Loading your profile...</div>
      </div>
    );
  }

  const userLabel = user?.name || user?.email || user?.id || "Unknown user";

  return (
    <div className="hn-profile-wrap">
      <div className="hn-profile-head">
        <Link to="/hypernews" className="hn-back-link">Back to Feed</Link>
        <span className="hn-inline-note">{userLabel}</span>
      </div>

      <h1 className="hn-profile-title">Your HyperNews Profile</h1>
      <p className="hn-profile-subtitle">Recent clicks, negative signals, searches, sources, and category interest.</p>

      {profile && (
        <div className="hn-stats-grid">
          {[
            { label: "Articles Read", value: profile.articles_read },
            { label: "Current Mood", value: profile.mood },
            { label: "Time of Day", value: profile.time_of_day },
            { label: "Recent Queries", value: profile.recent_queries.length },
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
        <HyperNewsInterestChart userId={profile?.user_id || user?.id || ""} />
      </div>

      {profile && (
        <div className="hn-two-col-grid">
          <ProfileCard title="Recent Clicks" items={profile.recent_clicks.slice(-25)} />
          <ProfileCard title="Recent Negative Signals" items={profile.recent_negative_actions.slice(-25)} negative />

          <div className="hn-glass-card" style={{ padding: 20 }}>
            <h2 className="hn-section-title">Recent Searches</h2>
            <div className="hn-list-stack">
              {profile.recent_searches.slice(0, 10).map((entry, index) => (
                <div key={`${entry.query_text}-${index}`} className="hn-list-item">
                  <div>{entry.query_text}</div>
                  <div className="hn-muted-caption">{entry.normalized_query}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hn-glass-card" style={{ padding: 20 }}>
            <h2 className="hn-section-title">Recent Feedback</h2>
            <div className="hn-list-stack">
              {profile.recent_feedback.slice(0, 10).map((entry, index) => (
                <div key={`${entry.article_id}-${index}`} className="hn-list-item">{entry.article_id} - {entry.action}</div>
              ))}
            </div>
          </div>

          <ProfileCard title="Recent Entities" items={profile.recent_entities.slice(-25)} />
          <ProfileCard title="Recent Sources" items={profile.recent_sources.slice(-25)} />
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
        {items.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
