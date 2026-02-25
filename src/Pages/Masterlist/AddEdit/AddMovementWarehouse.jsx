import { Box, Button, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";

const schema = yup.object().shape({
  name: yup.string().required().label("Movement Warehouse"),
  evaluation_permission: yup.array().required().label("Evaluation Permission"),
  can_dispose: yup.number().required().label("Disposal Permission"),
  can_bid: yup.number().required().label("Bidding Permission"),
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
      evaluation_permission: [],
      can_dispose: 0,
      can_bid: 0,
    },
  });

  console.log("watchdispose", watch("can_dispose"));
  console.log("watchbid", watch("can_bid"));

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
      console.log(data);
      setValue("id", data?.id);
      setValue("name", data.name);
      setValue("evaluation_permission", data?.evaluation_permission);
      setValue("can_dispose", data?.can_dispose);
      setValue("can_bid", data?.can_bid);
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
        {data.status ? "Edit Movement Warehouse" : "Add Movement Warehouse"}
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

        <CustomAutoComplete
          control={control}
          name="evaluation_permission"
          options={[
            "To Pickup",
            "List of Pullout",
            "For PR",
            "For Safe-Keeping",
            "Spare",
            "For Disposal",
            "For Bidding",
          ]}
          // isOptionEqualToValue={(option, value) => option === value}
          multiple
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              color={"secondary"}
              label="Evaluation Permission"
              error={!!errors?.evaluation_permission}
              helperText={errors?.evaluation_permission?.message}
            />
          )}
        />

        <FormGroup row sx={{ gap: 5 }}>
          <Controller
            name="can_dispose"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="Disposal"
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    defaultValue={0}
                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                  />
                }
              />
            )}
          />
          <Controller
            name="can_bid"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="Bidding"
                control={
                  <Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked ? 1 : 0)} />
                }
              />
            )}
          />
        </FormGroup>

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
