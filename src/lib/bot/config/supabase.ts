import { createClient } from '@supabase/supabase-js';

// No Next.js (Vercel), as variáveis de ambiente são carregadas automaticamente.
// Não precisamos do dotenv nem de manipulação de path.

// Fallback para variáveis se não estiverem no .env ainda
// ATENÇÃO: Adicione 'https://' se faltar no env var
const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_URL = rawUrl.startsWith('http') ? rawUrl : (rawUrl ? `https://${rawUrl}` : 'https://placeholder.supabase.co');

// IMPORTANTE: Para CRON JOBS e API Routes do Backend, usamos a SERVICE_KEY.
// Se ela não estiver definida (ex: no client-side), usamos a ANON_KEY como fallback readonly.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
