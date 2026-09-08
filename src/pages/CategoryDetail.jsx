import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { classifyStatus } from '../utils/excelParser';
import FacultyProfileModal from '../components/FacultyProfileModal';
import { ChevronLeft } from 'lucide-react';

export default function CategoryDetail() {
  const { categoryName } = useParams();
  const { facultyData, categories } = useData();
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  const decodedName = decodeURIComponent(categoryName);
  const [statusFilter, setStatusFilter] = useState('All');

  // Compute category stats for the header
  let totalAssigned = 0;
  let completed = 0;
  let pending = 0;

  const relevantFaculty = facultyData.map(f => {
      const val = f.categories[decodedName] || 'Not Applicable';
      const statusClass = classifyStatus(val);
      if (statusClass !== 'notapplicable') {
         totalAssigned++;
         if (statusClass === 'completed') completed++;
         else pending++;
      }
      return { ...f, _catVal: val, _catStatus: statusClass };
  }).filter(f => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Applicable') return f._catStatus !== 'notapplicable';
      return f._catStatus === statusFilter.toLowerCase();
  });

  const percentage = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', marginBottom: '1rem', textDecoration: 'none' }}>
         <ChevronLeft size={16} /> Back to Categories
      </Link>
      
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px' }}>
             <h1 className="text-h2" style={{ marginBottom: '0.5rem' }}>{decodedName}</h1>
             <p className="text-muted">Category Compliance Details</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
             <div>
                <div className="text-sm text-muted">Total Applicable</div>
                <div className="text-h2">{totalAssigned}</div>
             </div>
             <div>
                <div className="text-sm text-muted">Completed</div>
                <div className="text-h2" style={{ color: 'var(--success-text)' }}>{completed}</div>
             </div>
             <div>
                <div className="text-sm text-muted">Pending</div>
                <div className="text-h2" style={{ color: 'var(--warning-text)' }}>{pending}</div>
             </div>
             <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <div className="text-sm text-muted">Completion Rate</div>
                <div className="text-h2" style={{ color: percentage === 100 ? 'var(--success-text)' : 'inherit' }}>{percentage}%</div>
             </div>
          </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="text-h3">Faculty List</h3>
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
             <label className="input-label" style={{ marginRight: '0.5rem' }}>Status Filter:</label>
             <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.25rem 2rem 0.25rem 0.75rem' }}>
                <option value="All">All Faculty</option>
                <option value="Applicable">Only Applicable</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending / In Progress</option>
                <option value="NotApplicable">Not Applicable</option>
             </select>
          </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Status Detail</th>
              <th>Compliance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
             {relevantFaculty.map(faculty => (
                <tr key={faculty.id}>
                  <td style={{ fontWeight: 500 }}>{faculty.name}</td>
                  <td>{faculty.department}</td>
                  <td>{faculty._catVal}</td>
                  <td>
                    <span className={`status-badge status-${faculty._catStatus}`}>
                       {faculty._catStatus.toUpperCase()}
                     </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedFaculty(faculty)}>
                      Profile
                    </button>
                  </td>
                </tr>
             ))}
             {relevantFaculty.length === 0 && (
                 <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                       No faculty match the applied status filter for this category.
                    </td>
                 </tr>
             )}
          </tbody>
        </table>
      </div>

      {selectedFaculty && (
         <FacultyProfileModal 
            faculty={selectedFaculty} 
            categories={categories} 
            onClose={() => setSelectedFaculty(null)} 
         />
      )}
    </div>
  );
}
