import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, apiGet, apiPost } from "../api";
import { useHyperNewsAuth } from "../auth";
import { useHyperNewsSearch } from "../SearchContext";
import { HyperNewsContextBar } from "../components/ContextBar";
import { HyperNewsExplanationBanner } from "../components/ExplanationBanner";
import { HyperNewsKnowledgeGraphPanel } from "../components/KnowledgeGraphPanel";
import { HyperNewsCard } from "../components/NewsCard";
import { createSessionUserId, ensureSessionUserId, readSessionUserId, writeSessionUserId } from "../session";
import type {
  Article,
  FeedbackAction,
  LocationContext,
  LocationResponse,
  LocationStatus,
  MoodInputMode,
  MoodKey,
  Profile,
  RecommendResponse,
} from "../types";

const PAGE_SIZE = 8;

const MOODS: Array<{ key: MoodKey; emoji: string; label: string }> = [
  { key: "neutral", emoji: "😐", label: "Neutral" },
  { key: "curious", emoji: "🤔", label: "Curious" },
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "stressed", emoji: "😰", label: "Stressed" },
  { key: "tired", emoji: "😴", label: "Tired" },
];

function normalizeArticleId(value: unknown): string {
  return String(value ?? "").trim();
}

function browserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function locationStatusFromContext(location: LocationContext | null): LocationStatus {
  if (!location?.source) return "off";
  if (location.source === "gps") return "gps";
  if (location.source === "ip") return "ip";
  return "manual";
}

