import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export function broadcast(channel, event, payload) {
  if (!supabase) {
    console.warn("[Supabase] Skipping broadcast — missing credentials");
    return;
  }
  supabase.channel(channel).send({ type: "broadcast", event, payload });
}

export default supabase;
