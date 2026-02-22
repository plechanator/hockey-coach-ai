import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Dumbbell, 
  CalendarCheck,
  CalendarPlus,
  History, 
  LogOut,
  User,
  Menu,
  Globe,
  Star,
  Lightbulb,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t.nav.dashboard, href: "/", icon: LayoutDashboard },
    { label: t.nav.createTraining, href: "/create-training", icon: Dumbbell },
    { label: t.nav.createPlan, href: "/create-plan", icon: CalendarPlus },
    { label: t.nav.calendar, href: "/calendar", icon: CalendarCheck },
    { label: t.nav.history, href: "/history", icon: History },
    { label: t.nav.myDrills, href: "/my-drills", icon: Star },
    { label: t.nav.inspiration, href: "/inspiration", icon: Lightbulb },
    { label: (t.nav as any).knowledge || "Drill Library", href: "/knowledge", icon: BookOpen },
    { label: t.nav.profile, href: "/profile", icon: User },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/8">
        <h1 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
          <span className="text-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </span> 
          Coach<span className="text-accent">AI</span>
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 cursor-pointer text-sm",
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/55 hover:text-white/80 hover:bg-white/5"
                )}
                onClick={() => setOpen(false)}
                data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/8 space-y-1">
        <button
          onClick={() => setLanguage(language === "en" ? "cz" : "en")}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:text-white/70 transition-colors rounded-md"
          data-testid="button-toggle-language"
        >
          <Globe className="w-4 h-4" />
          <span>{language === "en" ? "Čeština" : "English"}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
            {user?.firstName?.[0] || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/40 hover:text-white/60 transition-colors rounded-md"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 bg-[#1E2A3A] flex-col fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1E2A3A] text-white fixed top-0 inset-x-0 z-40">
        <h1 className="text-base font-semibold tracking-wide">
          Coach<span className="text-accent">AI</span>
        </h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white" data-testid="button-mobile-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-[#1E2A3A] border-r border-white/8 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
