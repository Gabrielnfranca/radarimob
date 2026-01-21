import axios from 'axios';
import * as cheerio from 'cheerio';
import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

export async function fetchRealSignals() {
  console.log("🌍 Executando busca real na web (Via DuckDuckGo)...");
  
  const queries = [
    'site:facebook.com "procuro apartamento" "são paulo"',
    'site:facebook.com "busco casa" "zona sul"',
    'site:twitter.com "procuro imovel" "são paulo"',
  ];

  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(randomQuery)}&df=d`; // df=d (último dia)

  try {
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const signals: any[] = [];

    $('.result').each((i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const url = $(el).find('.result__url').attr('href');

      if (title && snippet && url) {
        // Combinar titulo e snippet para analise
        const fullText = `${title} ${snippet}`;
        
        // 1. Detectar Local
        const locationMatch = detectLocation(fullText);
        
        // 2. Classificar Intenção
        const classification = classifyIntent(fullText);

        // Só queremos leads que pareçam ter alguma intenção real
        if (locationMatch.location_id !== null || classification.score > 20) {
           
            // Extrair plataforma do URL
            let platform = 'Web';
            if (url.includes('facebook')) platform = 'Facebook';
            if (url.includes('instagram')) platform = 'Instagram';
            if (url.includes('twitter') || url.includes('x.com')) platform = 'Twitter';

            signals.push({
              raw_content: snippet,
              url_original: url, // Link real!
              locationMatch,
              classification,
              posted_at: new Date().toISOString(),
              source_platform: platform
            });
        }
      }
    });

    return signals;

  } catch (error: any) {
    console.error("❌ Erro no RealScraper:", error.message);
    return [];
  }
}
