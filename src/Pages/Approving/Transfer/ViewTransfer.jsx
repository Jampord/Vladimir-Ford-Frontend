import React, { useEffect, useRef, useState } from "react";
import "../../../Style/Request/request.scss";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { useLazyGetSedarUsersApiQuery } from "../../../Redux/Query/SedarUserApi";

import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";

import { Controller, useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { openToast } from "../../../Redux/StateManagement/toastSlice";

import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
  useMediaQuery,
} from "@mui/material";
import {
  Add,
  ArrowBackIosRounded,
  BorderColor,
  Cancel,
  Check,
  Create,
  Edit,
  Help,
  Info,
  Remove,
  RemoveCircle,
  Report,
  Undo,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

// RTK
import { useDispatch } from "react-redux";
import { useLazyGetCompanyAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetBusinessUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import {
  useGetDepartmentAllApiQuery,
  useLazyGetDepartmentAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import { useLazyGetUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Unit";

import {
  useGetLocationAllApiQuery,
  useLazyGetLocationAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/Location";
import {
  useGetSubUnitAllApiQuery,
  useLazyGetSubUnitAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import {
  useGetAccountTitleAllApiQuery,
  useLazyGetAccountTitleAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import { useGetByTransactionApiQuery, useUpdateRequisitionApiMutation } from "../../../Redux/Query/Request/Requisition";

import { useLocation, useNavigate } from "react-router-dom";

import { usePostRequisitionSmsApiMutation } from "../../../Redux/Query/Request/RequisitionSms";
import ErrorFetching from "../../ErrorFetching";
import { useLazyGetFixedAssetAllApiQuery } from "../../../Redux/Query/FixedAsset/FixedAssets";
import moment from "moment";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import {
  useGetTransferNumberApiQuery,
  useLazyGetFixedAssetTransferAllApiQuery,
  useLazyGetNextTransferQuery,
  usePostTransferApiMutation,
} from "../../../Redux/Query/Movement/Transfer";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import axios from "axios";
import { usePatchApprovalStatusApiMutation } from "../../../Redux/Query/Approving/Approval";
import { usePatchTransferApprovalStatusApiMutation } from "../../../Redux/Query/Approving/TransferApproval";
import { useLazyGetUserAccountAllApiQuery } from "../../../Redux/Query/UserManagement/UserAccountsApi";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";

const schema = yup.object().shape({
  id: yup.string(),
  description: yup.string().required().label("Acquisition Details"),
  accountability: yup.string().typeError("Accountability is a required field").required().label("Accountability"),
  accountable: yup
    .object()
    .nullable()
    .when("accountability", {
      is: (value) => value === "Personal Issued",
      then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
    }),

  receiver_id: yup.object().required().label("Receiver Id").typeError("Receiver Id is required"),

  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
  // account_title_id: yup.object().required().label("Account Title").typeError("Account Title is a required field"),

  remarks: yup.string().label("Remarks"),
  attachments: yup.mixed().required().label("Attachments"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
      created_at: yup.date(),
      company_id: yup.string(),
      business_unit_id: yup.string(),
      department_id: yup.string(),
      unit_id: yup.string(),
      sub_unit_id: yup.string(),
      location_id: yup.string(),
    })
  ),
});

const ViewTransfer = (props) => {
  const [view, setView] = useState(true);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { state: transactionData } = useLocation();
  // console.log("transactionData: ", transactionData);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const AttachmentRef = useRef(null);

  // console.log(transactionData);

  const [updateRequest, setUpdateRequest] = useState({
    id: "",
    description: "",
    accountability: null,
    accountable: null,

    department_id: null,
    company_id: null,
    business_unit_id: null,
    unit_id: null,
    subunit_id: null,
    location_id: null,
    // account_title_id: null,

    remarks: "",
    attachments: null,

    assets: [{ id: null, fixed_asset_id: null, asset_accountable: "", created_at: null }],

    receiver_id: null,
  });

  const [
    postTransfer,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostTransferApiMutation();

  const [
    updateRequisition,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateRequisitionApiMutation();

  const [
    postRequestSms,
    { data: smsData, isLoading: isSmsLoading, isSuccess: isSmsSuccess, isError: isSmsError, error: smsError },
  ] = usePostRequisitionSmsApiMutation();

  const [patchApprovalStatus, { isLoading: isPatchApprovalLoading }] = usePatchTransferApprovalStatusApiMutation();
  const [getNextTransfer, { data: nextData, isLoading: isNextTransferLoading }] = useLazyGetNextTransferQuery();

  //* QUERY ------------------------------------------------------------------

  const {
    data: transferData = [],
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    isError: isTransferError,
    isFetching: isTransferFetching,
    refetch: isTransferRefetch,
  } = useGetTransferNumberApiQuery(
    { transfer_number: transactionData?.id ? transactionData?.id : transactionData?.transfer_number },
    { refetchOnMountOrArgChange: true }
  );

  // console.log("transferData: ", transferData[0]);

  const [
    companyTrigger,
    {
      data: companyData = [],
      isLoading: isCompanyLoading,
      isSuccess: isCompanySuccess,
      isError: isCompanyError,
      refetch: isCompanyRefetch,
    },
  ] = useLazyGetCompanyAllApiQuery();

  const [
    businessUnitTrigger,
    {
      data: businessUnitData = [],
      isLoading: isBusinessUnitLoading,
      isSuccess: isBusinessUnitSuccess,
      isError: isBusinessUnitError,
      refetch: isBusinessUnitRefetch,
    },
  ] = useLazyGetBusinessUnitAllApiQuery();

  const [
    departmentTrigger,
    {
      data: departmentData = [],
      isLoading: isDepartmentLoading,
      isSuccess: isDepartmentSuccess,
      isError: isDepartmentError,
      refetch: isDepartmentRefetch,
    },
  ] = useLazyGetDepartmentAllApiQuery();

  const [
    unitTrigger,
    {
      data: unitData = [],
      isLoading: isUnitLoading,
      isSuccess: isUnitSuccess,
      isError: isUnitError,
      refetch: isUnitRefetch,
    },
  ] = useLazyGetUnitAllApiQuery();

  const [
    subunitTrigger,
    {
      data: subUnitData = [],
      isLoading: isSubUnitLoading,
      isSuccess: isSubUnitSuccess,
      isError: isSubUnitError,
      refetch: isSubUnitRefetch,
    },
  ] = useLazyGetSubUnitAllApiQuery();

  const [
    locationTrigger,
    {
      data: locationData = [],
      isLoading: isLocationLoading,
      isSuccess: isLocationSuccess,
      isError: isLocationError,
      refetch: isLocationRefetch,
    },
  ] = useLazyGetLocationAllApiQuery();

  const [
    accountTitleTrigger,
    {
      data: accountTitleData = [],
      isLoading: isAccountTitleLoading,
      isSuccess: isAccountTitleSuccess,
      isError: isAccountTitleError,
      refetch: isAccountTitleRefetch,
    },
  ] = useLazyGetAccountTitleAllApiQuery();

  const [
    sedarTrigger,
    { data: sedarData = [], isLoading: isSedarLoading, isSuccess: isSedarSuccess, isError: isSedarError },
  ] = useLazyGetSedarUsersApiQuery();

  const [
    fixedAssetTrigger,
    {
      data: vTagNumberData = [],
      isLoading: isVTagNumberLoading,
      isSuccess: isVTagNumberSuccess,
      isError: isVTagNumberError,
      error: vTagNumberError,
    },
  ] = useLazyGetFixedAssetTransferAllApiQuery({}, { refetchOnMountOrArgChange: true });

  const [
    userAccountTrigger,
    { data: userData = [], isLoading: isUserLoading, isSuccess: isUserSuccess, isError: isUserError },
  ] = useLazyGetUserAccountAllApiQuery();
  // console.log("userData: ", userData);

  //* useForm --------------------------------------------------------------------
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
      id: "",
      description: "",
      accountability: null,
      accountable: null,

      department_id: null,
      company_id: null,
      business_unit_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      // account_title_id: null,

      remarks: "",
      attachments: null,

      assets: [{ id: null, fixed_asset_id: null, asset_accountable: "", created_at: null }],

      receiver_id: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
  });

  //* useEffects() ----------------------------------------------------------------
  useEffect(() => {
    if (isPostError) {
      if (postError?.status === 422) {
        dispatch(
          openToast({
            message: postError?.transferData[0]?.errors.detail,
            duration: 5000,
            variant: "error",
          })
        );
      } else {
        dispatch(
          openToast({
            message: "Something went wrong. Please try again.",
            duration: 5000,
            variant: "error",
          })
        );
      }
    }
  }, [isPostError]);

  const transferNumberData = transferData?.at(0);

  useEffect(() => {
    // console.log("transferNumberData", transferNumberData);

    if (transferNumberData) {
      fixedAssetTrigger();
      // const accountable = {
      //   general_info: {
      //     full_id_number: transferNumberData?.accountable?.split(" ")[0],
      //     full_id_number_full_name: transferNumberData?.accountable,
      //   },
      // };
      const attachmentFormat = transferNumberData?.attachments === null ? "" : transferNumberData?.attachments;

      setValue("description", transferNumberData?.description);
      // setValue("accountability", transferNumberData?.accountability);
      // setValue("accountable", transferNumberData?.accountable);
      // setValue("receiver_id", transferNumberData?.receiver);
      setValue("department_id", transferNumberData?.department);
      setValue("company_id", transferNumberData?.company);
      setValue("business_unit_id", transferNumberData?.business_unit);
      setValue("unit_id", transferNumberData?.unit);
      setValue("subunit_id", transferNumberData?.subunit);
      setValue("location_id", transferNumberData?.location);
      // setValue("account_title_id", transferNumberData?.account_title);
      setValue("remarks", transferNumberData?.remarks);
      setValue("attachments", attachmentFormat);
      setValue(
        "assets",
        transferNumberData?.assets?.map((asset) => ({
          id: asset.id,
          // fixed_asset_id: {
          //   id: asset?.vladimir_tag_number.id,
          //   vladimir_tag_number: asset?.vladimir_tag_number?.vladimir_tag_number,
          //   asset_description: asset?.vladimir_tag_number?.asset_description,
          // },
          fixed_asset_id: asset,
          asset_accountable: asset.accountable === "-" ? "Common" : asset.accountable,
          created_at: asset.created_at || asset.acquisition_date,
          company_id: asset.company?.company_name,
          business_unit_id: asset.business_unit?.business_unit_name,
          department_id: asset.department?.department_name,
          unit_id: asset.unit?.unit_name,
          sub_unit_id: asset.subunit?.subunit_name,
          location_id: asset.location?.location_name,
          accountability: asset?.new_accountability,
          accountable: asset?.new_accountable,
          receiver_id: asset?.receiver,
        }))
      );
    }
  }, [transferData, edit, transferNumberData, transactionData, transferData[0]]);

  // console.log("asset", watch("asset"));
  // console.log("asset", data?.asset);

  const UpdateField = ({ value, label }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
          disabled={edit ? false : view}
          value={value > 1 ? `${value} files selected` : value <= 1 ? `${value} file selected` : null}
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
        />
      </Stack>
    );
  };

  // CONFIRMATION
  const onApprovalApproveHandler = (transfer_number) => {
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
              APPROVE
            </Typography>{" "}
            this request?
          </Box>
        ),

        onConfirm: async () => {
          const noNextData = (err) => {
            if (err?.status === 404) {
              navigate(`/approving/transfer`);
            } else if (err?.status === 422) {
              // dispatch(
              //   openToast({
              //     // message: err.data.message,
              //     message: err.data.errors?.detail,
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              navigate(`/approving/transfer`);
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
              navigate(`/approving/transfer`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Approve",
              movement_id: transfer_number,
            }).unwrap();

            isTransferRefetch();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextTransfer().unwrap();
            console.log("next: ", next);
            navigate(`/approving/transfer/${next?.transfer_number}`, { state: next, replace: true });
          } catch (err) {
            noNextData(err);
            // navigate(`/approving/transfer`);
          }
        },
      })
    );
  };

  const onApprovalReturnHandler = (transfer_number) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
        message: (
          <Stack gap={2}>
            <Typography>
              Are you sure you want to{" "}
              <Typography
                variant="span"
                sx={{
                  display: "inline-block",
                  color: "secondary.main",
                  fontWeight: "bold",
                  fontFamily: "Raleway",
                }}
              >
                RETURN
              </Typography>{" "}
              this request?
            </Typography>
          </Stack>
        ),
        remarks: true,

        onConfirm: async (data) => {
          const noNextData = (err) => {
            if (err?.status === 404) {
              navigate(`/approving/transfer`);
            } else if (err?.status === 422) {
              // dispatch(
              //   openToast({
              //     // message: err.data.message,
              //     message: err.data.errors?.detail,
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              navigate(`/approving/transfer`);
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
              navigate(`/approving/transfer`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Return",
              movement_id: transfer_number,
              remarks: data,
            }).unwrap();

            dispatch(
              openToast({
                message: result?.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextTransfer().unwrap();
            navigate(`/approving/transfer/${next?.transfer_number}`, { state: next, view, replace: true });
          } catch (err) {
            noNextData(err);
          }
        },
      })
    );
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  //* Styles ----------------------------------------------------------------
  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    pb: "10px",
  };

  return (
    <>
      <Box className="mcontainer">
        <Stack flexDirection="row" justifyContent="space-between">
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<ArrowBackIosRounded color="secondary" />}
            onClick={() => {
              navigate(-1);
            }}
            disableRipple
            sx={{ pl: "20px", ml: "-15px", mt: "-5px", "&:hover": { backgroundColor: "transparent" } }}
          >
            Back
          </Button>

          {/* {view && !edit
            ? !transactionData?.approved && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<BorderColor color="secondary" />}
                  onClick={() => setEdit(true)}
                  sx={{ color: "secondary.main", mb: "10px" }}
                >
                  Edit
                </Button>
              )
            : !transactionData?.approved && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Cancel color="secondary" />}
                  onClick={() => setEdit(false)}
                  sx={{ color: "secondary.main", mb: "10px" }}
                >
                  Cancel Edit
                </Button>
              )} */}
        </Stack>

        <Box className="request mcontainer__wrapper" p={2} component="form">
          <Box>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem", pt: 1 }}>
              TRANSFER NO. {transferData[0]?.movement_id}
            </Typography>

            <Box id="requestForm" className="request__form">
              <Stack gap={2} py={1}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                  REQUEST DETAILS
                </Typography>
                <Box sx={BoxStyle}>
                  <CustomTextField
                    control={control}
                    name="description"
                    disabled={edit ? false : view}
                    label="Description"
                    type="text"
                    error={!!errors?.description}
                    helperText={errors?.description?.message}
                    fullWidth
                    multiline
                  />

                  <CustomTextField
                    control={control}
                    name="remarks"
                    disabled={edit ? false : view}
                    label="Remarks (Optional)"
                    optional
                    type="text"
                    error={!!errors?.remarks}
                    helperText={errors?.remarks?.message}
                    fullWidth
                    multiline
                  />

                  <Stack flexDirection="row" gap={1} alignItems="center">
                    {watch("attachments") !== null ? (
                      <UpdateField label={"Attachments"} value={watch("attachments")?.length} />
                    ) : (
                      <CustomMultipleAttachment
                        control={control}
                        name="attachments"
                        disabled={edit ? false : view}
                        label="Attachments"
                        inputRef={AttachmentRef}
                        error={!!errors?.attachments?.message}
                        helperText={errors?.attachments?.message}
                      />
                    )}
                  </Stack>
                  <Box mt="-13px" ml="10px">
                    {watch("attachments")
                      ? watch("attachments").map((item, index) => (
                          <Typography fontSize="12px" fontWeight="bold" color="gray" key={index}>
                            {item.name}
                          </Typography>
                        ))
                      : null}
                  </Box>

                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "15px" }}>
                    CHART OF ACCOUNTS
                  </Typography>

                  {/* <CustomAutoComplete
                    control={control}
                    name="accountability"
                    disabled={edit ? false : view}
                    options={["Personal Issued", "Common"]}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="secondary"
                        label="Accountability  "
                        error={!!errors?.accountability}
                        helperText={errors?.accountability?.message}
                      />
                    )}
                    onChange={(_, value) => {
                      setValue("accountable", null);
                      return value;
                    }}
                  />

                  {watch("accountability") === "Personal Issued" && (
                    <CustomAutoComplete
                      name="accountable"
                      disabled={edit ? false : view}
                      control={control}
                      includeInputInList
                      disablePortal
                      filterOptions={filterOptions}
                      options={userData}
                      onOpen={() => (isUserSuccess ? null : userAccountTrigger())}
                      loading={isUserLoading}
                      getOptionLabel={(option) => option?.full_id_number_full_name}
                      isOptionEqualToValue={(option, value) =>
                        option?.full_id_number_full_name === value?.full_id_number_full_name
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          color="secondary"
                          label="New Custodian"
                          error={!!errors?.accountable?.message}
                          helperText={errors?.accountable?.message}
                        />
                      )}
                    />
                  )} */}

                  <CustomAutoComplete
                    autoComplete
                    freeSolo
                    control={control}
                    name="department_id"
                    disabled={edit ? false : view}
                    options={departmentData}
                    onOpen={() =>
                      isDepartmentSuccess ? null : (departmentTrigger(), companyTrigger(), businessUnitTrigger())
                    }
                    loading={isDepartmentLoading}
                    size="small"
                    // clearIcon={null}
                    getOptionLabel={(option) => option.department_code + " - " + option.department_name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        multiline
                        color="secondary"
                        {...params}
                        label="Department"
                        error={!!errors?.department_id}
                        helperText={errors?.department_id?.message}
                      />
                    )}
                  />

                  <CustomAutoComplete
                    name="company_id"
                    freeSolo
                    control={control}
                    options={companyData}
                    onOpen={() => (isCompanySuccess ? null : company())}
                    loading={isCompanyLoading}
                    size="small"
                    getOptionLabel={(option) => option.company_code + " - " + option.company_name}
                    isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                    renderInput={(params) => (
                      <TextField
                        multiline
                        maxRows={2}
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
                    freeSolo
                    name="business_unit_id"
                    control={control}
                    options={businessUnitData}
                    loading={isBusinessUnitLoading}
                    size="small"
                    getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
                    isOptionEqualToValue={(option, value) => option.business_unit_id === value.business_unit_id}
                    renderInput={(params) => (
                      <TextField
                        multiline
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
                    freeSolo
                    name="unit_id"
                    disabled={edit ? false : view}
                    control={control}
                    options={departmentData?.filter((obj) => obj?.id === watch("department_id")?.id)[0]?.unit || []}
                    onOpen={() => (isUnitSuccess ? null : (unitTrigger(), subunitTrigger(), locationTrigger()))}
                    loading={isUnitLoading}
                    size="small"
                    getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => (
                      <TextField
                        multiline
                        color="secondary"
                        {...params}
                        label="Unit"
                        error={!!errors?.unit_id}
                        helperText={errors?.unit_id?.message}
                      />
                    )}
                    onChange={(_, value) => {
                      setValue("subunit_id", null);
                      setValue("location_id", null);
                      return value;
                    }}
                  />

                  <CustomAutoComplete
                    autoComplete
                    freeSolo
                    name="subunit_id"
                    disabled={edit ? false : view}
                    control={control}
                    options={unitData?.filter((obj) => obj?.id === watch("unit_id")?.id)[0]?.subunit || []}
                    loading={isSubUnitLoading}
                    size="small"
                    getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
                    isOptionEqualToValue={(option, value) => {
                      console.log("option&value", option, value);
                      return option.id === value.id;
                    }}
                    renderInput={(params) => (
                      <TextField
                        multiline
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
                    freeSolo
                    name="location_id"
                    disabled={edit ? false : view}
                    control={control}
                    options={locationData?.filter((item) => {
                      return item.subunit.some((subunit) => {
                        return subunit?.sync_id === watch("subunit_id")?.sync_id;
                      });
                    })}
                    loading={isLocationLoading}
                    size="small"
                    getOptionLabel={(option) => option.location_code + " - " + option.location_name}
                    isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
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

                  {/* <CustomAutoComplete
                    name="receiver_id"
                    disabled={edit ? false : view}
                    control={control}
                    includeInputInList
                    disablePortal
                    filterOptions={filterOptions}
                    options={userData}
                    onOpen={() => (isUserSuccess ? null : userAccountTrigger())}
                    loading={isUserLoading}
                    getOptionLabel={(option) => option?.full_id_number_full_name}
                    isOptionEqualToValue={(option, value) =>
                      option?.full_id_number_full_name === value?.full_id_number_full_name
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="secondary"
                        label="Receiver"
                        error={!!errors?.accountable?.message}
                        helperText={errors?.accountable?.message}
                      />
                    )}
                  /> */}

                  {/* <CustomAutoComplete
                    name="account_title_id"
                    disabled={edit ? false : view}
                    control={control}
                    options={accountTitleData}
                    onOpen={() => (isAccountTitleSuccess ? null : accountTitleTrigger())}
                    loading={isAccountTitleLoading}
                    getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                    isOptionEqualToValue={(option, value) => option.account_title_code === value.account_title_code}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="secondary"
                        label="Account Title  "
                        error={!!errors?.account_title_id}
                        helperText={errors?.account_title_id?.message}
                      />
                    )}
                  /> */}
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* TABLE */}
          <Box className="request__table">
            <TableContainer
              className="mcontainer__th-body  mcontainer__wrapper"
              sx={{ height: transactionData?.approved ? "calc(100vh - 230px)" : "calc(100vh - 280px)", pt: 0 }}
            >
              <Table className="mcontainer__table " stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& > *": {
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell className="tbl-cell">Index</TableCell>
                    <TableCell className="tbl-cell">Asset</TableCell>
                    <TableCell className="tbl-cell">Transfer To</TableCell>
                    <TableCell className="tbl-cell">Accountability</TableCell>
                    <TableCell className="tbl-cell">Chart Of Accounts</TableCell>
                    <TableCell className="tbl-cell">Acquisition Date</TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isTransferLoading || isTransferFetching ? (
                    <LoadingData />
                  ) : (
                    fields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="tbl-cell" align="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: "primary.main",
                              fontSize: "14px",
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Controller
                            control={control}
                            name={`assets.${index}.fixed_asset_id`}
                            render={({ field: { ref, value, onChange } }) => (
                              <Autocomplete
                                options={vTagNumberData}
                                onOpen={() => (isVTagNumberSuccess ? null : fixedAssetTrigger())}
                                loading={isVTagNumberLoading}
                                disabled={edit ? false : view}
                                size="small"
                                freeSolo
                                value={value}
                                filterOptions={filterOptions}
                                getOptionLabel={(option) =>
                                  `(${option.vladimir_tag_number}) - ${option.asset_description}`
                                }
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                renderInput={(params) => (
                                  <TextField required color="secondary" {...params} multiline label="Tag Number" />
                                )}
                                getOptionDisabled={(option) =>
                                  !!fields.find((item) => item.fixed_asset_id?.id === option.id) &&
                                  option?.transfer === 1
                                }
                                // getOptionDisabled={(option) => !!fields.find((item) => console.log(item))}
                                onChange={(_, newValue) => {
                                  if (newValue) {
                                    // onChange(newValue.id);
                                    onChange(newValue);
                                    setValue(
                                      `assets.${index}.asset_accountable`,
                                      newValue.accountable === "-" ? "Common" : newValue.accountable
                                    );
                                    setValue(`assets.${index}.created_at`, newValue.created_at);
                                  } else {
                                    onChange(null);
                                    setValue(`assets.${index}.asset_accountable`, "");
                                    setValue(`assets.${index}.created_at`, null);
                                  }
                                }}
                                sx={{
                                  ".MuiInputBase-root": {
                                    borderRadius: "10px",
                                  },
                                  ".MuiInputLabel-root.Mui-disabled": {
                                    backgroundColor: "transparent",
                                  },
                                  ".Mui-disabled": {
                                    backgroundColor: "background.light",
                                  },
                                  minWidth: "200px",
                                  maxWidth: "550px",
                                }}
                              />
                            )}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack flexDirection="row" gap={2}>
                            <Controller
                              control={control}
                              name={`assets.${index}.accountability`}
                              render={({ field: { ref, value, onChange } }) => (
                                <Autocomplete
                                  options={["Personal Issued", "Common"]}
                                  disabled
                                  freeSolo
                                  size="small"
                                  value={value}
                                  renderInput={(params) => (
                                    <TextField
                                      required
                                      color="secondary"
                                      {...params}
                                      // multiline
                                      label="Accountability"
                                      maxRows={2}
                                      sx={{
                                        "& .MuiInputBase-inputMultiline": {
                                          minHeight: "10px",
                                        },
                                        ".MuiInputBase-root": {
                                          borderRadius: "10px",
                                          minHeight: "63px",
                                        },
                                        "& .MuiFormLabel-root": {
                                          lineHeight: "43px", // Adjust based on the height of the input
                                        },
                                        "& .Mui-focused": {
                                          top: "-10%", // Center vertically
                                        },
                                        "& .MuiFormLabel-filled": {
                                          top: "-10%", // Center vertically
                                        },
                                      }}
                                    />
                                  )}
                                  onChange={(_, value) => {
                                    onChange(value);
                                    setValue(`assets.${index}.accountable`, null);
                                    setValue(`assets.${index}.receiver_id`, null);

                                    return value;
                                  }}
                                  sx={{
                                    ".MuiInputBase-root": {
                                      borderRadius: "10px",
                                    },
                                    ".MuiInputLabel-root.Mui-disabled": {
                                      backgroundColor: "transparent",
                                    },
                                    ".Mui-disabled": {
                                      backgroundColor: "background.light",
                                    },
                                    ".MuiOutlinedInput-notchedOutline": {
                                      bgcolor: "#f5c9861c",
                                    },

                                    // ml: "-15px",
                                    minWidth: "200px",
                                    maxWidth: "550px",
                                  }}
                                />
                              )}
                            />

                            {console.log(watch(`assets`))}

                            {watch(`assets.${index}.accountability`) === "Personal Issued" && (
                              <Controller
                                control={control}
                                name={`assets.${index}.accountable`}
                                render={({ field: { ref, value, onChange } }) => (
                                  <Autocomplete
                                    size="small"
                                    value={value}
                                    options={userData}
                                    disabled
                                    freeSolo
                                    onOpen={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
                                    loading={isUserLoading}
                                    filterOptions={filterOptions}
                                    getOptionLabel={(option) => option?.full_id_number_full_name}
                                    isOptionEqualToValue={(option, value) =>
                                      option?.full_id_number_full_name === value?.full_id_number_full_name
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        required
                                        color="secondary"
                                        {...params}
                                        multiline
                                        label="New Custodian"
                                        maxRows={3}
                                        sx={{
                                          ".MuiInputBase-root": {
                                            borderRadius: "10px",
                                            minHeight: "63px",
                                          },
                                          "& .MuiInputBase-inputMultiline": {
                                            minHeight: "10px",
                                          },
                                          "& .MuiFormLabel-root": {
                                            lineHeight: "43px", // Adjust based on the height of the input
                                          },
                                          "& .Mui-focused": {
                                            top: "-10%", // Center vertically
                                          },
                                          "& .MuiFormLabel-filled": {
                                            top: "-10%", // Center vertically
                                          },

                                          ml: "8px",
                                          minWidth: "200px",
                                          maxWidth: "550px",
                                        }}
                                      />
                                    )}
                                    onChange={(_, newValue) => {
                                      // console.log("New Custodian newValue: ", newValue);
                                      onChange(newValue);
                                      if (newValue) {
                                        setValue(`assets.${index}.receiver_id`, newValue);
                                      } else if (value === null) {
                                        setValue(`assets.${index}.receiver_id`, null);
                                      }
                                      return newValue;
                                    }}
                                    sx={{
                                      ".MuiInputBase-root": {
                                        borderRadius: "10px",
                                      },
                                      ".MuiInputLabel-root.Mui-disabled": {
                                        backgroundColor: "transparent",
                                      },
                                      ".Mui-disabled": {
                                        backgroundColor: "background.light",
                                      },
                                      ".MuiOutlinedInput-notchedOutline": {
                                        bgcolor: "#f5c9861c",
                                      },
                                      ml: "-17px",
                                      mr: "8px",
                                      minWidth: "200px",
                                      maxWidth: "550px",
                                    }}
                                  />
                                )}
                              />
                            )}

                            <Controller
                              control={control}
                              name={`assets.${index}.receiver_id`}
                              filterOptions={filterOptions}
                              render={({ field: { ref, value, onChange } }) => (
                                <Autocomplete
                                  size="small"
                                  value={value}
                                  options={userData}
                                  disabled
                                  freeSolo
                                  onOpen={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
                                  loading={isUserLoading}
                                  filterOptions={filterOptions}
                                  getOptionLabel={(option) => option?.full_id_number_full_name}
                                  isOptionEqualToValue={(option, value) =>
                                    option?.full_id_number_full_name === value?.full_id_number_full_name
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      required
                                      color="secondary"
                                      {...params}
                                      multiline
                                      label="Receiver"
                                      maxRows={5}
                                      sx={{
                                        "& .MuiInputBase-inputMultiline": {
                                          minHeight: "10px",
                                        },
                                        ".MuiInputBase-root": {
                                          borderRadius: "10px",
                                          minHeight: "63px",
                                        },
                                        "& .MuiFormLabel-root": {
                                          lineHeight: "43px", // Adjust based on the height of the input
                                        },
                                        "& .MuiFormLabel-root": {
                                          lineHeight: "43px", // Adjust based on the height of the input
                                        },
                                        "& .Mui-focused": {
                                          top: "-10%", // Center vertically
                                        },
                                        "& .MuiFormLabel-filled": {
                                          top: "-10%", // Center vertically
                                        },
                                        // ml: "8px",
                                        minWidth: "200px",
                                        maxWidth: "550px",
                                      }}
                                    />
                                  )}
                                  onChange={(_, newValue) => {
                                    // console.log("New Custodian newValue: ", newValue);
                                    onChange(newValue);
                                    if (newValue) {
                                      setValue("receiver_id", newValue);
                                    } else if (value === null) {
                                      setValue("receiver_id", null);
                                    }
                                    return newValue;
                                  }}
                                  sx={{
                                    ".MuiInputBase-root": {
                                      borderRadius: "10px",
                                    },
                                    ".MuiInputLabel-root.Mui-disabled": {
                                      backgroundColor: "transparent",
                                    },
                                    ".Mui-disabled": {
                                      backgroundColor: "background.light",
                                    },
                                    ".MuiOutlinedInput-notchedOutline": {
                                      bgcolor: "#f5c9861c",
                                    },
                                    ml: "-8px",
                                    minWidth: "200px",
                                    maxWidth: "550px",
                                  }}
                                />
                              )}
                            />
                          </Stack>
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.asset_accountable`)}
                            variant="outlined"
                            disabled
                            multiline
                            maxRows={2}
                            type="text"
                            error={!!errors?.accountableAccount}
                            helperText={errors?.accountableAccount?.message}
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                                textOverflow: "ellipsis",
                                fontWeight: "500",
                              },
                              "& .MuiInputBase-inputMultiline": {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // overflow: "hidden",
                                // textOverflow: "ellipsis",
                                // textAlign: "center",
                              },

                              ml: "-15px",
                              minWidth: "150px",
                            }}
                            fullWidth
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack width="250px" rowGap={0}>
                            <TextField
                              {...register(`assets.${index}.company_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.business_unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.department_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.sub_unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.location_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                                marginBottom: "-10px",
                              }}
                            />
                          </Stack>
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.created_at`)}
                            variant="outlined"
                            disabled
                            type="date"
                            // error={!!errors?.dateCreated}
                            // helperText={errors?.dateCreated?.message}
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                              },
                              ml: "-10px",
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" className="tbl-cell">
                          <IconButton
                            onClick={() => remove(index)}
                            disabled={edit ? false : fields.length === 1 || view}
                          >
                            <Tooltip title="Delete Row" placement="top" arrow>
                              <RemoveCircle
                                color={fields.length === 1 || view ? (edit ? "warning" : "gray") : "warning"}
                              />
                            </Tooltip>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Buttons */}
            {!transactionData?.approved && (
              <Stack flexDirection="row" justifyContent="space-between" alignItems={"center"}>
                <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main">
                  Added: {fields.length > 1 ? `${fields.length} Assets` : `${fields.length} Asset`}
                </Typography>
                <Stack flexDirection="row" gap={2}>
                  <Stack flexDirection="row" justifyContent="flex-end" alignItems="center" gap={2}>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      disabled={isTransferLoading || isTransferFetching}
                      onClick={() =>
                        onApprovalApproveHandler(
                          transactionData?.id ? transactionData?.id : transactionData?.transfer_number
                        )
                      }
                      startIcon={<Check color="primary" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isTransferLoading || isTransferFetching}
                      onClick={() =>
                        onApprovalReturnHandler(
                          transactionData?.id ? transactionData?.id : transactionData?.transfer_number
                        )
                      }
                      startIcon={<Undo sx={{ color: "#5f3030" }} />}
                      sx={{
                        color: "white",
                        backgroundColor: "error.main",
                        ":hover": { backgroundColor: "error.dark" },
                      }}
                    >
                      Return
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ViewTransfer;
