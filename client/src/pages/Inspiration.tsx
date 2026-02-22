import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { DrillDiagram, DRILL_LIBRARY, DRILL_CATEGORIES, RINK_VIEW_OPTIONS } from "@/components/DrillDiagram";
import type { DrillDiagramData, RinkView } from "@/components/DrillDiagram";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Printer, X, Lightbulb, Filter, LayoutGrid } from "lucide-react";

export default function Inspiration() {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDrill, setSelectedDrill] = useState<DrillDiagramData | null>(null);
  const [showRinkViews, setShowRinkViews] = useState(false);

  const filtered = DRILL_LIBRARY.filter((drill) => {
    const matchCat = activeCategory === "all" || drill.category === activeCategory;
    if (!matchCat) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const title = language === "cz" ? (drill.titleCz || drill.title) : drill.title;
    const desc = language === "cz" ? (drill.descriptionCz || drill.description || "") : (drill.description || "");
    return title.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || drill.focusTags?.some(tag => tag.toLowerCase().includes(s));
  });

  const drillTitle = (d: DrillDiagramData) => language === "cz" ? (d.titleCz || d.title) : d.title;
  const drillDesc = (d: DrillDiagramData) => language === "cz" ? (d.descriptionCz || d.description) : d.description;

  const rinkViewLabel = (rv: RinkView) => {
    const opt = RINK_VIEW_OPTIONS.find(o => o.id === rv);
    if (!opt) return rv;
    return language === "cz" ? opt.labelCz : opt.labelEn;
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="inspiration-page">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-7 h-7 text-accent" />
          <h1 className="text-2xl font-bold font-display" data-testid="text-inspiration-title">
            {t.inspiration.title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t.inspiration.subtitle}
        </p>
      </div>

      <div className="mb-6">
        <Button
          variant={showRinkViews ? "default" : "outline"}
          size="sm"
          onClick={() => setShowRinkViews(!showRinkViews)}
          data-testid="button-toggle-rink-views"
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          {t.inspiration.rinkViews}
        </Button>
      </div>

      {showRinkViews && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t.inspiration.availableRinkViews}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="rink-views-grid">
              {RINK_VIEW_OPTIONS.map((rv) => (
                <div key={rv.id} className="text-center" data-testid={`rink-view-${rv.id}`}>
                  <div className="border rounded-md overflow-hidden bg-background mb-1.5 p-1">
                    <DrillDiagram elements={[]} width={140} height={180} rinkView={rv.id} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {language === "cz" ? rv.labelCz : rv.labelEn}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.inspiration.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-drills"
          />
        </div>
        {search && (
          <Button variant="ghost" size="icon" onClick={() => setSearch("")} data-testid="button-clear-search">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6" data-testid="category-filters">
        {DRILL_CATEGORIES.map((cat) => {
          const label = language === "cz" ? cat.labelCz : cat.labelEn;
          const isActive = activeCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`filter-category-${cat.id}`}
            >
              {cat.id === "all" && <Filter className="w-3 h-3 mr-1" />}
              {label}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mb-4" data-testid="text-drill-count">
        {filtered.length} {t.inspiration.drillsFound}
      </p>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground" data-testid="text-no-results">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t.inspiration.noResults}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((drill) => (
          <Card
            key={drill.id}
            className="cursor-pointer hover-elevate overflow-visible"
            onClick={() => setSelectedDrill(drill)}
            data-testid={`card-drill-${drill.id}`}
          >
            <CardContent className="p-3">
              <div className="mb-2 border rounded-md overflow-hidden bg-background flex justify-center">
                <DrillDiagram
                  elements={drill.elements}
                  width={180}
                  height={235}
                  rinkView={drill.rinkView || "full"}
                />
              </div>
              <h3 className="font-semibold text-xs mb-1 line-clamp-2" data-testid={`text-drill-title-${drill.id}`}>
                {drillTitle(drill)}
              </h3>
              <div className="flex flex-wrap gap-1">
                {drill.source && (
                  <Badge variant="default" className="text-[10px]">{drill.source}</Badge>
                )}
                {drill.ageGroup && (
                  <Badge variant="outline" className="text-[10px]">{drill.ageGroup}</Badge>
                )}
                <Badge variant="secondary" className="text-[10px]">
                  {rinkViewLabel(drill.rinkView || "full")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 mb-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t.inspiration.legendTitle}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { sym: "player", en: "Player", cz: "Hráč", svgEl: <><circle cx="12" cy="12" r="7" fill="none" stroke="#2563EB" strokeWidth={2} /><text x="12" y="15" textAnchor="middle" fontSize="8" fill="#2563EB" fontWeight="700">A</text></> },
                { sym: "defender", en: "Defender", cz: "Obránce", svgEl: <polygon points="12,5 5,19 19,19" fill="none" stroke="#DC2626" strokeWidth={2} /> },
                { sym: "goalie", en: "Goalie", cz: "Brankář", svgEl: <><rect x="5" y="5" width="14" height="14" rx={2} fill="none" stroke="#2563EB" strokeWidth={2} /><text x="12" y="15" textAnchor="middle" fontSize="9" fill="#2563EB" fontWeight="700">G</text></> },
                { sym: "coach", en: "Coach", cz: "Trenér", svgEl: <polygon points="12,5 5,19 19,19" fill="#059669" stroke="#059669" strokeWidth={1} opacity={0.7} /> },
                { sym: "pass", en: "Pass", cz: "Přihrávka", svgEl: <><line x1="2" y1="12" x2="20" y2="12" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 2" /><path d="M18,9 L22,12 L18,15" stroke="#2563EB" strokeWidth={2} fill="none" /></> },
                { sym: "shot", en: "Shot", cz: "Střela", svgEl: <><line x1="2" y1="12" x2="20" y2="12" stroke="#DC2626" strokeWidth={3} /><path d="M17,8 L22,12 L17,16" stroke="#DC2626" strokeWidth={3} fill="#DC2626" /></> },
                { sym: "skating", en: "Skating", cz: "Bruslení", svgEl: <><line x1="2" y1="12" x2="20" y2="12" stroke="#2563EB" strokeWidth={2} /><path d="M18,9 L22,12 L18,15" stroke="#2563EB" strokeWidth={2} fill="none" /></> },
                { sym: "skatingPuck", en: "With puck", cz: "S pukem", svgEl: <><path d="M2,12 L6,8 L10,16 L14,8 L18,12 L22,12" stroke="#2563EB" strokeWidth={2} fill="none" /><path d="M20,9 L24,12 L20,15" stroke="#2563EB" strokeWidth={2} fill="none" /></> },
                { sym: "backward", en: "Backward", cz: "Pozadu", svgEl: <><path d="M2,12 L5,8 L7,16 L9,8 L11,16 L13,8 L15,16 L18,12" stroke="#2563EB" strokeWidth={1.5} fill="none" /><path d="M16,9 L20,12 L16,15" stroke="#2563EB" strokeWidth={2} fill="none" /></> },
                { sym: "pivot", en: "Pivot/Turn", cz: "Pivot/Obrat", svgEl: <><path d="M6,18 A7,7 0 1,1 18,18" stroke="#2563EB" strokeWidth={2} fill="none" /><path d="M15,16 L18,18 L15,20" stroke="#2563EB" strokeWidth={2} fill="none" /></> },
                { sym: "cone", en: "Cone", cz: "Kužel", svgEl: <polygon points="12,5 6,19 18,19" fill="#F59E0B" stroke="#D97706" strokeWidth={1} /> },
                { sym: "puck", en: "Puck", cz: "Puk", svgEl: <circle cx="12" cy="12" r="4" fill="#111" /> },
              ].map(item => (
                <div key={item.sym} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0">{item.svgEl}</svg>
                  <span className="text-xs text-muted-foreground">{language === "cz" ? item.cz : item.en}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedDrill} onOpenChange={() => setSelectedDrill(null)}>
        {selectedDrill && (
          <DialogContent className="max-w-lg" aria-describedby="drill-detail-desc">
            <DialogHeader>
              <DialogTitle className="font-display text-base" data-testid="text-drill-detail-title">
                {drillTitle(selectedDrill)}
              </DialogTitle>
            </DialogHeader>
            <div className="border rounded-md overflow-hidden bg-background mb-3 flex justify-center">
              <DrillDiagram
                elements={selectedDrill.elements}
                width={320}
                height={415}
                rinkView={selectedDrill.rinkView || "full"}
                showLegend
              />
            </div>
            <div className="space-y-3">
              <p id="drill-detail-desc" className="text-sm text-muted-foreground" data-testid="text-drill-detail-desc">
                {drillDesc(selectedDrill)}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDrill.source && (
                  <Badge variant="default">{selectedDrill.source}</Badge>
                )}
                {selectedDrill.ageGroup && (
                  <Badge variant="outline">{selectedDrill.ageGroup}</Badge>
                )}
                <Badge variant="secondary">
                  {rinkViewLabel(selectedDrill.rinkView || "full")}
                </Badge>
                {selectedDrill.focusTags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const printWin = window.open("", "_blank");
                    if (!printWin) return;
                    const diagEl = document.querySelectorAll('[data-testid="drill-diagram"]');
                    const svg = diagEl[diagEl.length - 1];
                    printWin.document.write(`
                      <html><head><title>${drillTitle(selectedDrill)}</title>
                      <style>body{font-family:Inter,sans-serif;padding:20mm;} h1{font-size:14pt;margin-bottom:6px;} .desc{font-size:10pt;color:#555;margin-bottom:12px;} svg{max-width:100%;height:auto;}</style>
                      </head><body>
                      <h1>${drillTitle(selectedDrill)}</h1>
                      <p class="desc">${drillDesc(selectedDrill) || ""}</p>
                      ${svg?.outerHTML || ""}
                      </body></html>
                    `);
                    printWin.document.close();
                    setTimeout(() => printWin.print(), 300);
                  }}
                  data-testid="button-print-drill"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  {t.inspiration.printDrill}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
