import { generateMockSignal } from './mockScraper';
import { fetchRealSignals } from './realScraper';
import { fetchDuckDuckGoSignals } from './duckduckgoScraper';
import { fetchFallbackSignals } from './fallbackScraper';
import { supabase } from '../config/supabase';

export async function runBotEngine() {
  const resultLog = [];
  try {
    let signalsToProcess = [];
    resultLog.push("🚀 Starting Bot Engine...");

    // 1. Tentar Buscar Sinais Reais (Google API)
    try {
        const realSignals = await fetchRealSignals();
        if (realSignals.length > 0) {
            resultLog.push(`🌍 Encontrados ${realSignals.length} sinais REAIS da web via Google API!`);
            signalsToProcess = realSignals;
        } else {
            // 2. Tentar DuckDuckGo HTML
            const duckSignals = await fetchDuckDuckGoSignals();
            if (duckSignals.length > 0) {
               resultLog.push(`🦆 Encontrados ${duckSignals.length} sinais do DuckDuckGo!`);
               signalsToProcess = duckSignals;
            } else {
               // 3. Fallback Scraper (Reddit)
               const fallbackSignals = await fetchFallbackSignals();
               if (fallbackSignals.length > 0) {
                  resultLog.push(`🧩 Encontrados ${fallbackSignals.length} sinais do Reddit!`);
                  signalsToProcess = fallbackSignals;
               } else {
                  resultLog.push("⚠️ Nenhum sinal real encontrado.");
                  signalsToProcess = [];
               }
            }
        }
    } catch (e: any) {
        resultLog.push(`⚠️ Erro nos scrapers reais: ${e.message}`);
        signalsToProcess = [];
    }

    // Processar cada sinal
    let processedCount = 0;
    for (const signal of signalsToProcess) {
        let locationId = null;
        if (signal.locationMatch && signal.locationMatch.neighborhood) {
          const { data: locData } = await supabase.from('locations').upsert(
              { city: 'São Paulo', neighborhood: signal.locationMatch.neighborhood, region: signal.locationMatch.region },
              { onConflict: 'city, neighborhood' }
          ).select().single();
          if (locData) locationId = locData.id;
        }

        let sourceId = 1;

        const payload: any = {
            source_id: sourceId, 
            location_id: locationId, 
            price_min: signal.classification.price_min,
            price_max: signal.classification.price_max,
            posted_at: signal.posted_at,
            author_public_name: signal.author_public_name || 'Desconhecido',
            source_name_captured: signal.source_name_captured || 'Web',
            external_post_id: signal.external_post_id || null,
            external_group_id: signal.external_group_id || null,
            computed_permalink: signal.computed_permalink || signal.url_original || null,
            confidence_score: signal.confidence_score || signal.classification.score || 0
        };

        const { error } = await supabase.from('intent_signals').insert({
            ...payload,
            raw_content: signal.raw_content,
            url_original: signal.url_original, 
        });

        if (!error) {
            processedCount++;
        } else {
           if (error.message.includes('url_original')) {
               const contentWithLink = `${signal.raw_content}\n\n🔗 Link Original: ${signal.url_original}`;
               const { error: error2 } = await supabase.from('intent_signals').insert({
                  ...payload,
                  raw_content: contentWithLink
               });
               if (!error2) processedCount++;
           }
        }
    }
    
    resultLog.push(`✅ Processamento concluído. ${processedCount} novos sinais salvos.`);
    return { success: true, logs: resultLog, count: processedCount };

  } catch (err: any) {
    console.error("❌ Erro worker:", err);
    return { success: false, error: err.message };
  }
}
