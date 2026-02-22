import { useTraining } from "@/hooks/use-trainings";
import { useRoute, useLocation } from "wouter";
import { RinkDrawer, LAYOUT_TEMPLATES } from "@/components/RinkDrawer";
import { DrillDiagram } from "@/components/DrillDiagram";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export default function PrintTraining() {
  const [, params] = useRoute("/training/:id/print");
  const id = parseInt(params?.id || "0");
  const { data: training, isLoading } = useTraining(id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return <div className="p-8 text-center">{t.print.loginRequired}</div>;
  }

  if (isLoading) return <div className="p-8 text-center">{t.common.loading}</div>;
  if (!training) return <div className="p-8 text-center">{t.training.notFound}</div>;

  const content = training.content as any;
  const inputParams = training.inputParams as any;
  const visibleMain = content.main || [];

  const layoutType = inputParams?.layoutType;
  const customCoords = inputParams?.customLayoutCoordinates;
  const layoutZones = customCoords || (layoutType && LAYOUT_TEMPLATES[layoutType]?.zones) || undefined;

  return (
    <>
      <div className="print-toolbar" data-testid="print-toolbar">
        <Button variant="ghost" onClick={() => setLocation(`/training/${id}`)} data-testid="button-back-to-training">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t.print.back}
        </Button>
        <Button onClick={() => window.print()} data-testid="button-print-action">
          <Printer className="w-4 h-4 mr-2" /> {t.print.printButton}
        </Button>
      </div>

      <div className="print-page" data-testid="print-training">
        <div className="print-header">
          <div className="print-header-top">
            <div>
              <h1 className="print-title" data-testid="print-title">{training.title}</h1>
              <p className="print-subtitle">
                {training.methodology} | {inputParams?.category || "N/A"} | {training.duration} min
              </p>
            </div>
            <div className="print-meta">
              <p>{training.date ? format(new Date(training.date), "dd.MM.yyyy") : ""}</p>
              <p>{inputParams?.playersCount || 0} + {inputParams?.goaliesCount || 0} GK</p>
            </div>
          </div>

          <div className="print-focus-tags">
            {training.focus?.map((tag: string, i: number) => (
              <span key={i} className="print-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="print-rink-section">
          <RinkDrawer
            iceConfig={training.iceConfig || "Full Ice"}
            stations={training.stationCount || 1}
            stationData={content.main}
            layoutType={layoutType}
            layoutZones={layoutZones}
            width={700}
            height={320}
            printMode
          />
        </div>

        <div className="print-section">
          <div className="print-phase-header print-phase-warmup">{t.print.warmupHeader}</div>
          <div className="print-phase-content">
            <div className="print-phase-title-row">
              <strong>{content.warmup?.title || t.print.warmupDefault}</strong>
              <span className="print-duration">{content.warmup?.duration || "10 min"}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <p className="print-description" style={{ flex: 1 }}>{content.warmup?.description}</p>
              {content.warmup?.diagram_elements && content.warmup.diagram_elements.length > 0 && (
                <div style={{ width: 140, flexShrink: 0, border: "1px solid #ddd", borderRadius: 4 }}>
                  <DrillDiagram elements={content.warmup.diagram_elements} width={140} height={180} rinkView={content.warmup.rink_view || "full"} printMode />
                </div>
              )}
            </div>
            {(content.warmup?.key_points || content.warmup?.keyPoints || []).length > 0 && (
              <div className="print-key-points">
                <span className="print-kp-label">{t.print.keyPoints}</span>
                <ul>
                  {(content.warmup?.key_points || content.warmup?.keyPoints || []).map((kp: string, i: number) => (
                    <li key={i}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="print-section">
          <div className="print-phase-header print-phase-main">{t.print.mainPartHeader}</div>
          {visibleMain.map((station: any, i: number) => (
            <div key={i} className="print-station">
              <div className="print-station-header">
                <span className="print-station-number">{station.station_id || i + 1}</span>
                <div className="print-station-info">
                  <strong>{station.title}</strong>
                  <span className="print-station-meta">
                    {station.type} | {station.duration} min | {station.zone_label || `${t.training.station} ${i + 1}`}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p className="print-description">{station.description}</p>
                  {station.focus_tags?.length > 0 && (
                    <div className="print-focus-inline">
                      {station.focus_tags.map((tag: string, j: number) => (
                        <span key={j} className="print-tag-small">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {station.diagram_elements && station.diagram_elements.length > 0 && (
                  <div style={{ width: 140, flexShrink: 0, border: "1px solid #ddd", borderRadius: 4 }}>
                    <DrillDiagram elements={station.diagram_elements} width={140} height={180} rinkView={station.rink_view || "full"} zoneArea={station.zone_area} stationIndex={i} totalStations={content.main?.length || 1} printMode />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="print-section">
          <div className="print-phase-header print-phase-finish">{t.print.finishHeader}</div>
          <div className="print-phase-content">
            <div className="print-phase-title-row">
              <strong>{content.finish?.title || t.print.coolDownDefault}</strong>
              <span className="print-duration">{content.finish?.duration || "5 min"}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <p className="print-description" style={{ flex: 1 }}>{content.finish?.description}</p>
              {content.finish?.diagram_elements && content.finish.diagram_elements.length > 0 && (
                <div style={{ width: 140, flexShrink: 0, border: "1px solid #ddd", borderRadius: 4 }}>
                  <DrillDiagram elements={content.finish.diagram_elements} width={140} height={180} rinkView={content.finish.rink_view || "full"} printMode />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="print-footer">
          <p>{t.print.footer}</p>
          <p className="print-notes-area">{t.print.notesArea} _____________________________________</p>
        </div>
      </div>
    </>
  );
}
