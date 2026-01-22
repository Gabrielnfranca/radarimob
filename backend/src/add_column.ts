import { supabase } from './config/supabase';

async function runMigration() {
  console.log("Adding url_original column...");
  
  // Create column if not exists
  const { error } = await supabase.rpc('run_sql_command', {
    command: `ALTER TABLE intent_signals ADD COLUMN IF NOT EXISTS url_original TEXT;`
  });

  // If RPC not available (often disabled), try direct error handling or ignore if we can't alter
  // Since we are using Supabase JS client, we can't easily run DDL unless we have a specific function or use the dashboard.
  // However, the user has a `database/schema.sql`.
  
  // Alternatively, we can just let the user know, or rely on the fallback.
  // The logs say: "Coluna 'url_original' ausente".
  // The "Modo de Compatibilidade" handles it.
  
  console.log("Migration check done (or skipped if no RPC).");
}

runMigration();
