-- AgentBuilder.IA — Clínicas
-- Schema para Neon PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessões de onboarding
CREATE TABLE onboardings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token         TEXT UNIQUE NOT NULL,           -- token único enviado ao cliente
  client_email  TEXT,
  client_name   TEXT,
  clinic_name   TEXT,
  status        TEXT NOT NULL DEFAULT 'in_progress',
  -- status: in_progress | completed | generating | generated | delivered
  current_step  INT NOT NULL DEFAULT 0,
  data          JSONB NOT NULL DEFAULT '{}',    -- todos os dados do formulário
  validation    JSONB NOT NULL DEFAULT '{}',    -- status de validação por seção
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  generated_at  TIMESTAMPTZ
);

-- Uploads de documentos
CREATE TABLE uploads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id   UUID NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  original_name   TEXT NOT NULL,
  description     TEXT NOT NULL,
  file_type       TEXT NOT NULL,    -- pdf | docx | xlsx | image | other
  extracted_text  TEXT,             -- texto extraído do documento
  file_size       INT,
  upload_section  TEXT,             -- qual seção do formulário (convenios, profissionais, etc)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documentos gerados pelo Claude
CREATE TABLE generated_documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id  UUID NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  doc_type       TEXT NOT NULL,
  -- bloco1_master_prompt | bloco2_knowledge_base | message_library | handoff_template | quality_report
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  format         TEXT NOT NULL DEFAULT 'txt',  -- txt | md | json
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_onboardings_token ON onboardings(token);
CREATE INDEX idx_onboardings_status ON onboardings(status);
CREATE INDEX idx_uploads_onboarding ON uploads(onboarding_id);
CREATE INDEX idx_docs_onboarding ON generated_documents(onboarding_id);

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboardings_updated_at
  BEFORE UPDATE ON onboardings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
