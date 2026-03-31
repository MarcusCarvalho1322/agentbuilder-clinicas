// Validador inteligente de campos do onboarding

const WEEKDAY_KEYWORDS = [
  'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo',
  'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom',
  'manhã', 'tarde', 'noite', '8h', '9h', '10h', '14h', '15h', '16h',
  'horário', 'agenda', 'semana', 'quinzenal', 'mensal'
]

const HEALTH_PLAN_ANTIPATTERNS = [
  ...WEEKDAY_KEYWORDS,
  'r$', 'reais', 'valor', 'consulta', 'sessão', 'procedimento',
  'nome', 'especialidade', 'médico', 'doutora', 'doutor', 'dr.', 'dra.'
]

const SCHEDULE_ANTIPATTERNS = [
  'r$', 'reais', 'cnpj', 'email', '@', 'telefone', '(11)', '(21)',
  'especialidade', 'convênio', 'plano'
]

export type ValidationState = 'valid' | 'incomplete' | 'error' | 'optional'

export interface FieldValidation {
  state: ValidationState
  message?: string
}

// Detecta se texto de convênio contém padrões de agenda (erro de campo)
export function validateConvenioField(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Campo obrigatório' }
  }
  const lower = value.toLowerCase()
  const found = HEALTH_PLAN_ANTIPATTERNS.find(kw => lower.includes(kw))
  if (found) {
    return {
      state: 'error',
      message: `Parece que você inseriu informações de ${
        WEEKDAY_KEYWORDS.includes(found) ? 'agenda/horário' : 'outro tipo'
      } neste campo. Por favor, insira apenas nomes de convênios/planos de saúde.`
    }
  }
  if (value.trim().length < 3) {
    return { state: 'incomplete', message: 'Nome de convênio muito curto' }
  }
  return { state: 'valid' }
}

// Detecta se campo de agenda contém dados errados
export function validateScheduleField(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Campo obrigatório' }
  }
  const lower = value.toLowerCase()
  const found = SCHEDULE_ANTIPATTERNS.find(kw => lower.includes(kw))
  if (found) {
    return {
      state: 'error',
      message: `Este campo é para informações de agenda/horário. Parece que você inseriu "${found}" — verifique se não deveria preencher outro campo.`
    }
  }
  return { state: 'valid' }
}

// Valida campo de preço
export function validatePriceField(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Informe o valor' }
  }
  const numeric = value.replace(/[R$\s.,]/g, '')
  if (isNaN(Number(numeric)) || Number(numeric) <= 0) {
    return {
      state: 'error',
      message: 'Valor inválido. Use formato: 250,00 ou 250'
    }
  }
  return { state: 'valid' }
}

// Valida número de WhatsApp brasileiro
export function validateWhatsApp(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Campo obrigatório' }
  }
  const digits = value.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) {
    return {
      state: 'error',
      message: 'Número inválido. Use DDD + número (ex: 65999991234)'
    }
  }
  return { state: 'valid' }
}

// Valida faixa etária
export function validateAgeRange(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Informe a faixa etária' }
  }
  const lower = value.toLowerCase()
  const hasAgeIndicator =
    /\d/.test(value) ||
    lower.includes('todas') ||
    lower.includes('todo') ||
    lower.includes('qualquer') ||
    lower.includes('all') ||
    lower.includes('adulto') ||
    lower.includes('criança') ||
    lower.includes('idoso') ||
    lower.includes('infantil') ||
    lower.includes('pediátric')
  if (!hasAgeIndicator) {
    return {
      state: 'error',
      message: 'Indique a faixa etária. Ex: "A partir de 12 anos", "Todas as idades", "0 a 17 anos"'
    }
  }
  return { state: 'valid' }
}

// Valida campos de texto obrigatórios simples
export function validateRequired(value: string, minLength = 2): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { state: 'incomplete', message: 'Campo obrigatório' }
  }
  if (value.trim().length < minLength) {
    return { state: 'incomplete', message: `Mínimo de ${minLength} caracteres` }
  }
  return { state: 'valid' }
}

// Valida seção de profissionais (precisa ter pelo menos 1)
export function validateProfessionalsSection(professionals: unknown[]): FieldValidation {
  if (!professionals || professionals.length === 0) {
    return { state: 'incomplete', message: 'Adicione pelo menos um profissional' }
  }
  return { state: 'valid' }
}

// Status geral de uma seção com base em múltiplos campos
export function getSectionStatus(fields: FieldValidation[]): ValidationState {
  if (fields.some(f => f.state === 'error')) return 'error'
  if (fields.some(f => f.state === 'incomplete')) return 'incomplete'
  return 'valid'
}

// Ícone visual por estado
export function getStatusIcon(state: ValidationState): string {
  const icons: Record<ValidationState, string> = {
    valid: '✅',
    incomplete: '⚠️',
    error: '❌',
    optional: '○'
  }
  return icons[state]
}

// Cor por estado (Tailwind classes)
export function getStatusColor(state: ValidationState): string {
  const colors: Record<ValidationState, string> = {
    valid: 'text-green-600 bg-green-50 border-green-200',
    incomplete: 'text-amber-600 bg-amber-50 border-amber-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    optional: 'text-gray-400 bg-gray-50 border-gray-200'
  }
  return colors[state]
}
