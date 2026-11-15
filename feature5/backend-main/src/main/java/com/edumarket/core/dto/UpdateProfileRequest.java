package com.edumarket.core.dto;

/** Payload sent by an instructor to update their public portfolio information. */
public record UpdateProfileRequest(
        String name,
        String bio,
        String phone,
        String avatarUrl) {

    public UpdateProfileRequest(String name, String bio, String phone) {
        this(name, bio, phone, null);
    }
}
