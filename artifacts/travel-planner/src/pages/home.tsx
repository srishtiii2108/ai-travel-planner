import React, { useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { TravelForm } from "@/components/travel-form";
import { LoadingScreen } from "@/components/loading-screen";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { SavedTripsDrawer } from "@/components/saved-trips-drawer";
import { useGenerateTravelPlan } from "@/hooks/use-travel";
import { useToast } from "@/hooks/use-toast";
import type { TravelPlanRequest, TravelPlanResponse } from "@workspace/api-client-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [activePlan, setActivePlan] = useState<TravelPlanResponse | null>(null);
  const [activeRequest, setActiveRequest] = useState<TravelPlanRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { mutate: generatePlan, isPending } = useGenerateTravelPlan({
    mutation: {
      onSuccess: (data, variables) => {
        setActivePlan(data);
        setActiveRequest(variables.data);
      },
      onError: (err) => {
        toast({ 
          title: "Generation Failed", 
          description: err.message || "The AI agents encountered an error. Please try again.", 
          variant: "destructive" 
        });
      }
    }
  });

  const handleSearch = (data: TravelPlanRequest) => {
    setActivePlan(null);
    generatePlan({ data });
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActivePlan(null)}
          >
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
            <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">WanderAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold px-4 py-2.5 rounded-full transition-all"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">My Trips</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 flex flex-col relative">
        {!activePlan && !isPending && (
          <div className="relative w-full py-20 lg:py-32 flex flex-col items-center">
            {/* landing page hero scenic mountain landscape */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://pixabay.com/get/g1eb0bcba929110150b7b1bfe3ea6ea41583898c6e18fb4a14b60a3b1e305faade58b3ea9b4aa0a5cf6f64ed70f769cadafb301bee1f99fbfee93e1394a7ede1c_1280.jpg" 
                alt="Scenic travel background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
            </div>

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight drop-shadow-2xl">
                Where will <span className="text-primary-foreground bg-primary px-5 py-2 rounded-3xl inline-block -rotate-2 mx-2 shadow-xl shadow-primary/30">AI</span> take you?
              </h1>
              <p className="mt-8 text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                Experience hyper-personalized itineraries, optimized transport, and handpicked stays—curated by specialized AI agents in seconds.
              </p>
            </div>

            <TravelForm onSubmit={handleSearch} />
          </div>
        )}

        {isPending && <LoadingScreen />}

        {activePlan && !isPending && activeRequest && (
          <ResultsDashboard plan={activePlan} request={activeRequest} onBack={() => setActivePlan(null)} />
        )}
      </main>

      <SavedTripsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSelectTrip={(plan, req) => {
          setActivePlan(plan);
          setActiveRequest(req);
          setIsDrawerOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
