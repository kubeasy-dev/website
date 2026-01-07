import { z } from "zod";
import { challengeYamlSchema } from "@/schemas/challenge";

export async function GET() {
  const jsonSchema = z.toJSONSchema(challengeYamlSchema);

  return Response.json(jsonSchema);
}
