export type MoodKey = "neutral" | "curious" | "happy" | "stressed" | "tired";
export type MoodInputMode = "manual" | "camera";
export type FeedbackAction = "click" | "read_full" | "skip" | "save";

export interface Article {
  news_id: string;
  title: string;
  abstract: string;
  category: string;
  subcategory?: string;
  url?: string;
  source?: string;
  score?: number;
}

export interface RecommendResponse {
  articles: Article[];
  explanation: string;
  mode: string;
}

export interface LocationContext {
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  timezone: string | null;
  source: "gps" | "ip" | "manual" | null;
  language_hint: string | null;
}

export type LocationStatus =
  | "off"
  | "requesting"
  | "gps"
  | "ip"
  | "manual"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

export interface LocationResponse {
  status: string;
  location: LocationContext | null;
  detail?: string;
}

export interface DetectMoodResponse {
  mood: MoodKey | null;
  raw_emotion: string | null;
  confidence: number;
  status: string;
  latency_ms: number;
}

export interface Profile {
  user_id: string;
  mood: string;
  time_of_day: string;
  interests: Record<string, number>;
  articles_read: number;
  recent_clicks: string[];
  recent_skips: string[];
  session_topics: string[];
  total_positive_interactions: number;
  location?: LocationContext | null;
}
