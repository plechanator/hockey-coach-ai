import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateTrainingInputSchema } from "@shared/schema";
import { useGenerateTraining, useGenerateFromPrompt } from "@/hooks/use-trainings";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RinkDrawer } from "@/components/RinkDrawer";
import { AIConsultation } from "@/components/AIConsultation";
import {
  Loader2, Users, Snowflake, LayoutGrid, Target, Gauge, ClipboardCheck,
  ChevronLeft, ChevronRight, Sparkles, Baby, GraduationCap, Trophy, Swords, Medal, Crown,
  Maximize, Columns3, ArrowRightLeft, ShieldCheck, Wand2, Grid2x2, Layers,
  MessageSquare, ListChecks, Send, ArrowLeft, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FOCUS_AREAS = [
  "Skating Basics", "Skating Agility", "Power Skating", "Puck Control",
  "Passing", "Shooting & Finishing", "Defensive Skills", "Individual Skills",
  "Balanced Situations", "Unbalanced Situations", "Combinations", "Tactics",
  "Small Area Games", "Game Play", "Warm Up", "Goalies", "Playbook", "Off Ice", "Other",
];

const CATEGORY_OPTIONS = [
  { value: "<U6" as const, label: "<U6", desc: "First steps on ice", icon: Baby },
  { value: "U10" as const, label: "U10", desc: "Basic skills development", icon: GraduationCap },
  { value: "U12" as const, label: "U12", desc: "Skill refinement & teamwork", icon: Trophy },
  { value: "U15" as const, label: "U15", desc: "Tactical awareness", icon: Swords },
  { value: "U18" as const, label: "U18", desc: "Competitive preparation", icon: Medal },
  { value: ">U18" as const, label: ">U18", desc: "Adult / senior level", icon: Crown },
];

const ICE_CONFIG_OPTIONS = [
  { value: "Full Ice" as const, label: "Full Ice", desc: "Entire rink available", icon: Maximize },
  { value: "Half Ice" as const, label: "Half Ice", desc: "One half of the rink", icon: Columns3 },
  { value: "Offensive Zone" as const, label: "Offensive Zone", desc: "Attack end only", icon: Target },
  { value: "Neutral Zone" as const, label: "Neutral Zone", desc: "Center ice area", icon: ArrowRightLeft },
  { value: "Defensive Zone" as const, label: "Defensive Zone", desc: "Defensive end only", icon: ShieldCheck },
];

const LAYOUT_TEMPLATES: Record<string, {
  name: string;
  description: string;
  stations: number;
  iceConfig: string;
  zones: { station_id: number; zone_area: { x_start: number; y_start: number; width: number; height: number } }[];
}> = {
  "2-1-2": {
    name: "2-1-2 Zone Model",
    description: "2 offensive + 1 neutral + 2 defensive stations",
    stations: 5,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 50 } },
      { station_id: 2, zone_area: { x_start: 0, y_start: 50, width: 25, height: 50 } },
      { station_id: 3, zone_area: { x_start: 25, y_start: 0, width: 50, height: 100 } },
      { station_id: 4, zone_area: { x_start: 75, y_start: 0, width: 25, height: 50 } },
      { station_id: 5, zone_area: { x_start: 75, y_start: 50, width: 25, height: 50 } },
    ],
  },
  "4-lanes": {
    name: "4 Vertical Lanes",
    description: "4 parallel lanes from goal line to red line",
    stations: 4,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 100 } },
      { station_id: 2, zone_area: { x_start: 25, y_start: 0, width: 25, height: 100 } },
      { station_id: 3, zone_area: { x_start: 50, y_start: 0, width: 25, height: 100 } },
      { station_id: 4, zone_area: { x_start: 75, y_start: 0, width: 25, height: 100 } },
    ],
  },
  "3-zones": {
    name: "3 Horizontal Zones",
    description: "Defensive + Neutral + Offensive zones",
    stations: 3,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 33, height: 100 } },
      { station_id: 2, zone_area: { x_start: 33, y_start: 0, width: 34, height: 100 } },
      { station_id: 3, zone_area: { x_start: 67, y_start: 0, width: 33, height: 100 } },
    ],
  },
  "half-ice-4": {
    name: "Half-Ice Segments",
    description: "4 segments in half ice",
    stations: 4,
    iceConfig: "Half Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 50 } },
      { station_id: 2, zone_area: { x_start: 25, y_start: 0, width: 25, height: 50 } },
      { station_id: 3, zone_area: { x_start: 0, y_start: 50, width: 25, height: 50 } },
      { station_id: 4, zone_area: { x_start: 25, y_start: 50, width: 25, height: 50 } },
    ],
  },
};

