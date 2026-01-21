# RadarImob - MVP

Sistema SaaS de inteligência imobiliária que identifica sinais públicos de intenção de compra para corretores de imóveis.

## 🚀 Estrutura do Projeto

O projeto é dividido em duas partes principais:

- **`/frontend`**: Aplicação Next.js (Dashboard para corretores).
- **`/backend`**: API Node.js + Worker de Coleta de Dados.
- **`/database`**: Scripts SQL para configuração do Supabase.

---

## 🛠️ Configuração Inicial

### 1. Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Vá até o `SQL Editor` no painel do Supabase.
3. Copie o conteúdo do arquivo `database/schema.sql` e execute.
4. Isso criará as tabelas: `profiles`, `locations`, `sources`, `intent_signals` e `saved_signals`.

### 2. Variáveis de Ambiente

Você precisa configurar as credenciais do Supabase.

**Backend:**
1. Renomeie ou edite o arquivo `backend/.env`.
2. Preencha:
   ```env
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_SERVICE_KEY=sua_service_role_key (ATENÇÃO: Use a chave 'service_role', não a 'anon')
   ```

**Frontend:**
1. Renomeie ou edite o arquivo `frontend/.env.local`.
2. Preencha:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   ```

---

## ▶️ Como Rodar

Recomendo abrir dois terminais separados.

### Terminal 1: Backend (API + Worker)

O backend irá rodar na porta **3001**. Ele iniciará a API e também o simulador de coleta de dados (Mock Scraper).

```bash
cd backend
npm install  # Se ainda não instalou
npm run dev
```

### Terminal 2: Frontend (Dashboard)

O frontend irá rodar na porta **3000**.

```bash
cd frontend
npm install  # Se ainda não instalou
npm run dev
```

Acesse o sistema em: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Arquitetura Simplificada

1. **Coleta:** O `worker.ts` no backend gera/coleta leads e salva na tabela `intent_signals` usando a `SERVICE_KEY`.
2. **Leitura:** O frontend consulta esses sinais via API ou diretamente pelo Supabase Client (usando `ANON_KEY` e RLS).
3. **Segurança:** As regras RLS (Row Level Security) no banco garantem que usuários só vejam o que é público ou o que pertence a eles.

## 🧪 Dados de Teste

O Backend possui um "Mock Scraper" que gera leads fictícios a cada 10 segundos para testar o fluxo sem precisar de dados reais da internet neste momento. Verifique o console do backend para ver os logs de "Novo sinal detectado".
