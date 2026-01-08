import { ChangeCircle, Info } from "@mui/icons-material";
import { Autocomplete, Box, Button, DialogActions, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { closeDialog2 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { useLazyGetMovementWarehouseApiQuery } from "../../../Redux/Query/Masterlist/Warehouse";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { notificationApi } from "../../../Redux/Query/Notification";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { usePatchChangeCareOfAssetApiMutation } from "../../../Redux/Query/Movement/Evaluation";

const schema = yup.object().shape({
  pullout_id: yup.array().required().label("Pullout ID").typeError("Pullout ID is a required field"),
  movement_warehouse_id: yup.object().required().label("One Charging").typeError("One Charging is a required field"),
  remarks: yup.string().nullable(),
});

const ChangeCareOfDialog = ({ item, reset: selectedItemReset, selectedItems }) => {
  const fixedAssets = selectedItems.map((asset) => asset?.asset.vladimir_tag_number);

  const dispatch = useDispatch();

  const [
    movementWarehouseTrigger,
    {
      data: movementWarehouseData,
      isLoading: movementWarehouseLoading,
      isFetching: movementWarehouseFetching,
      isSuccess: movementWarehouseSuccess,
      isError: movementWarehouseError,
    },
  ] = useLazyGetMovementWarehouseApiQuery({}, { refetchOnMountOrArgChange: true });

  const [patchCareOf] = usePatchChangeCareOfAssetApiMutation();

  const {
    handleSubmit,
    control,
    watch,
    register,
    reset,

    formState: { errors, isDirty, isValid, isValidating },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pullout_id: item,
      movement_warehouse_id: null,
      remarks: "",
    },
  });

  const handleCloseDialog = () => {
    dispatch(closeDialog2());
    reset();
  };

  const onSubmitHandler = (formData) => {
    const newFormData = {
      ...formData,
      movement_warehouse_id: formData.movement_warehouse_id.id,
      remarks: formData.remarks || "",
    };

    dispatch(
      openConfirm({
        icon: Info,
        iconColor: "info",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
              }}
            >
              SUBMIT
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const res = await patchCareOf(newFormData).unwrap();
            dispatch(
              openToast({
                message: res?.message || "Changed Care of Successfully",
                duration: 5000,
              })
            );

            selectedItemReset();
            handleCloseDialog();
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err?.message || "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
              console.error(err);
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
            }
          }
        },
      })
    );
  };

  return (
    <Box component={"form"} onSubmit={handleSubmit(onSubmitHandler)}>
      <Stack sx={{ margin: "15px" }}>
        <Typography
          color="secondary.main"
          sx={{ fontFamily: "Anton", fontSize: "25px", borderBottom: "2px solid #344955" }}
        >
          <ChangeCircle color="primary" fontSize="medium" /> Change Care of
        </Typography>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Autocomplete
            {...register}
            readOnly
            // required
            multiple
            name="fixed_asset_tag_number"
            value={fixedAssets || []}
            options={fixedAssets || []}
            size="small"
            renderInput={(params) => (
              <TextField
                label={fixedAssets.length > 2 ? "Selected Fixed Assets" : "Selected Fixed Asset"}
                color="secondary"
                sx={{
                  ".MuiInputBase-root ": { borderRadius: "10px" },
                  pointer: "default",
                }}
                {...params}
              />
            )}
          />

          <CustomAutoComplete
            autoComplete
            name="movement_warehouse_id"
            control={control}
            options={movementWarehouseData || []}
            onOpen={() => (movementWarehouseSuccess ? null : movementWarehouseTrigger({ pagination: "none" }))}
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                color="secondary"
                label="Care of"
                error={!!errors?.movement_warehouse_id}
                helperText={errors?.movement_warehouse_id?.message}
              />
            )}
          />

          <CustomTextField
            control={control}
            name="remarks"
            label="Remarks (Optional)"
            type="text"
            error={!!errors?.remarks}
            helperText={errors?.remarks?.message}
            fullWidth
            multiline
            minRows={4}
            maxRows={6}
            optional
          />
        </Box>

        <DialogActions>
          <Button variant="outlined" color="secondary" size="small" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" size="small" type="submit" disabled={!isValid}>
            Submit
          </Button>
        </DialogActions>
      </Stack>
    </Box>
  );
};

export default ChangeCareOfDialog;
