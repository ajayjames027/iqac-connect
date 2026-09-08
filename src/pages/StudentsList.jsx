import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, Download, RotateCcw, BookOpen } from 'lucide-react';

export default function StudentsList() {
   const { studentData } = useData();
   
   const [search, setSearch] = useState('');
   const [gender, setGender] = useState('All');
   const [course, setCourse] = useState('All');
   
   const normalizedStudentData = useMemo(() => {
       return studentData.map(s => {
           let gen = s.GENDER ? s.GENDER.toString() : '';
           if (gen.toLowerCase() === 'female') gen = 'Female';
           else if (gen.toLowerCase() === 'male') gen = 'Male';
           return { ...s, normalizedGender: gen };
       });
   }, [studentData]);

   const filteredData = useMemo(() => {
       return normalizedStudentData.filter(student => {
           // Search Filter
           if (search) {
               const searchLower = search.toString().toLowerCase();
               const sName = student.NAME ? student.NAME.toString().toLowerCase() : '';
               const sDno = student['D.No.'] ? student['D.No.'].toString().toLowerCase() : '';
               const sSno = student.SNo ? student.SNo.toString().toLowerCase() : '';
               
               const nameMatch = sName.includes(searchLower);
               const admissionMatch = sDno.includes(searchLower) || sSno.includes(searchLower);
               if (!nameMatch && !admissionMatch) return false;
           }
           
           // Gender Filter
           if (gender !== 'All' && student.normalizedGender !== gender) return false;
           
           // Course Filter
           if (course !== 'All' && student.CourseName?.toString() !== course) return false;
           
           return true;
       });
   }, [normalizedStudentData, search, gender, course]);
   
   const courses = useMemo(() => {
       const vals = normalizedStudentData.map(s => s.CourseName ? s.CourseName.toString() : null).filter(Boolean);
       return ['All', ...new Set(vals)].sort();
   }, [normalizedStudentData]);
   
   const genders = useMemo(() => {
       const vals = normalizedStudentData.map(s => s.normalizedGender).filter(Boolean);
       return ['All', ...new Set(vals)].sort();
   }, [normalizedStudentData]);

   const handleExport = () => {
        if (!filteredData.length) return;
        
        const headers = ['Admission No', 'Name', 'Course', 'Gender', 'State', 'Community', 'Religion'];
        const rows = filteredData.map(s => [
            s['D.No.'] || s.SNo || '',
            s.NAME || '',
            s.CourseName || '',
            s.normalizedGender || '',
            s.STATE || '',
            s.COMMUNITY || '',
            s.RELIGION || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'filtered_students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
   };
   
   if (!studentData || studentData.length === 0) {
      return (
         <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
             <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Student Database</h1>
             <div className="card" style={{ opacity: 0.7 }}>
                 <p>No Student Data loaded. Please select <strong>"Student Details Database"</strong> in the sidebar and upload the file.</p>
             </div>
         </div>
      );
   }

   return (
       <div className="animate-fade-in">
           <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <h1 className="text-h1">Student Directory</h1>
               <div className="status-badge status-yes">Showing {filteredData.length} of {studentData.length} Loaded</div>
           </div>
           
           <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
             <div className="input-group" style={{ flex: '1 1 200px' }}>
                <label className="input-label">Search Name or ID</label>
                <div style={{ position: 'relative' }}>
                   <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                   <input type="text" className="input-field" placeholder="Search..." style={{ paddingLeft: '2.5rem' }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
             </div>
             
             <div className="input-group" style={{ flex: '1 1 150px' }}>
                <label className="input-label">Course</label>
                <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                   {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             
             <div className="input-group" style={{ flex: '1 1 150px' }}>
                <label className="input-label">Gender</label>
                <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                   {genders.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             
             <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => { setSearch(''); setCourse('All'); setGender('All'); }} title="Reset" style={{ height: '38px' }}>
                   <RotateCcw size={18} />
                </button>
                <button className="btn btn-primary" onClick={handleExport} disabled={filteredData.length === 0} style={{ height: '38px' }}>
                   <Download size={18} /> Export CSV
                </button>
             </div>
           </div>
           
           <div className="table-container">
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>Admission No</th>
                        <th>Name</th>
                        <th>Course</th>
                        <th>Gender</th>
                        <th>State</th>
                        <th>Community</th>
                        <th>Religion</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredData.slice(0, 100).map((student, idx) => (
                        <tr key={idx}>
                           <td style={{ fontWeight: 600 }}>{student['D.No.'] || student.SNo || '-'}</td>
                           <td style={{ fontWeight: 600, color: 'var(--primary-text)' }}>{student.NAME}</td>
                           <td>{student.CourseName}</td>
                           <td>{student.normalizedGender}</td>
                           <td>{student.STATE}</td>
                           <td>{student.COMMUNITY}</td>
                           <td>{student.RELIGION}</td>
                        </tr>
                     ))}
                     {filteredData.length === 0 && (
                        <tr>
                           <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No students match the current filters.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
           </div>
           
           {filteredData.length > 100 && (
              <div style={{ textAlign: 'center', margin: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Showing top 100 student records out of {filteredData.length}. Download CSV to see all.
              </div>
           )}
       </div>
   );
}
