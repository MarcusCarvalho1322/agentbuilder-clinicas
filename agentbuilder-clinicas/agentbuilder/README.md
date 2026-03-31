# AgentBuilder.IA — Clínicas
## Guia Completo de Deploy

---

## Stack
- **Frontend + API:** Next.js 14 → Vercel
- **Banco de Dados:** Neon PostgreSQL
- **Processamento uploads/geração:** Railway (se necessário para jobs pesados)
- **Automações:** n8n
- **IA:** Claude API (Anthropic)

---

## 1. Banco de Dados (Neon)

1. Acesse https://neon.tech e crie um projeto chamado `agentbuilder`
2. No SQL Editor, execute o conteúdo de `schema.sql`
3. Copie a connection string: `postgresql://user:pass@ep-xxx.neon.tech/agentbuilder?sslmode=require`

---

## 2. Deploy no Vercel

```bash
# Clone o repositório
git clone https://github.com/MarcusCarvalho1322/agentbuilder-clinicas
cd agentbuilder-clinicas

# Instale dependências localmente (para testar)
npm install

# Configure variáveis de ambiente no Vercel Dashboard:
# Settings > Environment Variables
```

### Variáveis de Ambiente (Vercel)

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Connection string do Neon |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |
| `ADMIN_SECRET` | Senha forte para o painel admin |
| `NEXT_PUBLIC_APP_URL` | https://agentbuilder.seudominio.com.br |
| `N8N_WEBHOOK_COMPLETED` | URL do webhook n8n (onboarding concluído) |
| `N8N_WEBHOOK_NEW` | URL do webhook n8n (novo onboarding criado) |
| `TEAM_EMAIL` | Email da equipe BIZZ.IA |
| `TEAM_WHATSAPP` | WhatsApp da equipe (com DDI, ex: 5565999991234) |

---

## 3. Fluxo n8n — Novo Onboarding

Trigger: Webhook POST em `/webhook/onboarding-new`
Payload recebido:
```json
{
  "token": "abc123",
  "client_name": "Maria Silva",
  "client_email": "maria@clinica.com.br",
  "link": "https://agentbuilder.bizzia.com.br/onboarding/abc123"
}
```

Ações sugeridas no n8n:
1. Enviar email para `client_email` com o link
2. Enviar WhatsApp para `TEAM_WHATSAPP` informando novo cliente
3. (Opcional) Criar card no Trello/Notion

---

## 4. Fluxo n8n — Onboarding Concluído

Trigger: Webhook POST em `/webhook/onboarding-completed`
Payload recebido:
```json
{
  "token": "abc123",
  "clinic_name": "ProntoMED",
  "client_email": "contato@prontomed.com.br",
  "generated_at": "2025-06-01T14:30:00Z",
  "admin_url": "https://agentbuilder.bizzia.com.br/admin/dashboard/uuid-aqui"
}
```

Ações sugeridas no n8n:
1. Enviar WhatsApp para `TEAM_WHATSAPP`: "🎉 Novo agente gerado! Cliente: [clinic_name]. Ver docs: [admin_url]"
2. Enviar email para equipe com o link do painel
3. Enviar email para `client_email` informando que está em revisão

---

## 5. Painel Admin

Acesse: `https://seudominio.com.br/admin/dashboard`
Senha: valor definido em `ADMIN_SECRET`

Funcionalidades:
- Criar novo onboarding (gera token e link)
- Ver todos os clientes e status
- Acessar documentos gerados
- Copiar e baixar documentos individuais ou pacote completo

---

## 6. Criar primeiro onboarding (teste)

1. Acesse o painel admin
2. Clique em "Novo Cliente"
3. Preencha nome e email (opcional)
4. Copie o link gerado
5. Abra o link em aba anônima para simular o cliente
6. Preencha todas as etapas e gere os documentos
7. Volte ao painel admin e verifique os documentos gerados

---

## 7. Domínio personalizado

No Vercel:
1. Settings > Domains
2. Adicione: `agentbuilder.bizzia.com.br` (ou o domínio que preferir)
3. Configure o CNAME no seu DNS provider

---

## Atualização de dados

Para atualizar informações da plataforma (novos campos, ajustes de validação):
- **Regras do formulário:** editar componentes em `src/components/onboarding/steps/`
- **Prompt do Claude:** editar `src/lib/claude.ts`
- **Validações:** editar `src/lib/validators.ts`
- **Schema do banco:** rodar nova migration no Neon SQL Editor

---

## Estrutura de arquivos

```
agentbuilder/
├── schema.sql                          # Schema do banco Neon
├── src/
│   ├── app/
│   │   ├── onboarding/[token]/         # Interface do cliente
│   │   │   ├── page.tsx                # Formulário principal (8 etapas)
│   │   │   └── complete/page.tsx       # Tela de conclusão
│   │   ├── admin/dashboard/            # Painel da equipe BIZZ.IA
│   │   │   ├── page.tsx                # Lista de onboardings
│   │   │   └── [id]/page.tsx           # Detalhes + documentos gerados
│   │   └── api/
│   │       ├── onboarding/[token]/     # GET + PATCH dados
│   │       │   ├── upload/             # POST upload de arquivo
│   │       │   └── generate/           # POST gerar documentos
│   │       └── admin/onboardings/      # GET lista + POST criar
│   │           └── [id]/              # GET detalhes + PATCH status
│   ├── components/onboarding/
│   │   ├── StepIndicator.tsx           # Barra de progresso com ✅⚠️❌
│   │   ├── FieldWrapper.tsx            # Campo com label, hint e exemplos
│   │   ├── FileUpload.tsx              # Upload drag & drop
│   │   └── steps/                     # Etapas 0-8 do formulário
│   └── lib/
│       ├── db.ts                       # Conexão Neon
│       ├── claude.ts                   # Engine de geração IA
│       ├── extractText.ts              # Extração de PDF/DOCX/XLSX
│       └── validators.ts               # Validação inteligente de campos
```
