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
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadSelection, setUploadSelection] = useState({ type: 'faculty', year: '2026-2027' });
  
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
               <button className="nav-item" onClick={() => setShowUploadDialog(true)} title="Upload Dataset" style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', marginTop: 'auto' }}>
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

      {/* Interactive Upload Modal */}
      {showUploadDialog && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card animate-fade-in" style={{ width: '400px', backgroundColor: 'var(--bg-surface)' }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '1.5rem' }}>Inject Database Chunk</h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                   <div>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Target Schema</label>
                       <select 
                           value={uploadSelection.type} 
                           onChange={(e) => setUploadSelection(s => ({...s, type: e.target.value}))}
                           style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-surface-hover)' }}
                       >
                           <option value="faculty">Faculty Registry Arrays</option>
                           <option value="student">Student Demographic Arrays</option>
                       </select>
                   </div>
                   <div>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Target Academic Year</label>
                       <select 
                           value={uploadSelection.year} 
                           onChange={(e) => setUploadSelection(s => ({...s, year: e.target.value}))}
                           style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-surface-hover)' }}
                       >
                           <option value="2026-2027">2026-2027</option>
                           <option value="2025-2026">2025-2026</option>
                           <option value="2024-2025">2024-2025</option>
                           <option value="2023-2024">2023-2024</option>
                       </select>
                   </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setShowUploadDialog(false)} style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: 'none', background: 'var(--bg-surface-hover)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
                     Cancel
                  </button>
                  <button onClick={() => { setShowUploadDialog(false); document.getElementById('file-upload-global').click(); }} style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: 'none', background: 'var(--primary-solid)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                     Browse Excel...
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Hidden File Input */}
      <input
         type="file"
         id="file-upload-global"
         accept=".xlsx, .xls"
         style={{ display: 'none' }}
         onChange={(e) => handleFileUpload(e, uploadSelection)}
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
