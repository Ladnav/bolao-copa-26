import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

// Email sintético gerado a partir do username para uso interno do Supabase Auth.
// O usuário nunca vê ou precisa de um email real.
const buildFakeEmail = (username) =>
  `${username.trim().toLowerCase().replace(/\s+/g, '_')}@bolao26.app`;

export default function Login({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        throw new Error('Por favor, informe seu nome de usuário.');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      const fakeEmail = buildFakeEmail(trimmedUsername);

      if (isSignUp) {
        // --- CADASTRO ---
        if (password !== confirmPassword) {
          throw new Error('As senhas não conferem. Verifique e tente novamente.');
        }

        // Verificar se username já está em uso
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', trimmedUsername)
          .maybeSingle();

        if (existing) {
          throw new Error(`O usuário "@${trimmedUsername}" já está sendo usado. Escolha outro nome.`);
        }

        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: { username: trimmedUsername }
          }
        });

        if (error) throw error;

        if (data?.user && data?.session) {
          onAuthSuccess(data.session, data.user);
        } else {
          // Caso email confirmation esteja ativo no Supabase (deve ser desativado)
          setSuccessMsg(
            '✅ Conta criada! Se pediu confirmação de email, desative essa opção no Supabase Auth Settings → ' +
            '"Email Auth" → desmarque "Confirm email".'
          );
          setIsSignUp(false);
        }
      } else {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password
        });

        if (error) {
          // Erro genérico de credenciais inválidas → mensagem mais amigável
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Usuário ou senha incorretos. Verifique e tente novamente.');
          }
          throw error;
        }

        if (data?.session) {
          onAuthSuccess(data.session, data.user);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Validação visual de senha em tempo real (apenas no cadastro)
  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">🏆</div>
          <h2>{isSignUp ? 'Criar Conta no Bolão' : "Entrar no Bolão Copa '26"}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
            {isSignUp
              ? 'Escolha um nome e senha para começar a palpitar'
              : 'Use seu nome de usuário e senha para entrar'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {/* Campo Usuário */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              {isSignUp ? 'Seu Nome / Apelido' : 'Nome de Usuário'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: '13px', color: 'var(--text-secondary)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                id="login-username"
                className="form-input"
                placeholder={isSignUp ? 'Ex: Pedrinho, Zé da Copa...' : 'Seu nome de usuário'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="username"
                required
              />
            </div>
            {isSignUp && username.trim() && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Aparecerá no ranking como <strong style={{ color: 'var(--accent-green)' }}>@{username.trim()}</strong>
              </span>
            )}
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '13px', color: 'var(--text-secondary)', pointerEvents: 'none' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '42px' }}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', display: 'flex' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Senha — apenas no cadastro */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="login-confirm">Confirmar Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute', left: '13px', pointerEvents: 'none',
                    color: passwordMatch ? 'var(--accent-green)' : passwordMismatch ? 'var(--error)' : 'var(--text-secondary)'
                  }}
                />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="login-confirm"
                  className="form-input"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '42px',
                    borderColor: passwordMatch
                      ? 'rgba(16, 185, 129, 0.5)'
                      : passwordMismatch
                      ? 'rgba(239, 68, 68, 0.5)'
                      : undefined
                  }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', display: 'flex' }}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Feedback visual de confirmação */}
              {passwordMatch && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} /> Senhas conferem!
                </span>
              )}
              {passwordMismatch && (
                <span style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '4px', display: 'block' }}>
                  ⚠️ As senhas não conferem
                </span>
              )}
            </div>
          )}

          {/* Mensagens de erro e sucesso */}
          {errorMsg && (
            <div style={{
              color: 'var(--error)',
              fontSize: '0.85rem',
              margin: '10px 0',
              fontWeight: '500',
              background: 'rgba(239,68,68,0.08)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              color: 'var(--success)',
              fontSize: '0.85rem',
              margin: '10px 0',
              fontWeight: '500',
              background: 'rgba(16,185,129,0.08)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || (isSignUp && passwordMismatch)}
            style={{ marginTop: '12px', width: '100%' }}
          >
            {loading ? 'Processando...' : isSignUp ? '🚀 Criar minha conta' : '⚡ Entrar'}
          </button>
        </form>

        <div className="auth-switch">
          {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          <span
            className="auth-switch-link"
            onClick={() => {
              setIsSignUp(!isSignUp);
              resetForm();
            }}
          >
            {isSignUp ? 'Entrar agora' : 'Criar conta gratuita'}
          </span>
        </div>
      </div>
    </div>
  );
}
