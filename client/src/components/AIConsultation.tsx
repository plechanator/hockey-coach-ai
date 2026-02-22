import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, CheckCircle2, AlertTriangle, TrendingUp,
  Lightbulb, Shield, Brain, Zap, Dumbbell, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultationResult {
  overall_rating: "excellent" | "good" | "needs_attention";
  summary: string;
  strengths: string[];
  improvements: string[];
  impact: {
    physical: string;
    technical: string;
    tactical: string;
    mental: string;
  };
  tips: string[];
}

interface AIConsultationProps {
  type: "training" | "plan";
  config: Record<string, any>;
}

const RATING_CONFIG = {
  excellent: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  good: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  needs_attention: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

function normalizeResult(data: any): ConsultationResult {
  return {
    overall_rating: ["excellent", "good", "needs_attention"].includes(data?.overall_rating) ? data.overall_rating : "good",
    summary: data?.summary || "",
    strengths: Array.isArray(data?.strengths) ? data.strengths : [],
    improvements: Array.isArray(data?.improvements) ? data.improvements : [],
    impact: {
      physical: data?.impact?.physical || "-",
      technical: data?.impact?.technical || "-",
      tactical: data?.impact?.tactical || "-",
      mental: data?.impact?.mental || "-",
    },
    tips: Array.isArray(data?.tips) ? data.tips : [],
  };
}

export function AIConsultation({ type, config }: AIConsultationProps) {
  const { t, language } = useLanguage();
  const ct = (t as any).consultation || {};
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<ConsultationResult | null>(null);

  const consultation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai-consultation", {
        type,
        config,
        language,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(normalizeResult(data));
      setExpanded(true);
    },
  });

  const ratingStyle = result ? RATING_CONFIG[result.overall_rating] || RATING_CONFIG.good : null;

  const ratingLabel = result
    ? result.overall_rating === "excellent"
      ? ct.ratingExcellent || "Excellent"
      : result.overall_rating === "good"
        ? ct.ratingGood || "Good"
        : ct.ratingNeedsAttention || "Needs Attention"
    : "";

  if (!result && !consultation.isPending) {
    return (
      <Card className="p-5 border-dashed" data-testid="card-ai-consultation-prompt">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">{ct.title || "AI Coaching Buddy"}</p>
              <p className="text-xs text-muted-foreground">{ct.subtitle || "Get expert AI evaluation of your setup before generating"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => consultation.mutate()}
            data-testid="button-get-consultation"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {ct.getConsultation || "Get AI Evaluation"}
          </Button>
        </div>
      </Card>
    );
  }

  if (consultation.isPending) {
    return (
      <Card className="p-5" data-testid="card-ai-consultation-loading">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <div>
            <p className="font-medium text-sm">{ct.analyzing || "Analyzing your configuration..."}</p>
            <p className="text-xs text-muted-foreground">{ct.analyzingDesc || "AI is evaluating the training parameters and impact"}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (consultation.isError) {
    return (
      <Card className="p-5" data-testid="card-ai-consultation-error">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-muted-foreground">{ct.errorMsg || "Could not generate evaluation. Try again."}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => consultation.mutate()} data-testid="button-retry-consultation">
            {ct.retry || "Retry"}
          </Button>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className={`p-5 ${ratingStyle?.border}`} data-testid="card-ai-consultation-result">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
        data-testid="button-toggle-consultation"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${ratingStyle?.bg} flex items-center justify-center flex-shrink-0`}>
            {result.overall_rating === "excellent" ? (
              <CheckCircle2 className={`w-5 h-5 ${ratingStyle?.color}`} />
            ) : result.overall_rating === "good" ? (
              <TrendingUp className={`w-5 h-5 ${ratingStyle?.color}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${ratingStyle?.color}`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{ct.resultTitle || "AI Evaluation"}</p>
              <Badge variant="secondary" className={ratingStyle?.color}>
                {ratingLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{result.summary}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">{result.summary}</p>

              {result.strengths.length > 0 && (
                <div data-testid="section-strengths">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {ct.strengths || "Strengths"}
                  </p>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1 text-xs flex-shrink-0">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvements.length > 0 && (
                <div data-testid="section-improvements">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> {ct.improvements || "Suggestions"}
                  </p>
                  <ul className="space-y-1">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1 text-xs flex-shrink-0">!</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div data-testid="section-impact">
                <p className="text-xs font-medium text-muted-foreground mb-2">{ct.impactTitle || "Expected Impact"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Dumbbell className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium">{ct.physical || "Physical"}</span>
                      <p className="text-xs text-muted-foreground">{result.impact.physical}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Zap className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium">{ct.technical || "Technical"}</span>
                      <p className="text-xs text-muted-foreground">{result.impact.technical}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium">{ct.tactical || "Tactical"}</span>
                      <p className="text-xs text-muted-foreground">{result.impact.tactical}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Brain className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium">{ct.mental || "Mental"}</span>
                      <p className="text-xs text-muted-foreground">{result.impact.mental}</p>
                    </div>
                  </div>
                </div>
              </div>

              {result.tips.length > 0 && (
                <div data-testid="section-tips">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{ct.tips || "Coach Tips"}</p>
                  <div className="flex flex-col gap-1">
                    {result.tips.map((tip, i) => (
                      <p key={i} className="text-sm text-muted-foreground italic">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); consultation.mutate(); }}
                  data-testid="button-refresh-consultation"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {ct.refresh || "Re-evaluate"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
