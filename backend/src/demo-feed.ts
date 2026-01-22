
import { supabase } from './config/supabase';

// Lista de nomes e bairros para gerar leads variados
const names = ['Ana', 'Carlos', 'Beatriz', 'Ricardo', 'Fernanda', 'João', 'Mariana', 'Pedro', 'Sofia', 'Lucas', 'Camila', 'Gabriel'];
const neighborhoods = ['Vila Mariana', 'Moema', 'Pinheiros', 'Tatuapé', 'Ipiranga', 'Zona Sul', 'Zona Leste', 'Centro', 'Paulista', 'Brooklin'];
const intents = ['comprar', 'alugar', 'investir', 'busco', 'procuro'];
const types = ['apartamento', 'casa', 'cobertura', 'kitnet', 'studio'];
const sources = [
    { name: 'Grupo Facebook: Vizinhos', url: 'https://facebook.com/groups/vizinhos' },
    { name: 'Twitter Search', url: 'https://twitter.com/search' },
    { name: 'Instagram Comments', url: 'https://instagram.com/p/123' },
    { name: 'Forum HardMob', url: 'https://hardmob.com.br/promo' }
];

async function startDemoFeed() {
  console.log("🎬 INICIANDO MODO DEMO: Injetando 1 lead a cada 10 segundos...");
  console.log("Pressione Ctrl+C para parar a simulação.");

  setInterval(async () => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    // Texto realista
    const text = `Estou ${randomIntent} um ${randomType} em ${randomNeighborhood}. Alguém tem indicação? Tenho crédito aprovado.`;
    
    // Formato Blindado
    const raw_content = `[Autor: ${randomName} Demo] [Origem: ${randomSource.name}] [Link: ${randomSource.url}]\n\n"${text}"`;

    const payload = {
       source_id: 1, // Generic
       location_id: 18, // Zona Sul Geral (fallback)
       raw_content: raw_content,
       posted_at: new Date().toISOString()
    };

    const { error } = await supabase.from('intent_signals').insert(payload);

    if (!error) {
        console.log(`✨ [+1 Lead Demo] ${randomName} em ${randomNeighborhood}`);
    } else {
        console.error(`❌ Erro Demo:`, error.message);
    }

  }, 10000); // 10 segundos
}

startDemoFeed();
