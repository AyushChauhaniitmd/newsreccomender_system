export interface Article {
  news_id: string;
  title: string;
  abstract: string;
  category: string;
  source?: string;
  score?: number;
  candidate_source?: string;
  reasons?: string[];
  matched_entities?: string[];
}

export interface RecommendResponse {
  articles: Article[];
  explanation: string;
  mode: string;
  request_id?: string;
}

export interface SuggestResponse {
  suggestions: string[];
}

export interface SearchEntry {
  query_text: string;
  normalized_query: string;
  created_at: string;
}

export interface FeedbackEntry {
  article_id: string;
  action: string;
  created_at: string;
}

export interface Profile {
  user_id: string;
  mood: string;
  time_of_day: string;
  interests: Record<string, number>;
  articles_read: number;
  recent_clicks: string[];
  recent_negative_actions: string[];
  session_topics: string[];
  recent_queries: string[];
  recent_entities: string[];
  recent_sources: string[];
  recent_searches: SearchEntry[];
  recent_feedback: FeedbackEntry[];
}
