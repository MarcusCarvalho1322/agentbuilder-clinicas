// Completion page
// src/app/onboarding/[token]/complete/page.tsx
export default function CompletePage() {
  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4">
      <div className="card max-w-lg w-full text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Pronto! Seu agente foi gerado.</h1>
          <p className="text-brand-mid mt-2 leading-relaxed">
            Nossa equipe já foi notificada e revisará os documentos gerados.
            Em breve entraremos em contato com você para os próximos passos da implementação.
          </p>
        </div>
        <div className="bg-brand-lteal rounded-2xl p-5 text-left space-y-3">
          <p className="font-bold text-brand-navy text-sm">O que acontece agora:</p>
          {[
            '✅ Documentos do agente gerados pela IA',
            '👀 Equipe BIZZ.IA revisa e valida (até 1 dia útil)',
            '🛠️ Configuração técnica do agente no WhatsApp',
            '🧪 Testes e validação com a sua equipe',
            '🚀 Ativação em produção',
          ].map((s, i) => (
            <div key={i} className="text-sm text-brand-dark">{s}</div>
          ))}
        </div>
        <p className="text-xs text-brand-mid">
          Dúvidas? Entre em contato com a equipe BIZZ.IA pelo WhatsApp informado no seu contrato.
        </p>
      </div>
    </div>
  )
}
