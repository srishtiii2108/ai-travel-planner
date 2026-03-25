import { openai } from "@workspace/integrations-openai-ai-server";

export interface TransportOption {
  id: string;
  mode: "flight" | "train" | "bus" | "ferry";
  carrier: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  pricePerPerson: number;
  class: string;
  stops: number;
  isRecommended: boolean;
}

export interface TransportInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferLow: boolean;
}

export async function transportAgent(input: TransportInput): Promise<TransportOption[]> {
  const prompt = `You are a travel transport specialist. Generate realistic transport options for a trip.

Trip Details:
- From: ${input.origin || "nearest major city"}
- To: ${input.destination}
- Departure Date: ${input.startDate}
- Return Date: ${input.endDate}
- Travelers: ${input.travelers}
- Total Budget Available for Transport: $${Math.round(input.budget * 0.3)} (30% of total budget)
- Budget Priority: ${input.preferLow ? "Low cost - prefer trains/buses over flights" : "Balanced cost/convenience"}

Generate 4-6 transport options with different modes (flights, trains, buses). If budget is low, prioritize trains and buses.
For each option provide realistic carriers, times, durations, and prices.

Return a JSON object with a "transport" array:
{
  "transport": [
    {
      "id": "t1",
      "mode": "flight|train|bus|ferry",
      "carrier": "Carrier Name",
      "departureTime": "2024-01-15T08:00:00",
      "arrivalTime": "2024-01-15T11:30:00",
      "duration": "3h 30m",
      "price": total_price_for_all_travelers,
      "pricePerPerson": price_per_person,
      "class": "Economy|Business|First|Standard|Premium",
      "stops": 0,
      "isRecommended": true_for_best_value_option
    }
  ]
}

Make prices realistic for the route. Only one option should have isRecommended: true.
Return ONLY valid JSON, no markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  
  try {
    const parsed = JSON.parse(content);
    return parsed.transport ?? [];
  } catch {
    return [];
  }
}
