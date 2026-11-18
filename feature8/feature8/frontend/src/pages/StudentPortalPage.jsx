import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginStudent,
  registerStudent,
  fetchAllCourses,
  fetchWishlist,
  addCourseToWishlist,
  removeCourseFromWishlist,
} from "../services/wishlistService";
import "../styles/studentDashboard.css";

const STUDENT_CURRENT_COURSES = {
  "1": [
    {
      courseId: 1,
      title: "Full-Stack Web Development",
      description: "HTML, CSS, JS, Node and PostgreSQL.",
      level: "Beginner",
      instructorName: "Rahim Uddin",
      progress: 72,
      price: 4500,
    },
    {
      courseId: 3,
      title: "Python for Data Science",
      description: "Pandas, NumPy and visualization.",
      level: "Beginner",
      instructorName: "Farhana Akter",
      progress: 45,
      price: 4000,
    },
  ],
  "2": [
    {
      courseId: 2,
      title: "Spring Boot in Practice",
      description: "REST APIs with Spring Boot and JPA.",
      level: "Intermediate",
      instructorName: "Rahim Uddin",
      progress: 64,
      price: 5500,
    },
    {
      courseId: 4,
      title: "Machine Learning Basics",
      description: "Supervised learning from scratch.",
      level: "Intermediate",
      instructorName: "Farhana Akter",
      progress: 30,
      price: 6000,
    },
  ],
};

