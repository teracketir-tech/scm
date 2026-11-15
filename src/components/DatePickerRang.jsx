import { useEffect } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import DatePicker, { DateObject } from "react-multi-date-picker";

export default function DatePickerRang({ onChange }) {
  const convert = (date) => {
    if (!date || Object.values(date).length < 2) {
      onChange([]);
      return;
    }

    onChange(
      Object.values(date).map((d) => {
        const object = { date: d, format: "YYYY-MM-DD" };
        return new DateObject(object).convert(gregorian, gregorian_en).format();
      })
    );
  };

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      inputClass={"ant-input w-100"}
      containerClassName="w-100 d-block"
      onChange={convert}
      range
      rangeHover
      calendarPosition="bottom"
    />
  );
}
