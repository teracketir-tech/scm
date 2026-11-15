import React from "react";

export default function SupplierDetails({ supplier = {} }) {
  return (
    <table className="table table-striped w-100">
      <tbody>
        <tr>
          <th colSpan={2}>اطلاعات شرکت تامین کننده</th>
        </tr>
        <tr>
          <th>کد اقتصادی</th>
          <td>{supplier["economic_code"]}</td>
        </tr>
        <tr>
          <th>نام شرکت</th>
          <td>{supplier["company_name"]}</td>
        </tr>
        <tr>
          <th>نام مدیر عامل</th>
          <td>{supplier["name_ceo"]}</td>
        </tr>
        <tr>
          <th>تلفن</th>
          <td>{supplier["phone"]}</td>
        </tr>
      </tbody>
    </table>
  );
}
