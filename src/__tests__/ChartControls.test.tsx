import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartControls from '../components/ChartControls';

describe('ChartControls Component', () => {
  const mockOnDateFormatChange = jest.fn();
  const mockOnTimeUnitChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    expect(screen.getByLabelText('Date Format:')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Unit:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MMM yyyy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <ChartControls
        dateFormat="MM/dd/yyyy"
        timeUnit="day"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    expect(screen.getByDisplayValue('MM/dd/yyyy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
  });

  it('displays all date format options', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const dateFormatSelect = screen.getByLabelText('Date Format:');
    const options = Array.from(dateFormatSelect.querySelectorAll('option'));
    
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveValue('MMM yyyy');
    expect(options[0]).toHaveTextContent('Jan 2024');
    expect(options[1]).toHaveValue('MM/dd/yyyy');
    expect(options[1]).toHaveTextContent('01/15/2024');
    expect(options[2]).toHaveValue('dd/MM/yyyy');
    expect(options[2]).toHaveTextContent('15/01/2024');
    expect(options[3]).toHaveValue('yyyy-MM-dd');
    expect(options[3]).toHaveTextContent('2024-01-15');
    expect(options[4]).toHaveValue('MMM dd, yyyy');
    expect(options[4]).toHaveTextContent('Jan 15, 2024');
  });

  it('displays all time unit options', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const timeUnitSelect = screen.getByLabelText('Time Unit:');
    const options = Array.from(timeUnitSelect.querySelectorAll('option'));
    
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveValue('day');
    expect(options[0]).toHaveTextContent('Day');
    expect(options[1]).toHaveValue('week');
    expect(options[1]).toHaveTextContent('Week');
    expect(options[2]).toHaveValue('month');
    expect(options[2]).toHaveTextContent('Month');
    expect(options[3]).toHaveValue('quarter');
    expect(options[3]).toHaveTextContent('Quarter');
    expect(options[4]).toHaveValue('year');
    expect(options[4]).toHaveTextContent('Year');
  });

  it('calls onDateFormatChange when date format is changed', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const dateFormatSelect = screen.getByLabelText('Date Format:');
    fireEvent.change(dateFormatSelect, { target: { value: 'MM/dd/yyyy' } });

    expect(mockOnDateFormatChange).toHaveBeenCalledWith('MM/dd/yyyy');
    expect(mockOnTimeUnitChange).not.toHaveBeenCalled();
  });

  it('calls onTimeUnitChange when time unit is changed', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const timeUnitSelect = screen.getByLabelText('Time Unit:');
    fireEvent.change(timeUnitSelect, { target: { value: 'day' } });

    expect(mockOnTimeUnitChange).toHaveBeenCalledWith('day');
    expect(mockOnDateFormatChange).not.toHaveBeenCalled();
  });

  it('handles multiple changes correctly', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const dateFormatSelect = screen.getByLabelText('Date Format:');
    const timeUnitSelect = screen.getByLabelText('Time Unit:');

    // Change date format
    fireEvent.change(dateFormatSelect, { target: { value: 'dd/MM/yyyy' } });
    expect(mockOnDateFormatChange).toHaveBeenCalledWith('dd/MM/yyyy');

    // Change time unit
    fireEvent.change(timeUnitSelect, { target: { value: 'week' } });
    expect(mockOnTimeUnitChange).toHaveBeenCalledWith('week');

    // Change date format again
    fireEvent.change(dateFormatSelect, { target: { value: 'yyyy-MM-dd' } });
    expect(mockOnDateFormatChange).toHaveBeenCalledWith('yyyy-MM-dd');

    expect(mockOnDateFormatChange).toHaveBeenCalledTimes(2);
    expect(mockOnTimeUnitChange).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const controlsContainer = screen.getByTestId('chart-controls') || document.querySelector('.chart-controls');
    const controlGroups = document.querySelectorAll('.control-group');
    const controlSelects = document.querySelectorAll('.control-select');

    expect(controlsContainer).toBeInTheDocument();
    expect(controlGroups).toHaveLength(2);
    expect(controlSelects).toHaveLength(2);
  });

  it('select elements have correct attributes', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const dateFormatSelect = screen.getByLabelText('Date Format:') as HTMLSelectElement;
    const timeUnitSelect = screen.getByLabelText('Time Unit:') as HTMLSelectElement;

    expect(dateFormatSelect.id).toBe('date-format');
    expect(timeUnitSelect.id).toBe('time-unit');
    expect(dateFormatSelect.className).toContain('control-select');
    expect(timeUnitSelect.className).toContain('control-select');
  });

  it('labels have correct text content', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    expect(screen.getByText('Date Format:')).toBeInTheDocument();
    expect(screen.getByText('Time Unit:')).toBeInTheDocument();
  });

  it('handles same value selection', () => {
    render(
      <ChartControls
        dateFormat="MMM yyyy"
        timeUnit="month"
        onDateFormatChange={mockOnDateFormatChange}
        onTimeUnitChange={mockOnTimeUnitChange}
      />
    );

    const dateFormatSelect = screen.getByLabelText('Date Format:');
    
    // Select the same value
    fireEvent.change(dateFormatSelect, { target: { value: 'MMM yyyy' } });

    expect(mockOnDateFormatChange).toHaveBeenCalledWith('MMM yyyy');
  });

  it('works with all date format values', () => {
    const dateFormats = ['MMM yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MMM dd, yyyy'];
    
    dateFormats.forEach(format => {
      const { unmount } = render(
        <ChartControls
          dateFormat={format}
          timeUnit="month"
          onDateFormatChange={mockOnDateFormatChange}
          onTimeUnitChange={mockOnTimeUnitChange}
        />
      );

      expect(screen.getByDisplayValue(format)).toBeInTheDocument();
      unmount();
    });
  });

  it('works with all time unit values', () => {
    const timeUnits = ['day', 'week', 'month', 'quarter', 'year'];
    
    timeUnits.forEach(unit => {
      const { unmount } = render(
        <ChartControls
          dateFormat="MMM yyyy"
          timeUnit={unit}
          onDateFormatChange={mockOnDateFormatChange}
          onTimeUnitChange={mockOnTimeUnitChange}
        />
      );

      const displayText = unit.charAt(0).toUpperCase() + unit.slice(1);
      expect(screen.getByDisplayValue(displayText)).toBeInTheDocument();
      unmount();
    });
  });
});
