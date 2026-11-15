-- EduMarket sample data. Run AFTER schema.sql, in the same database.
-- Safe to run once. To redo: TRUNCATE users CASCADE; then run this again.

BEGIN;

-- USERS (1 admin, 2 instructors, 5 students, 2 affiliates). Passwords are placeholders, not real hashes.
INSERT INTO users (user_id, name, email, password_hash, phone, role) VALUES
 (1,  'Nusrat Admin',     'admin@edumarket.test',    'hash_admin',  '01700000001', 'ADMIN'),
 (2,  'Rahim Uddin',      'rahim@edumarket.test',    'hash_inst1',  '01700000002', 'INSTRUCTOR'),
 (3,  'Farhana Akter',    'farhana@edumarket.test',  'hash_inst2',  '01700000003', 'INSTRUCTOR'),
 (4,  'Tanvir Hasan',     'tanvir@edumarket.test',   'hash_stu1',   '01700000004', 'STUDENT'),
 (5,  'Mim Sultana',      'mim@edumarket.test',      'hash_stu2',   '01700000005', 'STUDENT'),
 (6,  'Arif Hossain',     'arif@edumarket.test',     'hash_stu3',   '01700000006', 'STUDENT'),
 (7,  'Sadia Islam',      'sadia@edumarket.test',    'hash_stu4',   '01700000007', 'STUDENT'),
 (8,  'Imran Khan',       'imran@edumarket.test',    'hash_stu5',   '01700000008', 'STUDENT'),
 (9,  'Kabir Affiliate',  'kabir@edumarket.test',    'hash_aff1',   '01700000009', 'AFFILIATE'),
 (10, 'Lima Affiliate',   'lima@edumarket.test',     'hash_aff2',   '01700000010', 'AFFILIATE');

INSERT INTO admins (user_id) VALUES (1);
INSERT INTO instructors (user_id, bio, avg_rating) VALUES
 (2, 'Software engineer, 8 years teaching web development.', 4.50),
 (3, 'Data scientist and university lecturer.',              4.00);
INSERT INTO students (user_id, major, level, reward_points) VALUES
 (4, 'CSE', 'Undergraduate', 120),
 (5, 'EEE', 'Undergraduate', 40),
 (6, 'BBA', 'Graduate',      0),
 (7, 'CSE', 'Undergraduate', 75),
 (8, 'English', 'Undergraduate', 10);
INSERT INTO affiliates (user_id, referral_code, commission_rate, status, parent_affiliate_id) VALUES
 (9,  'KABIR10', 10.00, 'APPROVED', NULL),
 (10, 'LIMA05',   5.00, 'APPROVED', 9);   -- Lima is in Kabir's downline (tier 2)

-- COURSES
INSERT INTO courses (course_id, instructor_id, title, description, level, price) VALUES
 (1, 2, 'Full-Stack Web Development', 'HTML, CSS, JS, Node and PostgreSQL.', 'Beginner',     4500.00),
 (2, 2, 'Spring Boot in Practice',    'REST APIs with Spring Boot and JPA.', 'Intermediate', 5500.00),
 (3, 3, 'Python for Data Science',    'Pandas, NumPy and visualization.',    'Beginner',     4000.00),
 (4, 3, 'Machine Learning Basics',    'Supervised learning from scratch.',   'Intermediate', 6000.00);

INSERT INTO promotions (promotion_id, course_id, coupon_code, type, discount_value, status, start_date, expiry_date) VALUES
 (1, 1, 'EARLY500', 'EARLY_BIRD',   500.00, 'ACTIVE',  CURRENT_DATE - 10, CURRENT_DATE + 20),
 (2, 3, 'PY300',    'COUPON',       300.00, 'ACTIVE',  CURRENT_DATE - 5,  CURRENT_DATE + 30),
 (3, 2, 'OLD200',   'TIME_LIMITED', 200.00, 'EXPIRED', CURRENT_DATE - 60, CURRENT_DATE - 30);

-- ENROLLMENTS, PAYMENTS, INVOICES
INSERT INTO enrollments (enrollment_id, student_id, course_id, status, enrolled_date) VALUES
 (1, 4, 1, 'ACTIVE',    CURRENT_DATE - 8),
 (2, 4, 3, 'ACTIVE',    CURRENT_DATE - 4),
 (3, 5, 1, 'ACTIVE',    CURRENT_DATE - 6),
 (4, 6, 2, 'PENDING',   CURRENT_DATE - 1),
 (5, 7, 3, 'COMPLETED', CURRENT_DATE - 40),
 (6, 8, 4, 'CANCELLED', CURRENT_DATE - 12);

