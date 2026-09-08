import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock, FileCheck, Layers, Sun, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardOverview() {
  const { facultyData, categories, setFilters } = useData();
  const navigate = useNavigate();

  if (!facultyData.length) return null;

  const handleCardClick = (filterUpdate) => {
      setFilters(prev => ({ ...prev, ...filterUpdate }));
      navigate('/faculty');
  };

  // Compute stats
  const totalFaculty = facultyData.length;
  const aidedCount = facultyData.filter(f => f.facultyType?.toLowerCase().includes('aided')).length;
  const coordinatorCount = facultyData.filter(f => f.facultyType?.toLowerCase().includes('coordinator')).length;
  const secretaryCount = facultyData.filter(f => f.facultyType?.toLowerCase().includes('secretary')).length;
  
  const shift1Count = facultyData.filter(f => f.shift?.includes('I') && !f.shift?.includes('II')).length;
  const shift2Count = facultyData.filter(f => f.shift?.includes('II')).length;

  const phdCount = facultyData.filter(f => f.phdStatus?.toLowerCase().includes('yes')).length;
  const guideCount = facultyData.filter(f => f.phdGuide?.toLowerCase().includes('yes')).length;

  // Calculate overall category completions.
  let totalCategories = 0;
  let completedCategories = 0;
  let pendingCategories = 0;
  
  // Chart Data preparation
  const deptDataMap = {};

  facultyData.forEach(f => {
    // Categories calculation
    categories.forEach(c => {
       const val = f.categories[c]?.toLowerCase() || '';
       if (val !== 'not applicable' && val !== 'na' && val !== '-') {
           totalCategories++;
           if (val.includes('yes') || val.includes('completed')) {
               completedCategories++;
           } else if (val.includes('no') || val.includes('pending') || val.includes('progress') || val.includes('not done')) {
               pendingCategories++;
           }
       }
    });

    // Chart Calculation
    if (f.department) {
       if (!deptDataMap[f.department]) {
           deptDataMap[f.department] = { name: f.department, Shift_I: 0, Shift_II: 0, Total: 0 };
       }
       deptDataMap[f.department].Total++;
       if (f.shift === 'I' || f.shift?.includes('I') && !f.shift?.includes('II')) {
           deptDataMap[f.department].Shift_I++;
       } else if (f.shift === 'II' || f.shift?.includes('II')) {
           deptDataMap[f.department].Shift_II++;
       }
    }
  });

  const chartData = Object.values(deptDataMap).sort((a,b) => b.Total - a.Total);

  const mainCards = [
    { title: 'Total Faculty', value: totalFaculty, icon: Users, color: 'var(--primary-text)', bg: 'var(--primary-light)', filter: { phdStatus: 'All' } },
    { title: 'Faculty with Ph.D.', value: phdCount, icon: FileCheck, color: 'var(--danger-text)', bg: 'var(--danger-light)', filter: { phdStatus: 'Yes' } },
    { title: 'Ph.D. Guides', value: guideCount, icon: Users, color: 'var(--success-text)', bg: 'var(--success-light)', filter: { phdGuide: 'Yes' } }
  ];

  const typeCards = [
    { title: 'Aided Faculty', value: aidedCount, icon: BookOpen, filter: { facultyType: 'Aided' } },
    { title: 'Coordinator', value: coordinatorCount, icon: Layers, filter: { facultyType: 'Coordinator' } },
    { title: 'Secretary', value: secretaryCount, icon: Clock, filter: { facultyType: 'Secretary' } }
  ];
  
  const shiftCards = [
    { title: 'Shift I', value: shift1Count, icon: Sun, filter: { shift: 'I' } },
    { title: 'Shift II', value: shift2Count, icon: Moon, filter: { shift: 'II' } }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-h1" style={{ marginBottom: '2rem' }}>Institutional Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         {mainCards.map((card, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => handleCardClick(card.filter)}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: card.bg, color: card.color }}>
                <card.icon size={28} />
              </div>
              <div>
                <h3 className="text-h3">{card.value}</h3>
                <p className="text-sm text-muted">{card.title}</p>
              </div>
            </div>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
         <div className="glass-panel" style={{ padding: '1.5rem' }}>
             <h2 className="text-h2" style={{ marginBottom: '1rem' }}>Category Compliance Overview</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <div className="flex justify-between text-sm" style={{ marginBottom: '0.25rem' }}>
                       <span>Overall Completion</span>
                       <span style={{ fontWeight: 600 }}>{totalCategories ? Math.round((completedCategories/totalCategories)*100) : 0}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${totalCategories ? (completedCategories/totalCategories)*100 : 0}%`, backgroundColor: 'var(--success-solid)' }}></div>
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                     <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
                        <div className="text-h2 text-muted">{totalCategories}</div>
                        <div className="text-sm">Total Applicable</div>
                     </div>
                     <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
                        <div className="text-h2" style={{ color: 'var(--success-text)' }}>{completedCategories}</div>
                        <div className="text-sm">Completed</div>
                     </div>
                     <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
                        <div className="text-h2" style={{ color: 'var(--warning-text)' }}>{pendingCategories}</div>
                        <div className="text-sm">Pending / In Progress</div>
                     </div>
                 </div>
             </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h2 className="text-h2" style={{ marginBottom: '1rem' }}>Appointment Types</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {typeCards.map((c, idx) => (
                         <div key={idx} className="card" style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer' }} onClick={() => handleCardClick(c.filter)}>
                             <div className="text-h2" style={{ color: 'var(--primary-text)' }}>{c.value}</div>
                             <div className="text-sm" style={{ fontWeight: 500 }}>{c.title}</div>
                         </div>
                      ))}
                  </div>
             </div>
             
             <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h2 className="text-h2" style={{ marginBottom: '1rem' }}>Shift Distribution</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      {shiftCards.map((c, idx) => (
                         <div key={idx} className="card" style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', backgroundColor: 'var(--bg-surface)' }} onClick={() => handleCardClick(c.filter)}>
                             <div className="text-h2" style={{ color: 'var(--warning-text)' }}>{c.value}</div>
                             <div className="text-sm" style={{ fontWeight: 500 }}>{c.title}</div>
                         </div>
                      ))}
                  </div>
             </div>
         </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
          <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Department Summary by Shift</h2>
          <div style={{ width: '100%', height: 400 }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                   <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                   <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10, fill: 'var(--text-muted)'}} />
                   <YAxis tick={{fontSize: 12, fill: 'var(--text-muted)'}}/>
                   <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} />
                   <Bar dataKey="Shift_I" name="Shift I" stackId="a" fill="var(--primary-solid)" radius={[0, 0, 4, 4]} />
                   <Bar dataKey="Shift_II" name="Shift II" stackId="a" fill="var(--warning-solid)" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}
