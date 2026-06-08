import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Star, Activity, X, ChevronDown, Search } from 'lucide-react';

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

export default function Ranking({ currentUser, showToast }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de detalhes
  const [detailUser, setDetailUser] = useState(null);
  const [detailGuesses, setDetailGuesses] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaderboard = leaderboard.map((profile, index) => ({
    ...profile,
    rank: index + 1
  })).filter(profile =>
    profile.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      setLeaderboard(data || []);
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
    try {
      const { data, error } = await supabase
        .from('guesses')
        .select(`
          id,
          home_guess,
          away_guess,
          points_awarded,
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
        .order('points_awarded', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setDetailGuesses(data || []);
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

      {/* Barra de Pesquisa */}
      {!loading && leaderboard.length > 0 && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Buscar participante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '0.85rem', padding: '8px 12px' }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          Carregando ranking...
        </div>
      ) : leaderboard.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          Nenhum participante cadastrado ainda.
        </div>
      ) : filteredLeaderboard.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          Nenhum participante encontrado com "{searchQuery}".
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
              {filteredLeaderboard.map((profile) => {
                const isSelf = currentUser && profile.id === currentUser.id;
                const position = profile.rank;
                let posClass = '';
                if (position === 1) posClass = 'ranking-pos-1';
                else if (position === 2) posClass = 'ranking-pos-2';
                else if (position === 3) posClass = 'ranking-pos-3';

                return (
                  <tr key={profile.id} className={`ranking-row ${isSelf ? 'current-user' : ''}`}>
                    <td className={`ranking-position ${posClass}`}>
                      {position === 1 ? '🥇 1º' :
                       position === 2 ? '🥈 2º' :
                       position === 3 ? '🥉 3º' :
                       `${position}º`}
                    </td>
                    <td className="ranking-username">
                      <div className="avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '0.85rem', border: isSelf ? '2px solid var(--accent-green)' : '1px solid var(--card-border)' }}>
                        {(profile.username || 'U')[0].toUpperCase()}
                      </div>
                      <span>
                        @{profile.username || 'usuário'}{' '}
                        {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>(Você)</span>}
                      </span>
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

      <div style={{ marginTop: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }} className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: 'var(--radius-sm)' }}>
          <Activity size={16} color="var(--accent-green)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Clique em "Ver"</strong> para ver o detalhamento dos pontos de cada participante.
          </span>
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
              return (
                <>
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
