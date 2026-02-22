import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function AuthPage() {
  const { t } = useLanguage();
  const authT = (t as any).auth || {};

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1C2D]">
      {/* Left Hero Side */}
      <div className="flex-1 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
           <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-display text-white tracking-wider flex items-center gap-2 mb-12">
            <span className="text-accent text-3xl">⚡</span> 
            COACH<span className="text-accent">AI</span>
          </h1>
          
          <div className="max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {authT.heroTitle1 || "Dominate the"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-red-600">
                {authT.heroTitle2 || "Coaching Game"}
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              {authT.heroDescription || "Generate professional-grade training sessions in seconds using advanced AI tailored to your team's unique DNA."}
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
          <div className="flex flex-col gap-2">
            <Activity className="w-8 h-8 text-accent" />
            <h3 className="font-bold text-white">{authT.smartAnalytics || "Smart Analytics"}</h3>
            <p className="text-sm text-gray-400">{authT.smartAnalyticsDesc || "Track drill ratios and skill development over time."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Zap className="w-8 h-8 text-blue-400" />
            <h3 className="font-bold text-white">{authT.instantGen || "Instant Gen"}</h3>
            <p className="text-sm text-gray-400">{authT.instantGenDesc || "Create full 60min plans in under 30 seconds."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <ShieldCheck className="w-8 h-8 text-green-400" />
            <h3 className="font-bold text-white">{authT.proMethodology || "Pro Methodology"}</h3>
            <p className="text-sm text-gray-400">{authT.proMethodologyDesc || "Based on Swedish, Canadian, and USA Hockey models."}</p>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="lg:w-[600px] bg-white flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-display text-primary">{authT.welcomeBack || "Welcome Back"}</h2>
            <p className="text-muted-foreground mt-2">{authT.signInSubtitle || "Sign in to access your coaching dashboard."}</p>
          </div>

          <div className="space-y-4 pt-8">
            <Button 
              size="lg" 
              className="w-full bg-[#0B1C2D] hover:bg-[#0B1C2D]/90 text-white h-12 text-base shadow-lg"
              onClick={handleLogin}
            >
              {authT.loginButton || "Log in with Replit"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">{authT.or || "Or"}</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {authT.noAccount || "Don't have an account? Simply log in to get started automatically."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
