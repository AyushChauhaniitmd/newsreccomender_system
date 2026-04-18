"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiPostForm } from "../api";
import type { DetectMoodResponse, MoodInputMode, MoodKey } from "../types";

const CAPTURE_INTERVAL_MS = 2500;
const REQUEST_TIMEOUT_MS = 4000;

interface Props {
  moodInputMode: MoodInputMode;
  setMoodInputMode: (mode: MoodInputMode) => void;
  setMood: (mood: MoodKey) => void;
  detectedMood: MoodKey | null;
  setDetectedMood: (mood: MoodKey | null) => void;
  confidence: number | null;
  setConfidence: (confidence: number | null) => void;
  lastStableMood: MoodKey | null;
  setLastStableMood: (mood: MoodKey | null) => void;
}

interface StatusBanner {
  tone: "info" | "warning" | "error";
  text: string;
}

const MOOD_LABELS: Record<MoodKey, string> = {
  neutral: "Neutral",
  curious: "Curious",
  happy: "Happy",
  stressed: "Stressed",
  tired: "Tired",
};

const TONE_COLORS: Record<StatusBanner["tone"], string> = {
  info: "#e5e7eb",
  warning: "#fbbf24",
  error: "#f87171",
};

export function HyperNewsCameraMoodWidget({
  moodInputMode,
  setMoodInputMode,
  setMood,
  detectedMood,
  setDetectedMood,
  confidence,
  setConfidence,
  lastStableMood,
  setLastStableMood,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimerRef = useRef<number | null>(null);
  const requestInFlightRef = useRef(false);
  const pendingMoodRef = useRef<MoodKey | null>(null);
  const pendingCountRef = useRef(0);
  const permissionsStatusRef = useRef<PermissionStatus | null>(null);
  const lastStableMoodRef = useRef<MoodKey | null>(lastStableMood);
  const [banner, setBanner] = useState<StatusBanner>({ tone: "info", text: "" });
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    lastStableMoodRef.current = lastStableMood;
  }, [lastStableMood]);

  const clearCaptureLoop = useCallback(() => {
    if (captureTimerRef.current !== null) {
      window.clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
  }, []);

  const resetStabilityWindow = useCallback(() => {
    pendingMoodRef.current = null;
    pendingCountRef.current = 0;
  }, []);

  const stopStream = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }

    stream.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const fallbackToManual = useCallback(
    (reason: string, showBanner: boolean) => {
      clearCaptureLoop();
      resetStabilityWindow();
      requestInFlightRef.current = false;
      stopStream();
      setCameraReady(false);
      setMoodInputMode("manual");

      if (lastStableMoodRef.current) {
        setDetectedMood(lastStableMoodRef.current);
      } else {
        setDetectedMood(null);
      }
      setConfidence(null);

      if (showBanner) {
        setBanner({ tone: "warning", text: reason });
      }
    },
    [clearCaptureLoop, resetStabilityWindow, setConfidence, setDetectedMood, setMoodInputMode, stopStream],
  );

  const handleTrackEnded = useCallback(() => {
    fallbackToManual("Camera access ended. Switched back to manual mood input.", true);
  }, [fallbackToManual]);

  const applyDetection = useCallback(
    (payload: DetectMoodResponse) => {
      if (payload.status === "no_face") {
        resetStabilityWindow();
        setConfidence(null);
        setDetectedMood(lastStableMoodRef.current);
        setBanner({ tone: "warning", text: "No face detected. Holding the last stable mood." });
        return;
      }

      if (!payload.mood) {
        resetStabilityWindow();
        if (lastStableMoodRef.current) {
          setDetectedMood(lastStableMoodRef.current);
          setConfidence(null);
          setBanner({ tone: "warning", text: "Mood detection unavailable. Holding the last stable mood." });
          return;
        }

        fallbackToManual("Mood detection was unavailable. Switched back to manual mood input.", true);
        return;
      }

      setDetectedMood(payload.mood);
      setConfidence(payload.confidence);

      if (payload.status === "low_confidence") {
        resetStabilityWindow();
        setBanner({
          tone: "warning",
          text: `Low confidence detection for ${MOOD_LABELS[payload.mood]}. Waiting for a stronger signal.`,
        });
        return;
      }

      if (payload.status !== "ok") {
        resetStabilityWindow();
        if (lastStableMoodRef.current) {
          setDetectedMood(lastStableMoodRef.current);
          setConfidence(null);
          setBanner({ tone: "warning", text: "Mood detection error. Holding the last stable mood." });
          return;
        }

        fallbackToManual("Mood detection failed. Switched back to manual mood input.", true);
        return;
      }

      if (pendingMoodRef.current === payload.mood) {
        pendingCountRef.current += 1;
      } else {
        pendingMoodRef.current = payload.mood;
        pendingCountRef.current = 1;
      }

      if (pendingCountRef.current >= 2) {
        if (lastStableMoodRef.current !== payload.mood) {
          lastStableMoodRef.current = payload.mood;
          setLastStableMood(payload.mood);
          setMood(payload.mood);
        }

        setBanner({
          tone: "info",
          text: `Stable mood detected: ${MOOD_LABELS[payload.mood]} (${Math.round(payload.confidence * 100)}% confidence).`,
        });
        return;
      }

      setBanner({
        tone: "info",
        text: `Confirming ${MOOD_LABELS[payload.mood]} from the live camera feed.`,
      });
    },
    [fallbackToManual, resetStabilityWindow, setConfidence, setDetectedMood, setLastStableMood, setMood],
  );

  const captureFrame = useCallback(async () => {
    if (requestInFlightRef.current) {
      return;
    }

    const stream = streamRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!stream || !video || !canvas) {
      return;
    }

    const [track] = stream.getVideoTracks();
    if (!track || track.readyState !== "live") {
      handleTrackEnded();
      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.82);
    });

    if (!frameBlob) {
      return;
    }

    requestInFlightRef.current = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const formData = new FormData();
      formData.append("frame", frameBlob, "mood-frame.jpg");

      const payload = await apiPostForm<DetectMoodResponse>("/api/detect-mood", formData, {
        signal: controller.signal,
      });
      applyDetection(payload);
    } catch {
      resetStabilityWindow();
      if (lastStableMoodRef.current) {
        setDetectedMood(lastStableMoodRef.current);
        setConfidence(null);
        setBanner({ tone: "warning", text: "Mood detection request failed. Holding the last stable mood." });
      } else {
        fallbackToManual("Mood detection request failed. Switched back to manual mood input.", true);
      }
    } finally {
      requestInFlightRef.current = false;
      window.clearTimeout(timeoutId);
    }
  }, [applyDetection, fallbackToManual, handleTrackEnded, resetStabilityWindow, setConfidence, setDetectedMood]);

  useEffect(() => {
    if (moodInputMode !== "camera") {
      clearCaptureLoop();
      requestInFlightRef.current = false;

      if (permissionsStatusRef.current) {
        permissionsStatusRef.current.onchange = null;
      }
      permissionsStatusRef.current = null;
      stopStream();
      setCameraReady(false);
      return;
    }

    let cancelled = false;

    async function requestCameraAccess() {
      if (streamRef.current) {
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        fallbackToManual("This browser does not support camera access for mood detection.", true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        stream.getVideoTracks().forEach((track) => {
          track.onended = handleTrackEnded;
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }

        setCameraReady(true);
        setBanner({ tone: "info", text: "Analyzing live camera feed." });
        clearCaptureLoop();
        captureTimerRef.current = window.setInterval(() => {
          void captureFrame();
        }, CAPTURE_INTERVAL_MS);
        void captureFrame();

        if (navigator.permissions?.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
            permissionsStatusRef.current = permissionStatus;
            permissionStatus.onchange = () => {
              if (permissionStatus.state !== "granted") {
                handleTrackEnded();
              }
            };
          } catch {
            permissionsStatusRef.current = null;
          }
        }
      } catch {
        fallbackToManual("Camera access was blocked or unavailable. Retry after granting permission.", true);
      }
    }

    void requestCameraAccess();

    return () => {
      cancelled = true;
      clearCaptureLoop();
      if (permissionsStatusRef.current) {
        permissionsStatusRef.current.onchange = null;
      }
      permissionsStatusRef.current = null;
      requestInFlightRef.current = false;
      stopStream();
      setCameraReady(false);
    };
  }, [captureFrame, clearCaptureLoop, fallbackToManual, handleTrackEnded, moodInputMode, stopStream]);

  const enableCameraMode = () => {
    resetStabilityWindow();
    requestInFlightRef.current = false;
    setConfidence(null);
    setDetectedMood(lastStableMoodRef.current);
    setBanner({ tone: "info", text: "Requesting camera access for live mood detection." });
    setMoodInputMode("camera");
  };

  const disableCameraMode = () => {
    clearCaptureLoop();
    resetStabilityWindow();
    requestInFlightRef.current = false;
    stopStream();
    setCameraReady(false);
    setDetectedMood(lastStableMoodRef.current);
    setConfidence(null);
    setBanner({ tone: "info", text: "Camera mood detection is off. Select a manual mood or start the camera again." });
    setMoodInputMode("manual");
  };

  const visibleMood = detectedMood ?? lastStableMood;
  const confidenceLabel =
    confidence !== null
      ? `${Math.round(confidence * 100)}% confidence`
      : moodInputMode === "camera"
        ? "Waiting for a stable detection"
        : "Start the camera to detect your mood automatically";

  return (
    <div
      className="hn-glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div className="hn-sidebar-label">Camera Mood</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--hn-text-primary)", marginTop: 4 }}>
            {visibleMood ? MOOD_LABELS[visibleMood] : moodInputMode === "camera" ? "Analyzing..." : "Manual mode"}
          </div>
        </div>
        <span className="hn-mode-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--hn-glass-border)" }}>
          {moodInputMode === "camera" ? "Live" : "Off"}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid var(--hn-glass-border)",
          background: "rgba(255,255,255,0.03)",
          minHeight: 156,
        }}
      >
        {moodInputMode === "camera" && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: "block",
              width: "100%",
              height: 156,
              objectFit: "cover",
              opacity: cameraReady ? 1 : 0,
            }}
          />
        )}

        {(!cameraReady || moodInputMode !== "camera") && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--hn-text-muted)",
              fontSize: 12,
            }}
          >
            {moodInputMode === "camera" ? "Connecting camera..." : "Camera preview is off"}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: "var(--hn-text-secondary)" }}>{confidenceLabel}</div>

      <button
        type="button"
        onClick={moodInputMode === "camera" ? disableCameraMode : enableCameraMode}
        className="hn-sidebar-btn"
        style={{
          textAlign: "center",
          background: moodInputMode === "camera" ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, #2563eb, #7c3aed)",
          border: moodInputMode === "camera" ? "1px solid var(--hn-glass-border)" : "none",
        }}
      >
        {moodInputMode === "camera" ? "Use Manual Mood" : "Enable Camera Mood"}
      </button>

      {banner.text && (
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.5,
            color: TONE_COLORS[banner.tone],
            background: `${TONE_COLORS[banner.tone]}14`,
            border: `1px solid ${TONE_COLORS[banner.tone]}33`,
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          {banner.text}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

