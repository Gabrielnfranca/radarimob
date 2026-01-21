import React from 'react';
import { ExternalLink, MapPin, Clock, DollarSign, MessageCircle } from 'lucide-react';

interface IntentSignal {
  id: number;
  raw_content: string;
  author_name: string; // Novo
  source: { name: string; platform: string };
  locations: { neighborhood: string; region: string; city: string };
  classification: { label: 'Quente' | 'Morno' | 'Curioso'; score: number }; // Novo
  url_original: string;
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all group">
      {/* Cabeçalho: Autor + Intenção */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
            {lead.author_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{lead.author_name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <span>{lead.source.platform}</span>
               <span>•</span>
               <span>{lead.source.name}</span>
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${intentColor}`}>
          🔥 {lead.classification.label}
        </span>
      </div>

      {/* Conteúdo do Post */}
      <div className="ml-13 pl-0 mb-4">
        <p className="text-gray-800 text-base leading-relaxed mb-3">
          "{lead.raw_content}"
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
             <span className="flex items-center gap-1"><Clock size={14} /> {dateFormatted}</span>
             {lead.locations.neighborhood && (
                 <span className="flex items-center gap-1 text-gray-600 font-medium">
                     <MapPin size={14} /> {lead.locations.neighborhood}, {lead.locations.region}
                 </span>
             )}
        </div>
      </div>

      {/* Ações e Tags Inferiores */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
        <div className="flex gap-2">
            {(lead.price_min || lead.price_max) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                <DollarSign size={14} /> 
                Orçamento detectado
            </span>
            )}
        </div>

        <div className="flex gap-3">
             <a 
              href={lead.url_original}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={16} /> Ver na Origem
            </a>
            <button 
              onClick={() => onSave && onSave(lead.id)}
              className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors flex items-center gap-2"
            >
              <MessageCircle size={16} /> Negociar
            </button>
        </div>
      </div>
    </div>
  );
};
