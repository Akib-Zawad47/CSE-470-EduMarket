package com.edumarket.core.repositories;

import com.edumarket.core.dto.MessageResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Direct Messaging Repository for Feature 7.
 * Directly inserts and reads from the message_threads and messages PostgreSQL tables.
 */
@Repository
public class MessageRepository {

    private final JdbcTemplate jdbc;

    public MessageRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Finds an existing conversation thread or creates a new one. */
    public long findOrCreateThread(long startedBy, long recipientId) {
        String findSql = """
                SELECT thread_id FROM message_threads
                WHERE (started_by = ? AND recipient_id = ?)
                   OR (started_by = ? AND recipient_id = ?)
                LIMIT 1
                """;

        List<Long> existing = jdbc.query(findSql, (rs, n) -> rs.getLong("thread_id"),
                startedBy, recipientId, recipientId, startedBy);

        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        String insertSql = """
                INSERT INTO message_threads (started_by, recipient_id, created_at)
                VALUES (?, ?, now())
                RETURNING thread_id
                """;

        Long threadId = jdbc.queryForObject(insertSql, Long.class, startedBy, recipientId);
        return threadId != null ? threadId : 1L;
    }

    /** Inserts a new message row directly into the messages table in pgAdmin4. */
    public MessageResponse insertMessage(long threadId, long senderId, long recipientId, String content) {
        String insertSql = """
                INSERT INTO messages (thread_id, sender_id, content, sent_at, is_read)
                VALUES (?, ?, ?, now(), false)
                RETURNING message_id, sent_at
                """;

        return jdbc.queryForObject(insertSql, (rs, n) -> {
            long messageId = rs.getLong("message_id");
            Timestamp sentAtTs = rs.getTimestamp("sent_at");
            LocalDateTime sentAt = sentAtTs != null ? sentAtTs.toLocalDateTime() : LocalDateTime.now();

            String senderName = findUserName(senderId);

            return new MessageResponse(
                    messageId,
                    threadId,
                    senderId,
                    senderName,
                    recipientId,
                    content,
                    sentAt,
                    false
            );
        }, threadId, senderId, content);
    }

    /** Retrieves all messages in a conversation thread in chronological order. */
    public List<MessageResponse> getMessagesByThread(long threadId) {
        String sql = """
                SELECT m.message_id, m.thread_id, m.sender_id, u.name AS sender_name,
                       CASE WHEN t.started_by = m.sender_id THEN t.recipient_id ELSE t.started_by END AS recipient_id,
                       m.content, m.sent_at, m.is_read
                FROM messages m
                JOIN message_threads t ON t.thread_id = m.thread_id
                JOIN users u           ON u.user_id   = m.sender_id
                WHERE m.thread_id = ?
                ORDER BY m.sent_at ASC, m.message_id ASC
                """;

        return jdbc.query(sql, (rs, n) -> {
            Timestamp ts = rs.getTimestamp("sent_at");
            return new MessageResponse(
                    rs.getLong("message_id"),
                    rs.getLong("thread_id"),
                    rs.getLong("sender_id"),
                    rs.getString("sender_name"),
                    rs.getLong("recipient_id"),
                    rs.getString("content"),
                    ts != null ? ts.toLocalDateTime() : LocalDateTime.now(),
                    rs.getBoolean("is_read")
            );
        }, threadId);
    }

    /** Helper to get sender user name. */
    public String findUserName(long userId) {
        String sql = "SELECT name FROM users WHERE user_id = ?";
        List<String> names = jdbc.query(sql, (rs, n) -> rs.getString("name"), userId);
        return names.isEmpty() ? "Student User" : names.get(0);
    }
}
