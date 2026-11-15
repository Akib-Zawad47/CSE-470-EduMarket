package com.edumarket.core.dto;

/** Payload sent to transmit a direct message to an instructor or user. */
public record SendMessageRequest(
        Long senderId,
        Long recipientId,
        String content) {
}
