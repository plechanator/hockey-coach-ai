import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

// Pages
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CreateTraining from "@/pages/CreateTraining";
import TrainingDetails from "@/pages/TrainingDetails";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import MyDrills from "@/pages/MyDrills";
import Calendar from "@/pages/Calendar";
import PrintTraining from "@/pages/PrintTraining";
import Inspiration from "@/pages/Inspiration";
import CreatePlan from "@/pages/CreatePlan";
import PlanDetail from "@/pages/PlanDetail";
import KnowledgeBase from "@/pages/KnowledgeBase";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B1C2D]">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    // Ideally this redirects, but for wouter inside render we usually render Redirect
    // However, AuthPage is the route for unauthenticated users, so we can just return AuthPage or redirect
    return <AuthPage />; 
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-60 pt-[56px] lg:pt-0 p-4 lg:p-8 max-w-6xl">
        <Component />
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <Switch>
        <Route path="/api/login" component={() => { window.location.href = "/api/login"; return null; }} />
        <Route component={AuthPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/create-training" component={() => <ProtectedRoute component={CreateTraining} />} />
      <Route path="/training/:id/print" component={() => <PrintTraining />} />
      <Route path="/training/:id" component={() => <ProtectedRoute component={TrainingDetails} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      <Route path="/my-drills" component={() => <ProtectedRoute component={MyDrills} />} />
      <Route path="/calendar" component={() => <ProtectedRoute component={Calendar} />} />
      <Route path="/inspiration" component={() => <ProtectedRoute component={Inspiration} />} />
      <Route path="/create-plan" component={() => <ProtectedRoute component={CreatePlan} />} />
      <Route path="/plans/:id" component={() => <ProtectedRoute component={PlanDetail} />} />
      <Route path="/knowledge" component={() => <ProtectedRoute component={KnowledgeBase} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
