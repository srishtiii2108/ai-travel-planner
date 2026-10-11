import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

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
  "[https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop)",
  "[https://images.unsplash.com/photo-1571003497405-93515bc7f30b?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1571003497405-93515bc7f30b?w=600&auto=format&fit=crop)",
  "[https://images.unsplash.com/photo-1520250953542-b68b58ef4f91?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1520250953542-b68b58ef4f91?w=600&auto=format&fit=crop)",
  "[https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop)",
  "[https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop)",
  "[https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop)",
];

export async function accommodationAgent(input: AccommodationInput): Promise<HotelOption[]> {
  const nights = Math.max(1, Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const hotelBudget = Math.round(input.budget * 0.35);
  const budgetPerNight = Math.round(hotelBudget / nights);

  let hotelCategory = "mid-range";
  if (budgetPerNight < 2000) hotelCategory = "budget (₹500-₹2000/night guesthouses, hostels, dharamshalas)";
  else if (budgetPerNight < 5000) hotelCategory = "mid-range (₹2000-₹5000/night 3-star hotels)";
  else hotelCategory = "premium (₹5000+/night 4-5 star hotels)";

  const prompt = `You are an Indian hotel specialist. Generate realistic hotel recommendations for ${input.destination}, India.

Trip Details:
- Destination: ${input.destination}, India
- Check-in: ${input.startDate}
- Check-out: ${input.endDate}
- Nights: ${nights}
- Travelers: ${input.travelers}
- Budget per night: ₹${budgetPerNight}
- Category: ${hotelCategory}
- Preferences: ${input.preferences.join(", ")}

Generate 4-5 real-sounding Indian hotel options with authentic names. For budget trips, include guesthouses, OYO rooms, and dharamshalas. For mid-range, include popular hotel chains. For luxury, include 5-star properties.

Return JSON:
{
  "hotels": [
    {
      "id": "h1",
      "name": "Hotel Name",
      "rating": 4.2,
      "stars": 3,
      "pricePerNight": price_in_INR,
      "totalPrice": price_per_night_times_${nights}_nights,
      "location": "Neighborhood, ${input.destination}",
      "imageUrl": "",
      "amenities": ["Free WiFi", "AC", "Breakfast Included", "Room Service"],
      "description": "Brief authentic description mentioning location advantages",
      "isRecommended": false,
      "category": "budget|mid-range|luxury"
    }
  ]
}

Only one hotel should have isRecommended: true (best value for budget).
Leave imageUrl as empty string "". All prices in INR (₹).
Return ONLY valid JSON, no markdown.`;

  const response = await cohere.chat({
    model: "command-r-08-2024",
    message: prompt,
  });

  let rawContent = response.text;
  rawContent = rawContent.replace(/```json\n?/gi, '').replace(/```/gi, '').trim();
  
  try {
    const parsed = JSON.parse(rawContent);
    const hotels: HotelOption[] = parsed.hotels ?? [];
    
    return hotels.map((hotel, index) => ({
      ...hotel,
      imageUrl: UNSPLASH_HOTEL_IMAGES[index % UNSPLASH_HOTEL_IMAGES.length],
    }));
  } catch {
    return [];
  }
}