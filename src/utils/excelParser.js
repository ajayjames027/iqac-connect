import * as XLSX from 'xlsx';

// Standardized mapping of core demographic fields to expected variations in Excel
export const CORE_FIELDS = {
  id: ['S.No', 'SNo', 'Serial No', 'Emp ID', 'Employee ID'],
  name: ['Name of the Teaching Staff', 'Name Of The Employee', 'Faculty Name', 'Name of Faculty', 'Staff Name'],
  department: ['Department', 'Dept'],
  facultyType: ['Aided/Coordinator/Secretary', 'Nature Of Appointment', 'Faculty Type'],
  designation: ['Designation', 'Position', 'Role'],
  qualification: ['Educational Qualification', 'Highest Qualification', 'Qualification'], 
  gender: ['Gender', 'Sex'],
  dateOfAppointment: ['Date of Appointment', 'Date of Joining', 'DOJ'],
  experienceCategory: ['Category', 'Years of Experience Category', 'Year of Experience', 'Years of Experience'],
  phdGuide: ['PhD Guide Mention', 'Guide Mention', 'PhD Guide'],
  phdStatus: ['Doctoral Degree Yes/No', 'Doctoral Degree'],
  shift: ['Shift (I/II)', 'Shift']
};

export const IGNORED_FIELDS = [
  'PAN No.', 'AADHAAR No.', 'Mobile Number', 'Personal Mail ID', 'Institutional Email Address', 
  'LinkedIn Profile', 'Vidwaan ID', 'Year of Acquiring', 'If No, Year of registration', 'Year of Recognition', 'Reference Number', 'Total No. of Doctoral', 'Research Scholars'
];

function findKey(header, fieldMap) {
  for (const [key, aliases] of Object.entries(fieldMap)) {
    if (aliases.some(alias => header.toLowerCase().includes(alias.toLowerCase()))) {
      return key;
    }
  }
  return null;
}

export function parseExcelData(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  // Try to find the main data sheet. Fallback to first sheet.
  let sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('faculty_details') || s.toLowerCase().includes('data'));
  if (!sheetName) sheetName = workbook.SheetNames[0];
  
  const worksheet = workbook.Sheets[sheetName];
  // Convert sheet to JSON, array of arrays
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (!rawData || rawData.length < 2) {
    throw new Error('No data found in the Excel sheet.');
  }

  // Find header row realistically (look for 'Name' or 'Department' in row)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (!row) continue;
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('name of') || rowStr.includes('department')) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rawData[headerRowIndex].map(h => h ? h.toString().trim().replace(/\n/g, ' ') : '');
  const dataRows = rawData.slice(headerRowIndex + 1);

  // Map columns
  const mappedCols = {}; // colIndex -> coreKey
  const categoryCols = []; // { index, name }
  const dataQuality = { total: dataRows.length, duplicateNames: 0, missingDept: 0, missingDesignation: 0, missingName: 0 };
  
  let nameCount = {};

  // Core Dynamic mapping driven strictly by header strings. (Supports varied format structures across years)
  headers.forEach((h, idx) => {
    if (!h) return;
    const coreKey = findKey(h, CORE_FIELDS);
    
    if (coreKey && !Object.values(mappedCols).includes(coreKey)) {
      mappedCols[idx] = coreKey;
    } else {
      // It's a potential compliance category or other status
      let isIgnored = IGNORED_FIELDS.some(ig => h.toLowerCase().includes(ig.toLowerCase()));
      if (!isIgnored && !h.toLowerCase().includes('guid')) {
        categoryCols.push({ index: idx, name: h });
      }
    }
  });

  const processedData = [];

  dataRows.forEach((row, rowIndex) => {
    // Skip empty rows
    if (!row.some(cell => cell !== undefined && cell !== null && cell !== '')) return;

    const faculty = { 
        id: rowIndex,
        categories: {},
        rawRow: {}
    };
    
    // Process core mapped fields and raw values
    headers.forEach((h, idx) => {
      let val = row[idx];
      if (val === undefined || val === null) val = '';
      
      const formattedVal = val instanceof Date ? val.toISOString().split('T')[0] : val.toString().trim();
      
      if (h) {
          faculty.rawRow[h] = formattedVal;
      }

      const coreKey = mappedCols[idx];
      if (coreKey) {
          faculty[coreKey] = formattedVal;
      }
    });

    // Populate dynamic categories
    categoryCols.forEach(cat => {
      let val = row[cat.index];
      val = val ? val.toString().trim() : 'Not Applicable'; // Fallback
      if (val.toLowerCase() === 'nil' || val === '' || val === '-') val = 'Not Applicable';
      faculty.categories[cat.name] = val;
    });

    // Quality Checks
    if (!faculty.name) dataQuality.missingName++;
    else {
      nameCount[faculty.name] = (nameCount[faculty.name] || 0) + 1;
      if (nameCount[faculty.name] > 1) dataQuality.duplicateNames++;
    }

    if (!faculty.department) dataQuality.missingDept++;
    if (!faculty.designation) dataQuality.missingDesignation++;

    if (faculty.name) {
       processedData.push(faculty);
    }
  });
  
  dataQuality.total = processedData.length;

  return { data: processedData, categories: categoryCols.map(c => c.name), dataQuality };
}

export function classifyStatus(statusStr) {
    if (!statusStr) return 'notapplicable';
    const s = statusStr.toLowerCase();
    
    if (s.includes('yes') || s.includes('completed') || s === 'completed') return 'completed';
    if (s.includes('no') || s.includes('pending') || s === 'pending') return 'pending';
    if (s.includes('progress')) return 'inprogress';
    if (s.includes('not done')) return 'notdone';
    if (s.includes('not applicable') || s === 'na' || s === '-') return 'notapplicable';
    
    return 'other'; // Or dynamically render based on exact string if mapping not obvious
}