export default function StudentPortalPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("edumarket_student") || "null");
    } catch {
      return null;
    }
  });

  // Auth form states
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [major, setMajor] = useState("CSE");
  const [level, setLevel] = useState("Undergraduate");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard states
  const [activeNav, setActiveNav] = useState("dashboard");
  const [allCourses, setAllCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Chatbot popup states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm the EduMarket AI Course Advisor. Ask me about courses, prerequisites, or your wishlist!",
    },
  ]);

  useEffect(() => {
    if (student) {
      loadCoursesAndWishlist(student.studentId);
    }
  }, [student]);

  async function loadCoursesAndWishlist(studentId) {
    setWishlistLoading(true);
    try {
      const [coursesData, wishlistData] = await Promise.all([
        fetchAllCourses(),
        fetchWishlist(studentId),
      ]);
      setAllCourses(coursesData);
      setWishlist(wishlistData);
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      let userData;
      if (authMode === "login") {
        userData = await loginStudent(email, password);
      } else {
        userData = await registerStudent({ name, email, password, major, level });
      }
      localStorage.setItem("edumarket_student", JSON.stringify(userData));
      setStudent(userData);
    } catch (err) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("edumarket_student");
    setStudent(null);
    setEmail("");
    setPassword("");
    setActiveNav("dashboard");
  }

  function isWishlisted(courseId) {
    return wishlist.some((c) => Number(c.courseId) === Number(courseId));
  }

  async function toggleWishlist(course) {
    if (!student) return;
    const exists = isWishlisted(course.courseId);
    if (exists) {
      setWishlist((prev) => prev.filter((c) => Number(c.courseId) !== Number(course.courseId)));
      await removeCourseFromWishlist(student.studentId, course.courseId);
    } else {
      setWishlist((prev) => [course, ...prev]);
      await addCourseToWishlist(student.studentId, course);
    }
  }

  function handleSendChat(e) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const next = [...chatMessages, { sender: "user", text: trimmed }];
    setChatMessages(next);
    setChatInput("");

    const lower = trimmed.toLowerCase();
    let reply =
      "I recommend starting with Full-Stack Web Development or Python for Data Science! You can heart any course to save it to your Wishlist.";
    if (lower.includes("machine learning") || lower.includes("ml")) {
      reply =
        "For Machine Learning Basics, basic Python knowledge is recommended. Taking 'Python for Data Science' first is a great step!";
    } else if (lower.includes("wishlist")) {
      reply = `You currently have ${wishlist.length} course(s) saved in your Wishlist. Click 'Wishlist' in the left sidebar to manage them!`;
    } else if (lower.includes("discount") || lower.includes("coupon")) {
      reply = "Use coupon EARLY500 for 500 BDT off Full-Stack Web Development, or PY300 for Python for Data Science!";
    }

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 350);
  }

  // 1. IF NOT LOGGED IN -> SHOW LOGIN / REGISTER PAGE
  if (!student) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-icon">🎓</span>
            <span className="auth-brand-title">EduMarket</span>
          </div>
          <p className="auth-subtitle">
            {authMode === "login"
              ? "Sign in with your Student Email ID and Password"
              : "Create a new Student Account"}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
            >
              Register
            </button>
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email ID</label>
              <input
                type="text"
                placeholder="Enter your Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authMode === "register" && (
              <>
                <div className="auth-field">
                  <label>Major</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, EEE, BBA"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Level</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="auth-submit-btn" disabled={authLoading}>
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Log In to Dashboard"
                : "Register & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Current courses for the logged-in student
  const currentEnrolledCourses =
    STUDENT_CURRENT_COURSES[String(student.email)] || STUDENT_CURRENT_COURSES["1"];

  // 2. LOGGED IN -> SHOW SIDEBAR & DASHBOARD MATCHING IMAGE
  return (
    <div className="student-layout">
      {/* Left Sidebar matching uploaded image */}
      <aside className="edumarket-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">EduMarket</span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNav("dashboard")}
          >
            <span className="sidebar-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "explore" ? "active" : ""}`}
            onClick={() => setActiveNav("explore")}
          >
            <span className="sidebar-icon">🎓</span>
            <span>Explore Courses</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "my-courses" ? "active" : ""}`}
            onClick={() => setActiveNav("my-courses")}
          >
            <span className="sidebar-icon">💼</span>
            <span>My Courses</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveNav("wishlist")}
          >
            <span className="sidebar-icon">🤍</span>
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="sidebar-wishlist-count">{wishlist.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "messages" ? "active" : ""}`}
            onClick={() => setActiveNav("messages")}
          >
            <span className="sidebar-icon">💬</span>
            <span>Messages</span>
            <span className="sidebar-badge">3</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "payments" ? "active" : ""}`}
            onClick={() => setActiveNav("payments")}
          >
            <span className="sidebar-icon">💳</span>
            <span>Payments</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "invoices" ? "active" : ""}`}
            onClick={() => setActiveNav("invoices")}
          >
            <span className="sidebar-icon">📄</span>
            <span>Invoices</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "referrals" ? "active" : ""}`}
            onClick={() => setActiveNav("referrals")}
          >
            <span className="sidebar-icon">🎁</span>
            <span>Referral & Rewards</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeNav === "profile" ? "active" : ""}`}
            onClick={() => setActiveNav("profile")}
          >
            <span className="sidebar-icon">👤</span>
            <span>Profile</span>
          </button>
        </nav>

        {/* Refer a Friend Card */}
        <div className="sidebar-refer-card">
          <div className="refer-crown">👑</div>
          <p className="refer-title">Refer a Friend</p>
          <p className="refer-subtitle">Get 20% Reward!</p>
          <button
            type="button"
            className="refer-btn"
            onClick={() => setActiveNav("referrals")}
          >
            Invite Now
          </button>
        </div>

        {/* Logout */}
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-icon">↪️</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="student-main">
        <header className="student-topbar">
          <div className="topbar-welcome">
            <h1>Welcome back, {student.name}!</h1>
            <p>
              Email ID: <strong>{student.email}</strong> • {student.major || "CSE"} ({student.level || "Undergraduate"})
            </p>
          </div>
          <div className="topbar-user">
            <button
              type="button"
              onClick={() => navigate("/instructors")}
              style={{
                padding: "7px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Instructors
            </button>
            <button
              type="button"
              onClick={() => navigate("/builder")}
              style={{
                padding: "7px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Landing Pages
            </button>
            <span className="topbar-points">⭐ {student.rewardPoints ?? 120} pts</span>
            <div className="topbar-avatar">
              {(student.name || "S").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="student-content">
          {/* DASHBOARD TAB */}
          {activeNav === "dashboard" && (
            <>
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-box-label">Current Enrolled Courses</div>
                  <div className="stat-box-value">{currentEnrolledCourses.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Wishlist Courses</div>
                  <div className="stat-box-value">{wishlist.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Unread Messages</div>
                  <div className="stat-box-value">3</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Reward Points</div>
                  <div className="stat-box-value">{student.rewardPoints ?? 120}</div>
                </div>
              </div>

              {/* Current Courses the Student Took */}
              <div className="section-heading">
                <h2>📚 Current Courses You Are Taking</h2>
              </div>
              <div className="courses-grid" style={{ marginBottom: "36px" }}>
                {currentEnrolledCourses.map((course) => (
                  <div key={course.courseId} className="student-course-card">
                    <div>
                      <div className="course-tag-row">
                        <span className="course-level-badge">{course.level}</span>
                        <button
                          type="button"
                          title={
                            isWishlisted(course.courseId)
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                          className={`wishlist-heart-btn ${
                            isWishlisted(course.courseId) ? "saved" : ""
                          }`}
                          onClick={() => toggleWishlist(course)}
                        >
                          {isWishlisted(course.courseId) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <h3 className="student-course-title">{course.title}</h3>
                      <p className="student-course-desc">{course.description}</p>
                      <div className="student-course-meta">
                        <span>👨‍🏫 {course.instructorName}</span>
                        <span>ACTIVE</span>
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-label">
                        <span>Course Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended / All Available Courses to Add to Wishlist */}
              <div className="section-heading">
                <h2>✨ Available Courses (Click ❤️ to Add to Wishlist)</h2>
              </div>
              <div className="courses-grid">
                {allCourses.map((course) => {
                  const saved = isWishlisted(course.courseId);
                  return (
                    <div key={course.courseId} className="student-course-card">
                      <div>
                        <div className="course-tag-row">
                          <span className="course-level-badge">{course.level}</span>
                          <button
                            type="button"
                            className={`wishlist-heart-btn ${saved ? "saved" : ""}`}
                            onClick={() => toggleWishlist(course)}
                          >
                            {saved ? "❤️" : "🤍"}
                          </button>
                        </div>
                        <h3 className="student-course-title">{course.title}</h3>
                        <p className="student-course-desc">{course.description}</p>
                        <div className="student-course-meta">
                          <span>👨‍🏫 {course.instructorName}</span>
                          <span>⭐ {course.avgRating}</span>
                        </div>
                      </div>
                      <div className="course-card-footer">
                        <span className="course-price-text">৳{course.price}</span>
                        <button
                          type="button"
                          className={`wishlist-action-btn ${saved ? "remove" : ""}`}
                          onClick={() => toggleWishlist(course)}
                        >
                          {saved ? "Remove Wishlist" : "+ Add to Wishlist"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* WISHLIST TAB (Connected to Backend + Database) */}
          {activeNav === "wishlist" && (
            <>
              <div className="section-heading">
                <h2>❤️ My Wishlist ({wishlist.length})</h2>
                <button
                  type="button"
                  className="wishlist-action-btn"
                  onClick={() => setActiveNav("explore")}
                >
                  + Browse More Courses
                </button>
              </div>
              {wishlistLoading ? (
                <p>Loading your wishlist from database...</p>
              ) : wishlist.length === 0 ? (
                <div className="stat-box" style={{ textAlign: "center", padding: "40px" }}>
                  <h3>Your wishlist is empty</h3>
                  <p style={{ color: "#64748b" }}>
                    Explore courses and click the heart icon to save courses you like!
                  </p>
                  <button
                    type="button"
                    className="wishlist-action-btn"
                    onClick={() => setActiveNav("explore")}
                  >
                    Explore Courses
                  </button>
                </div>
              ) : (
                <div className="courses-grid">
                  {wishlist.map((course) => (
                    <div key={course.courseId} className="student-course-card">
                      <div>
                        <div className="course-tag-row">
                          <span className="course-level-badge">{course.level}</span>
                          <button
                            type="button"
                            className="wishlist-heart-btn saved"
                            onClick={() => toggleWishlist(course)}
                          >
                            ❤️
                          </button>
                        </div>
                        <h3 className="student-course-title">{course.title}</h3>
                        <p className="student-course-desc">{course.description}</p>
                        <div className="student-course-meta">
                          <span>👨‍🏫 {course.instructorName}</span>
                          <span>⭐ {course.avgRating || 4.8}</span>
                        </div>
                      </div>
                      <div className="course-card-footer">
                        <span className="course-price-text">৳{course.price}</span>
                        <button
                          type="button"
                          className="wishlist-action-btn remove"
                          onClick={() => toggleWishlist(course)}
                        >
                          Remove from Wishlist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* EXPLORE COURSES TAB */}
          {activeNav === "explore" && (
            <>
              <div className="section-heading">
                <h2>🎓 Explore All Courses</h2>
              </div>
              <div className="courses-grid">
                {allCourses.map((course) => {
                  const saved = isWishlisted(course.courseId);
                  return (
                    <div key={course.courseId} className="student-course-card">
                      <div>
                        <div className="course-tag-row">
                          <span className="course-level-badge">{course.level}</span>
                          <button
                            type="button"
                            className={`wishlist-heart-btn ${saved ? "saved" : ""}`}
                            onClick={() => toggleWishlist(course)}
                          >
                            {saved ? "❤️" : "🤍"}
                          </button>
                        </div>
                        <h3 className="student-course-title">{course.title}</h3>
                        <p className="student-course-desc">{course.description}</p>
                        <div className="student-course-meta">
                          <span>👨‍🏫 {course.instructorName}</span>
                          <span>⭐ {course.avgRating}</span>
                        </div>
                      </div>
                      <div className="course-card-footer">
                        <span className="course-price-text">৳{course.price}</span>
                        <button
                          type="button"
                          className={`wishlist-action-btn ${saved ? "remove" : ""}`}
                          onClick={() => toggleWishlist(course)}
                        >
                          {saved ? "Remove Wishlist" : "+ Add to Wishlist"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* MY COURSES TAB */}
          {activeNav === "my-courses" && (
            <>
              <div className="section-heading">
                <h2>💼 My Enrolled Courses</h2>
              </div>
              <div className="courses-grid">
                {currentEnrolledCourses.map((course) => (
                  <div key={course.courseId} className="student-course-card">
                    <div>
                      <div className="course-tag-row">
                        <span className="course-level-badge">{course.level}</span>
                      </div>
                      <h3 className="student-course-title">{course.title}</h3>
                      <p className="student-course-desc">{course.description}</p>
                      <div className="student-course-meta">
                        <span>👨‍🏫 {course.instructorName}</span>
                        <span>ACTIVE</span>
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* OTHER SIDEBAR TABS (FRONTEND PREVIEW) */}
          {["messages", "payments", "invoices", "referrals", "profile"].includes(
            activeNav
          ) && (
            <div className="stat-box" style={{ padding: "28px" }}>
              <h2 style={{ marginTop: 0, textTransform: "capitalize" }}>
                {activeNav.replace("-", " & ")}
              </h2>
              {activeNav === "messages" && (
                <div>
                  <p><strong>Rahim Uddin (Instructor):</strong> Welcome to Full-Stack Web Development!</p>
                  <p><strong>Farhana Akter (Instructor):</strong> Week 2 Python notebooks have been posted.</p>
                  <p><strong>EduMarket Support:</strong> Use coupon EARLY500 for 500 BDT off.</p>
                </div>
              )}
              {activeNav === "payments" && (
                <p>Recent Payment: ৳4,000.00 via bKash — Status: <strong>PAID</strong></p>
              )}
              {activeNav === "invoices" && (
                <p>Invoice #INV-0001 — Total: ৳4,000.00 — Issued: Active Term</p>
              )}
              {activeNav === "referrals" && (
                <p>Your Referral Code: <strong>STUDENT-{student.email}00</strong> • Reward Points: <strong>{student.rewardPoints ?? 120} pts</strong></p>
              )}
              {activeNav === "profile" && (
                <div>
                  <p><strong>Name:</strong> {student.name}</p>
                  <p><strong>Email ID:</strong> {student.email}</p>
                  <p><strong>Major:</strong> {student.major || "CSE"}</p>
                  <p><strong>Level:</strong> {student.level || "Undergraduate"}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Chatbot Text Icon & Popup */}
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setChatOpen((prev) => !prev)}
      >
        <span>💬</span>
        <span>AI Chatbot</span>
      </button>

      {chatOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span>🤖</span>
              <span>EduMarket AI Advisor</span>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setChatOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form className="chatbot-input-area" onSubmit={handleSendChat}>
            <input
              type="text"
              placeholder="Ask about courses or wishlist..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
