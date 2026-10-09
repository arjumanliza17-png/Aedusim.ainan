import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import {
  Plus, Trash2, Tag, ToggleLeft, ToggleRight, Copy, Check, Loader2, X, Save,
} from "lucide-react";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount: number;
  type: string;
  plan: string;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function CreateModal({ token, onClose }: { token: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount: "20",
    type: "percentage",
    plan: "pro",
    maxUses: "",
    expiresAt: "",
  });

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/admin/coupons", data, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); onClose(); },
  });

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((f) => ({ ...f, code }));
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Create Coupon</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Coupon Code</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER25"
                style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}
              />
              <button className="btn btn-ghost" style={{ whiteSpace: "nowrap" }} onClick={generateCode}>
                Generate
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Summer sale 2025"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Discount</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Plan Unlock</label>
            <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Max Uses (blank = ∞)</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Expires At</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {create.error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#ef444415", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
            {(create.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => create.mutate({ ...form, discount: Number(form.discount), maxUses: form.maxUses || null, expiresAt: form.expiresAt || null })}
            disabled={create.isPending || !form.code}
          >
            {create.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Create Coupon
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: () => api.get("/admin/coupons", token),
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch(`/admin/coupons/${id}`, { active }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isExpired = (expiresAt: string | null) =>
    expiresAt ? new Date(expiresAt) < new Date() : false;

  const getStatus = (c: Coupon) => {
    if (!c.active) return <span className="badge badge-slate">Inactive</span>;
    if (isExpired(c.expiresAt)) return <span className="badge badge-red">Expired</span>;
    if (c.maxUses && c.usedCount >= c.maxUses) return <span className="badge badge-red">Exhausted</span>;
    return <span className="badge badge-green">Active</span>;
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Coupon Codes</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {coupons.filter((c) => c.active).length} active · {coupons.length} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Coupons", value: coupons.length, color: "#6366f1" },
          { label: "Active Coupons", value: coupons.filter((c) => c.active && !isExpired(c.expiresAt)).length, color: "#22c55e" },
          { label: "Total Redemptions", value: coupons.reduce((s, c) => s + c.usedCount, 0), color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !coupons.length ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Tag size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>No coupons yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Plan</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#818cf8",
                            background: "#6366f110",
                            padding: "3px 8px",
                            borderRadius: 6,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyCode(c.id, c.code)}
                          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 2 }}
                        >
                          {copiedId === c.id ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: 12, maxWidth: 160 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.description || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#22c55e" }}>
                        {c.discount}{c.type === "percentage" ? "%" : "$"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.plan === "elite" ? "badge-amber" : "badge-indigo"}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#94a3b8" }}>
                      {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}{" "}
                      <span style={{ color: "#64748b" }}>uses</span>
                    </td>
                    <td style={{ fontSize: 11, color: isExpired(c.expiresAt) ? "#ef4444" : "#64748b" }}>
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Never"}
                    </td>
                    <td>{getStatus(c)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={c.active ? "Deactivate" : "Activate"}
                          onClick={() => toggleMutation.mutate({ id: c.id, active: !c.active })}
                          style={{ color: c.active ? "#f59e0b" : "#22c55e" }}
                        >
                          {c.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete coupon ${c.code}?`)) deleteMutation.mutate(c.id);
                          }}
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

      {showCreate && <CreateModal token={token} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
