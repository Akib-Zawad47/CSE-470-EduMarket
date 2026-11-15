import React, { useState } from "react";
import RatingStars from "./RatingStars";

export default function ReviewList({ reviews = [] }) {
  const [filterRating, setFilterRating] = useState(0);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-reviews-box">
        <div className="empty-icon-bubble">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h4>No reviews yet</h4>
        <p className="muted">Student evaluations and feedback will appear here as enrollments complete.</p>
      </div>
    );
  }

  // Calculate rating distribution
  const total = reviews.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[star] = (counts[star] || 0) + 1;
  });

  const filteredReviews = filterRating > 0
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  // Avatar pastel backgrounds based on student name
  const avatarColors = [
    "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"
  ];
  const getAvatarColor = (name = "") => {
    const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[sum % avatarColors.length];
  };

  return (
    <div className="reviews-container">
      {/* Visual Rating Breakdown Dashboard */}
      <div className="reviews-summary-card">
        <div className="summary-left">
          <div className="big-rating-number">
            {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total).toFixed(1)}
          </div>
          <RatingStars 
            rating={reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total} 
            count={null} 
            size="lg" 
            showScore={false} 
          />
          <span className="summary-total-label">Based on {total} student {total === 1 ? "review" : "reviews"}</span>
        </div>

        <div className="summary-bars">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = counts[stars] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isActive = filterRating === stars;
            return (
              <button
                key={stars}
                type="button"
                className={`rating-bar-row ${isActive ? "active-filter" : ""}`}
                onClick={() => setFilterRating(isActive ? 0 : stars)}
                title={`Filter by ${stars} stars (${count} reviews)`}
              >
                <span className="bar-star-label">{stars} ★</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="bar-count-label">{count} ({pct}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter reset indicator */}
      {filterRating > 0 && (
        <div className="filter-pill-active">
          <span>Showing only {filterRating}-star reviews ({filteredReviews.length})</span>
          <button type="button" onClick={() => setFilterRating(0)} className="btn-clear-filter">
            Show all
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="review-cards-grid">
        {filteredReviews.map((r, index) => {
          const initials = (r.studentName || "Student")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <article key={index} className="review-card-modern">
              <div className="review-card-header">
                <div className="student-avatar" style={{ backgroundColor: getAvatarColor(r.studentName) }}>
                  {initials}
                </div>
                <div className="student-info">
                  <div className="student-name-row">
                    <strong className="student-name">{r.studentName}</strong>
                    <span className="verified-badge">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="icon-check">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Learner
                    </span>
                  </div>
                  <div className="review-meta-row">
                    <RatingStars rating={r.rating} count={null} size="sm" showScore={false} />
                    <span className="review-date">{r.reviewDate}</span>
                  </div>
                </div>
              </div>

              {r.courseTitle && (
                <div className="review-course-tag">
                  <span className="tag-icon">📚</span>
                  <span className="course-name-text">{r.courseTitle}</span>
                </div>
              )}

              <p className="review-feedback">
                "{r.comment || "Great instructor! Very clear explanations and practical course material."}"
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
