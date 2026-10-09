import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, X, Save, Loader2, Swords, Search } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  xpReward: number;
  question: string;
  options: string[];
  correctAnswer: string;
  avatar: string;
  completed: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "badge-green",
  medium: "badge-amber",
  hard: "badge-red",
  challenge: "badge-indigo",
};

function ChallengeModal({
  challenge,
  token,
  onClose,
}: {
  challenge: Challenge | null;
  token: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isNew = !challenge;

  const [form, setForm] = useState({
    title: challenge?.title ?? "",
    description: challenge?.description ?? "",
    subject: challenge?.subject ?? "Physics",
    difficulty: challenge?.difficulty ?? "medium",
    xpReward: String(challenge?.xpReward ?? 50),
    question: challenge?.question ?? "",
    options: (challenge?.options ?? ["", "", "", ""]).join("\n"),
    correctAnswer: challenge?.correctAnswer ?? "",
    avatar: challenge?.avatar ?? "falcoa",
  });

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isNew
        ? api.post("/admin/challenges", data, token)
        : api.patch(`/admin/challenges/${challenge!.id}`, data, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      onClose();
    },
  });

  const handleSubmit = () => {
    save.mutate({
      ...form,
      xpReward: Number(form.xpReward),
      options: form.options.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: "100%", maxWidth: 560, padding: 28, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            {isNew ? "Create Challenge" : "Edit Challenge"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Challenge title" />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description" style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Subject</label>
              <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                {["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "English", "History", "General"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                {["easy", "medium", "hard", "challenge"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>XP Reward</label>
              <input type="number" value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))} min={0} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Avatar</label>
              <select value={form.avatar} onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}>
                {["falcoa", "professor", "scientist", "explorer"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Question</label>
            <textarea value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} rows={3} placeholder="The challenge question" style={{ resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Options (one per line)</label>
            <textarea value={form.options} onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))} rows={4} placeholder={"Option A\nOption B\nOption C\nOption D"} style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Correct Answer</label>
            <input value={form.correctAnswer} onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))} placeholder="Must match one of the options exactly" />
          </div>
        </div>

        {save.error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#ef444415", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
            {(save.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={save.isPending}>
            {save.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isNew ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Challenge | null | "new">(null);

  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["admin-challenges"],
    queryFn: () => api.get("/admin/challenges", token),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/challenges/${id}`, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-challenges"] }),
  });

  const filtered = challenges.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Daily Challenges</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{challenges.length} challenges total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}>
          <Plus size={14} /> New Challenge
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 320, marginBottom: 20 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search challenges…" style={{ paddingLeft: 32 }} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div className="spinner" />
          </div>
        ) : !filtered.length ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Swords size={40} style={{ color: "#1e1e32", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 13 }}>
              {search ? "No challenges found" : "No challenges yet — create the first one"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>XP</th>
                  <th>Question preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{ch.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{ch.description.slice(0, 60)}{ch.description.length > 60 ? "…" : ""}</div>
                    </td>
                    <td><span className="badge badge-indigo">{ch.subject}</span></td>
                    <td><span className={`badge ${DIFFICULTY_COLORS[ch.difficulty] ?? "badge-slate"}`}>{ch.difficulty}</span></td>
                    <td><span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>⚡ {ch.xpReward}</span></td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ fontSize: 11, color: "#64748b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ch.question.slice(0, 70)}{ch.question.length > 70 ? "…" : ""}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(ch)}><Edit2 size={12} /></button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (confirm(`Delete "${ch.title}"?`)) deleteMutation.mutate(ch.id);
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

      {modal !== null && (
        <ChallengeModal
          challenge={modal === "new" ? null : modal}
          token={token}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
