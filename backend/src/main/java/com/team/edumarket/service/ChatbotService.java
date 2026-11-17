// package com.team.edumarket.service;

// import com.team.edumarket.model.ChatMessage;
// import com.team.edumarket.model.ChatSession;
// import com.team.edumarket.repository.ChatMessageRepository;
// import com.team.edumarket.repository.ChatSessionRepository;
// import org.springframework.ai.chat.client.ChatClient;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// public class ChatbotService {

//     private final ChatClient chatClient;
//     private final ChatSessionRepository sessionRepository;
//     private final ChatMessageRepository messageRepository;

//     public ChatbotService(ChatClient.Builder chatClientBuilder,
//                           ChatSessionRepository sessionRepository,
//                           ChatMessageRepository messageRepository) {
//         this.sessionRepository = sessionRepository;
//         this.messageRepository = messageRepository;
//         this.chatClient = chatClientBuilder
//                 .defaultSystem(
//                     "You are EduBot, the official AI assistant for EduMarket, a premier university online course platform. " +
//                     "Assist users with available courses, course categories, prices, discounts, instructor info, " +
//                     "enrollment procedures, and payment questions. Maintain a helpful, professional tone."
//                 )
//                 .build();
//     }

//     @Transactional
//     public String processMessage(Long userId, Long sessionId, String userMessage) {
//         // 1. Create or fetch session
//         ChatSession session;
//         if (sessionId == null || !sessionRepository.existsById(sessionId)) {
//             session = new ChatSession();
//             session.setUserId(userId != null ? userId : 1L);
//             session.setTitle(userMessage.length() > 30 ? userMessage.substring(0, 30) + "..." : userMessage);
//             session = sessionRepository.save(session);
//         } else {
//             session = sessionRepository.findById(sessionId).get();
//         }

//         // 2. Save user message to database
//         messageRepository.save(new ChatMessage(session.getSessionId(), "USER", userMessage));

//         // 3. Get AI response from Gemini via Spring AI
//         String aiReply;
//         try {
//             aiReply = chatClient.prompt().user(userMessage).call().content();
//         } catch (Exception e) {
//             aiReply = "I am currently experiencing connection issues with the AI service. Please try again later!";
//         }

//         // 4. Save bot response to database
//         messageRepository.save(new ChatMessage(session.getSessionId(), "BOT", aiReply));
        

//         return aiReply;
//     }
// }



package com.team.edumarket.service;

import com.team.edumarket.model.ChatMessage;
import com.team.edumarket.model.ChatSession;
import com.team.edumarket.repository.ChatMessageRepository;
import com.team.edumarket.repository.ChatSessionRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatbotService {

    private final ChatClient chatClient;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public ChatbotService(ChatClient.Builder chatClientBuilder,
                          ChatSessionRepository sessionRepository,
                          ChatMessageRepository messageRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.chatClient = chatClientBuilder
                .defaultSystem(
                    "You are EduBot, the official AI assistant for EduMarket, a premier university online course platform. " +
                    "Assist users with available courses, course categories, prices, discounts, instructor info, " +
                    "enrollment procedures, and payment questions. Maintain a helpful, professional tone."
                )
                .defaultOptions(
                    GoogleGenAiChatOptions.builder()
                        .model("gemini-3.8-flash")
                        .temperature(0.7)
                        .build()
                )
                .build();
    }

    @Transactional
    public String processMessage(Long userId, Long sessionId, String userMessage) {
        // 1. Create or fetch session
        ChatSession session;
        if (sessionId == null || !sessionRepository.existsById(sessionId)) {
            session = new ChatSession();
            session.setUserId(userId != null ? userId : 1L);
            session.setTitle(userMessage.length() > 30 ? userMessage.substring(0, 30) + "..." : userMessage);
            session = sessionRepository.save(session);
        } else {
            session = sessionRepository.findById(sessionId).get();
        }

        // 2. Save user message to database
        messageRepository.save(new ChatMessage(session.getSessionId(), "USER", userMessage));

        // 3. Get AI response from Gemini via Spring AI
        String aiReply;
        try {
            aiReply = chatClient.prompt().user(userMessage).call().content();
        } catch (Exception e) {
            e.printStackTrace(); 
            aiReply = "AI Error: " + e.getMessage();
        }

        // 4. Save bot response to database
        messageRepository.save(new ChatMessage(session.getSessionId(), "BOT", aiReply));

        return aiReply;
    }
}