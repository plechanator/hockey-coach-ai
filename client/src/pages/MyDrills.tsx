import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Heart, Ban, Clock, TrendingUp } from "lucide-react";

type DrillFeedback = {
  id: number;
  drillId: string;
  title: string | null;
  description: string | null;
  category: string | null;
  rating: number | null;
  favorite: boolean | null;
  banned: boolean | null;
  timesUsed: number | null;
  lastUsedDate: string | null;
  focusTags: string[] | null;
};

type TabId = "favorites" | "top-rated" | "most-used" | "banned";

export default function MyDrills() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("favorites");

  const { data: allDrills, isLoading } = useQuery<DrillFeedback[]>({
    queryKey: ["/api/drill-feedback"],
  });

  const updateFeedback = useMutation({
    mutationFn: async (data: Partial<DrillFeedback> & { drillId: string }) => {
      return apiRequest("POST", "/api/drill-feedback", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drill-feedback"] });
    },
  });

  const favorites = allDrills?.filter(d => d.favorite) || [];
  const topRated = [...(allDrills || [])].filter(d => (d.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const mostUsed = [...(allDrills || [])].filter(d => (d.timesUsed || 0) > 0).sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0));
  const banned = allDrills?.filter(d => d.banned) || [];

  const tabs: { id: TabId; label: string; icon: typeof Star; count: number }[] = [
    { id: "favorites", label: t.myDrills.favorites, icon: Heart, count: favorites.length },
    { id: "top-rated", label: t.myDrills.topRated, icon: Star, count: topRated.length },
    { id: "most-used", label: t.myDrills.mostUsed, icon: TrendingUp, count: mostUsed.length },
    { id: "banned", label: t.myDrills.banned, icon: Ban, count: banned.length },
  ];

  const getActiveDrills = (): DrillFeedback[] => {
    switch (activeTab) {
      case "favorites": return favorites;
      case "top-rated": return topRated;
      case "most-used": return mostUsed;
      case "banned": return banned;
      default: return [];
    }
  };

  const handleToggleFavorite = async (drill: DrillFeedback) => {
    await updateFeedback.mutateAsync({
      drillId: drill.drillId,
      title: drill.title,
      favorite: !drill.favorite,
    });
    toast({ title: drill.favorite ? t.myDrills.removedFromFavorites : t.myDrills.addedToFavorites });
  };

  const handleToggleBan = async (drill: DrillFeedback) => {
    await updateFeedback.mutateAsync({
      drillId: drill.drillId,
      title: drill.title,
      banned: !drill.banned,
    });
    toast({ title: drill.banned ? t.myDrills.drillUnbanned : t.myDrills.drillBanned });
  };

  const handleRate = async (drill: DrillFeedback, rating: number) => {
    await updateFeedback.mutateAsync({
      drillId: drill.drillId,
      title: drill.title,
      rating,
    });
  };

  const activeDrills = getActiveDrills();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "favorites": return t.myDrills.noFavorites;
      case "banned": return t.myDrills.noBanned;
      default: return t.myDrills.noData;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold" data-testid="text-my-drills-title">
        {t.myDrills.title}
      </h1>

      <div className="flex gap-2 flex-wrap" data-testid="tabs-drill-filter">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
            data-testid={`button-tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <Badge variant="secondary" className="text-xs ml-1">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {activeDrills.length === 0 ? (
        <div className="py-16 text-center bg-secondary/30 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground" data-testid="text-no-drills">
            {getEmptyMessage()}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeDrills.map(drill => (
            <Card key={drill.id} className="p-4 space-y-3" data-testid={`card-drill-${drill.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" data-testid={`text-drill-title-${drill.id}`}>
                    {drill.title || drill.drillId}
                  </h3>
                  {drill.category && (
                    <Badge variant="outline" className="text-xs mt-1">{drill.category}</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(drill)}
                    data-testid={`button-fav-${drill.id}`}
                  >
                    <Heart className={`w-4 h-4 ${drill.favorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleBan(drill)}
                    data-testid={`button-ban-${drill.id}`}
                  >
                    <Ban className={`w-4 h-4 ${drill.banned ? "fill-orange-500 text-orange-500" : ""}`} />
                  </Button>
                </div>
              </div>

              {drill.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{drill.description}</p>
              )}

              <div className="flex items-center gap-1" data-testid={`rating-${drill.id}`}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => handleRate(drill, n)}
                    className="p-0.5"
                    data-testid={`button-rate-${drill.id}-${n}`}
                  >
                    <Star className={`w-4 h-4 ${(drill.rating || 0) >= n ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {drill.focusTags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t.myDrills.usedCount} {drill.timesUsed || 0}x
                </span>
                {drill.lastUsedDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(drill.lastUsedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
