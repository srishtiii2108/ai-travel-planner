import { openai } from "@workspace/integrations-openai-ai-server";
import type { ItineraryDay } from "./plannerAgent.js";
import type { TransportOption } from "./transportAgent.js";
import type { HotelOption } from "./accommodationAgent.js";

export interface OptimizationResult {
  itinerary: ItineraryDay[];
  transport: TransportOption[];
  hotels: HotelOption[];
  totalEstimatedCost: number;
  budgetStatus: "within" | "exceeded" | "optimized";
  optimization: {
    decisions: string[];
    savings: number;
    budgetStatus: "within" | "exceeded" | "optimized";
  };
}

export async function optimizationAgent(
  budget: number,
  itinerary: ItineraryDay[],
  transport: TransportOption[],
  hotels: HotelOption[]
): Promise<OptimizationResult> {
  const itineraryCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);
  const recommendedTransport = transport.find(t => t.isRecommended) ?? transport[0];
  const transportCost = recommendedTransport?.price ?? 0;
  const recommendedHotel = hotels.find(h => h.isRecommended) ?? hotels[0];
  const hotelCost = recommendedHotel?.totalPrice ?? 0;
  
  let totalCost = itineraryCost + transportCost + hotelCost;
  const decisions: string[] = [];
  let savings = 0;

  const optimizedTransport = [...transport];
  const optimizedHotels = [...hotels];

  if (totalCost > budget) {
    const overage = totalCost - budget;
    decisions.push(`Budget exceeded by $${Math.round(overage)}. Applying optimizations...`);

    const flightOption = optimizedTransport.find(t => t.mode === "flight" && t.isRecommended);
    const trainOption = optimizedTransport.find(t => t.mode === "train");
    const busOption = optimizedTransport.find(t => t.mode === "bus");
    const cheaperTransport = trainOption ?? busOption;

    if (flightOption && cheaperTransport && cheaperTransport.price < flightOption.price) {
      const saved = flightOption.price - cheaperTransport.price;
      optimizedTransport.forEach(t => t.isRecommended = false);
      const idx = optimizedTransport.findIndex(t => t.id === cheaperTransport.id);
      if (idx >= 0) optimizedTransport[idx].isRecommended = true;
      savings += saved;
      totalCost -= saved;
      decisions.push(`Switched from flight to ${cheaperTransport.mode} to save $${Math.round(saved)}`);
    }

    if (totalCost > budget) {
      const luxuryHotel = optimizedHotels.find(h => h.isRecommended && h.category === "luxury");
      const midRangeHotel = optimizedHotels.find(h => h.category === "mid-range");
      const budgetHotel = optimizedHotels.find(h => h.category === "budget");

      if (luxuryHotel && midRangeHotel) {
        const saved = luxuryHotel.totalPrice - midRangeHotel.totalPrice;
        optimizedHotels.forEach(h => h.isRecommended = false);
        const idx = optimizedHotels.findIndex(h => h.id === midRangeHotel.id);
        if (idx >= 0) optimizedHotels[idx].isRecommended = true;
        savings += saved;
        totalCost -= saved;
        decisions.push(`Downgraded hotel from luxury to mid-range to save $${Math.round(saved)}`);
      } else if (midRangeHotel && budgetHotel && totalCost > budget) {
        const saved = midRangeHotel.totalPrice - budgetHotel.totalPrice;
        optimizedHotels.forEach(h => h.isRecommended = false);
        const idx = optimizedHotels.findIndex(h => h.id === budgetHotel.id);
        if (idx >= 0) optimizedHotels[idx].isRecommended = true;
        savings += saved;
        totalCost -= saved;
        decisions.push(`Downgraded hotel to budget category to save $${Math.round(saved)}`);
      }
    }
  } else {
    decisions.push(`Plan is within budget. Total cost: $${Math.round(totalCost)} of $${budget} budget`);
  }

  if (decisions.length === 1 && totalCost <= budget) {
    decisions.push("All transport and accommodation options are optimally selected for your preferences");
    decisions.push("Itinerary activities are curated to match your travel preferences");
  }

  const finalCost = itineraryCost + (optimizedTransport.find(t => t.isRecommended)?.price ?? transportCost) + (optimizedHotels.find(h => h.isRecommended)?.totalPrice ?? hotelCost);

  let budgetStatus: "within" | "exceeded" | "optimized" = "within";
  if (finalCost > budget) {
    budgetStatus = "exceeded";
  } else if (savings > 0) {
    budgetStatus = "optimized";
  }

  return {
    itinerary,
    transport: optimizedTransport,
    hotels: optimizedHotels,
    totalEstimatedCost: Math.round(finalCost),
    budgetStatus,
    optimization: {
      decisions,
      savings: Math.round(savings),
      budgetStatus,
    },
  };
}
