import React, { useEffect, useState } from "react";
import "../../../Style/Masterlist/addMasterlist.scss";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { ReactSortable } from "react-sortablejs";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  createFilterOptions,
  IconButton,
  Avatar,
  Autocomplete,
  Tooltip,
  Zoom,
  Slide,
  useMediaQuery,
} from "@mui/material";

import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";
import { useGetApproverSettingsAllApiQuery } from "../../../Redux/Query/Settings/ApproverSettings";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { LoadingButton } from "@mui/lab";
import { Add, Close, DragIndicator } from "@mui/icons-material";
import {
  useArrangeAssetTransferApiMutation,
  usePostAssetTransferApiMutation,
} from "../../../Redux/Query/Settings/AssetTransfer";
import { useGetSubUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import { useGetUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Unit";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";

const schema = yup.object().shape({
  id: yup.string(),

  one_charging_id: yup.object().required().typeError("One RDF Charging is required").label("One RDF Charging"),
  unit_id: yup.object().required().typeError("Unit is required").label("Unit"),
  subunit_id: yup.object().required().typeError("Sub Unit is required").label("Sub Unit"),

  approver_id: yup.array().required().label("Approver"),
});

const AddAssetTransfer = (props) => {
  const { data, onUpdateResetHandler } = props;
  const [selectedApprovers, setSelectedApprovers] = useState(null);
  const [checked, setChecked] = useState(true);
  const isSmallScreen = useMediaQuery("(max-width:1200px)");

  const dispatch = useDispatch();

  const [
    postAssetTransfer,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostAssetTransferApiMutation();

  const [
    updateApproverSettings,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useArrangeAssetTransferApiMutation();

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

  // const {
  //   data: userAccount = [],
  //   isLoading: isUserAccountLoading,
  //   isSuccess: isUserAccountSuccess,
  //   isError: isUserAccountError,
  // } = useGetUserAccountAllApiQuery();

  const {
    data: unitData = [],
    isLoading: isUnitLoading,
    isSuccess: isUnitSuccess,
    isError: isUnitError,
    refetch: isUnitRefetch,
  } = useGetUnitAllApiQuery();

  const {
    data: subUnitData = [],
    isLoading: isSubUnitLoading,
    isSuccess: isSubUnitSuccess,
    isError: isSubUnitError,
  } = useGetSubUnitAllApiQuery();

  const {
    data: approverData = [],
    isLoading: isApproverLoading,
    isSuccess: isApproverSuccess,
    isError: isApproverError,
  } = useGetApproverSettingsAllApiQuery();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      one_charging_id: null,
      department_id: null,
      company_id: null,
      business_unit_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      approver_id: [],
    },
  });

  useEffect(() => {
    const errorData = isPostError || isUpdateError;

    const showToast = () => {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    };

    errorData && showToast();
  }, [isPostError, isUpdateError]);

  useEffect(() => {
    if (isPostSuccess || isUpdateSuccess) {
      reset();
      handleCloseDrawer();
      dispatch(
        openToast({
          message: postData?.message || updateData?.message,
          duration: 5000,
        })
      );

      setTimeout(() => {
        onUpdateResetHandler();
      }, 500);
    }
  }, [isPostSuccess, isUpdateSuccess]);

  useEffect(() => {
    console.log("data", data);
    if (data.status) {
      setValue("one_charging_id", data?.one_charging);
      setValue("department_id", data?.one_charging);
      setValue("company_id", data?.one_charging);
      setValue("business_unit_id", data?.one_charging);
      setValue("unit_id", data?.one_charging);
      setValue("subunit_id", data?.one_charging);
      setValue("location_id", data?.one_charging);
      setValue(
        "approver_id",
        data.approvers?.map((item) => {
          return {
            id: item.approver_id,
            approver: {
              id: item.approver_id,
              employee_id: item.employee_id,
              firstname: item.first_name,
              lastname: item.last_name,
            },
          };
        })
      );
    }
  }, [data]);

  const addApproverHandler = () => {
    setValue("approver_id", [...watch("approver_id"), selectedApprovers]);
    setSelectedApprovers(null);
  };

  const deleteApproverHandler = (id) => {
    const filteredApprovers = watch("approver_id").filter((item) => item?.id !== id);
    setValue("approver_id", filteredApprovers);
  };

  const setListApprovers = (list) => {
    setValue("approver_id", list);
  };

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
    const newFormData = {
      one_charging_id: formData.one_charging_id?.id,
      unit_id: formData.one_charging_id?.unit_id,
      subunit_id: formData.one_charging_id?.subunit_id,
      approver_id: formData.approver_id?.map((item) => item?.id),
    };
    console.log("newFormData", newFormData);
    if (data.status) {
      updateApproverSettings(newFormData);
      return;
    }

    postAssetTransfer(newFormData);
  };

  const handleCloseDrawer = () => {
    setTimeout(() => {
      onUpdateResetHandler();
    }, 500);

    dispatch(closeDrawer());
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  return (
    <Box className="add-masterlist" width="100%" overflow="auto">
      <Typography
        color="secondary.main"
        sx={{
          fontFamily: "Anton",
          fontSize: "1.5rem",
          alignSelf: "center",
        }}
      >
        {data.action === "view" ? "View Approvers" : data.action === "update" ? "Update Approvers" : "Assign Approvers"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content" gap={1.5}>
        <Divider />

        <Stack flexDirection={isSmallScreen ? "column" : "row"} gap={2} width="100%">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
              width: isSmallScreen ? "100%" : "70%",
            }}
          >
            <CustomAutoComplete
              autoComplete
              control={control}
              name="one_charging_id"
              options={oneChargingData || []}
              disabled={data.action === "view" || data.action === "update"}
              onOpen={() => (isOneChargingSuccess ? null : oneChargingTrigger({ pagination: "none" }))}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.code + " - " + option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="One RDF Charging"
                  error={!!errors?.one_charging_id}
                  helperText={errors?.one_charging_id?.message}
                />
              )}
              onChange={(_, value) => {
                console.log("value", value);

                if (value) {
                  setValue("department_id", value);
                  setValue("company_id", value);
                  setValue("business_unit_id", value);
                  setValue("unit_id", value);
                  setValue("subunit_id", value);
                  setValue("location_id", value);
                } else {
                  setValue("department_id", null);
                  setValue("company_id", null);
                  setValue("business_unit_id", null);
                  setValue("unit_id", null);
                  setValue("subunit_id", null);
                  setValue("location_id", null);
                }
                return value;
              }}
            />

            {/* OLD Departments */}
            <CustomAutoComplete
              autoComplete
              name="department_id"
              control={control}
              disabled
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.department_code + " - " + option.department_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Department"
                  error={!!errors?.department_id}
                  helperText={errors?.department_id?.message}
                />
              )}
              // onChange={(_, value) => {
              //   const companyID = companyData?.find((item) => item.sync_id === value.company.company_sync_id);
              //   const businessUnitID = businessUnitData?.find(
              //     (item) => item.sync_id === value.business_unit.business_unit_sync_id
              //   );

              //   if (value) {
              //     setValue("company_id", companyID);
              //     setValue("business_unit_id", businessUnitID);
              //   } else {
              //     setValue("company_id", null);
              //     setValue("business_unit_id", null);
              //   }
              //   setValue("unit_id", null);
              //   setValue("subunit_id", null);
              //   setValue("location_id", null);
              //   return value;
              // }}
            />

            <CustomAutoComplete
              autoComplete
              name="company_id"
              control={control}
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.company_code + " - " + option.company_name}
              isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Company"
                  error={!!errors?.company_id}
                  helperText={errors?.company_id?.message}
                />
              )}
              disabled
            />

            <CustomAutoComplete
              autoComplete
              name="business_unit_id"
              control={control}
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
              isOptionEqualToValue={(option, value) => option.business_unit_id === value.business_unit_id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Business Unit"
                  error={!!errors?.business_unit_id}
                  helperText={errors?.business_unit_id?.message}
                />
              )}
              disabled
            />

            <CustomAutoComplete
              autoComplete
              name="unit_id"
              control={control}
              disabled
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Unit"
                  error={!!errors?.unit_id}
                  helperText={errors?.unit_id?.message}
                />
              )}
              // onChange={(_, value) => {
              //   setValue("subunit_id", null);
              //   setValue("location_id", null);
              //   return value;
              // }}
            />

            <CustomAutoComplete
              autoComplete
              name="subunit_id"
              control={control}
              disabled
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Sub Unit"
                  error={!!errors?.subunit_id}
                  helperText={errors?.subunit_id?.message}
                />
              )}
            />

            <CustomAutoComplete
              autoComplete
              name="location_id"
              control={control}
              disabled
              options={oneChargingData || []}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.location_code + " - " + option.location_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Location"
                  error={!!errors?.location_id}
                  helperText={errors?.location_id?.message}
                />
              )}
            />
          </Box>

          <Stack
            sx={{
              outline: "1px solid lightgray",
              borderRadius: "10px",
              p: 2,
              width: "100%",
            }}
          >
            <Stack flexDirection="row" gap={2} width="100%" alignItems="flex-start">
              <Autocomplete
                value={selectedApprovers}
                loading={isApproverLoading}
                disabled={data.action === "view"}
                size="small"
                fullWidth
                filterOptions={filterOptions}
                getOptionDisabled={(option) => {
                  return (
                    option?.approver?.employee_id === watch("subunit_id")?.employee_id ||
                    watch("approver_id").some((data) => data?.id === option.id)
                  );
                }}
                options={
                  approverData
                  //   approverData?.filter(
                  //   (item) => item?.subunit?.id === watch("subunit_id")?.id
                  // )
                }
                getOptionLabel={(option) =>
                  `(${option?.approver?.employee_id}) - ${option?.approver?.firstname} ${option?.approver?.lastname}`
                }
                isOptionEqualToValue={(option, value) => {
                  return option?.id === value?.id;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Approver"
                    color="secondary"
                    error={!!errors?.approver_id?.message}
                    helperText={errors?.approver_id?.message}
                    sx={{
                      ".MuiInputBase-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                )}
                onChange={(_, value) => {
                  // console.log(selectedApprovers);
                  setSelectedApprovers(() => value);
                }}
              />

              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => {
                  addApproverHandler();
                }}
                disabled={selectedApprovers === null}
                sx={{
                  width: "100px",
                  gap: 0.5,
                  alignSelf: "flex-start",
                  justifySelf: "center",
                  mt: "5px",
                }}
              >
                <Add
                  sx={{
                    fontSize: "18px",
                    color: selectedApprovers === null ? "gray" : "primary.main",
                  }}
                />
                <Typography sx={{ textTransform: "capitalized" }}>Add</Typography>
              </Button>
            </Stack>

            <Stack>
              <Box
                maxHeight="330px"
                overflow="overlay"
                pr="3px"
                mr="-3px"
                sx={{ cursor: data.action === "view" ? "" : "pointer" }}
              >
                <ReactSortable
                  disabled={data.action === "view"}
                  group="groupName"
                  animation={200}
                  delayOnTouchStart={true}
                  delay={2}
                  list={watch("approver_id")}
                  setList={setListApprovers}
                >
                  {watch("approver_id")?.map((approver, index) => (
                    <Stack key={index} flexDirection="row" justifyContent="space-between" alignItems="center" my={1}>
                      <Slide in={checked} timeout={500} mountOnEnter unmountOnExit>
                        <Stack
                          flexDirection="row"
                          alignItems="center"
                          justifyContent="space-between"
                          p={1}
                          sx={{
                            backgroundColor: "background.light",
                            width: "100%",
                            borderRadius: "8px",
                          }}
                        >
                          <Stack flexDirection="row" alignItems="center" gap={2.5}>
                            <DragIndicator sx={{ color: "black.light" }} />
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: data.action === "view" ? "gray" : "primary.main",
                                fontSize: "16px",
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Stack>
                              <Typography>{`${approver?.approver?.firstname} ${approver?.approver?.lastname}`}</Typography>
                              <Typography fontSize="12px" color="gray" mt="-2px">
                                {approver?.approver?.employee_id}
                              </Typography>
                            </Stack>
                          </Stack>
                          {(!data.action === "view" || data.action === "update" || data.status === false) && (
                            <Tooltip title="Remove" TransitionComponent={Zoom} arrow>
                              <span>
                                <IconButton
                                  aria-label="Delete"
                                  disabled={data.action === "view"}
                                  onClick={() => {
                                    deleteApproverHandler(approver?.id);
                                  }}
                                >
                                  <Close sx={{ fontSize: "18px" }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </Slide>
                    </Stack>
                  ))}
                </ReactSortable>
              </Box>
            </Stack>
          </Stack>
        </Stack>
        <Divider />

        <Box className="add-masterlist__buttons">
          {data.action === "view" ? (
            ""
          ) : (
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={isPostLoading || isUpdateLoading}
              disabled={!isValid || watch("approver_id").length === 0}
            >
              {data.status ? "Update" : "Create"}
            </LoadingButton>
          )}

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleCloseDrawer}
            disabled={isPostLoading || isUpdateLoading}
          >
            {data.action === "view" ? "Close" : "Cancel"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAssetTransfer;
