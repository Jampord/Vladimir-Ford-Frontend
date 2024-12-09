import { useDispatch } from "react-redux";
import useExcelJs from "../../../Hooks/ExcelJs";
import { useLazyGetTransferHistoryReportExportApiQuery } from "../../../Redux/Query/Movement/AssetMovementReports";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import moment from "moment";
import { closeExport } from "../../../Redux/StateManagement/booleanStateSlice";
import { Box, Button, Typography } from "@mui/material";
import CustomDatePicker from "../../../Components/Reusable/CustomDatePicker";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";

const schema = yup.object().shape({
  id: yup.string(),
  from: yup.string().required().typeError("Please provide a FROM date"),
  to: yup.string().required().typeError("Please provide a TO date"),
});

const ExportTransfer = () => {
  const dispatch = useDispatch();
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
  ] = useLazyGetTransferHistoryReportExportApiQuery();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      from: null,
      to: null,
      export: null,
    },
  });

  useEffect(() => {
    if (exportApiError && exportError?.status === 422) {
      dispatch(
        openToast({
          message: exportError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (exportApiError && exportError?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    } else if (exportApiError && exportError?.status === 404) {
      dispatch(
        openToast({
          message: "No Records Found. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [exportApiError]);

  const handleExport = async (formData) => {
    try {
      const res = await trigger({
        search: "",
        page: "",
        perPage: "",
        from: moment(formData?.from).format("MMM DD, YYYY"),
        to: moment(formData?.to).format("MMM DD, YYYY"),
        export: 1,
      }).unwrap();

      const newObj = res?.flatMap((item) => {
        return {
          ID: item?.id,
          "Vladimir Tag Number": item?.vladimir_tag_number,
          "Asset Description": item?.asset_description,
          Status: item?.status,
          "Asset From": item?.from,
          "Asset To": item?.to,
          "Movement Type": item?.movement_type,
          "Date Created": moment(item?.created_at).format("MMM DD, YYYY"),
        };
      });

      await excelExport(newObj, "Vladimir-Transfer-Reports.xlsx");
      dispatch(
        openToast({
          message: "Successfully Exported",
          duration: 5000,
          variant: "success",
        })
      );
      dispatch(closeExport());
    } catch (err) {
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

  const handleClose = () => {
    dispatch(closeExport());
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(handleExport)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Typography variant="h5" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export Transfer History Reports
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <CustomDatePicker
            control={control}
            name="from"
            label="From"
            size="small"
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
          />
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading}
            startIcon={
              exportApiLoading ? null : (
                <IosShareRounded
                  // color={disabledItems() ? "gray" : "primary"}
                  color={!isValid ? "gray" : "primary"}
                  size="small"
                />
              )
            }
            type="submit"
            color="secondary"
            disabled={!isValid}
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

export default ExportTransfer;
