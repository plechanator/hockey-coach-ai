import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";

type Training = {
  id: number;
  title: string;
  trainingDate: string | null;
  startTime: string | null;
  status: string | null;
  duration: number;
  methodology: string;
  focus: string[] | null;
  iceConfig: string | null;
  inputParams: any;
  date?: string | null;
  location?: string | null;
  notes?: string | null;
};

type ViewMode = "monthly" | "weekly" | "daily";

const CATEGORY_COLORS: Record<string, string> = {
  "<U6": "#3B82F6",
  U10: "#10B981",
  U12: "#F59E0B",
  U15: "#EF4444",
  U18: "#8B5CF6",
  ">U18": "#6366F1",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "#3B82F6",
  completed: "#10B981",
  cancelled: "#9CA3AF",
};

function getTrainingDate(t: Training): string | null {
  return t.trainingDate || (t.date ? format(new Date(t.date), "yyyy-MM-dd") : null);
}

function getCategoryColor(training: Training): string {
  const cat = training.inputParams?.category;
  return CATEGORY_COLORS[cat] || "#6B7280";
}

const WEEKDAY_KEYS = [0, 1, 2, 3, 4, 5, 6];

export default function Calendar() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [rescheduleDialog, setRescheduleDialog] = useState<Training | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [duplicateDialog, setDuplicateDialog] = useState<Training | null>(null);
  const [duplicateDate, setDuplicateDate] = useState("");

  const [statusDialog, setStatusDialog] = useState<Training | null>(null);

  const dateRange = useMemo(() => {
    if (viewMode === "monthly") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calEnd = endOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 });
      return {
        start: format(calStart, "yyyy-MM-dd"),
        end: format(calEnd, "yyyy-MM-dd"),
      };
    } else if (viewMode === "weekly") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        start: format(weekStart, "yyyy-MM-dd"),
        end: format(weekEnd, "yyyy-MM-dd"),
      };
    } else {
      return {
        start: format(currentDate, "yyyy-MM-dd"),
        end: format(currentDate, "yyyy-MM-dd"),
      };
    }
  }, [currentDate, viewMode]);

  const { data: trainings, isLoading } = useQuery<Training[]>({
    queryKey: ["/api/calendar", dateRange.start, dateRange.end],
    queryFn: async () => {
      const res = await fetch(
        `/api/calendar?start=${dateRange.start}&end=${dateRange.end}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch calendar");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/trainings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: t.calendar.statusUpdated });
      setStatusDialog(null);
    },
    onError: () => {
      toast({ title: t.common.error, description: t.calendar.statusUpdateFailed, variant: "destructive" });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({
      id,
      trainingDate,
      startTime,
    }: {
      id: number;
      trainingDate: string;
      startTime?: string;
    }) => {
      await apiRequest("PATCH", `/api/trainings/${id}/reschedule`, {
        trainingDate,
        startTime: startTime || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: t.calendar.rescheduled });
      setRescheduleDialog(null);
      setRescheduleDate("");
      setRescheduleTime("");
    },
    onError: () => {
      toast({ title: t.common.error, description: t.calendar.rescheduleFailed, variant: "destructive" });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ id, trainingDate }: { id: number; trainingDate: string }) => {
      await apiRequest("POST", `/api/trainings/${id}/duplicate`, { trainingDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: t.calendar.duplicated });
      setDuplicateDialog(null);
      setDuplicateDate("");
    },
    onError: () => {
      toast({ title: t.common.error, description: t.calendar.duplicateFailed, variant: "destructive" });
    },
  });

  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter((tr) => {
      if (!getTrainingDate(tr)) return false;
      if (categoryFilter !== "all") {
        const cat = tr.inputParams?.category;
        if (cat !== categoryFilter) return false;
      }
      return true;
    });
  }, [trainings, categoryFilter]);

  const categories = useMemo(() => {
    if (!trainings) return [];
    const cats = new Set<string>();
    trainings.forEach((tr) => {
      const cat = tr.inputParams?.category;
      if (cat) cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [trainings]);

  const trainingsByDate = useMemo(() => {
    const map: Record<string, Training[]> = {};
    filteredTrainings.forEach((tr) => {
      const d = getTrainingDate(tr);
      if (d) {
        if (!map[d]) map[d] = [];
        map[d].push(tr);
      }
    });
    return map;
  }, [filteredTrainings]);

  const navigatePrev = () => {
    if (viewMode === "monthly") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "weekly") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const navigateNext = () => {
    if (viewMode === "monthly") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "weekly") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3" style={{ color: STATUS_COLORS.completed }} />;
      case "cancelled":
        return <XCircle className="w-3 h-3" style={{ color: STATUS_COLORS.cancelled }} />;
      default:
        return <Circle className="w-3 h-3" style={{ color: STATUS_COLORS.planned }} />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "completed":
        return t.calendar.completed;
      case "cancelled":
        return t.calendar.cancelled;
      default:
        return t.calendar.planned;
    }
  };

  const headerLabel = useMemo(() => {
    if (viewMode === "monthly") return format(currentDate, "MMMM yyyy");
    if (viewMode === "weekly") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, "MMM d")} - ${format(we, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [currentDate, viewMode]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(calStart, i));
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
    return WEEKDAY_KEYS.map((i) => addDays(ws, i));
  }, [currentDate]);

  const dayNames = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    return WEEKDAY_KEYS.map((i) => format(addDays(ws, i), "EEE"));
  }, []);

  const renderTrainingCard = (training: Training, compact = true) => {
    const catColor = getCategoryColor(training);
    return (
      <div
        key={training.id}
        className="group cursor-pointer rounded-md p-1.5 text-xs hover-elevate"
        style={{ borderLeft: `3px solid ${catColor}` }}
        onClick={(e) => {
          e.stopPropagation();
          setLocation(`/training/${training.id}`);
        }}
        data-testid={`card-training-${training.id}`}
      >
        <div className="flex items-center gap-1 min-w-0">
          {getStatusIcon(training.status)}
          <span className="truncate font-medium">{training.title}</span>
        </div>
        {training.startTime && compact && (
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>{training.startTime}</span>
          </div>
        )}
        {!compact && (
          <div className="mt-2 space-y-1.5">
            {training.startTime && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{training.startTime}</span>
                <span className="ml-1">({training.duration} min)</span>
              </div>
            )}
            <div className="flex items-center gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs" style={{ borderColor: catColor, color: catColor }}>
                {training.inputParams?.category || "N/A"}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getStatusLabel(training.status)}
              </Badge>
              {training.methodology && (
                <Badge variant="secondary" className="text-xs">{training.methodology}</Badge>
              )}
            </div>
            {training.focus && training.focus.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {training.focus.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusDialog(training);
                }}
                data-testid={`button-status-${training.id}`}
              >
                {t.calendar.changeStatus}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setRescheduleDialog(training);
                  setRescheduleDate(getTrainingDate(training) || "");
                  setRescheduleTime(training.startTime || "");
                }}
                data-testid={`button-reschedule-${training.id}`}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t.calendar.reschedule}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDuplicateDialog(training);
                  setDuplicateDate("");
                }}
                data-testid={`button-duplicate-${training.id}`}
              >
                <Copy className="w-3 h-3 mr-1" />
                {t.calendar.duplicate}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthlyView = () => (
    <div className="grid grid-cols-7 border-t border-l border-border rounded-md overflow-visible">
      {dayNames.map((d) => (
        <div
          key={d}
          className="p-2 text-xs font-medium text-muted-foreground text-center border-r border-b border-border bg-muted/30"
        >
          {d}
        </div>
      ))}
      {monthDays.map((day, idx) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTrainings = trainingsByDate[dateStr] || [];
        const inMonth = isSameMonth(day, currentDate);
        const today = isToday(day);
        return (
          <div
            key={idx}
            className={`min-h-[100px] p-1 border-r border-b border-border relative ${
              !inMonth ? "bg-muted/20" : ""
            } ${today ? "bg-accent/10" : ""}`}
            onClick={() => {
              setCurrentDate(day);
              setViewMode("daily");
            }}
            data-testid={`cell-day-${dateStr}`}
          >
            <div
              className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                today ? "bg-primary text-primary-foreground" : ""
              } ${!inMonth ? "text-muted-foreground/50" : ""}`}
            >
              {format(day, "d")}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              {dayTrainings.slice(0, 3).map((tr) => renderTrainingCard(tr, true))}
              {dayTrainings.length > 3 && (
                <div className="text-xs text-muted-foreground pl-1">
                  +{dayTrainings.length - 3} {t.calendar.more}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeeklyView = () => (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTrainings = trainingsByDate[dateStr] || [];
        const today = isToday(day);
        return (
          <div key={dateStr} className="min-h-[200px]" data-testid={`week-day-${dateStr}`}>
            <div
              className={`text-sm font-medium mb-2 text-center p-2 rounded-md ${
                today ? "bg-primary text-primary-foreground" : "bg-muted/30"
              }`}
            >
              <div>{format(day, "EEE")}</div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
            <div className="space-y-1">
              {dayTrainings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t.calendar.noTrainings}
                </p>
              ) : (
                dayTrainings.map((tr) => (
                  <Card
                    key={tr.id}
                    className="p-2 cursor-pointer hover-elevate"
                    onClick={() => setLocation(`/training/${tr.id}`)}
                    data-testid={`card-training-${tr.id}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {getStatusIcon(tr.status)}
                      <span className="text-xs font-medium truncate">{tr.title}</span>
                    </div>
                    {tr.startTime && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {tr.startTime}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getCategoryColor(tr),
                          color: getCategoryColor(tr),
                        }}
                      >
                        {tr.inputParams?.category || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDialog(tr);
                        }}
                        data-testid={`button-status-${tr.id}`}
                      >
                        {t.calendar.changeStatus}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRescheduleDialog(tr);
                          setRescheduleDate(getTrainingDate(tr) || "");
                          setRescheduleTime(tr.startTime || "");
                        }}
                        data-testid={`button-reschedule-${tr.id}`}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuplicateDialog(tr);
                          setDuplicateDate("");
                        }}
                        data-testid={`button-duplicate-${tr.id}`}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDailyView = () => {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayTrainings = trainingsByDate[dateStr] || [];
    return (
      <div className="space-y-3" data-testid="daily-view">
        {dayTrainings.length === 0 ? (
          <div className="py-16 text-center bg-muted/20 rounded-md border border-dashed border-border">
            <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground" data-testid="text-no-trainings">
              {t.calendar.noTrainings}
            </p>
          </div>
        ) : (
          dayTrainings.map((tr) => (
            <Card key={tr.id} className="p-4" data-testid={`card-training-${tr.id}`}>
              {renderTrainingCard(tr, false)}
            </Card>
          ))
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in" data-testid="calendar-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <h1 className="text-2xl font-semibold" data-testid="text-calendar-title">
          {t.calendar.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5">
            <Button
              variant={viewMode === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("monthly")}
              data-testid="button-view-monthly"
            >
              {t.calendar.monthly}
            </Button>
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("weekly")}
              data-testid="button-view-weekly"
            >
              {t.calendar.weekly}
            </Button>
            <Button
              variant={viewMode === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("daily")}
              data-testid="button-view-daily"
            >
              {t.calendar.daily}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToday} data-testid="button-today">
            {t.calendar.today}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={navigatePrev} data-testid="button-prev">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center" data-testid="text-header-label">
            {headerLabel}
          </h2>
          <Button variant="ghost" size="icon" onClick={navigateNext} data-testid="button-next">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
            <SelectValue placeholder={t.calendar.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.calendar.allCategories}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || "#6B7280" }}
                  />
                  {cat}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === "monthly" && renderMonthlyView()}
      {viewMode === "weekly" && renderWeeklyView()}
      {viewMode === "daily" && renderDailyView()}

      <Dialog open={!!statusDialog} onOpenChange={(open) => !open && setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.calendar.changeStatus}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {(["planned", "completed", "cancelled"] as const).map((s) => (
              <Button
                key={s}
                variant={statusDialog?.status === s ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => {
                  if (statusDialog) {
                    statusMutation.mutate({ id: statusDialog.id, status: s });
                  }
                }}
                disabled={statusMutation.isPending}
                data-testid={`button-set-status-${s}`}
              >
                {s === "completed" && <CheckCircle2 className="w-4 h-4" style={{ color: STATUS_COLORS.completed }} />}
                {s === "planned" && <Circle className="w-4 h-4" style={{ color: STATUS_COLORS.planned }} />}
                {s === "cancelled" && <XCircle className="w-4 h-4" style={{ color: STATUS_COLORS.cancelled }} />}
                {t.calendar[s]}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rescheduleDialog}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleDialog(null);
            setRescheduleDate("");
            setRescheduleTime("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.calendar.reschedule}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t.calendar.trainingDate}</label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                data-testid="input-reschedule-date"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t.calendar.startTime}</label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                data-testid="input-reschedule-time"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleDialog(null);
                setRescheduleDate("");
                setRescheduleTime("");
              }}
              data-testid="button-reschedule-cancel"
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={() => {
                if (rescheduleDialog && rescheduleDate) {
                  rescheduleMutation.mutate({
                    id: rescheduleDialog.id,
                    trainingDate: rescheduleDate,
                    startTime: rescheduleTime || undefined,
                  });
                }
              }}
              disabled={!rescheduleDate || rescheduleMutation.isPending}
              data-testid="button-reschedule-confirm"
            >
              {t.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!duplicateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setDuplicateDialog(null);
            setDuplicateDate("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.calendar.duplicate}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block">{t.calendar.trainingDate}</label>
            <Input
              type="date"
              value={duplicateDate}
              onChange={(e) => setDuplicateDate(e.target.value)}
              data-testid="input-duplicate-date"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDuplicateDialog(null);
                setDuplicateDate("");
              }}
              data-testid="button-duplicate-cancel"
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={() => {
                if (duplicateDialog && duplicateDate) {
                  duplicateMutation.mutate({
                    id: duplicateDialog.id,
                    trainingDate: duplicateDate,
                  });
                }
              }}
              disabled={!duplicateDate || duplicateMutation.isPending}
              data-testid="button-duplicate-confirm"
            >
              {t.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
