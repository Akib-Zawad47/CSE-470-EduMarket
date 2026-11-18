package com.team.edumarket.service;

import com.team.edumarket.model.Recommendation;
import com.team.edumarket.repository.RecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    public List<Recommendation> getRecommendationsForStudent(Long studentId) {
        return recommendationRepository.findByStudentIdOrderByScoreDesc(studentId);
    }
}