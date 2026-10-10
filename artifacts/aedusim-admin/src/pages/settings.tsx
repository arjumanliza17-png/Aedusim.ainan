import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { Settings, Zap, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface SystemSettings { [key: string]: string; }

const FEATURE_FLAGS = [
  { key: "feature_simulations", label: "3D Simulations", desc: "Enable interactive 3D simulations in lessons" },
  { key: "feature_challenges", label: "Daily Challenges", desc: "Show daily challenges in the sidebar" },
  { key: "feature_documents", label: "Document Upload", desc: "Allow users to upload and process documents" },
];

const SYSTEM_CONTROLS = [
  { key: "maintenance_mode", label: "Maintenance Mode", desc: "Block all student access — show maintenance page", danger: true },
  { key: "registration_enabled", label: "New Registrations", desc: "Allow new users to create accounts" },
  { key: "ai_enabled", label: "Falcoa AI", desc: "Enable AI responses (disable to save API costs)" },
  { key: "show_pricing_banner", label: "Pricing Banner", desc: "Show upgrade banner to free users" },
];

function Toggle({
  checked,
  onChange,
  disabled,
  danger,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const activeColor = danger ? "#ef4444" : "#6366f1";
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? activeColor : "#1e1e32",
        border: `1px solid ${checked ? activeColor : "#2a2a45"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 2,
        transition: "all 0.2s",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: "white",
        transform: checked ? "translateX(20px)" : "translateX(0)",
        transition: "transform 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["admin-settings"],
    queryFn: () => api.get("/admin/settings", token),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch(`/admin/settings/${key}`, { value }, token),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    },
  });

  const toggle = (key: string, current: string) => {
    const newVal = current === "true" ? "false" : "true";
    updateMutation.mutate({ key, value: newVal });
  };

  const isOn = (key: string) => settings?.[key] === "true";

  if (isLoading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>System Settings</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Configure platform behaviour and feature availability
        </p>
      </div>

      {/* Maintenance Mode Warning */}
      {isOn("maintenance_mode") && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
          background: "#ef444415", border: "1px solid #ef444430", borderRadius: 10, marginBottom: 24,
        }}>
          <AlertTriangle size={18} color="#ef4444" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>Maintenance mode is ON</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Students cannot access the platform right now</div>
          </div>
        </div>
      )}

      {/* System Controls */}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e32", display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={15} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>System Controls</span>
        </div>
        {SYSTEM_CONTROLS.map(({ key, label, desc, danger }, i) => (
          <div
            key={key}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
              borderBottom: i < SYSTEM_CONTROLS.length - 1 ? "1px solid #1e1e32" : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: danger && isOn(key) ? "#ef4444" : "#e2e8f0", marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saved === key && <CheckCircle size={14} color="#22c55e" />}
              {updateMutation.isPending && updateMutation.variables?.key === key && (
                <Loader2 size={13} color="#64748b" style={{ animation: "spin 0.7s linear infinite" }} />
              )}
              <Toggle
                checked={isOn(key)}
                onChange={() => toggle(key, settings?.[key] ?? "false")}
                disabled={updateMutation.isPending}
                danger={danger}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Feature Flags */}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e32", display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={15} color="#f59e0b" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Feature Flags</span>
        </div>
        {FEATURE_FLAGS.map(({ key, label, desc }, i) => (
          <div
            key={key}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
              borderBottom: i < FEATURE_FLAGS.length - 1 ? "1px solid #1e1e32" : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saved === key && <CheckCircle size={14} color="#22c55e" />}
              {updateMutation.isPending && updateMutation.variables?.key === key && (
                <Loader2 size={13} color="#64748b" style={{ animation: "spin 0.7s linear infinite" }} />
              )}
              <Toggle
                checked={isOn(key)}
                onChange={() => toggle(key, settings?.[key] ?? "true")}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Limits */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e32", display: "flex", alignItems: "center", gap: 8 }}>
          <Settings size={15} color="#94a3b8" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Message Limits</span>
        </div>
        {[
          { key: "max_messages_free", label: "Free Plan Limit", desc: "Max AI messages per free user" },
          { key: "max_messages_pro", label: "Pro Plan Limit", desc: "Max AI messages per Pro user" },
        ].map(({ key, label, desc }, i, arr) => (
          <div
            key={key}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid #1e1e32" : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {saved === key && <CheckCircle size={14} color="#22c55e" />}
              <input
                type="number"
                defaultValue={settings?.[key] ?? "50"}
                style={{ width: 90, textAlign: "center" }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== settings?.[key]) {
                    updateMutation.mutate({ key, value: val });
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
