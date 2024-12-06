import moment from "moment";
import * as XLSX from "xlsx";

const useExcel = () => {
  const excelExport = async (obj, title) => {
    const worksheet = XLSX.utils.json_to_sheet(obj);

    //*******************GPT Formatting ***********************************/
    const headerNames = Object.keys(obj[0]);

    const formatHeaders = (worksheet, headerNames) => {
      headerNames.forEach((header, index) => {
        // const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: index })];
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        const cell = worksheet[cellAddress];

        if (cell) {
          cell.s = {
            font: {
              bold: true,
              color: { rgb: "FFFFFF" }, // White font color
            },
            fill: {
              fgColor: { rgb: "4F81BD" }, // Blue background for headers
            },
            alignment: {
              horizontal: "center", // Center text horizontally
              vertical: "center", // Center text vertically
            },
          };
        } else {
          console.error(`Header cell at row 0, column ${index} is undefined.`);
        }
      });
    };

    // Function to auto-adjust column widths
    const autoAdjustColumnWidths = (worksheet, obj) => {
      const colWidths = [];

      // Iterate over each column in the data
      for (let colIndex = 0; colIndex < headerNames.length; colIndex++) {
        let maxLength = 0;

        // Check the length of the header
        maxLength = Math.max(maxLength, headerNames[colIndex].toString().length);

        // Check the length of each row's content in the column
        for (let rowIndex = 0; rowIndex < obj.length; rowIndex++) {
          const cellValue = obj[rowIndex][headerNames[colIndex]];
          maxLength = Math.max(maxLength, (cellValue != null ? cellValue.toString() : "").length);
        }

        // Store the maximum length for the column, add extra padding
        colWidths.push({ wch: maxLength + 2 });
      }

      // Apply the column widths to the worksheet
      worksheet["!cols"] = colWidths;
    };

    // Format headers and auto-adjust column widths
    formatHeaders(worksheet, headerNames);
    autoAdjustColumnWidths(worksheet, obj);

    //**********************************************************/

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${title} ${moment().format("MMM-DD-YYYY")}.xlsx`);
  };

  const filterHeader = async (jsonData) => {
    await jsonData.map((row) => {
      Object.keys(row).map((key) => {
        let newKey = key.trim().toLowerCase().replace(/ /g, "_");
        if (key !== newKey) {
          row[newKey] = row[key];
          delete row[key];
        }
      });
    });

    return jsonData;
  };

  const excelImport = async (file) => {
    const excelFile = await file.arrayBuffer();
    const workbook = XLSX.readFile(excelFile);
    const initialWorkSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(initialWorkSheet, { raw: true });
    // ADDED FILTER TO REMOVE BLANK ROWS
    jsonData.filter((row) => {
      Object.values(row).some((value) => value !== "");
    });
    return await filterHeader(jsonData);
  };

  return { excelExport, excelImport };
};

export default useExcel;
