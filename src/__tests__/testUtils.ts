// Test utilities and mock data for USD/EUR Exchange Rate application

export const mockCSVData = {
  validCSV: `observation_date,DEXUSEU
2023-01-01,0.9234
2023-01-02,0.9256
2023-01-03,0.9212
2023-01-04,0.9289
2023-01-05,0.9312`,

  invalidCSV: `observation_date,DEXUSEU
2023-01-01,0.9234
2023-01-02,
2023-01-03,invalid
2023-01-04,0.9289
invalid-date,0.9312`,

  emptyCSV: `observation_date,DEXUSEU`,

  mixedHeadersCSV: `Date,Rate
2023-01-01,0.9234
2023-01-02,0.9256
2023-01-03,0.9212`,
};

export const mockExchangeRateData = [
  { date: '2023-01-01', rate: 0.9234 },
  { date: '2023-01-02', rate: 0.9256 },
  { date: '2023-01-03', rate: 0.9212 },
  { date: '2023-01-04', rate: 0.9289 },
  { date: '2023-01-05', rate: 0.9312 },
];

export const mockProcessedData = {
  data: mockExchangeRateData,
  fileName: 'test-data.csv',
  totalRows: 5,
  validRows: 5,
};

export const mockFile = new File([mockCSVData.validCSV], 'test.csv', {
  type: 'text/csv',
});

export const mockInvalidFile = new File(['invalid content'], 'test.txt', {
  type: 'text/plain',
});

export const mockLargeFile = new File([mockCSVData.validCSV.repeat(1000)], 'large.csv', {
  type: 'text/csv',
});

// Chart.js mock for testing
export const mockChartInstance = {
  data: {
    datasets: [{
      label: 'USD/EUR Exchange Rate',
      data: [0.9234, 0.9256, 0.9212],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
  update: jest.fn(),
  destroy: jest.fn(),
};

// Helper functions for testing
export const createMockFile = (content: string, name: string, type: string = 'text/csv') => {
  return new File([content], name, { type });
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPapaParse = {
  parse: jest.fn((file, config) => {
    if (config.complete) {
      const lines = file.toString().split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        return row;
      });
      config.complete({ data, errors: [] });
    }
  }),
};

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockPapaParse.parse.mockClear();
};
