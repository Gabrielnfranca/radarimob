"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { CardLead } from '@/components/CardLead';
import { FilterBar } from '@/components/FilterBar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User, RefreshCw, Bell } from 'lucide-react';

// ... MOCK_LEADS refinado para COMPRADORES ...
const MOCK_LEADS = [
  {
    id: 1,
    raw_content: "Tenho carta de crédito aprovada de 500k, procuro apartamento na região da Vila Mariana ou Saúde. Urgente.",
    author_name: "Ana Silva",
    source: { name: "Grupo Facebook: Vizinhos Vila Mariana", platform: "Facebook" },
    source_name_captured: "Vizinhos Vila Mariana",
    locations: { neighborhood: "Vila Mariana", region: "Zona Sul", city: "São Paulo" },
    classification: { label: 'Quente' as const, score: 95 },
    url_original: "https://facebook.com/groups/123/posts/456",
    computed_permalink: "https://facebook.com/groups/123/posts/456",
    posted_at: new Date().toISOString(),
  },
  {
    id: 2,
    raw_content: "Quero sair do aluguel. Estou buscando studio ou 1 dormitório próximo ao metrô. Tenho 80k de entrada.",
    author_name: "Carlos Eduardo",
    source: { name: "Investidores SP", platform: "Reddit" },
    source_name_captured: null,
    locations: { neighborhood: "Centro", region: "Centro", city: "São Paulo" },
    classification: { label: 'Quente' as const, score: 85 },
    url_original: "https://reddit.com",
    computed_permalink: null, // Testando sem link
    posted_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 4,
    raw_content: "Procuro cobertura duplex no Tatuapé. Tenho interesse imediato se o valor for justo. Alguma indicação?",
    author_name: "Roberto Justos",
    source: { name: "Tatuapé News", platform: "Instagram" },
    source_name_captured: "Post de Comentário",
    locations: { neighborhood: "Tatuapé", region: "Zona Leste", city: "São Paulo" },
    classification: { label: 'Quente' as const, score: 92 },
    url_original: null, // Alerta sem link direto
    computed_permalink: null, 
    posted_at: new Date(Date.now() - 1500000).toISOString(),
  }
];

// Simulador de Fetcher usando Supabase Real com Fallback para Mock
const fetcher = async () => {
  try {
    const { data, error } = await supabase
      .from('intent_signals')
      .select(`
        *,
        source:sources(name, platform),
        locations(neighborhood, region, city)
      `)
      .order('posted_at', { ascending: false })
      .limit(50);

    // Se der erro (ex: tabela não existe) ou vier vazio, retorna MOCK
    if (error || !data || data.length === 0) {
      console.log("ℹ️ Modo de Demonstração: Usando dados Mockados (Banco vazio ou offline)");
      // Simula um delay de rede para parecer real
      await new Promise(r => setTimeout(r, 800));
      return MOCK_LEADS;
    }
  
    // Tratamento dos dados reais
    return data.map((item: any) => {
      // Extrair Metadados do corpo (Compatibility Mode / Snapshot Logic)
      let finalUrl = item.url_original;
      let finalContent = item.raw_content;
      let extractedAuthor = item.author_public_name;
      let extractedSource = item.source_name_captured;

      // Regex para extrair tags [Key: Value]
      const linkMatch = finalContent.match(/\[Link: (.*?)\]/);
      if (linkMatch) {
          finalUrl = linkMatch[1];
          finalContent = finalContent.replace(linkMatch[0], '').trim();
      }

      const authorMatch = finalContent.match(/\[Autor: (.*?)\]/);
      if (authorMatch) {
          extractedAuthor = authorMatch[1];
          finalContent = finalContent.replace(authorMatch[0], '').trim();
      }

      const sourceMatch = finalContent.match(/\[Origem: (.*?)\]/);
      if (sourceMatch) {
          extractedSource = sourceMatch[1];
          finalContent = finalContent.replace(sourceMatch[0], '').trim();
      }

      // Limpeza legada
      if (!finalUrl && finalContent.includes('🔗 Link Original: ')) {
          const parts = finalContent.split('🔗 Link Original: ');
          finalContent = parts[0].trim();
          finalUrl = parts[1].trim();
      }

      return {
        ...item,
        raw_content: finalContent,
        url_original: finalUrl,
        computed_permalink: item.computed_permalink || finalUrl, // Fallback para url antiga
        source_name_captured: extractedSource || item.source_name_captured,
        locations: Array.isArray(item.locations) ? item.locations[0] : item.locations,
        source: Array.isArray(item.source) ? item.source[0] : item.source,
        
        author_name: extractedAuthor || (item.source && item.source.platform === 'Reddit' ? 'Usuário do Reddit' : 'Usuário da Web'), 
        classification: { label: 'Quente', score: 90 } // Forçando score alto para teste visual
      };
    });

  } catch (err) {
    console.warn("⚠️ Erro de conexão, usando fallback mock:", err);
    return MOCK_LEADS;
  }
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState({ neighborhood: '', region: '', type: '' });

  // Configuração SWR para Polling
  const { data: leads, error, isValidating, mutate } = useSWR('alerts', fetcher, {
    refreshInterval: 15000, // Polling de backup
    revalidateOnFocus: false, 
  });

  // Assinatura Real-time do Supabase
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'intent_signals',
        },
        (payload) => {
          console.log('⚡ Atualização em Tempo Real recebida:', payload);
          // Força o SWR a buscar os dados novos imediatamente
          mutate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao canal de atualizações em tempo real.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
       if (session) setUser(session.user);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Filtragem no Frontend (Já que estamos usando Mock/SWR client-side por enquanto)
  const filteredLeads = leads?.filter(l => {
    const matchNeighborhood = filters.neighborhood ? l.locations.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase()) : true;
    const matchRegion = filters.region ? l.locations.region === filters.region : true;
    return matchNeighborhood && matchRegion;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Navbar Profissional */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 transition-shadow shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">R</div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">RadarImob</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 py-1.5 px-3 rounded-full border border-gray-200">
               {isValidating ? (
                 <RefreshCw size={14} className="animate-spin text-indigo-600" />
               ) : (
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               )}
               <span className="text-xs font-medium">
                 {isValidating ? 'Atualizando...' : 'Monitoramento Ativo'}
               </span>
            </div>
            
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            
            <button className="relative text-gray-500 hover:text-indigo-600 p-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500"></span>
            </button>

            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Sair">
                <LogOut size={20} />
            </button>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {user ? user.email[0].toUpperCase() : <User size={16} />}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feed de Oportunidades</h2>
            <p className="text-gray-500 mt-1">Sinais detectados e atualizados automaticamente.</p>
          </div>
          <div className="text-right">
             <button 
                onClick={() => mutate()} 
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 ml-auto"
             >
                <RefreshCw size={14} className={isValidating ? "animate-spin" : ""} /> Forçar atualização
             </button>
          </div>
        </div>

        <FilterBar onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))} />

        {!leads && !error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p>Conectando ao radar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLeads.map(lead => (
              <CardLead key={lead.id} lead={lead} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredLeads.length === 0 && leads && (
           <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-lg">
             <p className="text-gray-500 text-lg">Nenhum sinal encontrado com estes filtros.</p>
           </div>
        )}
      </main>
    </div>
  );
}
