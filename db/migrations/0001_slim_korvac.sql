CREATE TYPE "public"."adherence_status" AS ENUM('good', 'fair', 'poor', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."art_status" AS ENUM('not_started', 'active', 'defaulted', 'stopped', 'transferred_out', 'deceased');--> statement-breakpoint
CREATE TYPE "public"."billing_event_type" AS ENUM('questionnaire_delivered', 'test_result_logged', 'art_started');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('pending', 'approved', 'paid', 'disputed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('patient', 'health_worker', 'admin', 'test_center');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('pending', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'sent', 'received', 'scheduled', 'tested', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."test_result" AS ENUM('positive', 'negative', 'indeterminate', 'pending');--> statement-breakpoint
CREATE TABLE "art_adherence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"tracking_date" date NOT NULL,
	"pills_taken" boolean,
	"missed_doses" integer DEFAULT 0,
	"adherence_status" "adherence_status" NOT NULL,
	"reported_via" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "art_clinic_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"visit_date" date NOT NULL,
	"visit_type" text NOT NULL,
	"attended" boolean NOT NULL,
	"viral_load_tested" boolean DEFAULT false,
	"viral_load_result" text,
	"cd4_tested" boolean DEFAULT false,
	"cd4_result" text,
	"regimen_changed" boolean DEFAULT false,
	"new_regimen" text,
	"next_visit_date" date,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "art_message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_type" text NOT NULL,
	"template_text" text NOT NULL,
	"template_text_tagalog" text NOT NULL,
	"send_time" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "art_patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_result_id" uuid NOT NULL,
	"patient_code" text NOT NULL,
	"status" "art_status" DEFAULT 'not_started' NOT NULL,
	"enrollment_date" date NOT NULL,
	"art_start_date" date,
	"current_regimen" text,
	"clinic_name" text,
	"clinic_id" text,
	"next_appointment_date" date,
	"viral_load_suppressed" boolean,
	"last_viral_load_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "art_patients_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "art_patients_patient_code_unique" UNIQUE("patient_code")
);
--> statement-breakpoint
CREATE TABLE "art_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"reminder_type" text NOT NULL,
	"scheduled_date" date NOT NULL,
	"scheduled_time" text NOT NULL,
	"sent_at" timestamp,
	"delivery_status" text,
	"response_received" boolean DEFAULT false,
	"response_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"billing_period_id" uuid,
	"action" text NOT NULL,
	"performed_by" uuid NOT NULL,
	"previous_value" text,
	"new_value" text,
	"notes" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_key" text NOT NULL,
	"config_value" numeric(10, 2) NOT NULL,
	"description" text,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_config_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "billing_event_type" NOT NULL,
	"event_date" timestamp NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reference_id" uuid NOT NULL,
	"reference_table" text NOT NULL,
	"description" text NOT NULL,
	"billing_period_id" uuid,
	"is_processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "billing_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2),
	"total_patients" integer,
	"generated_at" timestamp,
	"approved_at" timestamp,
	"approved_by" uuid,
	"paid_at" timestamp,
	"payment_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_billing_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"billing_period_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"questionnaire_delivered" boolean DEFAULT false NOT NULL,
	"questionnaire_amount" numeric(10, 2) DEFAULT '0',
	"test_result_logged" boolean DEFAULT false NOT NULL,
	"test_result_amount" numeric(10, 2) DEFAULT '0',
	"art_started" boolean DEFAULT false NOT NULL,
	"art_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"max_amount_reached" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"otp_code" text NOT NULL,
	"purpose" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"contact_number" text NOT NULL,
	"operating_hours" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_centers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"role" "user_role" DEFAULT 'patient' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"consent_given" boolean DEFAULT false NOT NULL,
	"consent_date" timestamp,
	"registration_method" text NOT NULL,
	"registered_by" uuid,
	"test_center_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_code" text NOT NULL,
	"status" "assessment_status" DEFAULT 'pending' NOT NULL,
	"delivery_method" text NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"total_score" integer,
	"risk_level" "risk_level",
	"sms_delivered_at" timestamp,
	"sms_delivery_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "risk_assessments_assessment_code_unique" UNIQUE("assessment_code")
);
--> statement-breakpoint
CREATE TABLE "risk_message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"message_type" text NOT NULL,
	"template_text" text NOT NULL,
	"template_text_tagalog" text NOT NULL,
	"variables" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_code" text NOT NULL,
	"question_text" text NOT NULL,
	"question_text_tagalog" text NOT NULL,
	"question_type" text NOT NULL,
	"options" jsonb,
	"weight" integer NOT NULL,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "risk_questions_question_code_unique" UNIQUE("question_code")
);
--> statement-breakpoint
CREATE TABLE "risk_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"response" text NOT NULL,
	"score" integer NOT NULL,
	"response_method" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_scoring_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"min_score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_data" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_code" text NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"test_center_id" uuid,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"qr_code_url" text,
	"sent_at" timestamp,
	"sent_via" text,
	"scheduled_date" date,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"test_center_id" uuid NOT NULL,
	"test_date" date NOT NULL,
	"test_type" text NOT NULL,
	"result" "test_result" NOT NULL,
	"result_date" date,
	"recorded_by" uuid NOT NULL,
	"notes" text,
	"is_confirmed" boolean DEFAULT false NOT NULL,
	"confirmed_date" date,
	"confirmed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"phone_number" text NOT NULL,
	"message" text NOT NULL,
	"message_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text,
	"provider_status" text,
	"provider_error_code" text,
	"provider_error_message" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failed_at" timestamp,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_provider_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"api_key" text,
	"api_secret" text,
	"sender_id" text,
	"webhook_url" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"retry_delay_minutes" integer DEFAULT 5 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sms_provider_config_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "sms_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"phone_number" text NOT NULL,
	"template_id" uuid,
	"template_variables" jsonb,
	"message_type" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"sms_log_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"user_id" uuid,
	"message" text NOT NULL,
	"provider_message_id" text,
	"in_response_to" uuid,
	"response_type" text,
	"is_processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"processing_notes" text,
	"received_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_status" (
	"pending" text,
	"sent" text,
	"delivered" text,
	"failed" text,
	"queued" text
);
--> statement-breakpoint
CREATE TABLE "sms_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_code" text NOT NULL,
	"template_name" text NOT NULL,
	"message_type" text NOT NULL,
	"template_text" text NOT NULL,
	"template_text_tagalog" text NOT NULL,
	"variables" jsonb,
	"character_count" integer NOT NULL,
	"sms_count" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sms_templates_template_code_unique" UNIQUE("template_code")
);
--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "art_adherence" ADD CONSTRAINT "art_adherence_patient_id_art_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."art_patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_clinic_visits" ADD CONSTRAINT "art_clinic_visits_patient_id_art_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."art_patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_clinic_visits" ADD CONSTRAINT "art_clinic_visits_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_patients" ADD CONSTRAINT "art_patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_patients" ADD CONSTRAINT "art_patients_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "art_reminders" ADD CONSTRAINT "art_reminders_patient_id_art_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."art_patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_audit" ADD CONSTRAINT "billing_audit_billing_period_id_billing_periods_id_fk" FOREIGN KEY ("billing_period_id") REFERENCES "public"."billing_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_audit" ADD CONSTRAINT "billing_audit_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_billing_period_id_billing_periods_id_fk" FOREIGN KEY ("billing_period_id") REFERENCES "public"."billing_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_billing_summary" ADD CONSTRAINT "patient_billing_summary_billing_period_id_billing_periods_id_fk" FOREIGN KEY ("billing_period_id") REFERENCES "public"."billing_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_billing_summary" ADD CONSTRAINT "patient_billing_summary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_test_center_id_test_centers_id_fk" FOREIGN KEY ("test_center_id") REFERENCES "public"."test_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_responses" ADD CONSTRAINT "risk_responses_assessment_id_risk_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_responses" ADD CONSTRAINT "risk_responses_question_id_risk_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."risk_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_assessment_id_risk_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_test_center_id_test_centers_id_fk" FOREIGN KEY ("test_center_id") REFERENCES "public"."test_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_center_id_test_centers_id_fk" FOREIGN KEY ("test_center_id") REFERENCES "public"."test_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_queue" ADD CONSTRAINT "sms_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_queue" ADD CONSTRAINT "sms_queue_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_queue" ADD CONSTRAINT "sms_queue_sms_log_id_sms_logs_id_fk" FOREIGN KEY ("sms_log_id") REFERENCES "public"."sms_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_responses" ADD CONSTRAINT "sms_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_responses" ADD CONSTRAINT "sms_responses_in_response_to_sms_logs_id_fk" FOREIGN KEY ("in_response_to") REFERENCES "public"."sms_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "stripe_subscription_id";