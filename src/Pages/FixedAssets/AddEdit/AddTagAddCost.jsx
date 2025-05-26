import { Help, PriceChange } from "@mui/icons-material";
import { Box, Button, DialogActions, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { closeDialog3 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import {
  fixedAssetApi,
  useLazyGetFixedAssetSmallToolsAllApiQuery,
  useLazyGetFixedAssetSubunitAllApiQuery,
  usePostTagFixedAssetAddCostApiMutation,
} from "../../../Redux/Query/FixedAsset/FixedAssets";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import CustomNumberField from "../../../Components/Reusable/CustomNumberField";

const schema = yup.object().shape({
  //   selected_fixed_asset_id: yup.string().nullable(),
  fixed_asset_id: yup.object().required().typeError("Fixed Asset is a required field"),
  usefulLife: yup.number().required().typeError("Useful Life is a required field"),
});

const AddTagAddCost = ({ data, resetHandler, tabValue }) => {
  console.log("data: ", data);
  console.log("tabValue: ", tabValue);
  const selectedFixedAsset = data.map((item) => item?.vladimir_tag_number);
  //   console.log("selectedFixedAsset: ", selectedFixedAsset);
  const selectedFixedAssetId = data.map((item) => item?.id);
  //   console.log("selectedFixedAssetId: ", selectedFixedAssetId);

  const dispatch = useDispatch();

  const [
    fixedAssetSubunitTrigger,
    {
      data: fixedAssetSubunitApiData = [],
      isLoading: fixedAssetSubunitApiLoading,
      isSuccess: fixedAssetSubunitApiSuccess,
      isFetching: fixedAssetSubunitApiFetching,
      isError: fixedAssetSubunitApiError,
      error: fixedAssetSubunitErrorData,
      refetch: fixedAssetSubunitApiRefetch,
    },
  ] = useLazyGetFixedAssetSubunitAllApiQuery();

  const [
    fixedAssetSmallToolsTrigger,
    {
      data: fixedAssetSmallToolsApiData = [],
      isLoading: fixedAssetSmallToolsApiLoading,
      isSuccess: fixedAssetSmallToolsApiSuccess,
      isFetching: fixedAssetSmallToolsApiFetching,
      isError: fixedAssetSmallToolsApiError,
      error: fixedAssetSmallToolsErrorData,
      refetch: fixedAssetSmallToolsApiRefetch,
    },
  ] = useLazyGetFixedAssetSmallToolsAllApiQuery();

  const [
    postTagFixedAsset,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostTagFixedAssetAddCostApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    // mode: "onSubmit",
    defaultValues: { selected_fixed_asset_id: selectedFixedAsset, fixed_asset_id: null, usefulLife: 1 },
  });

  useEffect(() => {
    if (isPostSuccess) {
      // reset();
      dispatch(closeDialog3());
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
          message: postError?.data?.message || "Something went wrong",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  const onSubmitHandler = (formData) => {
    console.log("formdata", formData);
    const newFormData = {
      vTagNumber: formData?.fixed_asset_id?.vladimir_tag_number,
      addCost: selectedFixedAssetId,
      usefulLife: formData?.usefulLife,
    };
    console.log("submit", newFormData);

    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to set</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              SELECTED
            </Typography>{" "}
            items as Additional Cost?
            {/* <Typography color="error" fontSize={"14px"}>
                This action is irreversible.
              </Typography> */}
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            await postTagFixedAsset(newFormData).unwrap();
            dispatch(closeConfirm());
            dispatch(fixedAssetApi.util.invalidateTags(["FixedAsset"]));
            reset();
            resetHandler();
          } catch (err) {
            console.log(err);
            // if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
            //   // reset();
            // } else if (err?.status !== 422) {
            //   // reset();
            // }
          }
        },
      })
    );
  };

  const onSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    event.stopPropagation(); // Prevent event bubbling to parent forms
    handleSubmit(onSubmitHandler)(event); // Call react-hook-form's handleSubmit
  };

  return (
    <Box className="add-masterlist" width="550px">
      <Box component="form" onSubmit={onSubmit} className="add-masterlist__content" gap={1}>
        <Typography
          color="secondary.main"
          sx={{
            fontFamily: "Anton",
            fontSize: "1.5rem",
            alignSelf: "center",
          }}
          mb={1}
        >
          Tag as Additional Cost
        </Typography>

        <CustomAutoComplete
          name="selected_fixed_asset_id"
          control={control}
          options={[]}
          size="small"
          multiple
          readOnly
          freeSolo
          //   getOptionLabel={(option) => `${option?.vladimir_tag_number} - ${option?.asset_description}`}
          //   isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              color="secondary"
              {...params}
              label="Selected Fixed Asset (Vladimir Tag Number)"
              //   error={!!errors?.selected_fixed_asset_id}
              //   helperText={errors?.selected_fixed_asset_id?.message}
            />
          )}
        />

        <Box display="flex" gap={1} flexDirection="row" justifyContent="flex-end">
          <CustomAutoComplete
            name="fixed_asset_id"
            control={control}
            options={tabValue === "2" ? fixedAssetSmallToolsApiData : fixedAssetSubunitApiData}
            onOpen={() =>
              // fixedAssetSmallToolsApiSuccess
              //   ? null
              //   :
              tabValue === "2"
                ? fixedAssetSmallToolsTrigger({ sub_unit_id: data[0]?.subunit?.id })
                : fixedAssetSubunitTrigger({ sub_unit_id: data[0]?.subunit?.id })
            }
            loading={tabValue === "2" ? fixedAssetSmallToolsApiLoading : fixedAssetSubunitApiLoading}
            size="small"
            getOptionLabel={(option) => `${option?.vladimir_tag_number} - ${option?.asset_description}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="Fixed Asset"
                error={!!errors?.fixed_asset_id}
                helperText={errors?.fixed_asset_id?.message}
              />
            )}
            fullWidth
          />

          <CustomNumberField
            control={control}
            color="secondary"
            name="usefulLife"
            label="Useful Life (Months)"
            type="number"
            size="small"
            error={!!errors?.usefulLife}
            helperText={errors?.usefulLife?.message}
            isAllowed={(values) => {
              const { floatValue } = values;
              return floatValue >= 1;
            }}
          />
        </Box>

        <DialogActions>
          <LoadingButton
            variant="contained"
            color="secondary"
            type="submit"
            onClick={(event) => event.stopPropagation()}
            disabled={!isValid}
            loading={isPostLoading}
            size="small"
            startIcon={<PriceChange color={isValid ? "primary" : "gray"} />}
          >
            Add
          </LoadingButton>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              dispatch(closeDialog3());
            }}
            size="small"
          >
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Box>
  );
};

export default AddTagAddCost;
