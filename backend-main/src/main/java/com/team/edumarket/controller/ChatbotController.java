package com.team.edumarket.controller;

import com.team.edumarket.dto.ChatRequest;
import com.team.edumarket.dto.ChatResponse;
import com.team.edumarket.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"})
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askChatbot(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse(null, "Message cannot be empty."));
        }
        String aiReply = chatbotService.processMessage(request.getUserId(), request.getSessionId(), request.getMessage());
        return ResponseEntity.ok(new ChatResponse(request.getSessionId(), aiReply));
    }
}