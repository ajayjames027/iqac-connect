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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'url("./bg.jpg") center/cover no-repeat',
      position: 'relative'
    }}>
       {/* Transparent Dark Overlay across the entire background for readability */}
       <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)', // Little Transparency
          backdropFilter: 'blur(3px)',
          zIndex: 1
       }}></div>

       <div className="animate-fade-in" style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '2.5rem', 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          zIndex: 2,
          color: '#fff'
       }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
             <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                display: 'inline-flex', 
                padding: '1rem', 
                borderRadius: '50%',
                marginBottom: '1.25rem'
             }}>
                 <Shield size={42} color="#fff" />
             </div>
             <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>IQAC Connect</h1>
             <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Faculty Information System</p>
          </div>
          
          {error && (
             <div style={{ background: 'rgba(211, 47, 47, 0.9)', color: '#fff', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>
                 {error}
             </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                 <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)' }} />
                    <input 
                       type="email"
                       style={{ 
                          width: '100%', 
                          padding: '0.85rem 1rem 0.85rem 3rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease'
                       }} 
                       placeholder="Email Address" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       onFocus={(e) => e.target.style.background = 'rgba(0,0,0,0.3)'}
                       onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.2)'}
                    />
                 </div>
              </div>
              
              <div>
                 <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)' }} />
                    <input 
                       type="password"
                       style={{ 
                          width: '100%', 
                          padding: '0.85rem 1rem 0.85rem 3rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease'
                       }} 
                       placeholder="Password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       onFocus={(e) => e.target.style.background = 'rgba(0,0,0,0.3)'}
                       onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.2)'}
                    />
                 </div>
              </div>

              <button type="submit" disabled={loading} style={{ 
                 background: '#fff', 
                 color: '#000', 
                 border: 'none', 
                 padding: '0.85rem',
                 borderRadius: '8px',
                 fontSize: '1rem',
                 fontWeight: 600,
                 cursor: 'pointer',
                 marginTop: '0.5rem',
                 transition: 'transform 0.1s ease',
                 opacity: loading ? 0.7 : 1
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                 {loading ? 'Authenticating...' : 'Sign In'}
              </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
             <p>Access restricted to authorized personnel.</p>
          </div>
       </div>
    </div>
  );
}
