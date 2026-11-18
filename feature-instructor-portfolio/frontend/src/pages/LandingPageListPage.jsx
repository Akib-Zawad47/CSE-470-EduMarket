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
    <main className="lp-admin">
      <div className="lp-admin-head">
        <h1>Landing pages</h1>
        <Link className="btn" to="/builder/new">+ New page</Link>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && pages.length === 0 && (
        <p className="muted">No pages yet. Click "New page" to build your first one.</p>
      )}

      {pages.length > 0 && (
        <table className="lp-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Web address</th>
              <th>Blocks</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.pageId}>
                <td>{p.title}</td>
                <td><code>/builder/view/{p.slug}</code></td>
                <td>{p.blockCount}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="lp-actions">
                  <Link className="btn-small" to={`/builder/${p.pageId}`}>Edit</Link>
                  <Link className="btn-small" to={`/builder/view/${p.slug}`} target="_blank">View</Link>
                  <button type="button" className="btn-small btn-danger" onClick={() => handleDelete(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
