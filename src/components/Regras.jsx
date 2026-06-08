import React from 'react';
import { Trophy, Star, Target, TrendingUp, Users, HelpCircle } from 'lucide-react';

const rules = [
  {
    points: 10,
    label: 'Placar Exato',
    icon: '⭐',
    color: 'var(--accent-gold)',
    glow: 'rgba(245,158,11,0.15)',
    description: 'Acertou exatamente o placar final.',
    example: { guess: '2 x 1', result: '2 x 1' },
  },
  {
    points: 7,
    label: 'Vencedor + Saldo de Gols',
    icon: '🎯',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    description: 'Acertou quem venceu e a diferença de gols, mas errou o placar exato.',
    example: { guess: '3 x 1', result: '2 x 0' },
  },
  {
    points: 5,
    label: 'Vencedor + Gols de 1 Time',
    icon: '✅',
    color: 'var(--accent-green)',
    glow: 'rgba(16,185,129,0.15)',
    description: 'Acertou quem venceu e os gols de pelo menos um dos times.',
    example: { guess: '2 x 1', result: '2 x 0' },
  },
  {
    points: 5,
    label: 'Empate (não exato)',
    icon: '🤝',
    color: 'var(--accent-blue)',
    glow: 'rgba(59,130,246,0.15)',
    description: 'Acertou que seria empate, mas errou o placar exato.',
    example: { guess: '1 x 1', result: '2 x 2' },
  },
  {
    points: 3,
    label: 'Vencedor Apenas',
    icon: '👍',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    description: 'Acertou quem venceu, mas errou placar, saldo e gols individuais.',
    example: { guess: '2 x 1', result: '3 x 2' },
  },
  {
    points: 0,
    label: 'Erro Total',
    icon: '❌',
    color: 'var(--error)',
    glow: 'rgba(239,68,68,0.08)',
    description: 'Errou o vencedor ou acertou o empate sendo que houve vencedor.',
    example: { guess: '2 x 0', result: '0 x 1' },
  },
];

const tiebreakers = [
  { icon: '🏅', label: 'Maior pontuação total' },
  { icon: '⭐', label: 'Maior quantidade de placares exatos (10 pts)' },
];

export default function Regras() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.05) 100%)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Regras de Pontuação</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Os pontos são calculados automaticamente após o encerramento de cada jogo,
          baseados nos <strong>90 minutos regulares</strong> (incluindo acréscimos).
          <br />Prorrogação e pênaltis <strong>não</strong> são considerados.
        </p>
      </div>

      {/* Tabela de Pontuação */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1.1rem' }}>
          <Trophy size={20} color="var(--accent-gold)" />
          Tabela de Pontos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rules.map((rule) => (
            <div
              key={rule.points + rule.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: rule.glow,
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${rule.color}33`,
                flexWrap: 'wrap',
              }}
            >
              {/* Badge de Pontos */}
              <div style={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '12px',
                background: `${rule.color}22`,
                border: `2px solid ${rule.color}55`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{rule.icon}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: rule.color, marginTop: '2px' }}>
                  {rule.points} pts
                </span>
              </div>

              {/* Descrição */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: '700', color: rule.color, fontSize: '0.95rem', marginBottom: '3px' }}>
                  {rule.label}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {rule.description}
                </div>
              </div>

              {/* Exemplo */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exemplo</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Palpite:</span>
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '0.9rem' }}>{rule.example.guess}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Resultado:</span>
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '0.9rem', color: rule.color }}>{rule.example.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critérios de Desempate */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
          <TrendingUp size={20} color="var(--accent-blue)" />
          Critérios de Desempate
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px' }}>
          Em caso de empate na pontuação total, os critérios abaixo são aplicados em ordem:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tiebreakers.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-blue)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '0.9rem' }}>{t.icon} {t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regras Gerais */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
          <HelpCircle size={20} color="var(--accent-green)" />
          Regras Gerais
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
          {[
            '⏰ Os palpites ficam bloqueados a partir da data e hora do início do jogo (ou prazo definido pelo admin).',
            '🔒 Após o prazo, nenhum palpite pode ser feito ou alterado para aquela partida.',
            '👀 Os palpites dos outros participantes ficam visíveis apenas após o início do jogo — ninguém pode copiar!',
            '🤖 A pontuação é calculada automaticamente quando o administrador lança o placar final.',
            '📊 O ranking é atualizado em tempo real assim que os resultados são lançados.',
            '⚽ Os cálculos consideram apenas os 90 minutos regulares (+ acréscimos). Prorrogação e pênaltis não contam.',
          ].map((rule, i) => (
            <li key={i} style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.1)', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Participantes */}
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <Users size={20} color="var(--accent-green)" style={{ marginBottom: '8px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Dúvidas ou sugestões? Fala com o administrador do bolão. Boa sorte! 🏆
        </p>
      </div>
    </div>
  );
}
