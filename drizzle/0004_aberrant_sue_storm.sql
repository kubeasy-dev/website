CREATE TABLE "challenge_completion_idempotency" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "user_progress_user_daily_completion_idx";--> statement-breakpoint
ALTER TABLE "challenge_completion_idempotency" ADD CONSTRAINT "challenge_completion_idempotency_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_completion_idempotency" ADD CONSTRAINT "challenge_completion_idempotency_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_user_challenge_idx" ON "challenge_completion_idempotency" USING btree ("user_id","challenge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_progress_user_daily_completion_idx" ON "user_progress" USING btree ("user_id",date_trunc('day', "completed_at")) WHERE "user_progress"."status" = 'completed' AND "user_progress"."completed_at" IS NOT NULL AND "user_progress"."daily_limit_reached" = false;