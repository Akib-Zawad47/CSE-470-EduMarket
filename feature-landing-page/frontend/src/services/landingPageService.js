import axios from "axios";

// Uses VITE_API_URL or deployed Render backend in production, and falls back to localhost:8080 locally.
const DEFAULT_API = typeof window !== "undefined" && window.location.hostname !== "localhost"
  ? "https://cse-470-edumarket.onrender.com"
  : "http://localhost:8080";
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");
const API = `${BASE_URL}/api`;

export async function fetchPages() {
  return (await axios.get(`${API}/landing-pages`)).data;
}

export async function fetchPage(id) {
  return (await axios.get(`${API}/landing-pages/${id}`)).data;
}

export async function createPage(page) {
  return (await axios.post(`${API}/landing-pages`, page)).data;
}

export async function updatePage(id, page) {
  return (await axios.put(`${API}/landing-pages/${id}`, page)).data;
}

export async function deletePage(id) {
  await axios.delete(`${API}/landing-pages/${id}`);
}

export async function fetchPublicPage(slug) {
  return (await axios.get(`${API}/public/landing-pages/${encodeURIComponent(slug)}`)).data;
}

/** Turns an axios error into a short sentence the user can read. */
export function errorMessage(error, fallback) {
  const data = error && error.response && error.response.data;
  return (data && (data.message || data.error)) || fallback;
}
