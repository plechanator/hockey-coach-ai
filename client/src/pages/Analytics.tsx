import { useAnalytics } from "@/hooks/use-analytics";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";

const CHART_COLORS = [
  "#378B9B", "#5BA3B5", "#E8886F", "#5EAA8D", "#8B7FBF",
  "#7ABFC4", "#D4956B", "#6B9E78", "#A88EC4", "#4A95A8",
];

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-56 rounded-md" />)}
        </div>
      </div>
    );
  }

  const focusData = Object.entries(analytics?.focusDistribution || {}).map(([name, value]) => ({
    name, value: value as number
  }));

  const methodologyData = Object.entries(analytics?.methodologyDistribution || {}).map(([name, value]) => ({
    name, value: value as number
  }));

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-2xl font-semibold" data-testid="text-analytics-title">
        {t.analytics.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-sessions">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.dashboard.totalSessions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{analytics?.totalTrainings || 0}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-drill-ratio">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.dashboard.avgDrillRatio}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{analytics?.averageDrillRatio || 0}%</p>
          </CardContent>
        </Card>
        <Card data-testid="card-focus-count">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.analytics.focusAreasUsed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{focusData.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card data-testid="card-focus-distribution">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.analytics.skillDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {focusData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">{t.analytics.noData}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={focusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {focusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-methodology-distribution">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.analytics.methodologyDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {methodologyData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">{t.analytics.noData}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={methodologyData} barCategoryGap="25%">
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="value" fill="#378B9B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
