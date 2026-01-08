import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { usePostPulloutConfirmationApiMutation } from "../../../../Redux/Query/Movement/Pullout";
import { closeDialog } from "../../../../Redux/StateManagement/booleanStateSlice";
import { closeConfirm } from "../../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../../Redux/StateManagement/toastSlice";
import { Box, Button, DialogActions, Stack, Typography } from "@mui/material";
import CustomTextField from "../../../../Components/Reusable/CustomTextField";
import { LoadingButton } from "@mui/lab";

const schema = yup.object().shape({
  remarks: yup.string().required().label("Remarks"),
});

const RejectRepaired = ({ data }) => {
  const dispatch = useDispatch();

  const [postConfirm, { isLoading, data: patchData }] = usePostPulloutConfirmationApiMutation();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remarks: "",
    },
  });

  const onSubmitHandler = async (formData) => {
    console.log("formData: ", formData);
    const newFormData = {
      ...formData,
      item_id: data,
      type_of_evaluation: "repaired",
      is_received: 0,
    };
    console.log("newFormData: ", newFormData);

    try {
      await postConfirm(newFormData).unwrap();
      reset();
      dispatch(
        openToast({
          message: patchData?.message || "Repair successfully rejected!",
          duration: 5000,
        })
      );
      dispatch(closeDialog());
      dispatch(closeConfirm());
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
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <Stack gap={1.5} pt={1} margin={3}>
        <Typography fontFamily="Anton" fontWeight="bold" fontSize={18} color="secondary" align="left">
          Repair Reject Remarks
        </Typography>
        <Typography fontSize={13} color="secondary" align="left">
          Please write a reason for rejecting repair.
        </Typography>

        <CustomTextField
          control={control}
          required
          name="remarks"
          label="Reason"
          type="text"
          color="secondary"
          size="small"
          fullWidth
          minRows={4}
          maxRows={6}
          multiline
          sx={{ minHeight: "200px" }}
          error={!!errors?.remarks}
          helperText={errors?.remarks?.message}
        />
      </Stack>

      <DialogActions sx={{ padding: 2 }}>
        <LoadingButton
          color="warning"
          loading={isLoading}
          type="submit"
          variant="contained"
          size="small"
          disabled={!isValid}
        >
          Reject
        </LoadingButton>

        <Button
          autoFocus
          variant="outlined"
          color="secondary"
          onClick={() => dispatch(closeDialog())}
          //   disabled={loading === true}
          size="small"
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default RejectRepaired;
