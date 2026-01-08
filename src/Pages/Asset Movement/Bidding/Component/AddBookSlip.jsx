import React from "react";
import { useDispatch } from "react-redux";
import { usePostAddBookSlipApiMutation } from "../../../../Redux/Query/Movement/Bidding";
import { onLoading, openConfirm } from "../../../../Redux/StateManagement/confirmSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Info, MenuBook } from "@mui/icons-material";
import { Box, Button, DialogActions, Stack, Typography } from "@mui/material";
import { openToast } from "../../../../Redux/StateManagement/toastSlice";
import { closeDialog1 } from "../../../../Redux/StateManagement/booleanStateSlice";
import { notificationApi } from "../../../../Redux/Query/Notification";
import CustomNumberField from "../../../../Components/Reusable/CustomNumberField";

const schema = yup.object().shape({
  book_slip_number: yup.number().required().label("Bookslip Number").typeError("Bookslip Number is a required field"),
});

const AddBookSlip = ({ item, reset: selectedItemReset, selectedItems, tab }) => {
  console.log("tab", tab);
  const dispatch = useDispatch();

  const [postAddBookSlip] = usePostAddBookSlipApiMutation();

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
      book_slip_number: null,
    },
  });

  const handleCloseDialog = () => {
    dispatch(closeDialog1());
    reset();
  };

  const onSubmitHandler = (formData) => {
    const newFormData = {
      ...formData,
      status: tab === "For Disposal" ? "disposed" : "bidding",
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
            const res = await postAddBookSlip(newFormData).unwrap();
            dispatch(
              openToast({
                message: res?.message || "Bookslip added successfully!",
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
          <MenuBook color="primary" fontSize="medium" /> Add Bookslip {tab === "For Disposal" && " (For Disposal)"}
          {tab === "For Bid" && " (For Bidding)"}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <CustomNumberField
            control={control}
            name="book_slip_number"
            label="Bookslip Number"
            type="number"
            error={!!errors?.book_slip_number}
            helperText={errors?.book_slip_number?.message}
            fullWidth
            isAllowed={(values) => {
              const { floatValue } = values;
              return floatValue >= 1;
            }}
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

export default AddBookSlip;
