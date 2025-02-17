import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  Dialog,
  DialogActions,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { Info, Remove } from "@mui/icons-material";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { assetReleasingApi, usePutSmallToolsReleasingMutation } from "../../../Redux/Query/Request/AssetReleasing";
import { closeDialog, closeDrawer, openDialog1, openDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useGetSedarUsersApiQuery } from "../../../Redux/Query/SedarUserApi";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import CustomImgAttachment from "../../../Components/Reusable/CustomImgAttachment";
import { useRef, useState } from "react";
import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import { LoadingButton } from "@mui/lab";

const schema = yup.object().shape({
  received_by: yup.object().required().typeError("Received By is a required field"),

  receiver_img: yup.mixed().required().label("Receiver Image").typeError("Receiver Image is a required field"),
});
const AddSmallToolsReleasingInfo = ({ data, smallTools }) => {
  //   console.log(smallTools, data);

  const [viewImage, setViewImage] = useState(null);

  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState?.dialogMultiple?.dialog1);
  const drawer = useSelector((state) => state.booleanState.drawer);
  const receiverMemoRef = useRef(null);

  const {
    handleSubmit,
    control,
    watch,
    register,
    reset,
    setValue,
    setError,
    trigger,
    clearErrors,
    formState: { errors, isDirty, isValid, isValidating },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      small_tools_id: smallTools?.small_tools_id,
      received_by: null,

      // Attachments
      receiver_img: null,
    },
  });

  const {
    data: sedarData = [],
    isLoading: isSedarLoading,
    isSuccess: isSedarSuccess,
    isError: isSedarError,
    error: sedarError,
  } = useGetSedarUsersApiQuery();

  const [
    releaseItems,
    { data: postData, isSuccess: isPostSuccess, isLoading: isPostLoading, isError: isPostError, error: postError },
  ] = usePutSmallToolsReleasingMutation();

  const onSubmitHandler = async (formData) => {
    console.log(formData);
    // fileToBase64
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    // Formats
    const receiverImgBase64 = formData?.receiver_img && (await fileToBase64(formData.receiver_img));

    const newFormData = {
      ...formData,
      // small_tool_id: smallTools.small_tools_id,
      received_by: formData?.received_by?.general_info?.full_id_number_full_name?.toString(),
      // signature: signature,
      receiver_img: receiverImgBase64,
    };

    // console.log("newFormData", newFormData);

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
              {"RELEASE"}
            </Typography>{" "}
            this {"item(s)"}?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await releaseItems(newFormData).unwrap();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            // dispatch(notificationApi.util.resetApiState());
            dispatch(assetReleasingApi.util.invalidateTags(["SmallToolsReleasing"]));
            dispatch(closeConfirm());
            dispatch(closeDialog());
          } catch (err) {
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err?.data?.message,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
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

  const UpdateField = ({ value, label, watch }) => {
    const handleViewImage = () => {
      const url = URL.createObjectURL(watch);
      // console.log("Object URL created:", url);
      setViewImage(url);
      dispatch(openDrawer());
    };

    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <Tooltip title={watch && "Click to view Image"} placement="top" arrow>
          <TextField
            type="text"
            size="small"
            label={label}
            autoComplete="off"
            color="secondary"
            value={value}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img src={AttachmentActive} width="20px" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              input: { cursor: "pointer" },
              ".MuiInputBase-root": {
                borderRadius: "10px",
                // color: "#636363",
              },

              ".MuiInputLabel-root.Mui-disabled": {
                backgroundColor: "transparent",
                color: "text.main",
              },

              ".Mui-disabled": {
                backgroundColor: "background.light",
                borderRadius: "10px",
                color: "text.main",
              },
            }}
            onClick={() => (watch === null ? null : handleViewImage())}
          />
        </Tooltip>
      </Stack>
    );
  };

  const RemoveFile = ({ title, value }) => {
    return (
      <Tooltip title={`Remove ${title}`} placement="top" arrow>
        <IconButton
          onClick={() => {
            setValue(value, null);
            // ref.current.files = [];
          }}
          size="small"
          sx={{
            backgroundColor: "error.main",
            color: "white",
            ":hover": { backgroundColor: "error.main" },
            height: "25px",
            width: "25px",
          }}
        >
          <Remove />
        </IconButton>
      </Tooltip>
    );
  };

  const filterOptions = createFilterOptions({
    limit: 50,
    matchFrom: "any",
  });

  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    // width: "100%",
    pb: "10px",
  };

  const sxSubtitle = {
    fontWeight: "bold",
    color: "secondary.main",
    fontFamily: "Anton",
    fontSize: "16px",
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} gap={1} px={3} overflow="auto">
      <Typography
        className="mcontainer__title"
        color="secondary.main"
        sx={{ fontFamily: "Anton", fontSize: "1.6rem", textAlign: "center", mb: "5px" }}
      >
        Releasing of Small Tools Replacement
      </Typography>

      <Divider sx={{ mb: "20px" }} />

      <Stack gap={2} pb={3}>
        <Autocomplete
          {...register}
          readOnly
          required
          multiple
          freeSolo
          name="small_tools_id"
          options={smallTools.small_tools_id}
          value={smallTools.small_tools_id}
          size="small"
          renderInput={(params) => (
            <TextField
              label={watch("small_tools_id") !== null ? "Small Tool ID" : "No Data"}
              color="secondary"
              sx={{
                ".MuiInputBase-root ": { borderRadius: "10px" },
                pointer: "default",
              }}
              {...params}
              // label={`${name}`}
            />
          )}
        />

        <CustomAutoComplete
          autoComplete
          name="received_by"
          control={control}
          filterOptions={filterOptions}
          options={sedarData}
          loading={isSedarLoading}
          // disabled={handleSaveValidation()}
          size="small"
          getOptionLabel={(option) => option.general_info?.full_id_number_full_name}
          isOptionEqualToValue={(option, value) =>
            option.general_info?.full_id_number === value.general_info?.full_id_number
          }
          renderInput={(params) => (
            <TextField
              multiline
              color="secondary"
              {...params}
              label="Received By"
              error={!!errors?.received_by}
              helperText={errors?.received_by?.message}
            />
          )}
        />

        <Box sx={BoxStyle} pt={0.5}>
          <Typography sx={sxSubtitle}>Attachments</Typography>
          <Stack flexDirection="row" gap={1} alignItems="center">
            {watch("receiver_img") !== null ? (
              <UpdateField label={"Receiver Image"} value={watch("receiver_img")?.name} watch={watch("receiver_img")} />
            ) : (
              <CustomImgAttachment
                control={control}
                name="receiver_img"
                label="Receiver Image"
                // disabled={handleSaveValidation()}
                inputRef={receiverMemoRef}
                error={!!errors?.receiver_img?.message}
                helperText={errors?.receiver_img?.message}
              />
            )}
            {watch("receiver_img") !== null && <RemoveFile title="Receiver Image" value="receiver_img" />}
          </Stack>
        </Box>
      </Stack>

      <DialogActions>
        <LoadingButton
          variant="contained"
          color={
            // handleSaveValidation() ? "tertiary" :
            "primary"
          }
          //   loading={isPostLoading}
          size="small"
          type="submit"
          // sx={{ color: handleSaveValidation() && "white" }}
          disabled={!isValid}
        >
          {
            // handleSaveValidation() ? "Save" :
            "Release"
          }
        </LoadingButton>
        <Button variant="outlined" color="secondary" size="small" onClick={() => dispatch(closeDialog())}>
          Cancel
        </Button>
      </DialogActions>

      <Dialog open={drawer} onClose={() => dispatch(closeDrawer())}>
        <Box p={2} borderRadius="10px">
          <Typography fontFamily="Anton, Impact, Roboto" fontSize={20} color="secondary.main" px={1}>
            View Image
          </Typography>
          <Stack justifyContent="space-between" p={2} gap={2}>
            <img src={viewImage} alt="Receiver Image" />

            <Button variant="outlined" size="small" color="secondary" onClick={() => dispatch(closeDrawer())}>
              Close
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AddSmallToolsReleasingInfo;
