import React from 'react';
import { ExternalLink, MapPin, Clock, DollarSign, MessageCircle, AlertTriangle } from 'lucide-react';

interface IntentSignal {
  id: number;
  raw_content: string;
  author_name: string; 
  source: { name: string; platform: string };
  locations: { neighborhood: string; region: string; city: string };
  classification: { label: 'Quente' | 'Morno' | 'Curioso'; score: number };
  url_original: string | null;
  computed_permalink?: string | null; // Novo: Link estável
  source_name_captured?: string | null; // Novo: Nome do grupo específico
  posted_at: string;
  price_min?: number;
  price_max?: number;
}

interface CardLeadProps {
  lead: IntentSignal;
  onSave?: (id: number) => void;
}

export const CardLead: React.FC<CardLeadProps> = ({ lead, onSave }) => {
  const dateFormatted = new Date(lead.posted_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  // Cores baseadas na intenção
  const intentColor = {
    'Quente': 'bg-red-100 text-red-700 border-red-200',
    'Morno': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Curioso': 'bg-blue-50 text-blue-600 border-blue-100'
  }[lead.classification.label] || 'bg-gray-100';

  // Lógica de Link Seguro
  const safeLink = lead.computed_permalink || lead.url_original;
  const hasLink = !!safeLink; // se null ou undefined, false

  const sourceName = lead.source_name_captured || lead.source.name;

  // Função para destacar palavras-chave
  const highlightKeywords = (text: string) => {
    const keywords = ['compro', 'procuro', 'apartamento', 'casa', ' studio', 'cobertura', 'comprar', 'interesse', 'quente'];
    let highlightedText = text;
    keywords.forEach(kw => {
        const regex = new RegExp(`(${kw})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-100 text-yellow-900 px-0.5 rounded font-bold">$1</span>');
    });
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group">
      {/* Cabeçalho: Autor + Intenção */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {lead.author_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{lead.author_name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <span className="font-medium text-gray-700">{lead.source.platform}</span>
               <span>•</span>
               <span title={sourceName} className="truncate max-w-[200px] italic">{sourceName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${intentColor}`}>
            {lead.classification.label === 'Quente' ? '🔥 Quente' : lead.classification.label}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Score: {lead.classification.score}%</span>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <div className="pl-0 mb-4 bg-gray-50/50 p-4 rounded-md border border-gray-100/50">
        <p className="text-gray-800 text-base leading-relaxed mb-3 font-medium">
          "{highlightKeywords(lead.raw_content)}"
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
             <span className="flex items-center gap-1"><Clock size={14} /> Detectado em {dateFormatted}</span>
             {lead.locations.neighborhood && (
                 <span className="flex items-center gap-1 text-indigo-600 font-bold">
                     <MapPin size={14} /> {lead.locations.neighborhood}
                 </span>
             )}
        </div>
      </div>

      {/* Ações e Tags Inferiores */}
      <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
            <div className="flex gap-2">
                {(lead.price_min || lead.price_max) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded tracking-wider">
                    <DollarSign size={12} /> 
                    Oportunidade
                </span>
                )}
                
                {!hasLink && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-100 tracking-wider">
                        <AlertTriangle size={12} /> 
                        Snapshot Ativo
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                {hasLink ? (
                <a 
                    href={safeLink!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <ExternalLink size={16} />
                    Ver Post Original
                </a>
                ) : (
                <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(lead.author_name + ' ' + (lead.source_name_captured || ''))}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                >
                    <MessageCircle size={16} />
                    Buscar Autor
                </a>
                )}
                
                <button 
                  onClick={() => onSave && onSave(lead.id)}
                  className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Salvar
                </button>
            </div>
        </div>

        {!hasLink && (
            <p className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded italic">
                Nota: Este alerta foi capturado via Snapshot. O link original pode ser dinâmico ou privado, mas o conteúdo foi preservado para sua análise.
            </p>
        )}
      </div>
    </div>
  );
};
