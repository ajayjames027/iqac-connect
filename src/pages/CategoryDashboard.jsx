import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { classifyStatus } from '../utils/excelParser';
import { ChevronRight } from 'lucide-react';

export default function CategoryDashboard() {
  const { facultyData, categories } = useData();

  if (!categories || categories.length === 0) {
     return (
       <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2 className="text-h2">No Categories Detected</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>The system did not detect any additional category columns in the uploaded file.</p>
       </div>
     );
  }

  const categoryStats = categories.map(cat => {
      let totalAssigned = 0;
      let completed = 0;
      let pending = 0;
      let notApplicable = 0;

      facultyData.forEach(f => {
          const val = f.categories[cat] || '';
          const status = classifyStatus(val);
          
          if (status === 'completed') completed++;
          else if (status === 'pending' || status === 'inprogress' || status === 'notdone') pending++;
          else if (status === 'notapplicable') notApplicable++;
          if (status !== 'notapplicable') totalAssigned++;
      });

      return {
          name: cat,
          totalAssigned,
          completed,
          pending,
          notApplicable,
          percentage: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0
      };
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Category Compliance Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Click on any category to view the associated faculty details.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
         {categoryStats.map((stat, i) => (
             <Link key={i} to={`/categories/${encodeURIComponent(stat.name)}`} className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <h3 className="text-h3" style={{ flex: 1, paddingRight: '1rem' }}>{stat.name}</h3>
                    <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                   <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                       <div className="text-h3">{stat.totalAssigned}</div>
                       <div className="text-xs text-muted">Applicable</div>
                   </div>
                   <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-text)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                       <div className="text-h3">{stat.completed}</div>
                       <div className="text-xs">Completed</div>
                   </div>
                   <div style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                       <div className="text-h3">{stat.pending}</div>
                       <div className="text-xs">Pending</div>
                   </div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between text-sm" style={{ marginBottom: '0.25rem' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
                       <span style={{ fontWeight: 600 }}>{stat.percentage}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ 
                           height: '100%', 
                           width: `${stat.percentage}%`, 
                           backgroundColor: stat.percentage === 100 ? 'var(--success-solid)' : (stat.percentage > 50 ? 'var(--primary-solid)' : 'var(--warning-solid)'),
                           transition: 'width 1s ease-in-out'
                       }}></div>
                    </div>
                </div>
             </Link>
         ))}
      </div>
    </div>
  );
}
