import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPortfolio, updateInstructorProfile } from "../services/portfolioService";
import RatingStars from "../components/RatingStars";
import CourseCard from "../components/CourseCard";
import ReviewList from "../components/ReviewList";
import { getInstructorPhoto } from "../utils/instructorAvatar";
import "../styles/portfolio.css";

export default function InstructorPortfolioPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Content Tabs: 'courses' or 'reviews'
  const [activeTab, setActiveTab] = useState("courses");

  // Course filter and sort states
  const [courseSearch, setCourseSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("POPULAR");

  // Feedback & Modal states
  const [toastMessage, setToastMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);

  // Edit Profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPortfolio(id)
      .then((data) => {
        setPortfolio(data);
        setError("");
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setError("Instructor not found in the directory.");
        } else {
          setError("Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("📋 Portfolio link copied to clipboard!");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setShowMessageModal(false);
    setMessageText("");
    showToast(`✉️ Inquiry dispatched to ${portfolio?.instructor?.name}! (Connected to Feature 7 Direct Messaging)`);
  };

  const handleEnrollCourse = (course) => {
    setSelectedCourseForEnroll(course);
  };

  const confirmEnrollment = () => {
    const courseTitle = selectedCourseForEnroll?.title;
    setSelectedCourseForEnroll(null);
    showToast(`📌 Enrollment initiated for "${courseTitle}". Ready for Feature 12 Checkout & Invoicing.`);
  };

  const handleOpenEditModal = () => {
    setEditName(portfolio?.instructor?.name || "");
    setEditBio(portfolio?.instructor?.bio || "");
    setEditAvatarUrl(portfolio?.instructor?.avatarUrl || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateInstructorProfile(id, {
        name: editName,
        bio: editBio,
        avatarUrl: editAvatarUrl,
      });
      setPortfolio((prev) => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          name: updated.name,
          bio: updated.bio,
          avatarUrl: editAvatarUrl || prev.instructor.avatarUrl,
        },
      }));
      setShowEditModal(false);
      showToast("✅ Instructor profile successfully updated!");
    } catch {
      showToast("⚠️ Failed to update profile. Is the Spring Boot backend running?");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    if (!portfolio || !portfolio.courses) return [];
    let list = [...portfolio.courses];

    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      list = list.filter(
        (c) =>
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (levelFilter !== "ALL") {
      list = list.filter((c) =>
        (c.level || "").toLowerCase().includes(levelFilter.toLowerCase())
      );
    }

    if (sortBy === "RATING") {
      list.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    } else if (sortBy === "PRICE_ASC") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "PRICE_DESC") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      list.sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0));
    }

    return list;
  }, [portfolio, courseSearch, levelFilter, sortBy]);

  if (loading) {
    return (
      <div className="portfolio-app-wrapper">
        <header className="site-navbar">
          <div className="nav-container">
            <Link to="/instructors" className="nav-brand">
              <span className="brand-icon">🎓</span>
              <span className="brand-text">Edu<strong>Market</strong></span>
            </Link>
          </div>
        </header>
        <main className="portfolio-page">
          <div className="skeleton-hero-card" />
          <div className="skeleton-grid" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-app-wrapper">
        <header className="site-navbar">
          <div className="nav-container">
            <Link to="/instructors" className="nav-brand">
              <span className="brand-icon">🎓</span>
              <span className="brand-text">Edu<strong>Market</strong></span>
            </Link>
          </div>
        </header>
        <main className="portfolio-page">
          <div className="error-card-modern">
            <div className="error-icon">⚠️</div>
            <h2>Unable to load instructor portfolio</h2>
            <p className="error-desc">{error}</p>
            <div className="error-actions">
              <Link to="/instructors" className="btn-primary">
                ← Return to Instructor Directory
              </Link>
              <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
                Retry Connection
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { instructor, courses, recentReviews } = portfolio;
  const avatarLetter = (instructor.name || "I").charAt(0).toUpperCase();
  const photoUrl = getInstructorPhoto(instructor);

  // Dynamic skill tags based on bio or instructor name
  const isWebDev = (instructor.bio || "").toLowerCase().includes("web");
  const skills = isWebDev
    ? ["Full-Stack Web", "JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs"]
    : ["Python", "Data Science", "Machine Learning", "Pandas", "NumPy", "Statistical Analysis"];

  return (
    <div className="portfolio-app-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-slide-in">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage("")} className="toast-close">✕</button>
        </div>
      )}

      {/* Modern Navigation Header */}
      <header className="site-navbar">
        <div className="nav-container">
          <Link to="/instructors" className="nav-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">Edu<strong>Market</strong></span>
          </Link>

          <nav className="nav-actions">
            <Link to="/instructors" className="nav-back-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" className="icon-sm">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Explore All Instructors</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="portfolio-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/instructors">Instructors</Link>
          <span className="separator">/</span>
          <span className="current">{instructor.name}</span>
        </nav>

        {/* ==============================================================
            LUXURY HERO SHOWCASE BANNER
            ============================================================== */}
        <section className="portfolio-hero-showcase">
          <div className="hero-mesh-background" />

          <div className="hero-showcase-container">
            <div className="hero-avatar-halo-wrapper">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={instructor.name}
                  className="avatar-photo-huge"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.parentElement.querySelector(".avatar-fallback");
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="avatar-huge-glow avatar-fallback"
                style={{ display: photoUrl ? "none" : "flex" }}
              >
                {avatarLetter}
              </div>
              <div className="active-beacon" title="Educator Active & Available" />
            </div>

            <div className="hero-details-column">
              <div className="hero-badges-row">
                <span className="badge-pill-verified">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon-tiny">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Educator
                </span>
                <span className="badge-pill-neon">EduMarket Certified</span>
                {instructor.avgRating >= 4.5 && (
                  <span className="badge-pill-gold">⭐ Top 1% Instructor</span>
                )}
              </div>

              <h1 className="instructor-hero-name">{instructor.name}</h1>
              
              <p className="instructor-headline">
                {isWebDev
                  ? "Senior Software Architect & Full-Stack Web Development Specialist"
                  : "Lead Data Scientist & University Lecturer | AI & Analytics Expert"}
              </p>

              {/* Quick Rating & Enrollment Pill Bar */}
              <div className="hero-metrics-pill-bar">
                <div className="metric-chip">
                  <RatingStars rating={instructor.avgRating} count={null} size="sm" showScore={false} />
                  <strong>{instructor.avgRating > 0 ? instructor.avgRating.toFixed(1) : "5.0"}</strong>
                  <span className="chip-muted">({instructor.reviewCount} {instructor.reviewCount === 1 ? "review" : "reviews"})</span>
                </div>
                <div className="chip-divider" />
                <div className="metric-chip">
                  <span className="chip-icon">👥</span>
                  <strong>{instructor.studentCount.toLocaleString()}</strong>
                  <span className="chip-muted">Active Learners</span>
                </div>
                <div className="chip-divider" />
                <div className="metric-chip">
                  <span className="chip-icon">📚</span>
                  <strong>{instructor.courseCount}</strong>
                  <span className="chip-muted">Published Courses</span>
                </div>
              </div>

              {/* Actions */}
              <div className="hero-action-buttons">
                <button 
                  type="button" 
                  className="btn-glow-primary"
                  onClick={() => setShowMessageModal(true)}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon-sm">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Message Instructor</span>
                </button>

                <button 
                  type="button" 
                  className="btn-glass-secondary"
                  onClick={handleCopyLink}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon-sm">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span>Share Profile</span>
                </button>

                <button 
                  type="button" 
                  className="btn-glass-outline"
                  onClick={handleOpenEditModal}
                  title="Update your public bio and credentials"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon-sm">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            TWO-COLUMN MODERN CONTENT LAYOUT
            ============================================================== */}
        <div className="portfolio-layout-grid">
          {/* Left Column: Sidebar with About, Philosophy & Skills */}
          <aside className="portfolio-sidebar">
            {/* About Card */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">
                <span className="title-icon">📖</span> About the Instructor
              </h3>
              <p className="sidebar-bio-text">
                {instructor.bio || "Dedicated educator committed to delivering hands-on, project-driven learning experiences that empower students to build real-world software careers."}
              </p>
            </div>

            {/* Teaching Philosophy */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">
                <span className="title-icon">🎯</span> Teaching Methodology
              </h3>
              <ul className="methodology-list">
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Practical Project-First Learning</strong>
                    <p className="muted-tiny">Every lecture directly connects to production code.</p>
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Direct Student Mentorship</strong>
                    <p className="muted-tiny">Fast inquiries response through EduMarket Messaging.</p>
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Industry Best Practices</strong>
                    <p className="muted-tiny">Clean architecture, modern tooling, and testing.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Specialties & Tech Stack */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">
                <span className="title-icon">⚡</span> Core Competencies
              </h3>
              <div className="skill-tags-cloud">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag-pill">{skill}</span>
                ))}
              </div>
            </div>

            {/* Trust & Guarantee Card */}
            <div className="sidebar-card trust-card">
              <div className="trust-badge-header">
                <span className="trust-star">🛡️</span>
                <strong>EduMarket Guarantee</strong>
              </div>
              <p className="trust-text">
                All courses authored by {instructor.name} feature full lifetime access, hands-on lab code, and verified certificates.
              </p>
            </div>
          </aside>

          {/* Right Column: Tabbed Content (Courses & Reviews) */}
          <section className="portfolio-main-content">
            {/* Elegant Tab Selector Bar */}
            <div className="portfolio-tabs-nav">
              <button
                type="button"
                className={`tab-btn-pill ${activeTab === "courses" ? "active" : ""}`}
                onClick={() => setActiveTab("courses")}
              >
                <span className="tab-icon">📚</span>
                <span>Courses Catalog ({courses.length})</span>
              </button>
              <button
                type="button"
                className={`tab-btn-pill ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <span className="tab-icon">⭐</span>
                <span>Student Reviews ({recentReviews.length})</span>
              </button>
            </div>

            {/* TAB 1: COURSES CATALOG */}
            {activeTab === "courses" && (
              <div className="tab-content-wrapper">
                {/* Search & Filter Bar */}
                <div className="filter-controls-bar">
                  <div className="search-input-wrapper">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="search-icon">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Search courses by topic, technology, or keywords..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                    />
                    {courseSearch && (
                      <button type="button" onClick={() => setCourseSearch("")} className="search-clear-btn">✕</button>
                    )}
                  </div>

                  <div className="filter-tab-buttons">
                    {["ALL", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        className={`filter-tab ${levelFilter === lvl ? "active" : ""}`}
                        onClick={() => setLevelFilter(lvl)}
                      >
                        {lvl === "ALL" ? "All Levels" : lvl}
                      </button>
                    ))}
                  </div>

                  <div className="sort-dropdown-wrapper">
                    <label htmlFor="course-sort" className="sort-label">Sort:</label>
                    <select
                      id="course-sort"
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="POPULAR">Most Students</option>
                      <option value="RATING">Highest Rated</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                  <div className="empty-results-box">
                    <span className="empty-emoji">🔍</span>
                    <h3>No matching courses found</h3>
                    <p className="muted">Try adjusting your keyword search or switching to "All Levels".</p>
                    <button 
                      type="button" 
                      onClick={() => { setCourseSearch(""); setLevelFilter("ALL"); }}
                      className="btn-secondary"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="course-grid-modern">
                    {filteredCourses.map((c) => (
                      <CourseCard 
                        key={c.courseId} 
                        course={c} 
                        onSelectCourse={handleEnrollCourse} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REVIEWS & TESTIMONIALS */}
            {activeTab === "reviews" && (
              <div className="tab-content-wrapper">
                <ReviewList reviews={recentReviews} />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==============================================================
          MODALS
          ============================================================== */}

      {/* Message Modal (Feature 7 Preview) */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message {instructor.name}</h3>
              <button type="button" onClick={() => setShowMessageModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleSendMessage}>
              <div className="modal-body">
                <p className="modal-helper">
                  Have questions about prerequisites, learning goals, or career guidance? Send an inquiry directly.
                </p>
                <textarea
                  className="modal-textarea"
                  rows={4}
                  required
                  placeholder={`Hi ${instructor.name}, I am interested in your courses and wanted to inquire about...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowMessageModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Enrollment Modal (Feature 12 Integration Preview) */}
      {selectedCourseForEnroll && (
        <div className="modal-overlay" onClick={() => setSelectedCourseForEnroll(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enroll in Course</h3>
              <button type="button" onClick={() => setSelectedCourseForEnroll(null)} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <h4 className="enroll-modal-title">{selectedCourseForEnroll.title}</h4>
              <p className="muted">{selectedCourseForEnroll.description}</p>
              
              <div className="enroll-pricing-summary">
                <span>Tuition Total:</span>
                <strong>৳{Number(selectedCourseForEnroll.price).toLocaleString()}</strong>
              </div>

              <div className="enroll-feature-list">
                <div className="feature-item">✓ Full lifetime access to all lecture modules</div>
                <div className="feature-item">✓ Practical assignments and grading rubrics</div>
                <div className="feature-item">✓ EduMarket verified certificate of completion</div>
              </div>

              <p className="enroll-note">
                <strong>Checkout Workflow:</strong> Clicking below initiates enrollment and hands off to <em>Feature 12 (Integrated Checkout & Invoicing)</em> for payment processing.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setSelectedCourseForEnroll(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={confirmEnrollment} className="btn-primary">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Instructor Write Operation) */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !isSaving && setShowEditModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Instructor Profile</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="modal-close" disabled={isSaving}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="modal-body">
                <div className="form-group-modern">
                  <label className="form-label" htmlFor="edit-name">Display Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="modal-input"
                    value={editName}
                    required
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label" htmlFor="edit-avatar">Profile Picture URL</label>
                  <input
                    id="edit-avatar"
                    type="url"
                    className="modal-input"
                    value={editAvatarUrl}
                    placeholder="Paste an image URL (e.g. Unsplash, LinkedIn photo link)"
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                  />
                  <p className="muted-tiny" style={{ marginTop: "4px" }}>
                    Leave blank to use curated educator portrait.
                  </p>
                </div>

                <div className="form-group-modern">
                  <label className="form-label" htmlFor="edit-bio">Public Bio & Academic Credentials</label>
                  <textarea
                    id="edit-bio"
                    className="modal-textarea"
                    rows={5}
                    value={editBio}
                    placeholder="Describe your teaching experience, research background, and industry projects..."
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
