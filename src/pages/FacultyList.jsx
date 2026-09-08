import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import FacultyProfileModal from '../components/FacultyProfileModal';
import { Search, Filter, RotateCcw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function FacultyList() {
  const { filters, setFilters, getFilteredData, getUniqueValues, categories } = useData();
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const filteredData = getFilteredData();
  const departments = getUniqueValues('department');
  const facultyTypes = getUniqueValues('facultyType');
  const designations = getUniqueValues('designation');
  const qualifications = getUniqueValues('qualification');
  const experienceCats = getUniqueValues('experienceCategory');
  const shifts = getUniqueValues('shift');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      department: 'All',
      facultyType: 'All',
      designation: 'All',
      qualification: 'All',
      experienceCategory: 'All',
      phdStatus: 'All',
      phdGuide: 'All',
      shift: 'All'
    });
  };

  const exportToExcel = () => {
      if (!filteredData.length) return;
      
      const flatData = filteredData.map(f => f.rawRow);
      
      // Get all unique headers across all rows just to be absolutely safe
      const headersSet = new Set();
      flatData.forEach(row => Object.keys(row).forEach(k => headersSet.add(k)));
      const headers = Array.from(headersSet);
      
      // Create CSV content
      const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const s = String(str).replace(/"/g, '""');
          return `"${s}"`;
      };
      
      const csvRows = [];
      csvRows.push(headers.map(escapeCsv).join(',')); // Header row
      
      flatData.forEach(row => {
          const rowVals = headers.map(h => escapeCsv(row[h]));
          csvRows.push(rowVals.join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "IQAC_Faculty_Filtered_Export.csv";
      link.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Faculty Registry</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="status-badge status-yes">{filteredData.length} Records Found</div>
            <button className="btn btn-primary" onClick={exportToExcel}>
               <Download size={18} /> Export List
            </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
         <div className="input-group" style={{ flex: '1 1 200px' }}>
            <label className="input-label">Search Faculty</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                 type="text" 
                 className="input-field" 
                 style={{ width: '100%', paddingLeft: '2.5rem' }} 
                 placeholder="Search by name, dept, desig..."
                 value={filters.search}
                 onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
         </div>

         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Department</label>
            <select className="input-field" value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}>
               {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Faculty Type</label>
            <select className="input-field" value={filters.facultyType} onChange={(e) => handleFilterChange('facultyType', e.target.value)}>
               {facultyTypes.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Designation</label>
            <select className="input-field" value={filters.designation} onChange={(e) => handleFilterChange('designation', e.target.value)}>
               {designations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Qualification</label>
            <select className="input-field" value={filters.qualification} onChange={(e) => handleFilterChange('qualification', e.target.value)}>
               {qualifications.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>
         
         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Experience</label>
            <select className="input-field" value={filters.experienceCategory} onChange={(e) => handleFilterChange('experienceCategory', e.target.value)}>
               {experienceCats.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 150px' }}>
            <label className="input-label">Ph.D. Status</label>
            <select className="input-field" value={filters.phdStatus} onChange={(e) => handleFilterChange('phdStatus', e.target.value)}>
               <option value="All">All</option>
               <option value="Yes">Has Ph.D.</option>
               <option value="No">No Ph.D.</option>
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 100px' }}>
            <label className="input-label">Guide</label>
            <select className="input-field" value={filters.phdGuide} onChange={(e) => handleFilterChange('phdGuide', e.target.value)}>
               <option value="All">All</option>
               <option value="Yes">Yes</option>
               <option value="No">No</option>
            </select>
         </div>

         <div className="input-group" style={{ flex: '1 1 100px' }}>
            <label className="input-label">Shift</label>
            <select className="input-field" value={filters.shift} onChange={(e) => handleFilterChange('shift', e.target.value)}>
               {shifts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <button className="btn btn-outline" onClick={handleReset} title="Reset Filters" style={{ height: '38px', alignItems: 'center', justifyContent: 'center' }}>
           <RotateCcw size={18} />
         </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Type</th>
              <th>Qualification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
             {filteredData.slice(0, 100).map(faculty => (
                <tr key={faculty.id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary-text)', cursor: 'pointer' }} onClick={() => setSelectedFaculty(faculty)}>
                     {faculty.name}
                  </td>
                  <td>{faculty.department}</td>
                  <td>{faculty.designation}</td>
                  <td>{faculty.facultyType}</td>
                  <td className="truncate" style={{ maxWidth: '200px' }}>{faculty.qualification}</td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedFaculty(faculty)}>
                      View Profile
                    </button>
                  </td>
                </tr>
             ))}
             {filteredData.length === 0 && (
                 <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                       No faculty match the applied filters.
                    </td>
                 </tr>
             )}
             {filteredData.length > 100 && (
                 <tr>
                    <td colSpan="6" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface-hover)', fontSize: '0.75rem' }}>
                       Showing 100 of {filteredData.length} results. Please use filters to narrow down.
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
