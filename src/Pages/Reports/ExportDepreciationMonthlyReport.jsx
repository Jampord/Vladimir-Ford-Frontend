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
import { useLazyGetDepreciationMonthlyReportApiQuery } from "../../Redux/Query/FixedAsset/FixedAssets";

const ExportDepreciationMonthlyReport = () => {
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
  ] = useLazyGetDepreciationMonthlyReportApiQuery();

  //   console.log("Depre Data:", exportApi);

  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeExport());
  };

  const handleExport = async (formData) => {
    console.log("formData", formData);
    console.log("Selected Date:", moment(selectedDate).format("YYYY-MM")); // Log the selected date

    try {
      const res = await trigger({
        year_month: moment(selectedDate).format("YYYY-MM") || null,
        pagination: "none",
      }).unwrap();
      // console.log("exportData", exportApi);

      const newObj = res.flatMap((item) => {
        return {
          "Vladimir Tag Number": item?.vladimir_tag_number || "-",
          "Asset Description": item?.asset_description || "-",
          "Asset Specification": item?.asset_specification || "-",
          "Acquisition Cost (₱)": item?.acquisition_cost || "-",
          "Depreciation Basis": item?.depreciation_basis || "-",
          "Depreciated Date": item?.depreciated_date || "-",
          "Months Depreciated": item?.months_depreciated || "-",
          "Monthly Depreciation (₱)": item?.monthly_depreciation || "-",
          "Yearly Depreciation (₱)": item?.yearly_depreciation || "-",
          "Accumulated Depreciation (₱)": item?.accumulated_depreciation || "-",
          "Remaining Book Value (₱)": item?.remaining_book_value || "-",
          "Company Code": item?.company?.company_code || "-",
          Company: item?.company?.company_name || "-",
          "Business Unit Code": item?.business_unit?.business_unit_code || "-",
          "Business Unit": item?.business_unit?.business_unit_name || "-",
          "Department Code": item?.department?.department_code || "-",
          Department: item?.department?.department_name || "-",
          "Unit Code": item?.unit?.unit_code || "-",
          Unit: item?.unit?.unit_name || "-",
          "Sub Unit Code": item?.sub_unit?.sub_unit_code || "-",
          "Sub Unit": item?.sub_unit?.sub_unit_name || "-",
          "Location Code": item?.location?.location_code || "-",
          Location: item?.location?.location_name || "-",
          "Initial Debit": `${item?.initial_debit?.debit_code} - ${item?.initial_debit?.debit_name}` || "-",
          "Initial Credit": `${item?.initial_credit?.credit_code} - ${item?.initial_credit?.credit_name}` || "-",
          "Depreciation Debit":
            `${item?.depreciation_debit?.debit_code} - ${item?.depreciation_debit?.debit_name}` || "-",
          "Depreciation Credit":
            `${item?.depreciation_credit?.credit_code} - ${item?.depreciation_credit?.credit_name}` || "-",
          "Secondary Depreciation Debit":
            `${item?.secondary_depreciation_debit?.debit_code || ""} - ${
              item?.secondary_depreciation_debit?.debit_name || ""
            }` || "-",
          "Secondary Depreciation Credit":
            `${item?.secondary_depreciation_credit?.credit_code || ""} - ${
              item?.secondary_depreciation_credit?.credit_name || ""
            }` || "-",
          "Date Created": moment(item?.created_at).format("MMMM DD, YYYY") || "-",
        };
      });

      await excelExport(newObj, `Vladimir-Depreciation-Monthly-Report (${moment(selectedDate).format("YYYY-MM")}) -`);
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
          Export Depreciation Monthly Report
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <DatePicker
            name="year_month"
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

export default ExportDepreciationMonthlyReport;
