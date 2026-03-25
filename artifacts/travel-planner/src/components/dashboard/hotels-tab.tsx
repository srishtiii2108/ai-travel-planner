import React from "react";
import { Star, MapPin, Check, Tag } from "lucide-react";
import { GlassCard } from "../shared";
import { cn } from "@/lib/utils";
import type { TravelPlanResponse } from "@workspace/api-client-react";

const INR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const FALLBACKS = [
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&fit=crop",
  "https://images.unsplash.com/photo-1571003497678-75c1a84f3ccb?w=800&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&fit=crop",
];

const CATEGORY_COLORS: Record<string, string> = {
  budget: "bg-green-500/15 text-green-400 border-green-500/30",
  "mid-range": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  luxury: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export function HotelsTab({ plan }: { plan: TravelPlanResponse }) {
  if (!plan.hotels || plan.hotels.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold">No hotels found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plan.hotels.map((hotel, idx) => (
        <GlassCard
          key={hotel.id}
          className={cn(
            "p-0 flex flex-col group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300",
            hotel.isRecommended && "ring-2 ring-primary/40"
          )}
        >
          {/* Image Header */}
          <div className="relative h-52 overflow-hidden rounded-t-xl">
            <img
              src={hotel.imageUrl || FALLBACKS[idx % FALLBACKS.length]}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { e.currentTarget.src = FALLBACKS[idx % FALLBACKS.length]; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            {hotel.isRecommended && (
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" /> Top Pick
              </div>
            )}

            {hotel.category && (
              <div className={cn(
                "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold border capitalize flex items-center gap-1",
                CATEGORY_COLORS[hotel.category] ?? "bg-secondary text-foreground border-border"
              )}>
                <Tag className="w-3 h-3" />
                {hotel.category}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="font-display font-bold text-xl text-white leading-tight mb-1">{hotel.name}</h4>
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <div className="flex">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>•</span>
                <span>{hotel.rating}/5</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground max-w-[60%]">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="truncate" title={hotel.location}>{hotel.location}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-xl font-bold text-primary">{INR(hotel.pricePerNight)}</div>
                <div className="text-xs font-medium text-muted-foreground">per night</div>
              </div>
            </div>

            <p className="text-sm text-foreground/70 mb-4 line-clamp-3 leading-relaxed flex-1">
              {hotel.description}
            </p>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hotel.amenities.slice(0, 4).map(am => (
                  <span key={am} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/60 border border-border text-[11px] font-semibold text-foreground/80">
                    <Check className="w-3 h-3 text-primary" /> {am}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/60 border border-border text-[11px] font-semibold text-muted-foreground">
                    +{hotel.amenities.length - 4}
                  </span>
                )}
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Total Stay</span>
                <span className="font-bold text-lg text-foreground">{INR(hotel.totalPrice)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
