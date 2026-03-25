import { plannerAgent } from "./plannerAgent.js";
import { transportAgent } from "./transportAgent.js";
import { accommodationAgent } from "./accommodationAgent.js";
import { optimizationAgent } from "./optimizationAgent.js";
import type { OptimizationResult } from "./optimizationAgent.js";

const DESTINATION_IMAGES: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1506905489129-a0d5e4d90b07?w=1200&auto=format&fit=crop",
  paris: "https://images.unsplash.com/photo-1499856871958-5b9357a38afd?w=1200&auto=format&fit=crop",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop",
  new_york: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=1200&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&auto=format&fit=crop",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop",
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&auto=format&fit=crop",
  santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop",
  thailand: "https://images.unsplash.com/photo-1506665531195-3566af2b548e?w=1200&auto=format&fit=crop",
  iceland: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&auto=format&fit=crop",
  amsterdam: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop",
  sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop",
};

function getDestinationImage(destination: string): string {
  const key = destination.toLowerCase().replace(/[^a-z]/g, "_").split("_")[0];
  return DESTINATION_IMAGES[key] ?? DESTINATION_IMAGES.default;
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

export async function coordinatorAgent(input: CoordinatorInput): Promise<OptimizationResult & { destination: string; imageUrl: string }> {
  const preferLow = input.budget < 2000;

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
    imageUrl: getDestinationImage(input.destination),
  };
}
