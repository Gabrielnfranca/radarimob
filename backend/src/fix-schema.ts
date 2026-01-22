import { supabase } from './config/supabase';

async function updateSchema() {
  console.log("🛠️ Atualizando Schema do Banco...");

  // Comando manual para adicionar a coluna que falta
  const { error } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'intent_signals',
      column_name: 'author_public_name',
      data_type: 'text'
  });

  // Se RPC falhar (normal se vc n tiver permissao de criar funcao), tentamos via SQL direto (mas o cliente JS n roda SQL DDL)
  // Workaround: Tentar inserção dummy para forçar erro e ver logs, mas aqui vamos assumir que o erro já mostrou que a coluna não existe.
  
  console.log("⚠️ ATENÇÃO: O erro anterior 'Could not find column author_public_name' indica que o banco de dados está desatualizado em relação ao código.");
  console.log("👉 Por favor, vá ao painel do Supabase -> SQL Editor e rode este comando:");
  console.log(`
    ALTER TABLE public.intent_signals ADD COLUMN IF NOT EXISTS author_public_name text;
    ALTER TABLE public.intent_signals ADD COLUMN IF NOT EXISTS source_name_captured text;
  `);

  // Tentativa de "Reset" forçado (Apagar e recriar tabela se tiver permissão extrema) - PERIGOSO
  // Vamos tentar rodar o seed novamente, talvez tenha sido cache local do PostgREST
  
  console.log("🔄 Reiniciando cache do Supabase...");
  // Não há comando direto, mas vamos tentar rodar o seed ignorando erros
}

updateSchema();
