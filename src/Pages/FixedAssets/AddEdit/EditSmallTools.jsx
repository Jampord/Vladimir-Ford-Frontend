import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { closeDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useEffect } from "react";
import { assetReleasingApi, usePutSmallToolsStatusMutation } from "../../../Redux/Query/Request/AssetReleasing";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { fixedAssetApi } from "../../../Redux/Query/FixedAsset/FixedAssets";
import CustomNumberField from "../../../Components/Reusable/CustomNumberField";

const schema = yup.object().shape({
  id: yup.string(),
  status_description: yup.string().required().label("Status Description").typeError("Status Description is required"),
  quantity: yup.number().required().label("Quantity"),
});
const EditSmallTools = ({ data }) => {
  // console.log("data", data);
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
      id: "",
      small_tool: data?.item_name || null,
      status_description: data?.status_description || null,
      quantity: data?.quantity || null,
    },
  });

  const [
    putSmallTools,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePutSmallToolsStatusMutation();

  //   console.log("ispostsuccess", isPostSuccess);
  console.log("isposterror", postError);

  const onSubmitHandler = (formData) => {
    // console.log("formData", formData);
    const newFormData = {
      id: data?.id,
      status_description: formData.status_description,
      quantity: formData.quantity,
      curr_status: data?.status_description,
      fixed_asset_id: data?.fixed_asset_id,
    };
    // console.log("newFormData", newFormData);

    putSmallTools(newFormData);
  };

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      dispatch(closeDialog1());
      dispatch(
        openToast({
          message: "Small Tools updated successfully",
          duration: 5000,
        })
      );

      dispatch(assetReleasingApi.util.invalidateTags(["SmallToolsReleasing", "FixedAsset"]));
      dispatch(fixedAssetApi.util.invalidateTags(["FixedAsset"]));

      // setTimeout(() => {
      //   onUpdateResetHandler();
      // }, 500);
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (isPostError) {
      //   reset();
      //   dispatch(closeDialog1());
      dispatch(
        openToast({
          message: postError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
      // setTimeout(() => {
      //   onUpdateResetHandler();
      // }, 500);
    }
  }, [isPostError]);

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        Edit Small Tool Status
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          name="status_description"
          control={control}
          options={["Good", "For Replacement", "Replaced"]}
          size="small"
          renderInput={(params) => (
            <TextField
              color={"secondary"}
              {...params}
              label="Status Description"
              error={!!errors?.status_description}
              helperText={errors?.status_description?.message}
            />
          )}
        />

        <CustomNumberField
          control={control}
          name="quantity"
          label="Quantity"
          type="number"
          error={!!errors?.quantity}
          helperText={errors?.quantity?.message}
          fullWidth
          isAllowed={(values) => {
            const { floatValue } = values;
            return floatValue >= 1;
          }}
        />

        <CustomTextField
          control={control}
          disabled
          name="small_tool"
          label="Small Tool"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.small_tool}
          helperText={errors?.small_tool?.message}
          fullWidth
        />

        <Box className="add-masterlist__buttons">
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            // loading={isPostLoading}
            disabled={!isValid}
            // sx={data.action === "view" ? { display: "none" } : null}
          >
            Update
          </LoadingButton>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => dispatch(closeDialog1())}
            // disabled={isPostLoading }
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditSmallTools;
