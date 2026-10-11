import React, { useState } from "react";
import { GlassCard } from "../shared";
import { Star } from "lucide-react";

interface RatingProps {
  destination: string;
}

export function TripRating({ destination }: RatingProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  if (submitted) {
    return (
      <GlassCard className="p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-semibold text-lg mb-1">Thank you!</h3>
        <p className="text-muted-foreground text-sm">{rating}-star review for {destination} saved.</p>
        <div className="flex justify-center gap-1 mt-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-6 h-6 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-lg mb-2">Rate Your Trip</h3>
      <p className="text-sm text-muted-foreground mb-4">How was your {destination} experience?</p>
      <div className="flex justify-center gap-2 mb-2">
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-125">
            <Star className={`w-10 h-10 transition-colors ${star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      {(hover || rating) > 0 && (
        <p className="text-center text-sm font-medium text-amber-400 mb-4">{labels[hover || rating]}</p>
      )}
      <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience... (optional)" className="w-full p-3 rounded-lg bg-muted/50 border border-border text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50" />
      <button onClick={() => setSubmitted(true)} disabled={rating === 0} className="w-full mt-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
        Submit Review
      </button>
    </GlassCard>
  );
}
