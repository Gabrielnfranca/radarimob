import { supabase } from './config/supabase';

async function clearDatabase() {
  console.log("🧹 Limpando banco de dados de sinais antigos...");

  // Deletar todos os sinais
  const { error } = await supabase
    .from('intent_signals')
    .delete()
    .neq('id', 0); // Hack para deletar tudo (id != 0 cobre todos os ids gerados)

  if (error) {
    console.error("❌ Erro ao limpar sinais:", error.message);
  } else {
    console.log("✅ Tabela intent_signals limpa com sucesso!");
  }

  // Opcional: Limpar locais se quiser resetar tudo (mas locations são úteis manter)
  // const { error: locError } = await supabase.from('locations').delete().neq('id', 0);
}

clearDatabase();