INSERT INTO payments (payment_id, enrollment_id, promotion_id, amount, payment_method, payment_status) VALUES
 (1, 1, 1, 4000.00, 'bKash',  'PAID'),
 (2, 2, 2, 3700.00, 'Nagad',  'PAID'),
 (3, 3, NULL, 4500.00, 'Card', 'PAID'),
 (4, 4, NULL, 5500.00, 'Card', 'PENDING'),
 (5, 5, NULL, 4000.00, 'bKash','PAID'),
 (6, 6, NULL, 6000.00, 'Card', 'REFUNDED');

INSERT INTO invoices (payment_id, invoice_number, total_amount) VALUES
 (1, 'INV-0001', 4000.00),
 (2, 'INV-0002', 3700.00),
 (3, 'INV-0003', 4500.00),
 (5, 'INV-0004', 4000.00);

INSERT INTO reviews (student_id, course_id, rating, comment) VALUES
 (4, 1, 5, 'Clear and practical.'),
 (5, 1, 4, 'Good pace, wanted more projects.'),
 (7, 3, 5, 'Great intro to data science.');

-- LANDING PAGES, LEADS, FUNNEL
INSERT INTO landing_pages (page_id, instructor_id, course_id, title, slug, content) VALUES
 (1, 2, 1, 'Become a Web Developer',  'web-dev-bootcamp',
  '[{"type":"hero","text":"Learn full-stack"},{"type":"video","url":"https://example.com/intro"},{"type":"testimonial","text":"Loved it"}]'),
 (2, 3, 3, 'Start Data Science Today', 'python-data-science',
  '[{"type":"hero","text":"Python for data"},{"type":"cta","text":"Enroll now"}]');

INSERT INTO leads (page_id, name, email, phone, stage, score) VALUES
 (1, 'Jahid Hasan',  'jahid@example.com',  '01800000001', 'LEAD',          20),
 (1, 'Rina Parvin',  'rina@example.com',   '01800000002', 'ATTENDED_DEMO', 55),
 (1, 'Shuvo Das',    'shuvo@example.com',  '01800000003', 'ENROLLED',      90),
 (2, 'Mehnaz Rahman','mehnaz@example.com', '01800000004', 'LEAD',          30),
 (2, 'Nabil Ahmed',  'nabil@example.com',  '01800000005', 'LOST',           5);

INSERT INTO funnel_events (user_id, course_id, event_type, event_time) VALUES
 (4, 1, 'PAGE_VIEW',      now() - interval '9 days'),
 (4, 1, 'ADD_TO_CART',    now() - interval '8 days'),
 (4, 1, 'PURCHASE',       now() - interval '8 days'),
 (5, 1, 'PAGE_VIEW',      now() - interval '7 days'),
 (5, 1, 'PURCHASE',       now() - interval '6 days'),
 (6, 2, 'PAGE_VIEW',      now() - interval '2 days'),
 (6, 2, 'CHECKOUT_START', now() - interval '1 day'),
 (6, 2, 'ABANDON',        now() - interval '1 day'),
 (7, 3, 'SEARCH',         now() - interval '3 days'),
 (8, 4, 'SEARCH',         now() - interval '2 days'),
 (NULL, 3, 'SEARCH',      now() - interval '1 day'),
 (4, 3, 'PURCHASE',       now() - interval '4 days');

-- REFERRALS + AFFILIATE CLICKS
INSERT INTO referrals (referrer_id, referred_id, referral_code, status, reward_amount) VALUES
 (4, 5, 'TANVIR-REF1', 'SUCCESSFUL', 200.00),
 (4, NULL, 'TANVIR-REF2', 'PENDING', 0);

INSERT INTO affiliate_clicks (affiliate_id, course_id, enrollment_id, source) VALUES
 (9,  1, 3,    'facebook'),
 (9,  3, NULL, 'youtube'),
 (10, 2, 4,    'instagram');

-- CAMPAIGNS
INSERT INTO campaigns (campaign_id, admin_id, campaign_name, objective, budget, start_date, end_date) VALUES
 (1, 1, 'Winter Enrollment Drive', 'Increase web dev enrollments', 50000.00, CURRENT_DATE - 14, CURRENT_DATE + 16);

INSERT INTO social_posts (post_id, campaign_id, platform, schedule_at, publish_at) VALUES
 (1, 1, 'Facebook',  now() - interval '10 days', now() - interval '10 days'),
 (2, 1, 'Instagram', now() + interval '2 days',  NULL);
