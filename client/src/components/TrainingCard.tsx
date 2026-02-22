import { Training } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

interface TrainingCardProps {
  training: Training;
}

export function TrainingCard({ training }: TrainingCardProps) {
  const { t } = useLanguage();

  return (
    <Link href={`/training/${training.id}`}>
      <Card className="dashboard-card group cursor-pointer h-full flex flex-col hover:border-accent/30 transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-1.5">
            <Badge variant="outline" className="text-xs">
              {training.methodology}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {training.date && format(new Date(training.date), "MMM d, yyyy")}
            </span>
          </div>
          <CardTitle className="text-base font-semibold group-hover:text-accent transition-colors line-clamp-2">
            {training.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{training.duration} {t.common.min}</span>
            </div>
            {training.drillRatio !== null && (
              <div className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{training.drillRatio}%</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {training.focus?.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(training.focus?.length || 0) > 3 && (
              <span className="text-xs text-muted-foreground px-1">
                +{ (training.focus?.length || 0) - 3 }
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-3">
          <div className="w-full flex items-center justify-between text-sm text-muted-foreground group-hover:text-accent transition-colors">
            <span className="text-xs font-medium">{t.training.viewSession}</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
