-- EduMarket: PostgreSQL schema
-- Derived from the EER diagram + UML class diagram.
-- Run:  createdb edumarket && psql -d edumarket -f schema.sql

BEGIN;

-- ---------------------------------------------------------------
-- 1. USERS (RBAC) : joined-table inheritance, disjoint specialization
-- ---------------------------------------------------------------
CREATE TABLE users (
    user_id        BIGSERIAL PRIMARY KEY,
    name           VARCHAR(120) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(30),
    role           VARCHAR(15)  NOT NULL
                   CHECK (role IN ('ADMIN','INSTRUCTOR','STUDENT','AFFILIATE')),
    created_at     TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)               -- lets subtype tables enforce the role
);

CREATE TABLE students (
    user_id        BIGINT PRIMARY KEY,
    role           VARCHAR(15) NOT NULL DEFAULT 'STUDENT' CHECK (role = 'STUDENT'),
    major          VARCHAR(100),
    level          VARCHAR(30),
    reward_points  INT NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
    FOREIGN KEY (user_id, role) REFERENCES users (user_id, role) ON DELETE CASCADE
);

CREATE TABLE instructors (
    user_id     BIGINT PRIMARY KEY,
    role        VARCHAR(15) NOT NULL DEFAULT 'INSTRUCTOR' CHECK (role = 'INSTRUCTOR'),
    bio         TEXT,
    avg_rating  NUMERIC(3,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id, role) REFERENCES users (user_id, role) ON DELETE CASCADE
);

CREATE TABLE admins (
    user_id  BIGINT PRIMARY KEY,
    role     VARCHAR(15) NOT NULL DEFAULT 'ADMIN' CHECK (role = 'ADMIN'),
    FOREIGN KEY (user_id, role) REFERENCES users (user_id, role) ON DELETE CASCADE
);

CREATE TABLE affiliates (
    user_id            BIGINT PRIMARY KEY,
    role               VARCHAR(15) NOT NULL DEFAULT 'AFFILIATE' CHECK (role = 'AFFILIATE'),
    referral_code      VARCHAR(40) NOT NULL UNIQUE,
    commission_rate    NUMERIC(5,2) NOT NULL CHECK (commission_rate BETWEEN 0 AND 100),
    status             VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING','APPROVED','SUSPENDED')),
    parent_affiliate_id BIGINT REFERENCES affiliates (user_id) ON DELETE SET NULL,  -- multi-tier
    FOREIGN KEY (user_id, role) REFERENCES users (user_id, role) ON DELETE CASCADE,
    CHECK (parent_affiliate_id IS NULL OR parent_affiliate_id <> user_id)
);

