import React from "react";
import { BLOCK_TYPES } from "./blockUtils";

/** The settings form for the selected block. Calls onChange with only the settings that changed. */
export default function BlockEditor({ block, onChange }) {
  const definition = BLOCK_TYPES[block.type];
  if (!definition) return null;
  const props = block.props || {};

  return (
    <div className="editor">
      <h3>{definition.label} settings</h3>
      {definition.fields.map((field) => {
        const id = `${block.id}-${field.name}`;

        if (field.kind === "textarea") {
          return (
            <label key={field.name} htmlFor={id}>
              {field.label}
              <textarea
                id={id}
                rows={4}
                value={props[field.name] || ""}
                onChange={(e) => onChange({ [field.name]: e.target.value })}
              />
            </label>
          );
        }

        if (field.kind === "lines") {
          return (
            <label key={field.name} htmlFor={id}>
              {field.label}
              <textarea
                id={id}
                rows={5}
                value={(props[field.name] || []).join("\n")}
                onChange={(e) => onChange({ [field.name]: e.target.value.split("\n") })}
              />
            </label>
          );
        }

        if (field.kind === "faq") {
          const items = props[field.name] || [];
          const setItem = (i, patch) =>
            onChange({ [field.name]: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
          return (
            <div key={field.name} className="faq-editor">
              <span className="editor-label">{field.label}</span>
              {items.map((item, i) => (
                <div key={i} className="faq-item">
                  <input
                    aria-label={`Question ${i + 1}`}
                    placeholder="Question"
                    value={item.q || ""}
                    onChange={(e) => setItem(i, { q: e.target.value })}
                  />
                  <textarea
                    aria-label={`Answer ${i + 1}`}
                    placeholder="Answer"
                    rows={2}
                    value={item.a || ""}
                    onChange={(e) => setItem(i, { a: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => onChange({ [field.name]: items.filter((_, idx) => idx !== i) })}
                  >
                    Remove question
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-small"
                onClick={() => onChange({ [field.name]: [...items, { q: "", a: "" }] })}
              >
                + Add question
              </button>
            </div>
          );
        }

        return (
          <label key={field.name} htmlFor={id}>
            {field.label}
            <input
              id={id}
              type="text"
              value={props[field.name] || ""}
              onChange={(e) => onChange({ [field.name]: e.target.value })}
            />
          </label>
        );
      })}
    </div>
  );
}
