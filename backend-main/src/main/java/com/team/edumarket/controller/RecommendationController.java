package com.team.edumarket.controller;

import com.team.edumarket.model.Recommendation;
import com.team.edumarket.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Recommendation>> getRecommendations(@PathVariable Long studentId) {
        List<Recommendation> recommendations = recommendationService.getRecommendationsForStudent(studentId);
        return ResponseEntity.ok(recommendations);
    }
}