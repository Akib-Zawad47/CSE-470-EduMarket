package com.edumarket.core.controllers;

import com.edumarket.core.dto.LandingPageRequest;
import com.edumarket.core.dto.LandingPageResponse;
import com.edumarket.core.dto.LandingPageSummary;
import com.edumarket.core.services.LandingPageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST endpoints for Feature 8. The controller only passes requests to the service.
 *
 *   Builder (will need a login once Feature 1 / RBAC exists):
 *     GET    /api/landing-pages          list all pages
 *     GET    /api/landing-pages/{id}     one page with its blocks
 *     POST   /api/landing-pages          create a page
 *     PUT    /api/landing-pages/{id}     save changes
 *     DELETE /api/landing-pages/{id}     delete a page
 *
 *   Public (anyone can open a published page by its slug):
 *     GET    /api/public/landing-pages/{slug}
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LandingPageController {

    private final LandingPageService service;

    public LandingPageController(LandingPageService service) {
        this.service = service;
    }

    @GetMapping("/landing-pages")
    public List<LandingPageSummary> list() {
        return service.listAll();
    }

    @GetMapping("/landing-pages/{id}")
    public LandingPageResponse get(@PathVariable("id") Long id) {
        return service.getById(id);
    }

    @PostMapping("/landing-pages")
    @ResponseStatus(HttpStatus.CREATED)
    public LandingPageResponse create(@RequestBody LandingPageRequest request) {
        return service.create(request);
    }

    @PutMapping("/landing-pages/{id}")
    public LandingPageResponse update(@PathVariable("id") Long id, @RequestBody LandingPageRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/landing-pages/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }

    @GetMapping("/public/landing-pages/{slug}")
    public LandingPageResponse getPublic(@PathVariable("slug") String slug) {
        return service.getBySlug(slug);
    }
}
