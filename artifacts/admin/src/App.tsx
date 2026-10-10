import { useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/auth";
import LoginPage from "@/pages/login";

function LoadingScreen() {
  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>Loading Aedusim Admin…</span>
    </div>
  );
}

function DashboardShell() {
  const { logout } = useAuth();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "admin-logout") logout();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [logout]);

  return (
    <main className="dashboard-frame">
      <iframe
        title="Aedusim Admin Dashboard"
        src="/dashboard.html"
        className="dashboard-iframe"
        referrerPolicy="same-origin"
      />
    </main>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <Switch location={location}>
        <Route path="/login" component={LoginPage} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch location={location}>
      <Route path="/" component={DashboardShell} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
