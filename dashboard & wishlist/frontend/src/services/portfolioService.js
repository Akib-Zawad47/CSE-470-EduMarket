import axios from "axios";

const DEFAULT_API = typeof window !== "undefined" && window.location.hostname !== "localhost"
  ? "https://cse-470-edumarket.onrender.com"
  : "http://localhost:8080";
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");
const API_BASE = `${BASE_URL}/api/public/instructors`;

export async function fetchInstructors(search = "") {
  const response = await axios.get(API_BASE, { params: { search } });
  return response.data;
}

export async function fetchPortfolio(instructorId) {
  const response = await axios.get(`${API_BASE}/${instructorId}`);
  return response.data;
}
