import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Ranking from './components/Ranking';
import Admin from './components/Admin';
import Regras from './components/Regras';
import { LogOut, LayoutDashboard, Trophy, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado do Toast Notification
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  useEffect(() => {
    // 1. Escutar sessão inicial e mudanças de autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = nenhuma linha encontrada (perfil não existe no banco)
        if (error.code === 'PGRST116') {
          // Banco foi recriado: tenta criar o perfil manualmente
          const authUser = (await supabase.auth.getUser()).data?.user;
          if (authUser) {
            const username =
              authUser.user_metadata?.username ||
              authUser.email?.split('@')[0] ||
              'usuario';
            const { data: created, error: createErr } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                username,
                total_points: 0,
                exact_scores_count: 0,
                is_admin: false
              })
              .select()
              .single();
            if (!createErr) {
              setProfile(created);
              showToast('Perfil recriado com sucesso! Bem-vindo de volta.', 'success');
            } else {
              console.error('Erro ao recriar perfil:', createErr.message);
              // Aguarda trigger e tenta novamente
              setTimeout(async () => {
                const { data: r } = await supabase
                  .from('profiles').select('*').eq('id', userId).single();
                if (r) setProfile(r);
              }, 1500);
            }
          }
        } else {
          // Outro erro: aguarda trigger e tenta novamente
          console.warn('Erro ao buscar perfil:', error.message);
          setTimeout(async () => {
            const { data: retryData } = await supabase
              .from('profiles').select('*').eq('id', userId).single();
            if (retryData) setProfile(retryData);
          }, 1200);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (newSession, newUser) => {
    setSession(newSession);
    setUser(newUser);
    fetchProfile(newUser.id);
    showToast('Login realizado com sucesso! Bem-vindo.', 'success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setActiveTab('dashboard');
    showToast('Sessão encerrada com sucesso.', 'success');
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ffffff']
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Iniciando o Bolão...
      </div>
    );
  }

  // Se não estiver logado, exibe tela de Login
  if (!session || !user) {
    return (
      <div className="container">
        <Login onAuthSuccess={handleAuthSuccess} />
        
        {/* Toast Toast de Notificação */}
        <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Cabeçalho Principal */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">🏆</div>
          <div>
            <h1 className="app-title">Bolão Copa '26</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Para brincar com os amigos</span>
          </div>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} /> Jogos e Palpites
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            <Trophy size={16} /> Classificação
          </button>

          <button 
            className={`nav-button ${activeTab === 'regras' ? 'active' : ''}`}
            onClick={() => setActiveTab('regras')}
          >
            <BookOpen size={16} /> Regras
          </button>

          {profile?.is_admin && (
            <button 
              className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ borderLeft: '1px solid var(--card-border)' }}
            >
              <ShieldAlert size={16} color="var(--accent-gold)" /> Admin Panel
            </button>
          )}
        </nav>
      </header>

      {/* Barra de Perfil e Estatísticas Rápidas do Usuário */}
      <div className="user-bar glass-panel">
        <div className="user-profile-info">
          <div className="avatar-placeholder" onClick={triggerConfetti} style={{ cursor: 'pointer' }} title="Clique para comemorar!">
            {(profile?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              @{profile?.username || 'usuário'}
              <Sparkles size={14} color="var(--accent-gold)" style={{ cursor: 'pointer' }} onClick={triggerConfetti} />
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {profile?.is_admin ? '👑 Administrador' : '⚽ Participante'}
            </span>
          </div>
        </div>

        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-value text-gradient-gold">{profile?.total_points ?? 0}</span>
            <span className="stat-label">Meus Pontos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-gradient-green">{profile?.exact_scores_count ?? 0}</span>
            <span className="stat-label">Placares Exatos</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="nav-button" 
            style={{ color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', marginLeft: '10px' }}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <main style={{ minHeight: '60vh' }}>
        {activeTab === 'dashboard' && (
          <Dashboard user={user} showToast={showToast} />
        )}
        
        {activeTab === 'ranking' && (
          <Ranking currentUser={profile} showToast={showToast} />
        )}

        {activeTab === 'regras' && (
          <Regras />
        )}

        {activeTab === 'admin' && profile?.is_admin && (
          <Admin profile={profile} showToast={showToast} />
        )}
      </main>

      {/* Rodapé */}
      <footer style={{ marginTop: '50px', padding: '20px 0', borderTop: '1px solid var(--card-border)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>⚽ Bolão da Copa do Mundo 2026 - Desenvolvido para brincar de graça com os amigos.</p>
      </footer>

      {/* Toast de Notificação */}
      <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type === 'error' ? 'error' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}
