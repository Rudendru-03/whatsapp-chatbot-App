"use server"
import * as xlsx from "xlsx";
import * as fs from 'fs';
import * as path from 'path';

export const readExcel = async (): Promise<string[]> => {
  const filePath = path.join(process.cwd(), "src/data/Book.xlsx");
  const fileBuffer = fs.readFileSync(filePath);

    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

  const jsonData: any[] = xlsx.utils.sheet_to_json(sheet);

  const phoneNumbers = jsonData.map((row) => row.Phone as string);
  
  return phoneNumbers;
};
