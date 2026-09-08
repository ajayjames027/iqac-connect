import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, AlertOctagon, Upload, Sun, Moon, Search, BookOpen } from 'lucide-react';
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
  const { handleFileUpload, lastUpdated, fileName, facultyData, studentData } = useData();
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
    { name: 'Categories Compliance', path: '/categories', icon: FolderOpen },
    { name: 'Data Quality', path: '/quality', icon: AlertOctagon },
    { name: 'Student Data', path: '/students', icon: Users }
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
           <div style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Target Dataset:</label>
              <select 
                 className="input-field" 
                 style={{ width: '100%', fontSize: '0.8rem', padding: '0.35rem 0.5rem', minHeight: 'auto' }}
                 onChange={(e) => window.currentTargetDataset = e.target.value}
                 defaultValue="2026-2027"
              >
                  <option value="2026-2027">Faculty 2026-2027</option>
                  <option value="2025-2026">Faculty 2025-2026</option>
                  <option value="2024-2025">Faculty 2024-2025</option>
                  <option value="Students">Student Details Database</option>
              </select>
           </div>
           
           <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => document.getElementById('file-upload').click()}>
             <Upload size={18} /> Upload / Update
           </button>
           <input
             type="file"
             id="file-upload"
             accept=".xlsx, .xls"
             style={{ display: 'none' }}
             onChange={(e) => handleFileUpload(e, window.currentTargetDataset || '2026-2027')}
           />{lastUpdated && (
             <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               <strong>Data Source:</strong> {fileName}<br/>
               <strong>Updated:</strong> {lastUpdated}
             </div>
           )}

        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ height: 'var(--header-height)', backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', zIndex: 10 }}>
            <button onClick={toggleTheme} className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.5rem' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
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
                <Route path="/categories" element={<CategoryDashboard />} />
                <Route path="/categories/:id" element={<CategoryDetail />} />
                <Route path="/quality" element={<DataQuality />} />
                <Route path="/students" element={<StudentsList />} />
             </Routes>
          )}
        </div>
      </main>
    </div>
  );
}

function StudentsList() {
   const { studentData } = useData();
   return (
       <div className="animate-fade-in">
           <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Student Database</h1>
           <div className="card">
               {studentData.length > 0 ? (
                  <p>Loaded {studentData.length} records. Ready to map student visual architecture!</p>
               ) : (
                  <p>No Student Data loaded. Please select "Student Details Database" in the sidebar and upload.</p>
               )}
           </div>
       </div>
   );
}
