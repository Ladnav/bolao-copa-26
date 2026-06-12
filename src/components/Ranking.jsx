import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Star, Activity, X, ChevronDown } from 'lucide-react';

const renderFlag = (flag) => {
  if (!flag) return <span>🏳️</span>;
  if (flag.startsWith('http')) {
    return <img src={flag} alt="" style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }} />;
  }
  return <span>{flag}</span>;
};

const pointsLabel = (pts) => {
  if (pts === null || pts === undefined) return { icon: '⏳', label: 'Aguardando', color: 'var(--text-muted)' };
  if (pts === 10) return { icon: '⭐', label: 'Placar Exato', color: 'var(--accent-gold)' };
  if (pts === 7)  return { icon: '🎯', label: 'Venc+Saldo', color: '#a78bfa' };
  if (pts === 5)  return { icon: '✅', label: 'Venc+Gols / Empate', color: 'var(--accent-green)' };
  if (pts === 3)  return { icon: '👍', label: 'Vencedor', color: '#fb923c' };
  return           { icon: '❌', label: 'Zerou', color: 'var(--error)' };
};

// -------------------------------------------------------
// Sistema de Conquistas e Badges
// Calculado 100% no frontend a partir dos dados existentes
// -------------------------------------------------------
const ACHIEVEMENTS = [
  {
    id: 'first_guess',
    icon: '🖣️',
    name: 'Primeira Pedra',
    desc: 'Salvou seu primeiro palpite',
    check: (profile, guesses) => guesses.length >= 1,
    color: '#94a3b8',
  },
  {
    id: 'guess_20',
    icon: '📋',
    name: 'Palpiteiro de Carteirinha',
    desc: '20 palpites salvos',
    check: (profile, guesses) => guesses.length >= 20,
    color: '#60a5fa',
  },
  {
    id: 'guess_48',
    icon: '🟢',
    name: 'All-In',
    desc: 'Palpitou em todos os 48 jogos da fase de grupos',
    check: (profile, guesses) => guesses.length >= 48,
    color: '#34d399',
  },
  {
    id: 'first_exact',
    icon: '⭐',
    name: 'Craque do Placar',
    desc: 'Acertou o placar exato pela primeira vez',
    check: (profile, guesses) => (profile.exact_scores_count || 0) >= 1,
    color: '#fbbf24',
  },
  {
    id: 'exact_3',
    icon: '🎩',
    name: 'Hat-trick de Exatos',
    desc: '3 placares exatos acertados',
    check: (profile, guesses) => (profile.exact_scores_count || 0) >= 3,
    color: '#f59e0b',
  },
  {
    id: 'exact_10',
    icon: '🔟',
    name: 'Décuplo Exato',
    desc: '10 placares exatos acertados',
    check: (profile, guesses) => (profile.exact_scores_count || 0) >= 10,
    color: '#ef4444',
  },
  {
    id: 'winner_5',
    icon: '🎯',
    name: 'Leitor de Jogo',
    desc: 'Acertou o vencedor em 5 jogos (pts ≥ 3)',
    check: (profile, guesses) => guesses.filter(g => g.points_awarded >= 3).length >= 5,
    color: '#a78bfa',
  },
  {
    id: 'winner_10',
    icon: '🔮',
    name: 'Vidente',
    desc: 'Acertou o vencedor em 10 jogos',
    check: (profile, guesses) => guesses.filter(g => g.points_awarded >= 3).length >= 10,
    color: '#8b5cf6',
  },
  {
    id: 'pts_50',
    icon: '📈',
    name: 'Pontuador',
    desc: '50 pontos acumulados',
    check: (profile, guesses) => (profile.total_points || 0) >= 50,
    color: '#fb923c',
  },
  {
    id: 'pts_100',
    icon: '🏆',
    name: 'Centenário',
    desc: '100 pontos acumulados',
    check: (profile, guesses) => (profile.total_points || 0) >= 100,
    color: '#f59e0b',
  },
  {
    id: 'super_scored',
    icon: '💥',
    name: 'Super Estrela',
    desc: 'Pontuou com um Super Palpite',
    check: (profile, guesses) => guesses.some(g => g.is_super && g.points_awarded > 0),
    color: '#fde68a',
  },
  {
    id: 'underdog',
    icon: '🐴',
    name: 'Azaraõ',
    desc: 'Acertou um placar exato com diferença de gols ≥ 3',
    check: (profile, guesses) => guesses.some(g =>
      g.points_awarded === 10 &&
      g.matches &&
      Math.abs((g.matches.home_score || 0) - (g.matches.away_score || 0)) >= 3
    ),
    color: '#f472b6',
  },
];

