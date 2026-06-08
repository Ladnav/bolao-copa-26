import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { generateMatches } from '../data/matchesSeed';
import { Database, Save, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

const renderFlag = (flag) => {
  if (!flag) return <span style={{ fontSize: '1.5rem' }}>🏳️</span>;
  if (flag.startsWith('http')) {
    return <img src={flag} alt="" className="team-flag-img" style={{ width: '36px', height: '24px' }} />;
  }
  return <span style={{ fontSize: '1.5rem' }}>{flag}</span>;
};

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  // Ajusta para o fuso local e formata como yyyy-MM-ddTHH:mm
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Admin({ profile, showToast }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundFilter, setRoundFilter] = useState('Fase de Grupos');
  const [recalcLoading, setRecalcLoading] = useState(false);

  // Dicionário temporário para armazenar edições de placar no formulário
  const [editScores, setEditScores] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [expandedDeadline, setExpandedDeadline] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, [roundFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('round', roundFilter)
        .order('id', { ascending: true });

      if (error) throw error;
      setMatches(data || []);

      // Inicializar o estado de edição com os placares atuais
      const editMap = {};
      data?.forEach(m => {
        editMap[m.id] = {
          home_score: m.home_score !== null ? String(m.home_score) : '',
          away_score: m.away_score !== null ? String(m.away_score) : '',
          status: m.status || 'scheduled',
          guess_deadline: m.guess_deadline || ''
        };
      });
      setEditScores(editMap);
    } catch (err) {
      console.error(err);
      showToast('Erro ao buscar jogos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (matchId, field, val) => {
    setEditScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: val
      }
    }));
  };

  const seedMatches = async () => {
    if (!window.confirm('Tem certeza de que deseja semear os 72 jogos da fase de grupos no banco de dados?')) return;

    setLoading(true);
    try {
      // 1. Verificar se já há jogos inseridos
      const { count, error: countError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      if (count > 0) {
        throw new Error('O banco de dados já possui partidas semeadas! Para semear novamente, você deve limpar as tabelas.');
      }

      // 2. Gerar e inserir jogos
      const seedData = generateMatches();
      const { error: insertError } = await supabase
        .from('matches')
        .insert(seedData);

      if (insertError) throw insertError;

      showToast('Semeação de jogos concluída! 72 partidas da Fase de Grupos criadas.', 'success');
      fetchMatches();
    } catch (err) {
      console.error(err);
      showToast('Erro ao semear jogos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateMatchResult = async (matchId) => {
    const edit = editScores[matchId];
    const match = matches.find(m => m.id === matchId);
    if (!edit || !match) return;

    const hScore = edit.home_score === '' ? null : parseInt(edit.home_score);
    const aScore = edit.away_score === '' ? null : parseInt(edit.away_score);
    const status = edit.status;

    if (status === 'finished' && (hScore === null || aScore === null)) {
      showToast('Para finalizar a partida, você deve preencher os gols!', 'error');
      return;
    }

    // Confirmação extra se estiver alterando um jogo já encerrado
    if (match.status === 'finished') {
      const confirmed = window.confirm(
        `⚠️ ATENÇÃO: O jogo #${matchId} (${match.home_team} x ${match.away_team}) já está ENCERRADO.\n\n` +
        `Alterar o resultado irá RECALCULAR os pontos de todos os palpitadores!\n\n` +
        `Tem certeza que deseja continuar?`
      );
      if (!confirmed) return;
    }

    setSavingId(matchId);
    try {
      // Processar deadline: converter de datetime-local para ISO string ou null
      let deadlineValue = null;
      if (edit.guess_deadline) {
        deadlineValue = new Date(edit.guess_deadline).toISOString();
      }

      const { error } = await supabase
        .from('matches')
        .update({
          home_score: hScore,
          away_score: aScore,
          status: status,
          guess_deadline: deadlineValue
        })
        .eq('id', matchId);

      if (error) throw error;
      showToast(`Jogo #${matchId} atualizado! ${status === 'finished' ? 'Pontuações recalculadas ✅' : ''}`, 'success');

      // Atualiza a lista local
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, home_score: hScore, away_score: aScore, status, guess_deadline: deadlineValue } : m)
      );
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar jogo: ' + err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const recalculateAllPoints = async () => {
    const confirmed = window.confirm(
      '⚙️ Recalcular TODOS os pontos do bolão?\n\n' +
      'Esta ação irá reprocessar os palpites de todos os jogos finalizados e atualizar o ranking. Use se suspeitar de inconsistências.'
    );
    if (!confirmed) return;

    setRecalcLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_recalculate_all_points');
      if (error) throw error;
      showToast(data || 'Recálculo concluído com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao recalcular: ' + err.message, 'error');
    } finally {
      setRecalcLoading(false);
    }
  };

  if (!profile?.is_admin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)', fontWeight: 'bold' }} className="glass-panel">
        ⚠️ Acesso Negado: Apenas administradores do bolão podem acessar esta página.
      </div>
    );
  }

  return (
    <div>
      {/* Caixa de Ações Rápidas */}
      <div className="seed-alert-box" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <Database size={18} color="var(--accent-blue)" /> Setup Inicial do Bolão
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Se você acabou de configurar o banco de dados, use os botões ao lado.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%)', boxShadow: '0 4px 15px var(--accent-blue-glow)' }}
            onClick={seedMatches}
          >
            Semear 72 Jogos
          </button>
          <button
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
            onClick={recalculateAllPoints}
            disabled={recalcLoading}
          >
            <RefreshCw size={14} style={{ marginRight: '5px' }} />
            {recalcLoading ? 'Recalculando...' : 'Recalcular Pontos'}
          </button>
        </div>
      </div>

      {/* Seletor de Fase */}
      <div className="filter-bar glass-panel" style={{ padding: '15px 20px', borderRadius: 'var(--radius-sm)' }}>
        <select
          className="select-filter"
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          <option value="Fase de Grupos">Fase de Grupos</option>
          <option value="Rodada de 32">Dezesseis-avos (Rodada de 32)</option>
          <option value="Oitavas de Final">Oitavas de Final</option>
          <option value="Quartas de Final">Quartas de Final</option>
          <option value="Semifinais">Semifinais</option>
          <option value="Disputa de 3º lugar">Disputa de 3º lugar</option>
          <option value="Final">Final</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Carregando partidas...</div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          Nenhuma partida encontrada para esta fase. Clique em "Semear 72 Jogos" acima se for a Fase de Grupos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {matches.map(match => {
            const edit = editScores[match.id] || { home_score: '', away_score: '', status: 'scheduled', guess_deadline: '' };
            const isFinished = match.status === 'finished';
            const showDeadline = expandedDeadline === match.id;

            return (
              <div key={match.id} className={`match-card glass-panel admin-card ${isFinished ? 'finished' : ''}`}>
                {/* Header com indicação de jogo finalizado */}
                {isFinished && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                    <AlertTriangle size={12} />
                    Jogo encerrado — alterações disparam recálculo de pontos!
                  </div>
                )}

                {/* Time da casa e inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', width: '35px' }}>
                    #{match.id}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
                    {renderFlag(match.home_team_flag)}
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{match.home_team}</span>
                  </div>

                  <div className="admin-match-controls">
                    <input
                      type="number"
                      min="0"
                      className="admin-match-score-input"
                      value={edit.home_score}
                      onChange={(e) => handleScoreChange(match.id, 'home_score', e.target.value)}
                      placeholder="-"
                    />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>x</span>
                    <input
                      type="number"
                      min="0"
                      className="admin-match-score-input"
                      value={edit.away_score}
                      onChange={(e) => handleScoreChange(match.id, 'away_score', e.target.value)}
                      placeholder="-"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px', marginLeft: '10px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{match.away_team}</span>
                    {renderFlag(match.away_team_flag)}
                  </div>
                </div>

                {/* Status, Deadline e Botão Salvar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <select
                    className="select-filter"
                    value={edit.status}
                    onChange={(e) => handleScoreChange(match.id, 'status', e.target.value)}
                    style={{ minWidth: '130px', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="live">Ao Vivo 🔴</option>
                    <option value="finished">Encerrado 🏁</option>
                  </select>

                  {/* Toggle Prazo de Palpite */}
                  <button
                    className="nav-button"
                    onClick={() => setExpandedDeadline(showDeadline ? null : match.id)}
                    style={{ fontSize: '0.78rem', padding: '6px 10px', border: '1px solid var(--card-border)', gap: '4px' }}
                    title="Definir prazo de palpite"
                  >
                    <Clock size={12} />
                    {match.guess_deadline ? 'Prazo definido ✓' : 'Definir prazo'}
                  </button>

                  <button
                    className="admin-btn-save"
                    onClick={() => updateMatchResult(match.id)}
                    disabled={savingId === match.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Save size={14} />
                    {savingId === match.id ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>

                {/* Painel expandido de prazo */}
                {showDeadline && (
                  <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      📅 Prazo limite para palpites (deixe em branco para usar a data do jogo):
                    </label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formatDateTimeLocal(edit.guess_deadline)}
                      onChange={(e) => handleScoreChange(match.id, 'guess_deadline', e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '8px 12px', width: 'auto' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Dica: Para fechar palpites 1 dia antes do primeiro jogo da rodada, defina a mesma data/hora para todos os jogos do grupo.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
