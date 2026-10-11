import React, { useState } from "react";
import { Luggage, CheckSquare, Square, Sparkles } from "lucide-react";
import { GlassCard } from "../shared";

interface PackingTabProps {
  destination: string;
  preferences: string[];
  startDate: string;
  endDate: string;
}

const getPackingList = (destination: string, preferences: string[]) => {
  const dest = destination.toLowerCase();
  const isBeach = dest.includes("goa") || dest.includes("andaman") || dest.includes("kerala") || dest.includes("kovalam") || preferences.includes("beach");
  const isMountain = dest.includes("manali") || dest.includes("shimla") || dest.includes("leh") || dest.includes("darjeeling") || dest.includes("sikkim") || dest.includes("tawang");
  const isDesert = dest.includes("jaisalmer") || dest.includes("jodhpur") || dest.includes("rajasthan");
  const isNortheast = dest.includes("meghalaya") || dest.includes("shillong") || dest.includes("assam") || dest.includes("guwahati");

  const essentials = [
    { item: "Aadhar Card / Passport", category: "Documents" },
    { item: "Travel Insurance", category: "Documents" },
    { item: "Hotel Booking Confirmation", category: "Documents" },
    { item: "Emergency Contacts List", category: "Documents" },
    { item: "Cash (INR)", category: "Money" },
    { item: "Debit/Credit Cards", category: "Money" },
    { item: "Phone Charger", category: "Electronics" },
    { item: "Power Bank", category: "Electronics" },
    { item: "Earphones", category: "Electronics" },
    { item: "Medicines / First Aid Kit", category: "Health" },
    { item: "Sunscreen SPF 50+", category: "Health" },
    { item: "Hand Sanitizer", category: "Health" },
    { item: "Toothbrush & Toothpaste", category: "Toiletries" },
    { item: "Shampoo & Conditioner", category: "Toiletries" },
    { item: "Moisturizer", category: "Toiletries" },
  ];

  const beachItems = [
    { item: "Swimwear", category: "Clothing" },
    { item: "Beach Towel", category: "Clothing" },
    { item: "Flip Flops", category: "Clothing" },
    { item: "Sunglasses", category: "Accessories" },
    { item: "Hat/Cap", category: "Accessories" },
    { item: "Waterproof Bag", category: "Accessories" },
    { item: "After Sun Lotion", category: "Health" },
    { item: "Insect Repellent", category: "Health" },
  ];

  const mountainItems = [
    { item: "Thermal Innerwear", category: "Clothing" },
    { item: "Heavy Jacket/Puffer", category: "Clothing" },
    { item: "Woolen Socks (3-4 pairs)", category: "Clothing" },
    { item: "Gloves & Muffler", category: "Accessories" },
    { item: "Trekking Shoes", category: "Clothing" },
    { item: "Rain Poncho", category: "Clothing" },
    { item: "Altitude Sickness Medicine", category: "Health" },
    { item: "Lip Balm", category: "Health" },
    { item: "Torch/Flashlight", category: "Electronics" },
  ];

  const desertItems = [
    { item: "Light Cotton Clothes", category: "Clothing" },
    { item: "Scarf/Dupatta", category: "Accessories" },
    { item: "Sturdy Sandals", category: "Clothing" },
    { item: "Water Bottle (large)", category: "Accessories" },
    { item: "ORS Packets", category: "Health" },
    { item: "Sunglasses", category: "Accessories" },
  ];

  const northeastItems = [
    { item: "Rain Jacket", category: "Clothing" },
    { item: "Waterproof Shoes", category: "Clothing" },
    { item: "Insect Repellent", category: "Health" },
    { item: "Quick Dry Clothes", category: "Clothing" },
    { item: "Umbrella", category: "Accessories" },
  ];

  let list = [...essentials];
  if (isBeach) list = [...list, ...beachItems];
  if (isMountain) list = [...list, ...mountainItems];
  if (isDesert) list = [...list, ...desertItems];
  if (isNortheast) list = [...list, ...northeastItems];
  if (!isBeach && !isMountain && !isDesert && !isNortheast) {
    list = [...list,
      { item: "Comfortable Walking Shoes", category: "Clothing" },
      { item: "Light Jacket", category: "Clothing" },
      { item: "Umbrella", category: "Accessories" },
      { item: "Sunglasses", category: "Accessories" },
    ];
  }

  return list;
};

export function PackingTab({ destination, preferences }: PackingTabProps) {
  const items = getPackingList(destination, preferences);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const categories = [...new Set(items.map(i => i.category))];
  const toggle = (item: string) => {
    const next = new Set(checked);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setChecked(next);
  };

  const total = items.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Luggage className="w-5 h-5 text-primary" />
            <span className="font-medium">Packing Progress</span>
          </div>
          <span className="text-sm text-muted-foreground">{done}/{total} items</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{pct}% packed</p>
      </GlassCard>

      {categories.map(cat => (
        <GlassCard key={cat} className="p-4">
          <h3 className="font-medium text-sm text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {cat}
          </h3>
          <div className="space-y-2">
            {items.filter(i => i.category === cat).map(({ item }) => (
              <div key={item} onClick={() => toggle(item)} className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
                {checked.has(item)
                  ? <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                <span className={`text-sm ${checked.has(item) ? "line-through text-muted-foreground" : ""}`}>{item}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
