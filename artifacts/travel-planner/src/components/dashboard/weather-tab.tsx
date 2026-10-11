import React, { useEffect, useState } from "react";
import { Cloud, Sun, Wind, Droplets, Thermometer, Loader2 } from "lucide-react";
import { GlassCard } from "../shared";

interface WeatherTabProps {
  destination: string;
  startDate: string;
  endDate: string;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  city: string;
}

export function WeatherTab({ destination, startDate, endDate }: WeatherTabProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_KEY = "8c327cfb63084b2c480e164dc74b6c9d";

  useEffect(() => {
    setLoading(true);
    setError(false);

    const city = destination.split(",")[0].trim();

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${API_KEY}&units=metric`, { mode: 'cors', headers: { 'Accept': 'application/json' } })
      .then(res => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then(data => {
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
        });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [destination]);

  const getSeasonAdvice = () => {
    const month = new Date(startDate).getMonth() + 1;
    const dest = destination.toLowerCase();
    const isMountain = dest.includes("manali") || dest.includes("shimla") || dest.includes("leh") || dest.includes("darjeeling");
    const isBeach = dest.includes("goa") || dest.includes("andaman") || dest.includes("kerala");
    const isMonsoon = month >= 7 && month <= 9;
    const isWinter = month >= 11 || month <= 2;
    const isSummer = month >= 3 && month <= 6;

    if (isMountain && isWinter) return { advice: "Very cold! Pack heavy woolens, snow boots essential.", emoji: "❄️", pack: ["Heavy jacket", "Thermals", "Snow boots", "Gloves", "Lip balm"] };
    if (isBeach && isMonsoon) return { advice: "Heavy rains expected. Sea may be rough — avoid water sports.", emoji: "⛈️", pack: ["Rain jacket", "Waterproof shoes", "Umbrella", "Quick-dry clothes"] };
    if (isBeach && isWinter) return { advice: "Perfect beach weather! Best time to visit.", emoji: "🌞", pack: ["Swimwear", "Sunscreen SPF 50+", "Sunglasses", "Flip flops"] };
    if (isMonsoon) return { advice: "Monsoon season — carry umbrella and rain gear.", emoji: "🌧️", pack: ["Umbrella", "Rain jacket", "Waterproof shoes"] };
    if (isSummer) return { advice: "Hot weather — stay hydrated and avoid afternoon sun.", emoji: "☀️", pack: ["Light cotton clothes", "Sunscreen", "Water bottle", "Hat"] };
    return { advice: "Pleasant weather — great time to explore!", emoji: "⛅", pack: ["Light layers", "Comfortable shoes", "Light jacket"] };
  };

  const season = getSeasonAdvice();

  if (loading) return (
    <GlassCard className="p-8 flex items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-muted-foreground">Fetching real-time weather...</p>
    </GlassCard>
  );

  return (
    <div className="space-y-4">
      {error ? (
        <GlassCard className="p-6 text-center">
          <p className="text-4xl mb-3">{season.emoji}</p>
          <p className="text-muted-foreground text-sm">Live weather unavailable — showing seasonal forecast</p>
        </GlassCard>
      ) : weather && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{weather.city}, India</h3>
              <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
              <p className="text-xs text-muted-foreground mt-1">🔴 Live Data</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather icon"
              className="w-16 h-16"
            />
          </div>
          <div className="text-center mb-6">
            <p className="text-6xl font-bold">{weather.temp}°C</p>
            <p className="text-muted-foreground mt-1">Feels like {weather.feelsLike}°C</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-bold text-sm">{weather.humidity}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Wind className="w-4 h-4 mx-auto mb-1 text-teal-500" />
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-bold text-sm">{weather.windSpeed} km/h</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <p className="text-xs text-muted-foreground">Feels Like</p>
              <p className="font-bold text-sm">{weather.feelsLike}°C</p>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4 border-primary/30">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-yellow-500" />
          <h3 className="font-medium">Travel Advice for {destination}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{season.emoji} {season.advice}</p>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-medium">What to Pack</h3>
        </div>
        <div className="space-y-2">
          {season.pack.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-primary text-sm">✓</span>
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
