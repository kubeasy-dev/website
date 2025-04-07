import { CACHE_TAGS } from "@/config/cache-tags";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint to revalidate challenge cache on-demand
 * Can be triggered after challenges are created or updated
 */
export async function POST() {
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = await createClient()
    // Now we can get the session or user object
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) return new Response(null, { status: 401 })

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
