import React from 'react';

interface ChartControlsProps {
  dateFormat: string;
  timeUnit: string;
  onDateFormatChange: (format: string) => void;
  onTimeUnitChange: (unit: string) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  dateFormat,
  timeUnit,
  onDateFormatChange,
  onTimeUnitChange,
}) => {
  return (
    <div className="chart-controls">
      <div className="control-group">
        <label htmlFor="date-format">Date Format:</label>
        <select
          id="date-format"
          value={dateFormat}
          onChange={(e) => onDateFormatChange(e.target.value)}
          className="control-select"
        >
          <option value="MMM yyyy">Jan 2024</option>
          <option value="MM/dd/yyyy">01/15/2024</option>
          <option value="dd/MM/yyyy">15/01/2024</option>
          <option value="yyyy-MM-dd">2024-01-15</option>
          <option value="MMM dd, yyyy">Jan 15, 2024</option>
        </select>
      </div>
      
      <div className="control-group">
        <label htmlFor="time-unit">Time Unit:</label>
        <select
          id="time-unit"
          value={timeUnit}
          onChange={(e) => onTimeUnitChange(e.target.value)}
          className="control-select"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
          <option value="year">Year</option>
        </select>
      </div>
    </div>
  );
};

export default ChartControls;
