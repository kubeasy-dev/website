import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export const createFetch =
  (options: Pick<RequestInit, "next" | "cache">) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
    });
  };

/**
 * Creates a Supabase client with authentication handling
 * @param cacheTag - Optional cache tag for revalidation
 * @returns Supabase client
 */
export async function createClient(cacheTag: string | null) {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({
          next: {
            tags: cacheTag ? [cacheTag, 'db'] : ['db'],
          },
          cache: 'force-cache',
        }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Supabase client for static functions like generateStaticParams
// which cannot access cookies
export function createStaticClient(cacheTag: string | null = null) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({
          next: {
            tags: cacheTag ? [cacheTag, 'db'] : ['db'],
          },
          cache: 'force-cache',
        }),
      },
      // No cookie management for static contexts
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}