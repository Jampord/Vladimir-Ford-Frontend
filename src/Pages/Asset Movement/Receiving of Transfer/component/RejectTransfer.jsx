import { Box, Button, DialogActions, Stack, Typography } from "@mui/material";
import CustomTextField from "../../../../Components/Reusable/CustomTextField";
import { LoadingButton } from "@mui/lab";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { closeDialog } from "../../../../Redux/StateManagement/booleanStateSlice";
import { usePatchRejectReceivingTransferApiMutation } from "../../../../Redux/Query/Movement/Transfer";
import { openToast } from "../../../../Redux/StateManagement/toastSlice";
import { closeConfirm } from "../../../../Redux/StateManagement/confirmSlice";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  remarks: yup.string().required().label("Remarks"),
});

const RejectTransfer = ({ data, singleReceiving }) => {
  console.log("data: ", data);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rejectTransferApi, { isLoading, data: patchData }] = usePatchRejectReceivingTransferApiMutation();

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
      transfer_id: data,
      reason: formData.remarks,
    };
    console.log("newFormData: ", newFormData);

    try {
      await rejectTransferApi(newFormData).unwrap();
      reset();
      dispatch(
        openToast({
          message: patchData?.message || "Asset Transfer rejected!",
          duration: 5000,
        })
      );
      dispatch(closeDialog());
      dispatch(closeConfirm());
      singleReceiving && navigate("/asset-movement/transfer-receiving");
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
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)}>
        <Stack gap={1.5} pt={1} margin={3}>
          <Typography fontFamily="Anton" fontWeight="bold" fontSize={18} color="secondary" align="left">
            Asset Transfer Reject Remarks
          </Typography>
          <Typography fontSize={13} color="secondary" align="left">
            Please write a reason for rejecting the transfer.
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
    </>
  );
};

export default RejectTransfer;
