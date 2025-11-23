// config/supabase.js
const { createClient } = require("@supabase/supabase-js");

// Client untuk operasi umum (anon key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log(process.env.SUPABASE_URL);

// Admin client untuk operasi server-side (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = { supabase, supabaseAdmin };