const computeAchievements = (profile, guesses) => {
  if (!profile || !guesses) return [];
  return ACHIEVEMENTS.filter(a => a.check(profile, guesses));
};

// Conquistas calculáveis apenas com dados do profile (sem precisar dos palpites)
// Usadas para exibir na tabela de ranking sem queries extras
const PROFILE_ACHIEVEMENTS = [
  {
    id: 'first_exact',
    icon: '⭐',
    name: 'Craque do Placar',
    desc: 'Acertou o placar exato pela primeira vez',
    check: (profile) => (profile.exact_scores_count || 0) >= 1,
    color: '#fbbf24',
  },
  {
    id: 'exact_3',
    icon: '🎩',
    name: 'Hat-trick de Exatos',
    desc: '3 placares exatos acertados',
    check: (profile) => (profile.exact_scores_count || 0) >= 3,
    color: '#f59e0b',
  },
  {
    id: 'exact_10',
    icon: '🔟',
    name: 'Décuplo Exato',
    desc: '10 placares exatos acertados',
    check: (profile) => (profile.exact_scores_count || 0) >= 10,
    color: '#ef4444',
  },
  {
    id: 'pts_50',
    icon: '📈',
    name: 'Pontuador',
    desc: '50 pontos acumulados',
    check: (profile) => (profile.total_points || 0) >= 50,
    color: '#fb923c',
  },
  {
    id: 'pts_100',
    icon: '💯',
    name: 'Centenário',
    desc: '100 pontos acumulados',
    check: (profile) => (profile.total_points || 0) >= 100,
    color: '#10b981',
  },
  {
    id: 'pts7_master',
    icon: '⚖️',
    name: 'Rei do Saldo',
    desc: 'Acertou o saldo de gols 5 vezes',
    check: (profile) => (profile.pts7_count || 0) >= 5,
    color: '#8b5cf6',
  }
];

const computeProfileAchievements = (profile) => {
  if (!profile) return [];
  return PROFILE_ACHIEVEMENTS.filter(a => a.check(profile));
};

