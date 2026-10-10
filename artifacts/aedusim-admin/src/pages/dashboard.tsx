import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import {
  Users, MessageSquare, FileText, Zap, TrendingUp,
  DollarSign, Activity, Award, Clock, UserPlus, Crown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalExamSessions: number;
  dailyActiveUsers: number;
  estimatedTokens: number;
  monthlyRevenue: string;
  newUsersWeek: number;
  newUsersMonth: number;
  planCounts: Record<string, number>;
  recentSessions: Array<{
    id: number;
    examTitle: string;
    subject: string;
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    completedAt: string;
  }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="card" style={{ padding: "18px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {trend && <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>{trend}</span>}
        {sub && <span style={{ fontSize: 10, color: "#64748b" }}>{sub}</span>}
      </div>
    </div>
  );
}

const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const MOCK_WEEKLY = [
  { day: "Mon", messages: 24, exams: 3 },
  { day: "Tue", messages: 38, exams: 5 },
  { day: "Wed", messages: 15, exams: 2 },
  { day: "Thu", messages: 52, exams: 7 },
  { day: "Fri", messages: 41, exams: 4 },
  { day: "Sat", messages: 29, exams: 6 },
  { day: "Sun", messages: 18, exams: 2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f0f18", border: "1px solid #1e1e32", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats", token),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center", paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px" }}>
          {greeting}, {user?.username?.split("@")[0] ?? "Admin"} 👋
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Platform overview · {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} sub="all accounts" color="#6366f1" />
        <StatCard icon={Activity} label="Active Today" value={stats?.dailyActiveUsers ?? 0} sub="daily active" color="#22c55e" />
        <StatCard icon={UserPlus} label="New This Week" value={stats?.newUsersWeek ?? 0} color="#8b5cf6" />
        <StatCard icon={Crown} label="Premium Users" value={stats?.premiumUsers ?? 0} sub="pro + elite" color="#f59e0b" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${stats?.monthlyRevenue ?? "0.00"}`} sub="estimated MRR" color="#10b981" />
        <StatCard icon={MessageSquare} label="AI Messages" value={stats?.totalMessages ?? 0} sub="total" color="#8b5cf6" />
        <StatCard icon={Zap} label="AI Tokens" value={fmtTokens(stats?.estimatedTokens ?? 0)} sub="estimated" color="#ec4899" />
        <StatCard icon={FileText} label="Exam Sessions" value={stats?.totalExamSessions ?? 0} color="#f97316" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
        {/* Weekly Activity */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <TrendingUp size={14} color="#6366f1" /> Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={MOCK_WEEKLY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e32" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={26} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="messages" fill="#6366f1" radius={[3, 3, 0, 0]} name="Messages" />
              <Bar dataKey="exams" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Exams" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {[{ color: "#6366f1", label: "Messages" }, { color: "#8b5cf6", label: "Exams" }].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#94a3b8" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
              </div>
            ))}
          </div>
        </div>

        {/* AI Usage */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <Zap size={14} color="#ec4899" /> AI Usage
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Total AI Messages", value: stats?.totalMessages ?? 0, max: Math.max(stats?.totalMessages ?? 1, 1), color: "#6366f1" },
              { label: "Exam Sessions", value: stats?.totalExamSessions ?? 0, max: Math.max(stats?.totalMessages ?? 1, 1), color: "#8b5cf6" },
              { label: "Conversations", value: stats?.totalConversations ?? 0, max: Math.max(stats?.totalMessages ?? 1, 1), color: "#a78bfa" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{item.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 5, background: "#1e1e32", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (item.value / item.max) * 100)}%`, background: item.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 6, padding: "12px 14px", background: "#6366f110", border: "1px solid #6366f120", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: "#818cf8", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Estimated Tokens</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#c7d2fe" }}>{fmtTokens(stats?.estimatedTokens ?? 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Sessions */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e32", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color="#64748b" />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Recent Exam Sessions</h3>
        </div>
        {!stats?.recentSessions?.length ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 13 }}>No exam sessions yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, maxWidth: 220 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.examTitle}</span>
                    </td>
                    <td><span className="badge badge-indigo">{s.subject}</span></td>
                    <td>
                      <span style={{ color: s.percentage >= 70 ? "#22c55e" : s.percentage >= 50 ? "#f59e0b" : "#ef4444", fontSize: 12, fontWeight: 500 }}>
                        {s.score}/{s.totalMarks} ({s.percentage}%)
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.percentage >= 70 ? "badge-green" : s.percentage >= 50 ? "badge-amber" : "badge-red"}`}>{s.grade}</span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: 11 }}>
                      {new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
