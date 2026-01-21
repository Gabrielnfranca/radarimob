import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

// Cria dados falsos para popular o banco e testar o frontend
// Simula o comportamento do Scraper Real

const FIRST_NAMES = ['Ana', 'Carlos', 'Beatriz', 'João', 'Fernanda', 'Rafael', 'Mariana', 'Pedro', 'Lucas', 'Juliana'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida'];
const SOURCES = ['Grupo Facebook: Imóveis SP', 'Grupo Facebook: Vizinhos Vila Mariana', 'Twitter/X', 'Comentários Instagram'];

const TEMPLATES = [
  "Estou procurando apartamento na {bairro} com 2 quartos, até 600k. Alguém sabe de algo?", // Quente
  "Alguém indica corretor que atue na {bairro}? Quero vender meu apto e comprar uma casa maior.", // Morno/Quente
  "Pensando em mudar para a {regiao}. O que acham do bairro {bairro}?", // Curioso
  "Busco studio para investimento em {bairro}, proximo ao metro.", // Quente
  "Qual a média de preço do m2 na {bairro}? Achei tudo muito caro.", // Curioso
  "Compro apto 3 dorms em {bairro}, pagamento a vista. Urgente.", // Quente (Ouro)
  "Procurando indicação de construtora confiável na {regiao}.", // Morno
  "Família crescendo, precisamos de um ap maior na {bairro} ou {bairro_vizinho}. Orçamento 900 mil.", // Quente
];

const BAIRROS_TEMPLATES = [
  { bairro: 'Vila Mariana', regiao: 'Zona Sul', vizinho: 'Saúde' },
  { bairro: 'Moema', regiao: 'Zona Sul', vizinho: 'Brooklin' },
  { bairro: 'Pinheiros', regiao: 'Zona Oeste', vizinho: 'Vila Madalena' },
  { bairro: 'Tatuapé', regiao: 'Zona Leste', vizinho: 'Mooca' }
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockSignal() {
  const templateObj = getRandomElement(BAIRROS_TEMPLATES);
  const rawTemplate = getRandomElement(TEMPLATES);
  
  // Preenche o template
  let content = rawTemplate
    .replace('{bairro}', templateObj.bairro)
    .replace('{regiao}', templateObj.regiao)
    .replace('{bairro_vizinho}', templateObj.vizinho);
  
  // Aleatoriedade extra para inputs manuais simulados
  if (Math.random() > 0.7) {
    content = content.toLowerCase(); // Simula usuario preguiçoso
  }

  // Gera dados auxiliares
  const locationData = detectLocation(content);
  const classification = classifyIntent(content);
  const fakeUser = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
  
  return {
    raw_content: content,
    author_name: fakeUser, // Não vai pro banco no MVP 1.0, mas útil saber
    source: getRandomElement(SOURCES),
    url_original: `https://facebook.com/groups/fake_post_${Math.floor(Math.random() * 10000)}`,
    posted_at: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(), // Post recente
    
    // Dados processados
    locationMatch: locationData,
    classification: classification
  };
}
