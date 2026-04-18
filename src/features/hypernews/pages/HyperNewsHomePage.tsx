import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiGet, apiPost } from "../api";
import { useHyperNewsAuth } from "../auth";
import { HyperNewsContextBar } from "../components/ContextBar";
import { HyperNewsExplanationBanner } from "../components/ExplanationBanner";
import { HyperNewsKnowledgeGraphPanel } from "../components/KnowledgeGraphPanel";
import { HyperNewsCard } from "../components/NewsCard";
import type { Article, RecommendResponse, SuggestResponse } from "../types";

interface FetchOptions {
  append?: boolean;
  excludeIds?: string[];
  batchSize?: number;
  queryOverride?: string;
  retryOnFailure?: boolean;
}

const MOODS = [
  { key: "neutral", emoji: "Calm", label: "Neutral" },
  { key: "curious", emoji: "Explore", label: "Curious" },
  { key: "happy", emoji: "Bright", label: "Happy" },
  { key: "stressed", emoji: "Light", label: "Stressed" },
  { key: "tired", emoji: "Easy", label: "Tired" },
];

const PAGE_SIZE = 8;
const GUEST_USER_STORAGE_KEY = "hypernews_guest_user_id";

function normalizeArticleId(value: unknown): string {
  return String(value ?? "").trim();
}

