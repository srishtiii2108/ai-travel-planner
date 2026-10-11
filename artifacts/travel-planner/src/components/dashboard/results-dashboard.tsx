import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Share, Sparkles, CheckCircle2, Calendar, Users, ArrowLeft, FileDown } from "lucide-react";
import { PremiumButton, GlassCard } from "../shared";
import { ItineraryTab } from "./itinerary-tab";
import { TransportTab } from "./transport-tab";
import { HotelsTab } from "./hotels-tab";
import { WeatherTab } from "./weather-tab";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSaveTrip, getGetSavedTripsQueryKey } from "@/hooks/use-travel";
import { useQueryClient } from "@tanstack/react-query";
import type { TravelPlanResponse, TravelPlanRequest } from "@workspace/api-client-react";

const INR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

interface ResultsDashboardProps {
  plan: TravelPlanResponse;
  request: TravelPlanRequest;
  onBack: () => void;
}

export function ResultsDashboard({ plan, request, onBack }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'transport' | 'hotels' | 'weather'>('itinerary');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: saveTrip, isPending: isSaving } = useSaveTrip({
    mutation: {
      onSuccess: () => {
        toast({ title: "✨ Trip Saved!", description: "Find it in your Saved Trips." });
        queryClient.invalidateQueries({ queryKey: getGetSavedTripsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save trip. Please try again.", variant: "destructive" });
      }
    }
  });

  const handleSave = () => {
    saveTrip({
      data: {
        name: `${plan.destination} Adventure`,
        plan,
        request
      }
    });
  };


  const handleDownloadPDF = () => {
    const itinerary = plan.itinerary ?? [];
    const destination = plan.destination ?? "Trip";
    const dates = `${request.startDate} to ${request.endDate}`;
    const travelers = request.travelers;
    const totalCost = INR(plan.totalEstimatedCost ?? 0);

    let html = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>WanderAI - ${destination} Itinerary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 900px; margin: 0 auto; }
          h1 { color: #FF6B35; font-size: 28px; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 30px; }
          .meta { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 30px; display: flex; gap: 30px; }
          .meta-item { font-size: 14px; } .meta-label { color: #888; font-size: 12px; }
          .day { margin-bottom: 32px; page-break-inside: avoid; }
          .day-header { background: #FF6B35; color: white; padding: 10px 16px; border-radius: 8px 8px 0 0; font-size: 16px; font-weight: bold; }
          .day-theme { background: #fff3ee; padding: 8px 16px; font-size: 13px; color: #FF6B35; border-left: 4px solid #FF6B35; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 13px; color: #555; border-bottom: 2px solid #eee; }
          td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
          .cost { color: #16a34a; font-weight: bold; }
          .day-total { background: #f9f9f9; padding: 10px 16px; text-align: right; font-size: 13px; font-weight: bold; color: #FF6B35; border-radius: 0 0 8px 8px; border-top: 2px solid #eee; }
          .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          .total-box { background: #fff3ee; border: 2px solid #FF6B35; border-radius: 8px; padding: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 14px; color: #888; }
          .total-amount { font-size: 24px; font-weight: bold; color: #FF6B35; }
        </style>
      </head>
      <body>
        <h1>🇮🇳 WanderAI — India Edition</h1>
        <div class="subtitle">AI-Generated Travel Itinerary</div>
        <div class="meta">
          <div class="meta-item"><div class="meta-label">DESTINATION</div><strong>${destination}</strong></div>
          <div class="meta-item"><div class="meta-label">DATES</div><strong>${dates}</strong></div>
          <div class="meta-item"><div class="meta-label">TRAVELLERS</div><strong>${travelers}</strong></div>
        </div>
        <div class="total-box">
          <div class="total-label">TOTAL ESTIMATED COST</div>
          <div class="total-amount">${totalCost}</div>
        </div>
    `;

    itinerary.forEach((day: any) => {
      const dayTotal = INR(day.estimatedCost ?? 0);
      html += `
        <div class="day">
          <div class="day-header">Day ${day.day} — ${day.date}</div>
          <div class="day-theme">${day.theme ?? ""}</div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Location</th>
                <th>Cost/Person</th>
              </tr>
            </thead>
            <tbody>
      `;
      (day.activities ?? []).forEach((act: any) => {
        html += `
          <tr>
            <td>${act.time ?? ""}</td>
            <td><strong>${act.name ?? ""}</strong></td>
            <td>${act.description ?? ""}</td>
            <td>${act.location ?? ""}</td>
            <td class="cost">₹${act.estimatedCost ?? 0}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
          <div class="day-total">Day Total: ${dayTotal}</div>
        </div>
      `;
    });

    html += `
        <div class="footer">Generated by WanderAI — India Edition 🇮🇳 | All prices in INR</div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleShare = async () => {
    try {
      // Save trip first to get ID
      const response = await fetch("/api/travel/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${plan.destination} Adventure`, plan, request })
      });
      if (!response.ok) throw new Error("Failed to save trip");
      const saved = await response.json();
      const tripId = saved.id;
      // Build the link from the site the user is on right now (works on
      // localhost, Vercel preview and production without any config).
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      const shareUrl = `${window.location.origin}${basePath}/trip/${tripId}`;
      const text = `Check out my AI-planned trip to ${plan.destination}!
Estimated Cost: ${INR(plan.totalEstimatedCost)}
${plan.itinerary?.length ?? 0} Days of exploration.

Planned with WanderAI — India Edition 🇮🇳

${shareUrl}`;
      await navigator.clipboard.writeText(text);
      toast({ title: "📋 Copied!", description: "Share link copied! Anyone can view this trip." });
    } catch {
      toast({ title: "Error", description: "Failed to generate share link.", variant: "destructive" });
    }
  };

  const budgetPct = Math.min(100, Math.max(0, (plan.totalEstimatedCost / request.budget) * 100));

  const budgetBarColor =
    plan.budgetStatus === 'exceeded' ? "bg-red-500" :
    plan.budgetStatus === 'optimized' ? "bg-amber-500" :
    "bg-green-500";

  const budgetTextColor =
    plan.budgetStatus === 'exceeded' ? "text-red-500" :
    plan.budgetStatus === 'optimized' ? "text-amber-500" :
    "text-green-500";

  const budgetLabel =
    plan.budgetStatus === 'exceeded' ? "Over Budget" :
    plan.budgetStatus === 'optimized' ? "Optimised" :
    "Within Budget";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in duration-700">

      {/* Header Actions */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <PremiumButton variant="ghost" onClick={onBack} className="pl-2">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </PremiumButton>
        <div className="flex gap-3">
          <PremiumButton variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="w-4 h-4" /> Download PDF
          </PremiumButton>
          <PremiumButton variant="outline" onClick={handleShare}>
            <Share className="w-4 h-4" /> Share
          </PremiumButton>
          <PremiumButton onClick={handleSave} isLoading={isSaving}>
            <Save className="w-4 h-4" /> Save Trip
          </PremiumButton>
        </div>
      </div>

      {/* Hero Banner */}
      <GlassCard className="p-0 mb-10 overflow-hidden group">
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={plan.imageUrl || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&fit=crop"}
            alt={plan.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🇮🇳</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg">{plan.destination}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium">
              <span className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-sm">
                <Calendar className="w-4 h-4" />
                {format(parseISO(request.startDate), "MMM do")} — {format(parseISO(request.endDate), "MMM do, yyyy")}
              </span>
              <span className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-sm">
                <Users className="w-4 h-4" />
                {request.travelers} {request.travelers === 1 ? 'Traveller' : 'Travellers'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Budget Card */}
          <GlassCard className="p-6 border-t-4 border-t-primary">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Estimated Cost</h3>
            <div className="flex items-end justify-between mb-4">
              <div className="font-display text-4xl font-bold text-foreground">{INR(plan.totalEstimatedCost)}</div>
              <div className="text-sm font-semibold text-muted-foreground pb-1">/ {INR(request.budget)}</div>
            </div>

            <div className="w-full bg-secondary rounded-full h-3 mb-2 overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPct}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("h-full rounded-full", budgetBarColor)}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">{Math.round(budgetPct)}% used</span>
              <span className={budgetTextColor}>{budgetLabel}</span>
            </div>
          </GlassCard>

          {/* Optimization Card */}
          <GlassCard className="p-6 bg-gradient-to-br from-card to-primary/5">
            <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-5">
              <Sparkles className="text-primary w-5 h-5" /> AI Optimisation
            </h3>

            {plan.optimization.savings > 0 && (
              <div className="bg-background/80 rounded-xl p-4 border border-border/50 mb-5 flex justify-between items-center shadow-inner">
                <span className="text-sm font-bold text-muted-foreground">Savings Found</span>
                <span className="font-display font-bold text-2xl text-green-500">{INR(plan.optimization.savings)}</span>
              </div>
            )}

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Agent Decisions</h4>
              <ul className="space-y-3">
                {plan.optimization.decisions.map((dec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground items-start">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-snug">{dec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* Main Tabs Area */}
        <div className="lg:col-span-8">
          <div className="flex p-1.5 bg-secondary/50 backdrop-blur-md border border-border/50 rounded-2xl w-full sm:w-fit mb-8 overflow-x-auto">
            {((['itinerary', 'transport', 'hotels', 'weather'] as const)).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-md border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {tab === 'itinerary' ? '🗓️ Itinerary' : tab === 'transport' ? '🚆 Transport' : tab === 'hotels' ? '🏨 Hotels' : tab === 'weather' ? '🌤️ Weather' : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'itinerary' && <ItineraryTab plan={plan} />}
              {activeTab === 'transport' && <TransportTab plan={plan} />}
              {activeTab === 'hotels' && <HotelsTab plan={plan} />}
              {activeTab === 'weather' && <WeatherTab destination={plan.destination ?? ''} startDate={request.startDate} endDate={request.endDate} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
