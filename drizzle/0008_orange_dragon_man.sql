CREATE TYPE "public"."challenge_type" AS ENUM('build', 'fix', 'migrate');--> statement-breakpoint
ALTER TABLE "challenge" ADD COLUMN "type" "challenge_type" DEFAULT 'fix' NOT NULL;--> statement-breakpoint
CREATE INDEX "challenge_type_idx" ON "challenge" USING btree ("type");