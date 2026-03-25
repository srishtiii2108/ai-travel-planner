import { plannerAgent } from "./plannerAgent.js";
import { transportAgent } from "./transportAgent.js";
import { accommodationAgent } from "./accommodationAgent.js";
import { optimizationAgent } from "./optimizationAgent.js";
import type { OptimizationResult } from "./optimizationAgent.js";

const CITY_IMAGES: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  mumbai: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&auto=format&fit=crop",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop",
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop",
  goa: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=1200&auto=format&fit=crop",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  varanasi: "https://images.unsplash.com/photo-1561361058-c24e14fce6cc?w=1200&auto=format&fit=crop",
  agra: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop",
  bengaluru: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop",
  chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop",
  kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&auto=format&fit=crop",
  hyderabad: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&fit=crop",
  udaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop",
  manali: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  shimla: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop",
  rishikesh: "https://images.unsplash.com/photo-1591018533308-5b6c0f7c2134?w=1200&auto=format&fit=crop",
  mysuru: "https://images.unsplash.com/photo-1600100397608-4a08f0fce8bf?w=1200&auto=format&fit=crop",
  mysore: "https://images.unsplash.com/photo-1600100397608-4a08f0fce8bf?w=1200&auto=format&fit=crop",
  pune: "https://images.unsplash.com/photo-1569511166-f1f7cf93f543?w=1200&auto=format&fit=crop",
  ahmedabad: "https://images.unsplash.com/photo-1622397815993-1d3aa55d7e90?w=1200&auto=format&fit=crop",
};

function getCityImage(destination: string): string {
  const key = destination.toLowerCase().trim().split(/[\s,]+/)[0];
  return CITY_IMAGES[key] ?? CITY_IMAGES.default;
}

export interface CoordinatorInput {
  destination: string;
  budget: number;
  startDate: string;
  endDate: string;
  travelers: number;
  preferences: string[];
  origin?: string;
}

export async function coordinatorAgent(input: CoordinatorInput): Promise<OptimizationResult & { destination: string; imageUrl: string; currency: string }> {
  const preferLow = input.budget < 15000;

  const [itinerary, transport, hotels] = await Promise.all([
    plannerAgent({
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      preferences: input.preferences,
      travelers: input.travelers,
      budgetPerDay: input.budget * 0.3,
    }),
    transportAgent({
      origin: input.origin ?? "nearest major city",
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      travelers: input.travelers,
      budget: input.budget,
      preferLow,
    }),
    accommodationAgent({
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      travelers: input.travelers,
      budget: input.budget,
      preferLow,
      preferences: input.preferences,
    }),
  ]);

  const result = await optimizationAgent(input.budget, itinerary, transport, hotels);

  return {
    ...result,
    destination: input.destination,
    imageUrl: getCityImage(input.destination),
    currency: "INR",
  };
}
