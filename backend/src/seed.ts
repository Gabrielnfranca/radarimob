import { supabase } from './config/supabase';

async function seed() {
  console.log("🌱 Semeando banco de dados...");

  // 1. Criar Source Mock (Facebook)
  console.log("Criando fonte de dados (Facebook)...");
  const { data, error } = await supabase
    .from('sources')
    .upsert({ id: 1, name: 'Facebook Mock', platform: 'Facebook', base_url: 'https://facebook.com' })
    .select();

  if (error) {
    console.error("❌ Erro ao criar source:", error.message);
    console.log("DICA: Verifique se sua chave no .env do backend tem permissão de escrita (Service Role) ou se as políticas RLS permitem inserção.");
  } else {
    console.log("✅ Source criada com sucesso:", data);
  }
}

seed();
