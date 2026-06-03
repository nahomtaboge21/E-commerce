import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card card">
        <div className="auth-logo"><span>⬡</span> ShopVine</div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com" /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required placeholder="••••••••" /></div>
          {error && <p className="form-error" style={{marginBottom:12}}>{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading ? <span className="spinner" style={{width:18,height:18}}/> : 'Sign In'}
          </button>
        </form>
        <div className="auth-demo">
          <p>Demo credentials:</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            <button className="btn btn-outline btn-sm" onClick={()=>setForm({email:'admin@shopvine.com',password:'admin123'})}>Use Admin</button>
            <button className="btn btn-outline btn-sm" onClick={()=>setForm({email:'jane@example.com',password:'user123'})}>Use User</button>
          </div>
        </div>
        <p className="auth-switch">Don't have an account? <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}>Sign up</Link></p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card card">
        <div className="auth-logo"><span>⬡</span> ShopVine</div>
        <h1>Create account</h1>
        <p className="auth-sub">Start shopping today</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="Jane Smith" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com" /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required placeholder="Min 6 characters" /></div>
          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} required placeholder="••••••••" /></div>
          {error && <p className="form-error" style={{marginBottom:12}}>{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading ? <span className="spinner" style={{width:18,height:18}}/> : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
