import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
const API_BASE = `${BASE_URL}/api/public/instructors`;

export async function fetchInstructors(search = "") {
  const response = await axios.get(API_BASE, { params: { search } });
  return response.data;
}

export async function fetchPortfolio(instructorId) {
  const response = await axios.get(`${API_BASE}/${instructorId}`);
  return response.data;
}
