import axios from "axios";

// Change this if your Spring Boot server runs on another host or port.
const API_BASE = "http://localhost:8080/api/public/instructors";

export async function fetchInstructors(search = "") {
  const response = await axios.get(API_BASE, { params: { search } });
  return response.data;
}

export async function fetchPortfolio(instructorId) {
  const response = await axios.get(`${API_BASE}/${instructorId}`);
  return response.data;
}

export async function updateInstructorProfile(instructorId, data) {
  const response = await axios.put(`${API_BASE}/${instructorId}`, data);
  return response.data;
}
