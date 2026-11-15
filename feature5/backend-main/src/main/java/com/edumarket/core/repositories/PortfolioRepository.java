package com.edumarket.core.repositories;

import com.edumarket.core.dto.CourseSummary;
import com.edumarket.core.dto.InstructorProfile;
import com.edumarket.core.dto.ReviewSummary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Read-only queries for Feature 5 (Custom Instructor Portfolios).
 * Ratings are computed live from the reviews table, so they are always current.
 */
@Repository
public class PortfolioRepository {

    private static final String PROFILE_SELECT = """
            SELECT i.user_id, u.name, i.bio,
                   COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 2)
                             FROM reviews rv JOIN courses c ON c.course_id = rv.course_id
                             WHERE c.instructor_id = i.user_id), 0)            AS avg_rating,
                   (SELECT COUNT(*) FROM reviews rv JOIN courses c ON c.course_id = rv.course_id
                    WHERE c.instructor_id = i.user_id)                         AS review_count,
                   (SELECT COUNT(DISTINCT e.student_id)
                    FROM enrollments e JOIN courses c ON c.course_id = e.course_id
                    WHERE c.instructor_id = i.user_id
                      AND e.status IN ('ACTIVE', 'COMPLETED'))                 AS student_count,
                   (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = i.user_id) AS course_count
            FROM instructors i
            JOIN users u ON u.user_id = i.user_id
            """;

    private final JdbcTemplate jdbc;

    public PortfolioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Directory listing, best rated first. An empty search term returns everyone. */
    public List<InstructorProfile> search(String term) {
        String like = "%" + (term == null ? "" : term.trim()) + "%";
        String sql = PROFILE_SELECT + " WHERE u.name ILIKE ? ORDER BY avg_rating DESC, review_count DESC, u.name";
        return jdbc.query(sql, (rs, n) -> new InstructorProfile(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("bio"),
                rs.getDouble("avg_rating"),
                rs.getInt("review_count"),
                rs.getInt("student_count"),
                rs.getInt("course_count")), like);
    }

    public Optional<InstructorProfile> findProfile(long instructorId) {
        String sql = PROFILE_SELECT + " WHERE i.user_id = ?";
        List<InstructorProfile> rows = jdbc.query(sql, (rs, n) -> new InstructorProfile(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("bio"),
                rs.getDouble("avg_rating"),
                rs.getInt("review_count"),
                rs.getInt("student_count"),
                rs.getInt("course_count")), instructorId);
        return rows.stream().findFirst();
    }

    /** Full course catalog of one instructor, newest first. */
    public List<CourseSummary> findCourses(long instructorId) {
        String sql = """
                SELECT c.course_id, c.title, c.description, c.level, c.price,
                       COALESCE((SELECT ROUND(AVG(rv.rating)::numeric, 2)
                                 FROM reviews rv WHERE rv.course_id = c.course_id), 0) AS avg_rating,
                       (SELECT COUNT(*) FROM reviews rv WHERE rv.course_id = c.course_id) AS review_count,
                       (SELECT COUNT(*) FROM enrollments e
                        WHERE e.course_id = c.course_id
                          AND e.status IN ('ACTIVE', 'COMPLETED'))                         AS student_count
                FROM courses c
                WHERE c.instructor_id = ?
                ORDER BY c.created_at DESC, c.course_id DESC
                """;
        return jdbc.query(sql, (rs, n) -> new CourseSummary(
                rs.getLong("course_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("level"),
                rs.getBigDecimal("price"),
                rs.getDouble("avg_rating"),
                rs.getInt("review_count"),
                rs.getInt("student_count")), instructorId);
    }

    public List<ReviewSummary> findRecentReviews(long instructorId, int limit) {
        String sql = """
                SELECT s.name AS student_name, rv.rating, rv.comment, rv.review_date, c.title AS course_title
                FROM reviews rv
                JOIN courses c ON c.course_id = rv.course_id
                JOIN users s   ON s.user_id   = rv.student_id
                WHERE c.instructor_id = ?
                ORDER BY rv.review_date DESC, rv.review_id DESC
                LIMIT ?
                """;
        return jdbc.query(sql, (rs, n) -> new ReviewSummary(
                rs.getString("student_name"),
                rs.getInt("rating"),
                rs.getString("comment"),
                rs.getDate("review_date").toLocalDate(),
                rs.getString("course_title")), instructorId, limit);
    }

    /** Update an instructor's public profile and bio information. */
    public boolean updateProfile(long instructorId, String name, String bio, String phone) {
        int updatedUsers = jdbc.update(
                "UPDATE users SET name = COALESCE(NULLIF(?, ''), name), phone = COALESCE(NULLIF(?, ''), phone) WHERE user_id = ?",
                name, phone, instructorId);
        int updatedInst = jdbc.update(
                "UPDATE instructors SET bio = COALESCE(?, bio) WHERE user_id = ?",
                bio, instructorId);
        return updatedUsers > 0 || updatedInst > 0;
    }
}
