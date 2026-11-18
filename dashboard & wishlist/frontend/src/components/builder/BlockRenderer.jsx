import React from "react";
import { safeUrl, youtubeEmbedUrl } from "./blockUtils";

/** Draws one block exactly as visitors will see it. Used by the builder preview and the public page. */
export default function BlockRenderer({ block }) {
  const p = block.props || {};

  switch (block.type) {
    case "hero":
      return (
        <section className="lp-hero">
          <h1>{p.heading}</h1>
          {p.subheading && <p>{p.subheading}</p>}
          {p.buttonText && (
            <a className="lp-button" href={safeUrl(p.buttonLink) || "#"} rel="noopener noreferrer">
              {p.buttonText}
            </a>
          )}
        </section>
      );

    case "text":
      return (
        <section className="lp-text">
          {p.heading && <h2>{p.heading}</h2>}
          <p>{p.body}</p>
        </section>
      );

    case "image": {
      const src = safeUrl(p.url);
      return (
        <figure className="lp-image">
          {src ? <img src={src} alt={p.caption || ""} /> : <div className="lp-placeholder">Add an image address</div>}
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      );
    }

    case "video": {
      const embed = youtubeEmbedUrl(p.url);
      return (
        <figure className="lp-video">
          {embed ? (
            <iframe
              src={embed}
              title={p.caption || "Course video"}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="lp-placeholder">Paste a YouTube link</div>
          )}
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      );
    }

    case "features":
      return (
        <section className="lp-features">
          {p.heading && <h2>{p.heading}</h2>}
          <ul>
            {(p.items || []).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      );

    case "testimonial":
      return (
        <blockquote className="lp-testimonial">
          <p>“{p.quote}”</p>
          <footer>{p.author}</footer>
        </blockquote>
      );

    case "faq":
      return (
        <section className="lp-faq">
          {p.heading && <h2>{p.heading}</h2>}
          {(p.items || []).map((item, i) => (
            <details key={i}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
      );

    case "cta":
      return (
        <section className="lp-cta">
          <h2>{p.heading}</h2>
          {p.buttonText && (
            <a className="lp-button" href={safeUrl(p.buttonLink) || "#"} rel="noopener noreferrer">
              {p.buttonText}
            </a>
          )}
        </section>
      );

    default:
      return <div className="lp-placeholder">Unknown block: {String(block.type)}</div>;
  }
}
