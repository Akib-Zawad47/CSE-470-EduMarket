package com.edumarket.core.repositories;

import com.edumarket.core.models.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Spring Data JPA writes the SQL for these methods from their names. */
public interface LandingPageRepository extends JpaRepository<LandingPage, Long> {

    List<LandingPage> findAllByOrderByCreatedAtDesc();

    Optional<LandingPage> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndPageIdNot(String slug, Long pageId);
}
