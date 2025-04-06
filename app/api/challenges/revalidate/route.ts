import { CACHE_TAGS } from "@/lib/actions/get-challenges";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Endpoint to revalidate challenge cache on-demand
 * Can be triggered after challenges are created or updated
 */
export async function POST() {
  try {    
    // Revalidate the challenges cache
    revalidateTag(CACHE_TAGS.CHALLENGES);
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: "Challenges cache successfully revalidated" 
    });
  } catch (err) {
    console.error("Error revalidating challenges cache:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
