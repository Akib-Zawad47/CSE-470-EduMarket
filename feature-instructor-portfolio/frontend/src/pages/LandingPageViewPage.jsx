import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicPage } from "../services/landingPageService";
import BlockRenderer from "../components/builder/BlockRenderer";
import "../styles/builder.css";

/** The public page that visitors see at /p/<slug>. No login needed. */
export default function LandingPageViewPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(null);
    setError("");
    fetchPublicPage(slug)
      .then((data) => {
        setPage(data);
        document.title = data.title;
      })
      .catch((e) => {
        setError(e.response && e.response.status === 404 ? "This page does not exist." : "Could not load this page.");
      });
  }, [slug]);

  if (error) return <main className="lp-admin"><p className="error">{error}</p></main>;
  if (!page) return <main className="lp-admin"><p className="muted">Loading...</p></main>;

  return (
    <div className="lp-page">
      {page.blocks.map((block, i) => (
        <BlockRenderer key={block.id || i} block={block} />
      ))}
    </div>
  );
}
