import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import {
  LayoutDashboard, Users, Tag, LogOut, Shield, ChevronRight,
  TrendingUp, Activity, Swords, Settings, ShieldCheck, Megaphone,
  BarChart2, Crown, ChevronLeft, Menu,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { href: "/analytics", icon: BarChart2, label: "Analytics" },
      { href: "/activity", icon: Activity, label: "Activity Log" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/users", icon: Users, label: "User Management" },
      { href: "/subscriptions", icon: Crown, label: "Subscriptions" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/challenges", icon: Swords, label: "Daily Challenges" },
      { href: "/coupons", icon: Tag, label: "Coupons" },
      { href: "/announcements", icon: Megaphone, label: "Announcements" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", icon: Settings, label: "System Settings" },
      { href: "/admins", icon: ShieldCheck, label: "Admin Users", ownerOnly: true },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 56 : 220,
          background: "#0c0c18",
          borderRight: "1px solid #1e1e32",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Brand + collapse */}
        <div style={{
          padding: collapsed ? "16px 12px" : "16px",
          borderBottom: "1px solid #1e1e32",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={14} color="white" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap" }}>Aedusim</div>
                <div style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Panel</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={14} color="white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !("ownerOnly" in item && item.ownerOnly && user?.role !== "owner")
            );
            if (!visibleItems.length) return null;
            return (
              <div key={section.label} style={{ marginBottom: 4 }}>
                {!collapsed && (
                  <div style={{
                    padding: "10px 10px 4px",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}>
                    {section.label}
                  </div>
                )}
                {collapsed && <div style={{ height: 8 }} />}
                {visibleItems.map(({ href, icon: Icon, label, ...rest }) => {
                  const exact = "exact" in rest ? rest.exact : undefined;
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={collapsed ? label : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: collapsed ? 0 : 9,
                        padding: collapsed ? "9px 0" : "8px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "all 0.12s",
                        background: active ? "#6366f115" : "transparent",
                        color: active ? "#818cf8" : "#94a3b8",
                        border: active ? "1px solid #6366f120" : "1px solid transparent",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        marginBottom: 1,
                      }}
                    >
                      <Icon size={14} style={{ flexShrink: 0 }} />
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1 }}>{label}</span>
                          {active && <ChevronRight size={10} style={{ opacity: 0.5 }} />}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "8px", borderTop: "1px solid #1e1e32" }}>
          {!collapsed && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "#16162a", border: "1px solid #1e1e32",
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.username}
              </div>
              <div style={{ fontSize: 9, color: user?.role === "owner" ? "#f59e0b" : "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                {user?.role === "owner" ? "⭐ Owner" : "🛡️ Admin"}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? "Sign out" : undefined}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "center",
              gap: collapsed ? 0 : 6, padding: "7px",
              background: "transparent", border: "1px solid #1e1e32",
              borderRadius: 7, color: "#64748b", cursor: "pointer",
              fontSize: 12, fontWeight: 500,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#16162a"; e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            <LogOut size={13} />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", background: "#09090f" }}>
        {children}
      </main>
    </div>
  );
}
