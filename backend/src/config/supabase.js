const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    realtime: {
      transport: WebSocket,
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

module.exports = supabase;
