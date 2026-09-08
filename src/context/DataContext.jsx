import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseExcelData } from '../utils/excelParser';
import * as XLSX from 'xlsx';
import localforage from 'localforage';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [facultyData, setFacultyData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    academicYear: 'All',
    department: 'All',
    facultyType: 'All',
    designation: 'All',
    qualification: 'All',
    experienceCategory: 'All',
    phdStatus: 'All',
    phdGuide: 'All',
    shift: 'All'
  });

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Load persisted data on mount
    const loadPersistedData = async () => {
       try {
           const fData = await localforage.getItem('iqac_facultyData') || [];
           const sData = await localforage.getItem('iqac_studentData') || [];
           const cats = await localforage.getItem('iqac_categories') || [];
           const cName = await localforage.getItem('iqac_fileName') || '';
           const cDate = await localforage.getItem('iqac_lastUpdated') || '';
           const cQual = await localforage.getItem('iqac_dataQuality') || null;
           
           if (fData.length || sData.length) {
               setFacultyData(fData);
               setStudentData(sData);
               setCategories(cats);
               setFileName(cName);
               setLastUpdated(cDate);
               setDataQuality(cQual);
           }
       } catch(e) {
           console.error("LocalForage load error:", e);
       }
       setIsInitializing(false);
    };
    loadPersistedData();
  }, []);

  // Save changes to localForage automatically
  useEffect(() => {
    if (isInitializing) return;
    localforage.setItem('iqac_facultyData', facultyData);
    localforage.setItem('iqac_studentData', studentData);
    localforage.setItem('iqac_categories', categories);
    localforage.setItem('iqac_fileName', fileName);
    localforage.setItem('iqac_lastUpdated', lastUpdated);
    localforage.setItem('iqac_dataQuality', dataQuality);
  }, [facultyData, studentData, categories, fileName, lastUpdated, dataQuality, isInitializing]);

  const handleFileUpload = (e, targetDataset = '2026-2027') => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLastUpdated(new Date().toLocaleString());

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        
        if (targetDataset === 'Students') {
             // For students, just store the first sheet raw for now
             const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
             let targetSheet = wb.SheetNames[0];
             const ws = wb.Sheets[targetSheet];
             const data = XLSX.utils.sheet_to_json(ws);
             setStudentData(data);
             return;
        }

        // It's a faculty upload, pass buffer to parser
        const { data: processedData, categories: extractedCat, dataQuality: quality } = parseExcelData(buffer);

        // Stamp with academic year based on selection
        const stampedData = processedData.map(f => ({ ...f, academicYear: targetDataset }));

        setCategories(prev => {
           let allCaps = new Set([...prev, ...extractedCat]);
           return Array.from(allCaps);
        });
        
        setDataQuality(quality);
        
        setFacultyData(prev => {
            // Remove any old rows that had this same academic year so we can safely "Update"
            const filteredPrev = prev.filter(p => p.academicYear !== targetDataset);
            // Re-index safe IDs
            const merged = [...filteredPrev, ...stampedData].map((f, i) => ({ ...f, id: i }));
            return merged;
        });
      } catch (err) {
        console.error('Error parsing excel:', err);
        alert('Failed to parse Excel file. Ensure it matches the expected structure.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // reset
  };

  const getFilteredData = (additionalFilters = {}) => {
    return facultyData.filter(faculty => {
      // Academic Year
      const activeYear = additionalFilters.academicYear || filters.academicYear;
      if (activeYear && activeYear !== 'All' && faculty.academicYear !== activeYear) return false;

      // Search
      const activeSearch = additionalFilters.search ?? filters.search;
      if (activeSearch) {
        const searchLower = activeSearch.toLowerCase();
        const matchesName = faculty.name?.toLowerCase().includes(searchLower);
        const matchesDept = faculty.department?.toLowerCase().includes(searchLower);
        const matchesDesig = faculty.designation?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDept && !matchesDesig) return false;
      }

      // Department
      const activeDept = additionalFilters.department || filters.department;
      if (activeDept && activeDept !== 'All' && faculty.department !== activeDept) return false;

      // Faculty Type
      const activeType = additionalFilters.facultyType || filters.facultyType;
      if (activeType && activeType !== 'All' && !faculty.facultyType?.includes(activeType)) return false;
      
      // Designation
      const activeDesig = additionalFilters.designation || filters.designation;
      if (activeDesig && activeDesig !== 'All' && faculty.designation !== activeDesig) return false;

      // Qualification (Standardized Degree Selection)
      const activeQual = additionalFilters.qualification || filters.qualification;
      if (activeQual && activeQual !== 'All') {
          const fQual = faculty.qualification?.toLowerCase().replace(/\./g, '') || '';
          const targetQual = activeQual.toLowerCase().replace(/\./g, '');
          if (!fQual.includes(targetQual)) return false;
      }

      // Experience
      const activeExp = additionalFilters.experienceCategory || filters.experienceCategory;
      if (activeExp && activeExp !== 'All' && faculty.experienceCategory !== activeExp) return false;

      // PhD Status
      const activePhd = additionalFilters.phdStatus || filters.phdStatus;
      if (activePhd && activePhd !== 'All') {
          const isPhd = faculty.phdStatus?.toLowerCase().includes('yes');
          if (activePhd === 'Yes' && !isPhd) return false;
          if (activePhd === 'No' && isPhd) return false;
      }

      // PhD Guide
      const activeGuide = additionalFilters.phdGuide || filters.phdGuide;
      if (activeGuide && activeGuide !== 'All') {
          const isGuide = faculty.phdGuide?.toLowerCase().includes('yes');
          if (activeGuide === 'Yes' && !isGuide) return false;
          if (activeGuide === 'No' && isGuide) return false;
      }

      // Shift
      const activeShift = additionalFilters.shift || filters.shift;
      if (activeShift && activeShift !== 'All' && faculty.shift !== activeShift) return false;

      return true;
    });
  };

  const getUniqueValues = (key) => {
    if (key === 'qualification') {
       return ['All', 'Ph.D.', 'M.Phil.', 'NET', 'SET', 'GATE', 'M.Sc.', 'M.A.', 'M.Com.', 'MBA', 'MCA', 'M.Tech.', 'B.Sc.', 'B.A.', 'B.Com.'];
    }
    const values = facultyData.map(f => f[key]).filter(v => v);
    return ['All', ...new Set(values)].sort();
  };

  const value = {
    facultyData,
    setFacultyData,
    studentData,
    setStudentData,
    categories,
    dataQuality,
    lastUpdated,
    fileName,
    filters,
    setFilters,
    handleFileUpload,
    getFilteredData,
    getUniqueValues,
    isInitializing
  };

  if (isInitializing) return null;

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
