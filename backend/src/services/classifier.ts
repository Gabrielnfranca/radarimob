// Analisa a qualidade do lead baseado em palavras-chave

interface ClassificationResult {
  score: number;
  label: 'Quente' | 'Morno' | 'Curioso';
  price_min?: number;
  price_max?: number;
}

export function classifyIntent(text: string): ClassificationResult {
  const normalizedText = text.toLowerCase();
  let score = 30; // Pontuação base (Curioso)

  // Palavras-chave de ALTA intenção (+ Pontos)
  const highIntentKeywords = ['compro', 'procuro', 'busco', 'dinheiro', 'vista', 'urgente', 'financiamento', 'aprovado', 'entrada'];
  highIntentKeywords.forEach(word => {
    if (normalizedText.includes(word)) score += 10;
  });

  // Palavras-chave de BAIXA intenção/Curiosidade (- Pontos ou pouco aumento)
  const lowIntentKeywords = ['como funciona', 'alguém sabe', 'dúvida', 'opinião'];
  lowIntentKeywords.forEach(word => {
    if (normalizedText.includes(word)) score -= 5;
  });

  // Detecção de Preço (Aumenta muito o score, pois indica orçamento definido)
  // Regex simples para capturar valores como "500k", "500.000", "500 mil"
  const priceRegex = /(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(k|mil|milhões|m)/i;
  const priceMatch = text.match(priceRegex);
  
  let price_min, price_max;

  if (priceMatch) {
    score += 25; // Bônus por ter orçamento
    // Lógica simplificada de extração de valor para o MVP
    // Num cenário real, isso seria bem mais complexo
  }

  // Normalização do Score (Max 100, Min 0)
  score = Math.min(100, Math.max(0, score));

  // Definição do Label
  let label: 'Quente' | 'Morno' | 'Curioso' = 'Curioso';
  if (score >= 70) label = 'Quente';
  else if (score >= 40) label = 'Morno';

  return {
    score,
    label,
    price_min,
    price_max
  };
}
