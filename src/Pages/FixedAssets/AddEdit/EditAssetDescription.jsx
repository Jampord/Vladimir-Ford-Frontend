import { Done, Edit, Help } from "@mui/icons-material";
import { Box, Button, DialogActions, Divider, Stack, Typography } from "@mui/material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { closeDialog2 } from "../../../Redux/StateManagement/booleanStateSlice";
import { usePatchFixedAssetDescriptionApiMutation } from "../../../Redux/Query/FixedAsset/FixedAssets";

const schema = yup.object().shape({
  description: yup.string().required().label("Asset Description"),
});
const EditAssetDescription = ({ data }) => {
  console.log("data: ", data);

  const dispatch = useDispatch();

  const [patchDescription, { isLoading, data: patchData }] = usePatchFixedAssetDescriptionApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: data?.asset_description || "",
    },
  });

  const onSubmitHandler = async (formData) => {
    console.log("formData: ", formData);
    const newFormData = {
      description: formData.description,
      is_ad_cost: data?.is_additional_cost,
      id: data?.id,
    };
    console.log("newFormData: ", newFormData);

    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              UPDATE
            </Typography>{" "}
            this data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            await patchDescription(newFormData).unwrap();
            reset();
            dispatch(
              openToast({
                message: patchData?.message || "Asset description updated successfully!",
                duration: 5000,
              })
            );
            dispatch(closeDialog2());
          } catch (error) {
            console.log(error);
            dispatch(
              openToast({
                message: error?.data?.message,
                duration: 5000,
                variant: "error",
              })
            );
          }
        },
      })
    );
  };

  const onCloseHandler = () => {
    dispatch(closeDialog2());
  };

  return (
    <Stack flexDirection="Column" gap="10px" padding="20px " component="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <Stack flexDirection="row" alignItems="center">
        <Edit color="secondary" sx={{ fontSize: "25px" }} />
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          Edit Asset Description
        </Typography>
      </Stack>

      <Divider />

      <CustomTextField
        control={control}
        name="description"
        label="Asset Description"
        type="text"
        allowSpecialCharacters
        error={!!errors?.description}
        helperText={errors?.description?.message}
        fullWidth
        multiline
        maxRows={5}
      />

      <DialogActions>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          startIcon={<Done color={!isDirty || !isValid ? "gray" : "primary"} />}
          type="submit"
          disabled={!isDirty || !isValid}
        >
          Update
        </Button>
        <Button variant="outlined" onClick={onCloseHandler} size="small" color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Stack>
  );
};

export default EditAssetDescription;
