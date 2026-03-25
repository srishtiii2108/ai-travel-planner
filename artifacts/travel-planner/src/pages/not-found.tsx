import React from "react";
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { PremiumButton } from "@/components/shared";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
        <MapPin className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-6xl font-display font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
        Looks like you've wandered off the map. We couldn't find the destination you're looking for.
      </p>
      <Link href="/" className="inline-block">
        <PremiumButton size="lg">Return to Basecamp</PremiumButton>
      </Link>
    </div>
  );
}
