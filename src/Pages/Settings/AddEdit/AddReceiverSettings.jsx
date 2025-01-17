import { LoadingButton } from "@mui/lab";
import { Box, Button, createFilterOptions, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetUserAccountAllApiQuery } from "../../../Redux/Query/UserManagement/UserAccountsApi";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { usePostReceiverSettingsApiMutation } from "../../../Redux/Query/Settings/ReceiverSettings";
import { useEffect } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  user_id: yup.object().required().label("Receiver"),
});
const AddReceiverSettings = () => {
  const dispatch = useDispatch();

  const {
    data: userData = [],
    isLoading: isUserLoading,
    isSuccess: isUserSuccess,
    isError: isUserError,
  } = useGetUserAccountAllApiQuery();

  const [
    postReceiverSettings,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostReceiverSettingsApiMutation();

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
      user_id: null,
    },
  });

  const handleCloseDrawer = () => {
    dispatch(closeDrawer());
  };

  const onSubmitHandler = (formData) => {
    console.log({ user_id: formData.user_id.id });
    postReceiverSettings({ user_id: formData.user_id.id });
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  useEffect(() => {
    if (isPostError && postError?.status === 422) {
      setError("user_id", {
        type: "validate",
        message: postError?.data?.errors,
      });
    } else if (isPostError && postError?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

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
    }
  }, [isPostSuccess]);

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        Add Receiver
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          name="user_id"
          control={control}
          size="small"
          required
          // includeInputInList
          fullWidth
          filterOptions={filterOptions}
          options={userData}
          loading={isUserLoading}
          getOptionLabel={(option) => `(${option.employee_id}) - ${option.firstname} ${option.lastname}`}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Receiver"
              color="secondary"
              error={!!errors?.approver_id?.message}
              helperText={errors?.approver_id?.message}
            />
          )}
        />

        <Box className="add-masterlist__buttons">
          <LoadingButton type="submit" variant="contained" size="small" loading={isPostLoading} disabled={!isValid}>
            Add
          </LoadingButton>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleCloseDrawer}
            disabled={isPostLoading === true}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddReceiverSettings;
