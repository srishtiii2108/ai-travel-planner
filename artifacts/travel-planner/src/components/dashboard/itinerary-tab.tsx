import React from "react";
import { format, parseISO } from "date-fns";
import { MapPin, IndianRupee, Clock, Train, Coffee, Camera, TreePine, Moon, Navigation, ShoppingBag, Heart } from "lucide-react";
import { GlassCard } from "../shared";
import type { TravelPlanResponse } from "@workspace/api-client-react";

const ActivityIcon = ({ type }: { type: string }) => {
  const Icon = (() => {
    switch (type.toLowerCase()) {
      case 'dining': case 'food': return Coffee;
      case 'sightseeing': case 'culture': case 'temples': return Camera;
      case 'leisure': case 'beach': case 'nature': return TreePine;
      case 'nightlife': return Moon;
      case 'transport': return Train;
      case 'shopping': return ShoppingBag;
      case 'wellness': return Heart;
      default: return Navigation;
    }
  })();

  return <Icon className="w-6 h-6 text-primary" />;
};

export function ItineraryTab({ plan }: { plan: TravelPlanResponse }) {
  return (
    <div className="space-y-12">
      {plan.itinerary.map((day) => (
        <div key={day.day} className="relative pl-8 md:pl-0">
          <div className="absolute left-3 top-2 bottom-0 w-px bg-border md:hidden" />

          <div className="md:grid md:grid-cols-12 md:gap-8">

            {/* Day Header */}
            <div className="md:col-span-3 mb-6 md:mb-0 text-left md:text-right relative">
              <div className="sticky top-24">
                <div className="absolute -left-[27px] top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-background md:hidden" />

                <h3 className="font-display font-bold text-4xl text-primary mb-1">Day {day.day}</h3>
                <p className="text-muted-foreground font-semibold text-lg">{format(parseISO(day.date), "EEEE, MMM do")}</p>
                <div className="mt-3 inline-block bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-lg text-sm font-medium border border-border">
                  {day.theme}
                </div>
                <div className="mt-4 flex items-center md:justify-end gap-1.5 text-sm font-semibold text-foreground/80 bg-background/50 py-2 px-3 rounded-lg border border-border/50 w-fit md:ml-auto">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <span>₹{Math.round(day.estimatedCost).toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground font-normal">/ day</span>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="md:col-span-9 space-y-4">
              {day.activities.map((activity, i) => (
                <GlassCard key={i} className="p-5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">

                    <div className="bg-primary/10 p-4 rounded-2xl shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-inner">
                      <ActivityIcon type={activity.type} />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-xl text-foreground">{activity.name}</h4>
                        <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {activity.time}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-base mb-4 leading-relaxed">{activity.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-foreground/80 bg-secondary/50 px-2.5 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {activity.location}
                        </span>
                        {activity.estimatedCost > 0 ? (
                          <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md">
                            ₹{activity.estimatedCost.toLocaleString('en-IN')} / person
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md">
                            Free entry
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
