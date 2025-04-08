import { Box, Button, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";
import { closeExport } from "../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useLazyGetRequestExportApiQuery } from "../../Redux/Query/Request/Requisition";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import moment from "moment";
import useExcelJs from "../../Hooks/ExcelJs";
import { useLazyGetExportGeneralLedgerReportApiQuery } from "../../Redux/Query/Reports/GeneralLedgerReport";
import { DatePicker } from "@mui/x-date-pickers";
import { useState } from "react";

const ExportGeneralLedgerReports = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { excelExport } = useExcelJs();

  const [
    trigger,
    {
      data: exportApi,
      isLoading: exportApiLoading,
      isSuccess: exportApiSuccess,
      isFetching: exportApiFetching,
      isError: exportApiError,
      error: exportError,
      refetch: exportApiRefetch,
    },
  ] = useLazyGetExportGeneralLedgerReportApiQuery();

  console.log("GL Data:", exportApi);

  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeExport());
  };

  const handleExport = async (formData) => {
    console.log("formData", formData);
    console.log("Selected Date:", moment(selectedDate).format("YYYY-MM")); // Log the selected date

    try {
      const res = await trigger({
        adjustment_date: moment(selectedDate).format("YYYY-MM") || null,
      }).unwrap();
      // console.log("exportData", exportApi);

      const newObj = res.flatMap((item) => {
        return {
          "Sync ID": item?.syncId || "-",
          "Mark 1": item?.mark1 || "-",
          "Mark 2": item?.mark2 || "-",
          "Asset CIP": item?.assetCIP || "-",
          "Accounting Tag": item?.accountingTag || "-",
          "Transaction Date": item?.transactionDate || "-",
          "Client Supplier": item?.clientSupplier || "-",
          "Account Title Code": item?.accountTitleCode || "-",
          "Account Title Name": item?.accountTitle || "-",
          "Company Code": item?.companyCode || "-",
          "Company Name": item?.company || "-",
          "Division Code": item?.divisionCode || "-",
          "Division Name": item?.division || "-",
          "Department Code": item?.departmentCode || "-",
          "Department Name": item?.department || "-",
          "Unit Code": item?.unitCode || "-",
          "Unit Name": item?.unit || "-",
          "Sub Unit Code": item?.subUnitCode || "-",
          "Sub Unit Name": item?.subUnit || "-",
          "Location Code": item?.locationCode || "-",
          "Location Name": item?.location || "-",
          "PO Number": item?.poNumber || "-",
          "RR Number": item?.rrNumber || "-",
          "Reference Number": item?.referenceNo || "-",
          "Item Code": item?.itemCode || "-",
          "Item Description": item?.itemDescription || "-",
          Quantity: item?.quantity || "-",
          UOM: item?.uom || "-",
          "Unit Price (₱)": item?.unitPrice || "-",
          "Line Amount (₱)": item?.lineAmount || "-",
          "Voucher Journal": item?.voucherJournal || "-",
          "Account Type": item?.accountType || "-",
          "DR / CR": item?.drcr || "-",
          "Asset Code": item?.assetCode || "-",
          Asset: item?.asset || "-",
          "Service Provider Code": item?.serviceProviderCode || "-",
          "Service Provider": item?.serviceProvider || "-",
          BOA: item?.boa || "-",
          Allocation: item?.allocation || "-",
          "Account Group": item?.accountGroup || "-",
          "Account Sub Group": item?.accountSubGroup || "-",
          "Financial Statement": item?.financialStatement || "-",
          "Unit Responsible": item?.unitResponsible || "-",
          Batch: item?.batch || "-",
          Remarks: item?.remarks || "-",
          "Payroll Period": item?.payrollPeriod || "-",
          Position: item?.position || "-",
          "Payroll Type": item?.payrollType || "-",
          "Payroll Type 2": item?.payrollType2 || "-",
          "Depreciation Description": item?.depreciationDescription || "-",
          "Remaining Depreciation Value": item?.remainingDepreciationValue || "-",
          "Useful Life": item?.usefulLife || "-",
          Month: item?.month || "-",
          Year: item?.year || "-",
          Particulars: item?.particulars || "-",
          "Month 2": item?.month2 || "-",
          "Farm Type": item?.farmType || "-",
          Adjustment: item?.adjustment || "-",
          From: item?.from || "-",
          "Change To": item?.changeTo || "-",
          Reason: item?.reason || "-",
          "Checking Remarks": item?.checkingRemarks || "-",
          "Bank Name": item?.bankName || "-",
          "Cheque Number": item?.chequeNumber || "-",
          "Cheque Voucher Number": item?.chequeVoucherNumber || "-",
          "BOA 2": item?.boA2 || "-",
          System: item?.system || "-",
          Books: item?.books || "-",
        };
      });

      await excelExport(newObj, `Vladimir-General-Ledger-Report (${moment(selectedDate).format("YYYY-MM")}) -`);
      dispatch(
        openToast({
          message: "Successfully Exported",
          duration: 5000,
          variant: "success",
        })
      );
      dispatch(closeExport());
    } catch (err) {
      console.log("err", err);

      if (err?.status === 422) {
        dispatch(
          openToast({
            message: err.data.errors?.detail,
            duration: 5000,
            variant: "error",
          })
        );
      } else if (err?.status !== 422) {
        dispatch(
          openToast({
            message: "Something went wrong. Please try again.",
            duration: 5000,
            variant: "error",
          })
        );
      }
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleExport}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Typography variant="h6" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export General Ledger Report
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <DatePicker
            name="adjustment_date"
            label={"Month and Year"}
            views={["month", "year"]}
            maxDate={new Date()}
            value={selectedDate} // Bind the state to the DatePicker
            onChange={(newValue) => setSelectedDate(newValue)} // Update state on change
          />
          {/* <CustomDatePicker
            control={control}
            name="from"
            label="From"
            size="small"
            maxDate={new Date()}
            error={!!errors?.from}
            helperText={errors?.from?.message}
          />

          <CustomDatePicker
            control={control}
            name="to"
            label="To"
            size="small"
            disabled={!watch("from")}
            minDate={watch("from")}
            maxDate={new Date()}
            error={!!errors?.to}
            helperText={errors?.to?.message}
          /> */}
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading || exportApiFetching}
            startIcon={
              exportApiLoading || exportApiFetching ? null : (
                <IosShareRounded color={!selectedDate ? "gray" : "primary"} size="small" />
              )
            }
            type="submit"
            color="secondary"
            disabled={!selectedDate}
          >
            Export
          </LoadingButton>

          <Button variant="outlined" size="small" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ExportGeneralLedgerReports;
