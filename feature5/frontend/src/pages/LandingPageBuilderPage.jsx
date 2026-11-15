import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPage, updatePage, fetchPage, errorMessage } from "../services/landingPageService";
import { fetchInstructors, fetchPortfolio } from "../services/portfolioService";
import BlockRenderer from "../components/builder/BlockRenderer";
import BlockEditor from "../components/builder/BlockEditor";
import {
  BLOCK_TYPES,
  BLOCK_ORDER,
  insertBlock,
  moveBlock,
  newBlock,
  removeBlock,
  slugify,
  updateBlockProps,
  withIds,
} from "../components/builder/blockUtils";
import "../styles/builder.css";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function LandingPageBuilderPage() {
  const { id } = useParams(); // undefined when creating a new page
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [instructorId, setInstructorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selected, setSelected] = useState(null); // index of the block being edited
  const [previewing, setPreviewing] = useState(false);
  const [dropGap, setDropGap] = useState(null); // gap highlighted while dragging

  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load the instructor list once (reuses the Feature 5 API).
  useEffect(() => {
    fetchInstructors("")
      .then(setInstructors)
      .catch(() => setMessage({ type: "error", text: "Could not load instructors. Is the backend running?" }));
  }, []);

  // When editing an existing page, load it.
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPage(id)
      .then((page) => {
        setTitle(page.title);
        setSlug(page.slug);
        setSlugTouched(true);
        setInstructorId(String(page.instructorId));
        setCourseId(String(page.courseId));
        setBlocks(withIds(page.blocks));
      })
      .catch(() => setMessage({ type: "error", text: "Could not load this page." }))
      .finally(() => setLoading(false));
  }, [id]);

  // Whenever the instructor changes, load that instructor's courses.
  useEffect(() => {
    if (!instructorId) {
      setCourses([]);
      return;
    }
    fetchPortfolio(instructorId)
      .then((data) => setCourses(data.courses))
      .catch(() => setCourses([]));
  }, [instructorId]);

  function handleTitle(value) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  // ---- block actions ----
  function addBlock(type, index = blocks.length) {
    setBlocks((current) => insertBlock(current, index, newBlock(type)));
    setSelected(index);
    setPreviewing(false);
  }

  function handleDrop(event, gapIndex) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    setDropGap(null);
    if (data.startsWith("new:")) {
      const type = data.slice(4);
      if (BLOCK_TYPES[type]) addBlock(type, gapIndex);
    } else if (data.startsWith("move:")) {
      const from = Number(data.slice(5));
      setBlocks((current) => moveBlock(current, from, gapIndex));
      const target = from < gapIndex ? gapIndex - 1 : gapIndex;
      setSelected(target);
    }
  }

  function moveBy(index, delta) {
    const to = delta < 0 ? index - 1 : index + 2; // gap before the previous / after the next block
    if (to < 0 || to > blocks.length) return;
    setBlocks((current) => moveBlock(current, index, to));
    setSelected(index + delta);
  }

  function handleRemove(index) {
    setBlocks((current) => removeBlock(current, index));
    setSelected(null);
  }

  // ---- saving ----
  async function handleSave() {
    if (!title.trim()) return setMessage({ type: "error", text: "Please enter a page title." });
    if (!SLUG_PATTERN.test(slug)) {
      return setMessage({ type: "error", text: "Web address may only use lowercase letters, numbers and hyphens." });
    }
    if (!instructorId) return setMessage({ type: "error", text: "Please choose an instructor." });
    if (!courseId) return setMessage({ type: "error", text: "Please choose a course." });

    const payload = {
      title: title.trim(),
      slug,
      instructorId: Number(instructorId),
      courseId: Number(courseId),
      blocks,
    };

    setSaving(true);
    try {
      if (id) {
        await updatePage(id, payload);
        setMessage({ type: "ok", text: "Saved." });
      } else {
        const created = await createPage(payload);
        setMessage({ type: "ok", text: "Page created." });
        navigate(`/builder/${created.pageId}`, { replace: true });
      }
    } catch (e) {
      setMessage({ type: "error", text: errorMessage(e, "Could not save the page.") });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="lp-admin"><p className="muted">Loading...</p></main>;

  const selectedBlock = selected !== null ? blocks[selected] : null;

  return (
    <main className="builder">
      <header className="builder-top">
        <Link to="/builder">← All pages</Link>
        <div className="builder-top-actions">
          <button type="button" className="btn-small" onClick={() => setPreviewing((v) => !v)}>
            {previewing ? "Back to editing" : "Preview"}
          </button>
          {id && slug && (
            <Link className="btn-small" to={`/builder/view/${slug}`} target="_blank">Open public page</Link>
          )}
          <button type="button" className="btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save page"}
          </button>
        </div>
      </header>

      {message.text && (
        <p className={message.type === "error" ? "error" : "success"} role="status">{message.text}</p>
      )}

      <section className="builder-meta">
        <label>
          Page title
          <input value={title} onChange={(e) => handleTitle(e.target.value)} placeholder="Web Dev Bootcamp" />
        </label>
        <label>
          Web address
          <div className="slug-row">
            <span>/builder/view/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="web-dev-bootcamp"
            />
          </div>
        </label>
        <label>
          Instructor
          <select
            value={instructorId}
            onChange={(e) => {
              setInstructorId(e.target.value);
              setCourseId("");
            }}
          >
            <option value="">Choose...</option>
            {instructors.map((i) => (
              <option key={i.instructorId} value={i.instructorId}>{i.name}</option>
            ))}
          </select>
        </label>
        <label>
          Course
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!instructorId}>
            <option value="">Choose...</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>{c.title}</option>
            ))}
          </select>
        </label>
      </section>

      {previewing ? (
        <div className="lp-page lp-preview">
          {blocks.length === 0 && <p className="muted">Nothing to preview yet. Add some blocks first.</p>}
          {blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
        </div>
      ) : (
        <div className="builder-grid">
          <aside className="palette">
            <h3>Blocks</h3>
            <p className="muted small">Drag a block onto the page, or click it to add it at the end.</p>
            {BLOCK_ORDER.map((type) => (
              <button
                key={type}
                type="button"
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", `new:${type}`);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => addBlock(type)}
              >
                <span aria-hidden="true">{BLOCK_TYPES[type].icon}</span> {BLOCK_TYPES[type].label}
              </button>
            ))}
          </aside>

          <section className="canvas" aria-label="Page canvas">
            {blocks.length === 0 && (
              <div
                className={"drop-empty" + (dropGap === 0 ? " active" : "")}
                onDragOver={(e) => { e.preventDefault(); setDropGap(0); }}
                onDragLeave={() => setDropGap(null)}
                onDrop={(e) => handleDrop(e, 0)}
              >
                Drop your first block here
              </div>
            )}

            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <div
                  className={"drop-gap" + (dropGap === index ? " active" : "")}
                  onDragOver={(e) => { e.preventDefault(); setDropGap(index); }}
                  onDragLeave={() => setDropGap(null)}
                  onDrop={(e) => handleDrop(e, index)}
                />
                <div
                  className={"canvas-block" + (selected === index ? " selected" : "")}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", `move:${index}`);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => setSelected(index)}
                >
                  <div className="canvas-block-bar">
                    <span>{BLOCK_TYPES[block.type] ? BLOCK_TYPES[block.type].label : block.type}</span>
                    <span className="canvas-block-buttons">
                      <button type="button" className="btn-small" aria-label="Move up" disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); moveBy(index, -1); }}>↑</button>
                      <button type="button" className="btn-small" aria-label="Move down" disabled={index === blocks.length - 1}
                        onClick={(e) => { e.stopPropagation(); moveBy(index, 1); }}>↓</button>
                      <button type="button" className="btn-small btn-danger" aria-label="Delete block"
                        onClick={(e) => { e.stopPropagation(); handleRemove(index); }}>✕</button>
                    </span>
                  </div>
                  <div className="canvas-block-body"><BlockRenderer block={block} /></div>
                </div>
              </React.Fragment>
            ))}

            {blocks.length > 0 && (
              <div
                className={"drop-gap" + (dropGap === blocks.length ? " active" : "")}
                onDragOver={(e) => { e.preventDefault(); setDropGap(blocks.length); }}
                onDragLeave={() => setDropGap(null)}
                onDrop={(e) => handleDrop(e, blocks.length)}
              />
            )}
          </section>

          <aside className="settings">
            {selectedBlock ? (
              <BlockEditor
                block={selectedBlock}
                onChange={(props) => setBlocks((current) => updateBlockProps(current, selected, props))}
              />
            ) : (
              <p className="muted">Click a block on the page to edit its text and links.</p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
