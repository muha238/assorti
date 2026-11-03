import { createClient } from "@supabase/supabase-js";

/** Anon кілтпен клиент — тек RLS рұқсат еткенді оқиды (мәзір). */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local-да жоқ");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
