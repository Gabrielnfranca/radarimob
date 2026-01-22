
import { supabase } from './config/supabase';

async function checkData() {
  console.log("🔍 Verificando integridade dos dados...");

  // 1. Check Sources
  const { data: sources } = await supabase.from('sources').select('*');
  console.log('Sources:', sources);

  // 2. Check Locations
  const { data: locations } = await supabase.from('locations').select('*');
  console.log('Locations:', locations);

  // 3. Check Signals and their relation
  const { data: signals } = await supabase
    .from('intent_signals')
    .select(`
      id,
      raw_content,
      source_id,
      location_id,
      source:sources(name),
      locations(neighborhood)
    `)
    .order('posted_at', { ascending: false })
    .limit(5);

  console.log('Recent Signals:', JSON.stringify(signals, null, 2));
}

checkData();
