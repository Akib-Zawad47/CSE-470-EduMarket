package com.edumarket.core.dto;

import java.util.List;
import java.util.Map;

/**
 * What the builder sends when saving a page.
 * Each block looks like {"id": "...", "type": "hero", "props": {...}}.
 */
public record LandingPageRequest(
        String title,
        String slug,
        Long courseId,
        Long instructorId,
        List<Map<String, Object>> blocks) {
}
