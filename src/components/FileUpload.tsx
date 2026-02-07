import React from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      onFileUpload(file);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-area">
        <label htmlFor="csv-file" className="upload-label">
          <div className="upload-content">
            <div className="upload-icon">📊</div>
            <h3>Upload CSV File</h3>
            <p>Click to browse or drag and drop your DEXUSEU.csv file</p>
            <p className="file-hint">Supported format: CSV with observation_date and DEXUSEU columns</p>
          </div>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="file-input"
          />
        </label>
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing file...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
