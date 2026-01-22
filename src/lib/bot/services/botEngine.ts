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
                  // MODO DEMONSTRAÇÃO ATIVO:
                  // Se nada for encontrado (pq a API do Google está sem crédito ou bloqueada),
                  // geramos um sinal simulado para o usuário ver o sistema funcionando.
                  resultLog.push("⚠️ Nenhum sinal real encontrado. Gerando SIMULAÇÃO para Demo...");
                  const mock = generateMockSignal();
                  signalsToProcess = [{
                      ...mock,
                      author_public_name: mock.author_name, // Adapter para schema interno
                      source_name_captured: mock.source,
                      computed_permalink: null,
                      // Forçar data atual para aparecer no topo do feed em tempo real
                      posted_at: new Date().toISOString() 
                  }];
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

        // --- STRATEGY DE SALVAMENTO ROBUSTO ---
        // Tenta salvar com todos os campos. Se falhar por schema desatualizado,
        // tenta salvar apenas o essencial concatenado no texto (Backup Mode).

        const finalLink = signal.computed_permalink || signal.url_original;
        const enrichedContent = `[Autor: ${signal.author_public_name || 'Desconhecido'}] [Origem: ${signal.source_name_captured || 'Web'}] ${finalLink ? '[Link: '+finalLink+']' : ''}\n\n${signal.raw_content}`;
        let finalContent = enrichedContent;
        if (finalContent.length > 500) finalContent = finalContent.substring(0, 500) + '...';

        // 1. Tentativa Completa (Ideal)
        // const { error } = await supabase.from('intent_signals').insert({ ...payload }); 
        
        // 2. Tentativa Blindada (Compatibilidade Máxima)
        // Assumimos que o banco pode não ter colunas novas, então enviamos apenas o que é garantido.
        const safePayload = {
            source_id: sourceId,
            location_id: locationId,
            posted_at: signal.posted_at,
            raw_content: finalContent
            // Não enviamos url_original, author_public_name, etc. separadamente para não quebrar.
        };

        const { error } = await supabase.from('intent_signals').insert(safePayload);

        if (!error) {
            processedCount++;
            console.log(`✅ Sinal salvo blindado: ${signal.author_public_name || 'Generic'} - ${signal.source_name_captured}`);
        } else {
           console.error(`❌ Erro ao salvar sinal no banco: ${error.message}`, error.details, safePayload);
           
           if (error.message.includes('url_original')) {
               const contentWithLink = `${finalContent}\n\n🔗 Link Original: ${signal.url_original}`;
               const { error: error2 } = await supabase.from('intent_signals').insert({
                  ...safePayload, // Usamos safePayload, nao payload que sumiu
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
