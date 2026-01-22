import { supabase } from './config/supabase';

async function seedMore() {
  console.log("🌱 Semeando MAIS dados de teste para demonstração...");

  // Vamos garantir que temos locations
  const { data: locData } = await supabase.from('locations').select();
  const locId = locData && locData[0] ? locData[0].id : 1;

  const moreLeads = [
    {
        source_id: 1, // Facebook
        location_id: locId,
        raw_content: "[Autor: Marcos P.] [Origem: Grupo Moema] [Link: https://facebook.com/groups/moema/123] Procuro apartamento de 2 quartos em Moema, até 800k. Pagamento à vista.",
        posted_at: new Date().toISOString()
    },
    {
        source_id: 2, // Reddit
        location_id: locId,
        raw_content: "[Autor: InvestidorSP] [Origem: r/investimentos] [Link: https://reddit.com/r/investimentos/comments/xyz] Estou liquidando ativos e quero comprar imóveis de leilão ou oportunidade em SP.",
        posted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min atrás
    },
    {
        source_id: 1, // Facebook
        location_id: locId,
        raw_content: "[Autor: Fernanda Lima] [Origem: Vizinhos do Brooklin] Alguém vendendo cobertura sem condomínio absurdo? Tenho interesse real.",
        // Sem link (Snapshot)
        posted_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2h atrás
    },
    {
        source_id: 1,
        location_id: locId,
        raw_content: "[Autor: Rafael S.] [Origem: Marketplace] [Link: https://facebook.com/marketplace/item/123] Busco casa em condomínio fechado na Granja Viana ou Zona Oeste. Urgente.",
        posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 dia atrás
    }
  ];

  const { error } = await supabase.from('intent_signals').insert(moreLeads);

  if (error) {
    console.error("❌ Erro ao inserir mais leads:", error.message);
  } else {
    console.log("✅ +4 Leads inseridos com sucesso!");
  }
}

seedMore();
