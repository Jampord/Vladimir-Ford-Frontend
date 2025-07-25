import { Box, Button, TextField, Typography } from "@mui/material";
import { IosShareRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useDispatch } from "react-redux";
import useExcelJs from "../../../Hooks/ExcelJs";
import { useLazyGetExportDepreciationApiQuery } from "../../../Redux/Query/FixedAsset/FixedAssets";
import { useEffect } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import moment from "moment";
import { closeExport } from "../../../Redux/StateManagement/booleanStateSlice";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import CustomDatePicker from "../../../Components/Reusable/CustomDatePicker";

const schema = yup.object().shape({
  id: yup.string(),
  search: yup.string().nullable().label("Search"),
  startDate: yup.string().nullable().typeError("Please provide a start date"),
  endDate: yup.string().nullable().typeError("Please provide a end date"),
});

const ExportFixedAssetDepreciation = ({ type }) => {
  console.log("type", type);
  const dispatch = useDispatch();

  // const { excelExport } = useExcel();
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
  ] = useLazyGetExportDepreciationApiQuery();

  // const {
  //   data: typeOfRequestData = [],
  //   isLoading: isTypeOfRequestLoading,
  //   isSuccess: isTypeOfRequestSuccess,
  //   isError: isTypeOfRequestError,
  //   refetch: isTypeOfRequestRefetch,
  // } = useGetTypeOfRequestAllApiQuery();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      search: "",
      startDate: null,
      endDate: null,
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
    }
  }, [exportApiError]);

  const handleExport = async (data) => {
    const newData = {
      ...data,
      startDate: data.startDate === null ? "" : moment(new Date(data.startDate)).format("YYYY-MM-DD"),
      endDate: data.endDate === null ? "" : moment(new Date(data.endDate)).format("YYYY-MM-DD"),
      filter: type,
    };

    try {
      // console.log(newData);
      const res = await trigger(newData);
      // console.log(res);

      const exportData = res.data?.map((item) => {
        // console.log(item);
        return {
          // ID: item.id,
          "Vladimir Tag Number":
            item.vladimir_tag_number + (item.add_cost_sequence === null ? "" : `-${item.add_cost_sequence}`),
          "Type Of Request": item.type_of_request,
          "Charged Department": item.charged_department,
          CAPEX: item.capex,
          "Project Name": item.project_name,
          "Sub Capex": item.sub_capex,
          "Sub Project Name": item.sub_project,
          // "Old Asset": item.is_old_asset,
          "Tag Number": item.tag_number,
          "Old Tag Number": item.tag_number_old,

          Division: item.division,
          "Major Category": item.major_category,
          "Minor Category": item.minor_category,

          "One Charging Code": item.one_charging_code,
          "One Charging": item.one_charging_name,

          "Company Code": item.company_code,
          Company: item.company_name,

          "Business Unit Code": item.business_unit_code,
          "Business Unit": item.business_unit_name,

          "Department Code": item.department_code,
          Department: item.department_name,

          "Unit Code": item.unit_code,
          Unit: item.unit_name,

          "Sub Unit Code": item.sub_unit_code,
          "Sub Unit": item.sub_unit_name,

          "Location Code": item.location_code,
          Location: item.location_name,

          "Depreciation Credit Code": item?.depreciation_credit_code,
          "Depreciation Credit Name": item?.depreciation_credit_name,

          "Depreciation Debit Code": item?.depreciation_debit_code,
          "Depreciation Debit Name": item?.depreciation_debit_name,

          "Initial Credit Code": item?.initial_credit_code,
          "Initial Credit Name": item?.initial_credit_name,

          "Initial Debit Code": item?.initial_debit_code,
          "Initial Debit Name": item?.initial_debit_name,

          "Asset Description": item.asset_description,
          "Asset Specification": item.asset_specification,
          Accountability: item.accountability,
          "Acquisition Date": moment(item.acquisition_date).format("MMM DD, YYYY"),
          Accountable: item.accountable,
          Capitalized: item.capitalized,
          "Cellphone Number": item.cellphone_number,
          Brand: item.brand,
          "Care Of": item.care_of,
          Voucher: item.voucher,
          "Voucher Date": item.voucher_date,
          "PR Number": item.ymir_pr_number,
          "PO Number": item.po_number,
          Receipt: item.receipt,
          Quantity: item.quantity,
          "Asset Status": item.asset_status,
          "Cycle Count Status": item.cycle_count_status,
          "Asset Movement Status": item.movement_status,

          "Depreciation Method": item.depreciation_method,
          "Estimated Useful Life": item.est_useful_life,
          "Release Date": moment(item.release_date).format("MMM DD, YYYY"),
          "Depreciation Status": item.depreciation_status,
          "Acquisition Cost (₱)": item.acquisition_cost,
          "Months Depreciated": item.months_depreciated,
          "Scrap Value (₱)": item.scrap_value,
          "Depreciable Basis": item.depreciable_basis,
          "Accumulated Cost (₱)": item.accumulated_cost,
          "Start Depreciation": moment(item.start_depreciation).format("MMM DD, YYYY"),
          "End Depreciation": moment(item.end_depreciation).format("MMM DD, YYYY"),
          "Depreciation Per Year (₱)": item.depreciation_per_year,
          "Depreciation Per Month (₱)": item.depreciation_per_month,
          "Remaining Book Value (₱)": item.remaining_book_value,
        };
      });
      await excelExport(exportData, `Vladimir-Fixed-Assets-Depreciation-${type}`);

      // console.log(res);
    } catch (err) {
      console.log(err.message);
    }
  };

  //

  const handleClose = () => {
    dispatch(closeExport());
  };

  const disabledItems = () => {
    return watch("search") === "" && watch("startDate") === null && watch("endDate") === null;
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
          Export Asset Depreciation
        </Typography>
        <Typography color="secondary" fontSize={15} mt={-2} sx={{ fontFamily: "Anton" }}>
          {type.toUpperCase()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* <CustomAutoComplete
            control={control}
            name="search"
            options={typeOfRequestData}
            loading={isTypeOfRequestLoading}
            size="small"
            getOptionLabel={(option) => option.type_of_request_name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="Type of Request  "
                error={!!errors?.type_of_request_id}
                helperText={errors?.type_of_request_id?.message}
              />
            )}
          /> */}

          <CustomTextField
            control={control}
            name="search"
            label="🔍︎ Search Filter"
            type="text"
            color="secondary"
            size="small"
            error={!!errors?.search}
            helperText={errors?.search?.message}
            fullWidth
          />

          <CustomDatePicker
            control={control}
            name="startDate"
            label="Start Date"
            size="small"
            error={!!errors?.startDate}
            helperText={errors?.startDate?.message}
          />

          <CustomDatePicker
            control={control}
            name="endDate"
            label="End Date"
            size="small"
            maxDate={new Date()}
            error={!!errors?.endDate}
            helperText={errors?.endDate?.message}
          />
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading || exportApiFetching}
            startIcon={
              exportApiLoading || exportApiFetching ? null : (
                <IosShareRounded
                  // color={disabledItems() ? "gray" : "primary"}
                  color={"primary"}
                  size="small"
                />
              )
            }
            type="submit"
            color="secondary"
            // disabled={disabledItems()}
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

export default ExportFixedAssetDepreciation;
