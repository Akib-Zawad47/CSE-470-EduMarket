package com.edumarket.core.dto;

/** Header block of a portfolio, also used as a card in the instructor directory. */
public record InstructorProfile(
        long instructorId,
        String name,
        String bio,
        double avgRating,
        int reviewCount,
        int studentCount,
        int courseCount,
        String avatarUrl) {

    // Overloaded constructor for 7-parameter backward compatibility
    public InstructorProfile(
            long instructorId,
            String name,
            String bio,
            double avgRating,
            int reviewCount,
            int studentCount,
            int courseCount) {
        this(instructorId, name, bio, avgRating, reviewCount, studentCount, courseCount, null);
    }
}