function createGuestUserId(): string {
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function articleIdsFromList(items: Article[]): string[] {
  return items
    .map((article) => normalizeArticleId(article.news_id))
    .filter(Boolean);
}

function dedupeArticles(items: Article[], seenIds: Set<string> = new Set()): Article[] {
  const unique: Article[] = [];
  for (const article of items) {
    const newsId = normalizeArticleId(article.news_id);
    if (!newsId || seenIds.has(newsId)) {
      continue;
    }
    seenIds.add(newsId);
    unique.push(article);
  }
  return unique;
}

export function HyperNewsHomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useHyperNewsAuth();
  const [guestUserId, setGuestUserId] = useState("");
  const [mood, setMood] = useState("neutral");
  const [queryInput, setQueryInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [explanation, setExplanation] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoadedFeed, setHasLoadedFeed] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [exploreFocus, setExploreFocus] = useState(55);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastRequestId, setLastRequestId] = useState("");
  const retryTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const articlesRef = useRef<Article[]>([]);

  const userId = isAuthenticated ? String(user?.id || "") : guestUserId;
  const userLabel = isAuthenticated ? user?.name || user?.email || userId : "Guest session";

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(""), 2500);
  }, []);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    const existingGuestUserId = window.localStorage.getItem(GUEST_USER_STORAGE_KEY);
    if (existingGuestUserId) {
      setGuestUserId(existingGuestUserId);
      return;
    }
    const nextGuestUserId = createGuestUserId();
    window.localStorage.setItem(GUEST_USER_STORAGE_KEY, nextGuestUserId);
    setGuestUserId(nextGuestUserId);
  }, [isAuthenticated]);

  useEffect(() => {
    return () => clearRetryTimer();
  }, [clearRetryTimer]);

  useEffect(() => {
    if (!userId || queryInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const path = `/search/suggest?q=${encodeURIComponent(queryInput)}&user_id=${encodeURIComponent(userId)}&limit=8`;
        const data = await apiGet<SuggestResponse>(path);
        if (!controller.signal.aborted) {
          setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        }
      } catch {
        // no-op
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [queryInput, userId]);

  const fetchRecommendations = useCallback(
    async ({ append = false, excludeIds = [], batchSize = PAGE_SIZE, queryOverride, retryOnFailure = false }: FetchOptions = {}) => {
      if (!userId) {
        return false;
      }

      const queryValue = (queryOverride ?? activeQuery).trim();
      const normalizedExcludeIds = excludeIds.map((value) => normalizeArticleId(value)).filter(Boolean);
      const requestId = append ? requestIdRef.current : ++requestIdRef.current;
      const requestToken = `req_${Date.now()}_${requestId}`;

      if (append) {
        setLoadingMore(true);
      } else {
        clearRetryTimer();
        setLoading(true);
      }

      try {
        const data = await apiPost<RecommendResponse>("/recommend", {
          user_id: userId,
          session_id: userId,
          request_id: requestToken,
          mood,
          query: queryValue || null,
          n: batchSize,
          exclude_ids: normalizedExcludeIds,
          surface: queryValue ? "search" : "feed",
          explore_focus: exploreFocus,
        });

        if (requestId !== requestIdRef.current) {
          return false;
        }

        const nextArticles = Array.isArray(data.articles) ? data.articles : [];
        const uniqueArticles = append
          ? dedupeArticles(nextArticles, new Set(articleIdsFromList(articlesRef.current)))
          : dedupeArticles(nextArticles);

        setLastRequestId(String(data.request_id || requestToken));

        if (append) {
          setArticles((prev) => [...prev, ...uniqueArticles]);
          if (data.mode) {
            setMode(data.mode);
          }
          setHasMore(uniqueArticles.length > 0 && nextArticles.length >= batchSize);
        } else {
          if (normalizedExcludeIds.length > 0 && uniqueArticles.length === 0 && articlesRef.current.length > 0) {
            setHasMore(false);
            showToast("No fresh unseen stories are available right now.");
            setHasLoadedFeed(true);
            return false;
          }

          setArticles(uniqueArticles);
          setExplanation(data.explanation || "");
          setMode(data.mode || "");
          setToastMsg("");
          setFeedbackMap((prev) => {
            const next: Record<string, string> = {};
            for (const article of uniqueArticles) {
              const key = normalizeArticleId(article.news_id);
              const existing = prev[key];
              if (existing) {
                next[key] = existing;
              }
            }
            return next;
          });
          setHasMore(uniqueArticles.length > 0 && nextArticles.length >= batchSize);
        }

        setHasLoadedFeed(true);
        return uniqueArticles.length > 0;
      } catch {
        if (requestId !== requestIdRef.current) {
          return false;
        }

        if (append) {
          showToast("Could not load more articles right now.");
        } else {
          setToastMsg("Cannot reach backend. Retrying...");
          if (retryOnFailure) {
            retryTimerRef.current = window.setTimeout(() => {
              void fetchRecommendations({ batchSize, queryOverride: queryValue, retryOnFailure: true });
            }, 2000);
          }
        }

        setHasLoadedFeed(true);
        return false;
      } finally {
        if (append) {
          setLoadingMore(false);
        } else if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [activeQuery, clearRetryTimer, exploreFocus, mood, showToast, userId],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }
    void fetchRecommendations({ retryOnFailure: true });
  }, [fetchRecommendations, userId]);

  const submitSearch = useCallback(() => {
    const nextQuery = queryInput.trim();
    setHasMore(true);
    if (nextQuery === activeQuery) {
      void fetchRecommendations({ queryOverride: nextQuery, retryOnFailure: true });
      return;
    }
    setActiveQuery(nextQuery);
  }, [activeQuery, fetchRecommendations, queryInput]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (!hasLoadedFeed && !activeQuery) {
      return;
    }
    void fetchRecommendations({ queryOverride: activeQuery, retryOnFailure: true });
  }, [activeQuery, fetchRecommendations, hasLoadedFeed, userId]);

  const refreshFeed = useCallback(() => {
    setHasMore(true);
    void fetchRecommendations({ excludeIds: articleIdsFromList(articlesRef.current), retryOnFailure: true });
  }, [fetchRecommendations]);

  const loadMoreArticles = useCallback(() => {
    if (!userId || loading || loadingMore || !hasMore || articlesRef.current.length === 0) {
      return;
    }
    void fetchRecommendations({ append: true, excludeIds: articleIdsFromList(articlesRef.current), batchSize: PAGE_SIZE });
  }, [fetchRecommendations, hasMore, loading, loadingMore, userId]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasMore || loading || loadingMore || articles.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreArticles();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [articles.length, hasMore, loadMoreArticles, loading, loadingMore]);

  const sendFeedback = async (article: Article, position: number, action: string) => {
    const normalizedArticleId = normalizeArticleId(article.news_id);
    if (!normalizedArticleId || !userId) {
      return;
    }

    setFeedbackMap((prev) => ({ ...prev, [normalizedArticleId]: action }));
    if (action === "skip" || action === "not_interested" || action === "less_from_source") {
      setArticles((prev) => prev.filter((entry) => normalizeArticleId(entry.news_id) !== normalizedArticleId));
    }

    const actionToastMap: Record<string, string> = {
      read_full: "Preference saved for upcoming stories",
      save: "Saved for future recommendations",
      more_like_this: "We will lean further into this topic",
      skip: "Skipped. Upcoming stories will adjust",
      not_interested: "We will downrank similar stories",
      less_from_source: `We will reduce stories from ${article.source || "this source"}`,
    };
    showToast(actionToastMap[action] || "Feedback saved");

    try {
      await apiPost("/feedback", {
        user_id: userId,
        session_id: userId,
        request_id: lastRequestId,
        impression_id: normalizedArticleId,
        article_id: normalizedArticleId,
        action,
        position,
        query_text: activeQuery,
        source_feedback: article.source || "",
      });
    } catch {
      showToast("Could not save feedback right now.");
    }
  };

  const resetProfile = async () => {
    clearRetryTimer();
    requestIdRef.current += 1;

    try {
      await apiPost(`/reset/${encodeURIComponent(userId)}`, {});
    } catch {
      // silent fail
    }

    articlesRef.current = [];
    setArticles([]);
    setExplanation("");
    setMode("");
    setFeedbackMap({});
    setHasLoadedFeed(false);
    setHasMore(true);
    setQueryInput("");
    setActiveQuery("");
    setSuggestions([]);
    setLastRequestId("");
    showToast("Profile memory reset");

    if (userId) {
      void fetchRecommendations({ retryOnFailure: true });
    }
  };

  const showWelcome = !loading && articles.length === 0 && !hasLoadedFeed;
  const showEmptyState = !loading && articles.length === 0 && hasLoadedFeed;

  if (!isAuthenticated && !guestUserId) {
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
        userLabel={userLabel}
        mood={mood}
        setMood={setMood}
        moods={MOODS}
        query={queryInput}
        setQuery={setQueryInput}
        suggestions={suggestions}
        onSearch={submitSearch}
        onRefresh={refreshFeed}
        onResetProfile={resetProfile}
        onSignOut={logout}
        onSignIn={() => navigate("/hypernews/login")}
        onRegister={() => navigate("/hypernews/register")}
        loading={loading}
        mode={mode}
        exploreFocus={exploreFocus}
        setExploreFocus={setExploreFocus}
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
                    onFeedback={(action) => void sendFeedback(article, index, action)}
                  />
                </div>
              ))}
            </div>

            <div className="hn-more-wrap">
              {loadingMore && <div className="hn-inline-note">Loading more stories...</div>}

              {!loadingMore && hasMore && (
                <button onClick={loadMoreArticles} className="hn-secondary-btn">Load More News</button>
              )}

              {!hasMore && <div className="hn-inline-note">No more fresh stories are available in this batch yet.</div>}
              <div ref={loadMoreSentinelRef} style={{ width: "100%", height: 1 }} />
            </div>
          </>
        )}

        {showWelcome && (
          <div className="hn-center-state">
            <div className="hn-state-icon">Feed</div>
            <h2>Welcome to HyperNews</h2>
            <p>Your hybrid retrieval and personalized ranking feed is ready.</p>
          </div>
        )}

        {showEmptyState && (
          <div className="hn-center-state">
            <h2>No stories matched this batch</h2>
            <p>Try a different search, refresh for a fresh set, or reset your profile memory.</p>
          </div>
        )}
      </main>

      {toastMsg && <div className="hn-toast">{toastMsg}</div>}
    </div>
  );
}
