CREATE TABLE "challenge_type" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"logo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

INSERT INTO challenge_type (slug, name, description, logo, updated_at) VALUES
('fix', 'Fix', 'Debug and repair broken Kubernetes configurations to restore application functionality.', NULL, NOW()),
('build', 'Build', 'Create Kubernetes configurations from scratch to deploy applications.', NULL, NOW()),
('migrate', 'Migrate', 'Migrate applications to Kubernetes or between different configurations.', NULL, NOW());
--> statement-breakpoint

ALTER TABLE "challenge" ADD COLUMN "type" text DEFAULT 'fix' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_type_challenge_type_slug_fk" FOREIGN KEY ("type") REFERENCES "public"."challenge_type"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_type_idx" ON "challenge" USING btree ("type");
