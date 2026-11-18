// Plain helper functions for the page builder. No React in here, so they are easy to test.

/** The pre-defined blocks. "fields" tells the editor panel which inputs to show. */
export const BLOCK_TYPES = {
  hero: {
    label: "Hero banner",
    icon: "🏁",
    defaults: () => ({
      heading: "Learn a skill that gets you hired",
      subheading: "A short line that explains what students will achieve.",
      buttonText: "Enroll now",
      buttonLink: "#",
    }),
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "subheading", label: "Sub-heading", kind: "textarea" },
      { name: "buttonText", label: "Button text", kind: "text" },
      { name: "buttonLink", label: "Button link", kind: "text" },
    ],
  },
  text: {
    label: "Text section",
    icon: "📝",
    defaults: () => ({ heading: "About this course", body: "Write a few sentences here." }),
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "body", label: "Text", kind: "textarea" },
    ],
  },
  image: {
    label: "Image",
    icon: "🖼️",
    defaults: () => ({ url: "", caption: "" }),
    fields: [
      { name: "url", label: "Image address (https://...)", kind: "text" },
      { name: "caption", label: "Caption", kind: "text" },
    ],
  },
  video: {
    label: "Video (YouTube)",
    icon: "🎬",
    defaults: () => ({ url: "", caption: "" }),
    fields: [
      { name: "url", label: "YouTube link", kind: "text" },
      { name: "caption", label: "Caption", kind: "text" },
    ],
  },
  features: {
    label: "Feature list",
    icon: "✅",
    defaults: () => ({ heading: "What you will get", items: ["Lifetime access", "Certificate", "Live support"] }),
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "items", label: "Items (one per line)", kind: "lines" },
    ],
  },
  testimonial: {
    label: "Testimonial",
    icon: "💬",
    defaults: () => ({ quote: "This course changed my career.", author: "Student name" }),
    fields: [
      { name: "quote", label: "Quote", kind: "textarea" },
      { name: "author", label: "Student name", kind: "text" },
    ],
  },
  faq: {
    label: "FAQ",
    icon: "❓",
    defaults: () => ({
      heading: "Frequently asked questions",
      items: [{ q: "Do I need experience?", a: "No, we start from the basics." }],
    }),
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "items", label: "Questions", kind: "faq" },
    ],
  },
  cta: {
    label: "Call to action",
    icon: "🚀",
    defaults: () => ({ heading: "Ready to start?", buttonText: "Join now", buttonLink: "#" }),
    fields: [
      { name: "heading", label: "Heading", kind: "text" },
      { name: "buttonText", label: "Button text", kind: "text" },
      { name: "buttonLink", label: "Button link", kind: "text" },
    ],
  },
};

export const BLOCK_ORDER = Object.keys(BLOCK_TYPES);

export function makeId() {
  return "b" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export function newBlock(type) {
  return { id: makeId(), type, props: BLOCK_TYPES[type].defaults() };
}

/** Blocks loaded from the server may have no id yet; give them one so React can track them. */
export function withIds(blocks) {
  return (blocks || []).map((b) => ({ ...b, id: b.id || makeId(), props: b.props || {} }));
}

/** Insert a block so that it ends up at position "index". */
export function insertBlock(blocks, index, block) {
  const copy = [...blocks];
  const at = Math.max(0, Math.min(index, copy.length));
  copy.splice(at, 0, block);
  return copy;
}

/**
 * Move the block at "from" to the gap at "to".
 * "to" counts gaps in the ORIGINAL list: 0 = before the first block, length = after the last.
 */
export function moveBlock(blocks, from, to) {
  if (from < 0 || from >= blocks.length) return blocks;
  const target = from < to ? to - 1 : to;
  if (target === from) return blocks;
  const copy = [...blocks];
  const [item] = copy.splice(from, 1);
  copy.splice(Math.max(0, Math.min(target, copy.length)), 0, item);
  return copy;
}

export function removeBlock(blocks, index) {
  return blocks.filter((_, i) => i !== index);
}

export function updateBlockProps(blocks, index, props) {
  return blocks.map((b, i) => (i === index ? { ...b, props: { ...b.props, ...props } } : b));
}

/** "Web Dev Bootcamp 2026!" becomes "web-dev-bootcamp-2026". */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Only allow http(s) links, relative links and #anchors. Blocks javascript: links. */
export function safeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("#") || value.startsWith("/")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

/** Turns a normal YouTube link into the address used for embedding. Returns "" if it is not YouTube. */
export function youtubeEmbedUrl(url) {
  try {
    const u = new URL(String(url || "").trim());
    const host = u.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] || "";
    }
    return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}
