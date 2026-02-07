import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExchangeRateChart from '../components/ExchangeRateChart';
import { mockExchangeRateData, mockProcessedData } from './testUtils';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="chart-line">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

// Mock ChartControls
jest.mock('../components/ChartControls', () => ({
  __esModule: true,
  default: ({ dateFormat, timeUnit, onDateFormatChange, onTimeUnitChange }: any) => (
    <div data-testid="chart-controls">
      <select 
        data-testid="date-format-select" 
        value={dateFormat} 
        onChange={(e) => onDateFormatChange(e.target.value)}
      >
        <option value="MMM yyyy">MMM yyyy</option>
        <option value="MM/dd/yyyy">MM/dd/yyyy</option>
      </select>
      <select 
        data-testid="time-unit-select" 
        value={timeUnit} 
        onChange={(e) => onTimeUnitChange(e.target.value)}
      >
        <option value="day">Day</option>
        <option value="month">Month</option>
      </select>
    </div>
  ),
}));

describe('ExchangeRateChart Component', () => {
  const mockFileName = 'test-data.csv';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart with data correctly', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    expect(screen.getByText('Chart Configuration')).toBeInTheDocument();
    expect(screen.getByText('Exchange Rate Visualization')).toBeInTheDocument();
  });

  it('displays data statistics correctly', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    expect(screen.getByText('Total Data Points:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Date Range:')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 to 2023-01-05')).toBeInTheDocument();
    expect(screen.getByText('Rate Range:')).toBeInTheDocument();
    expect(screen.getByText('0.9212 - 0.9312')).toBeInTheDocument();
  });

  it('shows current format information', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    expect(screen.getByText('Current Format:')).toBeInTheDocument();
    expect(screen.getByText('MMM yyyy (month)')).toBeInTheDocument();
  });

  it('renders ChartControls component', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
    expect(screen.getByTestId('date-format-select')).toBeInTheDocument();
    expect(screen.getByTestId('time-unit-select')).toBeInTheDocument();
  });

  it('handles date format change', async () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    const dateFormatSelect = screen.getByTestId('date-format-select');
    fireEvent.change(dateFormatSelect, { target: { value: 'MM/dd/yyyy' } });
    
    await waitFor(() => {
      expect(screen.getByText('MM/dd/yyyy (month)')).toBeInTheDocument();
    });
  });

  it('handles time unit change', async () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    const timeUnitSelect = screen.getByTestId('time-unit-select');
    fireEvent.change(timeUnitSelect, { target: { value: 'day' } });
    
    await waitFor(() => {
      expect(screen.getByText('MMM yyyy (day)')).toBeInTheDocument();
    });
  });

  it('displays no data message when data is empty', () => {
    render(<ExchangeRateChart data={[]} fileName={mockFileName} />);
    
    expect(screen.getByText('No valid data to display')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-line')).not.toBeInTheDocument();
  });

  it('passes correct data to chart component', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    const chartData = screen.getByTestId('chart-data');
    const dataContent = JSON.parse(chartData.textContent || '{}');
    
    expect(dataContent.labels).toEqual([
      '2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'
    ]);
    expect(dataContent.datasets[0].label).toBe('USD/EUR Exchange Rate');
    expect(dataContent.datasets[0].data).toEqual([0.9234, 0.9256, 0.9212, 0.9289, 0.9312]);
  });

  it('passes correct options to chart component', () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    const chartOptions = screen.getByTestId('chart-options');
    const optionsContent = JSON.parse(chartOptions.textContent || '{}');
    
    expect(optionsContent.responsive).toBe(true);
    expect(optionsContent.maintainAspectRatio).toBe(false);
    expect(optionsContent.plugins.legend.title.text).toBe('USD/EUR Exchange Rate Over Time');
    expect(optionsContent.plugins.title.text).toBe(`Data from ${mockFileName}`);
  });

  it('updates point radius based on time unit', async () => {
    const { rerender } = render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    // Initial state (month)
    let chartData = screen.getByTestId('chart-data');
    let dataContent = JSON.parse(chartData.textContent || '{}');
    expect(dataContent.datasets[0].pointRadius).toBe(2);
    
    // Change to day
    const timeUnitSelect = screen.getByTestId('time-unit-select');
    fireEvent.change(timeUnitSelect, { target: { value: 'day' } });
    
    await waitFor(() => {
      chartData = screen.getByTestId('chart-data');
      dataContent = JSON.parse(chartData.textContent || '{}');
      expect(dataContent.datasets[0].pointRadius).toBe(1);
    });
  });

  it('handles single data point', () => {
    const singleDataPoint = [{ date: '2023-01-01', rate: 0.9234 }];
    
    render(<ExchangeRateChart data={singleDataPoint} fileName={mockFileName} />);
    
    expect(screen.getByText('Total Data Points:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Date Range:')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 to 2023-01-01')).toBeInTheDocument();
  });

  it('handles large dataset', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      date: `2023-01-${String(i + 1).padStart(2, '0')}`,
      rate: 0.9234 + (i * 0.0001),
    }));
    
    render(<ExchangeRateChart data={largeDataset} fileName={mockFileName} />);
    
    expect(screen.getByText('Total Data Points:')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('displays correct rate range for varied data', () => {
    const variedData = [
      { date: '2023-01-01', rate: 0.5 },
      { date: '2023-01-02', rate: 1.5 },
      { date: '2023-01-03', rate: 1.0 },
    ];
    
    render(<ExchangeRateChart data={variedData} fileName={mockFileName} />);
    
    expect(screen.getByText('Rate Range:')).toBeInTheDocument();
    expect(screen.getByText('0.5000 - 1.5000')).toBeInTheDocument();
  });

  it('maintains chart configuration state', async () => {
    render(<ExchangeRateChart data={mockExchangeRateData} fileName={mockFileName} />);
    
    // Change date format
    const dateFormatSelect = screen.getByTestId('date-format-select');
    fireEvent.change(dateFormatSelect, { target: { value: 'MM/dd/yyyy' } });
    
    // Change time unit
    const timeUnitSelect = screen.getByTestId('time-unit-select');
    fireEvent.change(timeUnitSelect, { target: { value: 'day' } });
    
    await waitFor(() => {
      expect(screen.getByText('MM/dd/yyyy (day)')).toBeInTheDocument();
    });
  });
});
