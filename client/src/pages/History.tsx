import { useTrainings, useDeleteTraining } from "@/hooks/use-trainings";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Eye, Copy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function History() {
  const { data: trainings, isLoading } = useTrainings();
  const deleteTraining = useDeleteTraining();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = trainings?.filter((tr: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tr.title?.toLowerCase().includes(q) ||
      tr.methodology?.toLowerCase().includes(q) ||
      tr.focus?.some((f: string) => f.toLowerCase().includes(q))
    );
  });

  const handleDuplicate = async (training: any) => {
    try {
      await apiRequest("POST", "/api/trainings/generate", training.inputParams);
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: t.history.duplicated, description: t.history.duplicatedDesc });
    } catch {
      toast({ title: t.common.error, description: t.history.duplicateFailed, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t.common.confirm + "?")) {
      await deleteTraining.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" data-testid="text-history-title">
          {t.history.title}
        </h1>
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.history.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-history"
          />
        </div>
      </div>

      {(!filtered || filtered.length === 0) ? (
        <div className="py-14 text-center bg-muted/30 rounded-md border border-dashed border-border">
          <p className="text-muted-foreground text-sm" data-testid="text-no-trainings">{t.history.noTrainings}</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.date}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.titleColumn}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.age}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.methodology}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.focus}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">{t.history.drillRatio}</th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right">{t.history.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((tr: any) => (
                  <tr key={tr.id} className="transition-colors hover:bg-muted/20" data-testid={`row-training-${tr.id}`}>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {tr.date ? format(new Date(tr.date), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate" data-testid={`text-title-${tr.id}`}>{tr.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {(tr.inputParams as any)?.category || "-"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" data-testid={`text-methodology-${tr.id}`}>{tr.methodology}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {tr.focus?.slice(0, 2).map((f: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                        ))}
                        {(tr.focus?.length || 0) > 2 && (
                          <span className="text-xs text-muted-foreground">+{tr.focus.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" data-testid={`text-drill-ratio-${tr.id}`}>{tr.drillRatio}%</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-0.5">
                        <Link href={`/training/${tr.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-view-${tr.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(tr)} data-testid={`button-duplicate-${tr.id}`}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tr.id)} data-testid={`button-delete-${tr.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
