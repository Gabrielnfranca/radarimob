// Dicionário Simplificado de Bairros de SP para o MVP
// Estrutura: Região -> Lista de Bairros e seus Aliases

export interface LocationMatch {
  location_id: number | null; // Simulado, pois IDs viriam do banco
  neighborhood: string;
  region: string;
  city: string;
}

// Simularemos IDs fixos para o MVP mapear corretamente
export const MOCK_LOCATIONS_DB: Record<string, number> = {
  // ZONA SUL
  'Vila Mariana': 1,
  'Moema': 2,
  'Ipiranga': 3,
  'Saúde': 4,
  'Brooklin': 5,
  'Zona Sul (Geral)': 991,
  
  // ZONA OESTE
  'Pinheiros': 10,
  'Vila Madalena': 11,
  'Perdizes': 12,
  'Zona Oeste (Geral)': 992,

  // ZONA LESTE
  'Tatuapé': 20,
  'Mooca': 21,
  'Zona Leste (Geral)': 993,

  // OUTROS
  'São Paulo (Geral)': 900
};

const LOCATION_DICTIONARY = [
  {
    region: 'Zona Sul',
    neighborhoods: [
      { name: 'Vila Mariana', aliases: ['vl mariana', 'vila mariana', 'klabin', 'chacara klabin', 'sta cruz'] },
      { name: 'Moema', aliases: ['moema', 'ibirapuera'] },
      { name: 'Ipiranga', aliases: ['ipiranga', 'museu'] },
      { name: 'Saúde', aliases: ['saude', 'praça da arvore', 'praca da arvore'] },
      { name: 'Brooklin', aliases: ['brooklin', 'campo belo'] }
    ]
  },
  {
    region: 'Zona Oeste',
    neighborhoods: [
      { name: 'Pinheiros', aliases: ['pinheiros', 'faria lima'] },
      { name: 'Vila Madalena', aliases: ['vila madalena', 'vl madalena'] },
      { name: 'Perdizes', aliases: ['perdizes', 'pompeia'] }
    ]
  },
  {
    region: 'Zona Leste',
    neighborhoods: [
      { name: 'Tatuapé', aliases: ['tatuape', 'analia franco'] },
      { name: 'Mooca', aliases: ['mooca'] }
    ]
  }
];

export function detectLocation(text: string): LocationMatch {
  const normalizedText = text.toLowerCase();
  
  // 1. Busca Exata de Bairro
  for (const region of LOCATION_DICTIONARY) {
    for (const hood of region.neighborhoods) {
      for (const alias of hood.aliases) {
        if (normalizedText.includes(alias)) {
          return {
            location_id: MOCK_LOCATIONS_DB[hood.name] || 0,
            neighborhood: hood.name,
            region: region.region,
            city: 'São Paulo'
          };
        }
      }
    }
  }

  // 2. Busca de Região (Fallback)
  if (normalizedText.includes('zona sul') || normalizedText.includes('zs')) {
    return { location_id: MOCK_LOCATIONS_DB['Zona Sul (Geral)'], neighborhood: 'Zona Sul (Geral)', region: 'Zona Sul', city: 'São Paulo' };
  }
  if (normalizedText.includes('zona oeste') || normalizedText.includes('zo')) {
    return { location_id: MOCK_LOCATIONS_DB['Zona Oeste (Geral)'], neighborhood: 'Zona Oeste (Geral)', region: 'Zona Oeste', city: 'São Paulo' };
  }
    if (normalizedText.includes('zona leste') || normalizedText.includes('zl')) {
    return { location_id: MOCK_LOCATIONS_DB['Zona Leste (Geral)'], neighborhood: 'Zona Leste (Geral)', region: 'Zona Leste', city: 'São Paulo' };
  }

  // 3. Default
  return {
    location_id: MOCK_LOCATIONS_DB['São Paulo (Geral)'],
    neighborhood: 'Indefinido',
    region: 'Indefinida',
    city: 'São Paulo'
  };
}
