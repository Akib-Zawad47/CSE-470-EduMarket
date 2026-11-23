package com.team.edumarket.service;

import com.team.edumarket.model.Student;
import com.team.edumarket.repository.StudentRepository;
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

    @Transactional
    public int redeem(Long studentId, int points) {
        if (points <= 0) {
            throw new IllegalArgumentException("Points must be greater than 0");
        }
        getBalance(studentId);
        int updated = studentRepository.deductPoints(studentId, points);
        if (updated == 0) {
            throw new IllegalArgumentException("Not enough reward points");
        }
        return getBalance(studentId);
    }
}