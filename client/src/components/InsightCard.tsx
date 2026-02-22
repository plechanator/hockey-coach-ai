import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Brain, TrendingUp, TrendingDown, Lightbulb, RefreshCw, Target,
  ChevronDown, ChevronUp, Gauge
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = ["<U6", "U10", "U12", "U15", "U18", ">U18"];

export function InsightCard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);

  const catParam = category === "all" ? "" : `?category=${encodeURIComponent(category)}`;

  const { data: insight, isLoading } = useQuery({
    queryKey: ["/api/insights", category],
    queryFn: async () => {
      const res = await fetch(`/api/insights${catParam}`);
      if (!res.ok) throw new Error("Failed to fetch insight");
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/insights/generate", {
        category: category === "all" ? null : category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights", category] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  const metrics = insight?.metrics as any;

  return (
    <Card className="p-5 overflow-visible" data-testid="card-insight-engine">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-accent/8">
            <Brain className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" data-testid="text-insight-title">
              {t.insights.title}
            </h3>
            {insight?.generatedAt && (
              <p className="text-xs text-muted-foreground">
                {t.insights.lastGenerated}: {format(new Date(insight.generatedAt), "MMM d, HH:mm")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-28" data-testid="select-insight-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.calendar.allCategories}</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="default"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-insight"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Brain className="w-4 h-4 mr-1.5" />
            )}
            {generateMutation.isPending ? t.insights.generating : t.insights.generate}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !insight ? (
        <div className="py-8 text-center">
          <Brain className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm" data-testid="text-no-insights">
            {t.insights.noInsights}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-muted/40 p-4 rounded-md">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> {t.insights.summary}
            </h4>
            <p className="text-sm leading-relaxed" data-testid="text-insight-summary">{insight.summary}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {t.insights.basedOn} {insight.trainingCount} {t.insights.trainings}
              </Badge>
              {metrics?.stabilityIndex !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  <Gauge className="w-3 h-3 mr-1" />
                  {t.insights.stabilityIndex}: {metrics.stabilityIndex}%
                </Badge>
              )}
              {metrics?.drillGameRatio !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {t.insights.drillGameRatio}: {metrics.drillGameRatio}%
                </Badge>
              )}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground py-1"
            data-testid="button-toggle-insight-details"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? t.insights.lessDetails : t.insights.moreDetails}
          </button>

          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 slide-up">
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {t.insights.strengths}
                </h4>
                <ul className="space-y-1">
                  {insight.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> {t.insights.weaknesses}
                </h4>
                <ul className="space-y-1">
                  {insight.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> {t.insights.recommendations}
                </h4>
                <ul className="space-y-1">
                  {insight.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
