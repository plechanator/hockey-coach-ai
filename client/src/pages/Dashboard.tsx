import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTrainings } from "@/hooks/use-trainings";
import { TrainingCard } from "@/components/TrainingCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Wand2, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { InsightCard } from "@/components/InsightCard";
import { CoachChat } from "@/components/CoachChat";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

function CategoryGroup({ category, items }: { category: string; items: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
    setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > *")?.offsetWidth || 300;
    const distance = cardWidth + 16;
    el.scrollBy({ left: dir === "right" ? distance : -distance, behavior: "smooth" });
  };

  const showNav = items.length > 3;

  return (
    <div data-testid={`group-category-${category}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider" data-testid={`text-category-${category}`}>
          {category}
          <span className="ml-2 text-xs font-normal normal-case tracking-normal">({items.length})</span>
        </h3>
        {showNav && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-25 transition-all"
              data-testid={`button-prev-${category}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-25 transition-all"
              data-testid={`button-next-${category}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        <style>{`[data-testid="group-category-${category}"] div::-webkit-scrollbar { display: none; }`}</style>
        {items.map((training: any) => (
          <div
            key={training.id}
            className="min-w-[280px] w-[calc(33.333%-11px)] max-w-[340px] flex-shrink-0 snap-start"
          >
            <TrainingCard training={training} />
          </div>
        ))}
      </div>

      {showNav && (
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/50 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.max(15, (3 / items.length) * 100)}%`,
              marginLeft: `${scrollProgress * (100 - Math.max(15, (3 / items.length) * 100))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trainings, isLoading: trainingsLoading } = useTrainings();
  const { t } = useLanguage();

  return (
    <div className="space-y-10 fade-in">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
          {t.dashboard.welcome}, {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t.dashboard.subtitle}
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-[#2a7a8a] to-[#1E4D5C] p-6 sm:p-8 space-y-5 shadow-md relative overflow-hidden" data-testid="panel-create-training">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="60" y="20" width="680" height="260" rx="90" ry="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />

          <line x1="400" y1="20" x2="400" y2="280" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <circle cx="400" cy="150" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <circle cx="400" cy="150" r="3" fill="rgba(255,255,255,0.06)" />

          <line x1="180" y1="20" x2="180" y2="280" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="6 4" />
          <line x1="620" y1="20" x2="620" y2="280" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="6 4" />

          <circle cx="150" cy="90" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <circle cx="150" cy="90" r="3" fill="rgba(255,255,255,0.04)" />
          <circle cx="650" cy="90" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <circle cx="650" cy="90" r="3" fill="rgba(255,255,255,0.04)" />
          <circle cx="150" cy="210" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <circle cx="150" cy="210" r="3" fill="rgba(255,255,255,0.04)" />
          <circle cx="650" cy="210" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
          <circle cx="650" cy="210" r="3" fill="rgba(255,255,255,0.04)" />

          <path d="M 80 60 A 30 30 0 0 1 100 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="90" y1="35" x2="90" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <path d="M 720 60 A 30 30 0 0 0 700 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="710" y1="35" x2="710" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 text-center space-y-2 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-white" data-testid="text-create-heading">
            {(t.dashboard as any).createHeading || "Let's go!"}
          </h2>
          <p className="text-sm text-white/70 leading-relaxed" data-testid="text-create-motivation">
            {(t.dashboard as any).createMotivation}
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Link href="/create-training?mode=wizard" className="flex-1">
            <button className="w-full flex items-center gap-3 rounded-md bg-white/10 backdrop-blur border border-white/15 px-4 py-3 text-left transition-colors hover:bg-white/20 group cursor-pointer" data-testid="button-new-wizard">
              <div className="p-2 rounded-md bg-white/15 text-white shrink-0">
                <Wand2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm block text-amber-300">{(t.dashboard as any).createWizard}</span>
                <span className="text-xs text-white/60">{(t.dashboard as any).createWizardDesc}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
            </button>
          </Link>
          <Link href="/create-training?mode=quick" className="flex-1">
            <button className="w-full flex items-center gap-3 rounded-md bg-white/10 backdrop-blur border border-white/15 px-4 py-3 text-left transition-colors hover:bg-white/20 group cursor-pointer" data-testid="button-new-quick">
              <div className="p-2 rounded-md bg-white/15 text-white shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm block text-amber-300">{(t.dashboard as any).createQuick}</span>
                <span className="text-xs text-white/60">{(t.dashboard as any).createQuickDesc}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
            </button>
          </Link>
        </div>
      </div>

      <CoachChat />

      <InsightCard />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">{t.dashboard.recentSessions}</h2>
          <Link href="/history">
            <Button variant="ghost" className="text-sm text-muted-foreground" data-testid="button-view-all">
              {t.dashboard.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {trainingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-44 rounded-md" />
            ))}
          </div>
        ) : (!trainings || trainings.length === 0) ? (
          <div className="py-12 text-center bg-muted/30 rounded-md border border-dashed border-border">
            <p className="text-muted-foreground text-sm mb-3" data-testid="text-no-sessions">{t.dashboard.noSessions}</p>
            <Link href="/create-training">
              <Button variant="outline" data-testid="button-create-first">{t.dashboard.createFirst}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const grouped: Record<string, any[]> = {};
              trainings.forEach((tr: any) => {
                const cat = tr.category || (tr.inputParams as any)?.category || "—";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(tr);
              });
              const order = ["<U6", "U10", "U12", "U15", "U18", ">U18"];
              const sortedKeys = Object.keys(grouped).sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia === -1 && ib === -1) return a.localeCompare(b);
                if (ia === -1) return 1;
                if (ib === -1) return -1;
                return ia - ib;
              });
              return sortedKeys.map(cat => (
                <CategoryGroup key={cat} category={cat} items={grouped[cat]} />
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
