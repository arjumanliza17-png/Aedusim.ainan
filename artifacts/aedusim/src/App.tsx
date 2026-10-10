import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { AiAvatarPopup } from "@/components/ai-avatar-popup";
import FalcoaPage from "./pages/falcoa";
import KnowledgeHubPage from "./pages/knowledge-hub";
import SubjectViewPage from "./pages/subject-view";
import LessonViewPage from "./pages/lesson-view";
import ProgressPage from "./pages/progress";
import ProfilePage from "./pages/profile";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import HowToUsePage from "./pages/how-to-use";
import SabroPage from "./pages/sabro";
import NotebookPage from "./pages/notebook";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const configuredClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = configuredClerkKey
  ? publishableKeyFromHost(window.location.hostname, configuredClerkKey)
  : "";
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#38bdf8",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#fb7185",
    colorBackground: "#111827",
    colorInput: "#0f172a",
    colorInputForeground: "#f8fafc",
    colorNeutral: "#334155",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.9rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-slate-900 rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-50",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButtonText: "text-slate-100",
    formFieldLabel: "text-slate-300",
    footerActionLink: "text-sky-300",
    footerActionText: "text-slate-400",
    dividerText: "text-slate-500",
    formFieldInput: "bg-slate-950 border-slate-700 text-slate-50",
    formButtonPrimary: "bg-sky-500 hover:bg-sky-400 text-slate-950",
    socialButtonsBlockButton: "bg-slate-800 border-slate-700 hover:bg-slate-700",
    alertText: "text-rose-300",
    main: "bg-transparent",
  },
};

function LoadingScreen() {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);
  if (timedOut) return <AuthUnavailable />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
      <div className="max-w-md px-6 text-center">
        <div className="text-sm text-slate-400">
          {timedOut ? "The sign-in service could not be reached." : "Loading your learning space…"}
        </div>
        {timedOut && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Authentication needs to be provisioned for this workspace before learner accounts can be used.
          </p>
        )}
      </div>
    </div>
  );
}

function AuthUnavailable() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative max-w-lg text-center">
        <img src={`${basePath}/aedusim-brand-logo.png`} alt="Aedusim" className="mx-auto h-16 w-40 object-contain mb-6" />
        <h1 className="text-2xl font-bold mb-3">Authentication is being configured</h1>
        <p className="text-sm leading-6 text-slate-400">
          Aedusim now protects learner accounts and personal progress. The managed sign-in service has not finished provisioning in this workspace yet.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <a href={`${basePath}/sign-up`} className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300 transition-colors">Create account</a>
          <a href={`${basePath}/sign-in`} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 transition-colors">Sign in</a>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline">
          Retry authentication
        </button>
      </div>
    </div>
  );
}

function AuthLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute -left-40 top-[-18rem] h-[34rem] w-[34rem] rounded-full bg-sky-500/15 blur-3xl" />
      <div className="absolute -right-40 bottom-[-20rem] h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between">
          <a href={basePath || "/"} className="flex items-center gap-3">
            <img src={`${basePath}/aedusim-brand-logo.png`} alt="Aedusim" className="h-11 w-28 object-contain" />
            <span className="hidden border-l border-slate-800 pl-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">Learning OS</span>
          </a>
          <a href={`${basePath}/sign-in`} className="rounded-full border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-sky-400/60 hover:bg-slate-900">Already have an account? <span className="text-sky-300">Sign in</span></a>
        </header>

        <main className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_#7dd3fc]" /> Learn by understanding
            </p>
            <h1 className="text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              A sharper way to <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">learn science.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Falcoa turns difficult concepts into clear next steps. Follow structured lessons, practice with Sabro, and keep every win attached to your own learner profile.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`${basePath}/sign-up`} className="group inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,.2)] transition-all hover:-translate-y-0.5 hover:bg-sky-300">
                Create your account <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <a href={`${basePath}/sign-in`} className="rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-900">Sign in</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
              <span><strong className="text-slate-300">Falcoa</strong> personal tutor</span>
              <span><strong className="text-slate-300">Progress</strong> saved privately</span>
              <span><strong className="text-slate-300">Starter</strong> plan available</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-transparent to-fuchsia-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/80 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img src={`${basePath}/falcoa-logo.png`} alt="" className="h-10 w-10 rounded-xl border border-sky-400/30 object-contain" />
                  <div><p className="text-sm font-bold">Falcoa AI</p><p className="text-xs text-slate-500">Your personal tutor</p></div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">READY</span>
              </div>
              <div className="space-y-3 py-5">
                <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-slate-700 bg-slate-800/80 p-3 text-xs leading-5 text-slate-300">Let’s make Newton’s Second Law feel simple.</div>
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-sky-400/15 p-3 text-xs leading-5 text-sky-100">Explain it with an example I can remember.</div>
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-slate-700 bg-slate-800/80 p-3 text-xs leading-5 text-slate-300">Think of force as the push, mass as how much matter resists it, and acceleration as the change in motion: <strong className="text-sky-300">F = ma</strong>.</div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-xs text-slate-500">Ask Falcoa anything… <span className="ml-auto rounded-lg bg-sky-400 px-2 py-1 font-bold text-slate-950">↗</span></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) {
        qc.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function ProtectedApp() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div className="h-full w-full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <Switch>
            <Route path="/falcoa" component={FalcoaPage} />
            <Route path="/falcoa/:id" component={() => <Redirect to="/falcoa" />} />
            <Route path="/knowledge" component={KnowledgeHubPage} />
            <Route path="/knowledge/:subject" component={(props: any) => <SubjectViewPage params={props.params} />} />
            <Route path="/knowledge/:subject/:topic" component={(props: any) => <LessonViewPage params={props.params} />} />
            <Route path="/progress" component={ProgressPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/sabro" component={SabroPage} />
            <Route path="/notebook" component={NotebookPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/how-to-use" component={HowToUsePage} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function RootRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  return isSignedIn ? <Redirect to="/falcoa" /> : <AuthLanding />;
}

function ClerkApp() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Continue learning with Aedusim" } },
        signUp: { start: { title: "Create your Aedusim account", subtitle: "Your progress will be saved to your account" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Toaster />
        <Switch>
          <Route path="/" component={RootRoute} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={ProtectedApp} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  if (!clerkPubKey) return <AuthUnavailable />;
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkApp />
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;