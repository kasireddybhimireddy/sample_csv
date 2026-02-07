import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ExchangeRateChart from './components/ExchangeRateChart';
import { parseCSV } from './utils/csvParser';
import { ProcessedData } from './types';

function App() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseCSV(file);
      setProcessedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProcessedData(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>USD/EUR Exchange Rate</h1>
        <p>Upload your DEXUSEU.csv file to visualize exchange rate data</p>
      </header>
      
      <main className="App-main">
        {!processedData && !isLoading && (
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        )}
        
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your CSV file...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={handleReset} className="reset-button">
              Try Again
            </button>
          </div>
        )}
        
        {processedData && !isLoading && (
          <div className="chart-section">
            <div className="chart-header">
              <h2>Exchange Rate Visualization</h2>
              <button onClick={handleReset} className="reset-button">
                Upload New File
              </button>
            </div>
            <ExchangeRateChart 
              data={processedData.data} 
              fileName={processedData.fileName} 
            />
            <div className="data-summary">
              <h3>Data Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">File Name:</span>
                  <span className="summary-value">{processedData.fileName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Rows:</span>
                  <span className="summary-value">{processedData.totalRows}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Valid Data Points:</span>
                  <span className="summary-value">{processedData.validRows}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Data Quality:</span>
                  <span className="summary-value">
                    {((processedData.validRows / processedData.totalRows) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
