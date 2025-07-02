import { LoadingButton } from "@mui/lab";
import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { usePutWarehouseOneChargingTaggingApiMutation } from "../../../Redux/Query/Masterlist/Warehouse";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useEffect } from "react";
import { useGetDepartmentAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import { useGetOneRDFChargingAllApiQuery } from "../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";

const schema = yup.object().shape({
  one_charging_id: yup.array().required().label("Department").typeError("Department is required"),
  warehouse_name: yup.string().nullable().label("Warehouse Name"),
});

const TagWarehouseDepartment = ({ data }) => {
  console.log("dart", data);

  const dispatch = useDispatch();
  const icon = <CheckBoxOutlineBlank fontSize="small" />;
  const checkedIcon = <CheckBox fontSize="small" />;

  const [
    putWarehouseDepartment,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePutWarehouseOneChargingTaggingApiMutation();

  const {
    data: departmentData = [],
    isLoading: isDepartmentLoading,
    isSuccess: isDepartmentSuccess,
    isError: isDepartmentError,
    refetch: isDepartmentRefetch,
  } = useGetOneRDFChargingAllApiQuery({ pagination: "none" }, { refetchOnMountOrArgChange: true });

  console.log("departmentData", departmentData);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      one_charging_id: data?.one_charging || [],
      warehouse_name: data?.warehouse_name || "",
    },
  });

  const handleCloseDrawer = () => {
    dispatch(closeDrawer());
  };

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
    const one_charging_id = formData.one_charging_id.map((item) => item.sync_id);
    console.log("one_charging_idddddd", { one_charging_id: one_charging_id });
    putWarehouseDepartment({ id: data?.sync_id, one_charging_id: one_charging_id });
  };

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      handleCloseDrawer();
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );

      // dispatch(departmentApi.util.invalidateTags(["Department"]));

      // setTimeout(() => {
      //   onUpdateResetHandler();
      // }, 500);
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (isPostError) {
      dispatch(
        openToast({
          variant: "error",
          message: postError?.data?.message || "Something went wrong. Please try again.",
          duration: 5000,
        })
      );
    }
  }, [isPostError]);

  // console.log("👀👀👀", watch("one_charging_id"));

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        {data.action === "view"
          ? "View Warehouse Tagging"
          : data?.one_charging.length === 0
          ? "Add Warehouse Tagging"
          : "Edit Warehouse Tagging"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          readOnly={data.action === "view"}
          // freeSolo={data.action === "view"}
          disabled={data.action === "view" && data.one_charging.length === 0}
          autoComplete
          multiple
          disableCloseOnSelect
          name="one_charging_id"
          control={control}
          options={departmentData}
          loading={isDepartmentLoading}
          size="small"
          getOptionLabel={(option) => `${option.code} - ${option.name}`}
          getOptionKey={(option, index) => `${option.id}-${index}`}
          //   getOptionDisabled={(option) => !data?.department?.some((item) => item?.id !== option?.id)}
          getOptionDisabled={(option) =>
            option?.receiving_warehouse !== null &&
            !data?.one_charging?.some((item) => item?.sync_id === option?.sync_id)
          }
          isOptionEqualToValue={(option, value) => option.sync_id === value.sync_id}
          slotProps={{
            popper: {
              placement: "top",
              modifiers: [
                {
                  name: "flip",
                  enabled: true,
                  options: {
                    altBoundary: true,
                    rootBoundary: "document",
                    // padding: 8,
                  },
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                  options: {
                    altAxis: true,
                    altBoundary: false,
                    tether: false,
                    rootBoundary: "document",
                    // padding: 8,
                  },
                },
              ],
            },
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              {console.log("option", option)}
              <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
              {`${option.code} - ${option.name}`}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              color="secondary"
              {...params}
              label={
                data.action === "view" && data.one_charging.length === 0 ? "No tagged One Charging" : "One Charging"
              }
              error={!!errors?.one_charging_id?.message}
              helperText={errors?.one_charging_id?.message}
            />
          )}
        />

        <CustomTextField
          disabled={data.status === true}
          control={control}
          name="warehouse_name"
          label="Warehouse Name"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.warehouse_name}
          helperText={errors?.warehouse_name?.message}
          fullWidth
        />

        <Box className="add-masterlist__buttons">
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            loading={isPostLoading}
            disabled={!isValid || watch("one_charging_id").length === 0}
            sx={data.action === "view" ? { display: "none" } : null}
          >
            {data?.one_charging.length === 0 ? "Tag" : "Update"}
          </LoadingButton>

          <Button
            variant={data.action === "view" ? "contained" : "outlined"}
            color="secondary"
            size="small"
            onClick={handleCloseDrawer}
            disabled={isPostLoading === true}
            fullWidth={data.action === "view" ? true : false}
          >
            {data.action === "view" ? "Close" : "Cancel"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TagWarehouseDepartment;
