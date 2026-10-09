import { FC, ReactNode, lazy, Suspense } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";

const ParticleField = lazy(() =>
  import("@/components/motion/particle-field").then(m => ({ default: m.ParticleField }))
);
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { TrendingUp, User, Crown, Info, HelpCircle, Atom, Swords, BookOpen, LogOut, Sparkles } from "lucide-react";

const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const NavLink: FC<{ href: string; icon: ReactNode; label: string; active?: boolean }> = ({
  href, icon, label, active,
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={active} tooltip={label}>
      <Link href={href} className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
        {/* Global particle network background */}
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>
        <Sidebar variant="inset" className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 px-4">
            <Link href="/" className="flex items-center justify-center">
              <img src="/aedusim-brand-logo.png" alt="Aedusim Logo" className="h-12 w-28 object-contain rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.2)]" />
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-3">
            <SidebarMenu>
              {/* Falcoa AI — standalone personal chat */}
              <div className="px-2 pb-1 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Falcoa AI</span>
              </div>
              <NavLink
                href="/falcoa"
                icon={<img src="/falcoa-logo.png" alt="Falcoa" className="w-4 h-4 object-contain" />}
                label="Chat with Falcoa"
                active={location.startsWith("/falcoa")}
              />

              <SidebarSeparator className="my-2" />

              {/* Knowledge Hub — subjects & lessons */}
              <div className="px-2 pb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Knowledge Hub</span>
              </div>
              <NavLink
                href="/knowledge"
                icon={<Atom className="w-4 h-4 text-blue-400" />}
                label="Subjects & Lessons"
                active={location.startsWith("/knowledge")}
              />
              <NavLink
                href="/sabro"
                icon={<Swords className="w-4 h-4 text-orange-400" />}
                label="Daily Challenges"
                active={location.startsWith("/sabro")}
              />
              <NavLink
                href="/progress"
                icon={<TrendingUp className="w-4 h-4 text-green-400" />}
                label="My Progress"
                active={location.startsWith("/progress")}
              />

              <SidebarSeparator className="my-2" />

              {/* Account */}
              <div className="px-2 pb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account</span>
              </div>
              <NavLink
                href="/profile"
                icon={<User className="w-4 h-4 text-cyan-400" />}
                label="Profile & Files"
                active={location.startsWith("/profile")}
              />
              <NavLink
                href="/notebook"
                icon={<BookOpen className="w-4 h-4 text-blue-400" />}
                label="My Documents"
                active={location.startsWith("/notebook")}
              />
              <NavLink
                href="/pricing"
                icon={<Crown className="w-4 h-4 text-amber-400" />}
                label="Plans & Pricing"
                active={location.startsWith("/pricing")}
              />
              <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Your account</span>
                </div>
                <p className="mt-1 truncate text-xs font-medium text-foreground/80">
                  {user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "Learner"}
                </p>
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: appBasePath || "/" })}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>

              <SidebarSeparator className="my-2" />

              {/* Info */}
              <div className="px-2 pb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Info</span>
              </div>
              <NavLink
                href="/how-to-use"
                icon={<HelpCircle className="w-4 h-4 text-sky-400" />}
                label="How to Use"
                active={location.startsWith("/how-to-use")}
              />
              <NavLink
                href="/about"
                icon={<Info className="w-4 h-4 text-teal-400" />}
                label="About Aedusim"
                active={location.startsWith("/about")}
              />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden relative">
          {/* Mobile header — logo only, no text */}
          <header className="h-14 border-b border-border/50 flex items-center px-4 md:hidden shrink-0">
            <SidebarTrigger />
            <div className="ml-3">
              <img src="/aedusim-brand-logo.png" alt="Aedusim" className="h-9 w-24 object-contain rounded-lg shadow-[0_0_14px_rgba(236,72,153,0.2)]" />
            </div>
          </header>
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
