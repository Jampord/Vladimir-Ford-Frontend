import { Autocomplete, Box, Button, createFilterOptions, Divider, Stack, TextField, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePatchTransferPulloutReleasingApiMutation } from "../../../Redux/Query/Movement/Pullout";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { useGetSedarUsersApiQuery } from "../../../Redux/Query/SedarUserApi";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";
import { closeDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import { LoadingButton } from "@mui/lab";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { Info } from "@mui/icons-material";
import { notificationApi } from "../../../Redux/Query/Notification";

const schema = yup.object().shape({
  transfer_ids: yup.array().required().typeError("Transaction Number is a required field"),
  received_by: yup.object().required().typeError("Received By is a required field"),
});
const ReleasingModal = ({ selectedItems }) => {
  const dispatch = useDispatch();

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
      transfer_ids: selectedItems.map((item) => item?.id) || null,
      received_by: null,
      one_charging_id: selectedItems[0]?.to_one_charging || null,
      department_id: selectedItems[0]?.to_one_charging || null,
      company_id: selectedItems[0]?.to_one_charging || null,
      business_unit_id: selectedItems[0]?.to_one_charging || null,
      unit_id: selectedItems[0]?.to_one_charging || null,
      subunit_id: selectedItems[0]?.to_one_charging || null,
      location_id: selectedItems[0]?.to_one_charging || null,
    },
  });

  console.log("errors", errors);

  const {
    data: sedarData = [],
    isLoading: isSedarLoading,
    isSuccess: isSedarSuccess,
    isError: isSedarError,
    error: sedarError,
  } = useGetSedarUsersApiQuery();

  const [
    oneChargingTrigger,
    {
      data: oneChargingData = [],
      isLoading: isOneChargingLoading,
      isSuccess: isOneChargingSuccess,
      isError: isOneChargingError,
      refetch: isOneChargingRefetch,
    },
  ] = useLazyGetOneRDFChargingAllApiQuery();

  const [releasingTransferPulloutApi, { isLoading: isPatchLoading }] = usePatchTransferPulloutReleasingApiMutation();

  const onSubmitHandler = async (formData) => {
    console.log("formData", formData);

    const newFormData = {
      transfer_ids: formData?.transfer_ids,
      received_by: formData?.received_by?.general_info?.full_id_number_full_name?.toString(),
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
              RELEASE
            </Typography>{" "}
            this item?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await releasingTransferPulloutApi(newFormData).unwrap();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            dispatch(closeConfirm());
            dispatch(closeDialog());
          } catch (err) {
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data.message,
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

  const filterOptions = createFilterOptions({
    limit: 50,
    matchFrom: "any",
  });

  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const sxSubtitle = {
    fontWeight: "bold",
    color: "secondary.main",
    fontFamily: "Anton",
    fontSize: "16px",
  };

  console.log("watch 1", watch("transfer_ids"));
  console.log("watch 2", watch("received_by"));
  //   console.log("watch 3" , watch("received_by"));

  return (
    <Box onSubmit={handleSubmit(onSubmitHandler)} component="form" gap={1} px={3} padding={3} overflow="auto">
      <Typography
        className="mcontainer__title"
        color="secondary.main"
        sx={{ fontFamily: "Anton", fontSize: "1.6rem", textAlign: "center", mb: "5px" }}
      >
        Releasing
      </Typography>

      <Divider sx={{ mb: "20px" }} />

      <Stack gap={2} pb={3}>
        <Autocomplete
          {...register}
          readOnly
          required
          multiple
          freeSolo
          name="transfer_ids"
          options={[]}
          value={selectedItems.map((item) => item?.id)}
          size="small"
          renderInput={(params) => (
            <TextField
              label={"Selected Transaction Number"}
              color="secondary"
              sx={{
                ".MuiInputBase-root ": { borderRadius: "10px" },
                pointer: "default",
              }}
              {...params}
            />
          )}
        />
      </Stack>

      <Stack flexDirection="row" justifyContent="center" gap={4} overflow="auto">
        <Stack gap={2} width="220px">
          <Box sx={BoxStyle}>
            <Typography sx={sxSubtitle}>Receiver</Typography>

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
          </Box>
        </Stack>
        <Stack sx={BoxStyle} width="250px">
          <Typography sx={sxSubtitle}>Charging Information</Typography>

          <CustomAutoComplete
            autoComplete
            control={control}
            name="one_charging_id"
            options={oneChargingData || []}
            onOpen={() => (isOneChargingSuccess ? null : oneChargingTrigger({ pagination: "none" }))}
            loading={isOneChargingLoading}
            size="small"
            getOptionLabel={(option) => option.code + " - " + option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                label="One RDF Charging"
                error={!!errors?.one_charging_id}
                helperText={errors?.one_charging_id?.message}
                multiline
                fullWidth
              />
            )}
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            control={control}
            name="department_id"
            options={[]}
            disabled
            disableClearable
            size="small"
            getOptionLabel={(option) => option.department_code + " - " + option.department_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Department" multiline />}
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            name="company_id"
            control={control}
            options={[]}
            size="small"
            getOptionLabel={(option) => option.company_code + " - " + option.company_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Company" multiline />}
            disabled
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            name="business_unit_id"
            control={control}
            options={[]}
            size="small"
            getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Business Unit" multiline />}
            disabled
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            name="unit_id"
            control={control}
            options={[]}
            disabled
            disableClearable
            size="small"
            getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Unit" multiline />}
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            name="subunit_id"
            control={control}
            options={[]}
            disabled
            disableClearable
            size="small"
            getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Sub Unit" multiline />}
            freeSolo
          />

          <CustomAutoComplete
            autoComplete
            name="location_id"
            control={control}
            options={[]}
            disabled
            disableClearable
            size="small"
            getOptionLabel={(option) => option.location_code + " - " + option.location_name}
            renderInput={(params) => <TextField color="secondary" {...params} label="Location" multiline />}
            freeSolo
          />
        </Stack>
      </Stack>

      <Divider flexItem sx={{ my: "10px" }} />

      <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
        <LoadingButton
          variant="contained"
          color={"primary"}
          loading={isPatchLoading}
          size="small"
          disabled={!watch("received_by")}
          type="submit"
        >
          Release
        </LoadingButton>

        <Button variant="outlined" color="secondary" size="small" onClick={() => dispatch(closeDialog())}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

export default ReleasingModal;
