import axios from "axios";

// Change this if your Spring Boot server runs on another host or port.
const API = "http://localhost:8080/api";

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
