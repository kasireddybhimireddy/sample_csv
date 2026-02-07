import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '../components/FileUpload';
import { mockFile, mockInvalidFile, mockLargeFile } from './testUtils';

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', { value: mockAlert });

describe('FileUpload Component', () => {
  const mockOnFileUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  it('renders upload area correctly', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    expect(screen.getByText('Click to browse or drag and drop your DEXUSEU.csv file')).toBeInTheDocument();
    expect(screen.getByText('Supported format: CSV with observation_date and DEXUSEU columns')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument(); // The upload label acts as a button
  });

  it('shows loading state correctly', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={true} />);
    
    expect(screen.getByText('Processing file...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles valid CSV file upload', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
    });
    
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('rejects non-CSV files', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockInvalidFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Please upload a CSV file');
    });
    
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('rejects files larger than 10MB', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = mockLargeFile;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('File size must be less than 10MB');
    });
    
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('accepts CSV files with .csv extension but different MIME type', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const file = new File(['test'], 'test.csv', { type: 'application/octet-stream' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
    });
    
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('handles file selection with no files', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    
    fireEvent.change(fileInput, { target: { files: [] } });
    
    await waitFor(() => {
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
    
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('disables input when loading', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={true} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    expect(fileInput).toBeDisabled();
  });

  it('enables input when not loading', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    expect(fileInput).not.toBeDisabled();
  });

  it('displays upload icon', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const icon = screen.getByText('📊');
    expect(icon).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.csv');
  });

  it('handles multiple file selection (should only process first file)', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const fileInput = screen.getByLabelText('Upload CSV File');
    const files = [mockFile, new File(['test2'], 'test2.csv', { type: 'text/csv' })];
    
    fireEvent.change(fileInput, { target: { files } });
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledTimes(1);
      expect(mockOnFileUpload).toHaveBeenCalledWith(mockFile);
    });
  });

  it('shows loading spinner when loading', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={true} />);
    
    // Check for loading overlay
    const loadingOverlay = document.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();
    
    // Check for loading spinner
    const loadingSpinner = document.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('does not show loading spinner when not loading', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isLoading={false} />);
    
    const loadingOverlay = document.querySelector('.loading-overlay');
    expect(loadingOverlay).not.toBeInTheDocument();
  });
});
