import { detectLocation } from '../utils/locationDetector';
import { classifyIntent } from './classifier';

// Cria dados falsos para popular o banco e testar o frontend
// Simula o comportamento do Scraper Real

const FIRST_NAMES = ['Ana', 'Carlos', 'Beatriz', 'João', 'Fernanda', 'Rafael', 'Mariana', 'Pedro', 'Lucas', 'Juliana'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida'];
const SOURCES = ['Grupo Facebook: Imóveis SP', 'Grupo Facebook: Vizinhos Vila Mariana', 'Twitter/X', 'Comentários Instagram'];

const TEMPLATES = [
  "Estou procurando um apartamento para comprar na {bairro}, tenho aprovado carta de crédito de 500k. Alguém indica condomínio?",
  "Busco casa em condomínio fechado na {bairro}, pago à vista até 1.2M. Urgente.",
  "Dúvida sobre financiamento: Tenho renda de 15k, consigo comprar um ap de 600k na {bairro}?",
  "Quero sair do aluguel. Procurando studios ou 1 dormitório na região de {bairro} para comprar. Orçamento curto.",
  "Alguém vendendo apartamento antigo na {bairro}? Gosto de reformar. Pago a vista.",
  "Investidores: vale a pena comprar na planta na {bairro}? Estou com um dinheiro parado.",
  "Estou vindo do interior e quero comprar meu primeiro imóvel em São Paulo, foco em {bairro}. Dicas?"
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
    source: 'Simulação (Sem resultados reais)', // Mudamos a fonte para deixar claro
    // REMOVIDO LINK FAKE QUE CONFUNDIA O USUARIO
    // Antes gerava uma busca no Facebook que não levava a lugar nenhum.
    // Agora deixamos 'null' para o frontend saber que não tem link.
    url_original: null, 
    posted_at: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(), // Post recente
    
    // Dados processados
    locationMatch: locationData,
    classification: classification
  };
}
