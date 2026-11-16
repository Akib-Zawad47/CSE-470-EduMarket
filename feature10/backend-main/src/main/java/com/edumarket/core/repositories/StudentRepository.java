package com.edumarket.core.repositories;

import com.edumarket.core.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE students SET reward_points = reward_points + :points "
            + "WHERE user_id = :studentId", nativeQuery = true)
    int addPoints(@Param("studentId") Long studentId, @Param("points") int points);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE students SET reward_points = reward_points - :points "
            + "WHERE user_id = :studentId AND reward_points >= :points", nativeQuery = true)
    int deductPoints(@Param("studentId") Long studentId, @Param("points") int points);
}