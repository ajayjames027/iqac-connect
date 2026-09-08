import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, AlertOctagon, Upload, Sun, Moon, Search } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';

// Pages
import DashboardOverview from './pages/DashboardOverview';
import CategoryDashboard from './pages/CategoryDashboard';
import CategoryDetail from './pages/CategoryDetail';
import DataQuality from './pages/DataQuality';
import FacultyList from './pages/FacultyList';

export default function App() {
  return (
    <DataProvider>
      <Router>
        <AppLayout />
      </Router>
    </DataProvider>
  );
}

function AppLayout() {
  const { uploadExcel, lastUpdated, fileName, error, hasData } = useData();
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadExcel(file);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Faculty (26-27)', path: '/faculty', icon: Users },
    { name: 'Categories Compliance', path: '/categories', icon: FolderOpen },
    { name: 'Data Quality', path: '/quality', icon: AlertOctagon },
  ];

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
           <label className="btn btn-primary" style={{ width: '100%', cursor: 'pointer' }}>
             <Upload size={18} />
             <span>Upload / Update</span>
             <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
           </label>
           {lastUpdated && (
             <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               <strong>Data Source:</strong> {fileName}<br/>
               <strong>Updated:</strong> {lastUpdated}
             </div>
           )}

           <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <p className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Coming Soon Architecture</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                    <FolderOpen size={16} /> Previous Years (23-25)
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                    <Users size={16} /> Student Details DB
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ height: 'var(--header-height)', backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', zIndex: 10 }}>
            {error && (
               <div style={{ color: 'var(--danger-text)', marginRight: 'auto', fontWeight: 'bold' }}>
                 {error}
               </div>
            )}
            <button onClick={toggleTheme} className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.5rem' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </header>
        
        <div className="content-scroll">
          {!hasData && !error ? (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Upload size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>No Data Available</h2>
                <p>Please upload the Faculty Details Excel file to generate the dashboard.</p>
             </div>
          ) : (
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/faculty" element={<FacultyList />} />
              <Route path="/categories" element={<CategoryDashboard />} />
              <Route path="/categories/:categoryName" element={<CategoryDetail />} />
              <Route path="/quality" element={<DataQuality />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  );
}
