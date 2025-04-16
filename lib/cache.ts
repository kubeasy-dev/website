import { QueryCache, MemoryStore } from '@supabase-cache-helpers/postgrest-server';
import { DefaultStatefulContext } from "@unkey/cache";

const ctx = new DefaultStatefulContext()

const map = new Map();

export const cache = new QueryCache(ctx, {
    stores: [new MemoryStore({ persistentMap: map })],
    fresh: 1000,
    stale: 2000,
});