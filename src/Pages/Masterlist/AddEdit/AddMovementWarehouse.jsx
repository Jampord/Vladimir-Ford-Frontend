import { Box, Button, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  usePostMovementWarehouseApiMutation,
  usePutUpdateMovementWarehouseApiMutation,
} from "../../../Redux/Query/Masterlist/Warehouse";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { LoadingButton } from "@mui/lab";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  name: yup.string().required().label("Movement Warehouse"),
});

const AddMovementWarehouse = ({ data, onUpdateResetHandler }) => {
  const dispatch = useDispatch();

  const [
    postMovementWarehouse,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostMovementWarehouseApiMutation();

  const [
    updateMovementWarehouse,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = usePutUpdateMovementWarehouseApiMutation();

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
      name: "",
    },
  });

  useEffect(() => {
    if ((isPostError || isUpdateError) && (postError?.status === 422 || updateError?.status === 422)) {
      setError("name", {
        type: "validate",
        message: postError?.data?.errors.name || updateError?.data?.errors.name,
      });
    } else if ((isPostError && postError?.status !== 422) || (isUpdateError && updateError?.status !== 422)) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError, isUpdateError]);

  useEffect(() => {
    if (isPostSuccess || isUpdateSuccess) {
      reset();
      handleCloseDrawer();
      dispatch(
        openToast({
          message: postData?.message || updateData?.message,
          duration: 5000,
        })
      );

      setTimeout(() => {
        onUpdateResetHandler();
      }, 500);
    }
  }, [isPostSuccess, isUpdateSuccess]);

  useEffect(() => {
    if (data.status) {
      setValue("name", data.name);
    }
  }, [data]);

  const onSubmitHandler = (formData) => {
    if (data.status) {
      updateMovementWarehouse(formData);
      return;
    }
    postMovementWarehouse(formData);
  };

  const handleCloseDrawer = () => {
    setTimeout(() => {
      onUpdateResetHandler();
    }, 500);

    dispatch(closeDrawer());
  };

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        {data.status ? "Edit Movement warehouse" : "Add Movement warehouse"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomTextField
          control={control}
          name="name"
          label="Movement Warehouse"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.name}
          helperText={errors?.name?.message}
          fullWidth
        />
        <Box className="add-masterlist__buttons">
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            loading={isUpdateLoading || isPostLoading}
            disabled={!isValid}
          >
            {data.status ? "Update" : "Create"}
          </LoadingButton>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleCloseDrawer}
            disabled={(isPostLoading || isUpdateLoading) === true}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddMovementWarehouse;
