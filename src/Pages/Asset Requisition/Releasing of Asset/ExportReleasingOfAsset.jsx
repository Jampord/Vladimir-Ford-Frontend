import { Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { IosShareRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import moment from "moment";
import { closeExport } from "../../../Redux/StateManagement/booleanStateSlice";
import useExcelJs from "../../../Hooks/ExcelJs";
import { useLazyGetRequestExportApiQuery } from "../../../Redux/Query/Request/Requisition";
import CustomDatePicker from "../../../Components/Reusable/CustomDatePicker";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useLazyGetExportAssetReleasingQuery } from "../../../Redux/Query/Request/AssetReleasing";

const schema = yup.object().shape({
  id: yup.string(),
  from: yup.string().nullable().typeError("Please provide a FROM date"),
  to: yup.string().nullable().typeError("Please provide a TO date"),
});

const ExportReleasingOfAsset = ({ released }) => {
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
  ] = useLazyGetExportAssetReleasingQuery();

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
    dispatch(closeExport());
  };

  const handleExport = async (formData) => {
    console.log("formData", formData);
    try {
      const res = await trigger({
        from: formData?.from ? moment(formData?.from).format("YYYY-MM-DD") : null,
        to: formData?.to ? moment(formData?.to).format("YYYY-MM-DD") : null,
        isReleased: released === true ? 1 : 0,
      }).unwrap();
      // console.log("exportData", exportApi);
      console.log("res", res);

      const newObj = res?.data.flatMap((item) => {
        return {
          // "Date Created": moment(item?.created_at).format("YYYY-MM-DD"),
          "Vladimir Tag Number":
            item.is_additional_cost === 1
              ? `${item.vladimir_tag_number}-${item.add_cost_sequence}`
              : item.vladimir_tag_number,
          "Type of Request": item.type_of_request.type_of_request_name,
          "Asset Description": item.asset_description,
          "Asset Specification": item.asset_specification,
          Accountability: item.accountability,
          Accountable: item.accountable,
          "Delivery Type": item?.delivery_type,
          "One Charging Code": item.one_charging.code,
          "One Charging": item.one_charging.name,
          "Company Code": item.one_charging.company_code,
          Company: item.one_charging.company_name,
          "Business Unit Code": item.one_charging.business_unit_code,
          "Business Unit": item.one_charging.business_unit_name,
          "Department Code": item.one_charging.department_code,
          Department: item.one_charging.department_name,
          "Unit Code": item.one_charging.unit_code,
          Unit: item.one_charging.unit_name,
          "Subunit Code": item.one_charging.subunit_code,
          Subunit: item.one_charging.subunit_name,
          "Location Code": item.one_charging.location_code,
          Location: item.one_charging.location_name,
          "Acquisition Cost": `₱${item.acquisition_cost}`,
          "Acquisition Date": item.acquisition_date,
          "Supplier Code": item.supplier.supplier_code,
          "Supplier Name": item.supplier.supplier_name,
          Warehouse: item.warehouse.warehouse_name,
          "PR Number": item.ymir_pr_number,
          "PO Number": item.po_number,
          "RR Number": item.rr_number,
          "Major Category": item.major_category.major_category_name,
          "Minor Category": item.minor_category.minor_category_name,
          Requestor:
            `(${item.requestor?.employee_id || item.requestor_id?.employee_id})` +
            " - " +
            (item.requestor?.firstname || item.requestor_id?.firstname) +
            " " +
            (item.requestor?.lastname || item.requestor_id?.lastname),
          "Date Released": released === true ? item?.release_date : "For Releasing",
        };
      });

      await excelExport(newObj, released === true ? "Vladimir-Released-Asset" : "Vladimir-For-Releasing-of-Asset");
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
        onSubmit={handleSubmit(handleExport)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Typography variant="h6" color="secondary" sx={{ fontFamily: "Anton" }}>
          Export {released === true ? "Released" : "For Releasing of"} Asset
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

export default ExportReleasingOfAsset;
                                                                                                        