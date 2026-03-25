import React from "react";
import { Plane, Train, Bus, Ship, ArrowRight, Clock, Star } from "lucide-react";
import { GlassCard } from "../shared";
import type { TravelPlanResponse } from "@workspace/api-client-react";

export function TransportTab({ plan }: { plan: TravelPlanResponse }) {
  
  const getIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight': return <Plane className="w-6 h-6" />;
      case 'train': return <Train className="w-6 h-6" />;
      case 'bus': return <Bus className="w-6 h-6" />;
      case 'ferry': return <Ship className="w-6 h-6" />;
      default: return <Plane className="w-6 h-6" />;
    }
  };

  if (!plan.transport || plan.transport.length === 0) {
    return (
      <div className="text-center py-20">
        <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold">No transport required</h3>
        <p className="text-muted-foreground mt-2">All activities are local or transport was not requested.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plan.transport.map((option) => (
        <GlassCard key={option.id} className="p-0 flex flex-col group hover:-translate-y-1 transition-all duration-300">
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex justify-between items-center bg-card/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                {getIcon(option.mode)}
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight uppercase tracking-wider">{option.carrier}</h4>
                <p className="text-sm text-muted-foreground capitalize">{option.mode} • {option.class} Class</p>
              </div>
            </div>
            {option.isRecommended && (
              <div className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-current" /> Best Pick
              </div>
            )}
          </div>
          
          {/* Body */}
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-6 relative">
              <div className="absolute left-[30%] right-[30%] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border z-0" />
              
              <div className="text-center relative z-10 bg-card px-2">
                <p className="font-display text-2xl font-bold">{option.departureTime}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Departure</p>
              </div>
              
              <div className="relative z-10 bg-card px-4 py-1 rounded-full border border-border flex items-center gap-1 text-sm font-medium text-foreground/70">
                <Clock className="w-3 h-3" /> {option.duration}
              </div>
              
              <div className="text-center relative z-10 bg-card px-2">
                <p className="font-display text-2xl font-bold">{option.arrivalTime}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Arrival</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
              <div className="text-sm font-medium text-muted-foreground">
                {option.stops === 0 ? (
                  <span className="text-green-500">Non-stop</span>
                ) : (
                  <span>{option.stops} {option.stops === 1 ? 'stop' : 'stops'}</span>
                )}
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-bold text-primary">${option.price}</div>
                <div className="text-xs font-medium text-muted-foreground">${option.pricePerPerson} per person</div>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
