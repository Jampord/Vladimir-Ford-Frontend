import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { closeExport } from "../../Redux/StateManagement/booleanStateSlice";
import {
  useLazyGetPurchaseRequestReconExportQuery,
  useLazyGetPurchaseRequestReconQuery,
} from "../../Redux/Query/Reports/PurchaseRequestRecon";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";
import useExcelJs from "../../Hooks/ExcelJs";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { openToast } from "../../Redux/StateManagement/toastSlice";

const ExportPurchaseRequestRecon = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { excelExport } = useExcelJs();

  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeExport());
  };

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
  ] = useLazyGetPurchaseRequestReconExportQuery();

  const handleExport = async (event, formData) => {
    event.preventDefault();
    console.log("formData", formData);
    console.log("Selected Date:", moment(selectedDate).format("YYYY-MM")); // Log the selected date

    try {
      const res = selectedDate
        ? await trigger({
            year_month: moment(selectedDate).format("YYYY-MM") || null,
            page: "",
            per_page: "",
            pagination: "none",
          }).unwrap()
        : await trigger({
            // year_month: moment(selectedDate).format("YYYY-MM") || null,
            page: "",
            per_page: "",
            pagination: "none",
          }).unwrap();
      // console.log("exportData", exportApi);

      const newObj = res.flatMap((item) => {
        return {
          "Ymir PR": item?.ymir_pr || "-",
          "Vladimir PR": item?.vlad_pr || "-",
          Status: item?.status || "-",
          Date: moment(item?.date).format("YYYY-DD-MM") || "-",
        };
      });

      await excelExport(
        newObj,
        `Vladimir-Purchase-Request-Recon (${selectedDate ? moment(selectedDate).format("YYYY-MM") : "all"}) -`
      );
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
          Export Purchase Request Recon
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
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading || exportApiFetching}
            startIcon={
              exportApiLoading || exportApiFetching ? null : <IosShareRounded color={"primary"} size="small" />
            }
            type="submit"
            color="secondary"
            // disabled={!selectedDate}
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

export default ExportPurchaseRequestRecon;
