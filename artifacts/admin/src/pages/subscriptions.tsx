import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { Crown, Users, DollarSign, TrendingUp, Edit2 } from "lucide-react";
import { useState } from "react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  class: string;
  plan: string;
  xp: number;
  level: number;
  createdAt: string;
}

const PLAN_CONFIG: Record<string, { label: string; color: string; badgeClass: string; price: number }> = {
  free: { label: "Free", color: "#64748b", badgeClass: "badge-slate", price: 0 },
  pro: { label: "Pro", color: "#6366f1", badgeClass: "badge-indigo", price: 9.99 },
  elite: { label: "Elite", color: "#f59e0b", badgeClass: "badge-amber", price: 19.99 },
};

function PlanEditModal({ user, token, onClose }: { user: UserProfile; token: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [plan, setPlan] = useState(user.plan);

  const save = useMutation({
    mutationFn: () => api.patch(`/admin/users/${user.id}`, { plan }, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); onClose(); },
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 360, padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px" }}>Change Plan</h2>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 20px" }}>{user.name} · {user.email || user.class}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPlan(key)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderRadius: 8, border: `1px solid ${plan === key ? cfg.color + "50" : "#1e1e32"}`,
                background: plan === key ? cfg.color + "10" : "transparent",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan === key ? cfg.color : "#e2e8f0" }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>${cfg.price.toFixed(2)}/month</div>
              </div>
              {plan === key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => save.mutate()} disabled={save.isPending || plan === user.plan}>
            Save Change
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { token } = useAuth();
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [planFilter, setPlanFilter] = useState("all");

  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users", token),
    enabled: !!token,
  });

  const planCounts = users.reduce((acc: Record<string, number>, u) => {
    acc[u.plan] = (acc[u.plan] ?? 0) + 1;
    return acc;
  }, {});

  const monthlyRevenue = users.reduce((sum, u) => sum + (PLAN_CONFIG[u.plan]?.price ?? 0), 0);

  const filtered = planFilter === "all" ? users : users.filter((u) => u.plan === planFilter);
  const premium = users.filter((u) => u.plan !== "free");

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Subscriptions</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Plan distribution and revenue overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { icon: Users, label: "Total Users", value: users.length, color: "#6366f1" },
          { icon: Crown, label: "Premium Users", value: premium.length, color: "#f59e0b" },
          { icon: DollarSign, label: "MRR (Est.)", value: `$${monthlyRevenue.toFixed(2)}`, color: "#22c55e" },
          { icon: TrendingUp, label: "Conversion", value: users.length ? `${Math.round((premium.length / users.length) * 100)}%` : "0%", color: "#ec4899" },
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

      {/* Plan breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {Object.entries(PLAN_CONFIG).map(([key, cfg]) => {
          const count = planCounts[key] ?? 0;
          const pct = users.length ? Math.round((count / users.length) * 100) : 0;
          return (
            <div key={key} className="card" style={{ padding: 20, cursor: "pointer", border: planFilter === key ? `1px solid ${cfg.color}50` : undefined }} onClick={() => setPlanFilter(planFilter === key ? "all" : key)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>${cfg.price}/mo</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{count}</div>
              <div style={{ height: 4, background: "#1e1e32", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 2, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{pct}% of all users</div>
            </div>
          );
        })}
      </div>

      {/* User table filtered by plan */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e32", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
            {planFilter === "all" ? "All Users" : `${PLAN_CONFIG[planFilter]?.label} Users`}
          </span>
          <span style={{ fontSize: 12, color: "#64748b" }}>({filtered.length})</span>
          {planFilter !== "all" && (
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setPlanFilter("all")}>
              Clear filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}><div className="spinner" /></div>
        ) : !filtered.length ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 13 }}>No users in this plan</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>XP / Level</th>
                  <th>Joined</th>
                  <th>Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{u.email || u.class}</div>
                    </td>
                    <td><span className={`badge ${PLAN_CONFIG[u.plan]?.badgeClass ?? "badge-slate"}`}>{PLAN_CONFIG[u.plan]?.label ?? u.plan}</span></td>
                    <td style={{ fontSize: 12, color: "#94a3b8" }}>{u.xp.toLocaleString()} XP · Lv {u.level}</td>
                    <td style={{ fontSize: 11, color: "#64748b" }}>{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>
                        <Edit2 size={12} /> Change
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && <PlanEditModal user={editUser} token={token} onClose={() => setEditUser(null)} />}
    </div>
  );
}
