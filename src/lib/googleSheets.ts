import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

const getAuthClient = async () => {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf8"));
    return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
};

export const appendToGoogleSheet = async (sheetId: string, data: any[]) => {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:C",
        valueInputOption: "RAW",
        requestBody: { values: [data] },
    });
};