INSERT INTO social_post_contents (post_id, content_type, content) VALUES
 (1, 'TEXT',  'Early-bird offer on Full-Stack Web Development!'),
 (1, 'IMAGE', 'https://example.com/banner1.png'),
 (2, 'TEXT',  'Last week to grab the winter discount.'),
 (2, 'LINK',  'https://example.com/web-dev-bootcamp');

INSERT INTO ad_metrics (campaign_id, impressions, clicks, conversions, ad_spend, revenue, recorded_at) VALUES
 (1, 12000, 540, 18, 8000.00, 20500.00, now() - interval '7 days'),
 (1, 15000, 700, 25, 9500.00, 31000.00, now() - interval '1 day');

INSERT INTO campaign_audit_logs (campaign_id, user_id, action, description) VALUES
 (1, 1, 'CREATE',        'Campaign created'),
 (1, 1, 'SCHEDULE_POST', 'Scheduled Instagram post');

-- SEGMENTS + NOTIFICATIONS
INSERT INTO segments (segment_id, admin_id, name, criteria) VALUES
 (1, 1, 'CSE students', '{"major":"CSE","engagement":"high"}');
INSERT INTO segment_members (segment_id, student_id) VALUES (1, 4), (1, 7);
INSERT INTO notifications (user_id, segment_id, title, message, is_read) VALUES
 (4, 1, 'Winter discount', 'Use EARLY500 on Full-Stack Web Development.', FALSE),
 (7, 1, 'Winter discount', 'Use EARLY500 on Full-Stack Web Development.', TRUE),
 (4, NULL, 'Payment received', 'Your payment for Python for Data Science was successful.', FALSE);

-- MESSAGING + CHATBOT
INSERT INTO message_threads (thread_id, started_by, recipient_id) VALUES (1, 4, 2);
INSERT INTO messages (thread_id, sender_id, content, is_read) VALUES
 (1, 4, 'Hi sir, does the course need prior JavaScript knowledge?', TRUE),
 (1, 2, 'No, we start from the basics.', FALSE);

INSERT INTO chat_sessions (session_id, user_id, title) VALUES (1, 6, 'Choosing a course');
INSERT INTO chat_messages (session_id, sender_type, content) VALUES
 (1, 'USER', 'What are the prerequisites for Machine Learning Basics?'),
 (1, 'BOT',  'You should know basic Python. Python for Data Science is a good first step.');

-- RECOMMENDATIONS + COMPETITOR PRICES
INSERT INTO recommendations (student_id, course_id, score) VALUES
 (4, 2, 0.91), (4, 4, 0.74), (6, 3, 0.82), (8, 3, 0.67);
INSERT INTO competitor_prices (course_id, competitor_name, competitor_price, competition_url) VALUES
 (1, 'Udemy',  4200.00, 'https://example.com/udemy/web'),
 (1, 'Coursera', 5000.00, 'https://example.com/coursera/web'),
 (3, 'Udemy',  3800.00, 'https://example.com/udemy/python');

-- Move the id counters past the ids inserted by hand so later inserts don't collide.
SELECT setval(pg_get_serial_sequence('users','user_id'),               (SELECT MAX(user_id) FROM users));
SELECT setval(pg_get_serial_sequence('courses','course_id'),           (SELECT MAX(course_id) FROM courses));
SELECT setval(pg_get_serial_sequence('promotions','promotion_id'),     (SELECT MAX(promotion_id) FROM promotions));
SELECT setval(pg_get_serial_sequence('enrollments','enrollment_id'),   (SELECT MAX(enrollment_id) FROM enrollments));
SELECT setval(pg_get_serial_sequence('payments','payment_id'),         (SELECT MAX(payment_id) FROM payments));
SELECT setval(pg_get_serial_sequence('landing_pages','page_id'),       (SELECT MAX(page_id) FROM landing_pages));
SELECT setval(pg_get_serial_sequence('campaigns','campaign_id'),       (SELECT MAX(campaign_id) FROM campaigns));
SELECT setval(pg_get_serial_sequence('social_posts','post_id'),        (SELECT MAX(post_id) FROM social_posts));
SELECT setval(pg_get_serial_sequence('segments','segment_id'),         (SELECT MAX(segment_id) FROM segments));
SELECT setval(pg_get_serial_sequence('message_threads','thread_id'),   (SELECT MAX(thread_id) FROM message_threads));
SELECT setval(pg_get_serial_sequence('chat_sessions','session_id'),    (SELECT MAX(session_id) FROM chat_sessions));

COMMIT;

-- Quick checks to try afterwards:
-- SELECT * FROM v_campaign_performance;
-- SELECT * FROM v_course_funnel ORDER BY course_id, event_type;
-- SELECT stage, COUNT(*) FROM leads GROUP BY stage;
