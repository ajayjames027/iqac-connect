import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, AlertOctagon, Upload, Sun, Moon, Search, BookOpen, LogOut } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';

// Pages
import DashboardOverview from './pages/DashboardOverview';
import UploadHistory from './pages/UploadHistory';
import FacultyList from './pages/FacultyList';
import StudentsList from './pages/StudentsList';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRouter />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

function AppRouter() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Login />;
  return <AppLayout />;
}

function AppLayout() {
  const { handleFileUpload, lastUpdated, fileName, facultyData, studentData } = useData();
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  
  const hasData = facultyData.length > 0 || studentData.length > 0;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Faculty Registry', path: '/faculty', icon: Users },
    { name: 'Student Data', path: '/students', icon: BookOpen }
  ];
  
  if (isAdmin) {
    navItems.push({ name: 'Upload Status', path: '/history', icon: AlertOctagon });
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 className="text-h2" style={{ color: 'var(--primary-text)' }}>IQAC Connect</h1>
          <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>Faculty Information System</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
            return (
              <Link 
                key={item.name} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
           {isAdmin && (
             <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <div className="input-group">
                  <label className="input-label">Target Dataset:</label>
                  <select 
                     className="input-field" 
                     style={{ width: '100%', fontSize: '0.8rem', padding: '0.35rem 0.5rem', minHeight: 'auto' }}
                     onChange={(e) => {
                        const [t, y] = e.target.value.split('|');
                        window.currentTargetDataset = { type: t, year: y };
                     }}
                     defaultValue="faculty|2026-2027"
                  >
                      <optgroup label="Faculty Arrays">
                        <option value="faculty|2026-2027">Faculty 2026-2027</option>
                        <option value="faculty|2025-2026">Faculty 2025-2026</option>
                        <option value="faculty|2024-2025">Faculty 2024-2025</option>
                      </optgroup>
                      <optgroup label="Student Arrays">
                        <option value="student|2026-2027">Students 2026-2027</option>
                        <option value="student|2025-2026">Students 2025-2026</option>
                        <option value="student|2024-2025">Students 2024-2025</option>
                      </optgroup>
                  </select>
               </div>
               
               <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={() => document.getElementById('file-upload').click()}>
                 <Upload size={18} /> Upload / Update
               </button>
               <input
                 type="file"
                 id="file-upload"
                 accept=".xlsx, .xls"
                 style={{ display: 'none' }}
                 onChange={(e) => handleFileUpload(e, window.currentTargetDataset || { type: 'faculty', year: '2026-2027' })}
               />
             </div>
           )}
           {lastUpdated && (
             <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               <strong>Data Source:</strong> {fileName}<br/>
               <strong>Updated:</strong> {lastUpdated}
             </div>
           )}

        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ height: 'var(--header-height)', backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', zIndex: 10, gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-default)' }}>
                 {currentUser.email}
            </span>
            <button onClick={toggleTheme} className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.5rem' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }} onClick={logout} title="Log Out">
               <LogOut size={20} />
            </button>
        </header>

        <div className="content-scroll">
          {!hasData ? (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Upload size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>No Data Available</h2>
                <p>Please upload the Faculty or Student Details Excel file using the sidebar.</p>
             </div>
          ) : (
             <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/faculty" element={<FacultyList />} />
                <Route path="/history" element={<UploadHistory />} />
                <Route path="/students" element={<StudentsList />} />
             </Routes>
          )}
        </div>
      </main>
    </div>
  );
}

