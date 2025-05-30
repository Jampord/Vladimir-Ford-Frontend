import { Box, Button, Typography } from "@mui/material";
import CustomDatePicker from "../../Components/Reusable/CustomDatePicker";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";
import { closeDialog4, closeExport } from "../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import moment from "moment";
import useExcelJs from "../../Hooks/ExcelJs";
import { useLazyGetExportPrintRequestApiQuery } from "../../Redux/Query/FixedAsset/FixedAssets";

const schema = yup.object().shape({
  id: yup.string(),
  from: yup.string().nullable().typeError("Please provide a FROM date"),
  to: yup.string().nullable().typeError("Please provide a TO date"),
});

const ExportPrintFixedAsset = ({ tabValue }) => {
  console.log("tabValue: ", tabValue);
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
  ] = useLazyGetExportPrintRequestApiQuery();

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      from: null,
      to: null,
      export: null,
    },
  });

  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeDialog4());
  };

  const handleExport = async (formData) => {
    console.log("formData", formData);
    try {
      const res = await trigger({
        from: formData?.from ? moment(formData?.from).format("YYYY-MM-DD") : null,
        to: formData?.to ? moment(formData?.to).format("YYYY-MM-DD") : null,
        smallTool: tabValue === "1" ? 0 : 1,
      }).unwrap();
      console.log("exportData", exportApi);

      const newObj = res.flatMap((item) => {
        return {
          "Type of Request": item.type_of_request.type_of_request_name,
          "Vladimir Tag Number": item.vladimir_tag_number,
          "Transaction Number": item.transaction_number,
          "Reference Number": item.reference_number,
          "Asset Description": item.asset_description,
          "Asset Specification": item.asset_specification,
          "Warehouse Number": item.warehouse_number.warehouse_number,
          Warehouse: item.warehouse.warehouse_name,
          "PR Number": item.pr_number,
          "PO Number": item.po_number,
          "RR Number": item.rr_number,
          "Ymir Reference Number": item.ymir_ref_number,
          "Acquisition Cost (₱)": item.acquisition_cost,
          Supplier: item.supplier.supplier_name,
          "Company Code": item?.company.company_code,
          Company: item?.company.company_name,
          "Business Unit Code": item?.business_unit.business_unit_code,
          "Business Unit": item?.business_unit.business_unit_name,
          "Department Code": item?.department.department_code,
          Department: item?.department.department_name,
          "Unit Code": item?.unit.unit_code,
          Unit: item?.unit.unit_name,
          "Subunit Code": item?.subunit.subunit_code,
          Subunit: item?.subunit.subunit_name,
          "Location Code": item?.location.location_code,
          Location: item?.location.location_name,
          Division: item?.division.division_name || "-",
          "Minor Category": item.minor_category.minor_category_name,
          "Major Category": item.major_category.major_category_name,
          Accountability: item.accountability,
          Accountable: item.accountable,
          "Date Created": moment(item?.created_at).format("YYYY-MM-DD"),
        };
      });

      await excelExport(newObj, `Vladimir-Print-Request-${tabValue === "1" ? "Fixed-Asset" : "Small-Tools"}`);
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

  const onSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    event.stopPropagation(); // Prevent event bubbling to parent forms
    handleSubmit(handleExport)(event); // Call react-hook-form's handleSubmit
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Typography variant="h6" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export Print Request
        </Typography>
        <Typography color="secondary" sx={{ fontFamily: "Anton", fontSize: "15px", marginTop: -3 }}>
          {tabValue === "1" ? "Fixed Asset" : "Small Tools"}
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
          />
        </Box>

        <Box sx={{ display: "flex", gap: "10px" }}>
          <LoadingButton
            variant="contained"
            loading={exportApiLoading}
            startIcon={exportApiLoading ? null : <IosShareRounded color={!isValid ? "gray" : "primary"} size="small" />}
            type="submit"
            color="secondary"
            // disabled={!isValid}
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

export default ExportPrintFixedAsset;
