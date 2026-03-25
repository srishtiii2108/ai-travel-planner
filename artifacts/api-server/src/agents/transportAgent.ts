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
  trainNumber?: string;
  filter?: string;
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
  const transportBudget = Math.round(input.budget * 0.25);

  const prompt = `You are an Indian travel transport specialist. Generate realistic domestic transport options for travel within India.

Trip Details:
- From: ${input.origin}
- To: ${input.destination}
- Departure Date: ${input.startDate}
- Return Date: ${input.endDate}
- Travelers: ${input.travelers}
- Transport Budget: ₹${transportBudget} (25% of total budget)
- Budget Priority: ${input.preferLow ? "Low cost - STRONGLY prefer Indian Railways trains over flights. Show mostly trains." : "Balanced - mix of flights and trains"}

Generate 5-6 realistic Indian transport options. Include Indian Railways trains (with realistic train names and numbers like 12301 Rajdhani Express, 12621 Tamil Nadu Express etc.), domestic flights (IndiGo, Air India, SpiceJet, Vistara), and optionally buses.

For low budgets: show mostly trains (Sleeper/3AC/2AC classes) and buses. For higher budgets: include premium trains and flights.

Return a JSON object:
{
  "transport": [
    {
      "id": "t1",
      "mode": "flight|train|bus",
      "carrier": "IndiGo / Indian Railways / KSRTC etc.",
      "trainNumber": "12301 Rajdhani Express (only for trains)",
      "departureTime": "${input.startDate}T06:00:00",
      "arrivalTime": "${input.startDate}T10:30:00",
      "duration": "4h 30m",
      "price": total_price_for_all_travelers_in_INR,
      "pricePerPerson": price_per_person_in_INR,
      "class": "Sleeper|3AC|2AC|1AC|Economy|Business|Volvo AC",
      "stops": 0,
      "isRecommended": false,
      "filter": "cheapest|fastest|recommended"
    }
  ]
}

Mark exactly one as isRecommended: true (best value). Assign filter: "cheapest" to lowest price, "fastest" to shortest duration, "recommended" to best overall value.
All prices in Indian Rupees (₹). Return ONLY valid JSON, no markdown.`;

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
