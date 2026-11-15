import { Input, Form } from "antd";
import { useState } from "react";

export const FloatingInput = ({ label, name, rules, required, type = "text", ...props }) => {
  const value = Form.useWatch(name);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div className={`relative floating-field ${isFocused ? "focused" : ""} ${hasValue ? "has-value" : ""}`}>
      <Form.Item name={name} rules={rules} className="!mb-0">
        <Input
          type={type}
          className="floating-input pt-6 pb-2"
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