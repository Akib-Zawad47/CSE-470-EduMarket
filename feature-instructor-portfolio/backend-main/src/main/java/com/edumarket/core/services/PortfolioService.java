package com.edumarket.core.services;

import com.edumarket.core.dto.InstructorPortfolio;
import com.edumarket.core.dto.InstructorProfile;
import com.edumarket.core.dto.UpdateProfileRequest;
import com.edumarket.core.repositories.PortfolioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PortfolioService {

    private static final int RECENT_REVIEW_LIMIT = 6;

    private final PortfolioRepository repository;

    public PortfolioService(PortfolioRepository repository) {
        this.repository = repository;
    }

    public List<InstructorProfile> listInstructors(String search) {
        return repository.search(search);
    }

    public InstructorPortfolio getPortfolio(long instructorId) {
        InstructorProfile profile = repository.findProfile(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
        return new InstructorPortfolio(
                profile,
                repository.findCourses(instructorId),
                repository.findRecentReviews(instructorId, RECENT_REVIEW_LIMIT));
    }

    public InstructorProfile updateProfile(long instructorId, UpdateProfileRequest request) {
        boolean updated = repository.updateProfile(instructorId, request.name(), request.bio(), request.phone());
        if (!updated) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found");
        }
        return repository.findProfile(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
    }
}
