import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export interface OnboardingData {
  // Step 0 - Perfil
  profile: {
    uses_convenios: boolean
    has_multiple_professionals: boolean
    clinic_type: 'routine' | 'elective' | 'both'
  }
  // Step 1 - Identidade
  identity: {
    clinic_name: string
    trade_name?: string
    cnpj?: string
    address: string
    operating_hours: string
    patient_whatsapp: string
    reception_whatsapp: string
    agent_persona_name: string
    voice_tone: 'formal' | 'balanced' | 'friendly' | 'casual'
    website?: string
    social_media?: string
  }
  // Step 2 - Convênios
  convenios: {
    list: string          // texto livre ou extraído do documento
    special_rules: string // regras especiais em texto livre
    uploads_summary?: string // texto extraído dos uploads de convênio
  }
  // Step 3 - Profissionais
  professionals: Array<{
    name: string
    specialty: string
    age_range: string
    schedule_type: 'stable' | 'variable'
    schedule_days?: string
    schedule_time?: string
    schedule_interval?: string
    schedule_variable_rule?: string
    schedule_is_biweekly?: boolean
    convenios_rule: string  // "todos" | "somente: X" | "todos exceto: X"
    price_pix: string
    price_card: string
    accepts_card: boolean
    special_rules: string   // texto livre com todas as flags
  }>
  // Step 4 - Exames e Procedimentos
  exams: {
    has_lab: boolean
    lab_hours?: string
    lab_convenios?: string
    lab_price_table?: string
    has_imaging: boolean
    imaging_description?: string
    procedures?: string
    preparation_protocols?: string
    uploads_summary?: string
  }
  // Step 5 - Pagamento
  payment: {
    installment_table: string
    accepted_methods: string
    special_rules?: string
  }
  // Step 6 - Documentos
  documents_summary: string  // textos extraídos de todos os uploads

  // Step 7 - Conversas (opcional)
  faq_extracted?: string

  // Metadata
  generated_at: string
}

const GENERATION_SYSTEM_PROMPT = `Você é um especialista sênior em engenharia de prompts e documentação técnica de agentes de IA para clínicas médicas brasileiras.

Você vai receber dados estruturados de uma clínica coletados via formulário de onboarding. Sua missão é gerar 5 documentos profissionais que serão usados para configurar o agente de atendimento via WhatsApp desta clínica.

REGRAS ABSOLUTAS DE GERAÇÃO:
1. Use APENAS os dados fornecidos. Nunca invente informações.
2. Se um dado estiver ausente, use placeholders claros: [INFORMAÇÃO PENDENTE].
3. Adapte a linguagem ao tom de voz escolhido pela clínica.
4. Nunca nomeie convênios específicos além dos informados pelo cliente.
5. O agente nunca deve dar orientação médica, prometer vagas ou confirmar cobertura de convênio incerta.
6. Identifique e sinalize explicitamente no Relatório de Qualidade qualquer dado inconsistente ou ausente.

FORMATO DE SAÍDA:
Retorne um JSON com exatamente esta estrutura:
{
  "bloco1_master_prompt": "<conteúdo completo>",
  "bloco2_knowledge_base": "<conteúdo completo>",
  "message_library": "<conteúdo completo>",
  "handoff_template": "<conteúdo completo>",
  "quality_report": "<conteúdo completo>"
}

Não inclua nada além do JSON. Sem markdown, sem explicações fora do JSON.`

