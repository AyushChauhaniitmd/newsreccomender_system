import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { apiGet } from "../api";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  degree?: number;
}

interface GraphLink {
  source: string;
  target: string;
  relation?: string;
}

interface GraphEntity {
  id: string;
  type: string;
  connections: number;
}

interface GraphResponse {
  error?: string;
  top_entities?: GraphEntity[];
  nodes?: GraphNode[];
  links?: GraphLink[];
}

interface GraphData {
  nodes: Array<GraphNode & { val: number; name: string }>;
  links: GraphLink[];
}

const TYPE_COLORS: Record<string, string> = {
  article: "#64748b",
  category: "#ef4444",
  subcategory: "#f97316",
  PERSON: "#10b981",
  GPE: "#f59e0b",
  ORG: "#3b82f6",
  CONCEPT: "#8b5cf6",
  ENTITY: "#94a3b8",
  EVENT: "#ec4899",
  LOCATION: "#06b6d4",
};

export function HyperNewsKnowledgeGraphPanel() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [topEntities, setTopEntities] = useState<GraphEntity[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<GraphResponse>("/graph")
      .then((data) => {
        if (data.error || !data.nodes?.length) {
          return;
        }
        setTopEntities(data.top_entities ?? []);
        setGraphData({
          nodes: data.nodes.map((node) => ({
            ...node,
            name: node.label,
            val:
              node.type === "article"
                ? 2.5
                : Math.max(3, Math.min(12, (node.degree ?? 1) / (node.type === "category" ? 1.3 : 1.8))),
          })),
          links: data.links ?? [],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) {
        return;
      }
      setDimensions({
        width: containerRef.current.clientWidth,
        height: isExpanded ? 620 : 360,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isExpanded]);

  const getNodeColor = useCallback((node: unknown) => {
    const typedNode = node as Partial<GraphNode>;
    return TYPE_COLORS[String(typedNode.type ?? "")] ?? "#94a3b8";
  }, []);

  if (!graphData || graphData.nodes.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="hn-glass-card hn-kg-panel">
      <div className="hn-kg-head">
        <h3>Entity Knowledge Graph</h3>
        <button onClick={() => setIsExpanded((prev) => !prev)} className="hn-icon-btn">
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div className="hn-kg-canvas">
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node) => {
            const typedNode = node as Partial<GraphNode>;
            const label = typedNode.label ?? String(typedNode.id ?? "");
            const type = typedNode.type ?? "entity";
            return `${label} (${type})`;
          }}
          nodeColor={getNodeColor}
          nodeRelSize={5}
          linkColor={() => "rgba(255,255,255,0.11)"}
          backgroundColor="transparent"
          d3AlphaDecay={0.035}
          d3VelocityDecay={0.3}
          cooldownTicks={90}
        />
      </div>

      <div className="hn-legend">
        {[
          { color: TYPE_COLORS.category, label: "Category" },
          { color: TYPE_COLORS.article, label: "Article" },
          { color: TYPE_COLORS.PERSON, label: "Person" },
          { color: TYPE_COLORS.ORG, label: "Organization" },
          { color: TYPE_COLORS.GPE, label: "Location" },
          { color: TYPE_COLORS.CONCEPT, label: "Concept" },
        ].map(({ color, label }) => (
          <div key={label} className="hn-legend-item">
            <span style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {topEntities.length > 0 && (
        <div className="hn-tag-row" style={{ marginTop: 14 }}>
          {topEntities.slice(0, 10).map((entity) => (
            <span key={`${entity.id}-${entity.type}`} className="hn-badge hn-badge-soft">
              {entity.id} - {entity.connections}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
