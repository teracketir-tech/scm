import { Form } from "antd";
import { useState } from "react";

const { Item } = Form;

export const CustomField = ({ 
  label, 
  name, 
  rules, 
  children, 
  required, 
  className = "", 
  ...props 
}) => {
  // بررسی می‌کنیم که آیا فیلد مقدار دارد یا نه
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  // چون children یک کامپوننت (مثل Input) است، باید پراپ‌های focus و value رو بهش پاس بدیم
  // این کار کمی پیچیده میشه، پس از یک روش ساده‌تر استفاده می‌کنیم:
  // یک لایه روی فیلد می‌گذاریم که با focus و blur کار کنه.

  return (
    <div className={`custom-floating-field ${className}`}>
      <Item
        name={name}
        rules={rules}
        className="!mb-0 custom-item-wrapper"
        {...props}
      >
        {children}
      </Item>
      
      {/* لیبل شناور */}
      <label 
        className={`custom-floating-label ${isFocused || hasValue ? "is-active" : ""}`}
      >
        {label}
        {required && <span className="text-gray-500 ml-1 required"> <b>(</b> الـزامـی <b>)</b> </span>}
      </label>
    </div>
  );
};