// ---------------------------------------------------------
// Gráfico SVG de Evolução de Posição no Ranking
// ---------------------------------------------------------
const PositionHistoryChart = ({ userId, snapshots }) => {
  const data = (snapshots || [])
    .filter(s => s.ranks && s.ranks[userId] !== undefined)
    .map(s => ({ date: new Date(s.savedAt), pos: s.ranks[userId] }));

  if (data.length === 0) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
        Nenhum histórico registrado ainda — aparecerá após a próxima atualização de placar.
      </p>
    );
  }

  if (data.length === 1) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
        Apenas 1 registo — aguarde mais jogos para ver a evolução.
      </p>
    );
  }

  // Dimensões do gráfico
  const W = 500, H = 130;
  const PAD = { top: 22, right: 24, bottom: 28, left: 32 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const positions = data.map(d => d.pos);
  const minPos = Math.min(...positions);
  const maxPos = Math.max(...positions);
  const range = maxPos === minPos ? 1 : maxPos - minPos;

  // Posição 1 (melhor) fica no TOPO — número menor = Y menor
  const xOf = (i) => PAD.left + (i / (data.length - 1)) * iW;
  const yOf = (pos) => PAD.top + ((pos - minPos) / range) * iH;

  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.pos), ...d }));

  // Curva bezier suave
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx1 = prev.x + (p.x - prev.x) * 0.5;
    const cx2 = p.x - (p.x - prev.x) * 0.5;
    return `${acc} C${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
  }, '');

  // Área preenchida sob a curva
  const areaD = `${pathD} L${pts[pts.length-1].x},${PAD.top + iH} L${pts[0].x},${PAD.top + iH} Z`;

  // Linhas de grade horizontais (3 linhas)
  const gridLines = [0, 0.5, 1].map(t => PAD.top + t * iH);

  const fmtDate = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const fmtTime = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      role="img"
      aria-label="Gráfico de evolução de posição no ranking"
    >
      <defs>
        <linearGradient id={`chartGrad-${userId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
        </linearGradient>
        <filter id="dot-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Linhas de grade */}
      {gridLines.map((y, i) => (
        <line key={i} x1={PAD.left} y1={y} x2={PAD.left + iW} y2={y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      {/* Área preenchida */}
      <path d={areaD} fill={`url(#chartGrad-${userId})`} />

      {/* Linha da curva */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Pontos e labels */}
      {pts.map((p, i) => {
        const isFirst = i === 0;
        const isLast = i === pts.length - 1;
        const isBest = p.pos === minPos;
        const dotColor = isBest ? '#4ade80' : '#3b82f6';
        return (
          <g key={i}>
            {/* Halo no ponto */}
            {isBest && (
              <circle cx={p.x} cy={p.y} r={9} fill="rgba(74,222,128,0.15)" />
            )}
            {/* Ponto */}
            <circle cx={p.x} cy={p.y} r={isBest ? 5.5 : 4}
              fill={dotColor} filter="url(#dot-glow)" />
            {/* Label de posição acima do ponto */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={isBest ? '#4ade80' : 'rgba(255,255,255,0.75)'}
            >
              {p.pos}º
            </text>
            {/* Data no eixo X — apenas primeiro, último e pontos espaçados */}
            {(isFirst || isLast || data.length <= 6 || i % Math.ceil(data.length / 5) === 0) && (
              <text
                x={p.x}
                y={H - 2}
                textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                fontSize="8.5"
                fill="rgba(255,255,255,0.35)"
              >
                {fmtDate(p.date)}
              </text>
            )}
          </g>
        );
      })}

      {/* Linha vertical do eixo Y */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + iH}
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  );
};

export default function Ranking({ currentUser, showToast }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  // Movimentação de posições: { userId: { delta: number, isNew: bool } }
  const [rankMovement, setRankMovement] = useState({});
  const [snapshotDate, setSnapshotDate] = useState(null);

  // Modal de detalhes
  const [detailUser, setDetailUser] = useState(null);
  const [detailGuesses, setDetailGuesses] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Histórico de posições para o gráfico
  const [rankHistory, setRankHistory] = useState([]);

  // Ranking com posição numerada (sem filtro de busca)
  const rankedLeaderboard = leaderboard.map((profile, index) => ({
    ...profile,
    rank: index + 1
  }));

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_points', { ascending: false })
        .order('exact_scores_count', { ascending: false })
        .order('pts7_count', { ascending: false });

      if (error) throw error;

      const newData = data || [];
      setLeaderboard(newData);

      // --- Cálculo de movimentação via snapshot do Supabase (compartilhado entre todos) ---
      try {
        const { data: settingsData } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'ranking_snapshot')
          .maybeSingle();

        if (settingsData?.value) {
          const snapshot = settingsData.value;
          const oldRanks = snapshot.ranks || {};
          const movement = {};

          newData.forEach((profile, index) => {
            const currentRank = index + 1;
            const previousRank = oldRanks[profile.id];
            if (previousRank === undefined) {
              movement[profile.id] = { delta: null, isNew: true };
            } else {
              movement[profile.id] = { delta: previousRank - currentRank, isNew: false };
            }
          });

          setRankMovement(movement);
          setSnapshotDate(snapshot.savedAt);
        }
      } catch (snapshotErr) {
        console.warn('Erro ao buscar snapshot do ranking:', snapshotErr);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      showToast('Erro ao carregar tabela de líderes: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (profile) => {
    setDetailUser(profile);
    setLoadingDetail(true);
    setDetailGuesses([]);
    setRankHistory([]);
    try {
      // Busca palpites e histórico em paralelo
      const [guessesResult, historyResult] = await Promise.all([
        supabase
          .from('guesses')
          .select(`
            id,
            home_guess,
            away_guess,
            points_awarded,
            is_super,
            match_id,
            matches (
              id,
              home_team,
              away_team,
              home_team_flag,
              away_team_flag,
              home_score,
              away_score,
              status,
              round,
              group_name,
              match_date
            )
          `)
          .eq('user_id', profile.id)
          .order('points_awarded', { ascending: false, nullsFirst: false }),
        supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'ranking_history')
          .maybeSingle()
      ]);

      if (guessesResult.error) throw guessesResult.error;
      setDetailGuesses(guessesResult.data || []);
      setRankHistory(historyResult.data?.value?.snapshots || []);
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar detalhes: ' + err.message, 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Totais por categoria para o modal
  const summarize = (guesses) => {
    const finished = guesses.filter(g => g.points_awarded !== null);
    return {
      total: finished.reduce((s, g) => s + g.points_awarded, 0),
      exact: finished.filter(g => g.points_awarded === 10).length,
      pts7:  finished.filter(g => g.points_awarded === 7).length,
      pts5:  finished.filter(g => g.points_awarded === 5).length,
      pts3:  finished.filter(g => g.points_awarded === 3).length,
      pts0:  finished.filter(g => g.points_awarded === 0).length,
      pending: guesses.filter(g => g.points_awarded === null).length,
    };
  };

  return (
    <div className="ranking-panel glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy color="var(--accent-gold)" size={24} />
          <h2 style={{ fontSize: '1.4rem' }}>Classificação Geral</h2>
        </div>
        <button
          className="nav-button"
          onClick={fetchLeaderboard}
          style={{ fontSize: '0.85rem', padding: '6px 12px', border: '1px solid var(--card-border)' }}
        >
          Atualizar
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          Carregando ranking...
        </div>
      ) : leaderboard.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          Nenhum participante cadastrado ainda.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Participante</th>
                <th style={{ textAlign: 'center' }}>⭐ Exatos</th>
                <th style={{ textAlign: 'center' }}>Pontos</th>
                <th style={{ textAlign: 'center' }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {rankedLeaderboard.map((profile) => {
                const isSelf = currentUser && profile.id === currentUser.id;
                const position = profile.rank;
                let posClass = '';
                if (position === 1) posClass = 'ranking-pos-1';
                else if (position === 2) posClass = 'ranking-pos-2';
                else if (position === 3) posClass = 'ranking-pos-3';

                return (
                  <tr key={profile.id} className={`ranking-row ${isSelf ? 'current-user' : ''}`}>
                    <td className={`ranking-position ${posClass}`}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span>
                          {position === 1 ? '🥇 1º' :
                           position === 2 ? '🥈 2º' :
                           position === 3 ? '🥉 3º' :
                           `${position}º`}
                        </span>
                        {/* Indicador de movimentação */}
                        {(() => {
                          const mv = rankMovement[profile.id];
                          if (!mv) return null;
                          if (mv.isNew) return (
                            <span className="rank-movement rank-new" data-tooltip="Primeira vez no ranking!">NOVO</span>
                          );
                          if (mv.delta > 0) return (
                            <span className="rank-movement rank-up" data-tooltip={`Subiu ${mv.delta} posição${mv.delta > 1 ? 'ões' : ''} desde a última atualização`}>
                              ▲ {mv.delta}
                            </span>
                          );
                          if (mv.delta < 0) return (
                            <span className="rank-movement rank-down" data-tooltip={`Caiu ${Math.abs(mv.delta)} posição${Math.abs(mv.delta) > 1 ? 'ões' : ''} desde a última atualização`}>
                              ▼ {Math.abs(mv.delta)}
                            </span>
                          );
                          return (
                            <span className="rank-movement rank-stable" data-tooltip="Manteve a posição">&#8212;</span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="ranking-username">
                      <div className="avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '0.85rem', border: isSelf ? '2px solid var(--accent-green)' : '1px solid var(--card-border)' }}>
                        {(profile.username || 'U')[0].toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>
                          @{profile.username || 'usuário'}{' '}
                          {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>(Você)</span>}
                        </span>
                        {/* Badges de perfil na tabela */}
                        {(() => {
                          const profileBadges = computeProfileAchievements(profile);
                          if (profileBadges.length === 0) return null;
                          return (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {profileBadges.map(a => (
                                <span
                                  key={a.id}
                                  className="rank-badge-pill"
                                  style={{ '--badge-color': a.color }}
                                  data-tooltip={`${a.name} — ${a.desc}`}
                                >
                                  {a.icon}
                                </span>
                              ))}
                              <span
                                className="rank-badge-more"
                                data-tooltip="Clique em 'Ver' para ver todas as conquistas"
                              >
                                +
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }} className="ranking-details">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Star size={14} color="var(--accent-gold)" fill="var(--accent-gold)" />
                        {profile.exact_scores_count}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }} className="ranking-points">
                      {profile.total_points}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openDetail(profile)}
                        className="nav-button"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', border: '1px solid var(--card-border)', gap: '4px' }}
                        title={`Ver detalhes de @${profile.username}`}
                      >
                        <ChevronDown size={13} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }} className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: 'var(--radius-sm)' }}>
          <Activity size={16} color="var(--accent-green)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Clique em "Ver"</strong> para ver o detalhamento dos pontos de cada participante.
          </span>
        </div>
        {snapshotDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>📊 Comparação com: </span>
            <strong style={{ color: 'var(--text-secondary)' }}>
              {new Date(snapshotDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </strong>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>▲ Subiu</span>
          <span style={{ color: 'var(--error)', fontWeight: '700' }}>▼ Caiu</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>&#8212; Estável</span>
          <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>NOVO</span>
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {detailUser && (
        <div className="modal-overlay" onClick={() => setDetailUser(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-placeholder" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                  {(detailUser.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>@{detailUser.username}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {detailUser.total_points} pontos totais
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetailUser(null)}>
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                Carregando detalhes...
              </div>
            ) : detailGuesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                Nenhum palpite registrado ainda.
              </div>
            ) : (() => {
              const s = summarize(detailGuesses);
              const earned = computeAchievements(detailUser, detailGuesses);
              return (
                <>
                  {/* Seção de Gráfico — Evolução de Posição */}
                  <div className="achievements-section" style={{ marginBottom: '16px' }}>
                    <div className="achievements-header">
                      <span>📈</span>
                      <span>Evolução no Ranking</span>
                      {rankHistory.length >= 2 && (
                        <span className="achievements-count">{rankHistory.filter(s => s.ranks?.[detailUser.id]).length} pontos</span>
                      )}
                    </div>
                    <PositionHistoryChart userId={detailUser.id} snapshots={rankHistory} />
                    {rankHistory.filter(s => s.ranks?.[detailUser.id]).length >= 2 && (
                      <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                          Melhor posição
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                          Demais registros
                        </span>
                        <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>Atualiza a cada placar salvo</span>
                      </div>
                    )}
                  </div>

                  {/* Seção de Conquistas */}
                  <div className="achievements-section">
                    <div className="achievements-header">
                      <span>🏆</span>
                      <span>Conquistas</span>
                      <span className="achievements-count">{earned.length}/{ACHIEVEMENTS.length}</span>
                    </div>
                    {earned.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                        Nenhuma conquista ainda — continue palpitando!
                      </p>
                    ) : (
                      <div className="achievements-grid">
                        {earned.map(a => (
                          <div key={a.id} className="achievement-badge" style={{ '--badge-color': a.color }} data-tooltip={`${a.name} — ${a.desc}`}>
                            <span className="achievement-icon">{a.icon}</span>
                            <span className="achievement-name">{a.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resumo de categorias */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {[
                      { label: '⭐ Exatos', value: s.exact, color: 'var(--accent-gold)', pts: '10pts' },
                      { label: '🎯 Saldo', value: s.pts7, color: '#a78bfa', pts: '7pts' },
                      { label: '✅ Venc+', value: s.pts5, color: 'var(--accent-green)', pts: '5pts' },
                      { label: '👍 Vencedor', value: s.pts3, color: '#fb923c', pts: '3pts' },
                      { label: '❌ Zeros', value: s.pts0, color: 'var(--error)', pts: '0pts' },
                      { label: '⏳ Pendentes', value: s.pending, color: 'var(--text-muted)', pts: '' },
                    ].map(item => (
                      <div key={item.label} style={{ flex: '1', minWidth: '80px', textAlign: 'center', padding: '10px 8px', background: `${item.color}15`, border: `1px solid ${item.color}33`, borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.3rem', color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.label}</div>
                        {item.pts && <div style={{ fontSize: '0.65rem', color: item.color, marginTop: '1px' }}>{item.pts}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Lista de palpites */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                    {detailGuesses.map(g => {
                      const m = g.matches;
                      const { icon, label, color } = pointsLabel(g.points_awarded);
                      const isFinished = m?.status === 'finished';
                      return (
                        <div key={g.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          background: isFinished ? `${color}0d` : 'rgba(255,255,255,0.03)',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isFinished ? color + '33' : 'var(--card-border)'}`,
                          flexWrap: 'wrap',
                        }}>
                          {/* Times */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '160px' }}>
                            {renderFlag(m?.home_team_flag)}
                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{m?.home_team}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>x</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{m?.away_team}</span>
                            {renderFlag(m?.away_team_flag)}
                            {g.is_super && <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }} title="Super Palpite">⭐</span>}
                          </div>

                          {/* Resultado oficial */}
                          {isFinished && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-title)', minWidth: '50px', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Resultado</span>
                              <strong>{m.home_score} x {m.away_score}</strong>
                            </div>
                          )}

                          {/* Palpite */}
                          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-title)', minWidth: '55px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Palpite</span>
                            <strong>{g.home_guess} x {g.away_guess}</strong>
                          </div>

                          {/* Pontos */}
                          <div style={{ textAlign: 'center', minWidth: '55px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Pontos</span>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color }}>
                              {icon} {g.points_awarded !== null ? `+${g.points_awarded}` : '–'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
