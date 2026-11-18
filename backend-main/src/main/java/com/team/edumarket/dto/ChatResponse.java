package com.team.edumarket.dto;

public class ChatResponse {
    private Long sessionId;
    private String response;

    public ChatResponse(Long sessionId, String response) {
        this.sessionId = sessionId;
        this.response = response;
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}