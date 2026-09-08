import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch(err) {
      console.error(err);
      setError('Invalid credentials or account does not exist.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-default)' }}>
       <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <Shield size={48} color="var(--primary-default)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
             <h1 className="text-h1">IQAC Connect</h1>
             <p className="text-muted" style={{ marginTop: '0.5rem' }}>Login to access the Faculty Information System</p>
          </div>
          
          {error && (
             <div style={{ background: '#fdeded', color: '#d32f2f', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                 {error}
             </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-group">
                 <label className="input-label">Email Address</label>
                 <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                       type="email" 
                       className="input-field" 
                       style={{ paddingLeft: '2.5rem' }} 
                       placeholder="admin@iqac.com" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>
              
              <div className="input-group">
                 <label className="input-label">Password</label>
                 <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                       type="password" 
                       className="input-field" 
                       style={{ paddingLeft: '2.5rem' }} 
                       placeholder="••••••••" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
                 {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
             <p>Access is restricted to authorized personnel.</p>
             <p>Create an account in the Firebase Console.</p>
          </div>
       </div>
    </div>
  );
}
