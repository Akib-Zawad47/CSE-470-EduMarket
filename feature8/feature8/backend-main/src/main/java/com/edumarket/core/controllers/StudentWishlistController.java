package com.edumarket.core.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*")
public class StudentWishlistController {

    private final JdbcTemplate jdbc;

    public StudentWishlistController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record AuthRequest(String email, String password, String name, String major, String level) {}

    public record StudentDto(long studentId, String name, String email, String major, String level, int rewardPoints) {}

    public record CourseItemDto(
            long courseId,
            String title,
            String description,
            String level,
            double price,
            String instructorName,
            double avgRating
    ) {}

    @PostMapping("/auth/login")
    public StudentDto login(@RequestBody AuthRequest req) {
        String email = req.email() == null ? "" : req.email().trim();
        String pass = req.password() == null ? "" : req.password().trim();
        String sql = """
                SELECT u.user_id, u.name, u.email, COALESCE(s.major, 'CSE') AS major,
                       COALESCE(s.level, 'Undergraduate') AS level, COALESCE(s.reward_points, 0) AS reward_points
                FROM users u
                LEFT JOIN students s ON s.user_id = u.user_id
                WHERE u.email = ? AND u.password_hash = ?
                """;
        List<StudentDto> rows = jdbc.query(sql, (rs, n) -> new StudentDto(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("major"),
                rs.getString("level"),
                rs.getInt("reward_points")
        ), email, pass);

        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Email ID or Password");
        }
        return rows.get(0);
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentDto register(@RequestBody AuthRequest req) {
        String email = req.email() == null ? "" : req.email().trim();
        String pass = req.password() == null ? "" : req.password().trim();
        String name = (req.name() == null || req.name().isBlank()) ? "Student " + email : req.name().trim();
        String major = (req.major() == null || req.major().isBlank()) ? "CSE" : req.major().trim();
        String level = (req.level() == null || req.level().isBlank()) ? "Undergraduate" : req.level().trim();

        if (email.isEmpty() || pass.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ID and password are required");
        }

        Long userId = jdbc.queryForObject("""
                INSERT INTO users (name, email, password_hash, role)
                VALUES (?, ?, ?, 'STUDENT')
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
                RETURNING user_id
                """, Long.class, name, email, pass);

        jdbc.update("""
                INSERT INTO students (user_id, major, level, reward_points)
                VALUES (?, ?, ?, 50)
                ON CONFLICT (user_id) DO NOTHING
                """, userId, major, level);

        return new StudentDto(userId, name, email, major, level, 50);
    }

    @GetMapping("/courses")
    public List<CourseItemDto> listAllCourses() {
        String sql = """
                SELECT c.course_id, c.title, c.description, c.level, c.price,
                       u.name AS instructor_name,
                       COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 2) FROM reviews rv WHERE rv.course_id = c.course_id), 4.8) AS avg_rating
                FROM courses c
                JOIN users u ON u.user_id = c.instructor_id
                ORDER BY c.course_id ASC
                """;
        return jdbc.query(sql, (rs, n) -> new CourseItemDto(
                rs.getLong("course_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("level"),
                rs.getDouble("price"),
                rs.getString("instructor_name"),
                rs.getDouble("avg_rating")
        ));
    }

    @GetMapping("/wishlist/{studentId}")
    public List<CourseItemDto> getWishlist(@PathVariable("studentId") long studentId) {
        String sql = """
                SELECT c.course_id, c.title, c.description, c.level, c.price,
                       u.name AS instructor_name,
                       COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 2) FROM reviews rv WHERE rv.course_id = c.course_id), 4.8) AS avg_rating
                FROM wishlists w
                JOIN courses c ON c.course_id = w.course_id
                JOIN users u ON u.user_id = c.instructor_id
                WHERE w.student_id = ?
                ORDER BY w.added_at DESC
                """;
        return jdbc.query(sql, (rs, n) -> new CourseItemDto(
                rs.getLong("course_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("level"),
                rs.getDouble("price"),
                rs.getString("instructor_name"),
                rs.getDouble("avg_rating")
        ), studentId);
    }

    @PostMapping("/wishlist/{studentId}/{courseId}")
    public Map<String, Object> addToWishlist(
            @PathVariable("studentId") long studentId,
            @PathVariable("courseId") long courseId) {
        jdbc.update("""
                INSERT INTO wishlists (student_id, course_id)
                VALUES (?, ?)
                ON CONFLICT (student_id, course_id) DO NOTHING
                """, studentId, courseId);
        return Map.of("status", "added", "studentId", studentId, "courseId", courseId);
    }

    @DeleteMapping("/wishlist/{studentId}/{courseId}")
    public Map<String, Object> removeFromWishlist(
            @PathVariable("studentId") long studentId,
            @PathVariable("courseId") long courseId) {
        jdbc.update("DELETE FROM wishlists WHERE student_id = ? AND course_id = ?", studentId, courseId);
        return Map.of("status", "removed", "studentId", studentId, "courseId", courseId);
    }
}
