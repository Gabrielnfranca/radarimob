import 'dotenv/config';
import { runBotEngine } from './services/botEngine';

// Loop principal do Worker
const INTERVAL_MS = 20000; 

console.log("🚀 INICIANDO RADARIMOB WORKER (HYBRID MODE)...");
console.log("------------------------------------------------");
console.log("Pressione Ctrl+C para parar.");

async function runBot() {
    const result = await runBotEngine();
    result.logs?.forEach(log => console.log(log));
    if (!result.success) console.error(result.error);
    
    console.log(`\n⏳ Ciclo concluído. Aguardando ${INTERVAL_MS/1000} segundos...`);
}

// Executa o bot em loop
setInterval(runBot, INTERVAL_MS);

// Executa uma vez imediatamente
runBot();

