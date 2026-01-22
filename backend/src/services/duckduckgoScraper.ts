import axios from 'axios';
import * as cheerio from 'cheerio';
import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

export async function fetchDuckDuckGoSignals() {
  console.log("🦆 Buscando no DuckDuckGo (HTML Scraper)...");
  
  const queries = [
    'site:facebook.com "procuro comprar" apartamento "são paulo"',
    'site:instagram.com "procurando casa" "são paulo"',
    'site:twitter.com "compro apartamento" sp',
    'site:reddit.com "procuro apartamento" são paulo',
    'site:reddit.com "comprar imóvel" sp',
    'site:hardmob.com.br "imóvel" comprar',
    'forum "comprar imóvel" indicação sp',
    'site:facebook.com "alguém vendendo" apartamento sp',
    'site:facebook.com "busco" casa condomínio sp'
  ];

  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  const url = 'https://html.duckduckgo.com/html/';

  try {
    const params = new URLSearchParams();
    params.append('q', randomQuery);
    
    // Configurando headers para parecer um navegador real
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://html.duckduckgo.com/'
      }
    });

    const $ = cheerio.load(response.data);
    const signals: any[] = [];

    // DuckDuckGo HTML structure: .result -> .result__title -> a (link), .result__snippet (body)
    $('.result').each((i, element) => {
        const title = $(element).find('.result__title a').text().trim();
        const link = $(element).find('.result__title a').attr('href');
        const snippet = $(element).find('.result__snippet').text().trim();
        
        if (!title || !link || !snippet) return;

        const fullText = `${title} ${snippet}`;
        
        // 1. Detectar Local e Intenção
        const locationMatch = detectLocation(fullText);
        const classification = classifyIntent(fullText);

        // Relaxar um pouco o score para o DuckDuckGo pois os snippets são curtos
        // Se a busca já foi por "procuro comprar", o contexto é forte
        if (classification.score >= 40) { // Baixei de 60 para 40 aqui, pois o snippet pode cortar palavras
            
            let platform = 'Web';
            if (link.includes('facebook')) platform = 'Facebook';
            if (link.includes('instagram')) platform = 'Instagram';
            if (link.includes('twitter') || link.includes('x.com')) platform = 'Twitter';
            if (link.includes('reddit')) platform = 'Reddit';
            if (link.includes('quintoandar')) platform = 'QuintoAndar';

            // SUPER VALIDAÇÃO DE URL (EVITAR LINKS GENÉRICOS)
            // O usuário reclamou que clica e não vê o post. Isso acontece quando linkamos a HOME do grupo
            // em vez do post específico.
            let isSpecificPost = true;
            if (platform === 'Facebook' && !link.includes('/posts/') && !link.includes('/permalink/')) isSpecificPost = false;
            if (platform === 'Instagram' && !link.includes('/p/')) isSpecificPost = false;
            if (platform === 'Twitter' && !link.includes('/status/')) isSpecificPost = false;

            if (isSpecificPost) {
                signals.push({
                  raw_content: snippet.replace(/\n/g, ' '),
                  url_original: link,
                  locationMatch,
                  classification: {
                      ...classification,
                      // Se o score original foi baixo (40-59) mas aceitamos, marcamos como Morno
                      label: classification.score >= 80 ? 'Quente' : 'Morno' 
                  },
                  posted_at: new Date().toISOString(), // DuckDuckGo não dá data precisa fácil
                  source_platform: platform
                });
            }
        }
    });

    if (signals.length > 0) {
        console.log(`🦆 DuckDuckGo encontrou ${signals.length} sinais!`);
    } else {
        console.log(`⚠️ DuckDuckGo não retornou resultados úteis para: ${randomQuery}`);
    }

    return signals;

  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Erro DuckDuckGo Scraper (${error.response.status}):`, error.message);
    } else {
        console.error("❌ Erro DuckDuckGo Scraper:", error.message);
    }
    return [];
  }
}
