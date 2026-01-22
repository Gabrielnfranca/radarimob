
import { supabase } from './config/supabase';

async function fixLinks() {
  console.log("🔧 Corrigindo links de teste para URLs reais...");

  const updates = [
    {
      match: 'facebook.com/groups/moema/123',
      replace: 'https://www.facebook.com/groups/193809634024452/', // Grupo real "Moema Dicas"
      name: 'Facebook Group (Moema)'
    },
    {
      match: 'reddit.com/r/investimentos/comments/xyz',
      replace: 'https://www.reddit.com/r/investimentos/search/?q=imoveis&restrict_sr=1', // Busca real
      name: 'Reddit Search'
    },
    {
      match: 'facebook.com/marketplace/item/123',
      replace: 'https://www.facebook.com/marketplace/saopaulo/propertyforsale', // Marketplace real
      name: 'Facebook Marketplace'
    }
  ];

  // Buscamos todos os sinais
  const { data: signals, error } = await supabase.from('intent_signals').select('*');

  if (error) {
    console.error("Erro ao buscar sinais:", error);
    return;
  }

  let count = 0;

  for (const signal of signals) {
    let newContent = signal.raw_content;
    let changed = false;

    // Verificar se tem link fake e substituir
    for (const up of updates) {
      if (newContent && newContent.includes(up.match)) {
        // Substitui apenas o link antigo pelo novo
        // O regex busca "Link: <url_antiga>" e troca
        // Mas como é raw_content, podemos fazer replace string direto se for unico
        newContent = newContent.replace(up.match, up.replace);
        changed = true;
      }
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from('intent_signals')
        .update({ raw_content: newContent })
        .eq('id', signal.id);
      
      if (!updateError) {
        console.log(`✅ Corrigido link para: ${signal.id}`);
        count++;
      }
    }
  }

  console.log(`🏁 Correção finalizada. ${count} links atualizados.`);
}

fixLinks();