-- ---------------------------------------------------------------
-- 2. COURSES, ENROLLMENT, CHECKOUT
-- ---------------------------------------------------------------
CREATE TABLE courses (
    course_id      BIGSERIAL PRIMARY KEY,
    instructor_id  BIGINT NOT NULL REFERENCES instructors (user_id),
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    level          VARCHAR(30),
    price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE promotions (
    promotion_id    BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    coupon_code     VARCHAR(40) NOT NULL UNIQUE,
    type            VARCHAR(20) NOT NULL
                    CHECK (type IN ('EARLY_BIRD','COUPON','BUNDLE','TIME_LIMITED')),
    discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','EXPIRED','DISABLED')),
    start_date      DATE NOT NULL,
    expiry_date     DATE NOT NULL,
    CHECK (expiry_date >= start_date)
);

CREATE TABLE enrollments (
    enrollment_id  BIGSERIAL PRIMARY KEY,
    student_id     BIGINT NOT NULL REFERENCES students (user_id),
    course_id      BIGINT NOT NULL REFERENCES courses (course_id),
    status         VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','ACTIVE','CANCELLED','COMPLETED')),
    enrolled_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (student_id, course_id)          -- the M:N "Enrolls in"
);

CREATE TABLE payments (
    payment_id        BIGSERIAL PRIMARY KEY,
    enrollment_id     BIGINT NOT NULL REFERENCES enrollments (enrollment_id) ON DELETE CASCADE,
    promotion_id      BIGINT REFERENCES promotions (promotion_id),
    amount            NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_method    VARCHAR(30) NOT NULL,
    payment_status    VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                      CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUNDED')),
    transaction_date  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
    invoice_id      BIGSERIAL PRIMARY KEY,
    payment_id      BIGINT NOT NULL UNIQUE REFERENCES payments (payment_id) ON DELETE CASCADE,  -- 1:1
    invoice_number  VARCHAR(40) NOT NULL UNIQUE,
    total_amount    NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE reviews (
    review_id    BIGSERIAL PRIMARY KEY,
    student_id   BIGINT NOT NULL REFERENCES students (user_id) ON DELETE CASCADE,
    course_id    BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    review_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (student_id, course_id)
);

-- ---------------------------------------------------------------
-- 3. LANDING PAGES, LEADS, FUNNEL
-- ---------------------------------------------------------------
CREATE TABLE landing_pages (
    page_id        BIGSERIAL PRIMARY KEY,
    instructor_id  BIGINT NOT NULL REFERENCES instructors (user_id),
    course_id      BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    slug           VARCHAR(200) NOT NULL UNIQUE,
    content        JSONB NOT NULL DEFAULT '[]',     -- ordered list of UI blocks
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE leads (
    lead_id    BIGSERIAL PRIMARY KEY,
    page_id    BIGINT REFERENCES landing_pages (page_id) ON DELETE SET NULL,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(30),
    stage      VARCHAR(20) NOT NULL DEFAULT 'LEAD'
               CHECK (stage IN ('LEAD','ATTENDED_DEMO','ENROLLED','LOST')),
    score      INT NOT NULL DEFAULT 0,              -- derived; refreshed by lead-scoring job
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE funnel_events (
    event_id    BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
    course_id   BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    event_type  VARCHAR(30) NOT NULL
                CHECK (event_type IN ('PAGE_VIEW','SEARCH','INQUIRY','WEBINAR','ADD_TO_CART','CHECKOUT_START','PURCHASE','ABANDON')),
    event_time  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 4. REFERRAL + AFFILIATE
-- ---------------------------------------------------------------
CREATE TABLE referrals (
    referral_id    BIGSERIAL PRIMARY KEY,
    referrer_id    BIGINT NOT NULL REFERENCES students (user_id) ON DELETE CASCADE,
    referred_id    BIGINT REFERENCES students (user_id) ON DELETE SET NULL,
    referral_code  VARCHAR(40) NOT NULL UNIQUE,
    status         VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','SUCCESSFUL','EXPIRED')),
    reward_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    referral_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    CHECK (referred_id IS NULL OR referred_id <> referrer_id)
);

CREATE TABLE affiliate_clicks (
    click_id       BIGSERIAL PRIMARY KEY,
    affiliate_id   BIGINT NOT NULL REFERENCES affiliates (user_id) ON DELETE CASCADE,
    course_id      BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    enrollment_id  BIGINT REFERENCES enrollments (enrollment_id) ON DELETE SET NULL,  -- attribution
    source         VARCHAR(50),
    clicked_at     TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 5. CAMPAIGNS, AUTO-POSTER, AD TRACKING, AUDIT
-- ---------------------------------------------------------------
CREATE TABLE campaigns (
    campaign_id    BIGSERIAL PRIMARY KEY,
    admin_id       BIGINT NOT NULL REFERENCES admins (user_id),
    campaign_name  VARCHAR(150) NOT NULL,
    objective      TEXT,
    budget         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (budget >= 0),
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    CHECK (end_date >= start_date)
);

CREATE TABLE social_posts (
    post_id      BIGSERIAL PRIMARY KEY,
    campaign_id  BIGINT NOT NULL REFERENCES campaigns (campaign_id) ON DELETE CASCADE,
    platform     VARCHAR(30) NOT NULL,
    schedule_at  TIMESTAMP,
    publish_at   TIMESTAMP
);

-- Multivalued attribute "Content" from the EER (text / image / link ...)
CREATE TABLE social_post_contents (
    content_id    BIGSERIAL PRIMARY KEY,
    post_id       BIGINT NOT NULL REFERENCES social_posts (post_id) ON DELETE CASCADE,
    content_type  VARCHAR(15) NOT NULL DEFAULT 'TEXT' CHECK (content_type IN ('TEXT','IMAGE','LINK')),
    content       TEXT NOT NULL
);

CREATE TABLE ad_metrics (
    metric_id    BIGSERIAL PRIMARY KEY,
    campaign_id  BIGINT NOT NULL REFERENCES campaigns (campaign_id) ON DELETE CASCADE,
    impressions  INT NOT NULL DEFAULT 0,
    clicks       INT NOT NULL DEFAULT 0,
    conversions  INT NOT NULL DEFAULT 0,
    ad_spend     NUMERIC(12,2) NOT NULL DEFAULT 0,
    revenue      NUMERIC(12,2) NOT NULL DEFAULT 0,
    recorded_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE campaign_audit_logs (
    audit_id     BIGSERIAL PRIMARY KEY,
    campaign_id  BIGINT NOT NULL REFERENCES campaigns (campaign_id) ON DELETE CASCADE,
    user_id      BIGINT REFERENCES users (user_id) ON DELETE SET NULL,
    action       VARCHAR(60) NOT NULL,
    description  TEXT,
    action_date  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 6. SEGMENTATION + NOTIFICATIONS
-- ---------------------------------------------------------------
CREATE TABLE segments (
    segment_id  BIGSERIAL PRIMARY KEY,
    admin_id    BIGINT NOT NULL REFERENCES admins (user_id),
    name        VARCHAR(120) NOT NULL,
    criteria    JSONB NOT NULL DEFAULT '{}',    -- interests, budget, location, engagement
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE segment_members (
    segment_id  BIGINT NOT NULL REFERENCES segments (segment_id) ON DELETE CASCADE,
    student_id  BIGINT NOT NULL REFERENCES students (user_id) ON DELETE CASCADE,
    joined_at   TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (segment_id, student_id)
);

CREATE TABLE notifications (
    notification_id  BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    segment_id       BIGINT REFERENCES segments (segment_id) ON DELETE SET NULL,
    title            VARCHAR(200) NOT NULL,
    message          TEXT NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 7. DIRECT MESSAGING + COURSE ADVISOR CHATBOT
-- ---------------------------------------------------------------
CREATE TABLE message_threads (
    thread_id     BIGSERIAL PRIMARY KEY,
    started_by    BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    recipient_id  BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (started_by <> recipient_id)
);

CREATE TABLE messages (
    message_id  BIGSERIAL PRIMARY KEY,
    thread_id   BIGINT NOT NULL REFERENCES message_threads (thread_id) ON DELETE CASCADE,
    sender_id   BIGINT NOT NULL REFERENCES users (user_id),
    content     TEXT NOT NULL,
    sent_at     TIMESTAMP NOT NULL DEFAULT now(),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE chat_sessions (
    session_id  BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    title       VARCHAR(200),
    started_at  TIMESTAMP NOT NULL DEFAULT now(),
    ended_at    TIMESTAMP
);

CREATE TABLE chat_messages (
    message_id   BIGSERIAL PRIMARY KEY,
    session_id   BIGINT NOT NULL REFERENCES chat_sessions (session_id) ON DELETE CASCADE,
    sender_type  VARCHAR(10) NOT NULL CHECK (sender_type IN ('USER','BOT')),
    content      TEXT NOT NULL,
    sent_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 8. AI RECOMMENDATIONS + COMPETITOR BENCHMARKING
-- ---------------------------------------------------------------
CREATE TABLE recommendations (
    recommendation_id  BIGSERIAL PRIMARY KEY,
    student_id         BIGINT NOT NULL REFERENCES students (user_id) ON DELETE CASCADE,
    course_id          BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    score              REAL NOT NULL,
    generated_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE competitor_prices (
    record_id         BIGSERIAL PRIMARY KEY,
    course_id         BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
    competitor_name   VARCHAR(120) NOT NULL,
    competitor_price  NUMERIC(10,2) NOT NULL CHECK (competitor_price >= 0),
    competition_url   VARCHAR(500),
    recorded_at       TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- INDEXES (foreign keys + reporting queries)
-- ---------------------------------------------------------------
CREATE INDEX idx_courses_instructor      ON courses (instructor_id);
CREATE INDEX idx_promotions_course       ON promotions (course_id);
CREATE INDEX idx_enrollments_course      ON enrollments (course_id);
CREATE INDEX idx_payments_enrollment     ON payments (enrollment_id);
CREATE INDEX idx_reviews_course          ON reviews (course_id);
CREATE INDEX idx_leads_stage             ON leads (stage, score DESC);
CREATE INDEX idx_funnel_course_time      ON funnel_events (course_id, event_time);
CREATE INDEX idx_funnel_type             ON funnel_events (event_type);
CREATE INDEX idx_clicks_affiliate        ON affiliate_clicks (affiliate_id, clicked_at);
CREATE INDEX idx_ad_metrics_campaign     ON ad_metrics (campaign_id, recorded_at);
CREATE INDEX idx_audit_campaign          ON campaign_audit_logs (campaign_id, action_date);
CREATE INDEX idx_notifications_user      ON notifications (user_id, is_read);
CREATE INDEX idx_messages_thread         ON messages (thread_id, sent_at);
CREATE INDEX idx_chat_messages_session   ON chat_messages (session_id, sent_at);
CREATE INDEX idx_recommendations_student ON recommendations (student_id, score DESC);
CREATE INDEX idx_competitor_course       ON competitor_prices (course_id, recorded_at);

-- ---------------------------------------------------------------
-- REPORTING VIEWS (features 2, 17, 18, 19)
-- ---------------------------------------------------------------
CREATE VIEW v_campaign_performance AS
SELECT c.campaign_id, c.campaign_name, c.budget,
       COALESCE(SUM(m.ad_spend),0)   AS total_spend,
       COALESCE(SUM(m.revenue),0)    AS total_revenue,
       COALESCE(SUM(m.impressions),0) AS impressions,
       COALESCE(SUM(m.clicks),0)     AS clicks,
       COALESCE(SUM(m.conversions),0) AS conversions
FROM campaigns c LEFT JOIN ad_metrics m USING (campaign_id)
GROUP BY c.campaign_id;

CREATE VIEW v_course_funnel AS
SELECT course_id, event_type, COUNT(*) AS events
FROM funnel_events GROUP BY course_id, event_type;

CREATE VIEW v_trending_courses AS
SELECT course_id,
       COUNT(*) FILTER (WHERE event_type = 'SEARCH'   AND event_time > now() - interval '7 days') AS searches_7d,
       COUNT(*) FILTER (WHERE event_type = 'PURCHASE' AND event_time > now() - interval '7 days') AS purchases_7d
FROM funnel_events GROUP BY course_id;

COMMIT;