import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Busca .env na raiz do workspace se possível, ou ajustar path

// Fallback para variáveis se não estiverem no .env ainda (para evitar crash imediato durante dev)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sua-url.supabase.co';
// ATENÇÃO: No backend usamos a SERVICE_ROLE_KEY para poder escrever em tabelas protegidas
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sua-service-role-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
