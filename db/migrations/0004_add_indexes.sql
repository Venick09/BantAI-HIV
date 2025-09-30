-- Add indexes for frequently queried columns

-- Users table indexes
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_test_center_id ON users(test_center_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- OTP verifications indexes
CREATE INDEX idx_otp_verifications_phone_number ON otp_verifications(phone_number);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX idx_otp_verifications_purpose ON otp_verifications(purpose);
CREATE INDEX idx_otp_verifications_composite ON otp_verifications(phone_number, purpose, verified, expires_at);

-- SMS logs indexes
CREATE INDEX idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX idx_sms_logs_phone_number ON sms_logs(phone_number);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_message_type ON sms_logs(message_type);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX idx_sms_logs_composite ON sms_logs(phone_number, status, created_at DESC);

-- SMS queue indexes
CREATE INDEX idx_sms_queue_scheduled_for ON sms_queue(scheduled_for);
CREATE INDEX idx_sms_queue_is_processed ON sms_queue(is_processed);
CREATE INDEX idx_sms_queue_composite ON sms_queue(is_processed, scheduled_for, priority DESC);

-- SMS responses indexes
CREATE INDEX idx_sms_responses_phone_number ON sms_responses(phone_number);
CREATE INDEX idx_sms_responses_user_id ON sms_responses(user_id);
CREATE INDEX idx_sms_responses_is_processed ON sms_responses(is_processed);
CREATE INDEX idx_sms_responses_received_at ON sms_responses(received_at DESC);

-- Risk assessments indexes
CREATE INDEX idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_created_at ON risk_assessments(created_at DESC);

-- ART management indexes
CREATE INDEX idx_art_management_user_id ON art_management(user_id);
CREATE INDEX idx_art_management_status ON art_management(status);
CREATE INDEX idx_art_management_next_refill_date ON art_management(next_refill_date);

-- Referrals indexes
CREATE INDEX idx_referrals_referred_by ON referrals(referred_by);
CREATE INDEX idx_referrals_referred_to ON referrals(referred_to);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_composite ON audit_logs(entity_type, entity_id, created_at DESC);