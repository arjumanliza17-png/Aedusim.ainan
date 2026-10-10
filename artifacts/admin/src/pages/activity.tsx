import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { MessageSquare, FileText, UserPlus, Activity, RefreshCw } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "message" | "exam" | "registration";
  description: string;
  meta: string;
  time: string;
}

const TYPE_CONFIG = {
  message: { icon: MessageSquare, color: "#6366f1", bg: "#6366f115", label: "Chat" },
  exam: { icon: FileText, color: "#f59e0b", bg: "#f59e0b15", label: "Exam" },
  registration: { icon: UserPlus, color: "#22c55e", bg: "#22c55e15", label: "New User" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityPage() {
  const { token } = useAuth();

  const { data: events = [], isLoading, refetch, isFetching } = useQuery<ActivityEvent[]>({
    queryKey: ["admin-activity"],
    queryFn: () => api.get("/admin/activity", token),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Activity Log</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Real-time platform events — last 50 entries
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{ gap: 6 }}
        >
          <RefreshCw size={13} style={{ animation: isFetching ? "spin 0.7s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !events.length ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Activity size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>No activity yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {events.map((event, i) => {
              const cfg = TYPE_CONFIG[event.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={event.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < events.length - 1 ? "1px solid #1e1e32" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#16162a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <Icon size={14} color={cfg.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, marginBottom: 3 }}>
                      {event.description}
                    </div>
                    {event.meta && (
                      <div style={{
                        fontSize: 11, color: "#64748b",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: 500,
                      }}>
                        {event.meta}
                      </div>
                    )}
                  </div>

                  {/* Time + badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span className={`badge badge-${event.type === "message" ? "indigo" : event.type === "exam" ? "amber" : "green"}`}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{timeAgo(event.time)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
