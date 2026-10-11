import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { useAuth } from "@workspace/auth-web";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, login } = useAuth();
  const [, navigate] = useLocation();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      login(`/trip/${id}`);
      return;
    }

    fetch(`/api/travel/saved/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Trip not found");
        return res.json();
      })
      .then(data => {
        setTrip(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, isAuthenticated]);

  if (!isAuthenticated) return null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🇮🇳</div>
        <p className="text-lg">Loading trip...</p>
      </div>
    </div>
  );

  if (error || !trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-lg text-red-500">Trip not found!</p>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">
          Go Home
        </button>
      </div>
    </div>
  );

  return (
    <ResultsDashboard
      plan={trip.plan}
      request={trip.request}
      onBack={() => navigate("/")}
    />
  );
}
