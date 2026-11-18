import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPages, deletePage, errorMessage } from "../services/landingPageService";
import "../styles/builder.css";

export default function LandingPageListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetchPages()
      .then((data) => {
        setPages(data);
        setError("");
      })
      .catch(() => setError("Could not load pages. Is the backend running?"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(page) {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      await deletePage(page.pageId);
      load();
    } catch (e) {
      setError(errorMessage(e, "Could not delete this page."));
    }
  }

  return (
    <div className="lp-admin-wrapper">
      {/* ── Navbar ── */}
      <nav className="site-navbar">
        <div className="nav-container">
          <a href="/" className="nav-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">
              Edu<strong>Market</strong>
            </span>
          </a>
          <div className="nav-actions">
            <Link className="btn" to="/builder/new">
              + New Page
            </Link>
          </div>
        </div>
      </nav>

      <div className="lp-admin-body">
        {/* ── Hero strip ── */}
        <div className="lp-admin-hero">
          <div className="lp-admin-hero-inner">
            <div className="lp-admin-hero-text">
              <h1>🚀 Landing Page Builder</h1>
              <p>
                Create beautiful, branded course landing pages in minutes. Drag,
                drop, and publish — no code required.
              </p>
            </div>
            <Link className="btn" to="/builder/new" style={{ flexShrink: 0 }}>
              + New Page
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && !error && (
          <div className="lp-admin-stats">
            <div className="stat-card">
              <span className="stat-card-label">Total Pages</span>
              <span className="stat-card-value">{pages.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Blocks</span>
              <span className="stat-card-value">
                {pages.reduce((sum, p) => sum + (p.blockCount || 0), 0)}
              </span>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && <p className="error" style={{ marginBottom: 20 }}>⚠ {error}</p>}

        {/* ── Section header ── */}
        <div className="lp-section-header">
          <h2 className="lp-section-title">Your Landing Pages</h2>
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="lp-skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="lp-skeleton-card" />
            ))}
          </div>
        )}

        {/* ── Cards grid ── */}
        {!loading && (
          <div className="lp-cards-grid">
            {pages.length === 0 && (
              <div className="lp-empty-state">
                <div className="lp-empty-icon">📄</div>
                <h3>No pages yet</h3>
                <p>
                  Click &ldquo;New Page&rdquo; to build your first landing page and start
                  attracting students.
                </p>
                <Link className="btn" to="/builder/new">
                  + Create First Page
                </Link>
              </div>
            )}

            {pages.map((p) => (
              <div className="lp-page-card" key={p.pageId}>
                <div className="lp-page-card-banner" />
                <div className="lp-page-card-body">
                  <h3 className="lp-page-card-title">{p.title}</h3>
                  <span className="lp-page-card-slug">
                    /builder/view/{p.slug}
                  </span>
                  <div className="lp-page-card-meta">
                    <span>🧩 {p.blockCount ?? 0} blocks</span>
                    <span>
                      📅{" "}
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="lp-page-card-actions">
                  <Link className="btn-small" to={`/builder/${p.pageId}`}>
                    ✏ Edit
                  </Link>
                  <Link
                    className="btn-small"
                    to={`/builder/view/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    👁 View
                  </Link>
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(p)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