export function HyperNewsHomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useHyperNewsAuth();
  const { query, setQuery, setSuggestions, setOnSearch, setLoading: setSearchLoading } = useHyperNewsSearch();

  const [userId, setUserIdState] = useState("");
  const [mood, setMood] = useState<MoodKey>("neutral");
  const [moodInputMode, setMoodInputMode] = useState<MoodInputMode>("manual");
  const [detectedMood, setDetectedMood] = useState<MoodKey | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [lastStableMood, setLastStableMood] = useState<MoodKey | null>(null);
  const [activeQuery, setActiveQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [explanation, setExplanation] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("off");
  const [locationContext, setLocationContext] = useState<LocationContext | null>(null);
  const [hasLoadedFeed, setHasLoadedFeed] = useState(false);
  const previousAuthUserIdRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const authUserId = isAuthenticated ? String(user?.id || "") : "";
  const authLabel = isAuthenticated ? user?.name || user?.email || authUserId : "Guest session";

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string) => {
      clearToastTimer();
      setToastMsg(message);
      toastTimerRef.current = window.setTimeout(() => {
        setToastMsg("");
      }, 2500);
    },
    [clearToastTimer],
  );

  useEffect(() => {
    return () => clearToastTimer();
  }, [clearToastTimer]);

  useEffect(() => {
    if (authUserId) {
      writeSessionUserId(authUserId);
      setUserIdState(authUserId);
      previousAuthUserIdRef.current = authUserId;
      return;
    }

    const storedUserId = readSessionUserId();
    if (storedUserId && storedUserId !== previousAuthUserIdRef.current) {
      setUserIdState(storedUserId);
      previousAuthUserIdRef.current = null;
      return;
    }

    const nextGuestUserId = previousAuthUserIdRef.current ? createSessionUserId() : ensureSessionUserId();
    writeSessionUserId(nextGuestUserId);
    setUserIdState(nextGuestUserId);
    previousAuthUserIdRef.current = null;
  }, [authUserId]);

  const setUserId = useCallback((nextUserId: string) => {
    const trimmedUserId = nextUserId.trim();
    if (!trimmedUserId) {
      return;
    }

    writeSessionUserId(trimmedUserId);
    setFeedbackMap({});
    setLocationContext(null);
    setLocationStatus("off");
    setUserIdState(trimmedUserId);
    setArticles([]);
    setExplanation("");
    setMode("");
    setHasLoadedFeed(false);
  }, []);

  const fetchRecommendations = useCallback(
    async (queryOverride?: string) => {
      if (!userId) {
        return;
      }

      const nextQuery = (queryOverride ?? activeQuery).trim();
      setLoading(true);
      setSearchLoading(true);

      try {
        const data = await apiPost<RecommendResponse>("/recommend", {
          user_id: userId,
          mood,
          query: nextQuery || null,
          n: PAGE_SIZE,
        });

        const nextArticles = Array.isArray(data.articles) ? data.articles : [];
        setArticles(nextArticles);
        setExplanation(data.explanation || "");
        setMode(data.mode || "");
        setFeedbackMap((previous) => {
          const next: Record<string, string> = {};
          for (const article of nextArticles) {
            const key = normalizeArticleId(article.news_id);
            if (previous[key]) {
              next[key] = previous[key];
            }
          }
          return next;
        });
      } catch {
        showToast("Cannot reach backend. Is FastAPI running?");
      } finally {
        setLoading(false);
        setSearchLoading(false);
        setHasLoadedFeed(true);
      }
    },
    [activeQuery, mood, setSearchLoading, showToast, userId],
  );

  const syncLocationFromProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const profile = await apiGet<Profile>(`/profile/${encodeURIComponent(userId)}`);
      const nextLocation = profile.location || null;
      setLocationContext(nextLocation);
      setLocationStatus(locationStatusFromContext(nextLocation));
    } catch {
      // Silent fail to keep the feed usable without location.
    }
  }, [userId]);

  useEffect(() => {
    setSuggestions([]);
  }, [query, setSuggestions]);

  const submitSearch = useCallback(() => {
    const nextQuery = query.trim();
    if (nextQuery === activeQuery) {
      void fetchRecommendations(nextQuery);
      return;
    }

    setActiveQuery(nextQuery);
  }, [activeQuery, fetchRecommendations, query]);

  useEffect(() => {
    setOnSearch(submitSearch);
    return () => setOnSearch(() => {});
  }, [setOnSearch, submitSearch]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void fetchRecommendations(activeQuery);
  }, [activeQuery, fetchRecommendations, mood, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void syncLocationFromProfile();
  }, [syncLocationFromProfile, userId]);

  const applyLocationPayload = useCallback(
    async (payload: LocationResponse, successMessage: string) => {
      if (!payload.location) {
        setLocationStatus("error");
        showToast(payload.detail || "Location lookup failed.");
        return false;
      }

      setLocationContext(payload.location);
      setLocationStatus(locationStatusFromContext(payload.location));
      showToast(successMessage);
      await fetchRecommendations(activeQuery);
      return true;
    },
    [activeQuery, fetchRecommendations, showToast],
  );

  const enableLocation = useCallback(() => {
    if (!userId) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      showToast("This browser cannot provide device location.");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = await apiPost<LocationResponse>("/context/location", {
            user_id: userId,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timezone: browserTimezone(),
          });
          await applyLocationPayload(payload, "Precise location enabled");
        } catch (error) {
          setLocationStatus("error");
          showToast(error instanceof ApiError ? error.detail : "Failed to resolve device location.");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          showToast("Location permission denied");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setLocationStatus("timeout");
          showToast("Location request timed out");
          return;
        }

        setLocationStatus("unavailable");
        showToast("Device location is unavailable");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }, [applyLocationPayload, showToast, userId]);

  const useApproximateLocation = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLocationStatus("requesting");

    try {
      const payload = await apiPost<LocationResponse>("/context/location/ip", {
        user_id: userId,
        timezone: browserTimezone(),
      });
      await applyLocationPayload(payload, "Approximate location enabled");
    } catch (error) {
      setLocationStatus("error");
      showToast(error instanceof ApiError ? error.detail : "Failed to resolve approximate location.");
    }
  }, [applyLocationPayload, showToast, userId]);

  const clearLocation = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      await apiPost("/context/location/clear", { user_id: userId });
    } catch {
      // Silent fail; clearing local state is still useful for the session.
    }

    setLocationContext(null);
    setLocationStatus("off");
    showToast("Location cleared");
    await fetchRecommendations(activeQuery);
  }, [activeQuery, fetchRecommendations, showToast, userId]);

  const saveManualLocation = useCallback(
    async (input: { city: string; region: string; country: string }) => {
      if (!userId) {
        return;
      }

      setLocationStatus("requesting");

      try {
        const payload = await apiPost<LocationResponse>("/context/location/manual", {
          user_id: userId,
          city: input.city,
          region: input.region || null,
          country: input.country,
          timezone: browserTimezone(),
        });
        await applyLocationPayload(payload, "Manual location saved");
      } catch (error) {
        setLocationStatus("error");
        showToast(error instanceof ApiError ? error.detail : "Failed to save manual location.");
      }
    },
    [applyLocationPayload, showToast, userId],
  );

  const sendFeedback = async (article: Article, action: FeedbackAction) => {
    const articleId = normalizeArticleId(article.news_id);
    if (!articleId || !userId) {
      return;
    }

    setFeedbackMap((previous) => ({ ...previous, [articleId]: action }));
    if (action === "skip") {
      setArticles((previous) => previous.filter((entry) => normalizeArticleId(entry.news_id) !== articleId));
    }

    const actionToastMap: Record<FeedbackAction, string> = {
      click: "Preference saved",
      read_full: "Preference saved",
      save: "Saved for later recommendations",
      skip: "Skipped. We will adjust upcoming stories",
    };
    showToast(actionToastMap[action]);

    try {
      await apiPost("/feedback", {
        user_id: userId,
        article_id: articleId,
        action,
      });
      await fetchRecommendations(activeQuery);
    } catch {
      showToast("Could not save feedback right now.");
    }
  };

  const refreshFeed = useCallback(() => {
    void fetchRecommendations(activeQuery);
  }, [activeQuery, fetchRecommendations]);

  const resetProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      await apiPost(`/reset/${encodeURIComponent(userId)}`);
    } catch {
      // Silent fail; the local reset still keeps the UI consistent.
    }

    setArticles([]);
    setExplanation("");
    setMode("");
    setFeedbackMap({});
    setLocationContext(null);
    setLocationStatus("off");
    setHasLoadedFeed(false);
    showToast("Profile memory reset");
    await fetchRecommendations(activeQuery);
  }, [activeQuery, fetchRecommendations, showToast, userId]);

  const startFreshSession = useCallback(async () => {
    if (userId) {
      try {
        await apiPost(`/reset/${encodeURIComponent(userId)}`);
      } catch {
        // Silent fail; the new session id is still the important part.
      }
    }

    const nextUserId = createSessionUserId();
    writeSessionUserId(nextUserId);
    setUserIdState(nextUserId);
    setArticles([]);
    setExplanation("");
    setMode("");
    setFeedbackMap({});
    setLocationContext(null);
    setLocationStatus("off");
    setHasLoadedFeed(false);
    showToast("Fresh session started");
  }, [showToast, userId]);

  const showWelcome = !loading && articles.length === 0 && !hasLoadedFeed;
  const showEmptyState = !loading && articles.length === 0 && hasLoadedFeed && !explanation;

  if (!userId) {
    return (
      <div className="hn-loader-wrap">
        <div className="hn-glass-card" style={{ padding: 28 }}>Loading HyperNews...</div>
      </div>
    );
  }

  return (
    <div className="hn-page-root">
      <HyperNewsContextBar
        isAuthenticated={isAuthenticated}
        authLabel={authLabel}
        currentUserId={userId}
        setUserId={setUserId}
        mood={mood}
        setMood={setMood}
        moodInputMode={moodInputMode}
        setMoodInputMode={setMoodInputMode}
        detectedMood={detectedMood}
        setDetectedMood={setDetectedMood}
        confidence={confidence}
        setConfidence={setConfidence}
        lastStableMood={lastStableMood}
        setLastStableMood={setLastStableMood}
        moods={MOODS}
        query={query}
        setQuery={setQuery}
        onSearch={submitSearch}
        locationStatus={locationStatus}
        locationContext={locationContext}
        onEnableLocation={enableLocation}
        onUseApproximateLocation={useApproximateLocation}
        onClearLocation={clearLocation}
        onSaveManualLocation={saveManualLocation}
        onRefresh={refreshFeed}
        onResetProfile={resetProfile}
        onNewSession={startFreshSession}
        onSignOut={logout}
        onSignIn={() => navigate("/hypernews/login")}
        onRegister={() => navigate("/hypernews/register")}
        loading={loading}
        mode={mode}
      />

      <main className="hn-main-wrap">
        {explanation && <HyperNewsExplanationBanner text={explanation} mode={mode} />}
        <HyperNewsKnowledgeGraphPanel />

        {loading && articles.length === 0 && (
          <div className="hn-skeleton-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="hn-glass-card hn-skeleton hn-fade-in" style={{ animationDelay: `${index * 0.05}s` }} />
            ))}
          </div>
        )}

        {articles.length > 0 && (
          <>
            {loading && <div className="hn-inline-note">Refreshing the feed with a fresh batch...</div>}

            <div className="hn-cards-grid">
              {articles.map((article, index) => (
                <div key={article.news_id} className="hn-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                  <HyperNewsCard
                    article={article}
                    feedbackState={feedbackMap[normalizeArticleId(article.news_id)] || null}
                    onFeedback={(action) => void sendFeedback(article, action)}
                  />
                </div>
              ))}
            </div>

            {activeQuery && (
              <div className="hn-inline-note" style={{ marginTop: 18 }}>
                Showing results for <strong>{activeQuery}</strong>
              </div>
            )}
          </>
        )}

        {showWelcome && (
          <div className="hn-center-state">
            <div className="hn-state-icon">Feed</div>
            <h2>Welcome to HyperNews</h2>
            <p>Your personalized, mood-aware news feed is ready.</p>
          </div>
        )}

        {showEmptyState && (
          <div className="hn-center-state">
            <h2>No stories matched this batch</h2>
            <p>Try a different search, refresh for a new set, or start a fresh session.</p>
          </div>
        )}
      </main>

      {toastMsg && <div className="hn-toast">{toastMsg}</div>}
    </div>
  );
}