const LAYOUT_OPTIONS = [
  { value: "auto", name: "Auto", description: "AI decides the best layout", icon: Wand2, stations: null },
  { value: "2-1-2", name: "2-1-2 Zone Model", description: "2 off + 1 neutral + 2 def", icon: Grid2x2, stations: 5 },
  { value: "4-lanes", name: "4 Vertical Lanes", description: "4 parallel lanes", icon: Columns3, stations: 4 },
  { value: "3-zones", name: "3 Horizontal Zones", description: "Def / Neutral / Off", icon: Layers, stations: 3 },
  { value: "half-ice-4", name: "Half-Ice Segments", description: "4 quadrants in half ice", icon: LayoutGrid, stations: 4 },
  { value: "custom", name: "Custom", description: "Define your own zones", icon: Sparkles, stations: null },
];

const STEP_ICONS = [Users, Users, Snowflake, LayoutGrid, Target, Gauge, ClipboardCheck];

function getStepMeta(t: any) {
  const titles = (t.create as any).stepTitles || ["Who are we training today?", "How many players and coaches?", "What ice do you have?", "How should we organize the ice?", "What's the focus of this session?", "What type of session do you want?", "Review your training plan"];
  const subtitles = (t.create as any).stepSubtitles || ["Select the age category for your team", "Set team size and session duration", "Choose your available ice configuration", "Pick a station layout for the session", "Set methodology and key focus areas", "Fine-tune intensity and structure", "Confirm everything looks good"];
  return STEP_ICONS.map((icon, i) => ({ icon, title: titles[i], subtitle: subtitles[i] }));
}

type CreationMode = "select" | "wizard" | "quick";

type FormValues = z.infer<typeof generateTrainingInputSchema>;

