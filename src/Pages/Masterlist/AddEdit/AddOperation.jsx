import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  usePostOperationApiMutation,
  usePutOperationUpdateApiMutation,
} from "../../../Redux/Query/Masterlist/Operation";
import { useEffect } from "react";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { LoadingButton } from "@mui/lab";

const schema = yup.object().shape({
  operation_name: yup.string().required("Operation Name is required").typeError("Operation Name is required"),
});

const AddOperation = ({ data, onUpdateResetHandler }) => {
  const dispatch = useDispatch();

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
      operation_name: "",
    },
  });

  const [
    postOperation,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostOperationApiMutation();

  const [
    updateOperation,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      data: updateData,
      isError: isUpdateError,
      error: updateError,
    },
  ] = usePutOperationUpdateApiMutation();

  const onSubmitHandler = (formData) => {
    if (data.status) {
      const newFormData = { id: data.id, ...formData };
      updateOperation(newFormData);
      return;
    }
    postOperation(formData);
  };

  useEffect(() => {
    if (isPostSuccess || isUpdateSuccess) {
      reset();
      dispatch(closeDrawer());
      dispatch(
        openToast({
          message: postData?.message || updateData?.message,
          duration: 5000,
        })
      );
      onUpdateResetHandler();
    }
  }, [isPostSuccess || isUpdateSuccess]);

  useEffect(() => {
    if (isPostError || isUpdateError) {
      dispatch(
        openToast({
          message: postError?.message || updateError?.message || "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError || isUpdateError]);

  useEffect(() => {
    if (data.status) {
      setValue("operation_name", data?.operation_name);
    }
  }, [data]);

  return (
    <Box classname="add-masterlist" component="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <DialogTitle sx={{ textAlign: "center" }}>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          Add Operation
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box className="add-masterlist__content">
          <CustomTextField
            control={control}
            name="operation_name"
            label="Operation Name"
            type="text"
            color="secondary"
            size="small"
            // disabled={data.status}
            error={!!errors?.operation_name}
            helperText={errors?.operation_name?.message}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ mb: 1, mr: 2, gap: 0.5 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          loading={isPostLoading || isUpdateLoading}
          disabled={!isValid}
        >
          {data.status ? "Update" : "Create"}
        </LoadingButton>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={() => {
            dispatch(closeDrawer());
            onUpdateResetHandler();
          }}
          disabled={(isPostLoading || isUpdateLoading) === true}
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddOperation;
