import { LoadingButton } from "@mui/lab";
import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { usePutWarehouseDepartmentTaggingApiMutation } from "../../../Redux/Query/Masterlist/Warehouse";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useEffect } from "react";
import { useGetDepartmentAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Department";

const schema = yup.object().shape({
  department_id: yup.array().required().label("Department").typeError("Department is required"),
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
  ] = usePutWarehouseDepartmentTaggingApiMutation();

  const {
    data: departmentData = [],
    isLoading: isDepartmentLoading,
    isSuccess: isDepartmentSuccess,
    isError: isDepartmentError,
    refetch: isDepartmentRefetch,
  } = useGetDepartmentAllApiQuery({ refetchOnMountOrArgChange: true });

  // console.log("departmentData", departmentData);

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
      department_id: data?.department || [],
      warehouse_name: data?.warehouse_name || "",
    },
  });

  const handleCloseDrawer = () => {
    dispatch(closeDrawer());
  };

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
    const department_id = formData.department_id.map((item) => item.sync_id);
    // console.log("department_idddddd", { department_id: department_id });
    putWarehouseDepartment({ id: data?.sync_id, department_id: department_id });
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

  // console.log("👀👀👀", watch("department_id"));

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        {data.action === "view"
          ? "View Warehouse Tagging"
          : data?.department.length === 0
          ? "Add Warehouse Tagging"
          : "Edit Warehouse Tagging"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          readOnly={data.action === "view"}
          // freeSolo={data.action === "view"}
          disabled={data.action === "view" && data.department.length === 0}
          autoComplete
          multiple
          disableCloseOnSelect
          name="department_id"
          control={control}
          options={departmentData}
          loading={isDepartmentLoading}
          size="small"
          getOptionLabel={(option) => `${option.department_code} - ${option.department_name}`}
          //   getOptionDisabled={(option) => !data?.department?.some((item) => item?.id !== option?.id)}
          getOptionDisabled={(option) =>
            option?.warehouse !== null && !data?.department?.some((item) => item?.sync_id === option?.sync_id)
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
              <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
              {`${option.department_code} - ${option.department_name}`}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              color="secondary"
              {...params}
              label={data.action === "view" && data.department.length === 0 ? "No Tagged Department" : "Department"}
              error={!!errors?.department_id?.message}
              helperText={errors?.department_id?.message}
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
            disabled={!isValid || watch("department_id").length === 0}
            sx={data.action === "view" ? { display: "none" } : null}
          >
            {data?.department.length === 0 ? "Tag" : "Update"}
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
