import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicPage } from "../services/landingPageService";
import BlockRenderer from "../components/builder/BlockRenderer";
import "../styles/builder.css";

/** Public landing page visible at /builder/view/:slug */
export default function LandingPageViewPage() {
  const { slug } = useParams();
  const [page, setPage]   = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(null);
    setError("");
    fetchPublicPage(slug)
      .then((data) => {
        setPage(data);
        document.title = `${data.title} — EduMarket`;
      })
      .catch((e) => {
        setError(
          e.response && e.response.status === 404
            ? "This page does not exist."
            : "Could not load this page."
        );
      });
  }, [slug]);

  /* ── Navbar shared across states ── */
  const Navbar = () => (
    <nav className="site-navbar">
      <div className="nav-container">
        <Link to="/builder" className="nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">
            Edu<strong>Market</strong>
          </span>
        </Link>
        <div className="nav-actions">
          <Link to="/builder" className="nav-back-btn">
            ← Back to Builder
          </Link>
        </div>
      </div>
    </nav>
  );

  /* ── Error state ── */
  if (error) {
    return (
      <div className="lp-page-wrapper">
        <Navbar />
        <div className="lp-view-state">
          <div className="state-icon">⚠️</div>
          <h2>Oops — something went wrong</h2>
          <p>{error}</p>
          <Link to="/builder" className="btn" style={{ marginTop: 8 }}>
            ← Back to Builder
          </Link>
        </div>
      </div>
    );
  }

  /* ── Loading state ── */
  if (!page) {
    return (
      <div className="lp-page-wrapper">
        <Navbar />
        <div className="lp-view-state">
          <div className="lp-spinner" />
          <h2>Loading page…</h2>
          <p>Fetching your landing page content.</p>
        </div>
      </div>
    );
  }

  /* ── Page ready ── */
  return (
    <div className="lp-page-wrapper">
      <Navbar />
      <div className="lp-page">
        {page.blocks.map((block, i) => (
          <BlockRenderer key={block.id || i} block={block} />
        ))}
      </div>
    </div>
  );
}
