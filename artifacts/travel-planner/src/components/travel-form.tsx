import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Sparkles, Mountain, Utensils, Landmark, Umbrella, 
  TreePine, GlassWater, ShoppingBag, Castle, Heart, 
  Minus, Plus, MapPin, Train, IndianRupee, Calendar
} from "lucide-react";
import { PremiumButton, GlassCard } from "./shared";
import { cn } from "@/lib/utils";
import type { TravelPlanRequest } from "@workspace/api-client-react";

const INDIAN_CITIES = [
  "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Allahabad", "Amritsar",
  "Andaman Islands", "Aurangabad", "Bangalore", "Bengaluru", "Bhubaneswar",
  "Bodh Gaya", "Chandigarh", "Chennai", "Cherrapunji", "Coimbatore",
  "Coorg", "Darjeeling", "Dehradun", "Delhi", "Dharamshala",
  "Dibrugarh", "Dispur", "Dwarka", "Gangtok", "Goa",
  "Guwahati", "Hampi", "Haridwar", "Hyderabad", "Imphal",
  "Indore", "Itanagar", "Jaipur", "Jaisalmer", "Jammu",
  "Jodhpur", "Jorhat", "Kaziranga", "Kochi", "Kodaikanal",
  "Kohima", "Kolkata", "Konark", "Kovalam", "Leh",
  "Lucknow", "Madurai", "Majuli", "Manali", "Meghalaya",
  "Mumbai", "Munnar", "Mussoorie", "Mysore", "Mysuru",
  "Nagaland", "Nagpur", "Nainital", "New Delhi", "Ooty",
  "Pachmarhi", "Pelling", "Pondicherry", "Puducherry", "Pune",
  "Puri", "Raipur", "Rajkot", "Rishikesh", "Shillong",
  "Shimla", "Sikkim", "Siliguri", "Srinagar", "Surat",
  "Tawang", "Thiruvananthapuram", "Thrissur", "Udaipur", "Vadodara",
  "Varanasi", "Visakhapatnam", "Vrindavan", "Ziro"
];

const PREFERENCES = [
  { id: 'heritage', label: 'Heritage', icon: Castle },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'food', label: 'Food & Cuisine', icon: Utensils },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'beach', label: 'Beach', icon: Umbrella },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'nightlife', label: 'Nightlife', icon: GlassWater },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'temples', label: 'Temples', icon: Sparkles },
  { id: 'wellness', label: 'Wellness', icon: Heart },
];

const formSchema = z.object({
  destination: z.string().min(2, "Please select an Indian city"),
  origin: z.string().optional(),
  budget: z.coerce.number().min(5000, "Minimum budget is ₹5,000"),
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

function CityAutocomplete({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 1
    ? INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(query.toLowerCase())).slice(0, 8)
    : INDIAN_CITIES.slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = focused && open && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => { setFocused(true); setOpen(true); }}
        placeholder="e.g. Jaipur, Goa, Kerala..."
        className={cn(
          "w-full px-5 py-4 text-lg rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50",
          error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
        )}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
          {filtered.map(city => (
            <button
              key={city}
              type="button"
              onMouseDown={e => { e.preventDefault(); setQuery(city); onChange(city); setOpen(false); setFocused(false); }}
              className="w-full text-left px-5 py-3 hover:bg-primary/10 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" /> {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      origin: "",
      budget: 25000,
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

  const budgetValue = form.watch("budget");
  
  const budgetLabel = budgetValue < 10000 ? "Budget" : budgetValue < 30000 ? "Mid-Range" : "Premium";
  const budgetColor = budgetValue < 10000 ? "text-green-500" : budgetValue < 30000 ? "text-amber-500" : "text-primary";

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
                <label className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary"/> Destination (India Only 🇮🇳)
                </label>
                <CityAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
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
                <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                  <Train className="w-4 h-4 text-primary"/> Travelling From (Optional)
                </label>
                <CityAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
                <p className="text-xs text-muted-foreground">For flight & train recommendations</p>
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
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer",
                    fieldState.error ? "border-destructive" : "border-border focus:border-primary"
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
                  min={form.watch("startDate") || new Date().toISOString().split('T')[0]}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-background/80 border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer",
                    fieldState.error ? "border-destructive" : "border-border focus:border-primary"
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
                    <label className="font-bold flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-primary"/> Total Budget
                    </label>
                    <div className="text-right">
                      <span className="font-display font-bold text-3xl text-primary">₹{field.value.toLocaleString('en-IN')}</span>
                      <span className={cn("ml-2 text-xs font-bold uppercase", budgetColor)}>{budgetLabel}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={500000}
                    step={1000}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>₹5,000</span>
                    <span>₹5,00,000+</span>
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
                            "px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95",
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
          <PremiumButton type="submit" size="lg" className="w-full md:w-auto text-lg px-12 group hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40">
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Generate AI Travel Plan 🇮🇳
          </PremiumButton>
        </div>
      </form>
    </GlassCard>
  );
}
