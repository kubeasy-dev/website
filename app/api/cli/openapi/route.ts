import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "@/lib/openapi";

export async function GET() {
  return NextResponse.json(generateOpenApiDocument());
}