export async function generateDocuments(data: OnboardingData): Promise<{
  bloco1_master_prompt: string
  bloco2_knowledge_base: string
  message_library: string
  handoff_template: string
  quality_report: string
}> {
  const voiceToneMap = {
    formal: 'formal e profissional, com "senhor/senhora", sem emojis, linguagem técnica',
    balanced: 'equilibrado, próximo com certa formalidade, emojis moderados apenas em acolhimentos',
    friendly: 'caloroso e próximo, emojis em momentos chave, linguagem simples e acessível',
    casual: 'muito próximo e descontraído, emojis frequentes, linguagem do dia a dia'
  }

  const userPrompt = `
Gere os 5 documentos do agente de atendimento WhatsApp para a seguinte clínica:

=== PERFIL DA CLÍNICA ===
Usa convênios: ${data.profile.uses_convenios ? 'Sim' : 'Não'}
Múltiplos profissionais: ${data.profile.has_multiple_professionals ? 'Sim' : 'Não'}
Tipo de atendimento: ${data.profile.clinic_type === 'routine' ? 'Consultas de rotina' : data.profile.clinic_type === 'elective' ? 'Procedimentos eletivos de alto ticket' : 'Ambos'}

=== IDENTIDADE ===
Nome da clínica: ${data.identity.clinic_name}
${data.identity.trade_name ? `Nome fantasia: ${data.identity.trade_name}` : ''}
${data.identity.cnpj ? `CNPJ: ${data.identity.cnpj}` : ''}
Endereço: ${data.identity.address}
Funcionamento da recepção: ${data.identity.operating_hours}
WhatsApp pacientes: ${data.identity.patient_whatsapp}
WhatsApp recepção interna (handoff): ${data.identity.reception_whatsapp}
Nome da persona do agente: ${data.identity.agent_persona_name}
Tom de voz: ${voiceToneMap[data.identity.voice_tone]}
${data.identity.website ? `Site: ${data.identity.website}` : ''}
${data.identity.social_media ? `Redes: ${data.identity.social_media}` : ''}

=== CONVÊNIOS ===
${data.convenios.list || '[NÃO INFORMADO]'}
Regras especiais de convênio:
${data.convenios.special_rules || 'Nenhuma regra especial informada'}
${data.convenios.uploads_summary ? `\nInformações extraídas de documentos:\n${data.convenios.uploads_summary}` : ''}

=== PROFISSIONAIS ===
${data.professionals.map((p, i) => `
--- Profissional ${i + 1} ---
Nome: ${p.name}
Especialidade: ${p.specialty}
Faixa etária: ${p.age_range}
Grupo de agenda: ${p.schedule_type === 'stable' ? 'A (estável)' : 'B (variável)'}
${p.schedule_type === 'stable' ? `
Dias: ${p.schedule_days || '[PENDENTE]'}
Horário: ${p.schedule_time || '[PENDENTE]'}
Intervalo: ${p.schedule_interval || 'ordem de chegada'}
Quinzenal: ${p.schedule_is_biweekly ? 'Sim' : 'Não'}
` : `Regra de comunicação de datas: ${p.schedule_variable_rule || '[PENDENTE]'}`}
Convênios: ${p.convenios_rule || '[PENDENTE]'}
Particular PIX/espécie: ${p.price_pix || '[PENDENTE]'}
Particular cartão: ${p.accepts_card ? (p.price_card || '[PENDENTE]') : 'NÃO ACEITA CARTÃO'}
Regras especiais: ${p.special_rules || 'Nenhuma'}
`).join('\n')}

=== EXAMES E PROCEDIMENTOS ===
Laboratório: ${data.exams.has_lab ? 'Sim' : 'Não'}
${data.exams.has_lab ? `Horário do posto: ${data.exams.lab_hours || '[PENDENTE]'}
Convênios do laboratório: ${data.exams.lab_convenios || '[PENDENTE]'}
Tabela de valores laboratório: ${data.exams.lab_price_table || '[PENDENTE]'}` : ''}

Imagem/USG: ${data.exams.has_imaging ? 'Sim' : 'Não'}
${data.exams.has_imaging ? `Descrição: ${data.exams.imaging_description || '[PENDENTE]'}` : ''}

Procedimentos especiais: ${data.exams.procedures || 'Nenhum informado'}
Protocolos de preparo: ${data.exams.preparation_protocols || 'Nenhum informado'}
${data.exams.uploads_summary ? `\nInformações de documentos anexados:\n${data.exams.uploads_summary}` : ''}

=== PAGAMENTO ===
Tabela de parcelamento:
${data.payment.installment_table || '[NÃO INFORMADO]'}
Formas aceitas: ${data.payment.accepted_methods || '[NÃO INFORMADO]'}
${data.payment.special_rules ? `Regras especiais: ${data.payment.special_rules}` : ''}

=== DOCUMENTOS COMPLEMENTARES ENVIADOS ===
${data.documents_summary || 'Nenhum documento complementar enviado'}

${data.faq_extracted ? `=== FAQ EXTRAÍDO DAS CONVERSAS ===\n${data.faq_extracted}` : ''}

Data de geração: ${data.generated_at}

---

INSTRUÇÕES ESPECÍFICAS POR DOCUMENTO:

BLOCO 1 (Master Prompt):
- Regras completas de comportamento do agente
- Fluxo de atendimento (recepção → triagem → convênio → agenda → handoff)
- Regras absolutas (o que o agente nunca deve fazer)
- Palavras-gatilho de urgência e escalada
- Protocolo de handoff
- Instrução de sinalização [HANDOFF] e [ESCALADA] para o sistema de roteamento
- Adaptar todo o tom ao perfil escolhido

BLOCO 2 (Base de Conhecimento):
- Todos os dados da clínica em formato consultável
- Seção por seção: convênios, profissionais, exames, pagamento
- Cada profissional com todos os campos em formato estruturado
- Legendas claras (Grupo A / B)
- Flags especiais destacadas

BIBLIOTECA DE MENSAGENS:
- Mínimo 3 variações por cenário
- Cenários: abertura novo paciente, abertura recorrente, coleta dados, validação positiva convênio, convênio não atendido, fora de horário, urgência, dúvida clínica, fora de escopo, handoff, despedida
- Tom adaptado ao perfil da clínica

TEMPLATE DE HANDOFF:
- Template estruturado para envio à recepção
- Campos: nome, WhatsApp, idade, serviço, convênio, agenda, flags, horário
- Template de escalada imediata separado
- Glossário de flags

RELATÓRIO DE QUALIDADE:
- O que foi gerado com dados completos
- O que tem [INFORMAÇÃO PENDENTE] e qual impacto no agente
- Inconsistências detectadas
- Estimativa de tempo para revisão pela equipe
- Checklist do que fazer antes de ativar em produção
`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    system: GENERATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(text)
    return parsed
  } catch {
    // Fallback: tentar extrair JSON do texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Claude retornou resposta em formato inválido')
  }
}
