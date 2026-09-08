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
  const { logout, isAdmin } = useAuth();
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
    <div className="app-container" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Sleek icon-only sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
             <Users size={20} color="#fff" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              title={item.name}
            >
              <item.icon size={22} />
            </Link>
          ))}
          {isAdmin && (
               <button className="nav-item" onClick={() => document.getElementById('file-upload-global').click()} title="Upload Dataset" style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', marginTop: 'auto' }}>
                  <Upload size={22} />
               </button>
          )}
        </nav>

        <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
           <button className="nav-item" onClick={toggleTheme} title="Toggle Theme" style={{ border: 'none', background: 'transparent' }}>
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
           </button>
           <button className="nav-item" onClick={logout} title="Log Out" style={{ border: 'none', background: 'transparent' }}>
               <LogOut size={22} />
           </button>
        </div>
      </aside>

      {/* Hidden Upload Controller */}
      <input
         type="file"
         id="file-upload-global"
         accept=".xlsx, .xls"
         style={{ display: 'none' }}
         onChange={(e) => {
             const t = window.prompt("Type 'student' or 'faculty' for the data target:");
             if (t !== 'student' && t !== 'faculty') return alert("Invalid target");
             const y = window.prompt("Type academic year chunk (e.g. 2026-2027):");
             if (!y) return alert("Invalid year");
             handleFileUpload(e, { type: t, year: y });
         }}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-scroll" style={{ padding: 0 }}>
          {!hasData ? (
             <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Upload size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>No Data Available</h2>
                <p>Please upload the Faculty or Student Details Excel file using the sidebar upload button.</p>
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
