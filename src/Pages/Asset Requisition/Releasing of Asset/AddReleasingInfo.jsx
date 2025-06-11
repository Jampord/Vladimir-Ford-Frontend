import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
} from "@mui/material";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import SignatureCanvas from "react-signature-canvas";

import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetSedarUsersApiQuery } from "../../../Redux/Query/SedarUserApi";
import { LoadingButton } from "@mui/lab";
import {
  closeDialog,
  closeDialog1,
  closeDialog2,
  closeDialog3,
  closeDialog4,
  closeDialog5,
  openDialog1,
  openDialog2,
  openDialog3,
  openDialog4,
  openDialog5,
} from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch, useSelector } from "react-redux";
import { usePutAssetReleasingMutation, usePutSaveReleasingMutation } from "../../../Redux/Query/Request/AssetReleasing";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { Info, Refresh, Remove, Save } from "@mui/icons-material";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { notificationApi } from "../../../Redux/Query/Notification";
import { useLazyGetCompanyAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetBusinessUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import { useLazyGetDepartmentAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import { useLazyGetUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Unit";
import { useLazyGetSubUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import { useLazyGetLocationAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Location";
import { useLazyGetAccountTitleAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import CustomImgAttachment from "../../../Components/Reusable/CustomImgAttachment";
import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import CustomWebcam from "../../../Components/Reusable/CustomWebcam";
import AttachmentIcon from "../../../Img/SVG/Attachment.svg";
import AttachmentError from "../../../Img/SVG/AttachmentError.svg";
import Webcam from "react-webcam";
import WebCamSVG from "../../../Img/SVG/WebCam.svg";
import uploadSVG from "../../../Img/SVG/upload.svg";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";

const schema = yup.object().shape({
  one_charging_id: yup.object().required().label("One Charging").typeError("One Charging is a required field"),
  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
  // account_title_id: yup.object().required().label("Account Title").typeError("Account Title is a required field"),
  // accountability: yup.string().required().typeError("Accountability is a required field"),
  // accountable: yup
  //   .object()
  //   .nullable()
  //   .when("accountability", {
  //     is: (value) => value === "Personal Issued",
  //     then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
  //   }),
  received_by: yup.object().required().typeError("Received By is a required field"),

  receiver_img: yup.mixed().required().label("Receiver Image").typeError("Receiver Image is a required field"),
  // assignment_memo_img: yup
  //   .mixed()
  //   .nullable()
  //   .label("Assignment Memo")
  //   .typeError("Assignment Memo is a required field")
  //   .when("accountability", {
  //     is: (value) => value === "Personal Issued",
  //     then: (yup) => yup.label("Accountable").required().typeError("Assignment Memo is a required field"),
  //   }),
  authorization_memo_img: yup.mixed().nullable().label("Authorization Letter"),
  // .typeError("Authorization Letter is a required field")
  // .when("accountability", {
  //   is: (value) => value === "Personal Issued",
  //   then: (yup) => yup.label("Accountable").required().typeError("Authorization Letter is a required field"),
  // }),
});

const schemaSave = yup.object().shape({
  accountability: yup.string().required().typeError("Accountability is a required field"),
  accountable: yup
    .object()
    .nullable()
    .when("accountability", {
      is: (value) => value === "Personal Issued",
      then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
    }),
});

const AddReleasingInfo = (props) => {
  const { data, refetch, warehouseNumber, hideWN, commonData, personalData, selectedItems } = props;
  // console.log("data", data);
  console.log("selectedItems", selectedItems);
  const userData = JSON.parse(localStorage.getItem("user"));
  // console.log("userData", userData);
  const [signature, setSignature] = useState();
  const [trimmedDataURL, setTrimmedDataURL] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [currentSchema, setCurrentSchema] = useState(schema);
  const [capturedImage, setCapturedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [webcamError, setWebcamError] = useState(false);
  const [capturedImageAuthorization, setCapturedImageAuthorization] = useState(null);
  const [fileAuthorization, setFileAuthorization] = useState(null);
  const [webcamErrorAuthorization, setWebcamErrorAuthorization] = useState(false);

  // console.log("file", file);
  // console.log("fileAuthorization", fileAuthorization);
  // console.log("capturedImage", capturedImage);

  const signatureRef = useRef();
  const receiverMemoRef = useRef(null);
  const assignmentMemoRef = useRef(null);
  const authorizationLetterRef = useRef(null);

  const dialog = useSelector((state) => state.booleanState?.dialogMultiple?.dialog1);
  const dialog2 = useSelector((state) => state.booleanState?.dialogMultiple?.dialog2);
  const dialog3 = useSelector((state) => state.booleanState?.dialogMultiple?.dialog3);
  const dialog4 = useSelector((state) => state.booleanState?.dialogMultiple?.dialog4);
  const dialog5 = useSelector((state) => state.booleanState?.dialogMultiple?.dialog5);

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
    resolver: yupResolver(currentSchema),
    defaultValues: {
      warehouse_number_id: warehouseNumber?.warehouse_number_id,
      one_charging_id: selectedItems?.one_charging || null,
      department_id: selectedItems?.department || null,
      company_id: selectedItems?.company || null,
      business_unit_id: selectedItems?.business_unit || null,
      unit_id: selectedItems?.unit || null,
      subunit_id: selectedItems?.subunit || null,
      location_id: selectedItems?.location || null,
      // account_title_id: null,
      accountability: null,
      accountable: null,
      received_by: null,

      // Attachments
      receiver_img: null,
      // assignment_memo_img: null,
      authorization_memo_img: null,
    },
  });

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

  const dispatch = useDispatch();

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
  ] = usePutAssetReleasingMutation();

  const [
    saveData,
    { data: savedData, isSuccess: isSavedSuccess, isLoading: isSavedLoading, isError: isSavedError, error: savedError },
  ] = usePutSaveReleasingMutation();

  useEffect(() => {
    const errorData = isPostError && postError?.status === 422;

    if (errorData) {
      const errors = postError?.data?.errors || {};
      Object.entries(errors).forEach(([name, [message]]) => setError(name, { type: "validate", message }));
    }

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
  }, [isPostError]);

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      handleCloseDialog();
      // refetch();
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (!departmentData || departmentData.length === 0) {
      departmentTrigger();
    }
    if (!companyData || companyData.length === 0) {
      companyTrigger();
    }
    if (!businessUnitData || businessUnitData.length === 0) {
      businessUnitTrigger();
    }
    if (!unitData || unitData.length === 0) {
      unitTrigger();
    }
    if (!subUnitData || subUnitData.length === 0) {
      subunitTrigger();
    }
    if (!locationData || locationData.length === 0) {
      locationTrigger();
    }
  }, [departmentData, companyData, businessUnitData, unitData, subUnitData, locationData]);

  // useEffect(() => {
  //   console.log("useeffectitems", selectedItems.department);
  //   setValue("department_id", selectedItems.department);
  //   setValue("company_id", selectedItems.company);
  //   setValue("business_unit_id", selectedItems.business_unit);
  //   setValue("unit_id", selectedItems.unit);
  //   setValue("subunit_id", selectedItems.subunit);
  //   setValue("location_id", selectedItems.location);
  // }, [selectedItems]);

  const handleCloseDialog = () => {
    dispatch(closeDialog());
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

  const warehouseNumberData =
    data
      ?.filter((item) => warehouseNumber?.warehouse_number_id?.includes(item?.warehouse_number?.warehouse_number))
      ?.map((data) => data?.warehouse_number?.id) || [];

  // console.log(warehouseNumberData);

  const onSubmitHandler = async (formData) => {
    console.log({ formData });
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
    const receiverImgBase64 = formData?.receiver_img?.includes("base64") ? capturedImage : await fileToBase64(file);
    const assignmentMemoImgBase64 = formData?.assignment_memo_img && (await fileToBase64(formData.assignment_memo_img));
    const authorizationLetterImgBase64 = formData?.authorization_memo_img?.includes("base64")
      ? capturedImageAuthorization
      : fileAuthorization !== null && (await fileToBase64(fileAuthorization));

    const saveFormData = {
      warehouse_number_id: warehouseNumberData,
      accountability: formData.accountability,
      accountable: formData?.accountable?.general_info?.full_id_number_full_name?.toString(),
    };

    const newFormData = {
      ...formData,
      warehouse_number_id: warehouseNumberData,
      // department_id: handleSaveValidation() ? null : formData?.department_id?.id?.toString(),
      one_charging_id: formData?.one_charging_id?.id?.toString(),
      department_id: formData?.department_id?.department_id?.toString(),
      // company_id: handleSaveValidation() ? null : formData.company_id?.id?.toString(),
      company_id: formData.company_id?.company_id?.toString(),
      // business_unit_id: handleSaveValidation() ? null : formData.business_unit_id?.id?.toString(),
      business_unit_id: formData.business_unit_id?.business_unit_id?.toString(),
      // unit_id: handleSaveValidation() ? null : formData.unit_id?.id?.toString(),
      unit_id: formData.unit_id?.unit_id?.toString(),
      // subunit_id: handleSaveValidation() ? null : formData.subunit_id?.id?.toString(),
      subunit_id: formData.subunit_id?.subunit_id?.toString(),
      // location_id: handleSaveValidation() ? null : formData?.location_id?.id?.toString(),
      location_id: formData?.location_id?.location_id?.toString(),
      // account_title_id: formData?.account_title_id.id?.toString(),
      accountable: formData?.accountable?.general_info?.full_id_number_full_name?.toString(),
      received_by: formData?.received_by?.general_info?.full_id_number_full_name?.toString(),
      // signature: signature,
      receiver_img: receiverImgBase64,
      assignment_memo_img: assignmentMemoImgBase64,
      authorization_memo_img: authorizationLetterImgBase64,
    };

    console.log("newFormData", newFormData);

    dispatch(
      openConfirm({
        icon: Info,
        iconColor: "info",
        message: (
          // <Box>
          //   <Typography> Are you sure you want to</Typography>
          //   <Typography
          //     sx={{
          //       display: "inline-block",
          //       color: "secondary.main",
          //       fontWeight: "bold",
          //     }}
          //   >
          //     {handleSaveValidation() ? "SAVE" : "RELEASE"}
          //   </Typography>{" "}
          //   this {handleSaveValidation() ? "data" : "item"}?
          // </Box>
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
            {/* this {handleSaveValidation() ? "data" : "item"}? */}
            this {"item"}?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result =
              // handleSaveValidation()
              //   ? await saveData(saveFormData).unwrap()
              //   :
              await releaseItems(newFormData).unwrap();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            // dispatch(notificationApi.util.resetApiState());
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            dispatch(closeConfirm());
            dispatch(closeDialog());
          } catch (err) {
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data?.errors?.signature[0] || err.data.message,
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

  // const isCanvasEmpty = () => {
  //   const canvas = signatureRef.current.getCanvas();
  //   const ctx = canvas.getContext("2d", { willReadFrequently: true });
  //   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  //   const isEmpty = !imageData.some((alpha) => alpha !== 0);
  //   return isEmpty;
  // };

  // const handleSaveSignature = () => {
  //   const signatureDataURL = signatureRef.current.toDataURL();
  //   !isCanvasEmpty()
  //     ? (setSignature(signatureDataURL),
  //       setTrimmedDataURL(signatureRef.current.getTrimmedCanvas().toDataURL("image/png"), { willReadFrequently: true }),
  //       handleCloseSignature())
  //     : null;
  // };

  // const handleClearSignature = () => {
  //   signatureRef.current.clear();
  // };

  // Images

  const handleCloseSignature = () => {
    dispatch(closeDialog1());
  };

  const UpdateField = ({ value, label, watch, requiredField }) => {
    const handleViewImage = () => {
      const url = URL.createObjectURL(watch);
      // console.log("Object URL created:", url);
      setViewImage(url);
      dispatch(openDialog1());
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
            value === "receiver_img" && setCapturedImage(null);
            value === "receiver_img" && setFile(null);
            value === "authorization_memo_img" && setCapturedImageAuthorization(null);
            value === "authorization_memo_img" && setFileAuthorization(null);
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

  const handleCloseView = () => {
    dispatch(closeDialog1());
  };

  // const handleSaveValidation = () => {
  //   return !(
  //     commonData === (watch("accountability") === "Common") ||
  //     personalData === (watch("accountability") === "Personal Issued")
  //   );
  // };

  useEffect(() => {
    setCurrentSchema(
      // handleSaveValidation() ? schemaSave :
      schema
    );
  }, [watch("accountability")]);

  useEffect(() => {
    reset({}, { keepDefaultValues: true, resolver: yupResolver(currentSchema) });
  }, [currentSchema, reset]);

  useEffect(() => {
    if (!!capturedImage) {
      setValue("receiver_img", capturedImage);
      trigger("receiver_img");
    }
  }, [capturedImage, watch("receiver_img")]);

  useEffect(() => {
    if (!!file) {
      setValue("receiver_img", file?.name);
      trigger("receiver_img");
    }
  }, [file, watch("receiver_img")]);

  useEffect(() => {
    if (!!capturedImageAuthorization) {
      setValue("authorization_memo_img", capturedImageAuthorization);
    }
  }, [capturedImageAuthorization, watch("authorization_memo_img")]);

  useEffect(() => {
    if (!!fileAuthorization) {
      setValue("authorization_memo_img", fileAuthorization?.name);
    }
  }, [fileAuthorization, watch("authorization_memo_img")]);

  // useEffect(() => {
  //   if (!!watch("department_id")) {
  //     trigger("department_id");
  //   }
  // }, [watch("department_id")]);

  const handleOpenFileSelection = () => {
    dispatch(openDialog2());
  };

  const handleOpenFileSelectionAuthorization = () => {
    dispatch(openDialog4());
  };

  const handleCamClose = () => {
    dispatch(closeDialog2());
    dispatch(closeDialog3());
    setCapturedImage(null);
  };

  const handleCamCloseAuthorization = () => {
    dispatch(closeDialog4());
    dispatch(closeDialog5());
    setCapturedImageAuthorization(null);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    // Handle the uploaded files here
    // console.log("Selected files:", files[0]);
    setFile(files[0]);
    dispatch(closeDialog2());
  };

  const handleFileChangeAuthorization = (event) => {
    const files = event.target.files;
    // console.log("Selected files:", files[0]);
    setFileAuthorization(files[0]);
    dispatch(closeDialog4());
  };

  // console.log("dept", watch("department_id"));
  // console.log("company", watch("company_id"));
  // console.log("business", watch("business_unit_id"));
  // console.log("unit", watch("unit_id"));
  // console.log("subunit", watch("subunit_id"));
  // console.log("location", watch("location_id"));

  const areAllCOASame = (assets) => {
    console.log("assets", assets);
    if (assets) {
      if (assets?.length === 0) return true; // No assets to compare

      const firstDepartment = assets?.department?.department_name;
      const firstBusinessUnit = assets?.business_unit?.business_unit_name;
      const firstCompany = assets?.company?.company_name;
      const firstUnit = assets?.unit?.unit_name;
      const firstSubunit = assets?.subunit?.subunit_name;
      const firstLocation = assets?.location?.location_name;

      if (watch("department_id")?.department_name !== firstDepartment) {
        return false; // Found a different department
      }
      // if (watch("company_id")?.company_name !== firstCompany) {
      //   return false; // Found a different business unit
      // }
      // if (watch("business_unit_id")?.business_unit_name !== firstBusinessUnit) {
      //   return false; // Found a different company
      // }
      // if (watch("unit_id")?.unit_name !== firstUnit) {
      //   return false; // Found a different unit
      // }
      // if (watch("subunit_id")?.subunit_name !== firstSubunit) {
      //   return false; // Found a different subunit
      // }
      // if (watch("location_id")?.location_name !== firstLocation) {
      //   return false; // Found a different location
      // }

      return true; // All COA are the same
    }
  };

  const result = areAllCOASame(selectedItems);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} gap={1} px={3} overflow="auto">
      <Typography
        className="mcontainer__title"
        color="secondary.main"
        sx={{ fontFamily: "Anton", fontSize: "1.6rem", textAlign: "center", mb: "5px" }}
      >
        Releasing
      </Typography>

      <Divider sx={{ mb: "20px" }} />

      <Stack gap={2} pb={3}>
        {!hideWN && <Typography sx={sxSubtitle}>Warehouse Number</Typography>}
        {warehouseNumber && (
          <Autocomplete
            {...register}
            readOnly
            required
            multiple
            name="warehouse_number_id"
            options={warehouseNumber?.warehouse_number_id}
            value={warehouseNumber?.warehouse_number_id}
            size="small"
            renderInput={(params) => (
              <TextField
                label={watch("warehouse_number_id") !== null ? "Warehouse Number" : "No Data"}
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
        )}
      </Stack>

      <Stack flexDirection="row" justifyContent="center" gap={4} overflow="auto">
        <Stack gap={2} width="220px">
          <Box sx={BoxStyle}>
            <Typography sx={sxSubtitle}>Accountability</Typography>
            {/* <CustomAutoComplete
              autoComplete
              name="accountability"
              control={control}
              options={["Personal Issued", "Common"]}
              size="small"
              isOptionEqualToValue={(option, value) => option === value}
              onChange={(_, value) => {
                reset({
                  department_id: null,
                  company_id: null,
                  business_unit_id: null,
                  unit_id: null,
                  subunit_id: null,
                  location_id: null,
                  // account_title_id: null,
                  accountability: value,
                  accountable: null,
                  received_by: null,

                  // Attachments
                  receiver_img: null,
                  assignment_memo_img: null,
                  authorization_memo_img: null,
                });
              }}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Accountability  "
                  error={!!errors?.accountability}
                  helperText={errors?.accountability?.message}
                />
              )}
            />

            {watch("accountability") === "Personal Issued" && (
              <CustomAutoComplete
                name="accountable"
                control={control}
                size="small"
                includeInputInList
                filterOptions={filterOptions}
                options={sedarData}
                loading={isSedarLoading}
                getOptionLabel={(option) => option.general_info?.full_id_number_full_name}
                isOptionEqualToValue={(option, value) =>
                  option.general_info?.full_id_number === value.general_info?.full_id_number
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Accountable"
                    color="secondary"
                    error={!!errors?.accountable?.message}
                    helperText={errors?.accountable?.message}
                  />
                )}
              />
            )} */}

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

            {/* Signature */}
            {/* {trimmedDataURL ? (
                <Box
                  sx={{ display: "grid", placeContent: "center", border: "1px solid gray", borderRadius: "10px", p: 2 }}
                >
                  <img src={trimmedDataURL} alt="Trimmed Signature" height="100px" width="200px" />
                </Box>
              ) : null}
              <Button onClick={() => dispatch(openDialog1())}>{signature ? "Change Sign" : "Add Signature"}</Button> */}
          </Box>

          <Box sx={BoxStyle} pt={0.5}>
            <Typography sx={sxSubtitle}>Attachments</Typography>
            <Stack flexDirection="row" gap={1} alignItems="center">
              {
                // watch("receiver_img") !== null ||
                capturedImage !== null || file !== null ? (
                  <UpdateField
                    label={"Receiver Image"}
                    value={watch("receiver_img")?.name || (!!capturedImage && "Webcam") || (!!file && file?.name)}
                    watch={watch("receiver_img")}
                    requiredField
                  />
                ) : (
                  // <CustomImgAttachment
                  //   control={control}
                  //   name="receiver_img"
                  //   label="Receiver Image"
                  //   // disabled={handleSaveValidation()}
                  //   inputRef={receiverMemoRef}
                  //   error={!!errors?.receiver_img?.message}
                  //   helperText={errors?.receiver_img?.message}
                  //   requiredField
                  // />
                  // <CustomWebcam />

                  <TextField
                    label="Receiver Image"
                    variant="outlined"
                    value={capturedImage ? "WebcamCapture.jpeg" : "No file chosen"}
                    onClick={handleOpenFileSelection}
                    color="secondary"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <img src={AttachmentIcon} width="20px" />
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
                        color: "#636363",
                        bgcolor: "#f5c9861c",
                        height: "40px",
                      },
                      ".MuiInputLabel-root.Mui-disabled": {
                        backgroundColor: "transparent",
                      },

                      ".Mui-disabled": {
                        backgroundColor: "background.light",
                        borderRadius: "10px",
                      },
                    }}
                  />
                )
              }
              {
                // watch("receiver_img") !== null
                (capturedImage !== null || file !== null) && <RemoveFile title="Receiver Image" value="receiver_img" />
              }
            </Stack>

            {/* <Stack flexDirection="row" gap={1} alignItems="center">
              {watch("assignment_memo_img") !== null ? (
                <UpdateField
                  label={"Assignment Memo"}
                  value={watch("assignment_memo_img")?.name}
                  watch={watch("assignment_memo_img")}
                />
              ) : (
                <CustomImgAttachment
                  control={control}
                  name="assignment_memo_img"
                  label="Assignment Memo"
                  disabled={handleSaveValidation()}
                  inputRef={assignmentMemoRef}
                  error={!!errors?.assignment_memo_img?.message}
                  helperText={errors?.assignment_memo_img?.message}
                />
              )}
              {watch("assignment_memo_img") !== null && (
                <RemoveFile title="Assignment Memo" value="assignment_memo_img" />
              )}
            </Stack> */}
            <Stack flexDirection="row" gap={1} alignItems="center">
              {capturedImageAuthorization !== null || fileAuthorization !== null ? (
                <UpdateField
                  label={"Authorization Letter"}
                  value={
                    watch("authorization_memo_img")?.name ||
                    (!!capturedImageAuthorization && "Webcam") ||
                    (!!fileAuthorization && fileAuthorization?.name)
                  }
                  watch={watch("authorization_memo_img")}
                  requiredField={result === false && true}
                />
              ) : (
                // <CustomImgAttachment
                //   control={control}
                //   name="authorization_memo_img"
                //   label="Authorization Letter"
                //   // disabled={handleSaveValidation()}
                //   inputRef={authorizationLetterRef}
                //   error={!!errors?.authorization_memo_img?.message}
                //   helperText={errors?.authorization_memo_img?.message}
                //   requiredField={result === false && true}
                // />
                <TextField
                  label="Authorization Letter"
                  variant="outlined"
                  value={capturedImageAuthorization ? "WebcamCapture.jpeg" : "No file chosen"}
                  onClick={handleOpenFileSelectionAuthorization}
                  color="secondary"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img src={AttachmentIcon} width="20px" />
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
                      color: "#636363",
                      bgcolor: result === false && "#f5c9861c",
                      height: "40px",
                    },
                    ".MuiInputLabel-root.Mui-disabled": {
                      backgroundColor: "transparent",
                    },

                    ".Mui-disabled": {
                      backgroundColor: "background.light",
                      borderRadius: "10px",
                    },
                  }}
                />
              )}
              {(capturedImageAuthorization !== null || fileAuthorization !== null) && (
                <RemoveFile title="Authorization Letter" value="authorization_memo_img" />
              )}
            </Stack>
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

          <CustomAutoComplete
            autoComplete
            control={control}
            name="department_id"
            options={departmentData}
            onOpen={() => (isDepartmentSuccess ? null : (departmentTrigger(), companyTrigger(), businessUnitTrigger()))}
            loading={isDepartmentLoading}
            // disabled={handleSaveValidation()}
            disabled
            disableClearable
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
            options={companyData}
            onOpen={() => (isCompanySuccess ? null : companyTrigger())}
            loading={isCompanyLoading}
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
            options={departmentData?.filter((obj) => obj?.id === watch("department_id")?.id)[0]?.unit || []}
            onOpen={() => (isUnitSuccess ? null : (unitTrigger(), subunitTrigger(), locationTrigger()))}
            loading={isUnitLoading}
            // disabled={handleSaveValidation()}
            disabled
            disableClearable
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
            options={unitData?.filter((obj) => obj?.id === watch("unit_id")?.id)[0]?.subunit || []}
            loading={isSubUnitLoading}
            // disabled={handleSaveValidation()}
            disabled
            disableClearable
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
            options={locationData?.filter((item) => {
              return item.subunit.some((subunit) => {
                return subunit?.sync_id === watch("subunit_id")?.sync_id;
              });
            })}
            loading={isLocationLoading}
            // disabled={handleSaveValidation()}
            disabled
            disableClearable
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
            control={control}
            // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.data?.length !== 0}
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
      </Stack>

      <Divider flexItem sx={{ my: "10px" }} />

      <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
        <LoadingButton
          variant="contained"
          color={
            // handleSaveValidation() ? "tertiary" :
            "primary"
          }
          loading={isPostLoading}
          size="small"
          type="submit"
          // sx={{ color: handleSaveValidation() && "white" }}
          disabled={!isValid || !watch("receiver_img") || (result === false && !watch("authorization_memo_img"))}
        >
          {
            // handleSaveValidation() ? "Save" :
            "Release"
          }
        </LoadingButton>

        <Button variant="outlined" color="secondary" size="small" onClick={() => dispatch(closeDialog())}>
          Cancel
        </Button>
      </Stack>
      {/* <Dialog open={dialog} onClose={handleCloseSignature}>
        <Box p={2}>
          <Typography fontFamily="Anton, Impact, Roboto" fontSize={20} color="secondary.main" p={1}>
            ADD SIGNATURE
          </Typography>
          <Stack gap={2} position="relative" willreadfrequently="true">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{ width: 400, height: 200, className: "signCanvas" }}
              willreadfrequently="true"
            />
            <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
              <IconButton onClick={() => handleClearSignature()} sx={{ position: "absolute", top: 10, left: 10 }}>
                <Tooltip title="Clear" placement="right" arrow>
                  <Refresh />
                </Tooltip>
              </IconButton>
              <Button variant="contained" startIcon={<Save />} size="small" onClick={() => handleSaveSignature()}>
                Save
              </Button>
              <Button variant="outlined" size="small" color="secondary" onClick={handleCloseSignature}>
                Close
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog> */}

      <Dialog open={dialog} onClose={handleCloseView}>
        <Box p={2} borderRadius="10px">
          <Typography fontFamily="Anton, Impact, Roboto" fontSize={20} color="secondary.main" px={1}>
            View Image
          </Typography>
          <Stack justifyContent="space-between" p={2} gap={2}>
            <img src={viewImage} alt="Assignment Memo" />

            <Button variant="outlined" size="small" color="secondary" onClick={handleCloseSignature}>
              Close
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <Dialog open={dialog2} onClose={() => dispatch(closeDialog2())}>
        <Box p={2} borderRadius="10px">
          <DialogTitle>
            <Typography fontFamily="Anton, Impact, Roboto" fontSize={20} color="secondary.main" px={1}>
              Add Receiver Image
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack gap={2} justifyContent="center" alignItems="center" flexDirection="row">
              <Card sx={{ maxWidth: 345 }} onClick={() => dispatch(openDialog3())}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    image={WebCamSVG}
                    alt="web cam"
                    sx={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      Take a photo.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>

              <Box>
                <input
                  type="file"
                  accept="image/*"
                  ref={receiverMemoRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Card sx={{ maxWidth: 345 }} onClick={() => receiverMemoRef.current.click()}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      image={uploadSVG}
                      alt="web cam"
                      sx={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        Upload a photo.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" size="small" color="secondary" onClick={() => dispatch(closeDialog2())}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={dialog3}
        onClose={() => dispatch(closeDialog3())}
        PaperProps={{ sx: { width: "1100px ", borderRadius: "10px", overflow: "hidden" } }}
        fullScreen
      >
        <Box p={2} borderRadius="10px">
          <CustomWebcam
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            close={handleCamClose}
            cancel={() => dispatch(closeDialog3())}
            back={() => {
              dispatch(closeDialog3());
              setWebcamError(false);
            }}
            submit={() => {
              dispatch(closeDialog3());
              dispatch(closeDialog2());
            }}
            error={webcamError}
            setError={setWebcamError}
          />
        </Box>
      </Dialog>

      <Dialog open={dialog4} onClose={() => dispatch(closeDialog4())}>
        <Box p={2} borderRadius="10px">
          <DialogTitle>
            <Typography fontFamily="Anton, Impact, Roboto" fontSize={20} color="secondary.main" px={1}>
              Add Authorization Letter Image
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack gap={2} justifyContent="center" alignItems="center" flexDirection="row">
              <Card sx={{ maxWidth: 345 }} onClick={() => dispatch(openDialog5())}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    image={WebCamSVG}
                    alt="web cam"
                    sx={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      Take a photo.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>

              <Box>
                <input
                  type="file"
                  accept="image/*"
                  ref={authorizationLetterRef}
                  onChange={handleFileChangeAuthorization}
                  style={{ display: "none" }}
                />
                <Card sx={{ maxWidth: 345 }} onClick={() => authorizationLetterRef.current.click()}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      image={uploadSVG}
                      alt="web cam"
                      sx={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        Upload a photo.
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" size="small" color="secondary" onClick={() => dispatch(closeDialog4())}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={dialog5}
        onClose={() => dispatch(closeDialog5())}
        PaperProps={{ sx: { width: "1100px ", borderRadius: "10px", overflow: "hidden" } }}
        fullScreen
      >
        <Box p={2} borderRadius="10px">
          <CustomWebcam
            capturedImage={capturedImageAuthorization}
            setCapturedImage={setCapturedImageAuthorization}
            close={handleCamCloseAuthorization}
            cancel={() => dispatch(closeDialog5())}
            back={() => {
              dispatch(closeDialog5());
              setWebcamErrorAuthorization(false);
            }}
            submit={() => {
              dispatch(closeDialog5());
              dispatch(closeDialog4());
            }}
            error={webcamErrorAuthorization}
            setError={setWebcamErrorAuthorization}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default AddReleasingInfo;
