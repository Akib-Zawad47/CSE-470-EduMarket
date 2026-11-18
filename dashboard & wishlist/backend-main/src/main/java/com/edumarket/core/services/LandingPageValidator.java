package com.edumarket.core.services;

import com.edumarket.core.dto.LandingPageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Business rules for a landing page. Kept separate so they are easy to read and test.
 * Every broken rule becomes an HTTP 400 (Bad Request) with a clear message.
 */
public final class LandingPageValidator {

    /** The pre-defined UI blocks the builder offers. */
    public static final Set<String> ALLOWED_BLOCK_TYPES =
            Set.of("hero", "text", "image", "video", "features", "testimonial", "faq", "cta");

    public static final int MAX_BLOCKS = 50;

    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");

    private LandingPageValidator() {
    }

    public static void validate(LandingPageRequest request) {
        if (request == null) {
            throw bad("Request body is missing");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw bad("Title is required");
        }
        if (request.title().length() > 200) {
            throw bad("Title must be 200 characters or fewer");
        }
        if (request.slug() == null || !SLUG.matcher(request.slug()).matches()) {
            throw bad("Slug may only use lowercase letters, numbers and single hyphens (example: web-dev-bootcamp)");
        }
        if (request.slug().length() > 100) {
            throw bad("Slug must be 100 characters or fewer");
        }
        if (request.courseId() == null) {
            throw bad("Please choose a course");
        }
        if (request.instructorId() == null) {
            throw bad("Please choose an instructor");
        }
        validateBlocks(request.blocks());
    }

    private static void validateBlocks(List<Map<String, Object>> blocks) {
        if (blocks == null) {
            throw bad("Blocks are required (an empty list is fine)");
        }
        if (blocks.size() > MAX_BLOCKS) {
            throw bad("A page can have at most " + MAX_BLOCKS + " blocks");
        }
        for (int i = 0; i < blocks.size(); i++) {
            Map<String, Object> block = blocks.get(i);
            if (block == null) {
                throw bad("Block " + (i + 1) + " is empty");
            }
            Object type = block.get("type");
            if (!(type instanceof String) || !ALLOWED_BLOCK_TYPES.contains(type)) {
                throw bad("Block " + (i + 1) + " has an unknown type: " + type);
            }
            Object props = block.get("props");
            if (props != null && !(props instanceof Map)) {
                throw bad("Block " + (i + 1) + " has invalid settings");
            }
        }
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
