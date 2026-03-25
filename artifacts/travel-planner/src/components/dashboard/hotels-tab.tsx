import React from "react";
import { Star, MapPin, Check } from "lucide-react";
import { GlassCard } from "../shared";
import type { TravelPlanResponse } from "@workspace/api-client-react";

export function HotelsTab({ plan }: { plan: TravelPlanResponse }) {
  
  if (!plan.hotels || plan.hotels.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold">No hotels selected</h3>
      </div>
    );
  }

  // Fallback images if API doesn't return one or it's broken
  const fallbacks = [
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&fit=crop",
    "https://images.unsplash.com/photo-1571003497678-75c1a84f3ccb?w=800&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plan.hotels.map((hotel, idx) => (
        <GlassCard key={hotel.id} className="p-0 flex flex-col group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
          {/* Image Header */}
          <div className="relative h-56 overflow-hidden">
            <img 
              src={hotel.imageUrl || fallbacks[idx % fallbacks.length]} 
              alt={hotel.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { e.currentTarget.src = fallbacks[idx % fallbacks.length] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {hotel.isRecommended && (
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" /> Top Choice
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="font-display font-bold text-2xl text-white leading-tight mb-1">{hotel.name}</h4>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <div className="flex">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
                <span>•</span>
                <span>{hotel.rating}/5 rating</span>
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground max-w-[65%]">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate" title={hotel.location}>{hotel.location}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-2xl font-bold text-primary">${hotel.pricePerNight}</div>
                <div className="text-xs font-medium text-muted-foreground">per night</div>
              </div>
            </div>
            
            <p className="text-sm text-foreground/80 mb-6 line-clamp-3 leading-relaxed flex-1">
              {hotel.description}
            </p>
            
            <div className="mt-auto">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Amenities</h5>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 4).map(am => (
                  <span key={am} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/60 border border-border text-[11px] font-semibold text-foreground/80">
                    <Check className="w-3 h-3 text-primary" /> {am}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary/60 border border-border text-[11px] font-semibold text-foreground/80">
                    +{hotel.amenities.length - 4} more
                  </span>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm">
                <span className="font-semibold text-muted-foreground">Total Stay</span>
                <span className="font-bold text-lg">${hotel.totalPrice}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
