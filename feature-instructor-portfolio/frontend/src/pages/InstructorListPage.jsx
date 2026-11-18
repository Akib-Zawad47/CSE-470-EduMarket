import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchInstructors } from "../services/portfolioService";
import RatingStars from "../components/RatingStars";
import { getInstructorPhoto } from "../utils/instructorAvatar";
import "../styles/portfolio.css";

export default function InstructorListPage() {
  const [search, setSearch] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, TOP_RATED, POPULAR

  useEffect(() => {
    // Debounce search keystrokes by 250ms
    const timer = setTimeout(() => {
      setLoading(true);
      fetchInstructors(search)
        .then((data) => {
          setInstructors(data || []);
          setError("");
        })
        .catch(() => setError("Unable to connect to EduMarket backend. Please make sure the Spring Boot server is running on port 8080."))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Client-side quick filter tabs
  const filteredInstructors = useMemo(() => {
    let list = [...instructors];
    if (activeTab === "TOP_RATED") {
      list = list.filter((i) => (i.avgRating || 0) >= 4.5);
    } else if (activeTab === "POPULAR") {
      list = list.filter((i) => (i.studentCount || 0) >= 50);
    }
    return list;
  }, [instructors, activeTab]);

  return (
    <div className="portfolio-app-wrapper">
      {/* Navigation Bar */}
      <header className="site-navbar">
        <div className="nav-container">
          <Link to="/instructors" className="nav-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">Edu<strong>Market</strong></span>
          </Link>
          <div className="nav-actions">
            <span className="nav-item-active">Instructors Directory</span>
          </div>
        </div>
      </header>

      <main className="portfolio-page">
        {/* Directory Hero Banner */}
        <section className="directory-hero">
          <span className="directory-pill">Featured Faculty & Industry Mentors</span>
          <h1 className="directory-title">Meet World-Class Instructors</h1>
          <p className="directory-subtitle">
            Explore dedicated instructor portfolios, inspect course catalogs, and read transparent student reviews before enrolling.
          </p>

          {/* Search Box */}
          <div className="directory-search-wrapper">
            <svg viewBox="0 0 20 20" fill="currentColor" className="search-icon">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              className="directory-search-input"
              type="search"
              placeholder="Search instructors by name, subject, or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="search-clear-btn">✕</button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="directory-filter-pills">
            <button
              type="button"
              className={`pill-btn ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All Instructors ({instructors.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${activeTab === "TOP_RATED" ? "active" : ""}`}
              onClick={() => setActiveTab("TOP_RATED")}
            >
              ⭐ Top Rated (4.5+)
            </button>
            <button
              type="button"
              className={`pill-btn ${activeTab === "POPULAR" ? "active" : ""}`}
              onClick={() => setActiveTab("POPULAR")}
            >
              👥 High Enrollment
            </button>
          </div>
        </section>

        {/* Loading and Error States */}
        {loading && (
          <div className="loading-state-wrapper">
            <div className="spinner-ring" />
            <p className="muted">Fetching instructor profiles from database...</p>
          </div>
        )}

        {error && (
          <div className="error-card-modern">
            <div className="error-icon">⚠️</div>
            <h3>Failed to load instructor catalog</h3>
            <p className="error-desc">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInstructors.length === 0 && (
          <div className="empty-results-box">
            <span className="empty-emoji">👩‍🏫</span>
            <h3>No instructors found</h3>
            <p className="muted">We couldn't find any instructor matching "{search}". Try searching another name.</p>
            <button type="button" onClick={() => { setSearch(""); setActiveTab("ALL"); }} className="btn-secondary">
              View All Instructors
            </button>
          </div>
        )}

        {/* Instructor Grid */}
        {!loading && !error && filteredInstructors.length > 0 && (
          <div className="instructor-grid-modern">
            {filteredInstructors.map((i) => {
              const avatarLetter = (i.name || "I").charAt(0).toUpperCase();
              const photoUrl = getInstructorPhoto(i);
              return (
                <Link
                  key={i.instructorId}
                  to={`/instructors/${i.instructorId}`}
                  className="instructor-card-modern"
                >
                  <div className="card-top-banner">
                    <div className="banner-glow" />
                  </div>

                  <div className="card-body-wrapper">
                    <div className="avatar-overlap">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={i.name}
                          className="avatar-photo avatar-md"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.parentElement.querySelector(".avatar-fallback");
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="avatar avatar-md avatar-fallback"
                        style={{ display: photoUrl ? "none" : "flex" }}
                      >
                        {avatarLetter}
                      </div>
                      <span className="verified-check" title="Verified Faculty">✓</span>
                    </div>

                    <div className="card-main-info">
                      <h2 className="instructor-card-name">{i.name}</h2>
                      <p className="instructor-card-bio">
                        {i.bio || "EduMarket verified instructor specializing in university courses and practical industry topics."}
                      </p>
                    </div>

                    <div className="card-rating-block">
                      <RatingStars rating={i.avgRating} count={i.reviewCount} size="sm" />
                    </div>

                    <div className="card-stats-strip">
                      <div className="stat-pill">
                        <span className="stat-pill-icon">📚</span>
                        <span>{i.courseCount} {i.courseCount === 1 ? "course" : "courses"}</span>
                      </div>
                      <div className="stat-pill">
                        <span className="stat-pill-icon">👥</span>
                        <span>{i.studentCount.toLocaleString()} students</span>
                      </div>
                    </div>

                    <div className="card-cta-row">
                      <span className="btn-view-profile">
                        View Portfolio
                        <svg className="icon-arrow" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
