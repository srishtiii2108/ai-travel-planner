import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Trash2, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useGetSavedTrips, useDeleteTrip, getGetSavedTripsQueryKey } from "@/hooks/use-travel";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { TravelPlanResponse, TravelPlanRequest } from "@workspace/api-client-react";

const INR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrip: (plan: TravelPlanResponse, request: TravelPlanRequest) => void;
}

export function SavedTripsDrawer({ isOpen, onClose, onSelectTrip }: SavedTripsDrawerProps) {
  const { data, isLoading } = useGetSavedTrips();
  const trips = data?.trips || [];

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: deleteTrip } = useDeleteTrip({
    mutation: {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Trip removed from your saved list." });
        queryClient.invalidateQueries({ queryKey: getGetSavedTripsQueryKey() });
      }
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-card">
              <div>
                <h2 className="font-display font-bold text-2xl">Saved Trips 🇮🇳</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your AI-generated India travel plans</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
              {isLoading && (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Loading your trips...</p>
                </div>
              )}

              {!isLoading && trips.length === 0 && (
                <div className="text-center py-20 px-4">
                  <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No saved trips yet</h3>
                  <p className="text-muted-foreground text-sm">Generate an AI travel plan and save it to view it here.</p>
                </div>
              )}

              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative cursor-pointer"
                  onClick={() => onSelectTrip(trip.plan, trip.request)}
                >
                  <div className="h-24 w-full relative">
                    <img
                      src={trip.plan.imageUrl || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <h3 className="absolute bottom-3 left-4 text-white font-display font-bold text-xl drop-shadow-md">{trip.name}</h3>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(trip.startDate), "MMM d, yy")}
                      </span>
                      <span className="font-bold text-primary">{INR(trip.totalCost)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                        View Plan <ArrowRight className="w-3 h-3" />
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTrip({ id: trip.id }); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
