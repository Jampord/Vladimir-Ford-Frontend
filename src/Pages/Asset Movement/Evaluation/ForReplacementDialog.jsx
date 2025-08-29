import { Autocomplete, Box, Button, DialogActions, Stack, TextField, Typography } from "@mui/material";
import { closeDialog, closeDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { Delete, Handyman, Info } from "@mui/icons-material";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { usePostEvaluateForReplacementAssetApiMutation } from "../../../Redux/Query/Movement/Evaluation";
import CustomTextField from "../../../Components/Reusable/CustomTextField";

const schema = yup.object().shape({
  remarks: yup.string().nullable().label("Remarks"),
});

const ForReplacementDialog = ({ item, action, setAction, reset: item_id_reset, selectedItems }) => {
  const dispatch = useDispatch();

  const [postEvaluateForReplacement] = usePostEvaluateForReplacementAssetApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remarks: null,
    },
  });

  const handleCloseDialog = () => {
    dispatch(closeDialog1());
    setAction("");
  };

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);

    const newFormData = {
      ...formData,
      action: action,
      item_id: item,
    };

    console.log("newFormData", newFormData);

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
            const test = await postEvaluateForReplacement(newFormData).unwrap();
            console.log("test", test);
            dispatch(
              openToast({
                message: "Evaluated Successfully",
                duration: 5000,
              })
            );
            reset();
            item_id_reset();
            handleCloseDialog();
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.response?.data?.errors?.detail || err?.message,
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
    <>
      <Box component={"form"} onSubmit={handleSubmit(onSubmitHandler)}>
        <Stack sx={{ margin: "15px" }}>
          <Typography
            color="secondary.main"
            sx={{ fontFamily: "Anton", fontSize: "25px", borderBottom: "2px solid #344955" }}
          >
            {/* <ScreenSearchDesktop color="primary" fontSize="medium" /> To Evaluate */}
            {action === "spare" && <Handyman color="info" fontSize="medium" />}
            {action === "disposal" && <Delete color="warning" fontSize="medium" />}
            {action === "spare" && "Spare Asset Evaluation"}
            {action === "disposal" && "For Disposal Asset Evaluation"}
          </Typography>

          <Box sx={{ marginTop: 2, gap: 2 }}>
            <CustomTextField
              control={control}
              name="remarks"
              label={(action === "spare" && "Remarks (Optional)") || (action === "disposal" && "Remarks (Required)")}
              type="text"
              helperText={action === "disposal" && "Please provide your remarks for this evaluation."}
              optional={action === "spare"}
              error={!!errors.remarks}
              fullWidth
              sx={{ overscrollBehavior: "contained" }}
              multiline
              minRows={3}
              maxRows={5}
              allowSpecialCharacters
            />
          </Box>
          {/* <Stack flexDirection="row" justifyContent="flex-end" marginTop={3} gap={2} margin="15px"> */}
          <DialogActions>
            <Button variant="outlined" color="secondary" size="small" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              type="submit"
              disabled={action === "disposal" && !watch("remarks")}
            >
              Submit
            </Button>
          </DialogActions>
          {/* </Stack> */}
        </Stack>
      </Box>
    </>
  );
};

export default ForReplacementDialog;