function QuickAIChat() {
  const [prompt, setPrompt] = useState("");
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const generateFromPrompt = useGenerateFromPrompt();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const examplePrompts = [
    (t.create as any).quickExamples?.skating || "60 min skating session for U12, full ice, 3 stations, focus on edges and crossovers",
    (t.create as any).quickExamples?.shooting || "45 min shooting practice for U15, half ice, beginner difficulty",
    (t.create as any).quickExamples?.gameDay || "75 min game-day prep for U18, tactical focus with small area games",
    (t.create as any).quickExamples?.young || "45 min fun session for U6, basic skating and puck control",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) return;
    try {
      const result = await generateFromPrompt.mutateAsync({ prompt: prompt.trim() });
      if (result && result.id) {
        setLocation(`/training/${result.id}`);
      }
    } catch (error) {
      console.error("Quick AI generation failed:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold" data-testid="text-quick-title">
                {(t.create as any).quickTitle || "Describe Your Training"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {(t.create as any).quickSubtitle || "Tell the AI what you need in your own words. It will fill in the details using your coaching profile."}
              </p>
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={(t.create as any).quickPlaceholder || "e.g. 60 min skating session for U12, full ice, 3 stations, focus on agility and edges..."}
              className="resize-none text-base min-h-[120px] pr-14"
              disabled={generateFromPrompt.isPending}
              data-testid="input-quick-prompt"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!prompt.trim() || prompt.trim().length < 5 || generateFromPrompt.isPending}
              className="absolute bottom-3 right-3"
              data-testid="button-quick-send"
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
                <p className="font-medium text-sm">{(t.create as any).quickGenerating || "Generating your training session..."}</p>
                <p className="text-xs text-muted-foreground">{(t.create as any).quickGeneratingDesc || "AI is analyzing your request and building a complete session"}</p>
              </div>
            </motion.div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              {(t.create as any).quickTryThese || "Try these examples"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  disabled={generateFromPrompt.isPending}
                  className="text-left text-sm p-3 rounded-md border border-border bg-card hover-elevate transition-colors"
                  data-testid={`button-example-${i}`}
                >
                  <Zap className="w-3 h-3 text-accent inline mr-2 flex-shrink-0" />
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Sparkles className="w-3 h-3" />
        <span>{(t.create as any).quickSmartDefaults || "Smart defaults applied from your coaching profile (Coach DNA)"}</span>
      </div>
    </div>
  );
}

export default function CreateTraining() {
  const initialMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode");
  const cameFromDashboard = initialMode === "wizard" || initialMode === "quick";
  const [mode, setMode] = useState<CreationMode>(cameFromDashboard ? initialMode : "select");
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (cameFromDashboard) {
      setLocation("/");
    } else {
      setMode("select");
      setStep(1);
    }
  };
  const { t } = useLanguage();
  const generateTraining = useGenerateTraining();

  const form = useForm<FormValues>({
    resolver: zodResolver(generateTrainingInputSchema),
    defaultValues: {
      category: "U15",
      playersCount: 15,
      goaliesCount: 2,
      duration: 60,
      stations: 3,
      iceConfig: "Full Ice",
      layoutType: "auto",
      stationTimingMode: "Automatic",
      maxStationDuration: 10,
      focus: [],
      methodology: "Hybrid",
      drillRatio: 60,
      difficulty: "Intermediate",
      cognitiveLoad: "Medium",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const submitData = { ...data };
      const lt = submitData.layoutType;
      if (lt && lt !== "auto" && lt !== "custom" && LAYOUT_TEMPLATES[lt]) {
        submitData.customLayoutCoordinates = LAYOUT_TEMPLATES[lt].zones;
      }
      const result = await generateTraining.mutateAsync(submitData);
      if (result && result.id) {
        setLocation(`/training/${result.id}`);
      }
    } catch (error) {
      console.error("Failed to generate:", error);
    }
  };

  const stepFieldMap: Record<number, (keyof FormValues)[]> = {
    1: ["category"],
    2: ["playersCount", "goaliesCount", "duration"],
    3: ["iceConfig"],
    4: ["stations", "layoutType"],
    5: ["focus", "methodology"],
    6: ["drillRatio", "difficulty", "cognitiveLoad", "stationTimingMode"],
  };

  const nextStep = async () => {
    const fields = stepFieldMap[step];
    if (fields) {
      const isValid = await form.trigger(fields);
      if (!isValid) return;
    }
    setStep((s) => Math.min(s + 1, 7));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const watchedLayout = form.watch("layoutType");
  const watchedIce = form.watch("iceConfig");
  const watchedStations = form.watch("stations");

  const getStationDataForPreview = () => {
    if (watchedLayout && watchedLayout !== "auto" && watchedLayout !== "custom" && LAYOUT_TEMPLATES[watchedLayout]) {
      return LAYOUT_TEMPLATES[watchedLayout].zones.map((z) => ({
        station_id: z.station_id,
        zone_area: z.zone_area,
      }));
    }
    return undefined;
  };

  const getPreviewIceConfig = () => {
    if (watchedLayout && watchedLayout !== "auto" && watchedLayout !== "custom" && LAYOUT_TEMPLATES[watchedLayout]) {
      return LAYOUT_TEMPLATES[watchedLayout].iceConfig;
    }
    return watchedIce;
  };

  const getPreviewStations = () => {
    if (watchedLayout && watchedLayout !== "auto" && watchedLayout !== "custom" && LAYOUT_TEMPLATES[watchedLayout]) {
      return LAYOUT_TEMPLATES[watchedLayout].stations;
    }
    return watchedStations;
  };

  const STEP_META = getStepMeta(t);
  const currentStepMeta = STEP_META[step - 1];
  const StepIcon = currentStepMeta.icon;

  const renderProgressBar = () => (
    <div className="flex items-center justify-center gap-1 mb-8" data-testid="progress-bar">
      {STEP_META.map((_, i) => {
        const s = i + 1;
        const isActive = step === s;
        const isCompleted = step > s;
        return (
          <div key={s} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { if (isCompleted) setStep(s); }}
              disabled={!isCompleted}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : isCompleted
                  ? "bg-accent/20 text-accent cursor-pointer"
                  : "bg-secondary text-muted-foreground"
              }`}
              data-testid={`step-indicator-${s}`}
            >
              {s}
            </button>
            {s < 7 && (
              <div className={`w-6 h-0.5 rounded ${step > s ? "bg-accent" : "bg-secondary"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStepHeader = () => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
        <StepIcon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{currentStepMeta.title}</h2>
        <p className="text-sm text-muted-foreground">{currentStepMeta.subtitle}</p>
      </div>
    </div>
  );

  const renderNavButtons = (showBack = true, nextLabel = "Next", isSubmit = false) => (
    <div className="flex justify-between gap-4 pt-6">
      {showBack ? (
        <Button type="button" variant="outline" onClick={prevStep} data-testid="button-back">
          <ChevronLeft className="w-4 h-4" />
          {t.create.back}
        </Button>
      ) : (
        <div />
      )}
      {isSubmit ? (
        <Button
          type="submit"
          size="lg"
          disabled={generateTraining.isPending}
          data-testid="button-generate"
        >
          {generateTraining.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.create.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t.create.generateSession}
            </>
          )}
        </Button>
      ) : (
        <Button type="button" onClick={nextStep} data-testid="button-next">
          {nextLabel}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const renderStep1 = () => (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = field.value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={`p-4 rounded-md border-2 text-left transition-colors hover-elevate ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card"
                  }`}
                  data-testid={`category-${opt.value}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="font-bold text-lg">{opt.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(t.create as any).categoryDescs?.[opt.value] || opt.desc}</p>
                </button>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="playersCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.create.skaters}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={40}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                data-testid="input-players"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="goaliesCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.create.goalies}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={6}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                data-testid="input-goalies"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{(t.create as any).summaryDuration || "Duration"}</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(parseInt(v))}
              value={String(field.value)}
            >
              <FormControl>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[45, 60, 75, 90].map((d) => (
                  <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep3 = () => (
    <FormField
      control={form.control}
      name="iceConfig"
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ICE_CONFIG_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = field.value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={`p-4 rounded-md border-2 text-left transition-colors hover-elevate ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card"
                  }`}
                  data-testid={`ice-${opt.value}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="font-bold">{(t.create as any).iceLabels?.[opt.value] || opt.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(t.create as any).iceDescs?.[opt.value] || opt.desc}</p>
                </button>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderStep4 = () => {
    const currentLayout = form.watch("layoutType");
    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="stations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{(t.create as any).numberOfStations || "Number of Stations"}</FormLabel>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const isLocked = currentLayout && currentLayout !== "auto" && currentLayout !== "custom" && LAYOUT_TEMPLATES[currentLayout]
                    ? LAYOUT_TEMPLATES[currentLayout].stations !== n
                    : false;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={isLocked}
                      onClick={() => field.onChange(n)}
                      className={`w-10 h-10 rounded-md border-2 font-bold text-sm transition-colors ${
                        field.value === n
                          ? "border-accent bg-accent/10 text-accent"
                          : isLocked
                          ? "border-border bg-secondary/50 text-muted-foreground opacity-40 cursor-not-allowed"
                          : "border-border bg-card hover-elevate"
                      }`}
                      data-testid={`stations-${n}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="layoutType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{(t.create as any).layoutTemplate || "Layout Template"}</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LAYOUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        field.onChange(opt.value);
                        if (opt.stations !== null) {
                          form.setValue("stations", opt.stations);
                        }
                        if (opt.value !== "auto" && opt.value !== "custom" && LAYOUT_TEMPLATES[opt.value]) {
                          form.setValue("iceConfig", LAYOUT_TEMPLATES[opt.value].iceConfig as any);
                        }
                      }}
                      className={`p-3 rounded-md border-2 text-left transition-colors hover-elevate ${
                        isSelected
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card"
                      }`}
                      data-testid={`layout-${opt.value}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                        <span className="font-semibold text-sm">{(t.create as any).layoutNames?.[opt.value] || opt.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{(t.create as any).layoutDescs?.[opt.value] || opt.description}</p>
                      {opt.stations !== null && (
                        <Badge variant="secondary" className="mt-2 text-xs">{opt.stations} {(t.create as any).stationsLabel || "stations"}</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentLayout === "custom" && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{(t.create as any).customLayoutNote || "Custom layout editor coming soon. The AI will auto-generate zones based on your station count."}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-4" data-testid="layout-preview">
          <p className="text-sm font-medium mb-2 text-muted-foreground">{(t.create as any).preview || "Preview"}</p>
          <RinkDrawer
            iceConfig={getPreviewIceConfig()}
            stations={getPreviewStations()}
            stationData={getStationDataForPreview()}
            width={500}
            height={250}
          />
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="methodology"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{(t.create as any).summaryMethodology || "Methodology"}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-methodology">
                  <SelectValue placeholder="Select methodology" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {["Canadian", "Swedish", "American", "Czech", "Hybrid"].map((m) => (
                  <SelectItem key={m} value={m}>{(t.create as any).methodologyLabels?.[m] || m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="focus"
        render={() => (
          <FormItem>
            <FormLabel className="mb-3 block">{t.create.focusAreas}</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FOCUS_AREAS.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="focus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-2 border rounded-md hover-elevate">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) =>
                            checked
                              ? field.onChange([...field.value, item])
                              : field.onChange(field.value?.filter((v) => v !== item))
                          }
                          data-testid={`focus-${item}`}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer text-sm">{(t.create as any).focusLabels?.[item] || item}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="drillRatio"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <FormLabel>{(t.create as any).drillGameRatio || "Drill / Game Ratio"}</FormLabel>
              <span className="font-mono text-sm bg-secondary px-2 py-1 rounded-md">
                {field.value}% Drills / {100 - field.value}% Games
              </span>
            </div>
            <FormControl>
              <div className="pt-2 pb-6 relative">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  data-testid="slider-drill-ratio"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 absolute w-full">
                  <span>{t.create.mostlyGames}</span>
                  <span>{t.create.balanced}</span>
                  <span>{t.create.mostlyDrills}</span>
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{(t.create as any).summaryDifficulty || "Difficulty"}</FormLabel>
            <div className="flex gap-3">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => field.onChange(d)}
                  className={`flex-1 p-3 rounded-md border-2 text-center text-sm font-medium transition-colors hover-elevate ${
                    field.value === d
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border bg-card"
                  }`}
                  data-testid={`difficulty-${d}`}
                >
                  {(t.create as any).difficultyLabels?.[d] || d}
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cognitiveLoad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.create.cognitiveLoad}</FormLabel>
            <div className="flex gap-3">
              {([
                { value: "Low" as const, label: "Low (Flow & Reps)" },
                { value: "Medium" as const, label: "Medium (Reads)" },
                { value: "High" as const, label: "High (Complex)" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={`flex-1 p-3 rounded-md border-2 text-center text-sm font-medium transition-colors hover-elevate ${
                    field.value === opt.value
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border bg-card"
                  }`}
                  data-testid={`cognitive-${opt.value}`}
                >
                  {(t.create as any).cognitiveLabels?.[opt.value] || opt.label}
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="stationTimingMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{(t.create as any).stationTiming || "Station Timing"}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-timing">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Automatic", "Maximum station duration", "Custom"].map((m) => (
                    <SelectItem key={m} value={m}>{(t.create as any).timingLabels?.[m] || m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("stationTimingMode") === "Maximum station duration" && (
          <FormField
            control={form.control}
            name="maxStationDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(t.create as any).maxDurationMin || "Max Duration (min)"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? 10}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                    data-testid="input-max-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );

  const renderStep7 = () => {
    const values = form.getValues();
    const layoutLabel = LAYOUT_OPTIONS.find((l) => l.value === values.layoutType)?.name || values.layoutType;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryCategory || "Category"}</p>
                <p className="font-semibold">{values.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryDuration || "Duration"}</p>
                <p className="font-semibold">{values.duration} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summarySkatersGoalies || "Skaters / Goalies"}</p>
                <p className="font-semibold">{values.playersCount} / {values.goaliesCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryIce || "Ice"}</p>
                <p className="font-semibold">{values.iceConfig}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryLayout || "Layout"}</p>
                <p className="font-semibold">{layoutLabel} ({values.stations} {(t.create as any).stationsLabel || "stations"})</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryMethodology || "Methodology"}</p>
                <p className="font-semibold">{values.methodology}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryDifficulty || "Difficulty"}</p>
                <p className="font-semibold">{values.difficulty}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryCognitiveLoad || "Cognitive Load"}</p>
                <p className="font-semibold">{values.cognitiveLoad}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryDrillGame || "Drill / Game"}</p>
                <p className="font-semibold">{values.drillRatio}% / {100 - values.drillRatio}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">{(t.create as any).summaryTiming || "Timing"}</p>
                <p className="font-semibold">{values.stationTimingMode}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">{(t.create as any).summaryFocusAreas || "Focus Areas"}</p>
              <div className="flex flex-wrap gap-2">
                {values.focus.map((f) => (
                  <Badge key={f} variant="secondary">{f}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div data-testid="summary-rink-preview">
          <p className="text-sm font-medium mb-2 text-muted-foreground">{(t.create as any).iceLayoutPreview || "Ice Layout Preview"}</p>
          <RinkDrawer
            iceConfig={getPreviewIceConfig()}
            stations={getPreviewStations()}
            stationData={getStationDataForPreview()}
            width={500}
            height={250}
          />
        </div>

        <AIConsultation type="training" config={values} />
      </div>
    );
  };

  const stepRenderers: Record<number, () => JSX.Element> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7,
  };

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
            <h3 className="text-lg font-bold">{(t.create as any).modeQuickTitle || "Quick AI"}</h3>
            <Badge variant="secondary">{(t.create as any).modeFast || "Fast"}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {(t.create as any).modeQuickDesc || "Describe what you need in your own words. The AI extracts parameters and generates the session instantly."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-accent" />
          <span>{(t.create as any).modeQuickFeature1 || "Natural language input"}</span>
          <span className="text-border">|</span>
          <span>{(t.create as any).modeQuickFeature2 || "Smart defaults from Coach DNA"}</span>
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
            <h3 className="text-lg font-bold">{(t.create as any).modeWizardTitle || "Step-by-Step"}</h3>
            <Badge variant="secondary">{(t.create as any).modePrecise || "Precise"}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {(t.create as any).modeWizardDesc || "7-step wizard with full control over every parameter. Choose category, ice, layout, focus, and more."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3 text-accent" />
          <span>{(t.create as any).modeWizardFeature1 || "Full parameter control"}</span>
          <span className="text-border">|</span>
          <span>{(t.create as any).modeWizardFeature2 || "Ice layout preview"}</span>
        </div>
      </button>
    </div>
  );

  if (mode === "select") {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-1" data-testid="text-page-title">
            {t.create.title || "Design Your Session"}
          </h1>
          <p className="text-muted-foreground">{(t.create as any).modeSelectSubtitle || "Choose how you want to create your training session"}</p>
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
            onClick={handleBack}
            className="mb-4"
            data-testid="button-back-to-modes"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {cameFromDashboard ? (t.training?.backToDashboard || "Back to Dashboard") : ((t.create as any).backToModes || "Back to mode selection")}
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-1" data-testid="text-page-title">
              {(t.create as any).quickTitle || "Quick AI Session"}
            </h1>
            <p className="text-muted-foreground">{(t.create as any).quickPageSubtitle || "Describe your training and let AI handle the rest"}</p>
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
            <QuickAIChat />
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
          onClick={handleBack}
          className="mb-4"
          data-testid="button-back-to-modes"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {cameFromDashboard ? (t.training?.backToDashboard || "Back to Dashboard") : ((t.create as any).backToModes || "Back to mode selection")}
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-1" data-testid="text-page-title">
            {t.create.title || "Design Your Session"}
          </h1>
          <p className="text-muted-foreground">{t.create.subtitle || "AI-powered training generation tailored to your team."}</p>
        </div>
      </div>

      {renderProgressBar()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="p-6 md:p-8">
                  {renderStepHeader()}
                  {stepRenderers[step]()}
                  {renderNavButtons(step > 1, step === 7 ? t.create.generateSession : t.create.nextStep, step === 7)}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
