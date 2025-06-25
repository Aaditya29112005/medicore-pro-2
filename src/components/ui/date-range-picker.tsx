import React from "react";

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={value.from}
        onChange={e => onChange({ ...value, from: e.target.value })}
        className="border rounded px-2 py-1"
      />
      <span className="mx-1">to</span>
      <input
        type="date"
        value={value.to}
        onChange={e => onChange({ ...value, to: e.target.value })}
        className="border rounded px-2 py-1"
      />
    </div>
  );
};

export { DateRangePicker }; 