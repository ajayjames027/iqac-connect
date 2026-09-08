import React from 'react';
import { useData } from '../context/DataContext';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DataQuality() {
  const { dataQuality, fileName, lastUpdated } = useData();

  if (!dataQuality) return null;

  const getStatusIcon = (count, maxAllowed = 0) => {
      if (count <= maxAllowed) return <CheckCircle size={20} style={{ color: 'var(--success-solid)' }} />;
      return <AlertTriangle size={20} style={{ color: 'var(--danger-solid)' }} />;
  };

  const hasIssues = dataQuality.duplicateNames > 0 || dataQuality.missingDept > 0 || dataQuality.missingDesignation > 0 || dataQuality.missingName > 0;

  return (
    <div className="animate-fade-in">
      <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Data Quality Summary</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Audit results for {fileName || 'the uploaded dataset'}.</p>

      {hasIssues ? (
         <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-solid)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={24} style={{ color: 'var(--danger-solid)' }} />
            <div>
               <h3 className="text-h3" style={{ color: 'var(--danger-text)', marginBottom: '0.25rem' }}>Attention Required</h3>
               <p className="text-sm">There are missing or duplicate fields in the uploaded data. This may affect reporting accuracy.</p>
            </div>
         </div>
      ) : (
         <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success-solid)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={24} style={{ color: 'var(--success-solid)' }} />
            <div>
               <h3 className="text-h3" style={{ color: 'var(--success-text)', marginBottom: '0.25rem' }}>Data looks good</h3>
               <p className="text-sm">No major structural issues detected in the core fields.</p>
            </div>
         </div>
      )}

      <div className="table-container" style={{ maxWidth: '600px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Quality Metric</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Valid Records Parsed</td>
              <td style={{ fontWeight: 600 }}>{dataQuality.total}</td>
              <td><Info size={20} style={{ color: 'var(--text-muted)' }} /></td>
            </tr>
            <tr>
              <td>Missing Faculty Names</td>
              <td style={{ fontWeight: 600, color: dataQuality.missingName > 0 ? 'var(--danger-text)' : 'inherit' }}>{dataQuality.missingName}</td>
              <td>{getStatusIcon(dataQuality.missingName)}</td>
            </tr>
            <tr>
              <td>Duplicate Faculty Names</td>
              <td style={{ fontWeight: 600, color: dataQuality.duplicateNames > 0 ? 'var(--warning-text)' : 'inherit' }}>{dataQuality.duplicateNames}</td>
              <td>{getStatusIcon(dataQuality.duplicateNames, 2)}</td>
            </tr>
            <tr>
              <td>Missing Departments</td>
              <td style={{ fontWeight: 600, color: dataQuality.missingDept > 0 ? 'var(--warning-text)' : 'inherit' }}>{dataQuality.missingDept}</td>
              <td>{getStatusIcon(dataQuality.missingDept)}</td>
            </tr>
            <tr>
              <td>Missing Designations</td>
              <td style={{ fontWeight: 600, color: dataQuality.missingDesignation > 0 ? 'var(--warning-text)' : 'inherit' }}>{dataQuality.missingDesignation}</td>
              <td>{getStatusIcon(dataQuality.missingDesignation)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>How to fix issues</h3>
          <p className="text-sm text-muted">
             Please update the original Excel file (`{fileName}`) by filling in the missing cells for the respective columns. Once updated, use the "Upload / Update" button in the sidebar to sync the latest changes instantly.
          </p>
      </div>
    </div>
  );
}
