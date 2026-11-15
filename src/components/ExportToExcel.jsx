import { Button } from "antd";
import ExcelJS from "exceljs";

export default function ExportToExcel({ title, headers, data, textColor = "000000" }) {
  return (
    <Button type="default" className="mr-2" onClick={() => handleDownloadExcel("StyledSheet", headers, data, textColor)}>
      {title}
    </Button>
  );
}

export async function handleDownloadExcel(name, headers, data, textColor = "000000") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(name, { views: [{ rightToLeft: true }] });

  // Set column widths and headers
  sheet.columns = headers.map((header, index) => ({
    key: index,
    header: header.title,
    width: header?.width || 20,
  }));

  // Apply styles to the header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: header?.bgColor || "FFFFFFFF" },
    };

    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };

    cell.font = { bold: true, color: { argb: textColor } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Add data rows with centered text
  data.forEach((rowData) => {
    const row = sheet.addRow(rowData);
    row.height = 20;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  // Download Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.xlsx`;
  link.click();
}
