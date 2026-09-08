import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Building2, TrendingUp, Presentation } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardOverview() {
  const { facultyData, studentData, filters, setFilters } = useData();
  const navigate = useNavigate();

  // Protect empty screens entirely
  if (!facultyData.length && !studentData.length) return null;

  const handleCardClick = (filterUpdate, route) => {
      setFilters(prev => ({ ...prev, ...filterUpdate }));
      navigate(route);
  };

  // Compile active aggregate numbers for the most recent/selected year filter
  const activeYearText = filters.academicYear && filters.academicYear !== 'All' ? filters.academicYear : 'All Years';
  
  const activeFaculty = facultyData.filter(f => activeYearText === 'All Years' || f.academicYear === activeYearText);
  const activeStudents = studentData.filter(s => activeYearText === 'All Years' || s.academicYear === activeYearText);

  // Deep Demographic Computations for Top Cards
  const totalFacultyCount = activeFaculty.length;
  const totalStudentCount = activeStudents.length;

  const phDCount = activeFaculty.filter(f => f.phdStatus?.toLowerCase().includes('yes')).length;
  const femaleStudentCount = activeStudents.filter(s => {
      let g = s.GENDER ? s.GENDER.toString().toLowerCase() : '';
      return g === 'female' || g === 'f';
  }).length;
  const maleStudentCount = activeStudents.filter(s => {
      let g = s.GENDER ? s.GENDER.toString().toLowerCase() : '';
      return g === 'male' || g === 'm';
  }).length;

  // Compile Year-by-Year Visualization Arrays for Charting
  const yearWiseData = useMemo(() => {
     const dataMap = {};
     
     // Map faculty records
     facultyData.forEach(f => {
         const y = f.academicYear || 'Unknown';
         if (!dataMap[y]) dataMap[y] = { name: y, Faculty: 0, Students: 0 };
         dataMap[y].Faculty += 1;
     });
     
     // Map student records
     studentData.forEach(s => {
         const y = s.academicYear || 'Unknown';
         if (!dataMap[y]) dataMap[y] = { name: y, Faculty: 0, Students: 0 };
         dataMap[y].Students += 1;
     });
     
     // Return sorted array
     const chartData = Object.values(dataMap).sort((a, b) => a.name.localeCompare(b.name));
     
     // Filter out 'Unknown' if we have actual years
     return chartData.filter(d => d.name !== 'Unknown' || chartData.length === 1);
  }, [facultyData, studentData]);

  // Aggregate student courses
  const topCourses = useMemo(() => {
     let courses = {};
     activeStudents.forEach(s => {
         const cName = s.CourseName || 'Unassigned';
         courses[cName] = (courses[cName] || 0) + 1;
     });
     return Object.entries(courses)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5) // top 5
                  .map(([name, count]) => ({ name, count }));
  }, [activeStudents]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 className="text-h1">Institutional Overview Dashboard</h1>
           <p className="text-muted" style={{ marginTop: '0.25rem' }}>Visualizing metrics for: <strong>{activeYearText}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <div className="status-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-default)' }}>
              <TrendingUp size={14} style={{ marginRight: '0.25rem' }} /> Live Analytics
           </div>
        </div>
      </div>

      {/* Aggregate Statistics Overview */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        {/* FACULTY STATS */}
        <div className="stat-card" onClick={() => handleCardClick({ qualification: 'All' }, '/faculty')}>
          <div className="stat-icon-wrapper">
             <Users size={20} className="stat-icon" />
          </div>
          <div className="stat-value">{totalFacultyCount}</div>
          <div className="stat-label">Total Faculty</div>
        </div>
        
        <div className="stat-card" onClick={() => handleCardClick({ phdStatus: 'Yes' }, '/faculty')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
             <Building2 size={20} style={{ color: 'inherit' }} />
          </div>
          <div className="stat-value">{phDCount}</div>
          <div className="stat-label">Ph.D. Holders</div>
        </div>
        
        {/* STUDENT STATS */}
        <div className="stat-card" onClick={() => handleCardClick({}, '/students')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
             <GraduationCap size={20} style={{ color: 'inherit' }} />
          </div>
          <div className="stat-value">{totalStudentCount}</div>
          <div className="stat-label">Total Students Enrolled</div>
        </div>

        <div className="stat-card" onClick={() => handleCardClick({}, '/students')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fdf4ff', color: '#c026d3' }}>
             <Users size={20} style={{ color: 'inherit' }} />
          </div>
          <div className="stat-value">{femaleStudentCount} <span style={{fontSize: '1rem', color: '#94a3b8', opacity: 0.7}}>| {maleStudentCount}</span></div>
          <div className="stat-label">Female | Male Ratio</div>
        </div>
      </div>

      {/* Analytics Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         
         {/* YEAR-WISE BARCHART COMPACT */}
         <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Multi-Year Institutional Growth</h3>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={yearWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip 
                     cursor={{ fill: 'var(--bg-surface-hover)' }}
                     contentStyle={{ backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'blur(8px)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Faculty" fill="var(--primary-default)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* STUDENT COURSE DISTRIBUTION */}
         <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Presentation size={18} /> Top Course Enrollments ({activeYearText})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               {topCourses.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No specific course data available.</div>
               ) : (
                  topCourses.map((course, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-hover)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)'
                       }}>
                          #{idx + 1}
                       </div>
                       <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{course.name}</span>
                          <div style={{ width: '100%', backgroundColor: 'var(--bg-surface-hover)', height: '6px', borderRadius: '3px', marginTop: '0.5rem' }}>
                             <div style={{ 
                                 width: `${Math.min(100, (course.count / totalStudentCount) * 100)}%`, 
                                 backgroundColor: 'var(--primary-default)', 
                                 height: '100%', 
                                 borderRadius: '3px' 
                             }}></div>
                          </div>
                       </div>
                       <div style={{ fontWeight: 600, width: '40px', textAlign: 'right' }}>{course.count}</div>
                    </div>
                  ))
               )}
            </div>
         </div>

      </div>
    </div>
  );
}
