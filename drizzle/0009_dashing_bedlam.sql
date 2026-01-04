ALTER TABLE "challenge" DROP CONSTRAINT "challenge_type_challenge_type_slug_fk";
--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_type_challenge_type_slug_fk" FOREIGN KEY ("type") REFERENCES "public"."challenge_type"("slug") ON DELETE restrict ON UPDATE no action;