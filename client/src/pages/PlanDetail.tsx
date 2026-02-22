import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Calendar, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import type { TrainingPlan, Training } from "@shared/schema";

export default function PlanDetail() {
  const [, params] = useRoute("/plans/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const planT = (t as any).plan || {};

  const { data: plan, isLoading } = useQuery<TrainingPlan>({
    queryKey: ["/api/plans", id],
  });

  const { data: trainings } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!plan) {
    return <div className="text-center py-16">{planT.notFound || "Plan not found"}</div>;
  }

  const content = plan.content as any;
  const weeklyPlan = content?.weeks || [];
  const trainingIds: number[] = content?.trainingIds || [];

  const planTrainings = trainings?.filter(t => trainingIds.includes(t.id)) || [];

  const getTrainingsForWeek = (weekIdx: number) => {
    const weekTrainingIds = weeklyPlan[weekIdx]?.trainingIds || [];
    return planTrainings.filter(t => weekTrainingIds.includes(t.id));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 fade-in">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4" data-testid="button-back">
        <ChevronLeft className="w-4 h-4 mr-1" /> {t.training.backToDashboard}
      </Button>

      <Card className="p-6 mb-6" data-testid="card-plan-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display mb-2" data-testid="text-plan-title">{plan.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(plan.startDate), "MMM d")} - {format(new Date(plan.endDate), "MMM d, yyyy")}</span>
            </div>
            {plan.goals && <p className="text-sm mt-2">{plan.goals}</p>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent">{trainingIds.length}</div>
            <div className="text-xs text-muted-foreground">{planT.trainingsLabel || "trainings"}</div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {weeklyPlan.map((week: any, weekIdx: number) => {
          const weekTrainings = getTrainingsForWeek(weekIdx);
          return (
            <Card key={weekIdx} className="p-5" data-testid={`card-plan-week-${weekIdx}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Badge variant="secondary">{planT.weekLabel || "Week"} {weekIdx + 1}</Badge>
                  <span className="text-xs text-muted-foreground">{week.focus?.join(", ")}</span>
                </h3>
                <span className="text-xs text-muted-foreground">
                  {weekTrainings.filter(t => t.status === "completed").length}/{weekTrainings.length} {planT.completedLabel || "completed"}
                </span>
              </div>

              <div className="space-y-2">
                {weekTrainings.length > 0 ? weekTrainings.map((tr) => (
                  <Link key={tr.id} href={`/training/${tr.id}`}>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`plan-training-${tr.id}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {tr.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tr.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {tr.trainingDate || ""} {tr.startTime ? `${tr.startTime}` : ""} | {tr.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {tr.focus?.slice(0, 2).map((f, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-2">{planT.noTrainingsInWeek || "No trainings in this week"}</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
