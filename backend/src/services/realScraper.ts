import axios from 'axios';
import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX; // ID do Motor de Busca Personalizado

export async function fetchRealSignals() {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.warn("⚠️ Google API Key ou CX não configurados. Usando Mock.");
    return [];
  }

  console.log("🌍 Buscando no Google (API Oficial)...");
  
  // Termos de busca rotativos
  const queries = [
    '"procuro apartamento" "são paulo" site:facebook.com',
    '"busco casa" "zona sul" site:instagram.com',
    '"procuro imovel" "são paulo" site:twitter.com',
    'compro apartamento reformado sp site:facebook.com'
  ];

  const randomQuery = queries[Math.floor(Math.random() * queries.length)];

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: randomQuery,
        num: 5, // Traz 5 resultados por vez
        dateRestrict: 'd1', // Apenas últimas 24h
        cr: 'countryBR', // Prioriza Brasil
        gl: 'br'
      }
    });

    if (!response.data.items) {
        console.log("⚠️ Google não retornou itens.");
        return [];
    }

    const signals: any[] = [];

    for (const item of response.data.items) {
        const fullText = `${item.title} ${item.snippet}`;
        
        // 1. Detectar Local e Intenção
        const locationMatch = detectLocation(fullText);
        const classification = classifyIntent(fullText);

        // Filtra resultados irrelevantes
        if (locationMatch.location_id !== null || classification.score > 20) {
            
            let platform = 'Web';
            if (item.link.includes('facebook')) platform = 'Facebook';
            if (item.link.includes('instagram')) platform = 'Instagram';
            if (item.link.includes('twitter') || item.link.includes('x.com')) platform = 'Twitter';

            signals.push({
              raw_content: item.snippet.replace(/\n/g, ' '),
              url_original: item.link, 
              locationMatch,
              classification,
              posted_at: new Date().toISOString(),
              source_platform: platform
            });
        }
    }

    return signals;

  } catch (error: any) {
    if (error.response) {
        console.error(`❌ Erro Google API (${error.response.status}):`, error.response.data.error.message);
    } else {
        console.error("❌ Erro de conexão Google:", error.message);
    }
    return [];
  }
}
