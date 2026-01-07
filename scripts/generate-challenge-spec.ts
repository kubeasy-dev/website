import { writeFileSync } from "node:fs";
import { z } from "zod";
import { challengeYamlSchema } from "@/schemas/challenge";

const schema = z.toJSONSchema(challengeYamlSchema);

writeFileSync(
  "./public/schemas/challenge.schema.json",
  JSON.stringify(schema, null, 2),
);

console.log(
  "Challenge schema generated at ./public/schemas/challenge.schema.json",
);
