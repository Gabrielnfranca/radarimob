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

            // SUPER VALIDAÇÃO DE URL - Mesma lógica do DuckDuckGo
            let isSpecificPost = true;
            if (platform === 'Facebook' && !item.link.includes('/posts/') && !item.link.includes('/permalink/')) isSpecificPost = false;
            // if (platform === 'Instagram' && !item.link.includes('/p/')) isSpecificPost = false; // Instagram links are usually generic in search
            if (platform === 'Twitter' && !item.link.includes('/status/')) isSpecificPost = false;

            // Extração de metadados
            let external_post_id = null;
            let external_group_id = null;
            let computed_permalink = null;
            let author_public_name = null;
            let source_name_captured = null;

            if (item.link) {
                try {
                    const urlObj = new URL(item.link);
                    // Limpar query params para garantir permalink estavel
                    urlObj.search = '';
                    computed_permalink = urlObj.toString();

                    // Tentar extrair IDs (Simples regex)
                    const pathParts = urlObj.pathname.split('/');
                    if (platform === 'Facebook') {
                        // ex: /groups/12345/posts/67890
                        const groupIndex = pathParts.indexOf('groups');
                        if (groupIndex > -1 && pathParts[groupIndex + 1]) {
                            external_group_id = pathParts[groupIndex + 1];
                        }
                        const postIndex = pathParts.indexOf('posts'); 
                        if (postIndex > -1 && pathParts[postIndex + 1]) {
                             external_post_id = pathParts[postIndex + 1];
                        }
                         // ex: /permalink.php?story_fbid=X&id=Y (menos comum no google results limpos, mas possivel)
                    }
                } catch (e) {
                    computed_permalink = item.link; // Fallback
                }
            }
            
            // Tentar extrair autor do titulo (Ex: "Maria Silva | Facebook")
            if (item.title) {
                const parts = item.title.split('|');
                if (parts.length > 0) {
                     const possibleName = parts[0].trim();
                     if (possibleName !== 'Facebook' && possibleName.length < 50) {
                         author_public_name = possibleName;
                     }
                }
                // Source name from snippet or title
                source_name_captured = item.displayLink || platform; 
            }


            if (isSpecificPost) {
                signals.push({
                  raw_content: item.snippet.replace(/\n/g, ' '),
                  url_original: item.link, 
                  locationMatch,
                  classification,
                  posted_at: new Date().toISOString(),
                  source_platform: platform,
                  // New Fields
                  author_public_name,
                  source_name_captured,
                  external_post_id,
                  external_group_id,
                  computed_permalink,
                  confidence_score: classification.score
                });
            }
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
