package com.edumarket.core.services;

import com.edumarket.core.dto.LandingPageRequest;
import com.edumarket.core.dto.LandingPageResponse;
import com.edumarket.core.dto.LandingPageSummary;
import com.edumarket.core.models.LandingPage;
import com.edumarket.core.repositories.LandingPageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/** Business logic for Feature 8 (Dynamic Landing Page Builder). */
@Service
public class LandingPageService {

    private static final TypeReference<List<Map<String, Object>>> BLOCK_LIST = new TypeReference<>() { };

    private final LandingPageRepository repository;
    private final ObjectMapper objectMapper;

    public LandingPageService(LandingPageRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<LandingPageSummary> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public LandingPageResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /** Used by the public page: found by its web address (slug), not by id. */
    @Transactional(readOnly = true)
    public LandingPageResponse getBySlug(String slug) {
        LandingPage page = repository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found"));
        return toResponse(page);
    }

    @Transactional
    public LandingPageResponse create(LandingPageRequest request) {
        LandingPageValidator.validate(request);
        if (repository.existsBySlug(request.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That slug is already used by another page");
        }
        LandingPage page = new LandingPage();
        copyFields(page, request);
        return save(page);
    }

    @Transactional
    public LandingPageResponse update(Long id, LandingPageRequest request) {
        LandingPageValidator.validate(request);
        LandingPage page = findOrThrow(id);
        if (repository.existsBySlugAndPageIdNot(request.slug(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That slug is already used by another page");
        }
        copyFields(page, request);
        return save(page);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(findOrThrow(id));
    }

    // ---- helpers ----

    private LandingPageResponse save(LandingPage page) {
        try {
            return toResponse(repository.saveAndFlush(page));
        } catch (DataIntegrityViolationException e) {
            // The database rejected an id that does not exist (foreign key) or a duplicate slug.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The chosen instructor or course does not exist, or the slug is already taken");
        }
    }

    private LandingPage findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found"));
    }

    private void copyFields(LandingPage page, LandingPageRequest request) {
        page.setTitle(request.title().trim());
        page.setSlug(request.slug());
        page.setCourseId(request.courseId());
        page.setInstructorId(request.instructorId());
        page.setContent(writeBlocks(request.blocks()));
    }

    private String writeBlocks(List<Map<String, Object>> blocks) {
        try {
            return objectMapper.writeValueAsString(blocks);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Blocks could not be saved");
        }
    }

    private List<Map<String, Object>> readBlocks(String json) {
        try {
            return objectMapper.readValue(json, BLOCK_LIST);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Saved page content is damaged");
        }
    }

    private LandingPageResponse toResponse(LandingPage p) {
        return new LandingPageResponse(p.getPageId(), p.getTitle(), p.getSlug(), p.getCourseId(),
                p.getInstructorId(), readBlocks(p.getContent()), p.getCreatedAt());
    }

    private LandingPageSummary toSummary(LandingPage p) {
        return new LandingPageSummary(p.getPageId(), p.getTitle(), p.getSlug(), p.getCourseId(),
                p.getInstructorId(), readBlocks(p.getContent()).size(), p.getCreatedAt());
    }
}
