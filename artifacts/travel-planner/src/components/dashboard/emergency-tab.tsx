import React from "react";
import { Phone, AlertTriangle, Hospital, Shield, Car } from "lucide-react";
import { GlassCard } from "../shared";

interface EmergencyTabProps {
  destination: string;
}

const getEmergencyContacts = (destination: string) => {
  const dest = destination.toLowerCase();
  
  const national = [
    { name: "Police", number: "100", icon: "🚔", color: "text-blue-500" },
    { name: "Ambulance", number: "108", icon: "🚑", color: "text-red-500" },
    { name: "Fire Brigade", number: "101", icon: "🚒", color: "text-orange-500" },
    { name: "Women Helpline", number: "1091", icon: "👩", color: "text-pink-500" },
    { name: "Tourist Helpline", number: "1800-111-363", icon: "🗺️", color: "text-green-500" },
    { name: "Railway Helpline", number: "139", icon: "🚂", color: "text-purple-500" },
    { name: "Road Accident", number: "1073", icon: "🚗", color: "text-yellow-500" },
    { name: "Disaster Management", number: "108", icon: "⚠️", color: "text-red-600" },
  ];

  const tips = [
    "Always carry a photocopy of your ID proof",
    "Save local police station number",
    "Note down your hotel address in local language",
    "Keep emergency cash separate from main wallet",
    "Share your itinerary with family/friends",
    "Download offline maps before traveling",
    "Keep medicines in hand luggage",
    "Note nearest hospital location from hotel",
  ];

  return { national, tips };
};

export function EmergencyTab({ destination }: EmergencyTabProps) {
  const { national, tips } = getEmergencyContacts(destination);

  return (
    <div className="space-y-4">
      <GlassCard className="p-4 border-red-500/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-medium text-red-500">Emergency Numbers</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {national.map(({ name, number, icon, color }) => (
            <a key={name} href={`tel:${number}`} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className={`font-bold text-sm ${color}`}>{number}</p>
              </div>
            </a>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Safety Tips for {destination}</h3>
        </div>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary text-sm mt-0.5">✓</span>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4 border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Hospital className="w-5 h-5 text-amber-500" />
          <h3 className="font-medium text-amber-500">Medical Tips</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Carry your prescription medicines with doctor's note</p>
          <p>• Stay hydrated — drink bottled water only</p>
          <p>• Avoid street food if you have a sensitive stomach</p>
          <p>• Carry ORS packets for dehydration</p>
          <p>• Get travel insurance before your trip</p>
        </div>
      </GlassCard>
    </div>
  );
}
