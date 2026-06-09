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

export default function Dashboard({ user, profile, showToast }) {
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

  // Função para retornar quais super palpites estão ativos e em qual jogo para a fase selecionada
  const getSuperGuessesStatus = () => {
    if (!user) return [];

    const stages = [];
    if (roundFilter === 'Fase de Grupos') {
      stages.push({ key: 'Grupo - Rodada 1', label: 'Rodada 1 (Grupos)', ids: [1, 24] });
      stages.push({ key: 'Grupo - Rodada 2', label: 'Rodada 2 (Grupos)', ids: [25, 48] });
      stages.push({ key: 'Grupo - Rodada 3', label: 'Rodada 3 (Grupos)', ids: [49, 72] });
    } else if (roundFilter === 'Disputa de 3º lugar' || roundFilter === 'Final') {
      stages.push({ key: 'Fase Final', label: 'Fase Final (3º Lugar ou Final)', ids: [103, 104] });
    } else {
      stages.push({ key: roundFilter, label: roundFilter, ids: null });
    }

    return stages.map(stage => {
      let activeGuess = null;
      let activeMatch = null;

      Object.keys(userGuesses).forEach(matchIdStr => {
        const matchId = parseInt(matchIdStr);
        const g = userGuesses[matchId];
        if (g?.is_super) {
          const m = matches.find(item => item.id === matchId);
          if (m) {
            let matchesStage = false;
            if (stage.ids) {
              if (stage.key === 'Fase Final') {
                matchesStage = (m.round === 'Final' || m.round === 'Disputa de 3º lugar');
              } else {
                matchesStage = m.round === 'Fase de Grupos' && m.id >= stage.ids[0] && m.id <= stage.ids[1];
              }
            } else {
              matchesStage = m.round === stage.key;
            }

            if (matchesStage) {
              activeGuess = g;
              activeMatch = m;
            }
          }
        }
      });

      return {
        ...stage,
        used: !!activeGuess,
        match: activeMatch
      };
    });
  };

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
            points_awarded: g.points_awarded,
            is_super: g.is_super || false,
            isSaved: true
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
        [team === 'home' ? 'home_guess' : 'away_guess']: numericVal,
        isSaved: false
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
      const { data, error } = await supabase
        .from('guesses')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          home_guess: parseInt(guess.home_guess),
          away_guess: parseInt(guess.away_guess),
          is_super: guess.is_super || false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,match_id'
        })
        .select();

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

      if (!data || data.length === 0) {
        throw new Error('Não foi possível salvar o palpite. O prazo limite pode ter expirado ou o jogo já começou.');
      }

      // Sai do modo edição após salvar
      setEditingMatches(prev => { const s = new Set(prev); s.delete(matchId); return s; });
      setUserGuesses(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          isSaved: true
        }
      }));
      showToast('Palpite salvo! ✅', 'success');
    } catch (err) {
      console.error('Erro ao salvar palpite:', err);
      showToast('Erro: ' + (err.message || 'Sem permissão'), 'error');
    } finally {
      setSavingId(null);
    }
  };

  const toggleSuperGuess = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    if (isGuessClosed(match)) {
      showToast('Prazo encerrado para palpites neste jogo!', 'error');
      return;
    }

    const guess = userGuesses[matchId];
    if (!guess || guess.home_guess === '' || guess.away_guess === '') {
      showToast('Por favor, digite seu palpite antes de marcá-lo como Super Palpite! ⭐', 'error');
      return;
    }

    if (!guess.isSaved) {
      showToast('Por favor, salve seu palpite antes de marcá-lo como Super Palpite! ⭐', 'error');
      return;
    }

    const newSuperState = !guess.is_super;
    
    if (newSuperState) {
      const stageName = match.round === 'Fase de Grupos'
        ? (matchId <= 24 ? 'Rodada 1 dos Grupos' : matchId <= 48 ? 'Rodada 2 dos Grupos' : 'Rodada 3 dos Grupos')
        : (match.round === 'Disputa de 3º lugar' || match.round === 'Final' ? 'Fase Final' : match.round);
      
      const confirmed = window.confirm(
        `⭐ ATIVAÇÃO DE SUPER PALPITE ⭐\n\n` +
        `Deseja definir a partida [${match.home_team} x ${match.away_team}] como seu Super Palpite da ${stageName}?\n\n` +
        `• REGRA: Você tem direito a exatamente 1 Super Palpite por rodada.\n` +
        `• SUBSTITUIÇÃO: Se você já tiver ativado o Super Palpite em outra partida desta mesma rodada, ele será desativado automaticamente para ativar este no lugar.\n` +
        `• PONTOS: Caso você pontue neste jogo, seus pontos serão DOBRADOS!\n\n` +
        `Deseja confirmar e prosseguir?`
      );
      if (!confirmed) return;
    }

    setSavingId(matchId);
    try {
      const { data, error } = await supabase
        .from('guesses')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          home_guess: parseInt(guess.home_guess),
          away_guess: parseInt(guess.away_guess),
          is_super: newSuperState,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,match_id'
        })
        .select();

      if (error) {
        if (error.message?.includes('violates row-level security')) {
          throw new Error('Prazo encerrado ou sem permissão para palpitar neste jogo.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Erro ao salvar o Super Palpite. O prazo limite pode ter expirado.');
      }

      // Recarrega todos os palpites para sincronizar e tirar estrelas anteriores
      await fetchMatchesAndGuesses();
      showToast(newSuperState ? 'Super Palpite ativado! ⭐' : 'Super Palpite removido! 🌟', 'success');
    } catch (err) {
      console.error('Erro ao alternar Super Palpite:', err);
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
          is_super,
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

  // Obtém a data limite real do palpite (guess_deadline ou match_date - 24 horas)
  const getGuessDeadlineDate = (match) => {
    if (match.guess_deadline) {
      return new Date(match.guess_deadline);
    }
    // Subtrai 24 horas (24 * 60 * 60 * 1000 milissegundos) da data do jogo
    const matchTime = new Date(match.match_date).getTime();
    return new Date(matchTime - 24 * 60 * 60 * 1000);
  };

  // Verifica se os palpites estão fechados para um jogo
  const isGuessClosed = (match) => {
    const deadline = getGuessDeadlineDate(match);
    return deadline <= new Date();
  };

  // Formata o prazo de palpite de forma amigável
  const formatDeadline = (match) => {
    const deadline = getGuessDeadlineDate(match);
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

      {/* Painel de Status do Super Palpite */}
      {user && matches.length > 0 && (
        <div 
          className="super-status-panel glass-panel" 
          style={{ 
            marginTop: '15px', 
            padding: '12px 20px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid rgba(245, 158, 11, 0.25)', 
            background: 'linear-gradient(90deg, rgba(20, 20, 30, 0.4) 0%, rgba(245, 158, 11, 0.03) 100%)',
            marginBottom: '15px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-gold)', fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Status dos Seus Super Palpites (Dobro de Pontos!):
                </span>
              </div>
              <a 
                href="https://ge.globo.com/futebol/copa-do-mundo/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                📊 Tabela e Classificação GE 🔗
              </a>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {getSuperGuessesStatus().map(st => (
                <div 
                  key={st.key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.8rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)' 
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{st.label}:</span>
                  {st.used ? (
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ⭐ {st.match.home_team} x {st.match.away_team}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Disponível
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
          Carregando jogos do bolão...
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '500px', margin: '40px auto' }} className="glass-panel">
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚽</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#fff', fontFamily: 'var(--font-title)' }}>Nenhum jogo cadastrado</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            {profile?.is_admin
              ? 'O banco de dados do bolão está vazio! Vá até a aba "Admin Panel" no menu superior para semear as partidas e dar o pontapé inicial.'
              : 'O banco de dados do bolão está vazio! Peça ao administrador do bolão para semear as partidas da Copa do Mundo e dar o pontapé inicial.'}
          </p>
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
                className={`match-card glass-panel ${match.status === 'finished' ? 'finished' : ''} ${guess.is_super ? 'super-guess-card' : ''}`}
              >
                {/* Header do Jogo */}
                <div className="match-header">
                  <span className="match-badge">
                    {match.round} {match.group_name ? `• Grupo ${match.group_name}` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {guess.is_super && guessClosed && (
                      <span className="super-badge">⭐ Super</span>
                    )}
                    {user && !guessClosed && (
                      <button
                        className={`btn-star ${guess.is_super ? 'active' : ''}`}
                        onClick={() => toggleSuperGuess(match.id)}
                        disabled={savingId === match.id}
                        title={guess.is_super ? "Remover Super Palpite" : "Marcar como Super Palpite (Dobro de Pontos!)"}
                      >
                        ⭐
                      </button>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                      <Calendar size={13} />
                      {formatDate(match.match_date)}
                    </span>
                  </div>
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
                      {guess.isSaved && !editingMatches.has(match.id) ? (
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
                          <div 
                            className="guess-result-badge" 
                            style={{ 
                              marginLeft: '10px',
                              background: guess.is_super ? 'linear-gradient(135deg, var(--accent-gold) 0%, #d97706 100%)' : 'rgba(16, 185, 129, 0.15)',
                              borderColor: guess.is_super ? 'var(--accent-gold)' : 'rgba(16, 185, 129, 0.3)',
                              color: guess.is_super ? '#000' : 'inherit'
                            }}
                          >
                            <span className="points-text" style={{ color: guess.is_super ? '#000' : 'var(--accent-green)', fontWeight: '800' }}>
                              +{guess.points_awarded} pts {guess.is_super ? '⭐' : ''}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: guess.is_super ? 'rgba(0,0,0,0.8)' : 'var(--text-muted)', fontWeight: guess.is_super ? '700' : 'normal' }}>
                              {guess.points_awarded === 20 || guess.points_awarded === 10 ? '⭐ Exato!' :
                               guess.points_awarded === 14 || guess.points_awarded === 7 ? '🎯 Saldo' :
                               guess.points_awarded === 10 || guess.points_awarded === 5 ? '✅ Venc+Gols' :
                               guess.points_awarded === 6 || guess.points_awarded === 3 ? '👍 Vencedor' : 
                               guess.points_awarded === 2 || guess.points_awarded === 1 ? '🤝 Empate' : '❌ Zerou'}
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
                        <span className="bet-user" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>@{g.profiles?.username || 'Usuário'}</span>
                          {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>(você)</span>}
                          {g.is_super && <span style={{ color: 'var(--accent-gold)' }} title="Super Palpite">⭐</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="bet-score">{g.home_guess} x {g.away_guess}</span>
                        {modalMatch.status === 'finished' && g.points_awarded !== null && (
                          <span style={{
                            color: g.is_super ? '#000' : (g.points_awarded === 10 ? 'var(--accent-gold)' : g.points_awarded >= 5 ? 'var(--accent-green)' : 'var(--text-secondary)'),
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            background: g.is_super ? 'linear-gradient(135deg, var(--accent-gold) 0%, #d97706 100%)' : (g.points_awarded === 10 ? 'rgba(245,158,11,0.15)' : g.points_awarded >= 5 ? 'var(--accent-green-glow)' : 'transparent'),
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            +{g.points_awarded} pts {g.is_super ? '⭐' : ''}
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
