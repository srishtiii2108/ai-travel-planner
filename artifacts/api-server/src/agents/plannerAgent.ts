import { openai } from "@workspace/integrations-openai-ai-server";

export interface Activity {
  time: string;
  name: string;
  description: string;
  type: string;
  estimatedCost: number;
  location: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  estimatedCost: number;
}

export interface PlannerInput {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: string[];
  travelers: number;
  budgetPerDay: number;
}

export async function plannerAgent(input: PlannerInput): Promise<ItineraryDay[]> {
  const days = Math.max(1, Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const prompt = `You are an expert travel planner. Create a detailed day-wise itinerary for a trip to ${input.destination}.

Trip Details:
- Destination: ${input.destination}
- Start Date: ${input.startDate}
- End Date: ${input.endDate}
- Number of Days: ${days}
- Number of Travelers: ${input.travelers}
- Budget per day per person: $${Math.round(input.budgetPerDay / input.travelers / days)}
- Preferences: ${input.preferences.join(", ")}

Return a JSON array of itinerary days. Each day must have:
{
  "day": number (1-indexed),
  "date": "YYYY-MM-DD",
  "theme": "Brief theme for the day",
  "activities": [
    {
      "time": "9:00 AM",
      "name": "Activity Name",
      "description": "Brief description of the activity",
      "type": "sightseeing|food|culture|adventure|leisure|transport",
      "estimatedCost": number (USD per person),
      "location": "Specific location name"
    }
  ],
  "estimatedCost": number (total USD for all travelers that day)
}

Make it realistic, culturally authentic, and optimized for the given budget and preferences.
Return ONLY valid JSON array, no markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  
  try {
    const parsed = JSON.parse(content);
    const itinerary = Array.isArray(parsed) ? parsed : (parsed.itinerary ?? parsed.days ?? []);
    return itinerary;
  } catch {
    return [];
  }
}
