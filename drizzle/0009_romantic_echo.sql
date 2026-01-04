CREATE TABLE "challenge_type" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"logo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "challenge" ALTER COLUMN "type" SET DEFAULT 'fix';--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_type_challenge_type_slug_fk" FOREIGN KEY ("type") REFERENCES "public"."challenge_type"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."challenge_type";