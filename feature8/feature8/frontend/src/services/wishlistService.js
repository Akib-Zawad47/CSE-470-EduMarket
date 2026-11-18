import axios from "axios";

const DEFAULT_API = typeof window !== "undefined" && window.location.hostname !== "localhost"
  ? "https://cse-470-edumarket.onrender.com"
  : "http://localhost:8080";
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");
const API = `${BASE_URL}/api`;

const FALLBACK_STUDENTS = {
  "1": { studentId: 11, name: "Student One", email: "1", password: "1", major: "CSE", level: "Undergraduate", rewardPoints: 150 },
  "2": { studentId: 12, name: "Student Two", email: "2", password: "2", major: "EEE", level: "Undergraduate", rewardPoints: 90 },
};

const FALLBACK_COURSES = [
  {
    courseId: 1,
    title: "Full-Stack Web Development",
    description: "HTML, CSS, JS, Node and PostgreSQL.",
    level: "Beginner",
    price: 4500,
    instructorName: "Rahim Uddin",
    avgRating: 4.5,
  },
  {
    courseId: 2,
    title: "Spring Boot in Practice",
    description: "REST APIs with Spring Boot and JPA.",
    level: "Intermediate",
    price: 5500,
    instructorName: "Rahim Uddin",
    avgRating: 4.8,
  },
  {
    courseId: 3,
    title: "Python for Data Science",
    description: "Pandas, NumPy and visualization.",
    level: "Beginner",
    price: 4000,
    instructorName: "Farhana Akter",
    avgRating: 5.0,
  },
  {
    courseId: 4,
    title: "Machine Learning Basics",
    description: "Supervised learning from scratch.",
    level: "Intermediate",
    price: 6000,
    instructorName: "Farhana Akter",
    avgRating: 4.7,
  },
];

export async function loginStudent(email, password) {
  try {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error("Invalid Email ID or Password");
    }
    // Check local fallback if backend is still deploying/waking up
    const localUsers = JSON.parse(localStorage.getItem("edumarket_registered_users") || "{}");
    const allUsers = { ...FALLBACK_STUDENTS, ...localUsers };
    const matched = allUsers[String(email).trim()];
    if (matched && String(matched.password) === String(password).trim()) {
      return matched;
    }
    throw new Error("Invalid Email ID or Password. Try Email ID: 1, Pass: 1 (or Email ID: 2, Pass: 2)");
  }
}

export async function registerStudent({ name, email, password, major, level }) {
  try {
    const res = await axios.post(`${API}/auth/register`, { name, email, password, major, level });
    return res.data;
  } catch (err) {
    const localUsers = JSON.parse(localStorage.getItem("edumarket_registered_users") || "{}");
    const newStudent = {
      studentId: Date.now(),
      name: name || `Student ${email}`,
      email: String(email).trim(),
      password: String(password).trim(),
      major: major || "CSE",
      level: level || "Undergraduate",
      rewardPoints: 50,
    };
    localUsers[newStudent.email] = newStudent;
    localStorage.setItem("edumarket_registered_users", JSON.stringify(localUsers));
    return newStudent;
  }
}

export async function fetchAllCourses() {
  try {
    const res = await axios.get(`${API}/courses`);
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    return FALLBACK_COURSES;
  } catch {
    return FALLBACK_COURSES;
  }
}

export async function fetchWishlist(studentId) {
  try {
    const res = await axios.get(`${API}/wishlist/${studentId}`);
    return res.data;
  } catch {
    const saved = JSON.parse(localStorage.getItem(`wishlist_${studentId}`) || "null");
    if (saved) return saved;
    const defaultId = Number(studentId) === 12 ? 1 : 2;
    const initial = FALLBACK_COURSES.filter((c) => c.courseId === defaultId);
    localStorage.setItem(`wishlist_${studentId}`, JSON.stringify(initial));
    return initial;
  }
}

export async function addCourseToWishlist(studentId, course) {
  try {
    await axios.post(`${API}/wishlist/${studentId}/${course.courseId}`);
  } catch {
    // Also persist locally so UI is instant
  }
  const current = JSON.parse(localStorage.getItem(`wishlist_${studentId}`) || "[]");
  if (!current.some((c) => c.courseId === course.courseId)) {
    const updated = [course, ...current];
    localStorage.setItem(`wishlist_${studentId}`, JSON.stringify(updated));
  }
}

export async function removeCourseFromWishlist(studentId, courseId) {
  try {
    await axios.delete(`${API}/wishlist/${studentId}/${courseId}`);
  } catch {
    // Also persist locally
  }
  const current = JSON.parse(localStorage.getItem(`wishlist_${studentId}`) || "[]");
  const updated = current.filter((c) => c.courseId !== courseId);
  localStorage.setItem(`wishlist_${studentId}`, JSON.stringify(updated));
}
