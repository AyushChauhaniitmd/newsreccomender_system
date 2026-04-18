"use client";

import { useState } from "react";
import type { LocationContext, LocationStatus } from "../types";

interface Props {
  status: LocationStatus;
  location: LocationContext | null;
  loading?: boolean;
  onEnableGps: () => void;
  onUseApproximate: () => void;
  onClear: () => void;
  onSaveManual: (input: { city: string; country: string; region: string }) => void;
}

function locationLabel(location: LocationContext | null): string {
  if (!location) return "Location off";
  if (location.city && location.country) return `${location.city}, ${location.country}`;
  if (location.city && location.region) return `${location.city}, ${location.region}`;
  if (location.country) return location.country;
  if (location.region) return location.region;
  return "Location set";
}

function statusText(status: LocationStatus, location: LocationContext | null): string {
  switch (status) {
    case "requesting":
      return "Requesting precise location from your browser.";
    case "gps":
      return "Using precise device location for local news signals.";
    case "ip":
      return "Using approximate location derived from your network.";
    case "manual":
      return "Using the manual location you provided.";
    case "denied":
      return "Location permission was denied. Retry, use approximate location, or enter a city manually.";
    case "unavailable":
      return "This browser cannot provide device location. Approximate or manual location is still available.";
    case "timeout":
      return "Location lookup timed out. Retry or use approximate location instead.";
    case "error":
      return "Location lookup failed. The feed still works without it.";
    case "off":
    default:
      return location ? "Location is available for personalization." : "Location is optional. Enable it for local news relevance.";
  }
}

export function HyperNewsLocationWidget({
  status,
  location,
  loading = false,
  onEnableGps,
  onUseApproximate,
  onClear,
  onSaveManual,
}: Props) {
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualRegion, setManualRegion] = useState("");
  const [manualCountry, setManualCountry] = useState("");

  const showClear = Boolean(location);
  const busy = loading || status === "requesting";
  const sourceLabel =
    location?.source === "gps"
      ? "Precise"
      : location?.source === "ip"
        ? "Approximate"
        : location?.source === "manual"
          ? "Manual"
          : "Off";

  return (
    <div
      className="hn-glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div className="hn-sidebar-label">Location Context</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--hn-text-primary)", marginTop: 4 }}>
            {locationLabel(location)}
          </div>
        </div>
        <span className="hn-mode-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--hn-glass-border)" }}>
          {sourceLabel}
        </span>
      </div>

      <div
        style={{
          fontSize: 11,
          lineHeight: 1.5,
          color: "var(--hn-text-secondary)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--hn-glass-border)",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        {statusText(status, location)}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          onClick={onEnableGps}
          disabled={busy}
          className="hn-sidebar-btn"
          style={{
            flex: "1 1 140px",
            textAlign: "center",
            background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
            border: "none",
            opacity: busy ? 0.75 : 1,
          }}
        >
          {busy ? "Locating..." : location ? "Refresh GPS" : "Enable Location"}
        </button>

        <button
          type="button"
          onClick={onUseApproximate}
          disabled={busy}
          className="hn-sidebar-btn"
          style={{ flex: "1 1 140px", textAlign: "center", opacity: busy ? 0.75 : 1 }}
        >
          Use Approximate
        </button>

        <button
          type="button"
          onClick={() => setManualOpen((previous) => !previous)}
          className="hn-sidebar-btn"
          style={{ flex: "1 1 140px", textAlign: "center" }}
        >
          {manualOpen ? "Close Manual" : "Set Manually"}
        </button>

        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="hn-sidebar-btn"
            style={{
              flex: "1 1 140px",
              textAlign: "center",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.08)",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {manualOpen && (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={manualCity}
            onChange={(event) => setManualCity(event.target.value)}
            placeholder="City"
            className="hn-search-input"
            style={{ paddingRight: 14 }}
          />
          <input
            value={manualRegion}
            onChange={(event) => setManualRegion(event.target.value)}
            placeholder="Region or State (optional)"
            className="hn-search-input"
            style={{ paddingRight: 14 }}
          />
          <input
            value={manualCountry}
            onChange={(event) => setManualCountry(event.target.value)}
            placeholder="Country"
            className="hn-search-input"
            style={{ paddingRight: 14 }}
          />
          <button
            type="button"
            onClick={() => {
              if (!manualCity.trim() || !manualCountry.trim()) {
                return;
              }

              onSaveManual({
                city: manualCity.trim(),
                region: manualRegion.trim(),
                country: manualCountry.trim(),
              });
              setManualOpen(false);
            }}
            className="hn-sidebar-btn"
            style={{
              textAlign: "center",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.28)",
              color: "#86efac",
            }}
          >
            Save Manual Location
          </button>
        </div>
      )}
    </div>
  );
}

