import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, ChevronLeft, ChevronRight, CalendarPlus, Sparkles, Plus,
  MessageSquare, ListChecks, Zap, Target, ArrowLeft, Send,
} from "lucide-react";
import { AIConsultation } from "@/components/AIConsultation";
import { motion, AnimatePresence } from "framer-motion";
import type { CoachProfile } from "@shared/schema";

const FOCUS_OPTIONS = [
  "Skating", "Shooting", "Passing", "Stickhandling", "Checking",
  "Positioning", "Tactics", "Power Play", "Penalty Kill",
  "Face-offs", "Transition", "Goaltending", "Conditioning",
];

const METHODOLOGY_OPTIONS = ["Canadian", "Swedish", "American", "Czech", "Hybrid"];
const CATEGORY_OPTIONS = ["<U6", "U10", "U12", "U15", "U18", ">U18"];
const ICE_OPTIONS = ["Full Ice", "Half Ice", "Offensive Zone", "Neutral Zone", "Defensive Zone"];

interface WeekConfig {
  focus: string[];
  notes: string;
}

type CreationMode = "select" | "wizard" | "quick";

function QuickPlanChat() {
  const [prompt, setPrompt] = useState("");
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const planT = (t as any).plan || {};
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateFromPrompt = useMutation({
    mutationFn: async (data: { prompt: string }) => {
      const res = await apiRequest("POST", "/api/plans/generate-from-prompt", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate plan");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({ title: planT.generated || "Plan generated!" });
      setLocation(`/plans/${data.id}`);
    },
    onError: (error: Error) => {
      toast({ title: planT.generateFailed || "Failed to generate plan", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim() || prompt.trim().length < 5 || generateFromPrompt.isPending) return;
    generateFromPrompt.mutate({ prompt: prompt.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examplePrompts = [
    planT.quickExamples?.preseason || "4-week pre-season program for U15, 3x per week, focus on skating and conditioning first, then tactics",
    planT.quickExamples?.skills || "3 weeks of skill development for U12, 2 trainings per week, progressive difficulty",
    planT.quickExamples?.tournament || "2-week tournament prep for U18, 4x per week, game situations and power play",
    planT.quickExamples?.young || "4 weeks for U10, 2x per week, fun activities with basic skills progression",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold" data-testid="text-quick-plan-title">
                {planT.quickTitle || "Describe Your Plan"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {planT.quickSubtitle || "Tell the AI what training plan you need. It will create a structured multi-week plan with individual sessions."}
              </p>
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={planT.quickPlaceholder || "e.g. 4-week plan for U15, 3 trainings per week, start with skating fundamentals and progress to game tactics..."}
              className="resize-none text-base min-h-[120px] pr-14"
              disabled={generateFromPrompt.isPending}
              data-testid="input-plan-prompt"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!prompt.trim() || prompt.trim().length < 5 || generateFromPrompt.isPending}
              className="absolute bottom-3 right-3"
              data-testid="button-plan-send"
            >
              {generateFromPrompt.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {generateFromPrompt.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-md bg-accent/5 border border-accent/20"
            >
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <div>
                <p className="font-medium text-sm">{planT.quickGenerating || "Generating your training plan..."}</p>
                <p className="text-xs text-muted-foreground">{planT.quickGeneratingDesc || "AI is building a complete multi-week plan with individual sessions. This may take a moment."}</p>
              </div>
            </motion.div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              {planT.quickTryThese || "Try these examples"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  disabled={generateFromPrompt.isPending}
                  className="text-left text-sm p-3 rounded-md border border-border bg-card hover-elevate transition-colors"
                  data-testid={`button-plan-example-${i}`}
                >
                  <Zap className="w-3 h-3 text-accent inline mr-2 flex-shrink-0" />
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreatePlan() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const planT = (t as any).plan || {};

  const { data: profile } = useQuery<CoachProfile>({ queryKey: ["/api/coach-profile"] });

  const [mode, setMode] = useState<CreationMode>("select");
  const [step, setStep] = useState(0);
  const [planTitle, setPlanTitle] = useState("");
  const [trainingsPerWeek, setTrainingsPerWeek] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  });
  const [category, setCategory] = useState(profile?.category || "U15");
  const [methodology, setMethodology] = useState(profile?.preferredMethodology || "Hybrid");
  const [iceConfig, setIceConfig] = useState("Full Ice");
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [weekConfigs, setWeekConfigs] = useState<WeekConfig[]>([]);

  const initWeekConfigs = (weeks: number) => {
    setWeekConfigs(Array.from({ length: weeks }, () => ({ focus: ["Skating"], notes: "" })));
  };

  const generatePlan = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/plans/generate", {
        title: planTitle || `${planT.planTitle || "Training Plan"} - ${category}`,
        trainingsPerWeek,
        durationWeeks,
        startDate,
        category,
        methodology,
        iceConfig,
        duration,
        difficulty,
        weekConfigs,
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({ title: planT.generated || "Plan generated!" });
      setLocation(`/plans/${data.id}`);
    },
    onError: () => {
      toast({ title: t.common.error, description: planT.generateFailed || "Failed to generate plan", variant: "destructive" });
    },
  });

  const toggleWeekFocus = (weekIdx: number, focus: string) => {
    setWeekConfigs(prev => {
      const updated = [...prev];
      const week = { ...updated[weekIdx] };
      if (week.focus.includes(focus)) {
        week.focus = week.focus.filter(f => f !== focus);
      } else {
        week.focus = [...week.focus, focus];
      }
      updated[weekIdx] = week;
      return updated;
    });
  };

  const updateWeekNotes = (weekIdx: number, notes: string) => {
    setWeekConfigs(prev => {
      const updated = [...prev];
      updated[weekIdx] = { ...updated[weekIdx], notes };
      return updated;
    });
  };

  const totalTrainings = trainingsPerWeek * durationWeeks;

  const steps = [
    { title: planT.stepBasics || "Plan Basics", subtitle: planT.stepBasicsDesc || "Set the overall plan parameters" },
    { title: planT.stepWeekly || "Weekly Focus", subtitle: planT.stepWeeklyDesc || "Choose focus areas for each week" },
    { title: planT.stepSummary || "Summary", subtitle: planT.stepSummaryDesc || "Review and generate your plan" },
  ];

  const renderModeSelect = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => setMode("quick")}
        className="group p-6 rounded-md border-2 border-border bg-card text-left transition-colors hover-elevate"
        data-testid="button-mode-quick"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{planT.modeQuickTitle || "Quick AI"}</h3>
            <Badge variant="secondary">{planT.modeFast || "Fast"}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {planT.modeQuickDesc || "Describe your plan in your own words. AI will create a structured multi-week program instantly."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-accent" />
          <span>{planT.modeQuickFeature1 || "Natural language input"}</span>
          <span className="text-border">|</span>
          <span>{planT.modeQuickFeature2 || "Smart defaults from Coach DNA"}</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setMode("wizard")}
        className="group p-6 rounded-md border-2 border-border bg-card text-left transition-colors hover-elevate"
        data-testid="button-mode-wizard"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <ListChecks className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{planT.modeWizardTitle || "Step-by-Step"}</h3>
            <Badge variant="secondary">{planT.modePrecise || "Precise"}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {planT.modeWizardDesc || "Set every parameter yourself — duration, focus per week, methodology, and more."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3 text-accent" />
          <span>{planT.modeWizardFeature1 || "Full parameter control"}</span>
          <span className="text-border">|</span>
          <span>{planT.modeWizardFeature2 || "Weekly focus customization"}</span>
        </div>
      </button>
    </div>
  );

  if (mode === "select") {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 fade-in">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4" data-testid="button-back-dashboard">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t.training.backToDashboard}
        </Button>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CalendarPlus className="w-7 h-7 text-accent" />
            <h1 className="text-2xl font-bold font-display" data-testid="text-plan-title">
              {planT.createTitle || "Create Training Plan"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {planT.modeSelectSubtitle || "Choose how you want to create your training plan"}
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderModeSelect()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (mode === "quick") {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 fade-in">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("select")}
            className="mb-4"
            data-testid="button-back-to-modes"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {planT.backToModes || "Back to mode selection"}
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-1" data-testid="text-page-title">
              {planT.quickTitle || "Quick AI Plan"}
            </h1>
            <p className="text-muted-foreground">{planT.quickPageSubtitle || "Describe your plan and let AI handle the rest"}</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key="quick-ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <QuickPlanChat />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setMode("select"); setStep(0); }}
          className="mb-4"
          data-testid="button-back-to-modes"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {planT.backToModes || "Back to mode selection"}
        </Button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CalendarPlus className="w-7 h-7 text-accent" />
            <h1 className="text-2xl font-bold font-display" data-testid="text-plan-title">
              {planT.createTitle || "Create Training Plan"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {planT.createSubtitle || "Plan multiple trainings across weeks with AI-generated sessions"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-muted"}`} />
            <p className={`text-xs mt-1 ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s.title}
            </p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card className="p-6" data-testid="card-step-basics">
          <h2 className="text-lg font-bold mb-4">{steps[0].title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{steps[0].subtitle}</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{planT.title || "Plan Title"}</label>
              <Input
                value={planTitle}
                onChange={e => setPlanTitle(e.target.value)}
                placeholder={planT.titlePlaceholder || "e.g. January Pre-Season Program"}
                data-testid="input-plan-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{planT.trainingsPerWeek || "Trainings per Week"}</label>
                <Select value={String(trainingsPerWeek)} onValueChange={v => setTrainingsPerWeek(Number(v))}>
                  <SelectTrigger data-testid="select-trainings-per-week"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}x / {planT.week || "week"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{planT.durationWeeks || "Duration (Weeks)"}</label>
                <Select value={String(durationWeeks)} onValueChange={v => { setDurationWeeks(Number(v)); initWeekConfigs(Number(v)); }}>
                  <SelectTrigger data-testid="select-duration-weeks"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? (planT.week || "week") : (planT.weeks || "weeks")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{planT.startDate || "Start Date (Monday)"}</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} data-testid="input-start-date" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.create.category}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.create.methodology}</label>
                <Select value={methodology} onValueChange={setMethodology}>
                  <SelectTrigger data-testid="select-methodology"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODOLOGY_OPTIONS.map(m => <SelectItem key={m} value={m}>{(t.create as any).methodologyLabels?.[m] || m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.create.iceConfig}</label>
                <Select value={iceConfig} onValueChange={setIceConfig}>
                  <SelectTrigger data-testid="select-ice"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICE_OPTIONS.map(o => <SelectItem key={o} value={o}>{(t.create as any).iceLabels?.[o] || o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.create.totalDuration}</label>
                <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                  <SelectTrigger data-testid="select-duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 75, 90, 120].map(d => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.create.difficulty}</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger data-testid="select-difficulty"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">{(t.create as any).difficultyLabels?.Beginner || "Beginner"}</SelectItem>
                    <SelectItem value="Intermediate">{(t.create as any).difficultyLabels?.Intermediate || "Intermediate"}</SelectItem>
                    <SelectItem value="Advanced">{(t.create as any).difficultyLabels?.Advanced || "Advanced"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => { if (weekConfigs.length === 0) initWeekConfigs(durationWeeks); setStep(1); }} data-testid="button-next-step-1">
              {t.create.nextStep} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4" data-testid="step-weekly-focus">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2">{steps[1].title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{steps[1].subtitle}</p>
            <p className="text-xs text-muted-foreground">
              {totalTrainings} {planT.totalTrainings || "total trainings"} ({trainingsPerWeek}x {planT.perWeek || "per week"}, {durationWeeks} {planT.weeks || "weeks"})
            </p>
          </Card>

          {weekConfigs.map((week, weekIdx) => (
            <Card key={weekIdx} className="p-5" data-testid={`card-week-${weekIdx}`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Badge variant="secondary">{planT.weekLabel || "Week"} {weekIdx + 1}</Badge>
                <span className="text-xs text-muted-foreground">
                  {trainingsPerWeek} {trainingsPerWeek === 1 ? (planT.trainingLabel || "training") : (planT.trainingsLabel || "trainings")}
                </span>
              </h3>

              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{planT.focusAreas || "Focus Areas"}</label>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_OPTIONS.map(focus => (
                    <Badge
                      key={focus}
                      variant={week.focus.includes(focus) ? "default" : "outline"}
                      className="cursor-pointer toggle-elevate"
                      onClick={() => toggleWeekFocus(weekIdx, focus)}
                      data-testid={`badge-focus-${weekIdx}-${focus}`}
                    >
                      {week.focus.includes(focus) && <Plus className="w-3 h-3 mr-0.5 rotate-45" />}
                      {planT.planFocusLabels?.[focus] || focus}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{planT.weekNotes || "Week Notes (optional)"}</label>
                <Input
                  value={week.notes}
                  onChange={e => updateWeekNotes(weekIdx, e.target.value)}
                  placeholder={planT.weekNotesPlaceholder || "e.g. Focus on power play setups..."}
                  data-testid={`input-week-notes-${weekIdx}`}
                />
              </div>
            </Card>
          ))}

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(0)} data-testid="button-back-step-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> {t.create.back}
            </Button>
            <Button onClick={() => setStep(2)} disabled={weekConfigs.some(w => w.focus.length === 0)} data-testid="button-next-step-2">
              {t.create.nextStep} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="p-6" data-testid="card-step-summary">
          <h2 className="text-lg font-bold mb-2">{steps[2].title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{steps[2].subtitle}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{planT.title || "Title"}:</span>
                <p className="font-medium">{planTitle || `${category} ${planT.planTitle || "Training Plan"}`}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{planT.totalTrainingsSummary || "Total Trainings"}:</span>
                <p className="font-medium">{totalTrainings}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t.create.category}:</span>
                <p className="font-medium">{category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t.create.methodology}:</span>
                <p className="font-medium">{methodology}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t.create.totalDuration}:</span>
                <p className="font-medium">{duration} min</p>
              </div>
              <div>
                <span className="text-muted-foreground">{planT.startDate || "Start Date"}:</span>
                <p className="font-medium">{startDate}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-sm mb-3">{planT.weeklyOverview || "Weekly Overview"}</h3>
              {weekConfigs.map((week, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <Badge variant="outline" className="mt-0.5">{planT.weekLabel || "Week"} {i + 1}</Badge>
                  <div className="flex flex-wrap gap-1">
                    {week.focus.map(f => <Badge key={f} variant="secondary">{planT.planFocusLabels?.[f] || f}</Badge>)}
                    {week.notes && <span className="text-xs text-muted-foreground italic ml-1">({week.notes})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <AIConsultation
              type="plan"
              config={{
                title: planTitle,
                trainingsPerWeek,
                durationWeeks,
                startDate,
                category,
                methodology,
                iceConfig,
                duration,
                difficulty,
                weekConfigs,
              }}
            />
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step-2">
              <ChevronLeft className="w-4 h-4 mr-1" /> {t.create.back}
            </Button>
            <Button
              onClick={() => generatePlan.mutate()}
              disabled={generatePlan.isPending}
              data-testid="button-generate-plan"
            >
              {generatePlan.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {planT.generating || "Generating trainings..."}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> {planT.generateButton || `Generate ${totalTrainings} Trainings`}</>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
