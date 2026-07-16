"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogFeedbackProps {
  slug: string;
  initialHelpful: number;
  initialNotHelpful: number;
  initialRatingAvg: number;
  initialRatingCount: number;
}

export function BlogFeedback({
  slug,
  initialHelpful,
  initialNotHelpful,
  initialRatingAvg,
  initialRatingCount,
}: BlogFeedbackProps) {
  const [helpful, setHelpful] = useState(initialHelpful);
  const [notHelpful, setNotHelpful] = useState(initialNotHelpful);
  const [ratingAvg, setRatingAvg] = useState(initialRatingAvg);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);

  const [rated, setRated] = useState(false);
  const [voted, setVoted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);

  async function handleVote(action: "helpful" | "not-helpful") {
    if (voted || submittingVote) return;
    setSubmittingVote(true);
    try {
      const res = await fetch(`/api/blogs/${slug}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpful(data.helpfulCount);
        setNotHelpful(data.notHelpfulCount);
        setVoted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVote(false);
    }
  }

  async function handleRate(value: number) {
    if (rated || submittingRating) return;
    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/blogs/${slug}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", rating: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setRatingAvg(data.ratingAverage);
        setRatingCount(data.ratingCount);
        setRated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  }

  return (
    <div className="mt-12 border-t border-white/10 pt-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Rate this article</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={rated}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="group relative focus:outline-none cursor-grow"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition duration-150",
                      rated
                        ? star <= ratingAvg
                          ? "fill-indigo-400 text-indigo-400"
                          : "text-slate-600"
                        : (hoveredStar !== null ? star <= hoveredStar : star <= ratingAvg)
                        ? "fill-indigo-400 text-indigo-400 scale-110"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {ratingCount > 0
                ? `${ratingAvg.toFixed(1)} / 5.0 (${ratingCount} votes)`
                : "No ratings yet"}
            </span>
          </div>
          {rated && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Thank you for rating!
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Was this helpful?</h4>
          <div className="flex items-center gap-3">
            <button
              disabled={voted || submittingVote}
              onClick={() => handleVote("helpful")}
              className={cn(
                "cursor-grow inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition duration-200",
                voted
                  ? "border-white/5 bg-white/[0.02] text-slate-500"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Helpful ({helpful})</span>
            </button>
            <button
              disabled={voted || submittingVote}
              onClick={() => handleVote("not-helpful")}
              className={cn(
                "cursor-grow inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition duration-200",
                voted
                  ? "border-white/5 bg-white/[0.02] text-slate-500"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>Not really ({notHelpful})</span>
            </button>
          </div>
          {voted && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Response recorded!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
