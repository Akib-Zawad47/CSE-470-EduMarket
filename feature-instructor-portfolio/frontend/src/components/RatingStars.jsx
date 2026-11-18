import React from "react";

/**
 * Modern RatingStars component.
 * Supports size variants ('sm', 'md', 'lg') and formats rating cleanly.
 */
export default function RatingStars({ rating = 0, count = null, size = "md", showScore = true }) {
  const numericRating = Number(rating) || 0;
  const rounded = Math.round(numericRating * 2) / 2; // round to nearest 0.5
  const fullStars = Math.floor(rounded);
  const hasHalfStar = rounded % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={`rating-stars-wrapper rating-${size}`} aria-label={`Rated ${numericRating.toFixed(1)} out of 5`}>
      <div className="stars-cluster" aria-hidden="true">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="star-icon star-full" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <svg className="star-icon star-half" viewBox="0 0 24 24" fill="currentColor">
            <defs>
              <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGrad)" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="star-icon star-empty" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>

      {showScore && (
        <span className="rating-score">
          {count === 0 && numericRating === 0 ? "New" : numericRating.toFixed(1)}
        </span>
      )}

      {count !== null && count > 0 && (
        <span className="rating-count-badge">
          ({count.toLocaleString()} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
