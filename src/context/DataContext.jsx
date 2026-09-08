import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { parseExcelData } from '../utils/excelParser';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { doc, getDocs, getDoc, setDoc, collection } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [facultyData, setFacultyData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataQuality, setDataQuality] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  
  const hasLoadedFromDB = useRef(false);
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
    // Only fetch database if someone is actively logged in to avoid Missing Permission Firestore rules
    if (!currentUser) {
        setIsInitializing(false);
        return;
    }

    const loadPersistedData = async () => {
       try {
           const metaDoc = await getDoc(doc(db, 'iqac', 'meta'));
           let cName = ''; let cDate = ''; let cQual = null; let cats = []; let uHist = [];
           
           if (metaDoc.exists()) {
               const metaData = metaDoc.data();
               cName = metaData.fileName || '';
               cDate = metaData.lastUpdated || '';
               cQual = metaData.dataQuality || null;
               cats = metaData.categories ? JSON.parse(metaData.categories) : [];
               uHist = metaData.uploadHistory ? JSON.parse(metaData.uploadHistory) : [];
           }

           const fSnapshot = await getDocs(collection(db, 'facultyData'));
           let fData = [];
           fSnapshot.forEach(docSnap => {
               if (docSnap.data().data) fData.push(...JSON.parse(docSnap.data().data));
           });

           const sSnapshot = await getDocs(collection(db, 'studentData'));
           let sData = [];
           sSnapshot.forEach(docSnap => {
               if (docSnap.data().data) sData.push(...JSON.parse(docSnap.data().data));
           });
           
        if (fData.length > 0 || sData.length > 0) {
            setFacultyData(fData);
            setStudentData(sData);
            setCategories(cats);
            setFileName(cName);
            setLastUpdated(cDate);
            setDataQuality(cQual);
            setUploadHistory(uHist);
        }
    } catch(e) {
        console.error("Firestore load error:", e);
    }
    hasLoadedFromDB.current = true;
    setIsInitializing(false);
  };
  loadPersistedData();
}, [currentUser]);

const handleFileUpload = (e, targetDataset = { type: 'faculty', year: '2026-2027' }) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentFileName = file.name;
    const timestamp = new Date().toLocaleString();
    
    setFileName(currentFileName);
    setLastUpdated(timestamp);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        let countProcessed = 0;
        let finalQuality = null;
        let finalCategories = categories;
        
        if (targetDataset.type === 'student') {
             // For students
             const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
             let targetSheet = wb.SheetNames[0];
             const ws = wb.Sheets[targetSheet];
             let rawStudents = XLSX.utils.sheet_to_json(ws);
             
             // Tag it with academic year
             const stampedData = rawStudents.map(s => ({ ...s, academicYear: targetDataset.year }));
             countProcessed = stampedData.length;
             
             setStudentData(prev => {
                 const filteredPrev = prev.filter(p => p.academicYear !== targetDataset.year);
                 const finalData = [...filteredPrev, ...stampedData];
                 return finalData;
             });
             
             // Fire background Cloud Push
             const chunkJson = JSON.stringify(stampedData);
             setDoc(doc(db, 'studentData', targetDataset.year), { data: chunkJson })
                  .catch(err => console.error("Firestore push failed:", err));

        } else {
             // It's a faculty upload
             const { data: processedData, categories: extractedCat, dataQuality: quality } = parseExcelData(buffer);
             
             // Stamp with academic year based on selection
             const stampedData = processedData.map(f => ({ ...f, academicYear: targetDataset.year }));
             countProcessed = stampedData.length;
             finalQuality = quality;
             
             setCategories(prev => {
                let allCaps = new Set([...prev, ...extractedCat]);
                finalCategories = Array.from(allCaps);
                return finalCategories;
             });
             
             setDataQuality(quality);
             
             setFacultyData(prev => {
                 const filteredPrev = prev.filter(p => p.academicYear !== targetDataset.year);
                 const merged = [...filteredPrev, ...stampedData].map((f, i) => ({ ...f, id: i }));
                 return merged;
             });
             
             // Fire background Cloud Push
             const chunkJson = JSON.stringify(stampedData);
             setDoc(doc(db, 'facultyData', targetDataset.year), { data: chunkJson })
                  .catch(err => console.error("Firestore push failed:", err));
        }
        
        // Push successful history log & sync complete meta to Firestore
        const uHistObj = {
            id: Date.now(),
            filename: currentFileName,
            time: timestamp,
            type: targetDataset.type,
            year: targetDataset.year,
            count: countProcessed
        };
        
        setUploadHistory(prev => {
            const nextHistory = [uHistObj, ...prev];
            
            // Sync Meta to Firestore
            setDoc(doc(db, 'iqac', 'meta'), {
               fileName: currentFileName,
               lastUpdated: timestamp,
               dataQuality: finalQuality,
               categories: JSON.stringify(finalCategories),
               uploadHistory: JSON.stringify(nextHistory)
            }, { merge: true }).catch(err => console.error("Firestore meta push failed:", err));
            
            return nextHistory;
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
    uploadHistory,
    isInitializing
  };

  if (isInitializing) return null;

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
