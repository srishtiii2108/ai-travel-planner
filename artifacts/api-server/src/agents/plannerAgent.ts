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

  const budgetPerPersonPerDay = Math.round(input.budgetPerDay / input.travelers / days);

  const prompt = `You are an expert Indian travel planner. Generate a detailed day-wise travel itinerary for ${input.destination}, India.

Trip Details:
- Destination: ${input.destination}, India
- Start Date: ${input.startDate}
- End Date: ${input.endDate}
- Number of Days: ${days}
- Number of Travelers: ${input.travelers}
- Budget per person per day: ₹${budgetPerPersonPerDay}
- Preferences: ${input.preferences.join(", ")}

Include morning, afternoon, and evening activities with famous Indian landmarks, local food experiences, cultural experiences, and practical travel tips. All costs must be in Indian Rupees (INR).

Return a JSON object with "itinerary" array. Each day must have:
{
  "itinerary": [
    {
      "day": number (1-indexed),
      "date": "YYYY-MM-DD",
      "theme": "Brief theme for the day",
      "activities": [
        {
          "time": "9:00 AM",
          "name": "Activity Name",
          "description": "Brief description including local tips",
          "type": "sightseeing|food|culture|adventure|leisure|shopping",
          "estimatedCost": number (INR per person),
          "location": "Specific location name, ${input.destination}"
        }
      ],
      "estimatedCost": number (total INR for all ${input.travelers} travelers that day)
    }
  ]
}

Make it authentic to Indian culture, include famous landmarks, street food, local markets, and temples/monuments. All prices in INR.
Return ONLY valid JSON, no markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  
  try {
    const parsed = JSON.parse(content);
    const itinerary = parsed.itinerary ?? parsed.days ?? (Array.isArray(parsed) ? parsed : []);
    return itinerary;
  } catch {
    return [];
  }
}
