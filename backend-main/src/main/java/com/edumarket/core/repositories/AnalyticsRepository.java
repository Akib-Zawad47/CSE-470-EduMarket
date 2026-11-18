package com.edumarket.core.repositories;
import com.edumarket.core.models.CourseOptionDto;
import com.edumarket.core.models.FunnelStageDto;
import com.edumarket.core.models.TrendingCourseDto;
import com.edumarket.core.models.TrendingCourseView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<TrendingCourseView, Long> {

    @Query(value = """
        SELECT c.course_id AS courseId, c.title AS title, c.price AS price,
               v.searches_7d AS searches7d, v.purchases_7d AS purchases7d,
               (v.searches_7d + (v.purchases_7d * 3)) AS trendScore
        FROM v_trending_courses v
        JOIN courses c ON c.course_id = v.course_id
        ORDER BY trendScore DESC
        LIMIT 10
        """, nativeQuery = true)
    List<TrendingCourseDto> findTopTrendingCourses();

    @Query(value = """
        SELECT event_type AS stage, events AS count
        FROM v_course_funnel
        WHERE course_id = :courseId
        """, nativeQuery = true)
    List<FunnelStageDto> findFunnelByCourseId(@Param("courseId") Long courseId);

    @Query(value = "SELECT course_id AS courseId, title AS title FROM courses ORDER BY course_id ASC", nativeQuery = true)
    List<CourseOptionDto> findAllCourseOptions();
}