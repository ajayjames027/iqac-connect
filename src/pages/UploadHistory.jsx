import React from 'react';
import { useData } from '../context/DataContext';
import { HardDrive, CheckCircle2, Clock, FileSpreadsheet } from 'lucide-react';

export default function UploadHistory() {
  const { uploadHistory } = useData();

  if (!uploadHistory || uploadHistory.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Upload History</h1>
        <div className="card" style={{ opacity: 0.7 }}>
          <p>No storage history available. Upload a faculty or student dataset to view event records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 className="text-h1">Local Storage Index</h1>
          <div className="status-badge status-yes">
             <HardDrive size={14} style={{ marginRight: '0.25rem' }} /> IndexedDB Synced
          </div>
       </div>

       <div className="table-container">
          <table className="data-table">
            <thead>
               <tr>
                 <th>Status</th>
                 <th>Data Array Type</th>
                 <th>Academic Year</th>
                 <th>Source File</th>
                 <th>Processed Count</th>
                 <th>Time Uploaded</th>
               </tr>
            </thead>
            <tbody>
               {uploadHistory.map((upload, idx) => (
                  <tr key={idx}>
                     <td>
                        <span className="badge" style={{ backgroundColor: '#e6f4ea', color: '#1e8e3e' }}>
                           <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Default Success
                        </span>
                     </td>
                     <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                         {upload.type || 'Unknown'} Data
                     </td>
                     <td>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                           {upload.year || 'N/A'}
                        </span>
                     </td>
                     <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileSpreadsheet size={16} /> {upload.filename}
                     </td>
                     <td style={{ fontWeight: 500 }}>
                        {upload.count} Records Extract
                     </td>
                     <td style={{ color: 'var(--text-muted)' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> {upload.time}
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}
