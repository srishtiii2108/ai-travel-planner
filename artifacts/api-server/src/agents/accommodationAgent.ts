import { openai } from "@workspace/integrations-openai-ai-server";

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  stars: number;
  pricePerNight: number;
  totalPrice: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  description: string;
  isRecommended: boolean;
  category: "budget" | "mid-range" | "luxury";
}

export interface AccommodationInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferLow: boolean;
  preferences: string[];
}

const UNSPLASH_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571003497405-93515bc7f30b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250953542-b68b58ef4f91?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop",
];

export async function accommodationAgent(input: AccommodationInput): Promise<HotelOption[]> {
  const nights = Math.max(1, Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const hotelBudget = input.budget * 0.4;
  const budgetPerNight = hotelBudget / nights;

  const prompt = `You are a hotel specialist. Generate realistic hotel recommendations for a trip.

Trip Details:
- Destination: ${input.destination}
- Check-in: ${input.startDate}
- Check-out: ${input.endDate}
- Nights: ${nights}
- Travelers: ${input.travelers}
- Budget per night: $${Math.round(budgetPerNight)} (40% of total budget)
- Budget Priority: ${input.preferLow ? "Low cost - prefer 2-3 star budget hotels" : "Balanced - mix of options"}
- Preferences: ${input.preferences.join(", ")}

Generate 4-5 hotel options. If budget is low, prioritize budget hotels and hostels (2-3 stars). Include a mix of categories.

Return a JSON object with a "hotels" array:
{
  "hotels": [
    {
      "id": "h1",
      "name": "Hotel Name",
      "rating": 4.2,
      "stars": 4,
      "pricePerNight": price_per_night,
      "totalPrice": price_per_night_times_nights,
      "location": "Neighborhood, City",
      "imageUrl": "",
      "amenities": ["WiFi", "Pool", "Restaurant", "Gym"],
      "description": "Brief compelling description of the hotel",
      "isRecommended": false,
      "category": "budget|mid-range|luxury"
    }
  ]
}

Only one hotel should have isRecommended: true (the best value for the budget).
Leave imageUrl as empty string "".
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
    const hotels: HotelOption[] = parsed.hotels ?? [];
    
    return hotels.map((hotel, index) => ({
      ...hotel,
      imageUrl: UNSPLASH_HOTEL_IMAGES[index % UNSPLASH_HOTEL_IMAGES.length],
    }));
  } catch {
    return [];
  }
}
