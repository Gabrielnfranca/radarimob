import { generateMockSignal } from './services/mockScraper';
import { fetchRealSignals } from './services/realScraper';
import { supabase } from './config/supabase';

// Loop principal do Worker
const INTERVAL_MS = 20000; 

console.log("🚀 INICIANDO RADARIMOB WORKER (HYBRID MODE)...");
console.log("------------------------------------------------");
console.log("Pressione Ctrl+C para parar.");

async function runBot() {
  try {
    let signalsToProcess = [];

    // 1. Tentar Buscar Sinais Reais
    try {
        const realSignals = await fetchRealSignals();
        if (realSignals.length > 0) {
            console.log(`🌍 Encontrados ${realSignals.length} sinais REAIS da web!`);
            signalsToProcess = realSignals;
        } else {
            console.log("⚠️ Nenhum sinal real encontrado. Usando Mock.");
            signalsToProcess = [generateMockSignal()];
        }
    } catch (e) {
        console.log("⚠️ Erro no scraper real. Usando Mock.");
        signalsToProcess = [generateMockSignal()];
    }

    // Processar cada sinal (Real ou Mock)
    for (const signal of signalsToProcess) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Processando: "${signal.raw_content.substring(0, 50)}..."`);
        
        let locationId = null;
        if (signal.locationMatch && signal.locationMatch.neighborhood) {
          const { data: locData } = await supabase.from('locations').upsert(
              { city: 'São Paulo', neighborhood: signal.locationMatch.neighborhood, region: signal.locationMatch.region },
              { onConflict: 'city, neighborhood' }
          ).select().single();
          if (locData) locationId = locData.id;
        }

        const { error } = await supabase.from('intent_signals').insert({
            source_id: 1, 
            location_id: locationId, 
            raw_content: signal.raw_content,
            url_original: signal.url_original, 
            price_min: signal.classification.price_min,
            price_max: signal.classification.price_max,
            posted_at: signal.posted_at
          });

        if (!error) console.log("✅ Salvo no BD!");
    }

  } catch (err) {
    console.error("❌ Erro worker:", err);
  }
}

// Simulador de envio de notificação
function notifyUser(signal: any) {
  // Mantido para compatibilidade
}

// Executa o bot em loop
setInterval(runBot, INTERVAL_MS);

// Executa uma vez imediatamente
runBot();
