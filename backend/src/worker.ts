import { generateMockSignal } from './services/mockScraper';
import { supabase } from './config/supabase';

// Loop principal do Worker
const INTERVAL_MS = 10000; // Gera um lead a cada 10 segundos para teste

console.log("🚀 INICIANDO RADARIMOB WORKER (MOCK MODE)...");
console.log("------------------------------------------------");
console.log("Pressione Ctrl+C para parar.");

async function runBot() {
  try {
    // 1. Gerar Sinal Simulado
    const signal = generateMockSignal();
    console.log(`\n[${new Date().toLocaleTimeString()}] Novo sinal detectado:`);
    console.log(`📝 "${signal.raw_content}"`);
    console.log(`📍 Local: ${signal.locationMatch.neighborhood} (${signal.locationMatch.region})`);
    console.log(`🔥 Classificação: ${signal.classification.label} (Score: ${signal.classification.score})`);

    // 2. Salvar no Supabase
    // Nota: Precisamos mapear o nome da Source para um ID real do banco.
    // Como é Mock, vamos assumir source_id fixo ou criar dinamicamente se não existir (Opcional)
    // Para simplificar o MVP, vou usar source_id = 1 (Assumindo que criamos uma source "Facebook Mock" no banco)
    
    // IMPORTANTE: Em produção, você deve buscar o ID da source e do location no banco antes de inserir.
    
    const { error } = await supabase
      .from('intent_signals')
      .insert({
        source_id: 1, // Fixado para MVP. Certifique-se de criar um registro na tabela 'sources' com id=1
        location_id: signal.locationMatch.location_id,
        raw_content: signal.raw_content,
        url_original: signal.url_original,
        price_min: signal.classification.price_min,
        price_max: signal.classification.price_max,
        posted_at: signal.posted_at
      });

    if (error) {
      console.error("❌ Erro ao salvar no Supabase:", error.message);
    } else {
      console.log("✅ Salvo no Banco de Dados com sucesso.");

      // 3. Hook de Notificação (Preparação para Email/WhatsApp)
      if (signal.classification.label === 'Quente') {
        notifyUser(signal);
      }
    }

  } catch (err) {
    console.error("❌ Erro crítico no worker:", err);
  }
}

// Simulador de envio de notificação
function notifyUser(signal: any) {
  console.log(`\n🔔 [NOTIFICAÇÃO] Disparando alerta para corretores da região: ${signal.locationMatch.region}`);
  console.log(`   --> "Novo Lead Quente em ${signal.locationMatch.neighborhood}!"`);
  // Futuro: await sendEmail(...) ou await sendWhatsapp(...)
}

// Executa o bot em loop
setInterval(runBot, INTERVAL_MS);

// Executa uma vez imediatamente
runBot();
