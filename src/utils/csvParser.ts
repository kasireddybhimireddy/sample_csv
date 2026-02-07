import Papa from 'papaparse';
import { ExchangeRateData, ProcessedData } from '../types';

export const parseCSV = (file: File): Promise<ProcessedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: false,
      complete: (results) => {
        try {
          const processedData = processCSVData(results.data, file.name);
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

const processCSVData = (rawData: any[], fileName: string): ProcessedData => {
  const validData: ExchangeRateData[] = [];
  
  // Process each row
  rawData.forEach((row, index) => {
    // Skip header row if it contains column names
    if (index === 0 && (row.observation_date === 'observation_date' || row.DEXUSEU === 'DEXUSEU')) {
      return;
    }
    
    const dateStr = row.observation_date || row.Date || row.date || row.DATE;
    const rateStr = row.DEXUSEU || row.Rate || row.rate || row.RATE;
    
    // Skip rows with missing data
    if (!dateStr || !rateStr || rateStr.trim() === '') {
      return;
    }
    
    // Parse and validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return; // Skip invalid dates
    }
    
    // Parse and validate rate
    const rate = parseFloat(rateStr.toString().replace(',', '.'));
    if (isNaN(rate) || rate <= 0) {
      return; // Skip invalid rates
    }
    
    validData.push({
      date: dateStr,
      rate: rate
    });
  });
  
  // Sort data by date
  validData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    data: validData,
    fileName: fileName,
    totalRows: rawData.length,
    validRows: validData.length
  };
};
