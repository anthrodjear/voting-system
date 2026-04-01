import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Database Schema Migration (SQL-based)
 * 
 * Creates all core tables for the IEBC Voting System
 * 
 * ⚠️ IMPORTANT NOTES:
 * 1. Run this migration BEFORE any seed data
 * 2. UUID extension must be enabled
 * 3. This migration includes proper indexes for query optimization
 * 
 * 📊 Table Groups:
 * - Administrative: counties, constituencies, wards
 * - Users: voters, voter_biometrics, returning_officers, super_admins
 * - Elections: elections, candidates, presidential_candidates
 * - Voting: votes, vote_tracking, batches
 * - Sessions & Logs: sessions, login_history, audit_logs
 * - Applications: ro_applications
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting Initial Schema Migration...');

    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // =============================================
    // TABLE 1: Counties
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "counties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "county_code" varchar(10) NOT NULL,
        "county_name" varchar(100) NOT NULL,
        "region" varchar(100) NOT NULL,
        "capital" varchar(100),
        "area_sq_km" varchar(20),
        "population" varchar(20),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_counties_county_code" UNIQUE ("county_code"),
        CONSTRAINT "UQ_counties_county_name" UNIQUE ("county_name"),
        CONSTRAINT "PK_counties" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_counties_region" ON "counties" ("region")`);
    await queryRunner.query(`CREATE INDEX "idx_counties_active" ON "counties" ("is_active")`);
    console.log('✅ Created counties table');

    // =============================================
    // TABLE 2: Constituencies
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "constituencies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "county_id" uuid,
        "constituency_code" varchar(10) NOT NULL,
        "constituency_name" varchar(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_constituencies_constituency_code" UNIQUE ("constituency_code"),
        CONSTRAINT "PK_constituencies" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_constituencies_county" ON "constituencies" ("county_id")`);
    await queryRunner.query(`CREATE INDEX "idx_constituencies_active" ON "constituencies" ("is_active")`);
    
    await queryRunner.query(`
      ALTER TABLE "constituencies" 
      ADD CONSTRAINT "fk_constituency_county" 
      FOREIGN KEY ("county_id") REFERENCES "counties"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    console.log('✅ Created constituencies table');

    // =============================================
    // TABLE 3: Wards
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "wards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "constituency_id" uuid NOT NULL,
        "ward_code" varchar(10) NOT NULL,
        "ward_name" varchar(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_wards_ward_code" UNIQUE ("ward_code"),
        CONSTRAINT "PK_wards" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_wards_constituency" ON "wards" ("constituency_id")`);
    await queryRunner.query(`CREATE INDEX "idx_wards_active" ON "wards" ("is_active")`);
    
    await queryRunner.query(`
      ALTER TABLE "wards" 
      ADD CONSTRAINT "fk_ward_constituency" 
      FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    console.log('✅ Created wards table');

    // =============================================
    // TABLE 4: Super Admins
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "super_admins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "phone_number" varchar(20) NOT NULL,
        "level" varchar(20) NOT NULL DEFAULT 'admin',
        "password_hash" varchar NOT NULL,
        "mfa_enabled" boolean NOT NULL DEFAULT false,
        "mfa_secret" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_super_admins_email" UNIQUE ("email"),
        CONSTRAINT "PK_super_admins" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_superadmin_active" ON "super_admins" ("is_active")`);
    console.log('✅ Created super_admins table');

    // =============================================
    // TABLE 5: Returning Officers
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "returning_officers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "national_id" varchar(8) NOT NULL,
        "email" varchar NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "phone_number" varchar(20) NOT NULL,
        "preferred_county1" varchar(100) NOT NULL,
        "preferred_county2" varchar(100) NOT NULL,
        "assigned_county_id" uuid,
        "assigned_county_name" varchar(100),
        "level" varchar(20) NOT NULL DEFAULT 'county',
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "password_hash" varchar NOT NULL,
        "mfa_enabled" boolean NOT NULL DEFAULT false,
        "mfa_secret" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_returning_officers_national_id" UNIQUE ("national_id"),
        CONSTRAINT "UQ_returning_officers_email" UNIQUE ("email"),
        CONSTRAINT "PK_returning_officers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ro_assigned_county" ON "returning_officers" ("assigned_county_id")`);
    await queryRunner.query(`CREATE INDEX "idx_ro_status" ON "returning_officers" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_ro_level" ON "returning_officers" ("level")`);
    console.log('✅ Created returning_officers table');

    // =============================================
    // TABLE 6: Voters
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "voters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "national_id" varchar(8) NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "date_of_birth" date NOT NULL,
        "email" varchar,
        "phone_number" varchar(20) NOT NULL,
        "county_id" uuid,
        "county_name" varchar(100),
        "constituency_id" uuid,
        "constituency_name" varchar(100),
        "ward_id" uuid,
        "ward_name" varchar(100),
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "national_id_verified" boolean NOT NULL DEFAULT false,
        "verified_at" timestamp,
        "password_hash" varchar NOT NULL,
        "password_changed_at" timestamp,
        "failed_login_attempts" integer NOT NULL DEFAULT 0,
        "locked_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "registered_at" timestamp,
        CONSTRAINT "UQ_voters_national_id" UNIQUE ("national_id"),
        CONSTRAINT "PK_voters" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_voters_county" ON "voters" ("county_id")`);
    await queryRunner.query(`CREATE INDEX "idx_voters_constituency" ON "voters" ("constituency_id")`);
    await queryRunner.query(`CREATE INDEX "idx_voters_ward" ON "voters" ("ward_id")`);
    await queryRunner.query(`CREATE INDEX "idx_voters_status" ON "voters" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_voters_registered" ON "voters" ("registered_at")`);
    await queryRunner.query(`CREATE INDEX "idx_voters_national_id_verified" ON "voters" ("national_id_verified")`);
    console.log('✅ Created voters table');

    // =============================================
    // TABLE 7: Voter Biometrics
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "voter_biometrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voter_id" uuid NOT NULL,
        "face_template" text,
        "face_enrolled_at" timestamp,
        "face_enrolled" boolean NOT NULL DEFAULT false,
        "face_quality_score" float,
        "left_thumb_template" text,
        "right_thumb_template" text,
        "fingerprint_enrolled_at" timestamp,
        "fingerprint_enrolled" boolean NOT NULL DEFAULT false,
        "fingerprint_quality_score" float,
        "liveness_challenge" text,
        "liveness_generated_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_voter_biometrics_voter_id" UNIQUE ("voter_id"),
        CONSTRAINT "PK_voter_biometrics" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_biometrics_face_enrolled" ON "voter_biometrics" ("face_enrolled")`);
    await queryRunner.query(`CREATE INDEX "idx_biometrics_fingerprint_enrolled" ON "voter_biometrics" ("fingerprint_enrolled")`);
    console.log('✅ Created voter_biometrics table');

    // =============================================
    // TABLE 8: Elections
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "elections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "election_name" varchar(200) NOT NULL,
        "election_type" varchar(50) NOT NULL,
        "election_date" date NOT NULL,
        "registration_start_date" timestamp,
        "registration_end_date" timestamp,
        "nomination_start_date" timestamp,
        "nomination_end_date" timestamp,
        "voting_start_date" timestamp,
        "voting_end_date" timestamp,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "enable_online_voting" boolean NOT NULL DEFAULT true,
        "total_votes_cast" integer NOT NULL DEFAULT 0,
        "turnout_percentage" decimal(5,2),
        "blockchain_contract_address" varchar(100),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_elections" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_elections_type" ON "elections" ("election_type")`);
    await queryRunner.query(`CREATE INDEX "idx_elections_status" ON "elections" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_elections_date" ON "elections" ("election_date")`);
    await queryRunner.query(`CREATE INDEX "idx_elections_status_date" ON "elections" ("status", "election_date")`);
    console.log('✅ Created elections table');

    // =============================================
    // TABLE 9: Candidates
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "candidates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "candidate_number" varchar(10) NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "middle_name" varchar(100),
        "position" varchar(20) NOT NULL,
        "county_id" uuid,
        "county_name" varchar(100),
        "constituency_id" uuid,
        "ward_id" uuid,
        "party_name" varchar(200),
        "party_abbreviation" varchar(10),
        "is_independent" boolean NOT NULL DEFAULT false,
        "date_of_birth" date,
        "photo" text,
        "manifesto" text,
        "manifesto_highlights" text[],
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "submitted_at" timestamp,
        "approved_at" timestamp,
        "approved_by" uuid,
        "election_id" uuid,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_candidates_candidate_number" UNIQUE ("candidate_number"),
        CONSTRAINT "PK_candidates" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_candidates_position" ON "candidates" ("position")`);
    await queryRunner.query(`CREATE INDEX "idx_candidates_status" ON "candidates" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_candidates_election" ON "candidates" ("election_id")`);
    await queryRunner.query(`CREATE INDEX "idx_candidates_election_position" ON "candidates" ("election_id", "position")`);
    console.log('✅ Created candidates table');

    // =============================================
    // TABLE 10: Presidential Candidates
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "presidential_candidates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "candidate_id" uuid NOT NULL,
        "deputy_full_name" varchar(200) NOT NULL,
        "deputy_date_of_birth" date,
        "deputy_photo" text,
        "nomination_date" date NOT NULL,
        "nomination_county" varchar(100) NOT NULL,
        "nominator_count" integer NOT NULL DEFAULT 0,
        "campaign_slogan" varchar(200),
        "ballot_symbol" varchar(50),
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_presidential_candidates_candidate_id" UNIQUE ("candidate_id"),
        CONSTRAINT "PK_presidential_candidates" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Created presidential_candidates table');

    // =============================================
    // TABLE 11: Batches
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "batch_id" varchar(50) NOT NULL,
        "election_id" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'waiting',
        "target_size" integer NOT NULL DEFAULT 1000,
        "current_voters" integer NOT NULL DEFAULT 0,
        "votes_collected" integer NOT NULL DEFAULT 0,
        "started_at" timestamp,
        "completed_at" timestamp,
        "expires_at" timestamp,
        "blockchain_tx_hash" varchar(100),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_batches_batch_id" UNIQUE ("batch_id"),
        CONSTRAINT "PK_batches" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_batch_election" ON "batches" ("election_id")`);
    await queryRunner.query(`CREATE INDEX "idx_batch_status" ON "batches" ("status")`);
    console.log('✅ Created batches table');

    // =============================================
    // TABLE 12: Votes (HIGH VOLUME)
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "votes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voter_id" uuid,
        "election_id" uuid,
        "encrypted_vote" text NOT NULL,
        "vote_hash" varchar(64) NOT NULL,
        "zk_proof" text,
        "batch_id" varchar(50),
        "blockchain_tx_hash" varchar(100),
        "confirmation_number" varchar(20) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "submitted_at" timestamp NOT NULL DEFAULT now(),
        "confirmed_at" timestamp,
        "block_number" bigint,
        CONSTRAINT "UQ_votes_confirmation_number" UNIQUE ("confirmation_number"),
        CONSTRAINT "PK_votes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_votes_voter_election" ON "votes" ("voter_id", "election_id")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_election" ON "votes" ("election_id")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_hash" ON "votes" ("vote_hash")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_status" ON "votes" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_submitted" ON "votes" ("submitted_at")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_batch" ON "votes" ("batch_id")`);
    await queryRunner.query(`CREATE INDEX "idx_votes_blockchain" ON "votes" ("blockchain_tx_hash")`);
    console.log('✅ Created votes table (HIGH VOLUME - optimized for 5k votes/sec)');

    // =============================================
    // TABLE 13: Vote Tracking
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "vote_tracking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voter_id" uuid NOT NULL,
        "election_id" uuid NOT NULL,
        "has_voted" boolean NOT NULL DEFAULT false,
        "voted_at" timestamp,
        "confirmation_number" varchar(20),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vote_tracking_voter_election" UNIQUE ("voter_id", "election_id"),
        CONSTRAINT "PK_vote_tracking" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_vote_tracking_voted" ON "vote_tracking" ("has_voted")`);
    await queryRunner.query(`CREATE INDEX "idx_vote_tracking_election" ON "vote_tracking" ("election_id")`);
    console.log('✅ Created vote_tracking table');

    // =============================================
    // TABLE 14: Sessions
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "user_type" varchar(20) NOT NULL,
        "token_hash" varchar NOT NULL,
        "refresh_token_hash" varchar,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "revoked_at" timestamp,
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_sessions_user" ON "sessions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sessions_expires" ON "sessions" ("expires_at")`);
    await queryRunner.query(`CREATE INDEX "idx_sessions_token" ON "sessions" ("token_hash")`);
    console.log('✅ Created sessions table');

    // =============================================
    // TABLE 15: Login History
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "login_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" varchar(100) NOT NULL,
        "user_type" varchar(20) NOT NULL,
        "ip_address" varchar(50),
        "user_agent" text,
        "success" boolean NOT NULL,
        "failure_reason" varchar(100),
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_login_history" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_login_user" ON "login_history" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_login_created" ON "login_history" ("created_at")`);
    console.log('✅ Created login_history table');

    // =============================================
    // TABLE 16: Audit Logs
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" varchar(100) NOT NULL,
        "user_role" varchar(20) NOT NULL,
        "action" varchar(100) NOT NULL,
        "resource" varchar(100) NOT NULL,
        "resource_id" varchar(100),
        "old_value" jsonb,
        "new_value" jsonb,
        "ip_address" varchar(50),
        "user_agent" text,
        "status" varchar(20) NOT NULL DEFAULT 'success',
        "error_message" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_audit_user" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_resource" ON "audit_logs" ("resource")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_created" ON "audit_logs" ("created_at")`);
    console.log('✅ Created audit_logs table');

    // =============================================
    // TABLE 17: RO Applications
    // =============================================
    await queryRunner.query(`
      CREATE TABLE "ro_applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ro_id" uuid NOT NULL,
        "election_cycle" varchar(50) NOT NULL,
        "preferred_county1" varchar(100) NOT NULL,
        "preferred_county2" varchar(100) NOT NULL,
        "cover_letter" text,
        "years_of_experience" integer,
        "has_prior_experience" boolean NOT NULL DEFAULT false,
        "prior_experience_details" text,
        "uploaded_documents" jsonb,
        "status" varchar(20) NOT NULL DEFAULT 'submitted',
        "submitted_at" timestamp NOT NULL,
        "reviewed_at" timestamp,
        "reviewed_by" uuid,
        "rejection_reason" text,
        "assigned_county" varchar(100),
        "assigned_at" timestamp,
        "assigned_by" uuid,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ro_applications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_roapp_ro" ON "ro_applications" ("ro_id")`);
    await queryRunner.query(`CREATE INDEX "idx_roapp_cycle" ON "ro_applications" ("election_cycle")`);
    await queryRunner.query(`CREATE INDEX "idx_roapp_status" ON "ro_applications" ("status")`);
    console.log('✅ Created ro_applications table');

    console.log('✅ Initial Schema Migration Complete - Created 17 tables with indexes and foreign keys');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Reverting Initial Schema Migration...');
    
    await queryRunner.query(`DROP TABLE IF EXISTS "ro_applications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "login_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vote_tracking"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "batches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "presidential_candidates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "candidates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "elections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "voter_biometrics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "voters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "returning_officers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "super_admins"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "constituencies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "counties"`);
    
    console.log('✅ All tables dropped');
  }
}