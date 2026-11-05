import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import kiolunaLogo from '../assets/kioluna-logo.png';
import './Auth.css';

export function Login() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/orders';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error;
      setError(message === 'Email already registered' ? 'このメールアドレスはすでに登録されています。'
        : message === 'Password must be at least 6 characters' ? 'パスワードは6文字以上で入力してください。'
          : message === 'All fields required' ? 'すべての項目を入力してください。'
            : mode === 'login' ? 'メールアドレスまたはパスワードをご確認ください。' : '登録できませんでした。入力内容をご確認ください。');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card card">
        <div className="auth-logo"><img src={kiolunaLogo} alt="Kioluna" /></div>
        <h1>{mode === 'login' ? 'ログイン' : 'アカウントを作成'}</h1>
        <p className="auth-sub">{mode === 'login' ? 'ご注文やアカウント情報をご確認いただけます。' : 'Kiolunaへようこそ。必要事項をご入力ください。'}</p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && <div className="form-group"><label className="form-label">お名前</label><input className="form-input" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required autoComplete="name" /></div>}
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード</label>
            <input className="form-input" type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="6" />
          </div>
          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }}/> : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
          </button>
        </form>
        <p className="auth-sub" style={{ marginTop: 20, marginBottom: 0, textAlign: 'center' }}>
          {mode === 'login' ? '初めてご利用の方は' : 'アカウントをお持ちの方は'}{' '}
          <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? '新規登録' : 'ログイン'}</button>
        </p>
      </div>
    </div>
  );
}
