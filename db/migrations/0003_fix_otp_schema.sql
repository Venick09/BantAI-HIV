-- Add missing fields to users and otp_verifications tables
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;

ALTER TABLE "otp_verifications" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "otp_verifications" ADD COLUMN "verified_at" timestamp;