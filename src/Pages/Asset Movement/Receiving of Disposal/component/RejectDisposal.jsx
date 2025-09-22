import { useDispatch } from "react-redux";
import { usePatchDisposalReceivingApiMutation } from "../../../../Redux/Query/Movement/Disposal";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { Box, Button, DialogActions, Stack, Typography } from "@mui/material";
import CustomTextField from "../../../../Components/Reusable/CustomTextField";
import { LoadingButton } from "@mui/lab";
import { closeDialog } from "../../../../Redux/StateManagement/booleanStateSlice";
import { closeConfirm } from "../../../../Redux/StateManagement/confirmSlice";

const schema = yup.object().shape({
  remarks: yup.string().required().label("Remarks"),
});

const RejectDisposal = ({ data }) => {
  console.log("data: ", data);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [receiveDisposalApi, { isLoading, data: patchData }] = usePatchDisposalReceivingApiMutation();

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
      remarks: "",
    },
  });

  const onSubmitHandler = async (formData) => {
    console.log("formData: ", formData);
    const newFormData = {
      disposal_id: data,
      status: "reject",
      reason: formData.remarks,
    };
    console.log("newFormData: ", newFormData);

    try {
      await receiveDisposalApi(newFormData).unwrap();
      reset();
      dispatch(
        openToast({
          message: patchData?.message || "Asset Disposal rejected!",
          duration: 5000,
        })
      );
      dispatch(closeDialog());
      dispatch(closeConfirm());
    } catch (error) {
      console.log({ error });
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
    <Box
      component="form"
      //   onSubmit={handleSubmit(onSubmitHandler)}
    >
      <Stack gap={1.5} pt={1} margin={3}>
        <Typography fontFamily="Anton" fontWeight="bold" fontSize={18} color="secondary" align="left">
          Asset Disposal Reject Remarks
        </Typography>

        <Typography fontSize={13} color="secondary" align="left">
          Please write a reason for rejecting the request.
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

export default RejectDisposal;
