import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  createFilterOptions,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { closeDialog, closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import {
  usePostTypeOfExpenditureApiMutation,
  usePutTypeOfExpenditureUpdateApiMutation,
} from "../../../Redux/Query/Masterlist/TypeofExpenditure";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useEffect } from "react";
import { useGetUserAccountAllApiQuery } from "../../../Redux/Query/UserManagement/UserAccountsApi";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";

const schema = yup.object().shape({
  name: yup.string().required("Type of Expenditure Name is required").typeError("Type of Expenditure Name is required"),
  users: yup.array().required("At least one user must be tagged").min(1, "At least one user must be tagged"),
});

const AddTypeofExpenditure = ({ data, onUpdateResetHandler }) => {
  console.log("data", data);
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
      users: [],
    },
  });

  const [
    postTypeOfExpenditure,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostTypeOfExpenditureApiMutation();

  const [
    updateTypeOfExpenditure,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      data: updateData,
      isError: isUpdateError,
      error: updateError,
    },
  ] = usePutTypeOfExpenditureUpdateApiMutation();

  const {
    data: userData = [],
    isLoading: isUserLoading,
    isSuccess: isUserSuccess,
    isError: isUserError,
  } = useGetUserAccountAllApiQuery();

  const onSubmitHandler = (formData) => {
    const newFormData = {
      id: data?.id,
      name: formData.name,
      users: formData.users.map((user) => user.id),
    };

    if (data.status) {
      updateTypeOfExpenditure(newFormData);
      return;
    }
    postTypeOfExpenditure(newFormData);
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

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
      setValue("name", data?.name);
      setValue("users", data?.users);
    }
  }, [data]);

  return (
    <Box classname="add-masterlist" component="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <DialogTitle sx={{ textAlign: "center" }}>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          Add Type of Expenditure
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box className="add-masterlist__content">
          <CustomTextField
            control={control}
            name="name"
            label="Type of Expenditure Name"
            type="text"
            color="secondary"
            size="small"
            disabled={data.status}
            error={!!errors?.name}
            helperText={errors?.name?.message}
            fullWidth
          />

          <CustomAutoComplete
            name="users"
            control={control}
            size="small"
            multiple
            required
            disableClearable
            disableCloseOnSelect
            fullWidth
            filterOptions={filterOptions}
            options={userData}
            loading={isUserLoading}
            getOptionLabel={(option) => `(${option.employee_id}) - ${option.firstname} ${option.lastname}`}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Users"
                color="secondary"
                error={!!errors?.users?.message}
                helperText={errors?.users?.message}
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
          disabled={isPostLoading === true}
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddTypeofExpenditure;
