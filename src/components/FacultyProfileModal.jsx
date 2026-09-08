import React from 'react';
import { X } from 'lucide-react';
import { classifyStatus } from '../utils/excelParser';

export default function FacultyProfileModal({ faculty, categories, onClose }) {
  if (!faculty) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-h2">Faculty Profile</h2>
          <button className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <p className="text-sm text-muted">Faculty Name</p>
              <p className="text-body" style={{ fontWeight: 600 }}>{faculty.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Department</p>
              <p className="text-body">{faculty.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Designation</p>
              <p className="text-body">{faculty.designation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Faculty Type</p>
              <p className="text-body">{faculty.facultyType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Qualification</p>
              <p className="text-body">{faculty.qualification || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Gender</p>
              <p className="text-body">{faculty.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Ph.D. Status</p>
              <p className="text-body">{faculty.phdStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Ph.D. Guide</p>
              <p className="text-body">{faculty.phdGuide || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Experience</p>
              <p className="text-body">{faculty.experienceCategory || 'N/A'}</p>
            </div>
          </div>

          <h3 className="text-h3" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Category Compliance</h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Status / Details</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? categories.map(cat => {
                  const val = faculty.categories[cat] || 'Not Applicable';
                  const statusClass = classifyStatus(val);
                  return (
                    <tr key={cat}>
                      <td style={{ fontWeight: 500 }}>{cat}</td>
                      <td>{val}</td>
                      <td>
                         <span className={`status-badge status-${statusClass}`}>
                           {statusClass.toUpperCase()}
                         </span>
                      </td>
                    </tr>
                  )
                }) : (
                    <tr><td colSpan="3" style={{textAlign:'center', color: 'var(--text-muted)'}}>No category data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
