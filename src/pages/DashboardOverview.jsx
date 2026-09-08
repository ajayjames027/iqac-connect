import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building2, TrendingUp, Presentation, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function DashboardOverview() {
  const { facultyData, studentData, filters, setFilters } = useData();
  const navigate = useNavigate();

  if (!facultyData.length && !studentData.length) return null;

  const handleCardClick = (route, yearFilter) => {
      setFilters(prev => ({ ...prev, academicYear: yearFilter }));
      navigate(route);
  };

  // Compile Year-by-Year Visualization Arrays for Charting
  const yearWiseData = useMemo(() => {
     const dataMap = {};
     
     // Map faculty records
     facultyData.forEach(f => {
         const y = f.academicYear || 'Unknown';
         if (y === 'Unknown') return;
         if (!dataMap[y]) dataMap[y] = { name: y, Faculty: 0, Students: 0, PhD: 0, Male: 0, Female: 0 };
         dataMap[y].Faculty += 1;
         if (f.phdStatus?.toLowerCase().includes('yes')) dataMap[y].PhD += 1;
     });
     
     // Map student records
     studentData.forEach(s => {
         const y = s.academicYear || 'Unknown';
         if (y === 'Unknown') return;
         if (!dataMap[y]) dataMap[y] = { name: y, Faculty: 0, Students: 0, PhD: 0, Male: 0, Female: 0 };
         dataMap[y].Students += 1;
         
         const g = s.GENDER ? s.GENDER.toString().toLowerCase() : '';
         if (g === 'female' || g === 'f') dataMap[y].Female += 1;
         if (g === 'male' || g === 'm') dataMap[y].Male += 1;
     });
     
     return Object.values(dataMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [facultyData, studentData]);

  const activeYearText = filters.academicYear && filters.academicYear !== 'All' ? filters.academicYear : 'All Years';
  
  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
        <div>
           <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(90deg, var(--primary-default), #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Institutional Analytics
           </h1>
           <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '1.05rem' }}>Comprehensive Year-Over-Year Academic Insights</p>
        </div>
        <div className="status-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-default)', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.15)' }}>
            <TrendingUp size={16} style={{ marginRight: '0.5rem' }} /> Live Database Sync
        </div>
      </div>

      {/* Massive Year-over-Year Growth Chart */}
      {yearWiseData.length > 0 && (
          <div className="card" style={{ padding: '2rem', marginBottom: '3rem', border: 'none', background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-surface-hover))', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
             <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Evolution Trajectory
             </h3>
             <div style={{ height: '350px', width: '100%' }}>
               <ResponsiveContainer>
                 <AreaChart data={yearWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorFaculty" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '1rem' }}
                      itemStyle={{ fontWeight: 600 }}
                   />
                   <Area type="monotone" dataKey="Students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                   <Area type="monotone" dataKey="Faculty" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorFaculty)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
      )}

      {/* Dynamic Year-Wise Data Blocks */}
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="var(--primary-default)" /> Year-Wise Split Up
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {yearWiseData.map((yearObj, idx) => (
             <div key={idx} style={{
                 background: 'var(--bg-surface)',
                 borderRadius: '20px',
                 padding: '2rem',
                 border: '1px solid var(--border-color)',
                 boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
                 position: 'relative',
                 overflow: 'hidden',
                 transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                 cursor: 'pointer'
             }} 
             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.12)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.08)'; }}
             onClick={() => handleCardClick('/faculty', yearObj.name)}
             >
                 {/* Decorative background circle */}
                 <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))', borderRadius: '50%', filter: 'blur(20px)', zIndex: 0 }}></div>
                 
                 <div style={{ position: 'relative', zIndex: 1 }}>
                     <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--primary-text)' }}>
                        {yearObj.name}
                     </h3>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)' }}>
                         <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Faculty</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-default)' }}>{yearObj.Faculty}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{Math.round((yearObj.PhD / (yearObj.Faculty || 1))*100)}% Ph.D.</p>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Students</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>{yearObj.Students}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                               <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{yearObj.Male} M</span>
                               <span>|</span>
                               <span style={{ color: '#ec4899', fontWeight: 600 }}>{yearObj.Female} F</span>
                            </div>
                         </div>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-default)', fontWeight: 600, fontSize: '0.9rem' }}>
                         Explore Database <ArrowRight size={16} />
                     </div>
                 </div>
             </div>
          ))}
      </div>

    </div>
  );
}
