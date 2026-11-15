/**
 * Curated high-resolution profile pictures for EduMarket faculty.
 * If the instructor has a custom avatarUrl, that is used first.
 * Otherwise, uses high-quality professional educator portraits with graceful fallback.
 */

const DEFAULT_AVATARS = {
  // Rahim Uddin - Senior Software Engineer & Web Instructor
  rahim: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&h=350&q=85",
  // Farhana Akter - Data Scientist & University Lecturer
  farhana: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=350&h=350&q=85",
};

export function getInstructorPhoto(instructor) {
  if (!instructor) return null;
  if (instructor.avatarUrl && instructor.avatarUrl.trim()) {
    return instructor.avatarUrl.trim();
  }
  const name = (instructor.name || "").toLowerCase();
  if (name.includes("rahim")) return DEFAULT_AVATARS.rahim;
  if (name.includes("farhana")) return DEFAULT_AVATARS.farhana;
  return null;
}
