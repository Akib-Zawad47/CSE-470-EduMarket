package com.edumarket.core.dto;

import java.time.LocalDateTime;

/** Response representation of a stored message from the messages table. */
public record MessageResponse(
        long messageId,
        long threadId,
        long senderId,
        String senderName,
        long recipientId,
        String content,
        LocalDateTime sentAt,
        boolean isRead) {
}
