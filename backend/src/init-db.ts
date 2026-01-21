import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configurações de Conexão (Tentativa com a chave fornecida)
const client = new Client({
  host: 'db.kxerrdpvggcfzdluxbhz.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_SERVICE_KEY, // Tentando usar o segredo fornecido como senha
  database: 'postgres',
  ssl: { rejectUnauthorized: false } // Necessário para Supabase/Azure
});

async function runMigration() {
  try {
    console.log("🔌 Tentando conectar ao Banco de Dados...");
    await client.connect();
    console.log("✅ Conectado com sucesso!");

    // Ler o arquivo schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log("🛠️ Executando migração de tabelas...");
    await client.query(sql);

    console.log("✅ Tabelas criadas com sucesso!");
    
    // Inserir Source Mock se não existir
    console.log("🌱 Inserindo dados iniciais...");
    await client.query(`
      INSERT INTO public.sources (platform, name, base_url) 
      VALUES ('Facebook', 'Mock Group', 'https://facebook.com')
      ON CONFLICT DO NOTHING;
    `);

  } catch (err: any) {
    console.error("❌ Falha na migração:", err.message);
    if (err.message.includes('password authentication failed')) {
      console.log("⚠️ A chave fornecida não é a SENHA do banco de dados (Postgres).");
      console.log("⚠️ Ela pode ser uma API Key, que não serve para criar tabelas via conexão direta.");
    }
  } finally {
    await client.end();
  }
}

runMigration();
