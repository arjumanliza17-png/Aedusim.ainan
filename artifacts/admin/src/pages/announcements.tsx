import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, X, Save, Loader2, Megaphone, ToggleLeft, ToggleRight } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  active: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  info: "badge-indigo",
  warning: "badge-amber",
  success: "badge-green",
  danger: "badge-red",
};

const TYPE_BORDER: Record<string, string> = {
  info: "#6366f130",
  warning: "#f59e0b30",
  success: "#22c55e30",
  danger: "#ef444430",
};

function AnnouncementModal({
  ann,
  token,
  onClose,
}: {
  ann: Announcement | null;
  token: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isNew = !ann;
  const [form, setForm] = useState({
    title: ann?.title ?? "",
    content: ann?.content ?? "",
    type: ann?.type ?? "info",
  });

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? api.post("/admin/announcements", form, token)
        : api.patch(`/admin/announcements/${ann!.id}`, form, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); onClose(); },
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 500, padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            {isNew ? "New Announcement" : "Edit Announcement"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Message</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} placeholder="Announcement content…" style={{ resize: "vertical" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
            </select>
          </div>
          {/* Preview */}
          {form.title && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: `1px solid ${TYPE_BORDER[form.type] ?? "#1e1e32"}`,
              background: "#16162a",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{form.title}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{form.content}</div>
            </div>
          )}
        </div>

        {save.error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#ef444415", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
            {(save.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !form.title}>
            {save.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isNew ? "Publish" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [modal, setModal] = useState<Announcement | null | "new">(null);

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["admin-announcements"],
    queryFn: () => api.get("/admin/announcements", token),
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch(`/admin/announcements/${id}`, { active }, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/announcements/${id}`, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const active = announcements.filter((a) => a.active);
  const inactive = announcements.filter((a) => !a.active);

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Announcements</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {active.length} active · {inactive.length} archived
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}>
          <Plus size={14} /> New Announcement
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !announcements.length ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Megaphone size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>No announcements yet</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((ann) => (
                <tr key={ann.id} style={{ opacity: ann.active ? 1 : 0.55 }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{ann.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {ann.content.slice(0, 80)}{ann.content.length > 80 ? "…" : ""}
                    </div>
                  </td>
                  <td><span className={`badge ${TYPE_COLORS[ann.type] ?? "badge-slate"}`}>{ann.type}</span></td>
                  <td>
                    {ann.active
                      ? <span className="badge badge-green">Active</span>
                      : <span className="badge badge-slate">Archived</span>}
                  </td>
                  <td style={{ fontSize: 11, color: "#64748b" }}>
                    {new Date(ann.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        title={ann.active ? "Archive" : "Activate"}
                        onClick={() => toggleMutation.mutate({ id: ann.id, active: !ann.active })}
                      >
                        {ann.active ? <ToggleRight size={12} style={{ color: "#22c55e" }} /> : <ToggleLeft size={12} />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(ann)}>
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { if (confirm("Delete this announcement?")) deleteMutation.mutate(ann.id); }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <AnnouncementModal ann={modal === "new" ? null : modal} token={token} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
