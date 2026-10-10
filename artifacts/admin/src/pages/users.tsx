import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import {
  Search, Edit2, Trash2, Ban, ChevronDown, X, Save, Loader2, Users,
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  class: string;
  plan: string;
  xp: number;
  level: number;
  streak: number;
  totalMessages: number;
  completedChallenges: number;
  banned: boolean;
  interests: string[];
  goals: string;
  createdAt: string;
}

function PlanBadge({ plan }: { plan: string }) {
  const cls =
    plan === "elite" ? "badge-amber" :
    plan === "pro" ? "badge-indigo" :
    "badge-slate";
  const label = plan === "elite" ? "⭐ Elite" : plan === "pro" ? "💎 Pro" : "Free";
  return <span className={`badge ${cls}`}>{label}</span>;
}

function EditModal({ user, token, onClose }: { user: UserProfile; token: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    class: user.class,
    plan: user.plan,
    xp: String(user.xp),
    level: String(user.level),
    goals: user.goals,
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch(`/admin/users/${user.id}`, data, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); onClose(); },
  });

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label style={{ display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#00000080",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 480, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Edit User</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {field("name", "Display Name")}
          {field("email", "Email")}
          {field("class", "Class / Year")}

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Plan</label>
            <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("xp", "XP", "number")}
            {field("level", "Level", "number")}
          </div>

          {field("goals", "Goals")}
        </div>

        {save.error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#ef444415", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
            {(save.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => save.mutate({ ...form, xp: Number(form.xp), level: Number(form.level) })}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users", token),
    enabled: !!token,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: number; banned: boolean }) =>
      api.patch(`/admin/users/${id}`, { banned }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.class.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const handleDelete = (user: UserProfile) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Users</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {users.length} total · {users.filter((u) => u.plan !== "free").length} premium
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, class…"
            style={{ paddingLeft: 32 }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{ paddingRight: 32, minWidth: 130 }}
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !filtered.length ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Users size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>XP / Level</th>
                  <th>Messages</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{user.email || user.class}</div>
                    </td>
                    <td><PlanBadge plan={user.plan} /></td>
                    <td>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {user.xp.toLocaleString()} XP · Lv {user.level}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{user.totalMessages}</span>
                    </td>
                    <td>
                      {user.banned ? (
                        <span className="badge badge-red">Banned</span>
                      ) : (
                        <span className="badge badge-green">Active</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11, color: "#64748b" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          onClick={() => setEditUser(user)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={user.banned ? "Unban" : "Ban"}
                          onClick={() => banMutation.mutate({ id: user.id, banned: !user.banned })}
                          style={{ color: user.banned ? "#22c55e" : "#f59e0b", borderColor: user.banned ? "#22c55e30" : "#f59e0b30" }}
                        >
                          <Ban size={12} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <EditModal user={editUser} token={token} onClose={() => setEditUser(null)} />
      )}
    </div>
  );
}
