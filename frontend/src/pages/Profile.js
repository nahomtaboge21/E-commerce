import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
    try {
      const payload = { name: form.name };
      if (form.currentPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      await authAPI.updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{padding:'40px 0 80px'}}>
      <div className="container" style={{maxWidth:640}}>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:800,marginBottom:32}}>My Profile</h1>
        <div className="card" style={{padding:32,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:28,paddingBottom:28,borderBottom:'1px solid var(--border)'}}>
            <div style={{width:64,height:64,background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,fontFamily:'var(--font-display)',flexShrink:0}}>{user.avatar}</div>
            <div>
              <p style={{fontSize:18,fontWeight:700}}>{user.name}</p>
              <p style={{color:'var(--text-muted)',fontSize:14}}>{user.email}</p>
              {user.role === 'admin' && <span className="badge badge-danger" style={{marginTop:6}}>Admin</span>}
            </div>
          </div>
          <form onSubmit={handleSave}>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,marginBottom:16}}>Account Details</h3>
            <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email} disabled style={{opacity:0.6}} /></div>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,margin:'24px 0 16px'}}>Change Password</h3>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))} placeholder="Leave blank to keep current" /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))} placeholder="Min 6 characters" /></div>
            {success && <p style={{color:'var(--success)',fontSize:14,marginBottom:12}}>✓ {success}</p>}
            {error && <p className="form-error" style={{marginBottom:12}}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <button className="btn btn-outline" style={{color:'var(--danger)',borderColor:'var(--danger)'}} onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
      </div>
    </div>
  );
}
