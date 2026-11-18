package com.edumarket.core.controllers;

import com.edumarket.core.dto.InstructorPortfolio;
import com.edumarket.core.dto.InstructorProfile;
import com.edumarket.core.dto.UpdateProfileRequest;
import com.edumarket.core.services.PortfolioService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public, read-only endpoints for Feature 5. No login is needed, so the
 * security config (Feature 1) must permit /api/public/**.
 */
@RestController
@RequestMapping("/api/public/instructors")
@CrossOrigin(originPatterns = "*")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    /** GET /api/public/instructors?search=rahim */
    @GetMapping
    public List<InstructorProfile> list(@RequestParam(name = "search", required = false) String search) {
        return service.listInstructors(search);
    }

    /** GET /api/public/instructors/2 */
    @GetMapping("/{id}")
    public InstructorPortfolio portfolio(@PathVariable("id") long id) {
        return service.getPortfolio(id);
    }

    /** PUT /api/public/instructors/2 - Update instructor profile bio and details */
    @PutMapping("/{id}")
    public InstructorProfile update(
            @PathVariable("id") long id,
            @RequestBody UpdateProfileRequest request) {
        return service.updateProfile(id, request);
    }
}
