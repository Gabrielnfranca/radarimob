import axios from 'axios';
import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

export async function fetchFallbackSignals() {
  console.log("🧩 Buscando no Reddit (Source: Recurso Público JSON)...");
  
  const subreddits = ['saopaulo', 'investimentos', 'brasil', 'imoveis', 'financas'];
  // Removed quotes for broader search, letting classifier do the filtering
  const queries = [
    'comprar apartamento', 
    'procurando casa', 
    'primeiro imóvel',
    'financiar apartamento',
    'bairro morar sp',
    'vale a pena comprar',
    'busco imóvel'
  ];
  const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];

  // URL pública do Reddit (JSON) - Usando 'new' para pegar posts recentes reais
  // Search é mais restritivo. Vamos pegar tudo de novo e filtrar na memória.
  const url = `https://www.reddit.com/r/${randomSub}/new.json`;

  try {
    const response = await axios.get(url, {
      params: { 
        limit: 25 // Pegar um lote maior para ter chance de achar algo relevante
      },
      headers: {
        // User-Agent específico as vezes ajuda
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const items = response.data?.data?.children;
    if (!items || items.length === 0) {
        console.log(`⚠️ Reddit retornou vazio para r/${randomSub}`);
        return [];
    }

    const signals: any[] = [];
    const searchTerms = ['comprar', 'procuro', 'apartamento', 'casa', 'mudança', 'imóvel', 'aluguel', 'vender', 'indicação', 'morar'];

    for (const item of items) {
      const data = item.data;
      const title = data.title;
      const selftext = data.selftext || "";
      const fullText = `${title}\n${selftext}`;
      
      // Filtragem manual simples
      const lowerText = fullText.toLowerCase();
      const hasKeyword = searchTerms.some(term => lowerText.includes(term));
      
      // Se não tiver palavra chave, ignora (para não encher de lixo)
      if (!hasKeyword) continue;

      const permalink = `https://www.reddit.com${data.permalink}`;
      
      const locationMatch = detectLocation(fullText);
      const classification = classifyIntent(fullText);

      // Extract basic contact info if present
      const phoneMatch = fullText.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/);
      const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const hasContact = phoneMatch || emailMatch;

      // Relaxed rules for Reddit: Accept implies discussion, so 'low' score is okay if relevant words exist
      // But we prefer high score.
      // Strict Filter: Only score >= 60 (Very strict buyer intent)
      if (classification.score >= 60) {
         
         // Reddit is a valid source
         signals.push({
          raw_content: (fullText.length > 300 ? fullText.substring(0, 300) + '...' : fullText).replace(/\n/g, ' '),
          url_original: permalink,
          computed_permalink: permalink,
          author_public_name: data.author,
          source_name_captured: `r/${data.subreddit}`,
          locationMatch,
          classification,
          posted_at: new Date(data.created_utc * 1000).toISOString(),
          source_platform: 'Reddit'
        });
      }
    }

    return signals;

  } catch (error: any) {
    if (error.response?.status === 429) {
        console.error("❌ Erro Reddit: Rate Limit Exceeded (429).");
    } else {
        console.error(`❌ Erro Reddit Scraper: ${error.message}`);
    }
    return [];
  }
}
