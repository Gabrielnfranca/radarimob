import { supabase } from './config/supabase';

async function seed() {
  console.log("🌱 Semeando banco de dados com dados de teste (Snapshot Logic)...");

  // 1. Criar Fontes
  const { data: sourceData } = await supabase
    .from('sources')
    .upsert([
        { id: 1, name: 'Facebook Groups', platform: 'Facebook', base_url: 'https://facebook.com' },
        { id: 2, name: 'Reddit Investidores', platform: 'Other', base_url: 'https://reddit.com' }
    ])
    .select();

  // 2. Criar Locais
  const { data: locData } = await supabase
    .from('locations')
    .upsert([
        { city: 'São Paulo', neighborhood: 'Vila Mariana', region: 'Zona Sul' },
        { city: 'São Paulo', neighborhood: 'Tatuapé', region: 'Zona Leste' }
    ], { onConflict: 'city, neighborhood' })
    .select();

  const locationId1 = locData && locData[0] ? locData[0].id : 1;
  const locationId2 = locData && locData[1] ? locData[1].id : 2;

  // 3. Criar Leads de Exemplo (Compatível com Schema Mínimo)
  
  const leads = [
    {
        source_id: 1,
        location_id: locationId1,
        raw_content: "[Autor: Ricardo Oliveira] [Origem: Vila Mariana News] [Link: https://facebook.com/groups/vilamariana/posts/999] Procuro urgente casa para comprar na Vila Mariana. Tenho 1 milhão disponível.",
        posted_at: new Date().toISOString()
    },
    {
        source_id: 1,
        location_id: locationId2,
        raw_content: "[Autor: Juliana Mendes] [Origem: Classificados Tatuapé] Alguém sabendo de apartamento de 3 dormitórios no Tatuapé? Preciso mudar até o mês que vem.",
        posted_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const { error } = await supabase.from('intent_signals').insert(leads);

  if (error) {
    console.error("❌ Erro ao semear leads:", error.message);
  } else {
    console.log("✅ Banco de dados populado com sucesso!");
  }
}

seed();
