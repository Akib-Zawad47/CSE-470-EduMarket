import axios from "axios";

const API_BASE = "http://localhost:8080/api/public/instructors";

export async function fetchInstructors(search = "") {
  const response = await axios.get(API_BASE, { params: { search } });
  return response.data;
}

export async function fetchPortfolio(instructorId) {
  const response = await axios.get(`${API_BASE}/${instructorId}`);
  return response.data;
}
