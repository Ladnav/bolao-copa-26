import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Save, Eye, Calendar, Clock, Lock, Pencil, CheckCircle2 } from 'lucide-react';

const renderFlag = (flag) => {
  if (!flag) return <span className="team-flag">🏳️</span>;
  if (flag.startsWith('http')) {
    return <img src={flag} alt="" className="team-flag-img" />;
  }
  return <span className="team-flag">{flag}</span>;
};

export default function Dashboard({ user, showToast }) {
  const [matches, setMatches] = useState([]);
  const [userGuesses, setUserGuesses] = useState({});
  const [loading, setLoading] = useState(true);
  const [roundFilter, setRoundFilter] = useState('Fase de Grupos');
  const [groupFilter, setGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);
  // Conjunto de matchIds atualmente em modo de edição (mesmo que já tenham palpite salvo)
  const [editingMatches, setEditingMatches] = useState(new Set());

  // Modal de visualização de outros palpites
  const [modalMatch, setModalMatch] = useState(null);
  const [modalGuesses, setModalGuesses] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetchMatchesAndGuesses();
  }, [user]);

  const fetchMatchesAndGuesses = async () => {
    setLoading(true);
    try {
      // 1. Buscar todas as partidas ordenadas por data
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      // 2. Buscar palpites do usuário logado
      if (user) {
        const { data: guessesData, error: guessesError } = await supabase
          .from('guesses')
          .select('*')
          .eq('user_id', user.id);

        if (guessesError) throw guessesError;

        // Converter array de palpites em um dicionário mapeado por match_id
        const guessesMap = {};
        guessesData?.forEach(g => {
          guessesMap[g.match_id] = {
            home_guess: g.home_guess !== null ? String(g.home_guess) : '',
            away_guess: g.away_guess !== null ? String(g.away_guess) : '',
            points_awarded: g.points_awarded
          };
        });
        setUserGuesses(guessesMap);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      showToast(err.message || 'Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuessChange = (matchId, team, val) => {
    const numericVal = val === '' ? '' : String(Math.max(0, parseInt(val) || 0));
    setUserGuesses(prev => ({
      ...prev,
      [matchId]: {
        home_guess: '',
        away_guess: '',
        ...prev[matchId],
        [team === 'home' ? 'home_guess' : 'away_guess']: numericVal
      }
    }));
  };

  const saveGuess = async (matchId) => {
    const guess = userGuesses[matchId];
    if (!guess || guess.home_guess === '' || guess.away_guess === '') {
      showToast('Por favor, informe os gols de ambas as equipes.', 'error');
      return;
    }

    setSavingId(matchId);
    try {
      const { error } = await supabase
        .from('guesses')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          home_guess: parseInt(guess.home_guess),
          away_guess: parseInt(guess.away_guess),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,match_id'
        });

      if (error) {
        // Erros comuns com mensagens amigáveis
        if (error.message?.includes('violates row-level security')) {
          throw new Error('Prazo encerrado ou sem permissão para palpitar neste jogo.');
        }
        if (error.message?.includes('violates foreign key')) {
          throw new Error('Seu perfil não foi encontrado. Faça logout e login novamente.');
        }
        throw error;
      }

      // Sai do modo edição após salvar
      setEditingMatches(prev => { const s = new Set(prev); s.delete(matchId); return s; });
      showToast('Palpite salvo! ✅', 'success');
    } catch (err) {
      console.error('Erro ao salvar palpite:', err);
      showToast('Erro: ' + (err.message || 'Sem permissão'), 'error');
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (matchId) => {
    setEditingMatches(prev => new Set(prev).add(matchId));
  };

  const openGuessesModal = async (match) => {
    setModalMatch(match);
    setLoadingModal(true);
    setModalGuesses([]);
    try {
      const { data, error } = await supabase
        .from('guesses')
        .select(`
          id,
          home_guess,
          away_guess,
          points_awarded,
          user_id,
          profiles (
            username
          )
        `)
        .eq('match_id', match.id)
        .order('points_awarded', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setModalGuesses(data || []);
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar palpites: ' + err.message, 'error');
    } finally {
      setLoadingModal(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verifica se os palpites estão fechados para um jogo
  // Usa guess_deadline se definido, senão usa match_date
  const isGuessClosed = (match) => {
    const deadline = match.guess_deadline ? new Date(match.guess_deadline) : new Date(match.match_date);
    return deadline <= new Date();
  };

  // Formata o prazo de palpite de forma amigável
  const formatDeadline = (match) => {
    const deadline = match.guess_deadline ? new Date(match.guess_deadline) : new Date(match.match_date);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) return 'Palpites encerrados';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 48) {
      return `Prazo: ${formatDate(deadline.toISOString())}`;
    } else if (hours >= 1) {
      return `Prazo: ${hours}h ${minutes}min restantes`;
    } else {
      return `Prazo: ${minutes}min restantes`;
    }
  };

  // Filtragem dos jogos
  const filteredMatches = matches.filter(match => {
    const matchRound = match.round === roundFilter;
    const matchGroup = groupFilter === 'all' || match.group_name === groupFilter;
    const query = searchQuery.toLowerCase();
    const searchMatch =
      match.home_team.toLowerCase().includes(query) ||
      match.away_team.toLowerCase().includes(query) ||
      (match.group_name && `grupo ${match.group_name}`.toLowerCase().includes(query));

    return matchRound && matchGroup && searchMatch;
  });

  return (
    <div>
      {/* Barra de Filtros */}
      <div className="filter-bar glass-panel" style={{ padding: '15px 20px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flex: 1 }}>
          <select
            className="select-filter"
            value={roundFilter}
            onChange={(e) => {
              setRoundFilter(e.target.value);
              setGroupFilter('all'); // Reseta grupo ao mudar fase
            }}
          >
            <option value="Fase de Grupos">Fase de Grupos</option>
            <option value="Rodada de 32">Dezesseis-avos (Rodada de 32)</option>
            <option value="Oitavas de Final">Oitavas de Final</option>
            <option value="Quartas de Final">Quartas de Final</option>
            <option value="Semifinais">Semifinais</option>
            <option value="Disputa de 3º lugar">Disputa de 3º lugar</option>
            <option value="Final">Final</option>
          </select>

          {roundFilter === 'Fase de Grupos' && (
            <select
              className="select-filter"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Todos os Grupos</option>
              {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
                <option key={g} value={g}>Grupo {g}</option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Buscar seleção..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
          Carregando jogos do bolão...
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          Nenhum jogo encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="cards-grid">
          {filteredMatches.map(match => {
            const guessClosed = isGuessClosed(match);
            const guess = userGuesses[match.id] || { home_guess: '', away_guess: '', points_awarded: null };

            return (
              <div
                key={match.id}
                className={`match-card glass-panel ${match.status === 'finished' ? 'finished' : ''}`}
              >
                {/* Header do Jogo */}
                <div className="match-header">
                  <span className="match-badge">
                    {match.round} {match.group_name ? `• Grupo ${match.group_name}` : ''}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                    <Calendar size={13} />
                    {formatDate(match.match_date)}
                  </span>
                </div>

                {/* Times e Placar Oficial */}
                <div className="match-teams-container">
                  <div className="team-box">
                    {renderFlag(match.home_team_flag)}
                    <span className="team-name" title={match.home_team}>{match.home_team}</span>
                  </div>

                  <div className="score-vs-container">
                    {match.status === 'finished' ? (
                      <div className="actual-scores">
                        <span>{match.home_score}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>x</span>
                        <span>{match.away_score}</span>
                      </div>
                    ) : match.status === 'live' ? (
                      <div className="actual-scores" style={{ color: 'var(--error)' }}>
                        <span>{match.home_score ?? 0}</span>
                        <span className="status-live" style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px' }}>AO VIVO</span>
                        <span>{match.away_score ?? 0}</span>
                      </div>
                    ) : (
                      <span className="match-vs">VS</span>
                    )}
                  </div>

                  <div className="team-box">
                    {renderFlag(match.away_team_flag)}
                    <span className="team-name" title={match.away_team}>{match.away_team}</span>
                  </div>
                </div>

                {/* Seção de Palpite */}
                <div style={{ marginTop: '15px' }}>
                  {!guessClosed ? (
                    // Palpites abertos
                    <div>
                      {/* Se tem palpite salvo e não está editando: mostra card salvo */}
                      {guess.home_guess !== '' && guess.away_guess !== '' && !editingMatches.has(match.id) ? (
                        <div className="saved-guess-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} color="var(--accent-green)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Seu palpite:</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="saved-guess-score">
                              {guess.home_guess} <span style={{ color: 'var(--text-muted)' }}>x</span> {guess.away_guess}
                            </span>
                            <button
                              className="edit-guess-btn"
                              onClick={() => startEditing(match.id)}
                              title="Editar palpite"
                            >
                              <Pencil size={13} />
                              Editar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Inputs de palpite (novo ou editando)
                        <div>
                          <div className="guess-inputs-container">
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                              {editingMatches.has(match.id) ? 'Alterar palpite:' : 'Seu Palpite:'}
                            </div>
                            <input
                              type="number"
                              min="0"
                              className="guess-input"
                              placeholder="-"
                              value={guess.home_guess}
                              onChange={(e) => handleGuessChange(match.id, 'home', e.target.value)}
                              autoFocus={editingMatches.has(match.id)}
                            />
                            <span style={{ color: 'var(--text-secondary)' }}>x</span>
                            <input
                              type="number"
                              min="0"
                              className="guess-input"
                              placeholder="-"
                              value={guess.away_guess}
                              onChange={(e) => handleGuessChange(match.id, 'away', e.target.value)}
                            />
                            <button
                              onClick={() => saveGuess(match.id)}
                              className="guess-btn-save"
                              disabled={savingId === match.id}
                              title="Salvar Palpite"
                            >
                              {savingId === match.id ? '...' : <Save size={16} color="#fff" />}
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Prazo de palpite */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Clock size={11} />
                        {formatDeadline(match)}
                      </div>
                    </div>
                  ) : (
                    // Palpites fechados (jogo começou ou prazo passou)
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="guess-inputs-container" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <Lock size={12} />
                          Palpite fechado:
                        </div>
                        <input
                          type="text"
                          className="guess-input"
                          value={guess.home_guess !== '' ? guess.home_guess : '-'}
                          readOnly
                          style={{ cursor: 'default', opacity: 0.7 }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>x</span>
                        <input
                          type="text"
                          className="guess-input"
                          value={guess.away_guess !== '' ? guess.away_guess : '-'}
                          readOnly
                          style={{ cursor: 'default', opacity: 0.7 }}
                        />

                        {match.status === 'finished' && guess.points_awarded !== null && (
                          <div className="guess-result-badge" style={{ marginLeft: '10px' }}>
                            <span className="points-text">+{guess.points_awarded} pts</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {guess.points_awarded === 10 ? '⭐ Exato!' :
                               guess.points_awarded === 7 ? '🎯 Saldo' :
                               guess.points_awarded === 5 ? '✅ Venc+Gols' :
                               guess.points_awarded === 3 ? '👍 Vencedor' : '❌ Zerou'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botão para ver palpites da galera - apenas após o jogo começar */}
                      {new Date(match.match_date) <= new Date() && (
                        <button
                          className="nav-button"
                          onClick={() => openGuessesModal(match)}
                          style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--card-border)', fontSize: '0.85rem', padding: '6px' }}
                        >
                          <Eye size={14} /> Ver Palpites da Galera
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Outros Palpites */}
      {modalMatch && (
        <div className="modal-overlay" onClick={() => setModalMatch(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>🎯 Palpites da Galera</h3>
              <button className="modal-close" onClick={() => setModalMatch(null)}>×</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {renderFlag(modalMatch.home_team_flag)}
                <span>{modalMatch.home_team}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                  {modalMatch.status === 'finished' ? `${modalMatch.home_score} x ${modalMatch.away_score}` : 'x'}
                </span>
                <span>{modalMatch.away_team}</span>
                {renderFlag(modalMatch.away_team_flag)}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {modalMatch.round}{modalMatch.group_name ? ` • Grupo ${modalMatch.group_name}` : ''}
              </span>
            </div>

            {loadingModal ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>Carregando palpites...</div>
            ) : modalGuesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                Ninguém palpitou para esta partida ainda.
              </div>
            ) : (
              <div className="bets-list">
                {modalGuesses.map((g, idx) => {
                  const isSelf = user && g.user_id === user.id;
                  return (
                    <div key={g.id} className={`bets-list-item ${isSelf ? 'bets-self' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '20px' }}>
                          {idx + 1}º
                        </span>
                        <div className="avatar-placeholder" style={{ width: '26px', height: '26px', fontSize: '0.7rem', flexShrink: 0 }}>
                          {(g.profiles?.username || 'U')[0].toUpperCase()}
                        </div>
                        <span className="bet-user">
                          @{g.profiles?.username || 'Usuário'}
                          {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginLeft: '4px' }}>(você)</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="bet-score">{g.home_guess} x {g.away_guess}</span>
                        {modalMatch.status === 'finished' && g.points_awarded !== null && (
                          <span style={{
                            color: g.points_awarded === 10 ? 'var(--accent-gold)' : g.points_awarded >= 5 ? 'var(--accent-green)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            background: g.points_awarded === 10 ? 'rgba(245,158,11,0.15)' : g.points_awarded >= 5 ? 'var(--accent-green-glow)' : 'transparent',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            +{g.points_awarded} pts
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
