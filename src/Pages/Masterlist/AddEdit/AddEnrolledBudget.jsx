import { LoadingButton } from "@mui/lab";
import { Box, Button, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { closeDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useEffect } from "react";
import { usePostEnrolledBudgetApiMutation } from "../../../Redux/Query/Masterlist/EnrolledBudget";
import { useLazyGetTypeOfExpenditureApiQuery } from "../../../Redux/Query/Masterlist/TypeofExpenditure";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import CustomNumberField from "../../../Components/Reusable/CustomNumberField";

const schema = yup.object().shape({
  name: yup.string().required("Budget Name is required").typeError("Budget Name is required"),
  budget: yup.number().required(),
  type_of_expenditure_id: yup
    .object()
    .required("Type of Expenditure is required")
    .typeError("Type of Expenditure is required"),
});

const AddEnrolledBudget = () => {
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
      name: "",
      budget: null,
      type_of_expenditure_id: null,
    },
  });

  const [
    typeOfExpenditureTrigger,
    {
      data: typeOfExpenditureData,
      isLoading: typeOfExpenditureLoading,
      isFetching: typeOfExpenditureFetching,
      isSuccess: typeOfExpenditureSuccess,
      isError: typeOfExpenditureError,
      error: errorData,
      refetch: refetch,
    },
  ] = useLazyGetTypeOfExpenditureApiQuery({
    pagination: "none",
  });

  const [
    postEnrolledBudget,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostEnrolledBudgetApiMutation();

  const onSubmitHandler = (formData) => {
    const newFormData = {
      ...formData,
      type_of_expenditure_id: formData.type_of_expenditure_id.id,
    };
    // if (data.status) {
    //   updateMajorCategory(formData);
    //   return;
    // }
    postEnrolledBudget(newFormData);
  };

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      dispatch(closeDialog());
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (isPostError) {
      dispatch(
        openToast({
          message: postError?.message || "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  return (
    <Box classname="add-masterlist" component="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <DialogTitle sx={{ textAlign: "center" }}>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          Add Enrolled Budget
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box className="add-masterlist__content">
          <CustomTextField
            control={control}
            name="name"
            label="Budget Name"
            type="text"
            color="secondary"
            size="small"
            error={!!errors?.name}
            helperText={errors?.name?.message}
            fullWidth
          />

          <CustomNumberField
            control={control}
            name="budget"
            label="Budget Amount (₱)"
            type="number"
            color="secondary"
            size="small"
            error={!!errors?.name}
            helperText={errors?.name?.message}
            fullWidth
            dontAllowNegative
          />

          <CustomAutoComplete
            autoComplete
            name="type_of_expenditure_id"
            control={control}
            options={typeOfExpenditureData || []}
            loading={typeOfExpenditureLoading}
            size="small"
            onOpen={() => (typeOfExpenditureSuccess ? null : typeOfExpenditureTrigger({ pagination: "none" }))}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="Type of Expenditure"
                error={!!errors?.type_of_expenditure_id}
                helperText={errors?.type_of_expenditure_id?.message}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ mb: 1, mr: 2, gap: 0.5 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          loading={isPostLoading}
          disabled={!isValid || watch("budget") === 0}
        >
          Create
        </LoadingButton>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={() => dispatch(closeDialog())}
          disabled={isPostLoading === true}
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddEnrolledBudget;
