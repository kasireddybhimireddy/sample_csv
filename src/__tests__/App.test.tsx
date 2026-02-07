import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { mockFile, mockCSVData, mockExchangeRateData } from './testUtils';

// Mock the CSV parser
jest.mock('../utils/csvParser', () => ({
  parseCSV: jest.fn(),
}));

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line">Chart Component</div>,
}));

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', { value: mockAlert });

describe('App Component Integration Tests', () => {
  const { parseCSV } = require('../utils/csvParser');

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  it('renders initial upload interface', () => {
    render(<App />);
    
    expect(screen.getByText('USD/EUR Exchange Rate')).toBeInTheDocument();
    expect(screen.getByText('Upload your DEXUSEU.csv file to visualize exchange rate data')).toBeInTheDocument();
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    expect(screen.getByText('Click to browse or drag and drop your DEXUSEU.csv file')).toBeInTheDocument();
  });

  it('shows loading state during file processing', async () => {
    parseCSV.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    }), 100)));

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('Processing your CSV file...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays chart after successful file upload', async () => {
    parseCSV.mockResolvedValue({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    });

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });
  });

  it('displays data summary after successful upload', async () => {
    parseCSV.mockResolvedValue({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    });

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Data Summary')).toBeInTheDocument();
      expect(screen.getByText('File Name:')).toBeInTheDocument();
      expect(screen.getByText('test.csv')).toBeInTheDocument();
      expect(screen.getByText('Total Rows:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Valid Data Points:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Data Quality:')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });
  });

  it('displays error message on file processing failure', async () => {
    parseCSV.mockRejectedValue(new Error('Failed to parse CSV'));

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to parse CSV')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('resets to upload state after error', async () => {
    parseCSV.mockRejectedValue(new Error('Failed to parse CSV'));

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    
    const resetButton = screen.getByText('Try Again');
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  it('allows uploading new file after successful upload', async () => {
    parseCSV.mockResolvedValue({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    });

    render(<App />);
    
    // First upload
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
    });
    
    // Click upload new file button
    const uploadNewButton = screen.getByText('Upload New File');
    fireEvent.click(uploadNewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
      expect(screen.queryByText('Exchange Rate Visualization')).not.toBeInTheDocument();
    });
  });

  it('handles invalid file types', async () => {
    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Please upload a CSV file');
    });
    
    expect(parseCSV).not.toHaveBeenCalled();
  });

  it('handles files larger than 10MB', async () => {
    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    const largeFile = new File([largeContent], 'large.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('File size must be less than 10MB');
    });
    
    expect(parseCSV).not.toHaveBeenCalled();
  });

  it('displays correct data quality percentage', async () => {
    parseCSV.mockResolvedValue({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 10,
      validRows: 7,
    });

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Data Quality:')).toBeInTheDocument();
      expect(screen.getByText('70.0%')).toBeInTheDocument();
    });
  });

  it('handles empty dataset', async () => {
    parseCSV.mockResolvedValue({
      data: [],
      fileName: 'empty.csv',
      totalRows: 0,
      validRows: 0,
    });

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
      expect(screen.getByText('No valid data to display')).toBeInTheDocument();
    });
  });

  it('maintains application state during file processing', async () => {
    let resolvePromise: any;
    parseCSV.mockImplementation(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show loading state
    expect(screen.getByText('Processing your CSV file...')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
    });
  });

  it('handles multiple rapid file uploads', async () => {
    parseCSV.mockResolvedValue({
      data: mockExchangeRateData,
      fileName: 'test.csv',
      totalRows: 5,
      validRows: 5,
    });

    render(<App />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    // Rapid file uploads
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
    });
    
    // Should only call parseCSV once (the second call should be ignored while loading)
    expect(parseCSV).toHaveBeenCalledTimes(1);
  });

  it('displays correct application title and description', () => {
    render(<App />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('USD/EUR Exchange Rate');
    expect(screen.getByText('Upload your DEXUSEU.csv file to visualize exchange rate data')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<App />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    const uploadButton = screen.getByRole('button');
    const fileInput = screen.getByLabelText('Upload CSV File');
    
    expect(mainHeading).toBeInTheDocument();
    expect(uploadButton).toBeInTheDocument();
    expect(fileInput).toBeInTheDocument();
  });
});
