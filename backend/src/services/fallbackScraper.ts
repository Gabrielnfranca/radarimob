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

  // URL pública do Reddit (JSON)
  const url = `https://www.reddit.com/r/${randomSub}/search.json`;

  try {
    const response = await axios.get(url, {
      params: { 
        q: randomQuery,
        restrict_sr: 1,
        sort: 'new',
        limit: 10
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const items = response.data?.data?.children;
    if (!items || items.length === 0) {
        console.log(`⚠️ Reddit retornou vazio para r/${randomSub} q=${randomQuery}`);
        return [];
    }

    const signals: any[] = [];

    for (const item of items) {
      const data = item.data;
      const title = data.title;
      const selftext = data.selftext || "";
      const fullText = `${title} ${selftext}`;
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
