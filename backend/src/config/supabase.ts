import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Tenta carregar do arquivo .env no diretório atual (backend)
dotenv.config();

// Se não achar, tenta subir um nível (raiz do projeto)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }); 

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
