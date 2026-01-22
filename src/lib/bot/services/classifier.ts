// Analisa a qualidade do lead baseado em palavras-chave

interface ClassificationResult {
  score: number;
  label: 'Quente' | 'Morno' | 'Curioso';
  price_min?: number;
  price_max?: number;
}

export function classifyIntent(text: string): ClassificationResult {
  const normalizedText = text.toLowerCase();
  let score = 0; // Começa zerado para ser mais rigoroso

  // 1. FILTRO DE RUÍDO (Elimina Notícias, Política e Curiosidades Gerais)
  const noiseKeywords = [
    'notícia', 'jornal', 'política', 'governo', 'lula', 'bolsonaro', 'eleição',
    'crime', 'assalto', 'roubo', 'polícia', 'morte', 'acidente', 'futebol',
    'bbb', 'reality', 'meme', 'piada', 'jogo', 'steam', 'playstation',
    'namorado', 'namorada', 'traição', 'desabafo', 'depressão', 'ansiedade',
    'trabalho', 'emprego', 'vaga', 'salário', 'chefe', 'empresa', 'processo seletivo'
  ];
  if (noiseKeywords.some(w => normalizedText.includes(w))) return { score: 0, label: 'Curioso' }; // Descarte imediato

  // 2. FILTRO DE VENDEDOR (Outros corretores/imobiliárias)
  const sellerKeywords = [
    'vendo', 'vende-se', 'alugo', 'aluga-se', 'passo o ponto',
    'lançamento', 'breve lançamento', 'últimas unidades', 'plantão de vendas',
    'visite o decorado', 'imobiliária', 'creci', 'corretor parceiro',
    'direto com a construtora', 'agende sua visita', 'chamar no pvd', 
    'oportunidade de investimento', 'renda garantida', 'studio novo', 'prédio novo'
  ];
  if (sellerKeywords.some(w => normalizedText.includes(w))) score -= 100; // Penalização máxima

  // 3. PALAVRAS-CHAVE DE COMPRADOR REAL (Intenção Pessoal)
  // Frases em primeira pessoa são muito fortes
  const strongBuyerPhrases = [
    'quero comprar', 'estou comprando', 'procuro comprar', 'busco comprar',
    'estou procurando apartamento', 'estou procurando casa', 'queremos comprar',
    'pensando em comprar', 'decidi comprar', 'sonho da casa própria',
    'juntei dinheiro para comprar', 'financiar meu apartamento', 'minha casa minha vida',
    'procura-se casa', 'compro sua casa', 'procuro imóvel', 'busco imóvel',
    'buscando apartamento', 'buscando casa', 'interesse em comprar', 'tenho interesse em comprar',
    'alguém vendendo', 'procuro ap', 'compro ap', 'busco ap'
  ];
  if (strongBuyerPhrases.some(p => normalizedText.includes(p))) score += 70;

  // Palavras soltas de compra (Contexto mais fraco)
  const buyKeywords = [
    'indicação', 'recomendação', 'bairro seguro', 'bairro bom',
    'financiamento', 'consórcio', 'entrada', 'escritura', 'itbi',
    'aceita financiamento', 'valor', 'preço', 'condomínio', 'visit', 'visita'
  ];
  if (buyKeywords.some(w => normalizedText.includes(w))) score += 20;

  // Palavras-chave NEGATIVAS Específicas Imobiliárias
  const negativeKeywords = [
    'aluguel', 'alugar', 'locação', 'inquilino', 'fiador', 'calção', 
    'dividir', 'república', 'quarto individual', 'vaga em quarto',
    'temporada', 'airbnb', 'diária'
  ];
  if (negativeKeywords.some(w => normalizedText.includes(w))) score -= 80;

  // Detecção de Preço (Só conta se não for "Barato/Caro" subjetivo, mas valor real Money)
  const priceRegex = /(?:R\$|R\$\s)?\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:\s?(?:k|mil|milhões|m|MM))/i;
  // Só pontua preço se já tiver alguma intenção de compra identificada
  if (text.match(priceRegex) && score > 0) {
    score += 10; 
  }

  // Boost se tiver contato explícito E já tiver score positivo
  if ((text.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/) || text.match(/[\w.-]+@[\w.-]+\.\w+/)) && score > 0) {
      score += 20;
  }

  // Normalização do Score (Max 100, Min 0)
  score = Math.min(100, Math.max(0, score));

  // Filtro Rígido FINAL: Para ser considerado, tem que ser MUITO claro
  // Apenas scores acima de 60 passarão no worker
  
  // Definição do Label
  let label: 'Quente' | 'Morno' | 'Curioso' = 'Curioso';
  if (score >= 80) label = 'Quente';
  else if (score >= 50) label = 'Morno';
  
  // Placeholder para o futuro extrair valores
  const price_min = undefined;
  const price_max = undefined;

  return {
    score,
    label,
    price_min,
    price_max
  };
}
