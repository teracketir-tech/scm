import React, { useEffect, useRef } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { p2e } from "../module/util";
export default function Datepicker({
  onChange,
  name,
  value,
  placeholder,
  disabled = false,
}) {
  const calendarRef = useRef();
  const closeOpenMenus = (e) => {
    if (calendarRef.current && !calendarRef.current.contains(e.target)) {
      calendarRef.current.closeCalendar();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", closeOpenMenus);
  }, [calendarRef]);
  return (
    <>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        inputClass={"ant-input w-100"}
        containerClassName="w-100 d-block"
        ref={calendarRef}
        value={value}
        calendarPosition="bottom"
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          onChange(e ? p2e(e.format()) : "");
        }}
      />
    </>
  );
}
