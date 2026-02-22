import { useState } from "react";
import { useTraining, useDeleteTraining } from "@/hooks/use-trainings";
import { useRoute, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Clock, Users, Activity, Share2, Printer, Trash2, ChevronLeft, ArrowRight,
  RefreshCw, Edit, X, Star, Heart, Ban
} from "lucide-react";
import { format } from "date-fns";
import { RinkDrawer } from "@/components/RinkDrawer";
import { DrillDiagram } from "@/components/DrillDiagram";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function TrainingDetails() {
  const [, params] = useRoute("/training/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: training, isLoading } = useTraining(id);
  const deleteTraining = useDeleteTraining();

  const { t } = useLanguage();
  const [removedStations, setRemovedStations] = useState<number[]>([]);
  const [modifyingStation, setModifyingStation] = useState<number | null>(null);
  const [modifyFeedback, setModifyFeedback] = useState("");
  const [regeneratingStation, setRegeneratingStation] = useState<number | null>(null);
  const [drillRatings, setDrillRatings] = useState<Record<string, number>>({});

  if (isLoading) return <TrainingSkeleton />;
  if (!training) return <div data-testid="text-not-found">{t.training.notFound}</div>;

  const content = training.content as any;

  if (content?.pending === true) {
    if (content?.error) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4 text-center space-y-4">
          <Card className="p-8">
            <div className="text-destructive mb-4">
              <Activity className="w-10 h-10 mx-auto" />
            </div>
            <h2 className="text-lg font-bold mb-2" data-testid="text-generation-error">
              {(t as any).training?.generationFailed || "Training generation failed"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{content.message || "Please try again"}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/trainings/:id", id] })} data-testid="button-retry-generation">
              <RefreshCw className="w-4 h-4 mr-2" /> {(t as any).training?.retryGeneration || "Try Again"}
            </Button>
          </Card>
        </div>
      );
    }
    return <TrainingSkeleton />;
  }

  const handleDelete = async () => {
    if (confirm(t.training.confirmDelete)) {
      await deleteTraining.mutateAsync(id);
      setLocation("/");
    }
  };

  const handleRegenerate = async (stationIndex: number, feedback?: string) => {
    setRegeneratingStation(stationIndex);
    try {
      await apiRequest("POST", `/api/trainings/${id}/regenerate-station`, { stationIndex, feedback });
      await queryClient.invalidateQueries({ queryKey: ["/api/trainings/:id", id] });
      toast({ title: t.training.stationRegenerated, description: t.training.stationRegeneratedDesc });
      setModifyingStation(null);
      setModifyFeedback("");
    } catch (error: any) {
      toast({ title: t.training.regenerationFailed, description: error.message || t.common.error, variant: "destructive" });
    } finally {
      setRegeneratingStation(null);
    }
  };

  const handleRemoveStation = (stationIndex: number) => {
    setRemovedStations((prev) => [...prev, stationIndex]);
  };

  const handleDrillRate = async (drill: any, rating: number) => {
    const drillId = drill.drill_id || `drill_${id}_${drill.station_id || 0}`;
    setDrillRatings(prev => ({ ...prev, [drillId]: rating }));
    try {
      await apiRequest("POST", "/api/drill-feedback", {
        drillId,
        title: drill.title,
        description: drill.description,
        category: (training.inputParams as any)?.category,
        rating,
        focusTags: drill.focus_tags || [],
        timesUsed: 1,
      });
    } catch { /* silent */ }
  };

  const handleDrillFavorite = async (drill: any) => {
    const drillId = drill.drill_id || `drill_${id}_${drill.station_id || 0}`;
    try {
      await apiRequest("POST", "/api/drill-feedback", {
        drillId,
        title: drill.title,
        description: drill.description,
        category: (training.inputParams as any)?.category,
        favorite: true,
        focusTags: drill.focus_tags || [],
      });
      toast({ title: t.training.addedToFavorites });
    } catch { /* silent */ }
  };

  const handleDrillBan = async (drill: any) => {
    const drillId = drill.drill_id || `drill_${id}_${drill.station_id || 0}`;
    try {
      await apiRequest("POST", "/api/drill-feedback", {
        drillId,
        title: drill.title,
        description: drill.description,
        category: (training.inputParams as any)?.category,
        banned: true,
        focusTags: drill.focus_tags || [],
      });
      toast({ title: t.training.drillBanned, description: t.training.drillBannedDesc });
    } catch { /* silent */ }
  };

  const getKeyPoints = (item: any) => {
    if (!item) return null;
    return item.key_points || item.keyPoints || null;
  };

  const visibleMain = content.main?.filter((_: any, idx: number) => !removedStations.includes(idx)) || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-8">
        <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" /> {t.training.backToDashboard}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setLocation(`/training/${id}/print`)} data-testid="button-print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-share">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} data-testid="button-delete">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-8 mb-8" data-testid="card-training-header">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex gap-2 flex-wrap mb-2">
              <Badge variant="secondary" data-testid="badge-methodology">
                {training.methodology}
              </Badge>
              <Badge variant="outline" data-testid="badge-difficulty">{training.difficulty}</Badge>
            </div>
            <h1 className="text-2xl font-semibold" data-testid="text-training-title">{training.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm" data-testid="text-training-date">
              {t.training.generatedOn} {training.date ? format(new Date(training.date), "MMMM do, yyyy") : "N/A"}
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> {t.training.duration}</span>
              <span className="font-bold text-lg" data-testid="text-duration">{training.duration} min</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-4 h-4" /> {t.training.intensity}</span>
              <span className="font-bold text-lg" data-testid="text-intensity">{t.training.high}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {training.focus?.map((tag: string, i: number) => (
            <Badge key={i} variant="secondary" data-testid={`badge-focus-${i}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mb-8">
        <RinkDrawer
          iceConfig={training.iceConfig || "Full Ice"}
          stations={training.stationCount || 1}
          stationData={content.main}
        />
      </div>

      <div className="space-y-6">
        <Card className="p-6 phase-warmup phase-warmup-bg" data-testid="card-warmup">
          <div className="flex justify-between items-center gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <span className="phase-warmup-dot" />
              <h3 className="font-bold text-lg">{content.warmup?.title || t.training.warmup}</h3>
            </div>
            <Badge variant="outline">{content.warmup?.duration || "10 min"}</Badge>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm mb-3">{content.warmup?.description || t.training.noDescription}</p>
              {(() => {
                const kp = getKeyPoints(content.warmup);
                if (!kp || kp.length === 0) return null;
                return (
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.training.coachingPoints}</h4>
                    <ul className="space-y-1">
                      {kp.map((point: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-accent flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
            {content.warmup?.diagram_elements && content.warmup.diagram_elements.length > 0 && (
              <div className="w-full md:w-48 flex-shrink-0 border rounded-md overflow-hidden bg-background flex justify-center" data-testid="diagram-warmup">
                <DrillDiagram
                  elements={content.warmup.diagram_elements}
                  width={180}
                  height={235}
                  rinkView={content.warmup.rink_view || "full"}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="stick-divider" />

        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="phase-main-dot" /> {t.training.mainPart}
          </h3>
          {visibleMain.map((drill: any, displayIdx: number) => {
            const originalIdx = content.main.indexOf(drill);
            const isModifying = modifyingStation === originalIdx;
            const isRegenerating = regeneratingStation === originalIdx;
            const drillId = drill.drill_id || `drill_${id}_${drill.station_id || originalIdx}`;
            const currentRating = drillRatings[drillId] || 0;

            return (
              <Card key={originalIdx} className="p-6 phase-main phase-main-bg" data-testid={`card-station-${originalIdx}`}>
                <div className="flex justify-between items-start gap-2 flex-wrap mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="puck-icon text-white jersey-number text-sm">{originalIdx + 1}</span>
                      <h4 className="font-bold text-lg">{drill.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{drill.duration}</Badge>
                      {drill.type && (
                        <Badge variant="secondary" data-testid={`badge-type-${originalIdx}`}>{drill.type}</Badge>
                      )}
                      {drill.focus_tags?.map((tag: string, tagIdx: number) => (
                        <Badge key={tagIdx} variant="secondary" data-testid={`badge-focus-tag-${originalIdx}-${tagIdx}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerate(originalIdx)}
                      disabled={isRegenerating}
                      data-testid={`button-regenerate-${originalIdx}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setModifyingStation(isModifying ? null : originalIdx);
                        setModifyFeedback("");
                      }}
                      data-testid={`button-modify-${originalIdx}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStation(originalIdx)}
                      data-testid={`button-remove-${originalIdx}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-3">
                  <p className="text-sm flex-1">{drill.description || t.training.noDescription}</p>
                  {drill.diagram_elements && drill.diagram_elements.length > 0 && (
                    <div className="w-full md:w-48 flex-shrink-0 border rounded-md overflow-hidden bg-background flex justify-center" data-testid={`diagram-station-${originalIdx}`}>
                      <DrillDiagram
                        elements={drill.diagram_elements}
                        width={180}
                        height={235}
                        rinkView={drill.rink_view || "full"}
                        zoneArea={drill.zone_area}
                        stationIndex={originalIdx}
                        totalStations={content.main?.length || 1}
                      />
                    </div>
                  )}
                </div>

                {isModifying && (
                  <div className="flex gap-2 mt-3" data-testid={`modify-input-area-${originalIdx}`}>
                    <Input
                      placeholder={t.training.modifyPlaceholder}
                      value={modifyFeedback}
                      onChange={(e) => setModifyFeedback(e.target.value)}
                      data-testid={`input-modify-${originalIdx}`}
                    />
                    <Button
                      variant="default"
                      onClick={() => handleRegenerate(originalIdx, modifyFeedback)}
                      disabled={!modifyFeedback.trim() || isRegenerating}
                      data-testid={`button-submit-modify-${originalIdx}`}
                    >
                      {t.training.submit}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1" data-testid={`rating-stars-${originalIdx}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleDrillRate(drill, star)}
                        className="p-0.5"
                        data-testid={`button-rate-${originalIdx}-${star}`}
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            star <= currentRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDrillFavorite(drill)}
                      data-testid={`button-favorite-${originalIdx}`}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDrillBan(drill)}
                      data-testid={`button-ban-${originalIdx}`}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="stick-divider" />

        <Card className="p-6 phase-finish phase-finish-bg" data-testid="card-finish">
          <div className="flex justify-between items-center gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <span className="phase-finish-dot" />
              <h3 className="font-bold text-lg">{content.finish?.title || t.training.finish}</h3>
            </div>
            <Badge variant="outline">{content.finish?.duration || "5 min"}</Badge>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm mb-3">{content.finish?.description || t.training.noDescription}</p>
              {(() => {
                const kp = getKeyPoints(content.finish);
                if (!kp || kp.length === 0) return null;
                return (
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.training.coachingPoints}</h4>
                    <ul className="space-y-1">
                      {kp.map((point: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-accent flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
            {content.finish?.diagram_elements && content.finish.diagram_elements.length > 0 && (
              <div className="w-full md:w-48 flex-shrink-0 border rounded-md overflow-hidden bg-background flex justify-center" data-testid="diagram-finish">
                <DrillDiagram
                  elements={content.finish.diagram_elements}
                  width={180}
                  height={235}
                  rinkView={content.finish.rink_view || "full"}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TrainingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
