import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { Plus, Trash2, X, Save, Loader2, ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  role: "owner" | "admin";
  createdAt: string;
  lastLoginAt: string | null;
}

function CreateModal({ token, onClose }: { token: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ username: "", password: "", role: "admin" });
  const [showPass, setShowPass] = useState(false);

  const create = useMutation({
    mutationFn: () => api.post("/admin/admins", form, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-admins"] }); onClose(); },
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Add Admin</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Username / Email</label>
            <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="admin@example.com" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Strong password"
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {create.error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#ef444415", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
            {(create.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => create.mutate()} disabled={create.isPending || !form.username || !form.password}>
            {create.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Create Admin
          </button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminsPage() {
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const isOwner = user?.role === "owner";

  const { data: admins = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-admins"],
    queryFn: () => api.get("/admin/admins", token),
    enabled: !!token && isOwner,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/admins/${id}`, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-admins"] }),
  });

  if (!isOwner) {
    return (
      <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <Lock size={48} style={{ color: "#1e1e32", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px" }}>Owner Access Only</h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>Admin management requires Owner role</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Admin Users</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Manage who can access this admin panel · Owner-only
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Add Admin
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !admins.length ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <ShieldCheck size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>No admin users yet</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: admin.role === "owner" ? "#f59e0b20" : "#6366f120",
                        border: `1px solid ${admin.role === "owner" ? "#f59e0b30" : "#6366f130"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        color: admin.role === "owner" ? "#f59e0b" : "#818cf8",
                      }}>
                        {admin.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{admin.username}</div>
                        {admin.id === user?.id && (
                          <div style={{ fontSize: 10, color: "#64748b" }}>← you</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {admin.role === "owner"
                      ? <span className="badge badge-amber">⭐ Owner</span>
                      : <span className="badge badge-indigo">🛡️ Admin</span>}
                  </td>
                  <td style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(admin.lastLoginAt)}</td>
                  <td style={{ fontSize: 11, color: "#64748b" }}>
                    {new Date(admin.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    {admin.id !== user?.id ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`Remove admin "${admin.username}"?`)) deleteMutation.mutate(admin.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#374151" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateModal token={token} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
