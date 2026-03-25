import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Sparkles, Mountain, Utensils, Landmark, Umbrella, 
  TreePine, GlassWater, ShoppingBag, Castle, Heart, 
  Minus, Plus, MapPin, Plane, DollarSign, Calendar
} from "lucide-react";
import { PremiumButton, GlassCard } from "./shared";
import { cn } from "@/lib/utils";
import type { TravelPlanRequest } from "@workspace/api-client-react";

const PREFERENCES = [
  { id: 'luxury', label: 'Luxury', icon: Sparkles },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'beach', label: 'Beach', icon: Umbrella },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'nightlife', label: 'Nightlife', icon: GlassWater },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'history', label: 'History', icon: Castle },
  { id: 'wellness', label: 'Wellness', icon: Heart },
];

const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  origin: z.string().optional(),
  budget: z.coerce.number().min(100, "Minimum budget is $100"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  travelers: z.coerce.number().min(1).max(20),
  preferences: z.array(z.string()).min(1, "Select at least one preference")
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date cannot be before start date",
  path: ["endDate"]
});

interface TravelFormProps {
  onSubmit: (data: TravelPlanRequest) => void;
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      origin: "",
      budget: 2500,
      startDate: "",
      endDate: "",
      travelers: 2,
      preferences: ["culture", "food"]
    }
  });

  const handleValidSubmit = (data: z.infer<typeof formSchema>) => {
    const payload: TravelPlanRequest = { ...data };
    if (!payload.origin?.trim()) {
      delete payload.origin;
    }
    onSubmit(payload);
  };

  return (
    <GlassCard className="p-6 md:p-10 max-w-5xl mx-auto w-full mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <form onSubmit={form.handleSubmit(handleValidSubmit)} className="space-y-8">
        
        {/* Destination & Origin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={form.control}
            name="destination"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Where to?</label>
                <input 
                  {...field} 
                  placeholder="e.g. Kyoto, Japan" 
                  className={cn(
                    "w-full px-5 py-4 text-lg rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground",
                    fieldState.error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  )} 
                />
                {fieldState.error && <p className="text-destructive text-xs font-medium">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="origin"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground/80"><Plane className="w-4 h-4 text-primary"/> Origin (Optional)</label>
                <input 
                  {...field} 
                  placeholder="e.g. New York, USA" 
                  className="w-full px-5 py-4 text-lg rounded-xl bg-background/80 border-2 border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50" 
                />
              </div>
            )}
          />
        </div>

        <hr className="border-border/50" />

        {/* Dates & Travelers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            control={form.control}
            name="startDate"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> Start Date</label>
                <input 
                  type="date"
                  {...field} 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer",
                    fieldState.error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  )} 
                />
                {fieldState.error && <p className="text-destructive text-xs font-medium">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="endDate"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> End Date</label>
                <input 
                  type="date"
                  {...field} 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer",
                    fieldState.error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  )} 
                />
                {fieldState.error && <p className="text-destructive text-xs font-medium">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="travelers"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">Travelers</label>
                <div className="flex items-center gap-4 bg-background/80 border-2 border-border rounded-xl p-1">
                  <button 
                    type="button" 
                    onClick={() => field.onChange(Math.max(1, field.value - 1))} 
                    className="p-3 hover:bg-secondary rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-lg">{field.value}</span>
                  <button 
                    type="button" 
                    onClick={() => field.onChange(Math.min(20, field.value + 1))} 
                    className="p-3 hover:bg-secondary rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          />
        </div>

        <hr className="border-border/50" />

        {/* Budget & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <Controller
              control={form.control}
              name="budget"
              render={({ field }) => (
                <div className="space-y-4 bg-background/50 p-6 rounded-2xl border border-border/50">
                  <div className="flex justify-between items-center">
                    <label className="font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/> Total Budget</label>
                    <span className="font-display font-bold text-3xl text-primary">${field.value.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={20000}
                    step={100}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>$100</span>
                    <span>$20,000+</span>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            <Controller
              control={form.control}
              name="preferences"
              render={({ field, fieldState }) => (
                <div className="space-y-3">
                  <label className="font-bold flex items-center gap-2">Travel Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES.map(pref => {
                      const isSelected = field.value.includes(pref.id);
                      return (
                        <button
                          key={pref.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(field.value.filter(p => p !== pref.id));
                            } else {
                              field.onChange([...field.value, pref.id]);
                            }
                          }}
                          className={cn(
                            "px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                              : "bg-background/80 text-foreground/70 border-border hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          <pref.icon className="w-4 h-4" />
                          {pref.label}
                        </button>
                      );
                    })}
                  </div>
                  {fieldState.error && <p className="text-destructive text-xs font-medium">{fieldState.error.message}</p>}
                </div>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <PremiumButton type="submit" size="lg" className="w-full md:w-auto text-lg px-12 group">
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Generate AI Trip Plan
          </PremiumButton>
        </div>
      </form>
    </GlassCard>
  );
}
