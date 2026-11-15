import React from "react";
import RatingStars from "./RatingStars";

export default function CourseCard({ course, onSelectCourse }) {
  // Determine badge color theme by difficulty level
  const levelKey = (course.level || "").toLowerCase();
  let levelClass = "badge-neutral";
  if (levelKey.includes("beginner") || levelKey.includes("intro")) {
    levelClass = "badge-beginner";
  } else if (levelKey.includes("intermediate") || levelKey.includes("mid")) {
    levelClass = "badge-intermediate";
  } else if (levelKey.includes("advance") || levelKey.includes("expert")) {
    levelClass = "badge-advanced";
  }

  // Generate deterministic gradient accent from title
  const gradients = [
    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  ];
  const charSum = (course.title || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const headerGradient = gradients[charSum % gradients.length];

  return (
    <article className="course-card-v2">
      {/* Decorative header banner */}
      <div className="course-card-banner" style={{ background: headerGradient }}>
        <div className="banner-pattern" />
        <span className="course-topic-tag">EduMarket Certified</span>
        {course.level && (
          <span className={`badge-pill ${levelClass}`}>
            {course.level}
          </span>
        )}
      </div>

      <div className="course-card-content">
        <h3 className="course-title" title={course.title}>
          {course.title}
        </h3>

        <p className="course-desc">
          {course.description || "Comprehensive hands-on curriculum designed to build professional real-world skills."}
        </p>

        <div className="course-metrics-row">
          <RatingStars rating={course.avgRating} count={course.reviewCount} size="sm" />
          <div className="course-students-count">
            <svg className="icon-tiny" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{course.studentCount} {course.studentCount === 1 ? "student" : "students"}</span>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-pricing">
            <span className="price-label">Tuition</span>
            <span className="course-price">৳{Number(course.price || 0).toLocaleString()}</span>
          </div>

          <button 
            type="button" 
            className="btn-course-action"
            onClick={() => onSelectCourse && onSelectCourse(course)}
          >
            <span>Enroll Now</span>
            <svg className="icon-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
