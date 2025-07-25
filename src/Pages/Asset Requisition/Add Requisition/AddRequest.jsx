import React, { useEffect, useRef, useState } from "react";
import "../../../Style/Request/request.scss";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import CustomNumberField from "../../../Components/Reusable/CustomNumberField";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import CustomAttachment from "../../../Components/Reusable/CustomAttachment";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { useLazyGetSedarUsersApiQuery } from "../../../Redux/Query/SedarUserApi";
import {
  requestContainerApi,
  useDeleteRequestContainerAllApiMutation,
  useDeleteRequestContainerApiMutation,
} from "../../../Redux/Query/Request/RequestContainer";
import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { openToast } from "../../../Redux/StateManagement/toastSlice";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  Divider,
  Grow,
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
  AddToPhotos,
  ArrowBackIosRounded,
  Create,
  Delete,
  Download,
  Info,
  Remove,
  Report,
  SaveAlt,
  Update,
  Warning,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, closeDrawer, openDialog, openDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useLazyGetCompanyAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetBusinessUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import { useLazyGetDepartmentAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import { useLazyGetUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Unit";
import { useLazyGetUnitOfMeasurementAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/UnitOfMeasurement";

import { useLazyGetLocationAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Location";
import { useLazyGetSubUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import { useLazyGetAccountTitleAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import {
  useGetByTransactionApiQuery,
  usePostRequisitionApiMutation,
  usePostResubmitRequisitionApiMutation,
  useUpdateRequisitionApiMutation,
  useDeleteRequisitionReferenceApiMutation,
  useLazyGetByTransactionApiQuery,
  requisitionApi,
  useGetRequisitionIdApiQuery,
} from "../../../Redux/Query/Request/Requisition";

import { useLazyGetTypeOfRequestAllApiQuery } from "../../../Redux/Query/Masterlist/TypeOfRequest";
import { useLocation, useNavigate } from "react-router-dom";
import NoRecordsFound from "../../../Layout/NoRecordsFound";

import ActionMenu from "../../../Components/Reusable/ActionMenu";
import {
  useGetRequestContainerAllApiQuery,
  usePostRequestContainerApiMutation,
  useUpdateRequestContainerApiMutation,
} from "../../../Redux/Query/Request/RequestContainer";
import axios from "axios";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { usePostRequisitionSmsApiMutation } from "../../../Redux/Query/Request/RequisitionSms";
import CustomPatternField from "../../../Components/Reusable/CustomPatternField";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import ErrorFetching from "../../ErrorFetching";
import CustomDatePicker from "../../../Components/Reusable/CustomDatePicker";
import moment from "moment";
import ViewItemRequest from "../ViewItemRequest";
import { useLazyGetWarehouseAllApiQuery } from "../../../Redux/Query/Masterlist/Warehouse";
import {
  useLazyGetMinorCategoryAllApiQuery,
  useLazyGetMinorCategorySmallToolsApiQuery,
} from "../../../Redux/Query/Masterlist/Category/MinorCategory";
import { useLazyGetMajorCategoryAllApiQuery } from "../../../Redux/Query/Masterlist/Category/MajorCategory";
import {
  useGetSmallToolsAllApiQuery,
  useLazyGetSmallToolsAllApiQuery,
} from "../../../Redux/Query/Masterlist/YmirCoa/SmallTools";
import {
  useGetFixedAssetSmallToolsAllApiQuery,
  useLazyGetFixedAssetSmallToolsAllApiQuery,
} from "../../../Redux/Query/FixedAsset/FixedAssets";
import { useDownloadAttachment } from "../../../Hooks/useDownloadAttachment";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";
// import { useLazyGetMajorCategoryAllApiQuery } from "../../../Redux/Query/Masterlist/Category/MajorCategory";

const schema = yup.object().shape({
  id: yup.string(),
  type_of_request_id: yup.object().required().label("Type of Request").typeError("Type of Request is a required field"),
  // .when("type_of_request", {
  //   is: (value) => value === "Personal Issued",
  //   then: (yup) => yup.label("CIP Number").required().typeError("CIP Number is a required field"),
  // })
  cip_number: yup.string().nullable(),
  attachment_type: yup.string().required().label("Attachment Type").typeError("Attachment Type is a required field"),
  // receiving_warehouse_id: yup.object().required().label("Warehouse").typeError("Warehouse is a required field"),
  minor_category_id: yup.object().required().label("Minor Category").typeError("Minor Category is a required field"),

  one_charging_id: yup.object().required().label("One RDF Charging").typeError("One RDF Charging is a required field"),
  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
  // small_tool_id: yup.object().required().label("Small Tools").typeError("Small Tools is a required field"),
  // small_tool_id: yup
  //   .object()
  //   .nullable()
  //   .when("type_of_request", {
  //     is: (value) => {
  //       value === "Small Tools";
  //     },
  //     then: (yup) => yup.label("Small Tools").required().typeError("Small Tools is a required field"),
  //   }),
  // account_title_id: yup.object().required().label("Account Title").typeError("Account Title is a required field"),
  accountability: yup.string().typeError("Accountability is a required field").required().label("Accountability"),
  accountable: yup
    .object()
    .nullable()
    .when("accountability", {
      is: (value) => value === "Personal Issued",
      then: (yup) => yup.label("Accountable").required().typeError("Accountable is a required field"),
    }),
  acquisition_details: yup.string().required().label("Acquisition Details"),
  item_status: yup.string().required().label("Item Status"),
  fixed_asset_id: yup
    .object()
    .nullable()
    .when("type_of_request" && "item_status", {
      is: (value) => value === "Small Tools" && value === "Replacement",
      then: (yup) => yup.label("Fixed Asset").required().typeError("Fixed Asset is a required field"),
    }),
  //     fixed_asset_id: yup
  //     .object()
  //     .nullable().
  // label("Fixed Asset").typeError("Fixed Asset is a required field"),
  small_tool_item: yup
    .object()
    .nullable()
    .when("type_of_request" && "item_status", {
      is: (value) => value === "Small Tools" && value === "Replacement",
      then: (yup) => yup.label("Small Tool Item").required().typeError("Small Tool Item is a required field"),
    }),
  asset_description: yup.string().required().label("Asset Description"),
  asset_specification: yup.string().required().label("Asset Specification"),
  // asset_specification: yup.mixed().required().label("Asset Specification"),
  date_needed: yup.string().required().label("Date Needed").typeError("Date Needed is a required field"),
  brand: yup.string().label("Brand"),
  quantity: yup.number().required().label("Quantity"),
  uom_id: yup.object().required().label("UOM").typeError("UOM is a required field"),
  cellphone_number: yup.string().nullable().label("Cellphone Number"),
  additional_info: yup.string().required().label("Capex Num / Unit Charging"),
  letter_of_request: yup
    .mixed()
    .label("Letter of Request")
    .when("attachment_type", {
      is: (value) => value === "Unbudgeted",
      then: (yup) => yup.label("Letter of Request").required().typeError("Letter of Request is a required field"),
    }),
  quotation: yup.mixed().label("Quotation"),
  specification_form: yup.mixed().label("Specification"),
  tool_of_trade: yup.mixed().label("Tool of Trade"),
  other_attachments: yup
    .mixed()
    .label("Other Attachment")
    .when("type_of_request", {
      is: (value) => value === "Capex",
      then: (yup) => yup.label("Other Attachments").required().typeError("Other Attachments is a required field"),
    }),
});

const AddRequisition = (props) => {
  const [updateRequest, setUpdateRequest] = useState({
    id: null,
    type_of_request_id: null,
    cip_number: "",
    attachment_type: null,
    // receiving_warehouse_id: null,
    major_category_id: null,
    minor_category_id: null,

    one_charging_id: null,
    department_id: null,
    company_id: null,
    business_unit_id: null,
    unit_id: null,
    subunit_id: null,
    location_id: null,
    // account_title_id: null,

    item_status: null,
    fixed_asset_id: null,
    small_tool_id: null,
    asset_description: "",
    asset_specification: "",
    small_tool_item: null,
    date_needed: null,
    brand: "",
    accountability: null,
    accountable: null,
    cellphone_number: "",
    quantity: 1,
    uom_id: null,
    additional_info: "",

    letter_of_request: null,
    quotation: null,
    specification_form: null,
    tool_of_trade: null,
    other_attachments: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [updateToggle, setUpdateToggle] = useState(true);
  const [disable, setDisable] = useState(true);
  const [itemData, setItemData] = useState(null);
  const [editRequest, setEditRequest] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [transactionStatusId, setTransactionStatusId] = useState(null);
  const [base64, setBase64] = useState("");
  const [image, setImage] = useState(false);
  const [fileMimeType, setFileMimeType] = useState("");
  const [DValue, setDValue] = useState();
  const [name, setName] = useState("");
  const [scale, setScale] = useState(1);

  const { state: transactionData } = useLocation();
  // console.log("trans data: ", transactionData);
  const dialog = useSelector((state) => state.booleanState.dialog);
  const drawer = useSelector((state) => state.booleanState.drawer);

  const handleDownloadAttachment = (value) => {
    useDownloadAttachment({ attachment: value?.value, id: value?.id });
  };

  const base64ToBlob = (base64, mimeType) => {
    const binaryString = atob(base64); // Decode Base64 to binary string
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i); // Convert to byte array
    }
    return new Blob([bytes], { type: mimeType });
  };

  const handleOpenDrawer = (value) => {
    console.log("valueeeeeee", value);
    const blob = base64ToBlob(value?.value?.base64, value?.value?.mime_type);
    const url = URL.createObjectURL(blob);

    console.log("url", url);

    dispatch(openDrawer());
    setBase64(url);
    (value?.value?.file_name.includes("jpg") ||
      value?.value?.file_name.includes("png") ||
      value?.value?.file_name.includes("jpeg")) &&
      setImage(true);
    setDValue(value.data);
    setName(value.name);
  };

  const handleCloseDrawer = () => {
    dispatch(closeDrawer());
    setBase64("");
    setImage(false);
    setDValue(null);
    setName("");
    setScale(1);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 4)); // Limit max zoom to 3x
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5)); // Limit min zoom to 0.5x
  };

  const attachmentSx = {
    textDecoration: "underline",
    cursor: "pointer",
    color: "primary.main",
    fontSize: "12px",
  };

  const isFullWidth = useMediaQuery("(max-width: 600px)");
  const isSmallScreen = useMediaQuery("(min-width: 700px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const location = useLocation();

  const LetterOfRequestRef = useRef(null);
  const QuotationRef = useRef(null);
  const SpecificationRef = useRef(null);
  const ToolOfTradeRef = useRef(null);
  const OthersRef = useRef(null);

  const attachmentType = ["Budgeted", "Unbudgeted"];

  const userCoa = useSelector((state) => state.userLogin?.user?.coa);

  const [
    postRequisition,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostRequisitionApiMutation();

  const [
    resubmitRequest,
    {
      data: resubmitData,
      isLoading: isResubmitLoading,
      isSuccess: isResubmitSuccess,
      isError: isResubmitError,
      error: resubmitError,
    },
  ] = usePostResubmitRequisitionApiMutation();

  const [
    postRequestSms,
    { data: smsData, isLoading: isSmsLoading, isSuccess: isSmsSuccess, isError: isSmsError, error: smsError },
  ] = usePostRequisitionSmsApiMutation();

  // QUERY
  const {
    data: requisitionData,
    isLoading: isRequisitionLoading,
    isSuccess: isRequisitionSuccess,
    isError: isRequisitionError,
    refetch: isRequisitionRefetch,
  } = useGetRequisitionIdApiQuery({ id: transactionData?.transaction_number });

  const requisitionStatus = requisitionData?.data[0]?.status;

  // console.log("requisitionData", requisitionStatus);
  // console.log(transactionData.transaction_number);

  const [
    typeOfRequestTrigger,
    {
      data: typeOfRequestData = [],
      isLoading: isTypeOfRequestLoading,
      isSuccess: isTypeOfRequestSuccess,
      isError: isTypeOfRequestError,
      refetch: isTypeOfRequestRefetch,
    },
  ] = useLazyGetTypeOfRequestAllApiQuery();

  const [
    majorCategoryTrigger,
    {
      data: majorCategoryData = [],
      isLoading: isMajorCategoryLoading,
      isSuccess: isMajorCategorySuccess,
      isError: isMajorCategoryError,
      refetch: isMajorCategoryRefetch,
    },
  ] = useLazyGetMajorCategoryAllApiQuery();

  const [
    minorCategoryTrigger,
    {
      data: minorCategoryData = [],
      isLoading: isMinorCategoryLoading,
      isSuccess: isMinorCategorySuccess,
      isError: isMinorCategoryError,
    },
  ] = useLazyGetMinorCategoryAllApiQuery();

  const [
    minorCategorySmallToolsTrigger,
    {
      data: minorCategorySmallToolsData = [],
      isLoading: isMinorCategorySmallToolsLoading,
      isSuccess: isMinorCategorySmallToolsSuccess,
      isError: isMinorCategorySmallToolsError,
    },
  ] = useLazyGetMinorCategorySmallToolsApiQuery();

  const [tag, setTag] = useState(0);

  const [
    warehouseTrigger,
    {
      data: warehouseData = [],
      isLoading: isWarehouseLoading,
      isSuccess: isWarehouseSuccess,
      isError: isWarehouseError,
      refetch: isWarehouseRefetch,
    },
  ] = useLazyGetWarehouseAllApiQuery();

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

  const [
    smallToolsTrigger,
    {
      data: smallToolsApiData = [],
      isLoading: smallToolsApiLoading,
      isSuccess: smallToolsApiSuccess,
      isFetching: smallToolsApiFetching,
      isError: smallToolsApiError,
      error: errorData,
      refetch: smallToolsApiRefetch,
    },
  ] = useLazyGetSmallToolsAllApiQuery();

  const [
    fixedAssetSmallToolsTrigger,
    {
      data: fixedAssetSmallToolsApiData = [],
      isLoading: fixedAssetSmallToolsApiLoading,
      isSuccess: fixedAssetSmallToolsApiSuccess,
      isFetching: fixedAssetSmallToolsApiFetching,
      isError: fixedAssetSmallToolsApiError,
      error: fixedAssetSmallToolsErrorData,
      refetch: fixedAssetSmallToolsApiRefetch,
    },
  ] = useLazyGetFixedAssetSmallToolsAllApiQuery();

  // console.log("fixedAssetSmallToolsApiData", fixedAssetSmallToolsApiData);

  const [
    sedarTrigger,
    { data: sedarData = [], isLoading: isSedarLoading, isSuccess: isSedarSuccess, isError: isSedarError },
  ] = useLazyGetSedarUsersApiQuery();

  const [
    uomTrigger,
    {
      data: uomData = [],
      isLoading: isUnitOfMeasurementLoading,
      isSuccess: isUnitOfMeasurementSuccess,
      isError: isUnitOfMeasurementError,
      refetch: isUnitOfMeasurementRefetch,
    },
  ] = useLazyGetUnitOfMeasurementAllApiQuery();

  const {
    data: addRequestAllApi = [],
    isLoading: isRequestLoading,
    isFetching: isRequestFetching,
    isSuccess: isRequestSuccess,
    isError: isRequestError,
    error: errorRequest,
    refetch: isRequestRefetch,
  } = useGetRequestContainerAllApiQuery({}, { refetchOnMountOrArgChange: true });
  // } = useGetRequestContainerAllApiQuery({ page: page, per_page: perPage }, { refetchOnMountOrArgChange: true });

  console.log("addRequestAllApi", addRequestAllApi);

  const hasRequest = addRequestAllApi.length > 0;
  // console.log("hasRequest", hasRequest);

  const {
    data: transactionDataApi = [],
    isLoading: isTransactionLoading,
    isFetching: isTransactionFetching,
    isLoading: isTransactionSuccess,
    isError: isTransactionError,
    error: errorTransaction,
    refetch: isTransactionRefetch,
  } = useGetByTransactionApiQuery(
    { transaction_number: transactionData?.transaction_number },
    { refetchOnMountOrArgChange: true }
  );

  // console.log("transactiondata", transactionDataApi);

  const [postRequest, { data: postRequestData }] = usePostRequestContainerApiMutation();
  const [updateDataRequest, { data: updateRequestData }] = useUpdateRequestContainerApiMutation();
  const [deleteRequest, { data: deleteRequestData }] = useDeleteRequestContainerApiMutation();
  const [deleteAllRequest, { data: deleteAllRequestData }] = useDeleteRequestContainerAllApiMutation();
  const [deleteRequestContainer, { data: deleteRequestContainerData }] = useDeleteRequisitionReferenceApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    // mode: "onSubmit",
    defaultValues: {
      id: "",
      type_of_request_id: null,
      cip_number: "",
      attachment_type: null,
      // receiving_warehouse_id: null,
      major_category_id: null,
      minor_category_id: null,

      one_charging_id: null,
      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      // account_title_id: null,
      acquisition_details: "",

      item_status: null,
      small_tool_id: null,
      asset_description: "",
      asset_specification: "",
      small_tool_item: null,
      date_needed: null,
      brand: "",
      accountability: null,
      accountable: null,
      cellphone_number: "",
      quantity: 1,
      uom_id: null,
      additional_info: "",

      letter_of_request: null,
      quotation: null,
      specification_form: null,
      tool_of_trade: null,
      other_attachments: null,
    },
  });

  useEffect(() => {
    if (transactionData?.additionalCost) {
      setDisable(false);
    }
    !transactionData && setDisable(false);
    // deleteAllRequest();
  }, []);

  console.log("userCoa", userCoa);

  useEffect(() => {
    if (!transactionData) {
      setValue("one_charging_id", userCoa?.one_charging);
      setValue("department_id", userCoa?.one_charging);
      setValue("company_id", userCoa?.one_charging);
      setValue("business_unit_id", userCoa?.one_charging);
      setValue("unit_id", userCoa?.one_charging);
      setValue("subunit_id", userCoa?.one_charging);
      setValue("location_id", userCoa?.one_charging);
    }
    isRequisitionRefetch();
  }, [transactionData]);

  useEffect(() => {
    if (updateRequest.id) {
      // console.log("updaterequest", updateRequest);
      const accountable = {
        general_info: {
          full_id_number: updateRequest.accountable.split(" ")[0],
          full_id_number_full_name: updateRequest.accountable,
        },
      };
      const dateNeededFormat = updateRequest?.date_needed === "-" ? null : new Date(updateRequest?.date_needed);
      const smallToolFormat =
        updateRequest?.small_tool_id === (undefined || null) ? null : updateRequest?.small_tool_id;
      const cellphoneNumber = updateRequest?.cellphone_number === "-" ? "" : updateRequest?.cellphone_number.slice(2);
      const attachmentFormat = (fields) => (updateRequest?.[fields] === "-" ? "" : updateRequest?.[fields]);

      setValue("type_of_request_id", updateRequest?.type_of_request);
      setValue("cip_number", updateRequest?.cip_number);
      setValue("attachment_type", updateRequest?.attachment_type);
      // setValue("receiving_warehouse_id", updateRequest?.warehouse);

      setValue("major_category_id", updateRequest?.major_category?.id);
      setValue("minor_category_id", updateRequest?.minor_category);

      setValue("one_charging_id", updateRequest?.one_charging);
      setValue("department_id", updateRequest?.department);
      setValue("company_id", updateRequest?.company);
      setValue("business_unit_id", updateRequest?.business_unit);
      setValue("unit_id", updateRequest?.unit);
      setValue("subunit_id", updateRequest?.subunit);
      setValue("location_id", updateRequest?.location);
      // setValue("small_tool_id", updateRequest?.small_tool_id);
      // setValue("account_title_id", updateRequest?.account_title);
      setValue("accountability", updateRequest?.accountability);
      setValue("accountable", accountable);
      setValue("acquisition_details", updateRequest?.acquisition_details);

      // ASSET INFO
      setValue("fixed_asset_id", updateRequest?.fixed_asset_id);
      setValue("small_tool_id", smallToolFormat);
      setValue("asset_description", updateRequest?.asset_description);
      setValue("item_status", updateRequest?.item_status);
      setValue("asset_specification", updateRequest?.asset_specification);
      setValue("small_tool_item", updateRequest?.small_tool_item);
      setValue("date_needed", dateNeededFormat);
      setValue("quantity", updateRequest?.quantity);
      setValue("uom_id", updateRequest?.unit_of_measure);
      setValue("brand", updateRequest?.brand);
      setValue("cellphone_number", cellphoneNumber);
      setValue("additional_info", updateRequest?.additional_info);

      // ATTACHMENTS
      setValue("letter_of_request", attachmentFormat("letter_of_request"));
      setValue("quotation", attachmentFormat("quotation"));
      setValue("specification_form", attachmentFormat("specification_form"));
      setValue("tool_of_trade", attachmentFormat("tool_of_trade"));
      setValue("other_attachments", attachmentFormat("other_attachments"));
    }
  }, [updateRequest]);

  const handleEditRequestData = () => {
    if (transactionData && updateRequest) {
      transactionDataApi[0]?.can_edit === 1 || transactionData?.status === "Return";
    } else if (editRequest) {
      setEditRequest(true) && false;
    } else {
      setEditRequest(false) && true;
    }
  };

  const attachmentValidation = (fieldName, formData) => {
    // console.log("fieldName", fieldName);
    // console.log("formData", formData);
    const validateAdd = addRequestAllApi.find((item) => item.id === updateRequest.id);
    const validate = transactionDataApi.find((item) => item.id === updateRequest.id);
    const formDataValidate = formData?.[fieldName]?.name;
    // console.log("formValidate", formDataValidate);
    // console.log("updateValidate", updateRequest?.[fieldName]?.file_name);
    // console.log(
    //   "updateRequest",
    //   (formDataValidate === undefined
    //     ? (validateAdd || validate)?.attachments?.[fieldName]?.file_name
    //     : formDataValidate) === updateRequest?.[fieldName]?.file_name
    // );
    // console.log("validateAdd", validateAdd?.attachments);
    // console.log("validate", validate?.attachments);
    // console.log("validate", validate);

    if (watch(`${fieldName}`) === null) {
      return "";
    } else if (updateRequest[fieldName] !== null)
      if (
        (formDataValidate === undefined
          ? (validateAdd || validate)?.attachments?.[fieldName]?.file_name
          : formDataValidate) === updateRequest?.[fieldName]?.file_name
      ) {
        return "x";
      } else {
        return formData?.[fieldName];
      }
    else {
      return formData?.[fieldName];
    }
  };

  //  * CONTAINER
  // Adding of Request
  const addRequestHandler = (formData) => {
    console.log("formData👀", formData);
    const cipNumberFormat = formData?.cip_number === "" ? "" : formData?.cip_number?.toString();
    // const updatingCoa = (fields, name) => (updateRequest ? formData?.[fields] : formData?.[fields]?.[name]?.toString());
    const accountableFormat =
      formData?.accountable === null ? "" : formData?.accountable?.general_info?.full_id_number_full_name?.toString();
    const smallToolFormat = formData?.small_tool_id === null ? "" : formData?.small_tool_id?.id?.toString();
    const dateNeededFormat = moment(new Date(formData.date_needed)).format("YYYY-MM-DD");
    const cpFormat = formData?.cellphone_number === "" ? "" : "09" + formData?.cellphone_number?.toString();

    const data = {
      type_of_request_id: formData?.type_of_request_id?.id?.toString(),
      cip_number: cipNumberFormat,
      attachment_type: formData?.attachment_type?.toString(),
      // receiving_warehouse_id: formData?.receiving_warehouse_id?.id?.toString(),
      major_category_id: !transactionData
        ? formData?.minor_category_id?.major_category?.id?.toString()
        : formData?.major_category_id?.toString(),
      minor_category_id: formData?.minor_category_id?.id?.toString(),

      initial_debit_id: formData?.minor_category_id?.initial_debit?.sync_id.toString(),
      depreciation_credit_id: formData?.minor_category_id?.depreciation_credit?.sync_id.toString(),

      one_charging_id: formData?.one_charging_id?.id?.toString(),
      department_id: formData?.one_charging_id?.department_id?.toString(),
      // company_id: updatingCoa("company_id", "company"),
      // business_unit_id: updatingCoa("business_unit_id", "business_unit"),
      company_id: formData?.one_charging_id?.company_id?.toString(),
      business_unit_id: formData?.one_charging_id?.business_unit_id?.toString(),
      unit_id: formData.one_charging_id?.unit_id?.toString(),
      subunit_id: formData.one_charging_id?.subunit_id?.toString(),
      location_id: formData?.one_charging_id?.location_id?.toString(),
      // account_title_id: formData?.account_title_id.id?.toString(),
      small_tool_id: smallToolFormat,
      accountability: formData?.accountability?.toString(),
      accountable: accountableFormat,

      acquisition_details: formData?.acquisition_details?.toString(),
      item_status: formData?.item_status?.toString(),
      fixed_asset_id: formData?.fixed_asset_id?.id?.toString() || "",
      asset_description: formData?.asset_description?.toString(),
      asset_specification: formData?.small_tool_item
        ? formData?.small_tool_item?.description.toString() +
          " - " +
          formData?.small_tool_item?.specification.toString()
        : formData?.asset_specification?.toString(),
      item_id: formData?.small_tool_item?.id || "",
      date_needed: dateNeededFormat,
      cellphone_number: cpFormat,

      transaction_number: transactionData ? transactionData?.transaction_number : "",

      brand: formData?.brand?.toString(),
      quantity: formData?.quantity?.toString(),
      uom_id: formData?.uom_id?.id?.toString(),
      additional_info: formData?.additional_info?.toString(),

      letter_of_request: updateRequest && attachmentValidation("letter_of_request", formData),
      quotation: updateRequest && attachmentValidation("quotation", formData),
      specification_form: updateRequest && attachmentValidation("specification_form", formData),
      tool_of_trade: updateRequest && attachmentValidation("tool_of_trade", formData),
      other_attachments: updateRequest && attachmentValidation("other_attachments", formData),
    };
    // console.log(formData);
    // console.log("data", data);

    const payload = new FormData();
    Object.entries(data).forEach((item) => {
      const [name, value] = item;
      payload.append(name, value);
    });

    const token = localStorage.getItem("token");

    // validation if the requestor changes the COA while the item in the container is different
    // from the item in the input field
    const validation = () => {
      const coaValidation = (name, value) => {
        transactionData && transactionDataApi?.every((item) => item?.[name]?.id !== watch(value)?.id);
      };

      if (transactionData) {
        return (
          (transactionData &&
            (coaValidation("department", "department_id") ||
              coaValidation("unit", "unit_id") ||
              coaValidation("subunit", "subunit_id") ||
              coaValidation("location", "location_id"))) ||
          false
        );
      } else {
        if (addRequestAllApi.every((item) => item?.department?.id !== watch("department_id")?.id)) {
          return true;
        }
        if (addRequestAllApi.every((item) => item?.unit?.id !== watch("unit_id")?.id)) {
          return true;
        }
        if (addRequestAllApi.every((item) => item?.subunit?.id !== watch("subunit_id")?.id)) {
          return true;
        }
        if (addRequestAllApi.every((item) => item?.location?.id !== watch("location_id")?.id)) {
          return true;
        }
        return false;
      }
    };

    const submitData = () => {
      transactionDataApi[0]?.can_edit === 1
        ? dispatch(
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
                    {/* {transactionDataApi[0]?.can_edit === 1 ? "RESUBMIT" : "ADD"} */}
                    UPDATE
                  </Typography>{" "}
                  this Data?
                </Box>
              ),

              onConfirm: async () => {
                dispatch(onLoading());
                setIsLoading(true);
                await axios
                  .post(
                    `${process.env.VLADIMIR_BASE_URL}/${
                      transactionData
                        ? `update-request/${updateRequest?.reference_number}` //transaction data - reference no.
                        : editRequest
                        ? `update-container/${updateRequest?.id}` //edit while adding
                        : "request-container" // adding
                    }`,
                    payload,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        // Authorization: `Bearer 583|KavZ7vEXyUY7FiHQGIMcTImftzyRnZorxbtn4S9a`,
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  )
                  .then((result) => {
                    dispatch(
                      openToast({
                        message: result?.data?.message || result?.data?.message,
                        duration: 5000,
                      })
                    );
                    setIsLoading(false);
                    // reset();
                    transactionData
                      ? reset() // reset if edit was requested
                      : reset({
                          type_of_request_id: formData?.type_of_request_id,
                          cip_number: formData?.cip_number,
                          attachment_type: formData?.attachment_type,
                          // receiving_warehouse_id: formData?.receiving_warehouse_id,
                          major_category_id: formData?.major_category_id,
                          minor_category_id: formData?.minor_category_id,

                          one_charging_id: formData?.one_charging_id,
                          company_id: formData?.company_id,
                          business_unit_id: formData?.business_unit_id,
                          department_id: formData?.department_id,
                          unit_id: formData?.unit_id,
                          subunit_id: formData?.subunit_id,
                          location_id: formData?.location_id,
                          // account_title_id: formData?.account_title_id,
                          // small_tool_id: formData?.small_tool_id,
                          acquisition_details: formData?.acquisition_details,

                          small_tool_id: null,
                          item_status: null,
                          asset_description: "",
                          asset_specification: "",
                          small_tool_item: null,
                          date_needed: null,
                          brand: "",
                          accountability: null,
                          accountable: null,
                          cellphone_number: "",
                          quantity: 1,
                          uom_id: null,
                          additional_info: "",

                          letter_of_request: null,
                          quotation: null,
                          specification_form: null,
                          tool_of_trade: null,
                          other_attachments: null,
                        });
                  })
                  .then(() => {
                    transactionData ? setDisable(true) : setDisable(false);
                    setEditRequest(false); // edit state
                    setUpdateToggle(true); // update button state
                    isTransactionRefetch();
                    isRequisitionRefetch();
                    dispatch(requisitionApi.util.invalidateTags(["Requisition"]));
                    dispatch(requestContainerApi.util.invalidateTags(["RequestContainer"]));
                  })
                  .catch((err) => {
                    console.log(err);
                    setIsLoading(false);
                    dispatch(
                      openToast({
                        message: err?.response?.data?.errors?.detail
                          ? err?.response?.data?.errors?.detail
                          : Object.entries(err?.response?.data?.errors).at(0).at(1).at(0),
                        // err?.response?.data?.errors?.detail ||
                        // err?.response?.data?.errors[0]?.detail ||
                        // err?.response?.data?.message,
                        duration: 5000,
                        variant: "error",
                      })
                    );
                  });
              },
            })
          )
        : (setIsLoading(true),
          axios
            .post(
              `${process.env.VLADIMIR_BASE_URL}/${
                transactionData
                  ? `update-request/${updateRequest?.reference_number}` //transaction data - reference no.
                  : editRequest
                  ? `update-container/${updateRequest?.id}` //edit while adding
                  : "request-container" // adding
              }`,
              payload,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  // Authorization: `Bearer 583|KavZ7vEXyUY7FiHQGIMcTImftzyRnZorxbtn4S9a`,
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((result) => {
              dispatch(
                openToast({
                  message: result?.data?.message || result?.data?.message,
                  duration: 5000,
                })
              );
              setIsLoading(false);
              // reset();
              transactionData
                ? reset() // reset if edit was requested
                : reset({
                    type_of_request_id: formData?.type_of_request_id,
                    cip_number: formData?.cip_number,
                    attachment_type: formData?.attachment_type,
                    // receiving_warehouse_id: formData?.receiving_warehouse_id,
                    major_category_id: formData?.major_category_id,
                    minor_category_id: formData?.minor_category_id,

                    one_charging_id: formData?.one_charging_id,
                    company_id: formData?.company_id,
                    business_unit_id: formData?.business_unit_id,
                    department_id: formData?.department_id,
                    unit_id: formData?.unit_id,
                    subunit_id: formData?.subunit_id,
                    location_id: formData?.location_id,
                    // account_title_id: formData?.account_title_id,
                    // small_tool_id: formData?.small_tool_id,
                    acquisition_details: formData?.acquisition_details,

                    small_tool_id: null,
                    item_status: null,
                    asset_description: "",
                    asset_specification: "",
                    small_tool_item: null,
                    date_needed: null,
                    brand: "",
                    accountability: null,
                    accountable: null,
                    cellphone_number: "",
                    quantity: 1,
                    uom_id: null,
                    additional_info: "",

                    letter_of_request: null,
                    quotation: null,
                    specification_form: null,
                    tool_of_trade: null,
                    other_attachments: null,
                  });
            })
            .then(() => {
              transactionData ? setDisable(true) : setDisable(false);
              setEditRequest(false); // edit state
              setUpdateToggle(true); // update button state
              isTransactionRefetch();
              isRequisitionRefetch();
              dispatch(requisitionApi.util.invalidateTags(["Requisition"]));
              dispatch(requestContainerApi.util.invalidateTags(["RequestContainer"]));
            })
            .catch((err) => {
              console.log(err);
              setIsLoading(false);
              dispatch(
                openToast({
                  message: err?.response?.data?.errors?.detail
                    ? err?.response?.data?.errors?.detail
                    : //  Object?.entries(err?.response?.data?.errors)?.at(0)?.at(1)?.at(0),
                    err?.response?.data?.errors?.fixed_asset_id
                    ? err?.response?.data?.errors?.fixed_asset_id
                    : err?.response?.data?.errors?.item_id
                    ? err?.response?.data?.errors?.item_id
                    : "Something went wrong. Please try again.",
                  // err?.response?.data?.errors?.detail ||
                  // err?.response?.data?.errors[0]?.detail ||
                  // err?.response?.data?.message,
                  duration: 5000,
                  variant: "error",
                })
              );
            }));
    };

    const addConfirmation = () => {
      dispatch(
        openConfirm({
          icon: Warning,
          iconColor: "alert",
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
                CHANGE THE COA?
              </Typography>
              <Typography>it will apply to all Items</Typography>
            </Box>
          ),

          onConfirm: () => {
            dispatch(onLoading());
            submitData();
            dispatch(closeConfirm());
          },
        })
      );
    };

    transactionData
      ? validation() // coa validation
        ? addConfirmation()
        : submitData()
      : addRequestAllApi.length === 0
      ? submitData()
      : validation()
      ? addConfirmation()
      : submitData();

    setSelectedId(null);
  };
  // console.log("small_tool_id", watch("small_tool_id"));

  // CREATE button function
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
              {transactionDataApi[0]?.can_edit === 1 ? "RESUBMIT" : "CREATE"}
            </Typography>{" "}
            this Data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            if (transactionData) {
              if (transactionDataApi[0]?.can_resubmit === 0) {
                await resubmitRequest(...transactionDataApi).unwrap();
                // console.log(res?.message);
                dispatch(
                  openToast({
                    message: "Successfully Resubmitted",
                    duration: 5000,
                  })
                );
                navigate(-1);
                deleteAllRequest();
                return;
              } else if (transactionDataApi[0]?.can_resubmit === 1) {
                await resubmitRequest({
                  transaction_number: transactionData?.transaction_number,
                  ...transactionDataApi,
                }).unwrap();
                dispatch(
                  openToast({
                    message: "Successfully Resubmitted",
                    duration: 5000,
                  })
                );
                navigate(-1);
                return;
              }
            } else {
              const res = await postRequisition(addRequestAllApi).unwrap();
              deleteAllRequest();
              reset({
                one_charging_id: userCoa?.one_charging,
                company_id: userCoa?.one_charging,
                business_unit_id: userCoa?.one_charging,
                department_id: userCoa?.one_charging,
                unit_id: userCoa?.one_charging,
                subunit_id: userCoa?.one_charging,
                location_id: userCoa?.one_charging,

                letter_of_request: null,
                quotation: null,
                specification_form: null,
                tool_of_trade: null,
                other_attachments: null,
              });

              dispatch(
                openToast({
                  message: res?.message,
                  duration: 5000,
                })
              );
            }

            const smsData = {
              system_name: "Vladimir",
              message: "You have a pending approval",
              mobile_number: "+639913117181",
            };

            postRequestSms(smsData);
          } catch (err) {
            console.log("err", err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err.data.message,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
              console.error(err);

              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err.data.message || "Something went wrong. Please try again.",
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

  // delete function for the container when adding a request
  const onDeleteHandler = async (id) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
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
              DELETE
            </Typography>{" "}
            this Item?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await deleteRequest(id).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log(err);
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

  // delete function for the transactionData
  const onDeleteReferenceHandler = async (id) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
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
              DELETE
            </Typography>{" "}
            this Item?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await deleteRequestContainer(id).unwrap();
            // console.log(result);
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log(err);
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

  //Delete/Clear all items in request container
  const onDeleteAllHandler = async () => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
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
              CLEAR
            </Typography>{" "}
            all requests?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await deleteAllRequest().unwrap();
            // console.log(result);
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log(err);
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

  // Remove function for the attachments
  const RemoveFile = ({ title, value }) => {
    return (
      <Tooltip title={`Remove ${title}`} arrow>
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

  // component used for the attachments
  const UpdateField = ({ value, label }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
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

  const onUpdateHandler = (props) => {
    const {
      id,
      can_resubmit,
      reference_number,
      type_of_request,
      cip_number,
      attachment_type,
      warehouse,
      major_category,
      minor_category,

      one_charging,
      company,
      business_unit,
      department,
      unit,
      subunit,
      location,
      small_tool,
      // account_title,
      accountability,
      accountable,
      acquisition_details,

      item,
      item_status,
      fixed_asset,
      asset_description,
      asset_specification,
      date_needed,
      quantity,
      unit_of_measure,
      brand,
      cellphone_number,
      additional_info,
      attachments,
    } = props;
    console.log("props", props);

    setUpdateRequest({
      id,
      can_resubmit,
      reference_number,
      type_of_request,
      cip_number,
      attachment_type,
      warehouse,
      major_category,
      minor_category,

      one_charging,
      company,
      business_unit,
      department,
      unit,
      subunit,
      location,
      small_tool_id: small_tool,
      // small_tool_id: small_tool.id,
      // account_title,
      accountability,
      accountable,
      acquisition_details,

      item_status,
      fixed_asset_id: fixed_asset,
      asset_description,
      asset_specification,
      small_tool_item: item,
      date_needed,
      brand,
      quantity,
      unit_of_measure,
      cellphone_number,
      additional_info,

      letter_of_request: attachments?.letter_of_request,
      quotation: attachments?.quotation,
      specification_form: attachments?.specification_form,
      tool_of_trade: attachments?.tool_of_trade,
      other_attachments: attachments?.other_attachments,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateRequest({
      can_resubmit: null,
      type_of_request_id: null,
      cip_number: "",
      attachment_type: null,
      // receiving_warehouse_id: null,
      minor_category_id: null,

      one_charging_id: null,
      company_id: null,
      department_id: null,
      subunit_id: null,
      location_id: null,
      // account_title_id: null,
      small_tool_id: null,
      acquisition_details: "",

      item_status: null,
      fixed_asset_id: null,
      asset_description: "",
      asset_specification: "",
      small_tool_item: null,
      date_needed: null,
      brand: "",
      accountability: null,
      accountable: null,
      cellphone_number: "",
      quantity: 1,
      uom_id: null,
      additional_info: "",

      letter_of_request: null,
      quotation: null,
      specification_form: null,
      tool_of_trade: null,
      other_attachments: null,
    });
  };

  // FORM of the request
  const formInputs = () => {
    return (
      <Box>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          ASSET
        </Typography>

        <Divider />

        <Box id="requestForm" className="request__form" component="form" onSubmit={handleSubmit(addRequestHandler)}>
          <Stack gap={2}>
            <Box sx={BoxStyle}>
              <Typography sx={sxSubtitle}>Request Information</Typography>

              <CustomAutoComplete
                control={control}
                name="type_of_request_id"
                options={typeOfRequestData}
                onOpen={() => (isTypeOfRequestSuccess ? null : typeOfRequestTrigger())}
                loading={isTypeOfRequestLoading}
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                disabled={updateRequest && disable}
                getOptionLabel={(option) => option?.type_of_request_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color="secondary"
                    label="Type of Request"
                    error={!!errors?.type_of_request_id}
                    helperText={errors?.type_of_request_id?.message}
                  />
                )}
                onChange={(_, value) => {
                  setValue("cip_number", "");
                  setValue("small_tool_id", null);
                  setValue("asset_description", "");
                  setValue("asset_specification", "");
                  setValue("quantity", 1);
                  return value;
                }}
              />

              {watch("type_of_request_id")?.type_of_request_name === "Capex" && (
                // <CustomAutoComplete
                //   name="cip_number"
                //   control={control}
                //   includeInputInList
                //   disablePortal
                //   disabled={updateRequest && disable}
                //   filterOptions={filterOptions}
                //   options={sedarData}
                //   onOpen={() => (isSedarSuccess ? null : sedarTrigger())}
                //   loading={isSedarLoading}
                //   getOptionLabel={(option) => option}
                //   isOptionEqualToValue={(option, value) => option === value}
                //   renderInput={(params) => (
                //     <TextField
                //       {...params}
                //       color="secondary"
                //       label="CIP Number"
                //       error={!!errors?.cip_number?.message}
                //       helperText={errors?.cip_number?.message}
                //     />
                //   )}
                // />

                <CustomTextField
                  control={control}
                  name="cip_number"
                  label="CIP Number (Optional)"
                  optional
                  type="text"
                  disabled={updateRequest && disable}
                  error={!!errors?.cip_number}
                  helperText={errors?.cip_number?.message}
                  fullWidth
                />
              )}

              <CustomTextField
                control={control}
                name="acquisition_details"
                label="Acquisition Details"
                type="text"
                disabled={updateRequest && disable}
                onBlur={() =>
                  handleInputValidation("acquisition_details", "acquisition_details", "acquisition_details")
                }
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                error={!!errors?.acquisition_details}
                helperText={errors?.acquisition_details?.message}
                fullWidth
                multiline
                sx={{ overscrollBehavior: "none" }}
                maxRows={6}
                allowSpecialCharacters
              />

              <CustomAutoComplete
                control={control}
                name="attachment_type"
                options={attachmentType}
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                disabled={updateRequest && disable}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color="secondary"
                    label="Attachment Type"
                    error={!!errors?.attachment_type}
                    helperText={errors?.attachment_type?.message}
                  />
                )}
              />

              {/* <CustomAutoComplete
                control={control}
                name="receiving_warehouse_id"
                options={warehouseData}
                onOpen={() => (isWarehouseSuccess ? null : warehouseTrigger(0))}
                onBlur={() => handleInputValidation("receiving_warehouse_id", "warehouse?.id", "warehouse")}
                loading={isWarehouseLoading}
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                disabled={updateRequest && disable}
                getOptionLabel={(option) => option.warehouse_name}
                getOptionKey={(option) => option.warehouse_code}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color="secondary"
                    label="Warehouse"
                    error={!!errors?.receiving_warehouse_id}
                    helperText={errors?.receiving_warehouse_id?.message}
                  />
                )}
              /> */}

              {/* <CustomAutoComplete
                control={control}
                name="receiving_warehouse_id"
                options={userWarehouse}
                // onOpen={() => (isWarehouseSuccess ? null : warehouseTrigger(0))}
                // onBlur={() => handleInputValidation("receiving_warehouse_id", "warehouse?.id", "warehouse")}
                loading={isWarehouseLoading}
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                disabled={(updateRequest && disable) || userCoa?.location?.warehouse?.length === 1}
                defaultValue={userCoa?.location?.warehouse.length === 1 && userCoa?.location?.warehouse[0]}
                getOptionLabel={(option) => option.warehouse_name}
                getOptionKey={(option) => option.warehouse_code}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color="secondary"
                    label="Warehouse"
                    error={!!errors?.receiving_warehouse_id}
                    helperText={errors?.receiving_warehouse_id?.message}
                  />
                )}
              /> */}
            </Box>

            <Divider />

            <Box sx={BoxStyle}>
              <Typography sx={sxSubtitle}>Category Information</Typography>
              <CustomAutoComplete
                name="minor_category_id"
                control={control}
                options={
                  watch("type_of_request_id")?.type_of_request_name === "Small Tools"
                    ? minorCategorySmallToolsData
                    : minorCategoryData
                }
                onOpen={() =>
                  watch("type_of_request_id")?.type_of_request_name === "Small Tools"
                    ? isMinorCategorySmallToolsSuccess
                      ? null
                      : minorCategorySmallToolsTrigger()
                    : isMinorCategorySuccess
                    ? null
                    : minorCategoryTrigger()
                }
                loading={
                  watch("type_of_request_id")?.type_of_request_name === "Small Tools"
                    ? isMinorCategorySmallToolsLoading
                    : isMinorCategoryLoading
                }
                disabled={updateRequest && disable}
                size="small"
                getOptionLabel={(option) => `${option.id} - ${option.minor_category_name}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    color={"secondary"}
                    {...params}
                    label="Minor Category"
                    error={!!errors?.minor_category_id}
                    helperText={errors?.minor_category_id?.message}
                  />
                )}
              />
            </Box>

            <Divider />

            <Box sx={BoxStyle}>
              <Typography sx={sxSubtitle}>Charging Information</Typography>

              <CustomAutoComplete
                autoComplete
                control={control}
                name="one_charging_id"
                disabled={updateRequest && disable}
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
                    setValue("company_id", null);
                    setValue("business_unit_id", null);
                    setValue("unit_id", null);
                    setValue("subunit_id", null);
                    setValue("location_id", null);
                  }
                  setValue("fixed_asset_id", null);
                  setValue("small_tool_item", null);
                  setValue("asset_description", "");
                  setValue("asset_specification", "");
                  return value;
                }}
              />

              <CustomAutoComplete
                autoComplete
                control={control}
                name="department_id"
                // disabled={updateRequest && disable}
                disabled
                options={departmentData}
                onOpen={() =>
                  isDepartmentSuccess ? null : (departmentTrigger(), companyTrigger(), businessUnitTrigger())
                }
                loading={isDepartmentLoading}
                size="small"
                getOptionLabel={(option) => option.department_code + " - " + option.department_name}
                isOptionEqualToValue={(option, value) => option.department_id === value.department_id}
                getOptionKey={(option, index) => `${option.id}-${index}`}
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
                //   setValue("fixed_asset_id", null);
                //   setValue("small_tool_item", null);
                //   setValue("asset_description", "");
                //   setValue("asset_specification", "");
                //   return value;
                // }}
              />

              <CustomAutoComplete
                autoComplete
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
                // disabled={updateRequest && disable}
                disabled
                options={departmentData?.filter((obj) => obj?.id === watch("department_id")?.id)[0]?.unit || []}
                onOpen={() => (isUnitSuccess ? null : (unitTrigger(), subunitTrigger(), locationTrigger()))}
                loading={isUnitLoading}
                size="small"
                getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
                isOptionEqualToValue={(option, value) => option?.unit_id === value?.unit_id}
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
                  setValue("subunit_id", null);
                  setValue("location_id", null);
                  return value;
                }}
              />

              <CustomAutoComplete
                autoComplete
                name="subunit_id"
                control={control}
                // disabled={updateRequest && disable}
                disabled
                options={unitData?.filter((obj) => obj?.id === watch("unit_id")?.id)[0]?.subunit || []}
                loading={isSubUnitLoading}
                size="small"
                getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
                isOptionEqualToValue={(option, value) => option.subunit_id === value.subunit_id}
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
                // disabled={updateRequest && disable}
                disabled
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
                onChange={(_, value) => {
                  setValue("fixed_asset_id", null);
                  setValue("small_tool_item", null);
                  setValue("asset_description", "");
                  setValue("asset_specification", "");
                  return value;
                }}
              />

              {/* <CustomAutoComplete
                name="account_title_id"
                control={control}
                // disabled={transactionData ? transactionData?.length !== 0 : addRequestAllApi?.length !== 0}
                options={accountTitleData}
                onOpen={() => (isAccountTitleSuccess ? null : accountTitleTrigger())}
                loading={isAccountTitleLoading}
                disabled={updateRequest && disable}
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

              <CustomAutoComplete
                autoComplete
                name="accountability"
                hasRequest={hasRequest && true}
                control={control}
                options={["Personal Issued", "Common"]}
                disabled={updateRequest && disable}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color={hasRequest ? "primary" : "secondary"}
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
                  hasRequest={hasRequest && true}
                  control={control}
                  includeInputInList
                  disablePortal
                  disabled={updateRequest && disable}
                  filterOptions={filterOptions}
                  options={sedarData}
                  onOpen={() => (isSedarSuccess ? null : sedarTrigger())}
                  loading={isSedarLoading}
                  getOptionLabel={(option) => option.general_info?.full_id_number_full_name}
                  isOptionEqualToValue={(option, value) =>
                    option.general_info?.full_id_number === value.general_info?.full_id_number
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      color={hasRequest ? "primary" : "secondary"}
                      label="Accountable"
                      error={!!errors?.accountable?.message}
                      helperText={errors?.accountable?.message}
                    />
                  )}
                />
              )}
            </Box>

            <Divider />

            {/* Asset Information */}
            <Box sx={BoxStyle}>
              <Typography sx={sxSubtitle}>Asset Information</Typography>
              <CustomAutoComplete
                name="item_status"
                hasRequest={hasRequest && true}
                control={control}
                includeInputInList
                disablePortal
                disabled={updateRequest && disable}
                filterOptions={filterOptions}
                options={[
                  "New",
                  "Replacement",
                  // , "Additional"
                ]}
                // getOptionLabel={(option) => option.general_info?.full_id_number_full_name}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color={hasRequest ? "primary" : "secondary"}
                    label="Item Status"
                    error={!!errors?.item_status?.message}
                    helperText={errors?.item_status?.message}
                  />
                )}
                onChange={(_, value) => {
                  setValue("fixed_asset_id", null);
                  setValue("small_tool_id", null);
                  setValue("small_tool_item", null);
                  setValue("asset_description", "");
                  setValue("asset_specification", "");
                  setValue("quantity", 1);

                  return value;
                }}
              />

              {watch("item_status") === "Replacement" &&
                watch("type_of_request_id")?.type_of_request_name === "Small Tools" && (
                  <CustomAutoComplete
                    name="fixed_asset_id"
                    hasRequest={hasRequest && true}
                    control={control}
                    options={fixedAssetSmallToolsApiData}
                    onOpen={() =>
                      // fixedAssetSmallToolsApiSuccess
                      //   ? null
                      //   :
                      fixedAssetSmallToolsTrigger({ sub_unit_id: watch("subunit_id")?.id })
                    }
                    loading={fixedAssetSmallToolsApiLoading}
                    disabled={updateRequest && disable}
                    size="small"
                    getOptionLabel={(option) =>
                      `${option?.is_printable === 0 ? "No Vladimir Tag" : option?.vladimir_tag_number} - ${
                        option?.asset_description
                      }`
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        color="secondary"
                        {...params}
                        label="Fixed Asset"
                        error={!!errors?.fixed_asset_id}
                        helperText={errors?.fixed_asset_id?.message}
                        multiline
                        maxRows={3}
                      />
                    )}
                    onChange={(_, value) => {
                      console.log("value", value);
                      if (value) {
                        setValue("small_tool_id", value?.small_tools);
                        setValue("asset_description", value?.asset_description);
                        setValue(
                          "asset_specification",
                          value.small_tools.length === 0
                            ? value?.small_tools[0]?.description || value?.asset_specification
                            : value.small_tools.map((items) => ` ${items.description}-${items.specification}`).join()
                        );
                      } else {
                        setValue("small_tool_id", null);
                        setValue("small_tool_item", null);

                        setValue("asset_description", "");
                        setValue("asset_specification", "");
                      }
                      return value;
                    }}
                  />
                )}
              {/* {watch("type_of_request_id")?.type_of_request_name === "Small Tools" && (
                <CustomAutoComplete
                  name="small_tool_id"
                  hasRequest={hasRequest && true}
                  control={control}
                  options={smallToolsApiData}
                  onOpen={() => (smallToolsApiSuccess ? null : smallToolsTrigger())}
                  loading={smallToolsApiLoading}
                  disabled={(updateRequest && disable) || watch("item_status") === "Replacement"}
                  size="small"
                  getOptionLabel={(option) => `${option?.small_tool_code} - ${option?.small_tool_name}`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Small Tools"
                      error={!!errors?.small_tool_id}
                      helperText={errors?.small_tool_id?.message}
                    />
                  )}
                  onChange={(_, value) => {
                    console.log("value", value);
                    if (value) {
                      setValue("asset_description", value.small_tool_name);
                      setValue(
                        "asset_specification",
                        value.items.length === 0
                          ? value.small_tool_name
                          : value.items.map((items) => ` ${items.item_name}`).join()
                      );
                    } else {
                      setValue("asset_description", "");
                      setValue("asset_specification", "");
                    }
                    return value;
                  }}
                />
              )} */}
              <CustomTextField
                control={control}
                hasRequest={hasRequest && true}
                name="asset_description"
                label="Asset Description"
                type="text"
                disabled={
                  (updateRequest && disable) ||
                  (watch("type_of_request_id")?.type_of_request_name === "Small Tools" &&
                    watch("item_status") === "Replacement")
                }
                allowSpecialCharacters
                error={!!errors?.asset_description}
                helperText={errors?.asset_description?.message}
                fullWidth
                multiline
                maxRows={5}
              />
              <CustomTextField
                control={control}
                hasRequest={hasRequest && true}
                name="asset_specification"
                label="Asset Specification"
                type="text"
                disabled={
                  (updateRequest && disable) ||
                  (watch("type_of_request_id")?.type_of_request_name === "Small Tools" &&
                    watch("item_status") === "Replacement")
                }
                allowSpecialCharacters
                error={!!errors?.asset_specification}
                helperText={errors?.asset_specification?.message}
                fullWidth
                // sx={{ overscrollBehavior: "none" }}
                multiline
                // minRows={3}
                maxRows={5}
              />

              {watch("item_status") === "Replacement" &&
              watch("type_of_request_id")?.type_of_request_name === "Small Tools" &&
              watch("fixed_asset_id")?.small_tools?.length >= 1 ? (
                <CustomAutoComplete
                  name="small_tool_item"
                  hasRequest={hasRequest && true}
                  control={control}
                  options={
                    watch("fixed_asset_id")?.small_tools?.filter((item) => item.status_description === "Good") ||
                    updateRequest?.small_tool_item?.filter((item) => item.status_description === "Good") ||
                    []
                  }
                  // onOpen={() =>
                  //   fixedAssetSmallToolsApiSuccess ? null : fixedAssetSmallToolsTrigger({ replacement: 1 })
                  // }
                  // loading={fixedAssetSmallToolsApiLoading}
                  disabled={updateRequest && disable}
                  size="small"
                  getOptionLabel={(option) => `${option?.description} - ${option?.specification}`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      color="secondary"
                      {...params}
                      label="Small Tool Item"
                      error={!!errors?.small_tool_item}
                      helperText={errors?.small_tool_item?.message}
                    />
                  )}
                />
              ) : null}

              <CustomTextField
                control={control}
                name="brand"
                label="Brand (Optional)"
                optional
                type="text"
                disabled={updateRequest && disable}
                error={!!errors?.brand}
                helperText={errors?.brand?.message}
                fullWidth
              />
              <CustomDatePicker
                control={control}
                name="date_needed"
                hasRequest={hasRequest && true}
                label="Date Needed"
                size="small"
                disabled={updateRequest && disable}
                error={!!errors?.date_needed}
                helperText={errors?.date_needed?.message}
                minDate={new Date()}
                reduceAnimations
              />
              <CustomNumberField
                control={control}
                hasRequest={hasRequest && true}
                name="quantity"
                label="Quantity"
                type="number"
                disabled={
                  updateRequest && disable
                  // ||
                  // (watch("item_status") === "Replacement" &&
                  //   watch("type_of_request_id")?.type_of_request_name === "Small Tools")
                }
                error={!!errors?.quantity || watch("small_tool_item")?.quantity < watch("quantity")}
                helperText={errors?.quantity?.message}
                fullWidth
                isAllowed={(values) => {
                  const { floatValue } = values;
                  return floatValue >= 1;
                }}
              />
              {watch("small_tool_item")?.quantity < watch("quantity") && (
                <Typography my={-1} color="error" fontSize={11} ml={1}>
                  Quantity exceeded Small Tool Item quantity.
                </Typography>
              )}
              <CustomAutoComplete
                control={control}
                hasRequest={hasRequest && true}
                name="uom_id"
                options={uomData}
                onOpen={() => (isUnitOfMeasurementSuccess ? null : uomTrigger())}
                loading={isUnitOfMeasurementLoading}
                disabled={updateRequest && disable}
                getOptionLabel={(option) => {
                  return `${option.uom_code} - ${option.uom_name}`;
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color={hasRequest ? "primary" : "secondary"}
                    label="UOM"
                    error={!!errors?.uom_id}
                    helperText={errors?.uom_id?.message}
                  />
                )}
              />
              <CustomPatternField
                control={control}
                name="cellphone_number"
                label="Cellphone # (Optional)"
                optional
                type="text"
                disabled={updateRequest && disable}
                error={!!errors?.cellphone_number}
                helperText={errors?.cellphone_number?.message}
                format="(09##) - ### - ####"
                // allowEmptyFormatting
                valueIsNumericString
                fullWidth
              />
              <CustomTextField
                control={control}
                name="additional_info"
                label="Capex Num / Unit Charging"
                // optional
                hasRequest={hasRequest && true}
                type="text"
                disabled={updateRequest && disable}
                fullWidth
                sx={{ overscrollBehavior: "contained" }}
                multiline
                minRows={3}
                maxRows={5}
                allowSpecialCharacters
              />
            </Box>

            <Divider />

            {/* Attachments */}
            <Box sx={BoxStyle}>
              <Typography sx={sxSubtitle}>Attachments</Typography>
              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("letter_of_request") !== null ? (
                  <UpdateField
                    label={"Letter of Request"}
                    // value={
                    //   transactionDataApi.length === 0
                    //     ? watch("letter_of_request")?.name || updateRequest?.letter_of_request?.file_name
                    //     : watch("letter_of_request")?.name
                    // }
                    value={watch("letter_of_request")?.name || updateRequest?.letter_of_request?.file_name}
                  />
                ) : (
                  <CustomAttachment
                    control={control}
                    hasRequest={hasRequest && true}
                    watch={watch("attachment_type") === "Unbudgeted" && true}
                    name="letter_of_request"
                    label={`Letter of Request ${watch("attachment_type") === "Unbudgeted" ? "" : "(Optional)"}`}
                    optional={watch("attachment_type") === "Unbudgeted" ? false : true}
                    disabled={updateRequest && disable}
                    inputRef={LetterOfRequestRef}
                    error={!!errors?.letter_of_request?.message}
                    helperText={errors?.letter_of_request?.message}
                  />
                )}

                {watch("letter_of_request") !== null && (
                  <RemoveFile title="Letter of Request" value="letter_of_request" />
                )}
              </Stack>

              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("quotation") !== null ? (
                  <UpdateField
                    label={"Quotation"}
                    value={watch("quotation")?.name || updateRequest?.quotation?.file_name}
                  />
                ) : (
                  <CustomAttachment
                    control={control}
                    name="quotation"
                    label="Quotation (Optional)"
                    optional
                    disabled={updateRequest && disable}
                    inputRef={QuotationRef}
                  />
                )}
                {watch("quotation") !== null && <RemoveFile title="Quotation" value="quotation" />}
              </Stack>

              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("specification_form") !== null ? (
                  <UpdateField
                    label={"Specification Form"}
                    value={watch("specification_form")?.name || updateRequest?.specification_form?.file_name}
                  />
                ) : (
                  <CustomAttachment
                    control={control}
                    name="specification_form"
                    label="Specification Form (Optional)"
                    optional
                    disabled={updateRequest && disable}
                    inputRef={SpecificationRef}
                    // updateData={updateRequest}
                  />
                )}
                {watch("specification_form") !== null && (
                  <RemoveFile title="Specification" value="specification_form" />
                )}
              </Stack>

              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("tool_of_trade") !== null ? (
                  <UpdateField
                    label={"Tool of Trade"}
                    value={watch("tool_of_trade")?.name || updateRequest?.tool_of_trade?.file_name}
                  />
                ) : (
                  <CustomAttachment
                    control={control}
                    name="tool_of_trade"
                    label="Tool of Trade (Optional)"
                    optional
                    disabled={updateRequest && disable}
                    inputRef={ToolOfTradeRef}
                  />
                )}
                {watch("tool_of_trade") !== null && <RemoveFile title="Tool of Trade" value="tool_of_trade" />}
              </Stack>

              <Stack flexDirection="row" gap={1} alignItems="center">
                {watch("other_attachments") !== null ? (
                  <UpdateField
                    label={"Other Attachments"}
                    value={watch("other_attachments")?.name || updateRequest?.other_attachments?.file_name}
                  />
                ) : (
                  <CustomAttachment
                    control={control}
                    name="other_attachments"
                    label="Other Attachments (Optional)"
                    optional
                    disabled={updateRequest && disable}
                    inputRef={OthersRef}
                    error={!!errors?.other_attachments?.message}
                    helperText={errors?.other_attachments?.message}
                  />
                )}
                {watch("other_attachments") !== null && (
                  <RemoveFile title="Other Attachments" value="other_attachments" />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ pb: 1, mb: 1 }} />

        <LoadingButton
          loading={isLoading}
          form="requestForm"
          variant="contained"
          type="submit"
          size="small"
          disabled={
            (!transactionData ? !isValid : updateToggle) ||
            watch("small_tool_item")?.quantity < watch("quantity") ||
            (watch("item_status") === "Replacement" &&
              watch("type_of_request_id")?.type_of_request_name === "Small Tools" &&
              watch("fixed_asset_id")?.small_tools?.length >= 1 &&
              watch("small_tool_item") === null) === true
          }
          fullWidth
          sx={{ gap: 1 }}
        >
          {transactionData ? <Update /> : editRequest ? <Update /> : <AddToPhotos />}{" "}
          <Typography>{transactionData ? "UPDATE" : editRequest ? "UPDATE" : "ADD"}</Typography>
        </LoadingButton>
        <Divider orientation="vertical" />
      </Box>
    );
  };

  // validation for the acquisition details and warehouse
  const handleInputValidation = (watchItem, data, name) => {
    const watchData = watch(`${watchItem}`);
    const isWatchDataEmpty = watchItem === "";
    const isTransactionData = Boolean(transactionData);
    const isDataAvailable = isTransactionData ? transactionDataApi.length > 0 : addRequestAllApi.length > 0;
    const currentData = isTransactionData ? updateRequest?.[data] : addRequestAllApi[0]?.[data];
    const newData = isTransactionData ? updateRequest?.[name] : addRequestAllApi[0]?.[name];

    if (isWatchDataEmpty || !isDataAvailable) {
      return null;
    }

    if (currentData !== (watchData || watchData?.id)) {
      return dispatch(
        openConfirm({
          icon: Warning,
          iconColor: "alert",
          message: (
            <Box>
              <Typography>Are you sure you want to change</Typography>
              <Typography
                sx={{
                  display: "inline-block",
                  color: "secondary.main",
                  fontWeight: "bold",
                }}
              >
                {name.toUpperCase().replace(/_/g, " ")}?
              </Typography>
              <Typography>
                it will apply to all Items after clicking {transactionData ? "Update" : editRequest ? "Update" : "Add"}
              </Typography>
            </Box>
          ),
          onConfirm: () => {
            dispatch(closeConfirm());
          },
          onDismiss: () => {
            if (currentData !== data) {
              setValue(`${watchItem}`, newData);
            }
          },
        })
      );
    }
  };

  // function for showing the items after PO to check if there are cancelled items
  const handleShowItems = (data) => {
    transactionData && data?.po_number && data?.is_removed === 0 && dispatch(openDialog()) && setItemData(data);
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  const sxSubtitle = {
    fontWeight: "bold",
    color: "secondary.main",
    fontFamily: "Anton",
    fontSize: "16px",
  };

  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
    pb: "10px",
  };

  // function to format the viewing of accountable in the container of the request
  const formatAccountable = (str) => {
    const [id, lastName, firstName] = str.split(/[\s,]+/);
    return (
      <>
        <Typography fontSize={14} fontWeight={600} color="secondary.main">
          {id}
        </Typography>
        <Typography fontSize={12} color="secondary.light">{`${firstName} ${lastName}`}</Typography>
      </>
    );
  };

  // for the timeline view/colors
  const transactionStatus = (data) => {
    let statusColor, hoverColor, textColor, variant;
    switch (data) {
      case "Approved":
        statusColor = "success.light";
        hoverColor = "success.main";
        textColor = "white";
        variant = "filled";
        break;

      case "Claimed":
        statusColor = "success.dark";
        hoverColor = "success.dark";
        variant = "filled";
        break;

      case "Sent to ymir for PO":
        statusColor = "ymir.light";
        hoverColor = "ymir.main";
        variant = "filled";
        break;

      case "Returned":
      case "Cancelled":
      case "Returned From Ymir":
        statusColor = "error.light";
        hoverColor = "error.main";
        variant = "filled";
        break;

      default:
        statusColor = "success.main";
        hoverColor = "none";
        textColor = "success.main";
        variant = "outlined";
    }

    return (
      <Chip
        placement="top"
        size="small"
        variant={variant}
        sx={{
          ...(variant === "filled" && {
            backgroundColor: statusColor,
            color: "white",
          }),
          ...(variant === "outlined" && {
            borderColor: statusColor,
            color: textColor,
          }),
          fontSize: "11px",
          px: 1,
        }}
        label={data}
      />
    );
  };

  // console.log("pewqpwepeewpw", transactionData);

  return (
    <>
      {errorRequest && errorTransaction ? (
        <ErrorFetching refetch={isRequestRefetch || isTransactionRefetch} error={errorRequest || errorTransaction} />
      ) : (
        <Box className="mcontainer">
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<ArrowBackIosRounded color="secondary" />}
            onClick={() => {
              transactionData?.requestMonitoring
                ? navigate("/request-monitoring")
                : transactionData?.warehouseMonitoring
                ? navigate("/warehouse-monitoring")
                : navigate("/asset-requisition/requisition");
              // navigate(-1);
              // deleteAllRequest();
            }}
            disableRipple
            sx={{ width: "90px", ml: "-15px", mt: "-5px", pb: "10px", "&:hover": { backgroundColor: "transparent" } }}
          >
            Back
          </Button>

          <Box className={isSmallScreen ? "request request__wrapper" : "request__wrapper"} p={2}>
            {/* FORM */}
            {/* {transactionData ? (transactionData?.process_count === 1 ? formInputs() : null) : formInputs()} */}
            {!transactionData
              ? formInputs()
              : transactionData?.requestMonitoring || transactionData?.warehouseMonitoring
              ? null
              : transactionData?.can_edit === 1 && formInputs()}

            {/* TABLE */}
            <Box className="request__table">
              <Stack flexDirection="row" alignItems="center" gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
                  {`${transactionData ? `TRANSACTION NO. ${transactionData?.transaction_number}` : "FIXED ASSET"}`}
                </Typography>
                {transactionData && transactionStatus(requisitionStatus)}
              </Stack>

              <TableContainer className="request__th-body  request__wrapper">
                <Table className="request__table" stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell className="tbl-cell">{transactionData ? "Ref No." : "Index"}</TableCell>
                      <TableCell className="tbl-cell">Type of Request</TableCell>
                      <TableCell className="tbl-cell">Acquisition Details</TableCell>
                      {/* <TableCell className="tbl-cell">Attachment Type</TableCell> */}
                      <TableCell className="tbl-cell">Warehouse</TableCell>
                      <TableCell className="tbl-cell">Accounting Entries</TableCell>
                      <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                      <TableCell className="tbl-cell">Accountability</TableCell>
                      <TableCell className="tbl-cell">Asset Information</TableCell>
                      <TableCell className="tbl-cell">Brand</TableCell>
                      <TableCell className="tbl-cell">Date Needed</TableCell>

                      {addRequestAllApi && !transactionDataApi[0]?.po_number && (
                        <>
                          <TableCell className="tbl-cell text-center">Quantity</TableCell>
                          <TableCell className="tbl-cell text-center">UOM</TableCell>
                        </>
                      )}
                      {transactionData && transactionDataApi[0]?.po_number && (
                        <>
                          <TableCell className="tbl-cell text-center">Ordered</TableCell>
                          <TableCell className="tbl-cell text-center">Delivered</TableCell>
                          <TableCell className="tbl-cell text-center">Remaining</TableCell>
                          <TableCell className="tbl-cell text-center">Cancelled</TableCell>
                        </>
                      )}
                      {transactionData &&
                        // transactionDataApi[0]?.po_number &&
                        transactionDataApi[0]?.is_removed === 1 && (
                          <>
                            <TableCell className="tbl-cell text-center">Ordered</TableCell>
                            <TableCell className="tbl-cell text-center">Delivered</TableCell>
                            <TableCell className="tbl-cell text-center">Remaining</TableCell>
                            <TableCell className="tbl-cell text-center">Cancelled</TableCell>
                          </>
                        )}
                      <TableCell className="tbl-cell">Cellphone #</TableCell>
                      <TableCell className="tbl-cell">Capex Num / Unit Charging</TableCell>
                      <TableCell className="tbl-cell">Attachments</TableCell>
                      {transactionData?.requestMonitoring || transactionData?.warehouseMonitoring
                        ? null
                        : (transactionData?.can_edit === 1 || !transactionData) && (
                            <TableCell className="tbl-cell">Action</TableCell>
                          )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(updateRequest && (isTransactionLoading || isTransactionFetching)) ||
                    isRequestLoading ||
                    isRequestFetching ? (
                      <LoadingData />
                    ) : (transactionData ? transactionDataApi?.length === 0 : addRequestAllApi?.length === 0) ? (
                      <NoRecordsFound heightData="medium" />
                    ) : (
                      <>
                        {(transactionData ? transactionDataApi : addRequestAllApi)?.map((data, index) => (
                          <TableRow
                            hover={Boolean(selectedId === null)}
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                              bgcolor:
                                data?.is_removed === 1 ? "#ff00002f" : selectedId === index ? "#f0f0f0" : "transparent",
                              "*": { color: data?.is_removed === 1 ? "black!important" : null },
                              cursor: transactionData && transactionDataApi[0]?.po_number ? "pointer" : null,
                              // "&:hover": { backgroundColor: selectedId === index ? "#f5f5f5" : "#f0f0f0" },
                            }}
                          >
                            <TableCell
                              onClick={() => handleShowItems(data)}
                              className="tbl-cell tr-cen-pad45 text-weight"
                            >
                              {transactionData ? data?.reference_number : index + 1}
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              <Typography fontWeight={600}>{data.type_of_request?.type_of_request_name}</Typography>

                              <Typography
                                fontWeight={400}
                                fontSize={12}
                                color={data.attachment_type === "Budgeted" ? "success.main" : "primary.dark"}
                              >
                                {data.attachment_type}
                              </Typography>

                              <Typography fontSize={12} fontWeight={600} color="primary.main">
                                {data.is_addcost === 1 && "Additional Cost"}
                              </Typography>
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.acquisition_details}
                            </TableCell>
                            {/* <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.attachment_type}
                            </TableCell> */}
                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.warehouse?.warehouse_name}
                            </TableCell>

                            <TableCell className="tbl-cell-category capitalized">
                              <Typography fontSize={11} color="secondary.light" noWrap>
                                Inital Debit : ({data.initial_debit?.account_title_code})-
                                {data.initial_debit?.account_title_name}
                              </Typography>
                              {/* <Typography fontSize={11} color="secondary.light" noWrap>
                                Inital Credit : ({data.initial_credit?.account_title_code})-{" "}
                                {data.initial_credit?.account_title_name}
                              </Typography>
                              <Typography fontSize={11} color="secondary.light" noWrap>
                                Depreciation Debit : ({data.depreciation_debit?.account_title_code})-
                                {data.depreciation_debit?.account_title_name}
                              </Typography> */}
                              <Typography fontSize={11} color="secondary.light" noWrap>
                                Depreciation Credit : ({data.depreciation_credit?.account_title_code})-{" "}
                                {data.depreciation_credit?.account_title_name}
                              </Typography>
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.code}) - ${data.one_charging?.name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.company_code}) - ${data.one_charging?.company_name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.business_unit_code}) - ${data.one_charging?.business_unit_name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.department?.department_code}) - ${data.one_charging?.department_name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.unit_code}) - ${data.one_charging?.unit_name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.subunit_code}) - ${data.one_charging?.subunit_name}`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.location_code}) - ${data.one_charging?.location_name}`}
                              </Typography>
                              {/* <Typography fontSize={10} color="gray">
                                {`(${data.account_title?.account_title_code}) - ${data.account_title?.account_title_name}`}
                              </Typography> */}
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.accountability === "Personal Issued"
                                ? formatAccountable(data?.accountable)
                                : "Common"}
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              <Typography fontWeight={600} fontSize="14px" color="secondary.main">
                                {data.asset_description}
                              </Typography>
                              <Tooltip title={data.asset_specification} placement="bottom" arrow>
                                <Typography
                                  fontSize="12px"
                                  color="text.light"
                                  textOverflow="ellipsis"
                                  width="300px"
                                  overflow="hidden"
                                >
                                  {data.asset_specification}
                                </Typography>
                              </Tooltip>
                              <Typography fontSize="12px" fontWeight={600} color="primary">
                                STATUS - {data.item_status}
                              </Typography>
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.brand}
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.date_needed}
                            </TableCell>

                            {addRequestAllApi && !data.po_number && (
                              <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                {data.quantity}
                              </TableCell>
                            )}

                            {addRequestAllApi && !data.po_number && (
                              <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                {data.unit_of_measure?.uom_name}
                              </TableCell>
                            )}

                            {transactionData && data.po_number && (
                              <>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.ordered}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.delivered}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.remaining}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.cancelled}
                                </TableCell>
                              </>
                            )}

                            {!addRequestAllApi && transactionData && !data.po_number && data?.is_removed === 1 && (
                              <>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.ordered}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.delivered}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.remaining}
                                </TableCell>
                                <TableCell onClick={() => handleShowItems(data)} className="tbl-cell text-center">
                                  {data.cancelled}
                                </TableCell>
                              </>
                            )}

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              {data.cellphone_number === null ? "-" : data.cellphone_number}
                            </TableCell>

                            <TableCell onClick={() => handleShowItems(data)} className="tbl-cell">
                              <Typography
                                fontSize={14}
                                fontWeight={400}
                                maxWidth="440px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                color="secondary.main"
                              >
                                <Tooltip
                                  title={data.additional_info}
                                  placement="top-start"
                                  arrow
                                  // slots={{
                                  //   transition: Zoom,
                                  // }}
                                >
                                  {data.additional_info}
                                </Tooltip>
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell">
                              {data?.attachments?.letter_of_request && (
                                <Stack flexDirection="row" gap={1}>
                                  <Typography fontSize={12} fontWeight={600}>
                                    Letter of Request:
                                  </Typography>
                                  <Tooltip title={"View or Download Letter of Request"} arrow>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => {
                                        data.attachments.letter_of_request.file_name.includes("pdf") ||
                                        data.attachments.letter_of_request.file_name.includes("jpg") ||
                                        data.attachments.letter_of_request.file_name.includes("jpeg") ||
                                        data.attachments.letter_of_request.file_name.includes("svg") ||
                                        data.attachments.letter_of_request.file_name.includes("png")
                                          ? handleOpenDrawer({
                                              value: data.attachments.letter_of_request,
                                              data: data,
                                              name: "letter_of_request",
                                            })
                                          : handleDownloadAttachment({ value: "letter_of_request", id: data?.id });
                                      }}
                                    >
                                      {data?.attachments?.letter_of_request?.file_name}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              )}

                              {data?.attachments?.quotation && (
                                <Stack flexDirection="row" gap={1}>
                                  <Typography fontSize={12} fontWeight={600}>
                                    Quotation:
                                  </Typography>
                                  <Tooltip title={"View or Download Quotation"} arrow>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => {
                                        data.attachments.quotation.file_name.includes("pdf") ||
                                        data.attachments.quotation.file_name.includes("jpg") ||
                                        data.attachments.quotation.file_name.includes("jpeg") ||
                                        data.attachments.quotation.file_name.includes("svg") ||
                                        data.attachments.quotation.file_name.includes("png")
                                          ? handleOpenDrawer({
                                              value: data.attachments.quotation,
                                              data: data,
                                              name: "quotation",
                                            })
                                          : handleDownloadAttachment({ value: "quotation", id: data?.id });
                                      }}
                                    >
                                      {data?.attachments?.quotation?.file_name}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              )}

                              {data?.attachments?.specification_form && (
                                <Stack flexDirection="row" gap={1}>
                                  <Typography fontSize={12} fontWeight={600}>
                                    Specification:
                                  </Typography>
                                  <Tooltip title={"View or Download Specification Form"} arrow>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => {
                                        data.attachments.specification_form.file_name.includes("pdf") ||
                                        data.attachments.specification_form.file_name.includes("jpg") ||
                                        data.attachments.specification_form.file_name.includes("jpeg") ||
                                        data.attachments.specification_form.file_name.includes("svg") ||
                                        data.attachments.specification_form.file_name.includes("png")
                                          ? handleOpenDrawer({
                                              value: data.attachments.specification_form,
                                              data: data,
                                              name: "specification_form",
                                            })
                                          : handleDownloadAttachment({ value: "specification_form", id: data?.id });
                                      }}
                                    >
                                      {data?.attachments?.specification_form?.file_name}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              )}

                              {data?.attachments?.tool_of_trade && (
                                <Stack flexDirection="row" gap={1}>
                                  <Typography fontSize={12} fontWeight={600}>
                                    Tool of Trade:
                                  </Typography>
                                  <Tooltip title={"View or Download Tool of Trade"} arrow>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => {
                                        data.attachments.tool_of_trade.file_name.includes("pdf") ||
                                        data.attachments.tool_of_trade.file_name.includes("jpg") ||
                                        data.attachments.tool_of_trade.file_name.includes("jpeg") ||
                                        data.attachments.tool_of_trade.file_name.includes("svg") ||
                                        data.attachments.tool_of_trade.file_name.includes("png")
                                          ? handleOpenDrawer({
                                              value: data.attachments.tool_of_trade,
                                              data: data,
                                              name: "tool_of_trade",
                                            })
                                          : handleDownloadAttachment({ value: "tool_of_trade", id: data?.id });
                                      }}
                                    >
                                      {data?.attachments?.tool_of_trade?.file_name}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              )}

                              {data?.attachments?.other_attachments && (
                                <Stack flexDirection="row" gap={1}>
                                  <Typography fontSize={12} fontWeight={600}>
                                    Other Attachment:
                                  </Typography>
                                  <Tooltip title={"View or Download Other Attachment"} arrow>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => {
                                        data.attachments.other_attachments.file_name.includes("pdf") ||
                                        data.attachments.other_attachments.file_name.includes("jpg") ||
                                        data.attachments.other_attachments.file_name.includes("jpeg") ||
                                        data.attachments.other_attachments.file_name.includes("svg") ||
                                        data.attachments.other_attachments.file_name.includes("png")
                                          ? handleOpenDrawer({
                                              value: data.attachments.other_attachments,
                                              data: data,
                                              name: "other_attachments",
                                            })
                                          : handleDownloadAttachment({ value: "other_attachments", id: data?.id });
                                      }}
                                    >
                                      {data?.attachments?.other_attachments?.file_name}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              )}
                            </TableCell>

                            {transactionData?.requestMonitoring || transactionData?.warehouseMonitoring
                              ? null
                              : data?.can_edit === 1 &&
                                data?.is_removed === 0 && (
                                  <TableCell className="tbl-cell">
                                    <ActionMenu
                                      // DATA
                                      data={data}
                                      index={index}
                                      status={data?.status}
                                      hideArchive
                                      addRequestAllApi
                                      transactionData={transactionData ? true : false}
                                      // EDIT request
                                      editRequestData={() => handleEditRequestData()}
                                      editRequest={editRequest}
                                      setEditRequest={setEditRequest}
                                      setDisable={setDisable}
                                      onUpdateHandler={onUpdateHandler}
                                      onUpdateResetHandler={onUpdateResetHandler}
                                      setUpdateToggle={setUpdateToggle}
                                      setSelectedId={setSelectedId}
                                      //DELETE request
                                      onDeleteHandler={
                                        (transactionData && addRequestAllApi?.length === 0) ||
                                        editRequest ||
                                        (transactionData && addRequestAllApi?.length === 1)
                                          ? false
                                          : onDeleteHandler
                                      }
                                      disableDelete={
                                        transactionDataApi?.length === 1 && data.status !== "For Approval of Approver 1"
                                          ? true
                                          : false
                                      }
                                      onDeleteReferenceHandler={
                                        transactionData &&
                                        transactionData?.item_count !== 1 &&
                                        transactionDataApi.length !== 1 &&
                                        onDeleteReferenceHandler
                                      }
                                    />
                                  </TableCell>
                                )}
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* {(isTransactionSuccess || isRequestSuccess) && (
              <CustomTablePagination
                total={(transactionDataApiPage || addRequestAllApi)?.total}
                success={isTransactionSuccess || isRequestSuccess}
                current_page={(transactionDataApiPage || addRequestAllApi)?.current_page}
                per_page={(transactionDataApiPage || addRequestAllApi)?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            )} */}

              {/* Buttons */}
              <Stack flexDirection="row" justifyContent="space-between" alignItems={"center"}>
                <Typography
                  fontFamily="Anton, Impact, Roboto"
                  fontSize="18px"
                  color="secondary.main"
                  sx={{ pt: "10px" }}
                >
                  {transactionData ? "Transactions" : "Added"}:{" "}
                  {transactionData ? transactionDataApi?.length : addRequestAllApi?.length}{" "}
                  {transactionDataApi?.length >= 2 || addRequestAllApi?.length >= 2 ? "requests" : "request"}
                </Typography>

                <Stack flexDirection="row" gap={2}>
                  {!transactionData && (
                    <LoadingButton
                      onClick={onDeleteAllHandler}
                      variant="contained"
                      size="small"
                      color="error"
                      startIcon={<Delete color={"primary"} />}
                      disabled={isRequestLoading || isRequestFetching || addRequestAllApi?.length === 0 || editRequest}
                      loading={isPostLoading}
                      sx={{ mt: "10px" }}
                    >
                      Clear
                    </LoadingButton>
                  )}
                  {!transactionData && (
                    <Stack flexDirection="row" justifyContent="flex-end" gap={2} sx={{ pt: "10px" }}>
                      {transactionData?.status === "For Approval of Approver 1" ||
                      transactionData?.status === "Returned" ? (
                        <LoadingButton
                          onClick={onSubmitHandler}
                          variant="contained"
                          size="small"
                          color="secondary"
                          startIcon={<SaveAlt color={"primary"} />}
                          disabled={
                            transactionDataApi[0]?.can_edit === 0
                              ? isTransactionLoading
                                ? disable
                                : null
                              : transactionDataApi.length === 0
                              ? true
                              : false
                          }
                          loading={isPostLoading}
                        >
                          Resubmit
                        </LoadingButton>
                      ) : (
                        <LoadingButton
                          onClick={onSubmitHandler}
                          variant="contained"
                          size="small"
                          color="secondary"
                          startIcon={<Create color={"primary"} />}
                          disabled={isRequestLoading || isRequestFetching || addRequestAllApi?.length === 0}
                          loading={isPostLoading}
                        >
                          Create
                        </LoadingButton>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{
          sx: { borderRadius: "10px", width: "100%", maxWidth: "80%", p: 2, pb: 0 },
        }}
      >
        <ViewItemRequest data={itemData} />
      </Dialog>

      <Dialog
        open={drawer}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "10px" } }}
        onClose={handleCloseDrawer}
        fullScreen
      >
        <Stack alignContent="center" justifyContent="center" height="93vh">
          {image === true ? (
            <img
              src={base64}
              style={{
                display: "flex",
                maxWidth: "100vw",
                maxHeight: "93vh",
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.3s ease",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                border: "0px solid black",
              }}
              title="View Attachment"
            />
          ) : (
            <iframe
              src={base64}
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                // border: "1px solid black",
              }}
              title="View Attachment"
            />
          )}
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "space-between",
            backgroundColor: "white",
            zIndex: 1,
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "5px 30px 5px 0",
            borderTop: image === true ? "1px solid #000" : null,
          }}
        >
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }} />
          {image && (
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
              <Button
                variant="contained"
                color="secondary"
                size="medium"
                onClick={handleZoomOut}
                startIcon={<ZoomOut color="primary" />}
              >
                {!isSmallScreen ? "-" : "Zoom Out"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="medium"
                onClick={handleZoomIn}
                startIcon={<ZoomIn color="primary" />}
              >
                {!isSmallScreen ? "+" : "Zoom In"}
              </Button>
            </Box>
          )}

          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <DialogActions>
              <Button
                variant="outlined"
                // size="small"
                color="secondary"
                onClick={handleCloseDrawer}
                sx={{ backgroundColor: "white" }}
              >
                Close
              </Button>

              <Button
                variant="contained"
                // size="small"
                color="secondary"
                startIcon={<Download color="primary" />}
                onClick={() => handleDownloadAttachment({ value: name, id: DValue?.id })}
              >
                Download
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default AddRequisition;
