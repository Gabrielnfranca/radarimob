import 'dotenv/config';
import { generateMockSignal } from './services/mockScraper';
import { fetchRealSignals } from './services/realScraper';
import { fetchDuckDuckGoSignals } from './services/duckduckgoScraper';
import { fetchFallbackSignals } from './services/fallbackScraper';
import { supabase } from './config/supabase';

// Loop principal do Worker
const INTERVAL_MS = 20000; 

console.log("🚀 INICIANDO RADARIMOB WORKER (HYBRID MODE)...");
console.log("------------------------------------------------");
console.log("Pressione Ctrl+C para parar.");

async function runBot() {
  try {
    let signalsToProcess = [];

    // 1. Tentar Buscar Sinais Reais (Google API)
    try {
        console.log("Attempts to fetch real signals...");
        const realSignals = await fetchRealSignals();
        if (realSignals.length > 0) {
            console.log(`🌍 Encontrados ${realSignals.length} sinais REAIS da web via Google API!`);
            signalsToProcess = realSignals;
        } else {
            console.log("⚠️ Google API retornou vazio ou falhou. Tentando DuckDuckGo...");
            
            // 2. Tentar DuckDuckGo HTML
            const duckSignals = await fetchDuckDuckGoSignals();
            if (duckSignals.length > 0) {
               console.log(`🦆 Encontrados ${duckSignals.length} sinais do DuckDuckGo!`);
               signalsToProcess = duckSignals;
            } else {
               console.log("⚠️ DuckDuckGo retornou vazio. Tentando Reddit (Fallback)...");
               
               // 3. Fallback Scraper (Reddit)
               const fallbackSignals = await fetchFallbackSignals();
               if (fallbackSignals.length > 0) {
                  console.log(`🧩 Encontrados ${fallbackSignals.length} sinais do Reddit!`);
                  signalsToProcess = fallbackSignals;
               } else {
                  console.log("⚠️ Nenhum sinal real encontrado. NENHUM DADO MOCK SERÁ GERADO (Modo Produção).");
                  signalsToProcess = [];
                  // signalsToProcess = [generateMockSignal()]; // MOCK DESATIVADO
               }
            }
        }
    } catch (e) {
        console.log("⚠️ Erro nos scrapers reais.", e);
        signalsToProcess = [];
        // signalsToProcess = [generateMockSignal()]; // MOCK DESATIVADO
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

        // Ensure source exists (Resilient) - MVP Fix
        let sourceId = 1;

        const payload: any = {
            source_id: sourceId, 
            location_id: locationId, 
            price_min: signal.classification.price_min,
            price_max: signal.classification.price_max,
            posted_at: signal.posted_at,
            // New Fields Mapped
            author_public_name: signal.author_public_name || 'Desconhecido',
            source_name_captured: signal.source_name_captured || 'Web',
            external_post_id: signal.external_post_id || null,
            external_group_id: signal.external_group_id || null,
            computed_permalink: signal.computed_permalink || signal.url_original || null,
            confidence_score: signal.confidence_score || signal.classification.score || 0
        };

        // Tentativa 1: Inserção Padrão (Com url_original)
        const { error } = await supabase.from('intent_signals').insert({
            ...payload,
            raw_content: signal.raw_content,
            url_original: signal.url_original, 
        });

        if (!error) {
           console.log("✅ Salvo no BD!");
        } else {
           // Fallback: Se der erro de coluna inexistente (url_original), salva dentro do conteúdo
           if (error.message.includes('url_original')) {
               console.warn("⚠️ Coluna 'url_original' ausente. Salvando link no corpo do texto...");
               
               const contentWithLink = `${signal.raw_content}\n\n🔗 Link Original: ${signal.url_original}`;
               
               const { error: error2 } = await supabase.from('intent_signals').insert({
                  ...payload,
                  raw_content: contentWithLink
                  // Removemos url_original daqui
               });

               if (!error2) console.log("✅ Salvo no BD (Modo de Compatibilidade)!");
               else console.error("❌ Falha final ao salvar:", error2.message);
           } else {
               console.error("❌ Erro ao salvar no BD:", error.message);
           }
        }
    }
    console.log(`\n⏳ Ciclo concluído. Aguardando ${INTERVAL_MS/1000} segundos...`);

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
