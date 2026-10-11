import { plannerAgent } from "./plannerAgent.js";
import { transportAgent } from "./transportAgent.js";
import { accommodationAgent } from "./accommodationAgent.js";
import { optimizationAgent } from "./optimizationAgent.js";
import type { OptimizationResult } from "./optimizationAgent.js";

const CITY_IMAGES: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  mumbai: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&auto=format&fit=crop",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop",
  "new delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop",
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  varanasi: "https://images.unsplash.com/photo-1561361058-c24e14fce6cc?w=1200&auto=format&fit=crop",
  agra: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
  bangalore: "https://images.unsplash.com/photo-1538970272646-f61fabb3b8bc?w=1200&auto=format&fit=crop",
  bengaluru: "https://images.unsplash.com/photo-1538970272646-f61fabb3b8bc?w=1200&auto=format&fit=crop",
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
  darjeeling: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
  gangtok: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
  sikkim: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
  shillong: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  meghalaya: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  cherrapunji: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  guwahati: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  kaziranga: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  tawang: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
  leh: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop",
  srinagar: "https://images.unsplash.com/photo-1602652305970-c7234d31f9fc?w=1200&auto=format&fit=crop",
  amritsar: "https://images.unsplash.com/photo-1588096344356-9b6cc8e0b577?w=1200&auto=format&fit=crop",
  jodhpur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop",
  jaisalmer: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
  ooty: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  coorg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  munnar: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  kochi: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop",
  andaman: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop",
  pondicherry: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop",
  puducherry: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop",
  hampi: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  puri: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop",
  bhubaneswar: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  vrindavan: "https://images.unsplash.com/photo-1561361058-c24e14fce6cc?w=1200&auto=format&fit=crop",
  haridwar: "https://images.unsplash.com/photo-1591018533308-5b6c0f7c2134?w=1200&auto=format&fit=crop",
  nainital: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  mussoorie: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  dharamshala: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  ajmer: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop",
  allahabad: "https://images.unsplash.com/photo-1561361058-c24e14fce6cc?w=1200&auto=format&fit=crop",
  aurangabad: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
  chandigarh: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  coimbatore: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop",
  dehradun: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  indore: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  jammu: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
  lucknow: "https://images.unsplash.com/photo-1561361058-c24e14fce6cc?w=1200&auto=format&fit=crop",
  madurai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop",
  nagpur: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop",
  pelling: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
  visakhapatnam: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop",
  ziro: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
};

function getCityImage(destination: string): string {
  const normalized = destination.toLowerCase().trim();
  const key = Object.keys(CITY_IMAGES).find(k => normalized.includes(k)) ?? normalized.split(/[\s,]+/)[0];
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
