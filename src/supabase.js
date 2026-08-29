import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://flbpyejhgfoliuguhkyg.supabase.co";
const supabaseKey = "sb_publishable_yJgab9en-sIISTHi7Kp-zA_i0S8fzOq";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);