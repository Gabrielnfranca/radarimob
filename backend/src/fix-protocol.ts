
import { supabase } from './config/supabase';

async function fixDoubleProtocol() {
  console.log("🔧 Corrigindo links duplicados (https://https://)...");

  // Read all signals
  const { data: signals, error } = await supabase.from('intent_signals').select('*');
  
  if (error) {
     console.error("Erro ao ler:", error);
     return;
  }

  let count = 0;
  for (const signal of signals) {
    if (signal.raw_content && signal.raw_content.includes('https://https://')) {
        const newContent = signal.raw_content.replace('https://https://', 'https://');
        const { error: updateError } = await supabase
            .from('intent_signals')
            .update({ raw_content: newContent })
            .eq('id', signal.id);
        
        if (!updateError) {
            console.log(`✅ Corrigido sinal ${signal.id}`);
            count++;
        }
    }
  }
  
  console.log(`🏁 ${count} links corrigidos.`);
}

fixDoubleProtocol();
