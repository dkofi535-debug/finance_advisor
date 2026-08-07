const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env'
    );
}

const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
);

(async () => {
  console.log("=== Testing Supabase Connection ===");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  console.log("=== End Test ===");
})();

module.exports = supabase;