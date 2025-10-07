import React, { useEffect, useState } from "react";
import "../../../Style/Masterlist/addMasterlist.scss";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import {
  usePostMinorCategoryApiMutation,
  useUpdateMinorCategoryApiMutation,
} from "../../../Redux/Query/Masterlist/Category/MinorCategory";

import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { LoadingButton } from "@mui/lab";
import { useGetAccountTitleAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import { useGetMajorCategoryAllApiQuery } from "../../../Redux/Query/Masterlist/Category/MajorCategory";
import { useGetCreditAllQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Credit";

const schema = yup.object().shape({
  id: yup.string(),

  major_category_id: yup
    .string()
    .transform((value) => {
      return value?.id.toString();
    })
    .required()
    .label("Major Category"),

  minor_category_name: yup.string().required(),

  depreciation_credit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Depreciation Credit"),
  initial_debit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Initial Debit"),

  has_atoe: yup.number().required().label("ATOE"),
});

const AddMinorCategory = (props) => {
  const { data, onUpdateResetHandler } = props;
  const [filteredMajorCategoryData, setFilteredMajorCategoryData] = useState([]);
  const dispatch = useDispatch();

  console.log("Data", data);

  const {
    data: majorCategoryData = [],
    isLoading: isMajorCategoryLoading,
    isError: isMajorCategoryError,
  } = useGetMajorCategoryAllApiQuery();

  const {
    data: accountTitleData = [],
    isLoading: isAccountTitleLoading,
    isSuccess: isAccountTitleSuccess,
    isError: isAccountTitleError,
    refetch: isAccountTitleRefetch,
  } = useGetAccountTitleAllApiQuery();

  const {
    data: creditData = [],
    isLoading: isCreditLoading,
    isSuccess: isCreditSuccess,
    isError: isCreditError,
    refetch: creditRefetch,
  } = useGetCreditAllQuery();

  const [
    postMinorCategory,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostMinorCategoryApiMutation();

  const [
    updateMinorCategory,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      data: updateData,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateMinorCategoryApiMutation();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
    register,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      major_category_id: null,
      minor_category_name: "",
      depreciation_credit_id: null,
      depreciation_debit_id: data?.initial_debit?.depreciation_debit || [],
      initial_credit_id: null,
      initial_debit_id: null,
    },
  });

  useEffect(() => {
    if ((isPostError || isUpdateError) && (postError?.status === 422 || updateError?.status === 422)) {
      setError("minor_category_name", {
        type: "validate",
        message: postError?.data?.errors.minor_category_name || updateError?.data?.errors.minor_category_name,
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
      setValue("id", data?.id);
      setValue("major_category_id", data?.major_category);
      setValue("minor_category_name", data?.minor_category_name);

      setValue("depreciation_credit_id", data?.depreciation_credit.length === 0 ? null : data?.depreciation_credit);
      setValue("initial_debit_id", data?.initial_debit);
      setValue("has_atoe", data?.has_atoe);
    }
  }, [data]);

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
    if (data.status) {
      updateMinorCategory(formData);
      return;
    }
    postMinorCategory(formData);
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
        {data.status ? "Edit Minor Category" : "Add Minor Category"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          autoComplete
          disabled={data.status}
          name="major_category_id"
          control={control}
          options={majorCategoryData}
          loading={isMajorCategoryLoading}
          size="small"
          getOptionLabel={(option) => option.major_category_name}
          isOptionEqualToValue={(option, value) => option.major_category_name === value?.major_category_name}
          renderInput={(params) => (
            <TextField
              color="secondary"
              {...params}
              label="Major Category"
              error={!!errors?.major_category_id?.message}
              helperText={errors?.major_category_id?.message}
            />
          )}
        />

        <CustomTextField
          autoComplete="off"
          control={control}
          name="minor_category_name"
          label="Minor Category Name"
          type="text"
          color="secondary"
          value={watch("minor_category_name") + `${watch("has_atoe") === 1 ? " (ATOE)" : ""}`}
          size="small"
          error={!!errors?.minor_category_name?.message}
          helperText={errors?.minor_category_name?.message}
          fullWidth
        />
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
          Has ATOE?
        </Typography>
        <Stack flexDirection="row" gap={2} alignItems="center" mt={-2.5}>
          <RadioGroup row name="has_atoe" defaultValue={data?.has_atoe || 0}>
            <FormControlLabel
              value={1}
              control={<Radio {...register("has_atoe")} size="small" disableRipple color="secondary" />}
              label={
                <Typography color="secondary.main" sx={{ ml: -1, fontSize: 14, fontWeight: 500 }}>
                  Yes
                </Typography>
              }
            />
            <FormControlLabel
              value={0}
              control={<Radio {...register("has_atoe")} size="small" disableRipple color="secondary" />}
              label={
                <Typography color="secondary.main" sx={{ ml: -1, fontSize: 14, fontWeight: 500 }}>
                  No
                </Typography>
              }
            />
          </RadioGroup>
        </Stack>

        {/* Depreciation Debit and Credit */}
        <Stack gap={2}>
          <Typography fontFamily="Anton" color="secondary">
            Accounting Entries
          </Typography>

          <CustomAutoComplete
            autoComplete
            name="initial_debit_id"
            control={control}
            options={accountTitleData}
            loading={isAccountTitleLoading}
            size="small"
            getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
            isOptionEqualToValue={(option, value) => option.account_title_code === value?.account_title_code}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="Initial Debit"
                error={!!errors?.initial_debit_id}
                helperText={errors?.initial_debit_id?.message}
              />
            )}
            onChange={(e, value) => {
              console.log("value", value);
              if (value) {
                setValue("depreciation_debit_id", value?.depreciation_debit);
              } else {
                setValue("depreciation_debit_id", []);
              }
              return value;
            }}
          />

          <CustomAutoComplete
            autoComplete
            name="depreciation_credit_id"
            control={control}
            options={creditData}
            loading={isCreditLoading}
            size="small"
            getOptionLabel={(option) =>
              (option.credit_code || option.account_title_code) +
              " - " +
              (option.credit_name || option.account_title_name)
            }
            isOptionEqualToValue={(option, value) => option.credit_code === value?.credit_code}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="Depreciation Credit"
                error={!!errors?.depreciation_credit_id}
                helperText={errors?.depreciation_credit_id?.message}
              />
            )}
          />

          <CustomAutoComplete
            multiple
            name="depreciation_debit_id"
            control={control}
            options={accountTitleData}
            defaultValue={data?.initial_debit?.depreciation_debit || []}
            getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
            isOptionEqualToValue={(option, value) => option.account_title_code === value?.account_title_code}
            readOnly
            freeSolo
            fullWidth
            // optional
            optionalSolid
            setHeight
            disabled={data?.initial_debit?.depreciation_debit?.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                color="secondary"
                // focused={data?.initial_debit?.depreciation_debit.length === 0 && true}
                // placeholder={data?.initial_debit?.depreciation_debit.length === 0 && "No Tagged Depreciation Debit"}
                label={"Depreciation Debit"}
              />
            )}
          />
        </Stack>

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

          <Button variant="outlined" color="secondary" size="small" onClick={handleCloseDrawer}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddMinorCategory;
