import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseExcelData } from '../utils/excelParser';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [facultyData, setFacultyData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
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

  const uploadExcel = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const { data, categories: parsedCategories, dataQuality: dq } = parseExcelData(buffer);
      
      setFacultyData(data);
      setCategories(parsedCategories);
      setDataQuality(dq);
      setFileName(file.name);
      setLastUpdated(new Date().toLocaleString());
      
      // Save minimal info to local storage just to persist state on refresh if desired, or just keep it in memory
      
    } catch (err) {
      console.error(err);
      setError('Upload failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = (additionalFilters = {}) => {
    return facultyData.filter(faculty => {
      // Search
      const activeSearch = filters.search || additionalFilters.search || '';
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
      // Since type in the data might be comma separated or nested depending on mapping, we do includes check
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

      // Custom Category Filter
      if (additionalFilters.categoryName && additionalFilters.status) {
         let val = faculty.categories[additionalFilters.categoryName] || 'Not Applicable';
         // simple match or standard mapping could go here.
         // For now exact match or status mapped
         // See classifyStatus in parser if we want standardized mapping
      }

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
    categories,
    dataQuality,
    lastUpdated,
    fileName,
    isLoading,
    error,
    uploadExcel,
    filters,
    setFilters,
    getFilteredData,
    getUniqueValues,
    hasData: facultyData.length > 0
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
