import { parseCSV } from '../utils/csvParser';
import { mockCSVData, mockFile, mockInvalidFile, createMockFile } from './testUtils';

// Mock Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, config) => {
    const content = file.toString();
    const lines = content.split('\n').filter((line: string) => line.trim());
    const headers = lines[0].split(',');
    const data = lines.slice(1).map((line: string) => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header.trim()] = values[index]?.trim();
      });
      return row;
    });
    
    // Simulate async behavior
    setTimeout(() => {
      if (config.complete) {
        config.complete({ data, errors: [] });
      }
    }, 0);
  }),
}));

describe('CSV Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseCSV', () => {
    it('should parse valid CSV data correctly', async () => {
      const file = createMockFile(mockCSVData.validCSV, 'test.csv');
      const result = await parseCSV(file);

      expect(result.data).toHaveLength(5);
      expect(result.fileName).toBe('test.csv');
      expect(result.totalRows).toBe(5);
      expect(result.validRows).toBe(5);
      
      expect(result.data[0]).toEqual({
        date: '2023-01-01',
        rate: 0.9234
      });
    });

    it('should handle CSV with missing values', async () => {
      const file = createMockFile(mockCSVData.invalidCSV, 'invalid.csv');
      const result = await parseCSV(file);

      expect(result.totalRows).toBe(5);
      expect(result.validRows).toBe(2); // Only valid rows should remain
    });

    it('should handle empty CSV', async () => {
      const file = createMockFile(mockCSVData.emptyCSV, 'empty.csv');
      const result = await parseCSV(file);

      expect(result.data).toHaveLength(0);
      expect(result.totalRows).toBe(0);
      expect(result.validRows).toBe(0);
    });

    it('should handle different column headers', async () => {
      const file = createMockFile(mockCSVData.mixedHeadersCSV, 'mixed.csv');
      const result = await parseCSV(file);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({
        date: '2023-01-01',
        rate: 0.9234
      });
    });

    it('should sort data by date in ascending order', async () => {
      const unsortedCSV = `observation_date,DEXUSEU
2023-01-05,0.9312
2023-01-01,0.9234
2023-01-03,0.9212
2023-01-02,0.9256
2023-01-04,0.9289`;

      const file = createMockFile(unsortedCSV, 'unsorted.csv');
      const result = await parseCSV(file);

      const dates = result.data.map(item => item.date);
      expect(dates).toEqual([
        '2023-01-01',
        '2023-01-02',
        '2023-01-03',
        '2023-01-04',
        '2023-01-05'
      ]);
    });

    it('should handle invalid dates', async () => {
      const csvWithInvalidDates = `observation_date,DEXUSEU
2023-01-01,0.9234
invalid-date,0.9256
2023-01-03,0.9212`;

      const file = createMockFile(csvWithInvalidDates, 'invalid-dates.csv');
      const result = await parseCSV(file);

      expect(result.validRows).toBe(2);
      expect(result.data.map(item => item.date)).not.toContain('invalid-date');
    });

    it('should handle invalid rate values', async () => {
      const csvWithInvalidRates = `observation_date,DEXUSEU
2023-01-01,0.9234
2023-01-02,invalid-rate
2023-01-03,0.9212`;

      const file = createMockFile(csvWithInvalidRates, 'invalid-rates.csv');
      const result = await parseCSV(file);

      expect(result.validRows).toBe(2);
      expect(result.data.every(item => typeof item.rate === 'number')).toBe(true);
    });

    it('should handle zero and negative rate values', async () => {
      const csvWithZeroNegative = `observation_date,DEXUSEU
2023-01-01,0.9234
2023-01-02,0
2023-01-03,-0.5
2023-01-04,0.9212`;

      const file = createMockFile(csvWithZeroNegative, 'zero-negative.csv');
      const result = await parseCSV(file);

      expect(result.validRows).toBe(2); // Only positive rates should remain
      expect(result.data.every(item => item.rate > 0)).toBe(true);
    });

    it('should handle comma-separated decimal values', async () => {
      const csvWithCommaDecimals = `observation_date,DEXUSEU
2023-01-01,0,9234
2023-01-02,0,9256
2023-01-03,0,9212`;

      const file = createMockFile(csvWithCommaDecimals, 'comma-decimals.csv');
      const result = await parseCSV(file);

      expect(result.validRows).toBe(3);
      expect(result.data[0].rate).toBe(0.9234);
    });

    it('should reject parsing errors', async () => {
      const Papa = require('papaparse');
      Papa.parse.mockImplementationOnce((file: any, config: any) => {
        setTimeout(() => {
          if (config.error) {
            config.error(new Error('Parse error'));
          }
        }, 0);
      });

      const file = createMockFile(mockCSVData.validCSV, 'error.csv');
      
      await expect(parseCSV(file)).rejects.toThrow('Failed to parse CSV: Parse error');
    });
  });
});
