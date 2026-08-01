# CSV Import and Export
## SpendWise — Student Expense Tracker

This document details the functionality for moving raw data in and out of SpendWise.

---

## 1. CSV Export (Data Portability)

Users must be able to extract their data for personal backup, analysis in Excel/Google Sheets, or sharing with accountants/parents.

### 1.1 Export Trigger & Flow
*   **Location:** `Reports Tab` -> `Export CSV`.
*   **Scope:** Users can export the *Currently Selected Month* or *All Time*.
*   **Process:** Client-side generation using `SheetJS` or a simple Blob/URI conversion to minimize server load.
*   **File Name Format:** `SpendWise_Export_YYYY-MM.csv` or `SpendWise_Export_AllTime.csv`.

### 1.2 CSV Schema (Export)

| Column Name | Data Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `Date` | YYYY-MM-DD | 2026-07-15 | The date of the expense. |
| `Time` | HH:MM | 14:30 | The time the expense was logged (24h). |
| `Amount_INR` | Float (2 decimal) | 150.00 | The raw numerical amount. |
| `Category` | String | Food & Dining | The assigned category name. |
| `Note` | String | Lunch at mess | User's optional description. |
| `Status` | String | Active | "Active" or "Deleted" (if we allow exporting soft-deleted items). |
| `Expense_ID` | String | exp_abc123 | System ID for deduplication. |

---

## 2. CSV Import (Migration & Bulk Entry) - v1.2 Feature

To help users migrate from other apps (like Walnut, Splitwise, or Excel) to SpendWise.

### 2.1 Import Flow
*   **Location:** `Settings` -> `Account` -> `Import Data`.
*   **Process:**
    1.  User selects a CSV file.
    2.  App parses the file entirely on the client-side (PapaParse).
    3.  **Mapping UI:** App shows the columns found in the CSV and asks the user to map them to SpendWise fields (Date, Amount, Category, Note).
    4.  **Preview:** App shows a preview of the first 3 rows to confirm mapping.
    5.  **Execution:** App batches Firestore writes (max 500 per batch) to upload the expenses.

### 2.2 Handling CSV Import Edge Cases
*   **Unrecognized Categories:** If the CSV contains "Groceries" but SpendWise only has "Mess / Groceries", prompt the user during the mapping phase: *"Map 'Groceries' to an existing category, or create it as a new Custom Category."*
*   **Invalid Dates/Amounts:** Skip rows with unparseable data and show a summary at the end: *"Imported 45 expenses. Skipped 2 rows due to invalid formatting."*
*   **Duplicates:** If an imported row matches the exact Date, Amount, and Note of an existing expense, flag it as a potential duplicate.

---

## 3. Google Drive / Local Backups (Future Integrations)

While Firebase handles real-time cloud sync, some users want hard copies of their data.

### 3.1 Google Drive Backup
*   **Concept:** Auto-sync the CSV export to a specific folder in the user's Google Drive.
*   **Trigger:** Monthly cron job (Cloud Function) runs on the 1st of the month, generates the previous month's CSV, and pushes it to Drive via the Google Drive API.
*   **Requirement:** Requires requesting specific Google Drive OAuth scopes (`https://www.googleapis.com/auth/drive.file`).

### 3.2 Local JSON Backup
*   For users who want complete control over their raw data structure.
*   Export the entire Firestore document tree (Expenses, Budget, Categories, User Settings) as a single nested JSON file.
*   Useful for complete account restoration or advanced local data parsing.
