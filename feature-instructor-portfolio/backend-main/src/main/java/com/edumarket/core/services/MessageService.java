package com.edumarket.core.services;

import com.edumarket.core.dto.MessageResponse;
import com.edumarket.core.dto.SendMessageRequest;
import com.edumarket.core.repositories.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
    }

    /**
     * Sends a message and persists it directly into the PostgreSQL message_threads
     * and messages tables, visible in pgAdmin4.
     */
    public MessageResponse sendMessage(SendMessageRequest request) {
        if (request.content() == null || request.content().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content cannot be empty");
        }
        if (request.recipientId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient ID is required");
        }

        // Default sender to student user (e.g. Tanvir Hasan, id = 4) if not authenticated yet
        long senderId = request.senderId() != null ? request.senderId() : 4L;
        long recipientId = request.recipientId();

        if (senderId == recipientId) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send message to yourself");
        }

        long threadId = repository.findOrCreateThread(senderId, recipientId);
        return repository.insertMessage(threadId, senderId, recipientId, request.content().trim());
    }

    public List<MessageResponse> getThreadMessages(long threadId) {
        return repository.getMessagesByThread(threadId);
    }
}
