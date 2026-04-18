import { useEffect, useState } from "react";

interface Props {
  text: string;
  mode: string;
}

const MODE_LABELS: Record<string, string> = {
  rag: "RAG Search",
  rl: "Reinforcement Learning",
  cold_start: "Personalising",
};

export function HyperNewsExplanationBanner({ text, mode }: Props) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(interval);
      }
    }, 14);
    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <div className="hn-explain-banner hn-fade-in">
      <div className="hn-explain-head">
        <span className="hn-explain-title">AI Reasoning</span>
        {mode && <span className="hn-explain-mode">via {MODE_LABELS[mode] || mode}</span>}
      </div>
      <p className="hn-explain-text">{displayed}</p>
    </div>
  );
}
