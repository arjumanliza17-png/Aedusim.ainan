import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, MessageSquare, BookOpen, Users } from "lucide-react";

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
}

interface DailyPoint { date: string; messages: number; exams: number; }

const PLAN_COLORS: Record<string, string> = { free: "#64748b", pro: "#6366f1", elite: "#f59e0b" };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f0f18", border: "1px solid #1e1e32", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { token } = useAuth();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats", token),
    enabled: !!token,
    refetchInterval: 60_000,
  });

  const { data: daily = [], isLoading: dailyLoading } = useQuery<DailyPoint[]>({
    queryKey: ["admin-analytics-daily"],
    queryFn: () => api.get("/admin/analytics/daily", token),
    enabled: !!token,
    refetchInterval: 120_000,
  });

  const planData = stats?.planCounts
    ? Object.entries(stats.planCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  const fmtTokens = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Platform usage trends and growth metrics</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { icon: Users, label: "New This Week", value: stats?.newUsersWeek ?? 0, color: "#6366f1" },
          { icon: Users, label: "New This Month", value: stats?.newUsersMonth ?? 0, color: "#8b5cf6" },
          { icon: MessageSquare, label: "Total AI Messages", value: stats?.totalMessages ?? 0, color: "#ec4899" },
          { icon: BookOpen, label: "Estimated Tokens", value: fmtTokens(stats?.estimatedTokens ?? 0), color: "#f59e0b" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#e2e8f0" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Daily Activity Line Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingUp size={15} color="#6366f1" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>14-Day Activity</h3>
          </div>
          {dailyLoading ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e32" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={2} dot={false} name="Messages" />
                <Line type="monotone" dataKey="exams" stroke="#f59e0b" strokeWidth={2} dot={false} name="Exams" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[{ color: "#6366f1", label: "Messages" }, { color: "#f59e0b", label: "Exams" }].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
                <div style={{ width: 10, height: 2, background: color, borderRadius: 1 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: "0 0 20px" }}>Plan Distribution</h3>
          {planData.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 13 }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {planData.map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name.toLowerCase()] ?? "#64748b"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f0f18", border: "1px solid #1e1e32", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {planData.map(({ name, value }) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_COLORS[name.toLowerCase()] ?? "#64748b", flexShrink: 0 }} />
                <span style={{ color: "#94a3b8", flex: 1 }}>{name}</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart - Daily Breakdown */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: "0 0 20px" }}>Daily Breakdown (14 days)</h3>
        {dailyLoading ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e32" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="messages" fill="#6366f1" radius={[3, 3, 0, 0]} name="Messages" />
              <Bar dataKey="exams" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Exams" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
