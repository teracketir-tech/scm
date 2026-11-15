import { Select, Form } from "antd";
import { useState } from "react";

export const FloatingSelect = ({ label, name, rules, options, mode, required, ...props }) => {
  const value = Form.useWatch(name);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== "");

  return (
    <div className={`relative floating-field ${isFocused ? "focused" : ""} ${hasValue ? "has-value" : ""}`}>
      <Form.Item name={name} rules={rules} className="!mb-0">
        <Select
          options={options}
          mode={mode}
          className="floating-select w-full"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </Form.Item>
      <label className="floating-label">
        {label}
        {required && (
          <span className="text-gray-500 ml-1 required">
            <b>(</b> الـزامـی <b>)</b>
          </span>
        )}
      </label>
    </div>
  );
};