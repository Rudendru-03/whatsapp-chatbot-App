import * as XLSX from "xlsx";

export const readExcel = async (): Promise<string[]> => {
  const response = await fetch("/Book.xlsx");
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

  const phoneNumbers = jsonData.map((row) => row.Phone as string);
  
  return phoneNumbers;
};
