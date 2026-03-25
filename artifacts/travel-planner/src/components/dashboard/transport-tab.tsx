import React, { useState } from "react";
import { Plane, Train, Bus, Ship, Clock, Star, Zap, IndianRupee } from "lucide-react";
import { GlassCard } from "../shared";
import { cn } from "@/lib/utils";
import type { TravelPlanResponse } from "@workspace/api-client-react";

const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const FILTER_TABS = [
  { key: "all", label: "All Options" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
  { key: "recommended", label: "Recommended" },
];

export function TransportTab({ plan }: { plan: TravelPlanResponse }) {
  const [filter, setFilter] = useState("all");

  const getIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'ferry': return <Ship className="w-5 h-5" />;
      default: return <Train className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight': return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 'train': return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 'bus': return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const formatTime = (t: string) => {
    try {
      return new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return t;
    }
  };

  if (!plan.transport || plan.transport.length === 0) {
    return (
      <div className="text-center py-20">
        <Train className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold">No transport required</h3>
        <p className="text-muted-foreground mt-2">All activities are local or transport was not requested.</p>
      </div>
    );
  }

  const filtered = filter === "all"
    ? plan.transport
    : filter === "recommended"
      ? plan.transport.filter(t => t.isRecommended || t.filter === "recommended")
      : plan.transport.filter(t => t.filter === filter);

  const displayed = filtered.length > 0 ? filtered : plan.transport;

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-200",
              filter === tab.key
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-background/80 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {tab.key === "cheapest" && <IndianRupee className="w-3 h-3 inline mr-1" />}
            {tab.key === "fastest" && <Zap className="w-3 h-3 inline mr-1" />}
            {tab.key === "recommended" && <Star className="w-3 h-3 inline mr-1" />}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayed.map((option) => (
          <GlassCard
            key={option.id}
            className={cn(
              "p-0 flex flex-col group hover:-translate-y-1 transition-all duration-300",
              option.isRecommended && "ring-2 ring-primary/40"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg border", getModeColor(option.mode))}>
                  {getIcon(option.mode)}
                </div>
                <div>
                  <h4 className="font-bold text-base leading-tight">{option.carrier}</h4>
                  {option.trainNumber && (
                    <p className="text-xs text-primary/80 font-semibold">{option.trainNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize">{option.mode} • {option.class}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                {option.isRecommended && (
                  <div className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Best Pick
                  </div>
                )}
                {option.filter === "cheapest" && (
                  <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" /> Cheapest
                  </div>
                )}
                {option.filter === "fastest" && (
                  <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Fastest
                  </div>
                )}
              </div>
            </div>

            {/* Journey timeline */}
            <div className="p-5 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-5 relative">
                <div className="absolute left-[25%] right-[25%] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border/70 z-0" />

                <div className="text-center relative z-10 bg-card px-1">
                  <p className="font-display text-xl font-bold">{formatTime(option.departureTime)}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Depart</p>
                </div>

                <div className="relative z-10 bg-card px-3 py-1 rounded-full border border-border flex items-center gap-1 text-xs font-medium text-foreground/70">
                  <Clock className="w-3 h-3" /> {option.duration}
                </div>

                <div className="text-center relative z-10 bg-card px-1">
                  <p className="font-display text-xl font-bold">{formatTime(option.arrivalTime)}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Arrive</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="text-sm font-medium text-muted-foreground">
                  {option.stops === 0 ? (
                    <span className="text-green-500 font-semibold">Direct</span>
                  ) : (
                    <span>{option.stops} {option.stops === 1 ? 'stop' : 'stops'}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-primary">{INR(option.price)}</div>
                  <div className="text-xs font-medium text-muted-foreground">{INR(option.pricePerPerson)} / person</div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
