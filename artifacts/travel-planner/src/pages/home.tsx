import React, { useState } from "react";
import { Menu, Sun, Moon, LogIn, LogOut, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { TravelForm } from "@/components/travel-form";
import { LoadingScreen } from "@/components/loading-screen";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { SavedTripsDrawer } from "@/components/saved-trips-drawer";
import { useGenerateTravelPlan } from "@/hooks/use-travel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/replit-auth-web";
import type { TravelPlanRequest, TravelPlanResponse } from "@workspace/api-client-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, isAuthenticated, login, logout } = useAuth();

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

  const handleMyTrips = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please sign in with Replit to save and view your trips.",
      });
      login();
      return;
    }
    setIsDrawerOpen(true);
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
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="WanderAI Logo"
              className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">WanderAI</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-0.5">India Edition 🇮🇳</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth button */}
            {!isAuthLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMyTrips}
                    className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold px-4 py-2.5 rounded-full transition-all"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">My Trips</span>
                  </button>
                  <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-full">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-semibold hidden md:inline">{user?.firstName ?? user?.email?.split('@')[0] ?? 'User'}</span>
                    <button
                      onClick={logout}
                      className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20 flex flex-col relative">
        {!activePlan && !isPending && (
          <div className="relative w-full py-20 lg:py-32 flex flex-col items-center">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&auto=format&fit=crop"
                alt="India travel background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
            </div>

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-bold text-sm px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                <span>🇮🇳</span> India-Only Travel Planner · All Prices in ₹ INR
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight drop-shadow-2xl">
                Where will <span className="text-primary-foreground bg-primary px-5 py-2 rounded-3xl inline-block -rotate-2 mx-2 shadow-xl shadow-primary/30">AI</span> take you?
              </h1>
              <p className="mt-8 text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                Hyper-personalized Indian itineraries, Indian Railways transport, and handpicked stays — curated by 5 AI agents in seconds.
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
