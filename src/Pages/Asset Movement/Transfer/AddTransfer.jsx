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
  Badge,
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
  Create,
  Edit,
  Info,
  Remove,
  RemoveCircle,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

// RTK
import { useDispatch } from "react-redux";
import { useLazyGetCompanyAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetBusinessUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import {
  useGetDepartmentAllApiQuery,
  useLazyGetDepartmentAllApiQuery,
  useLazyGetDepartmentAllCoordinatorApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import {
  useLazyGetUnitAllApiQuery,
  useLazyGetUnitAllCoordinatorApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/Unit";

import {
  useGetLocationAllApiQuery,
  useLazyGetLocationAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/Location";
import {
  useGetSubUnitAllApiQuery,
  useLazyGetSubUnitAllApiQuery,
  useLazyGetSubUnitAllCoordinatorApiQuery,
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
  transferApi,
  useGetTransferNumberApiQuery,
  useLazyGetFixedAssetTransferAllApiQuery,
  useLazyGetFixedAssetTransferCoordinatorApiQuery,
  usePostTransferApiMutation,
} from "../../../Redux/Query/Movement/Transfer";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import axios from "axios";
import {
  useGetUserAccountAllApiQuery,
  useLazyGetUserAccountAllApiQuery,
  useLazyGetUserAccountByUnitApiQuery,
} from "../../../Redux/Query/UserManagement/UserAccountsApi";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { useLazyGetReceiverSettingsAllApiQuery } from "../../../Redux/Query/Settings/ReceiverSettings";

const schema = yup.object().shape({
  id: yup.string(),
  description: yup.string().required().label("Description"),
  // accountability: yup.string().typeError("Accountability is a required field").required().label("Accountability"),
  // accountable: yup
  //   .object()
  //   .nullable()
  //   .when("accountability", {
  //     is: (value) => value === "Personal Issued",
  //     then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
  //   }),

  //Transfer From
  department_id_coordinator: yup.object().nullable().label("Department From"),

  company_id_coordinator: yup.object().nullable().label("Company From"),
  business_unit_id_coordinator: yup.object().nullable().label("Business Unit From"),
  unit_id_coordinator: yup.object().nullable().label("Unit From"),
  subunit_id_coordinator: yup.object().nullable().label("Subunit From"),
  location_id_coordinator: yup.object().nullable().label("Location From"),

  //Transfer To
  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
  // account_title_id: yup.object().required().label("Account Title").typeError("Account Title is a required field"),

  // Accounting Entries
  depreciation_debit_id: yup
    .object()
    .required()
    .label("Depreciation Debit")
    .typeError("Depreciation Debit is a required field"),

  remarks: yup.string().label("Remarks"),
  attachments: yup.mixed().required().label("Attachments"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string().nullable(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
      created_at: yup.string().nullable(),
      company_id: yup.string().nullable(),
      business_unit_id: yup.string().nullable(),
      department_id: yup.string().nullable(),
      unit_id: yup.string().nullable(),
      sub_unit_id: yup.string().nullable(),
      location_id: yup.string().nullable(),
      // remaining_book_value: yup.number().nullable(),
      accountability: yup.string().typeError("Accountability is a required field").required().label("Accountability"),
      accountable: yup
        .object()
        .nullable()
        .when("accountability", {
          is: (value) => value === "Personal Issued",
          then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
        }),
      receiver_id: yup.object().required().label("Receiver Id").typeError("Receiver Id is required"),
    })
  ),
});

const AddTransfer = (props) => {
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const AttachmentRef = useRef(null);
  const { state: transactionData } = useLocation();
  // console.log("transactionData: ", transactionData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    depreciation_debit_id: null,

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

  //* QUERY ------------------------------------------------------------------

  const {
    data: transferData = [],
    isLoading: isTransferLoading,
    isSuccess: isTransferSuccess,
    isError: isTransferError,
    isFetching: isTransferFetching,
    refetch: isTransferRefetch,
  } = useGetTransferNumberApiQuery({ transfer_number: transactionData?.id }, { refetchOnMountOrArgChange: true });

  const data = transferData?.at(0);
  // console.log("transferData: ", data);

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
  // console.log("deptData: ", departmentData);

  const [
    departmentCoordinatorTrigger,
    {
      data: departmentCoordinatorData = [],
      isLoading: isDepartmentCoordinatorLoading,
      isSuccess: isDepartmentCoordinatorSuccess,
      isError: isDepartmentCoordinatorError,
      refetch: isDepartmentCoordinatorRefetch,
    },
  ] = useLazyGetDepartmentAllCoordinatorApiQuery();
  // console.log("deptData: ", departmentData);

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
    unitCoordinatorTrigger,
    {
      data: unitCoordinatorData = [],
      isLoading: isUnitCoordinatorLoading,
      isSuccess: isUnitCoordinatorSuccess,
      isError: isUnitCoordinatorError,
      refetch: isUnitCoordinatorRefetch,
    },
  ] = useLazyGetUnitAllCoordinatorApiQuery();

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
    subunitCoordinatorTrigger,
    {
      data: subUnitCoordinatorData = [],
      isLoading: isSubUnitCoordinatorLoading,
      isSuccess: isSubUnitCoordinatorSuccess,
      isError: isSubUnitCoordinatorError,
      refetch: isSubUnitCoordinatorRefetch,
    },
  ] = useLazyGetSubUnitAllCoordinatorApiQuery();

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
  // console.log("sedarData: ", sedarData);

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
    fixedAssetCoordinatorTrigger,
    {
      data: vTagNumberCoordinatorData = [],
      isLoading: isVTagNumberCoordinatorLoading,
      isSuccess: isVTagNumberCoordinatorSuccess,
      isError: isVTagNumberCoordinatorError,
      error: vTagNumberCoordinatorError,
      isFetching: isVTagNumberCoordinatorFetching,
    },
  ] = useLazyGetFixedAssetTransferCoordinatorApiQuery({}, { refetchOnMountOrArgChange: true });
  // console.log("vtagNumberData", vTagNumberData);

  const [
    userAccountTrigger,
    { data: userData = [], isLoading: isUserLoading, isSuccess: isUserSuccess, isError: isUserError },
  ] = useLazyGetUserAccountByUnitApiQuery();
  // console.log("userdata", userData);

  const [
    receiverAccountTrigger,
    { data: receiverData = [], isLoading: isReceiverLoading, isSuccess: isReceiverSuccess, isError: isReceiverError },
  ] = useLazyGetReceiverSettingsAllApiQuery();
  console.log("receiverData", receiverData);

  //* useForm --------------------------------------------------------------------
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid, isValidating },
    setError,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      id: "",
      description: "",
      // accountability: null,
      // accountable: null,

      department_id_coordinator: null,
      company_id_coordinator: null,
      business_unit_id_coordinator: null,
      unit_id_coordinator: null,
      subunit_id_coordinator: null,
      location_id_coordinator: null,

      department_id: null,
      company_id: null,
      business_unit_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      // account_title_id: null,

      depreciation_debit_id: null,
      remarks: "",
      attachments: null,

      assets: [
        {
          id: null,
          fixed_asset_id: null,
          asset_accountable: "",
          created_at: null,
          company_id: null,
          business_unit_id: null,
          department_id: null,
          unit_id: null,
          sub_unit_id: null,
          location_id: null,
          accountability: null,
          accountable: null,
          receiver_id: null,
          remaining_book_value: null,
        },
      ],
    },
  });

  console.log("errors", errors);
  console.log("isdirty: ", isDirty);
  console.log("💣: ", isValid);

  // console.log("👀", watch("assets"));

  //* Append Table ---------------------------------------------------------------
  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
    rules: { required: true, message: "At least one is required" },
  });
  const handleAppendItem = () =>
    append({
      id: null,
      fixed_asset_id: null,
      asset_accountable: "",
      created_at: null,
      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      sub_unit_id: null,
      location_id: null,
      accountability: null,
      accountable: null,
      receiver_id: null,
      remaining_book_value: null,
    });

  // console.log("watch assets: ", watch("assets[0].fixed_asset_id"));

  //* useEffects() ----------------------------------------------------------------
  useEffect(() => {
    if (isPostError) {
      if (postError?.status === 422) {
        dispatch(
          openToast({
            message: postError?.data?.errors.detail,
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

  useEffect(() => {
    // console.log("data", data);
    if (data) {
      // fixedAssetTrigger();
      reset({
        // id: "",
        description: data?.description,
        // accountability: data?.accountability,
        // accountable: data?.accountable,
        department_id_coordinator: data?.department_from,
        company_id_coordinator: data?.company_from,
        business_unit_id_coordinator: data?.business_unit_from,
        unit_id_coordinator: data?.unit_from,
        subunit_id_coordinator: data?.subunit_from,
        location_id_coordinator: data?.location_from,

        department_id: data?.department,
        company_id: data?.company,
        business_unit_id: data?.business_unit,
        unit_id: data?.unit,
        subunit_id: data?.subunit,
        location_id: data?.location,
        // account_title_id: null,

        depreciation_debit_id: data?.depreciation_debit,

        remarks: data?.remarks || "",
        attachments: data?.attachments,

        assets: data?.assets.map((asset) => ({
          id: asset.id,
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
          remaining_book_value: asset?.remaining_book_value,
        })),
      });

      // const attachmentFormat = data?.attachments === null ? "" : data?.attachments;

      // setValue("description", data?.description);
      // setValue("accountability", data?.accountability);
      // setValue("accountable", data?.accountable);
      // setValue("receiver_id", data?.receiver);
      // setValue("department_id", data?.department);
      // setValue("company_id", data?.company);
      // setValue("business_unit_id", data?.business_unit);
      // setValue("unit_id", data?.unit);
      // setValue("subunit_id", data?.subunit);
      // setValue("location_id", data?.location);
      // // setValue("account_title_id", data?.account_title);
      // setValue("remarks", data?.remarks || "");
      // setValue("attachments", attachmentFormat);
      // setValue(
      //   "assets",
      //   data?.assets.map((asset) => ({
      //     id: asset.id,
      //     // fixed_asset_id: {
      //     //   id: asset?.vladimir_tag_number.id,
      //     //   vladimir_tag_number: asset?.vladimir_tag_number?.vladimir_tag_number,
      //     //   asset_description: asset?.vladimir_tag_number?.asset_description,
      //     // },
      //     fixed_asset_id: asset,
      //     asset_accountable: asset.accountable === "-" ? "Common" : asset.accountable,
      //     created_at: asset.created_at || asset.acquisition_date,
      //     company_id: asset.company?.company_name,
      //     business_unit_id: asset.business_unit?.business_unit_name,
      //     department_id: asset.department?.department_name,
      //     unit_id: asset.unit?.unit_name,
      //     sub_unit_id: asset.subunit?.subunit_name,
      //     location_id: asset.location?.location_name,
      //   }))
      // );
    }
  }, [data, edit]);

  // useEffect(() => {
  //   trigger();
  // }, [trigger]);

  // console.log("asset", watch("asset"));
  // console.log("asset", data?.asset);

  //* Form functions ----------------------------------------------------------------
  const addTransferHandler = (formData) => {
    console.log("formData", formData);
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const updatingCoa = (fields, name) =>
      updateRequest ? formData?.[fields]?.id : formData?.[fields]?.[name]?.id.toString();
    const accountableFormat =
      formData?.accountable === null ? "" : formData?.accountable?.full_id_number_full_name?.toString();

    const data = {
      ...formData,
      department_id: formData?.department_id.id?.toString(),
      company_id: updatingCoa("company_id", "company"),
      business_unit_id: updatingCoa("business_unit_id", "business_unit"),
      unit_id: formData.unit_id.id?.toString(),
      subunit_id: formData.subunit_id.id?.toString(),
      location_id: formData?.location_id.id?.toString(),
      // account_title_id: formData?.account_title_id.id?.toString(),
      // accountability: formData?.accountability?.toString(),
      // accountable: accountableFormat,
      attachments: formData?.attachments,

      depreciation_debit_id: formData?.depreciation_debit_id.sync_id?.toString(),

      assets: formData?.assets?.map((item) => ({
        fixed_asset_id: item.fixed_asset_id.id,
        accountability: item?.accountability?.toString(),
        accountable: item?.accountable?.full_id_number_full_name?.toString() || "",
        receiver_id: item?.receiver_id?.user?.id || item?.receiver_id?.id,
      })),
    };

    console.log("data", data);

    const submitData = () => {
      setIsLoading(true);
      return axios.post(
        `${process.env.VLADIMIR_BASE_URL}/${
          edit || transactionData?.edit ? `transfer-update/${transactionData?.id}` : "transfer"
        }`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // .then((result) => {
      //   console.log("result", result);
      //   dispatch(
      //     openToast({
      //       message: result?.data?.message || result?.data?.message,
      //       duration: 5000,
      //     })
      //   );
      //   setIsLoading(false);
      //   transactionData && reset();
      // })
      // .then(() => {
      //   // isTransferRefetch();
      //   navigate("/asset-movement/transfer");

      //   dispatch(transferApi.util.invalidateTags(["Transfer"]));
      // })
      // .catch((err) => {
      //   console.log("Error submitting form!", err);
      //   if (err?.status === 422) {
      //     dispatch(
      //       openToast({
      //         message: "The given data was invalid.",
      //         duration: 5000,
      //         variant: "error",
      //       })
      //     );
      //   } else if (err?.status !== 422) {
      //     console.error(err);
      //     dispatch(
      //       openToast({
      //         message: "Something went wrong. Please try again.",
      //         duration: 5000,
      //         variant: "error",
      //       })
      //     );
      //   }
      // });
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
              {/* {transactionData?.status === "Returned" ? "RE-SUBMIT" : !edit ? "CREATE" : "UPDATE"} */}
              {transactionData?.status === "Returned"
                ? "RE-SUBMIT"
                : edit || transactionData?.edit
                ? "UPDATE"
                : "CREATE"}
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const test = await submitData();
            // console.log("test", test);
            dispatch(
              openToast({
                message: "Transfer Request Successfully Added",
                duration: 5000,
              })
            );

            setIsLoading(false);
            transactionData && reset();

            navigate("/asset-movement/transfer");
            dispatch(transferApi.util.invalidateTags(["Transfer"]));
          } catch (err) {
            // console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err?.message,
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

  const onSubmitHandler = () => {
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
              {!edit ? "CREATE" : "UPDATE"}
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: () => {
          try {
            dispatch(onLoading());
            submitData();
            dispatch(
              openToast({
                message: "Transfer Request Successfully Added",
                duration: 5000,
              })
            );
          } catch (err) {
            // console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err?.message,
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

  const RemoveFile = ({ title, value }) => {
    return (
      <Tooltip title="Remove attachment" arrow>
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

  const UpdateField = ({ value, label, requiredField }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
          disabled={edit ? false : transactionData?.view}
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
              bgcolor: requiredField && "#f5c9861c",
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

  // const onUpdateHandler = (props) => {
  //   const {
  //     id,
  //     description,
  //     accountability,
  //     accountable,

  //     company,
  //     business_unit,
  //     department,
  //     unit,
  //     subunit,
  //     location,
  //     account_title,

  //     remarks,
  //     attachments,
  //     asset: [{ fixed_asset_id, asset_accountable, created_at }],
  //   } = props;
  //   setUpdateRequest({
  //     id,
  //     description,
  //     accountability,
  //     accountable,

  //     company,
  //     business_unit,
  //     department,
  //     unit,
  //     subunit,
  //     location,
  //     account_title,

  //     remarks,
  //     attachments,
  //     asset: [{ fixed_asset_id, asset_accountable, created_at }],
  //   });
  // };

  // const onUpdateResetHandler = () => {
  //   setUpdateRequest({
  //     description: "",
  //     accountability: null,
  //     accountable: null,

  //     company_id: null,
  //     business_unit_id: null,
  //     department_id: null,
  //     unit_id: null,
  //     subunit_id: null,
  //     location_id: null,
  //     // account_title_id: null,
  //     remarks: "",
  //     attachments: null,

  //     asset: [{ id: null, fixed_asset_id: null, asset_accountable: "", created_at: null }],
  //   });
  // };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  // console.log("user", user);
  const isCoordinator = user?.has_handle === 1;
  const user_id = user.id;
  const subunit_id = watch("subunit_id_coordinator")?.id || null;
  // console.log("user", user);
  console.log("isCoordinator", isCoordinator);
  // console.log("subunit_id", subunit_id);

  return (
    <>
      <Box className="mcontainer">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<ArrowBackIosRounded color="secondary" />}
            onClick={() => {
              navigate(-1);
            }}
            disableRipple
            sx={{ mt: "-5px", "&:hover": { backgroundColor: "transparent" } }}
          >
            Back
          </Button>

          {/* {!transactionData?.view || transactionData.can_edit === 0
            ? null
            : !edit
            ? !transactionData?.approved &&
              !isTransferLoading && (
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
            : !transactionData?.approved && <></>} */}
        </Stack>

        <Box className="request request__wrapper" p={2} component="form" onSubmit={handleSubmit(addTransferHandler)}>
          <Stack>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              {`${
                transactionData?.view
                  ? edit
                    ? "EDIT INFORMATION"
                    : "VIEW INFORMATION"
                  : transactionData?.edit
                  ? "EDIT INFORMATION "
                  : "ADD TRANSFER REQUEST"
              } `}
            </Typography>

            <Stack id="requestForm" className="request__form" gap={2} pb={1}>
              <Stack gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                  REQUEST DETAILS
                </Typography>

                <CustomTextField
                  control={control}
                  name="description"
                  disabled={
                    edit ? false : transactionData?.view
                    // || watch("assets[0].fixed_asset_id") === null
                  }
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
                  disabled={
                    edit ? false : transactionData?.view
                    // || watch("assets[0].fixed_asset_id") === null
                  }
                  label="Remarks (Optional)"
                  optional
                  type="text"
                  error={!!errors?.remarks}
                  helperText={errors?.remarks?.message}
                  fullWidth
                  multiline
                />
              </Stack>

              {isCoordinator && (
                <Stack gap={2}>
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                    TRANSFER FROM
                  </Typography>

                  <CustomAutoComplete
                    autoComplete
                    control={control}
                    name="department_id_coordinator"
                    disabled={edit ? false : transactionData?.view}
                    options={departmentCoordinatorData}
                    onOpen={() =>
                      isDepartmentCoordinatorSuccess
                        ? null
                        : (departmentCoordinatorTrigger({ user_id: user_id }), companyTrigger(), businessUnitTrigger())
                    }
                    loading={isDepartmentCoordinatorLoading}
                    size="small"
                    // clearIcon={null}
                    getOptionLabel={(option) => option.department_code + " - " + option.department_name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Department"
                        error={!!errors?.department_id_coordinator}
                        helperText={errors?.department_id_coordinator?.message}
                      />
                    )}
                    onChange={(_, value) => {
                      // console.log("value: ", value);
                      if (value) {
                        const companyID = companyData?.find((item) => item.sync_id === value.company.company_sync_id);
                        const businessUnitID = businessUnitData?.find(
                          (item) => item.sync_id === value.business_unit.business_unit_sync_id
                        );

                        setValue("company_id_coordinator", companyID);
                        setValue("business_unit_id_coordinator", businessUnitID);
                      } else if (value === null) {
                        setValue("company_id_coordinator", null);
                        setValue("business_unit_id_coordinator", null);
                      }
                      fields.forEach((item, index) => setValue(`assets.${index}.fixed_asset_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.asset_accountable`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.company_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.business_unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.department_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.sub_unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.location_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.created_at`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.remaining_book_value`, null));

                      setValue("unit_id_coordinator", null);
                      setValue("subunit_id_coordinator", null);
                      setValue("location_id_coordinator", null);
                      return value;
                    }}
                  />

                  <CustomAutoComplete
                    name="company_id_coordinator"
                    control={control}
                    options={companyData}
                    loading={isCompanyLoading}
                    size="small"
                    getOptionLabel={(option) => option.company_code + " - " + option.company_name}
                    isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Company"
                        // error={!!errors?.company_id}
                        // helperText={errors?.company_id?.message}
                      />
                    )}
                    disabled
                  />

                  <CustomAutoComplete
                    autoComplete
                    name="business_unit_id_coordinator"
                    control={control}
                    options={businessUnitData}
                    // loading={isBusinessUnitLoading}
                    size="small"
                    getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
                    isOptionEqualToValue={(option, value) => option.business_unit_id === value.business_unit_id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Business Unit"
                        // error={!!errors?.business_unit_id}
                        // helperText={errors?.business_unit_id?.message}
                      />
                    )}
                    disabled
                  />

                  <CustomAutoComplete
                    autoComplete
                    name="unit_id_coordinator"
                    disabled={edit ? false : transactionData?.view}
                    control={control}
                    options={
                      departmentCoordinatorData?.filter((obj) => obj?.id === watch("department_id_coordinator")?.id)[0]
                        ?.unit || []
                    }
                    onOpen={() =>
                      isUnitCoordinatorSuccess
                        ? null
                        : (unitCoordinatorTrigger({ user_id: user_id }),
                          subunitCoordinatorTrigger({ user_id: user_id }),
                          locationTrigger())
                    }
                    // onChange={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
                    loading={isUnitCoordinatorLoading}
                    size="small"
                    getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Unit"
                        error={!!errors?.unit_id_coordinator}
                        helperText={errors?.unit_id_coordinator?.message}
                      />
                    )}
                    onChange={(_, value) => {
                      fields.forEach((item, index) => setValue(`assets.${index}.fixed_asset_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.asset_accountable`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.company_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.business_unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.department_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.sub_unit_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.location_id`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.created_at`, null));
                      fields.forEach((item, index) => setValue(`assets.${index}.remaining_book_value`, null));

                      setValue("subunit_id_coordinator", null);
                      setValue("location_id_coordinator", null);

                      return value;
                    }}
                  />

                  <CustomAutoComplete
                    autoComplete
                    name="subunit_id_coordinator"
                    disabled={edit ? false : transactionData?.view}
                    control={control}
                    options={
                      unitCoordinatorData?.filter((obj) => obj?.id === watch("unit_id_coordinator")?.id)[0]?.subunit ||
                      []
                    }
                    loading={isSubUnitCoordinatorLoading}
                    size="small"
                    getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Sub Unit"
                        error={!!errors?.subunit_id_coordinator}
                        helperText={errors?.subunit_id_coordinator?.message}
                      />
                    )}
                  />

                  <CustomAutoComplete
                    autoComplete
                    name="location_id_coordinator"
                    disabled={edit ? false : transactionData?.view}
                    control={control}
                    options={locationData?.filter((item) => {
                      return item.subunit.some((subunit) => {
                        return subunit?.sync_id === watch("subunit_id_coordinator")?.sync_id;
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
                        error={!!errors?.location_id_coordinator}
                        helperText={errors?.location_id_coordinator?.message}
                      />
                    )}
                  />
                </Stack>
              )}

              <Stack gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                  TRANSFER TO
                </Typography>

                <CustomAutoComplete
                  autoComplete
                  control={control}
                  name="department_id"
                  disabled={edit ? false : transactionData?.view}
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
                      color="secondary"
                      {...params}
                      label="Department"
                      error={!!errors?.department_id}
                      helperText={errors?.department_id?.message}
                    />
                  )}
                  onChange={(_, value) => {
                    console.log("value: ", value);
                    if (value) {
                      const companyID = companyData?.find((item) => item.sync_id === value.company.company_sync_id);
                      const businessUnitID = businessUnitData?.find(
                        (item) => item.sync_id === value.business_unit.business_unit_sync_id
                      );

                      setValue("company_id", companyID);
                      setValue("business_unit_id", businessUnitID);
                    } else if (value === null) {
                      setValue("company_id", null);
                      setValue("business_unit_id", null);
                    }
                    fields.forEach((item, index) => setValue(`assets.${index}.receiver_id`, null));
                    fields.forEach((item, index) => setValue(`assets.${index}.accountable`, null));
                    fields.forEach((item, index) => setValue(`assets.${index}.accountability`, null));
                    setValue("unit_id", null);
                    setValue("subunit_id", null);
                    setValue("location_id", null);
                    setValue("receiver_id", null);
                    return value;
                  }}
                />

                <CustomAutoComplete
                  name="company_id"
                  control={control}
                  options={companyData}
                  onOpen={() => (isCompanySuccess ? null : company())}
                  loading={isCompanyLoading}
                  size="small"
                  getOptionLabel={(option) => option.company_code + " - " + option.company_name}
                  isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Company"
                      // error={!!errors?.company_id}
                      // helperText={errors?.company_id?.message}
                    />
                  )}
                  disabled
                />

                <CustomAutoComplete
                  autoComplete
                  name="business_unit_id"
                  control={control}
                  options={businessUnitData}
                  loading={isBusinessUnitLoading}
                  size="small"
                  getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
                  isOptionEqualToValue={(option, value) => option.business_unit_id === value.business_unit_id}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Business Unit"
                      // error={!!errors?.business_unit_id}
                      // helperText={errors?.business_unit_id?.message}
                    />
                  )}
                  disabled
                />

                <CustomAutoComplete
                  autoComplete
                  name="unit_id"
                  disabled={edit ? false : transactionData?.view}
                  control={control}
                  options={departmentData?.filter((obj) => obj?.id === watch("department_id")?.id)[0]?.unit || []}
                  onOpen={() => (isUnitSuccess ? null : (unitTrigger(), subunitTrigger(), locationTrigger()))}
                  // onChange={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
                  loading={isUnitLoading}
                  size="small"
                  getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Unit"
                      error={!!errors?.unit_id}
                      helperText={errors?.unit_id?.message}
                    />
                  )}
                  onChange={(_, value) => {
                    fields.forEach((item, index) => setValue(`assets.${index}.receiver_id`, null));
                    fields.forEach((item, index) => setValue(`assets.${index}.accountable`, null));
                    fields.forEach((item, index) => setValue(`assets.${index}.accountability`, null));
                    setValue("subunit_id", null);
                    setValue("location_id", null);
                    setValue("receiver_id", null);

                    return value;
                  }}
                />

                <CustomAutoComplete
                  autoComplete
                  name="subunit_id"
                  disabled={edit ? false : transactionData?.view}
                  control={control}
                  options={unitData?.filter((obj) => obj?.id === watch("unit_id")?.id)[0]?.subunit || []}
                  loading={isSubUnitLoading}
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
                  disabled={edit ? false : transactionData?.view}
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
                      name="account_title_id"
                      disabled={edit ? false : transactionData?.view}
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
              </Stack>

              {/* <Stack gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                  TRANSFER TO DETAILS
                </Typography> */}

              {/* <CustomAutoComplete
                  control={control}
                  name="accountability"
                  disabled={
                    edit ? false : transactionData?.view
                    // || watch("assets[0].fixed_asset_id") === null
                  }
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
                    setValue("receiver_id", null);
                    return value;
                  }}
                />

                {watch("accountability") === "Personal Issued" && (
                  <CustomAutoComplete
                    name="accountable"
                    disabled={edit ? false : transactionData?.view}
                    control={control}
                    includeInputInList
                    disablePortal
                    filterOptions={filterOptions}
                    options={userData}
                    onOpen={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
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
                    onChange={(_, newValue) => {
                      // console.log("New Custodian newValue: ", newValue);

                      if (newValue) {
                        setValue("receiver_id", newValue);
                        // setValue("department_id", newValue.department);
                        // setValue("company_id", newValue.company);
                        // setValue("business_unit_id", newValue.business_unit);
                        // setValue("unit_id", newValue.unit);
                        // setValue("subunit_id", newValue.subunit);
                        // setValue("location_id", newValue.location);
                        // setValue("accountable", newValue);
                      } else if (value === null) {
                        setValue("receiver_id", null);
                        // setValue("accountable", null);
                      }
                      return newValue;
                    }}
                  />
                )}

                <CustomAutoComplete
                  name="receiver_id"
                  disabled={
                    edit ? false : transactionData?.view || watch("accountability") === "Personal Issued"
                    //  ||
                    // watch("assets[0].fixed_asset_id") === null
                  }
                  control={control}
                  includeInputInList
                  disablePortal
                  filterOptions={filterOptions}
                  options={userData}
                  onOpen={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
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
                  // onChange={(_, newValue) => {
                  //   // console.log("Receiver newValue: ", newValue);
                  //   if (newValue) {
                  //     setValue("receiver_id", newValue);
                  //     setValue("department_id", newValue.department);
                  //     setValue("company_id", newValue.company);
                  //     setValue("business_unit_id", newValue.business_unit);
                  //     setValue("unit_id", newValue.unit);
                  //     setValue("subunit_id", newValue.subunit);
                  //     setValue("location_id", newValue.location);
                  //     // setValue("accountable", newValue);
                  //   }
                  //   return newValue;
                  // }}
                /> */}
              {/* </Stack> */}

              {/* {console.log(watch("receiver_id"))} */}

              <Stack gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                  ACCOUNTING ENTRIES
                </Typography>

                <CustomAutoComplete
                  autoComplete
                  name="depreciation_debit_id"
                  disabled={edit ? false : transactionData?.view}
                  control={control}
                  options={accountTitleData}
                  loading={isAccountTitleLoading}
                  onOpen={() => (isAccountTitleSuccess ? null : accountTitleTrigger())}
                  size="small"
                  getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                  isOptionEqualToValue={(option, value) => option.account_title_code === value.account_title_code}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Depreciation Debit"
                      error={!!errors?.depreciation_debit_id}
                      helperText={errors?.depreciation_debit_id?.message}
                    />
                  )}
                />
              </Stack>

              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                ATTACHMENTS
              </Typography>

              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("attachments") !== null ? (
                  <UpdateField label={"Evaluation Form"} value={watch("attachments")?.length} requiredField />
                ) : (
                  <CustomMultipleAttachment
                    control={control}
                    name="attachments"
                    disabled={
                      edit ? false : transactionData?.view
                      // || watch("assets[0].fixed_asset_id") === null
                    }
                    label="Evaluation Form"
                    inputRef={AttachmentRef}
                    error={!!errors?.attachments?.message}
                    helperText={errors?.attachments?.message}
                    requiredField
                  />
                )}

                {watch("attachments") !== null && (!transactionData?.view || edit) && (
                  <RemoveFile title="Evaluation Form" value="attachments" />
                )}
              </Stack>
              <Box mt="-13px" ml="10px">
                {watch("attachments")
                  ? watch("attachments").map((item, index) => (
                      <Typography fontSize="12px" fontWeight="bold" key={index}>
                        {item.name}
                      </Typography>
                    ))
                  : null}
              </Box>
            </Stack>
          </Stack>

          {/* TABLE */}
          <Box className="request__table">
            <TableContainer className="request__th-body  request__wrapper" sx={{ height: "calc(100vh - 280px)" }}>
              <Table className="request__table " stickyHeader>
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
                    <TableCell className="tbl-cell">Transfer To Details</TableCell>
                    <TableCell className="tbl-cell">Accountability</TableCell>
                    <TableCell className="tbl-cell">Chart Of Accounts</TableCell>
                    <TableCell className="tbl-cell">Remaining Book Value</TableCell>
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
                      <TableRow key={item.id} id="appendedRow" className={`rowItem ${item.id ? "animateRow" : ""}`}>
                        <TableCell sx={{ pl: "30px" }} className="tbl-cell">
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
                          {isCoordinator ? (
                            <Controller
                              control={control}
                              name={`assets.${index}.fixed_asset_id`}
                              render={({ field: { ref, value, onChange } }) => (
                                <Autocomplete
                                  options={
                                    isVTagNumberCoordinatorLoading || isVTagNumberCoordinatorFetching
                                      ? []
                                      : vTagNumberCoordinatorData
                                  }
                                  onOpen={() => fixedAssetCoordinatorTrigger({ subunit_id: subunit_id })}
                                  loading={isVTagNumberCoordinatorLoading || isVTagNumberCoordinatorFetching}
                                  disabled={
                                    edit ? false : transactionData?.view || watch("location_id_coordinator") === null
                                  }
                                  size="small"
                                  value={value}
                                  filterOptions={filterOptions}
                                  getOptionLabel={(option) =>
                                    `(${option.vladimir_tag_number}) - ${option.asset_description}`
                                  }
                                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                  renderInput={(params) => (
                                    <TextField
                                      required
                                      color="secondary"
                                      {...params}
                                      label="Tag Number"
                                      multiline
                                      maxRows={3}
                                      sx={{
                                        "& .MuiInputBase-inputMultiline": {
                                          minHeight: "10px",
                                        },
                                      }}
                                    />
                                  )}
                                  getOptionDisabled={
                                    (option) => !!fields.find((item) => item?.fixed_asset_id?.id === option.id)
                                    // ||
                                    // option.transfer === 1
                                  }
                                  onChange={(_, newValue) => {
                                    if (newValue) {
                                      // onChange(newValue);
                                      console.log("newValue: ", newValue);
                                      onChange(newValue);
                                      setValue(
                                        `assets.${index}.asset_accountable`,
                                        newValue.accountable === "-" ? "Common" : newValue.accountable
                                      );
                                      setValue(`assets.${index}.id`, newValue.id);
                                      setValue(`assets.${index}.created_at`, newValue.created_at);
                                      setValue(`assets.${index}.company_id`, newValue.company?.company_name);
                                      setValue(
                                        `assets.${index}.business_unit_id`,
                                        newValue.business_unit?.business_unit_name
                                      );
                                      setValue(`assets.${index}.department_id`, newValue.department?.department_name);
                                      setValue(`assets.${index}.unit_id`, newValue.unit?.unit_name);
                                      setValue(`assets.${index}.sub_unit_id`, newValue.subunit?.subunit_name);
                                      setValue(`assets.${index}.location_id`, newValue.location?.location_name);
                                      setValue(`assets.${index}.remaining_book_value`, newValue.remaining_book_value);
                                    } else {
                                      onChange(null);
                                      setValue(`assets.${index}.asset_accountable`, "");
                                      setValue(`assets.${index}.created_at`, null);
                                    }

                                    return newValue;
                                  }}
                                  sx={{
                                    ".MuiInputBase-root": {
                                      borderRadius: "10px",
                                      minHeight: "63px",
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
                                    "& .MuiFormLabel-root": {
                                      lineHeight: "43px", // Adjust based on the height of the input
                                    },
                                    "& .Mui-focused": {
                                      top: "-10%", // Center vertically
                                    },
                                    "& .MuiFormLabel-filled": {
                                      top: "-10%", // Center vertically
                                    },
                                    ml: "-15px",
                                    minWidth: "230px",
                                    maxWidth: "550px",
                                  }}
                                />
                              )}
                            />
                          ) : (
                            <Controller
                              control={control}
                              name={`assets.${index}.fixed_asset_id`}
                              render={({ field: { ref, value, onChange } }) => (
                                <Autocomplete
                                  options={vTagNumberData}
                                  onOpen={() => (isVTagNumberSuccess ? null : fixedAssetTrigger())}
                                  loading={isVTagNumberLoading}
                                  disabled={edit ? false : transactionData?.view}
                                  size="small"
                                  value={value}
                                  filterOptions={filterOptions}
                                  getOptionLabel={(option) =>
                                    `(${option.vladimir_tag_number}) - ${option.asset_description}`
                                  }
                                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                  renderInput={(params) => (
                                    <TextField
                                      required
                                      color="secondary"
                                      {...params}
                                      label="Tag Number"
                                      multiline
                                      maxRows={3}
                                      sx={{
                                        "& .MuiInputBase-inputMultiline": {
                                          minHeight: "10px",
                                        },
                                      }}
                                    />
                                  )}
                                  getOptionDisabled={
                                    (option) => !!fields.find((item) => item?.fixed_asset_id?.id === option.id)
                                    // ||
                                    // option.transfer === 1
                                  }
                                  onChange={(_, newValue) => {
                                    if (newValue) {
                                      // onChange(newValue);
                                      // console.log("newValue: ", newValue);
                                      onChange(newValue);
                                      setValue(
                                        `assets.${index}.asset_accountable`,
                                        newValue.accountable === "-" ? "Common" : newValue.accountable
                                      );
                                      setValue(`assets.${index}.id`, newValue.id);
                                      setValue(`assets.${index}.created_at`, newValue.created_at);
                                      setValue(`assets.${index}.company_id`, newValue.company?.company_name);
                                      setValue(
                                        `assets.${index}.business_unit_id`,
                                        newValue.business_unit?.business_unit_name
                                      );
                                      setValue(`assets.${index}.department_id`, newValue.department?.department_name);
                                      setValue(`assets.${index}.unit_id`, newValue.unit?.unit_name);
                                      setValue(`assets.${index}.sub_unit_id`, newValue.subunit?.subunit_name);
                                      setValue(`assets.${index}.location_id`, newValue.location?.location_name);
                                      setValue(`assets.${index}.remaining_book_value`, newValue.remaining_book_value);
                                    } else {
                                      onChange(null);
                                      setValue(`assets.${index}.asset_accountable`, "");
                                      setValue(`assets.${index}.remaining_book_value`, "");
                                      setValue(`assets.${index}.created_at`, null);
                                      setValue(`assets.${index}.company_id`, "");
                                      setValue(`assets.${index}.business_unit_id`, "");
                                      setValue(`assets.${index}.department_id`, "");
                                      setValue(`assets.${index}.unit_id`, "");
                                      setValue(`assets.${index}.sub_unit_id`, "");
                                      setValue(`assets.${index}.location_id`, "");
                                    }

                                    return newValue;
                                  }}
                                  sx={{
                                    ".MuiInputBase-root": {
                                      borderRadius: "10px",
                                      minHeight: "63px",
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
                                    "& .MuiFormLabel-root": {
                                      lineHeight: "43px", // Adjust based on the height of the input
                                    },
                                    "& .Mui-focused": {
                                      top: "-10%", // Center vertically
                                    },
                                    "& .MuiFormLabel-filled": {
                                      top: "-10%", // Center vertically
                                    },
                                    ml: "-15px",
                                    minWidth: "230px",
                                    maxWidth: "550px",
                                  }}
                                />
                              )}
                            />
                          )}
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack flexDirection="row" gap={2}>
                            <Controller
                              control={control}
                              name={`assets.${index}.accountability`}
                              render={({ field: { ref, value, onChange } }) => (
                                <Autocomplete
                                  options={["Personal Issued", "Common"]}
                                  disabled={
                                    edit
                                      ? false
                                      : transactionData?.view ||
                                        // watch(`assets.${index}.fixed_asset_id`) === null ||
                                        watch("location_id") === null
                                  }
                                  size="small"
                                  value={value}
                                  renderInput={(params) => (
                                    <TextField
                                      required
                                      color="secondary"
                                      {...params}
                                      multiline
                                      label="Accountability"
                                      // minRows={2}
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

                            {/* <CustomAutoComplete
                              control={control}
                              name="accountability"
                              disabled={
                                edit ? false : transactionData?.view
                                // || watch("assets[0].fixed_asset_id") === null
                              }
                              options={["Personal Issued", "Common"]}
                              isOptionEqualToValue={(option, value) => option === value}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  color="secondary"
                                  label="Accountability"
                                  error={!!errors?.accountability}
                                  helperText={errors?.accountability?.message}
                                />
                              )}
                              onChange={(_, value) => {
                                setValue("accountable", null);
                                setValue("receiver_id", null);
                                return value;
                              }}
                            /> */}

                            {watch(`assets.${index}.accountability`) === "Personal Issued" && (
                              <Controller
                                control={control}
                                name={`assets.${index}.accountable`}
                                render={({ field: { ref, value, onChange } }) => (
                                  <Autocomplete
                                    size="small"
                                    value={value}
                                    options={userData}
                                    disabled={
                                      edit
                                        ? false
                                        : transactionData?.view ||
                                          // watch(`assets.${index}.fixed_asset_id`) === null ||
                                          watch("location_id") === null
                                    }
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
                                        maxRows={2}
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
                                          minWidth: "220px",
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
                                      minWidth: "220px",
                                      maxWidth: "550px",
                                    }}
                                  />
                                )}
                              />
                            )}

                            {console.log("receiver_iddddd", watch(`assets.${index}.receiver_id`))}

                            {watch(`assets.${index}.accountability`) === "Common" ? (
                              <Controller
                                control={control}
                                name={`assets.${index}.receiver_id`}
                                filterOptions={filterOptions}
                                render={({ field: { ref, value, onChange } }) => (
                                  <Autocomplete
                                    size="small"
                                    value={value}
                                    options={receiverData}
                                    disabled={
                                      edit
                                        ? false
                                        : watch(`assets.${index}.accountability`) === "Personal Issued" ||
                                          // watch(`assets.${index}.fixed_asset_id`) === null ||
                                          watch("location_id") === null ||
                                          transactionData?.view
                                    }
                                    onOpen={() => receiverAccountTrigger({ department: watch("department_id")?.id })}
                                    loading={isReceiverLoading}
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
                                          // ml: "8px",
                                          minWidth: "220px",
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
                                      minWidth: "230px",
                                      maxWidth: "550px",
                                    }}
                                  />
                                )}
                              />
                            ) : (
                              <Controller
                                control={control}
                                name={`assets.${index}.receiver_id`}
                                filterOptions={filterOptions}
                                render={({ field: { ref, value, onChange } }) => (
                                  <Autocomplete
                                    size="small"
                                    value={value}
                                    options={userData}
                                    disabled={
                                      edit
                                        ? false
                                        : watch(`assets.${index}.accountability`) === "Personal Issued" ||
                                          watch(`assets.${index}.accountability`) === null ||
                                          watch(`assets.${index}.fixed_asset_id`) === null ||
                                          watch("location_id") === null ||
                                          transactionData?.view
                                    }
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
                                          // ml: "8px",
                                          minWidth: "220px",
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
                                      minWidth: "230px",
                                      maxWidth: "550px",
                                    }}
                                  />
                                )}
                              />
                            )}

                            {/* <CustomAutoComplete
                              name={`assets.${index}.receiver_id`}
                              disabled={
                                edit ? false : transactionData?.view || watch("accountability") === "Personal Issued"
                                //  ||
                                // watch("assets[0].fixed_asset_id") === null
                              }
                              control={control}
                              includeInputInList
                              disablePortal
                              filterOptions={filterOptions}
                              options={userData}
                              onOpen={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
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
                              // onChange={(_, newValue) => {
                              //   // console.log("Receiver newValue: ", newValue);
                              //   if (newValue) {
                              //     setValue("receiver_id", newValue);
                              //     setValue("department_id", newValue.department);
                              //     setValue("company_id", newValue.company);
                              //     setValue("business_unit_id", newValue.business_unit);
                              //     setValue("unit_id", newValue.unit);
                              //     setValue("subunit_id", newValue.subunit);
                              //     setValue("location_id", newValue.location);
                              //     // setValue("accountable", newValue);
                              //   }
                              //   return newValue;
                              // }}
                            /> */}
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
                                // textAlign: "center",
                              },

                              ml: "-15px",
                              minWidth: "150px",
                            }}
                            inputProps={{ color: "red" }}
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
                            {...register(`assets.${index}.remaining_book_value`)}
                            variant="outlined"
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography sx={{ color: "gray", mt: "2px" }}>₱</Typography>
                                </InputAdornment>
                              ),
                            }}
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
                              },

                              "& .Mui-disabled": {
                                color: "red",
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.created_at`)}
                            variant="outlined"
                            disabled
                            // type="date"
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",
                              ml: "-11px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                              },
                              "& .Mui-disabled": {
                                color: "red",
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" className="tbl-cell">
                          <IconButton
                            onClick={() => remove(index)}
                            disabled={edit ? false : fields.length === 1 || transactionData?.view}
                          >
                            <Tooltip title="Delete Row" placement="top" arrow>
                              <RemoveCircle
                                color={
                                  fields.length === 1 || transactionData?.view ? (edit ? "warning" : "gray") : "warning"
                                }
                              />
                            </Tooltip>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  <TableRow>
                    <TableCell colSpan={99}>
                      <Stack flexDirection="row" gap={2}>
                        {!isTransferLoading && !isTransferFetching && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => handleAppendItem()}
                            disabled={
                              watch(`assets`).some((item) => item?.fixed_asset_id === null)
                                ? true
                                : edit
                                ? false
                                : transactionData?.view
                            }
                          >
                            Add Row
                          </Button>
                        )}
                        {/* <Button
                            variant="contained"
                            size="small"
                            color="warning"
                            startIcon={<Delete />}
                            onClick={() => reset()}
                          >
                            Remove All
                          </Button> */}
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Buttons */}
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
              <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main" pt="10px">
                Added: {fields.length} Asset{fields.length >= 2 ? "s" : null}
              </Typography>
              <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
                {(!transactionData?.view || edit) && (
                  <>
                    {edit && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        // startIcon={<Cancel color="secondary" />}
                        onClick={() => setEdit(false)}
                        sx={{ color: "secondary.main", mt: "10px" }}
                      >
                        Cancel
                      </Button>
                    )}
                    <LoadingButton
                      // onClick={onSubmitHandler}
                      type="submit"
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<Create color={"primary"} />}
                      loading={isPostLoading || isUpdateLoading}
                      disabled={!isValid || !isDirty}
                      sx={{ mt: "10px" }}
                    >
                      {transactionData?.status === "Returned"
                        ? "Resubmit"
                        : edit || transactionData?.edit
                        ? "Update"
                        : "Create"}
                    </LoadingButton>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddTransfer;
