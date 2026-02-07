import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ExchangeRateData } from '../types';
import ChartControls from './ChartControls';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ExchangeRateChartProps {
  data: ExchangeRateData[];
  fileName: string;
}

const ExchangeRateChart: React.FC<ExchangeRateChartProps> = ({ data, fileName }) => {
  const [dateFormat, setDateFormat] = React.useState('MMM yyyy');
  const [timeUnit, setTimeUnit] = React.useState('month');

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'USD/EUR Exchange Rate',
        data: data.map(item => item.rate),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointRadius: timeUnit === 'day' ? 1 : 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const getDisplayFormat = (unit: string) => {
    switch (unit) {
      case 'day':
        return dateFormat;
      case 'week':
        return dateFormat.includes('MMM') ? 'MMM dd, yyyy' : 'MM/dd/yyyy';
      case 'month':
        return dateFormat.includes('MMM') ? 'MMM yyyy' : 'MM/yyyy';
      case 'quarter':
        return dateFormat.includes('MMM') ? 'QQQ yyyy' : 'yyyy';
      case 'year':
        return 'yyyy';
      default:
        return dateFormat;
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        title: {
          display: true,
          text: 'USD/EUR Exchange Rate Over Time',
          font: {
            size: 16,
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: `Data from ${fileName}`,
        font: {
          size: 14,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems: any[]) => {
            const date = new Date(tooltipItems[0].label);
            return `Date: ${date.toLocaleDateString()}`;
          },
          label: (context: any) => {
            return `Exchange Rate: ${context.parsed.y.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timeUnit as any,
          displayFormats: {
            day: getDisplayFormat('day'),
            week: getDisplayFormat('week'),
            month: getDisplayFormat('month'),
            quarter: getDisplayFormat('quarter'),
            year: getDisplayFormat('year'),
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: timeUnit === 'day' ? 30 : timeUnit === 'week' ? 20 : 12,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Exchange Rate (USD per EUR)',
        },
        ticks: {
          callback: (value: any) => value.toFixed(3),
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="no-data-container">
        <p>No valid data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-controls-section">
        <h3>Chart Configuration</h3>
        <ChartControls
          dateFormat={dateFormat}
          timeUnit={timeUnit}
          onDateFormatChange={setDateFormat}
          onTimeUnitChange={setTimeUnit}
        />
      </div>
      
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Total Data Points:</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Date Range:</span>
          <span className="stat-value">
            {data[0]?.date} to {data[data.length - 1]?.date}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rate Range:</span>
          <span className="stat-value">
            {Math.min(...data.map(d => d.rate)).toFixed(4)} - {Math.max(...data.map(d => d.rate)).toFixed(4)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Format:</span>
          <span className="stat-value">{dateFormat} ({timeUnit})</span>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ExchangeRateChart;
