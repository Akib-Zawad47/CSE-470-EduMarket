package com.edumarket.core.services;

import com.edumarket.core.models.Student;
import com.edumarket.core.repositories.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

    private final StudentRepository studentRepository;

    public RewardService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public int getBalance(Long studentId) {
        return studentRepository.findById(studentId)
                .map(Student::getRewardPoints)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    // Spend points. The database only deducts if the student has enough.
    @Transactional
    public int redeem(Long studentId, int points) {
        if (points <= 0) {
            throw new IllegalArgumentException("Points must be greater than 0");
        }
        getBalance(studentId);   // makes sure the student exists
        int updated = studentRepository.deductPoints(studentId, points);
        if (updated == 0) {
            throw new IllegalArgumentException("Not enough reward points");
        }
        return getBalance(studentId);
    }
}
