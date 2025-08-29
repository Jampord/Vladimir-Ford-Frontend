import React, { useEffect, useState } from "react";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fixedAssetApi,
  useGetDepreciationHistoryApiQuery,
  useLazyGetDepreciationHistoryApiQuery,
  useLazyGetNextDepreciationRequestApiQuery,
  usePostDepreciateApiMutation,
} from "../../Redux/Query/FixedAsset/FixedAssets";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grow,
  IconButton,
  Radio,
  RadioGroup,
  Slide,
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
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  ArrowLeft,
  Close,
  CurrencyExchangeRounded,
  Help,
  History,
  KeyboardArrowLeftSharp,
  TrendingDownTwoTone,
  Watch,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { LoadingButton } from "@mui/lab";
import CustomDatePicker from "../../Components/Reusable/CustomDatePicker";
import { usePostCalcDepreAddCostApiMutation } from "../../Redux/Query/FixedAsset/AdditionalCost";
import { closeDialog1, openDialog, openDialog1 } from "../../Redux/StateManagement/booleanStateSlice";
import { onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import CustomAutoComplete from "../../Components/Reusable/CustomAutoComplete";
import {
  useGetAccountTitleAllApiQuery,
  useLazyGetAccountTitleAllApiQuery,
} from "../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import { useLazyGetCompanyAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetBusinessUnitAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import { useLazyGetDepartmentAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/Department";
import { useLazyGetUnitAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/Unit";
import { useLazyGetSubUnitAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import { useLazyGetLocationAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/Location";
import {
  useGetMajorCategoryAllApiQuery,
  useLazyGetMajorCategoryAllApiQuery,
} from "../../Redux/Query/Masterlist/Category/MajorCategory";
import {
  useGetMinorCategoryAllApiQuery,
  useGetMinorCategorySmallToolsApiQuery,
  useLazyGetMinorCategoryAllApiQuery,
  useLazyGetMinorCategorySmallToolsApiQuery,
} from "../../Redux/Query/Masterlist/Category/MinorCategory";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";

const schema = yup.object().shape({
  id: yup.string(),
  depreciation_credit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Depreciation Credit"),
  depreciation_debit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Depreciation Debit"),
  second_depreciation_credit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .nullable()
    .label("Second Depreciation Credit"),
  second_depreciation_debit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .nullable()
    .label("Second Depreciation Credit"),
  initial_credit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Initial Credit"),
  initial_debit_id: yup
    .string()
    .transform((value) => {
      return value?.sync_id.toString();
    })
    .required()
    .label("Initial Debit"),
  depreciation_method: yup.string().required().label("Depreciation Method"),
  major_category_id: yup
    .string()
    .transform((value) => {
      return value?.id.toString();
    })
    .required()
    .label("Major Category"),
  minor_category_id: yup
    .string()
    .transform((value) => {
      return value?.id.toString();
    })
    .required()
    .label("Minor Category"),
  one_charging_id: yup.object().required().label("One Charging").typeError("One Charging is a required field"),
  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
});

const formatCost = (value) => {
  const unitCost = Number(value);
  return unitCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Depreciation = (props) => {
  const { setViewDepre, calcDepreApi, vladimirTag, refetch, nextRequest, requestor } = props;

  // console.log("calcDepreApi", calcDepreApi);
  console.log("requestor", requestor);
  // console.log("nextRequest", !!nextRequest);

  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const currentDate = moment();

  const [openHistory, setOpenHistory] = useState(false);
  const [backDateValue, setBackDateValue] = useState("no");
  console.log("backDateValue", backDateValue);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      depreciation_credit_id: null,
      depreciation_debit_id: null,
      initial_credit_id: null,
      initial_debit_id: null,
      one_charging_id: null,
      department_id: null,
      company_id: null,
      business_unit_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      depreciation_method: null,
      major_category_id: null,
      minor_category_id: null,
      second_depreciation_debit_id: null,
      second_depreciation_credit_id: null,
      back_date: null,
    },
  });

  const [getDepreciationHistory, { data: historyData, isLoading: isHistoryLoading, isSuccess: isHistorySuccess }] =
    useLazyGetDepreciationHistoryApiQuery();

  // const [
  //   getAccountTitle,
  //   { data: accountTitleData, isLoading: isAccountTitleLoading, isSuccess: isAccountTitleSuccess },
  // ] = useLazyGetAccountTitleAllApiQuery();
  const {
    data: accountTitleData = [],
    isLoading: isAccountTitleLoading,
    isSuccess: isAccountTitleSuccess,
  } = useGetAccountTitleAllApiQuery();

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

  const {
    data: majorCategoryData = [],
    isLoading: isMajorCategoryLoading,
    isError: isMajorCategoryError,
  } = useLazyGetMajorCategoryAllApiQuery();

  const [
    minorCategoryTrigger,
    {
      data: minorCategoryData = [],
      isLoading: isMinorCategoryLoading,
      isError: isMinorCategoryError,
      isSuccess: isMinorCategorySuccess,
    },
  ] = useLazyGetMinorCategoryAllApiQuery();

  const [
    minorCategorySmallToolsTrigger,
    {
      data: minorCategorySmallToolsData = [],
      isLoading: isMinorCategorySmallToolsLoading,
      isError: isMinorCategorySmallToolsError,
      isSuccess: isMinorCategorySmallToolsSuccess,
    },
  ] = useLazyGetMinorCategorySmallToolsApiQuery();

  const [
    postDepreciation,
    { data: depreciationData, isLoading: isDepreciationLoading, isSuccess: isDepreciationSuccess },
  ] = usePostDepreciateApiMutation();

  const [
    getNextDepreciationRequest,
    { data: nextData, isLoading: isNextRequestLoading, isFetching: isNextRequestFetching, error: nextRequestError },
  ] = useLazyGetNextDepreciationRequestApiQuery();

  const data = calcDepreApi?.data;
  const depreciationDebit = calcDepreApi?.data?.initial_debit?.depreciation_debit;
  const minorCategoryDepreciationDebit = watch("minor_category_id")?.initial_debit?.depreciation_debit;

  console.log("minorCategoryDepreciationDebit", minorCategoryDepreciationDebit);

  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState.dialogMultiple.dialog1);
  const navigate = useNavigate();

  const handleViewHistory = () => {
    setOpenHistory(!openHistory);
    !isHistorySuccess && getDepreciationHistory({ vladimir_tag_number: vladimirTag });
  };

  // const joinDepreciationByYear = (items = []) => {
  //   return items.reduce((acc, history) => {
  //     const year = Object.keys(history)[0];
  //     const yearData = history[year];

  //     if (year && yearData) {
  //       acc[year] = acc[year] ? [...acc[year], ...yearData] : yearData;
  //     }

  //     return acc;
  //   }, {});
  // };

  // const combinedHistoryData = joinDepreciationByYear(historyData?.depreciation_history);

  useEffect(() => {
    console.log("data🧨", data);
    if (data) {
      setValue("initial_debit_id", data?.initial_debit);
      setValue("initial_credit_id", data?.initial_credit);
      setValue("depreciation_credit_id", data?.depreciation_credit);
      setValue("one_charging_id", data?.one_charging);
      setValue("department_id", data?.department);
      setValue("company_id", data?.company);
      setValue("business_unit_id", data?.business_unit);
      setValue("unit_id", data?.unit);
      setValue("subunit_id", data?.sub_unit);
      setValue("location_id", data?.location);
      setValue("major_category_id", data?.major_category);
      setValue("minor_category_id", data?.minor_category);
      setValue("second_depreciation_credit_id", data?.initial_debit);
    }
  }, [data]);

  useEffect(() => {
    if ((!departmentData || departmentData.length === 0) && data?.depreciation_method === "-") {
      departmentTrigger();
    }
    if ((!companyData || companyData.length === 0) && data?.depreciation_method === "-") {
      companyTrigger();
    }
    if ((!businessUnitData || businessUnitData.length === 0) && data?.depreciation_method === "-") {
      businessUnitTrigger();
    }
    if ((!unitData || unitData.length === 0) && data?.depreciation_method === "-") {
      unitTrigger();
    }
    if ((!subUnitData || subUnitData.length === 0) && data?.depreciation_method === "-") {
      subunitTrigger();
    }
    if ((!locationData || locationData.length === 0) && data?.depreciation_method === "-") {
      locationTrigger();
    }
    if (
      (!minorCategoryData || minorCategoryData.length === 0) &&
      data?.is_small_tools !== 1 &&
      data?.depreciation_method === "-"
    ) {
      minorCategoryTrigger();
    }
    if (
      (!minorCategorySmallToolsData || minorCategorySmallToolsData.length === 0) &&
      data?.is_small_tools === 1 &&
      data?.depreciation_method === "-"
    ) {
      minorCategorySmallToolsTrigger();
    }
  }, [
    departmentData,
    companyData,
    businessUnitData,
    unitData,
    subUnitData,
    locationData,
    minorCategoryData,
    minorCategorySmallToolsData,
    data,
  ]);

  // console.log("1", watch("initial_debit_id"));
  // console.log("2", watch("initial_credit_id"));
  // console.log("3", watch("depreciation_debit_id"));
  // console.log("4", watch("depreciation_credit_id"));

  const HistoryTable = () => {
    return (
      <Stack
        sx={{
          display: openHistory ? "flex" : "none",
          ml: isSmallScreen ? 0 : "20px",
          pr: isSmallScreen ? 0 : "10px",
          transition: "ease-in-out",
          height: isSmallScreen ? "100%" : "500px",
          minWidth: isSmallScreen ? "100%" : "400px",
          mt: isSmallScreen && "20px",
          width: "100%",
        }}
      >
        <Stack flexDirection="row" alignItems="center" gap={1}>
          {!isSmallScreen && (
            <Tooltip placement="top" title="Close History" arrow>
              <IconButton size="small" onClick={handleViewHistory}>
                <KeyboardArrowLeftSharp />
              </IconButton>
            </Tooltip>
          )}
          <Typography fontFamily="Anton" color="secondary.main" fontSize={20} pl={isSmallScreen ? "10px" : 0}>
            HISTORY
          </Typography>
        </Stack>

        <Stack sx={{ height: isSmallScreen ? "100%" : "500px", overflow: "auto", pr: isSmallScreen ? 0 : 1 }}>
          <Slide direction="right" in={openHistory} timeout={500}>
            <Stack sx={{ my: 1 }} gap={2}>
              {historyData?.depreciation_history?.map((data, index) => (
                <TableContainer
                  key={`${data?.year}-${index}`}
                  className="mcontainer__wrapper"
                  sx={{ py: 2, overflow: "auto" }}
                >
                  <Typography
                    variant="span"
                    color="primary"
                    fontWeight={600}
                    fontFamily="Anton"
                    fontSize="20px"
                    sx={{ mx: 2 }}
                  >
                    {data?.year}
                  </Typography>
                  <Table className="mcontainer__table " stickyHeader>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& > *": {
                            fontWeight: "bold!important",
                            whiteSpace: "nowrap",
                            color: "secondary.main",
                          },
                          "& > nth:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <TableCell className="tbl-cell">Month</TableCell>
                        <TableCell className="tbl-cell">Remaining Book Value</TableCell>
                        <TableCell className="tbl-cell">Depreciated Amount Per Month</TableCell>
                        <TableCell className="tbl-cell">Accumulated Depreciation</TableCell>
                        <TableCell className="tbl-cell">Accounting Entries</TableCell>
                        <TableCell className="tbl-cell">Chart Of Accounts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.months?.map((row, index) => (
                        <TableRow key={`${row?.month}-${index}`}>
                          <TableCell>{row?.month}</TableCell>
                          <TableCell>₱{formatCost(row?.remaining_value)}</TableCell>
                          <TableCell>₱{formatCost(row?.monthly_depreciation)}</TableCell>
                          <TableCell>₱{formatCost(row?.accumulated_depreciation)}</TableCell>
                          <TableCell>
                            <Typography fontSize="11px" color="gray">
                              {row.initial_debit.account_title_code}
                              {" - "} {row.initial_debit.account_title_name}
                            </Typography>
                            <Typography fontSize="11px" color="gray">
                              {row.initial_credit.account_title_code}
                              {" - "} {row.initial_credit.account_title_name}
                            </Typography>
                            <Typography fontSize="11px" color="gray">
                              {row.depreciation_debit.account_title_code}
                              {" - "} {row.depreciation_debit.account_title_name}
                            </Typography>
                            <Typography fontSize="11px" color="gray">
                              {row.depreciation_credit.account_title_code}
                              {" - "} {row.depreciation_credit.account_title_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontSize="10px" color="gray">
                              {row.company.company_code}
                              {" - "} {row.company.company_name}
                            </Typography>
                            <Typography fontSize="10px" color="gray">
                              {row.business_unit?.business_unit_code}
                              {" - "}
                              {row.business_unit?.business_unit_name}
                            </Typography>
                            <Typography fontSize="10px" color="gray">
                              {row.department.department_code}
                              {" - "}
                              {row.department.department_name}
                            </Typography>
                            <Typography fontSize="10px" color="gray">
                              {row.unit?.unit_code}
                              {" - "}
                              {row.unit?.unit_name}
                            </Typography>
                            <Typography fontSize="10px" color="gray">
                              {row.sub_unit?.sub_unit_code}
                              {" - "}
                              {row.sub_unit?.sub_unit_name}
                            </Typography>
                            <Typography fontSize="10px" color="gray">
                              {row.location.location_code} {" - "}
                              {row.location.location_name}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ))}
            </Stack>
          </Slide>
        </Stack>
      </Stack>
    );
  };

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);

    const newFormData = {
      ...formData,
      one_charging_id: formData.one_charging_id.id,
      department_id: formData.one_charging_id.department_id,
      company_id: formData.one_charging_id.company_id,
      business_unit_id: formData.one_charging_id.business_unit_id,
      unit_id: formData.one_charging_id.unit_id,
      subunit_id: formData.one_charging_id.subunit_id,
      location_id: formData.one_charging_id.location_id,
      second_depreciation_credit_id:
        watch("major_category_id")?.major_category_name !== data?.major_category?.major_category_name
          ? formData.second_depreciation_credit_id
          : "",
      second_depreciation_debit_id:
        watch("major_category_id")?.major_category_name !== data?.major_category?.major_category_name
          ? formData.second_depreciation_debit_id
          : "",
      back_date: backDateValue === "yes" ? backDate : null,
    };

    console.log("newFormData", newFormData);
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
              DEPRECIATE
            </Typography>{" "}
            this asset?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await postDepreciation({
              ...newFormData,
              vladimir_tag_number: vladimirTag,
            }).unwrap();

            if (nextRequest) {
              const next = await getNextDepreciationRequest().unwrap();
              // console.log("next", next);
              setViewDepre(false);
              navigate(`/fixed-asset/depreciation/${next?.vladimir_tag_number}`, { state: next, replace: true });
            }

            if (!nextRequest) {
              dispatch(
                openToast({
                  message: result.message,
                  duration: 5000,
                })
              );
              refetch();
              dispatch(fixedAssetApi.util.invalidateTags(["FixedAsset"]));
              setViewDepre(false);
            }

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
          } catch (err) {
            console.log(err);
            if (err?.status === 404) {
              nextRequest ? navigate(`/fixed-asset/depreciation`) : navigate(`/fixed-asset/fixed-asset`);

              dispatch(
                openToast({
                  message: "Fixed Asset will now be depreciating.",
                  duration: 5000,
                })
              );
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
                  message: err?.data?.errors?.detail,
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

  const handleChange = (event) => {
    setBackDateValue(event.target.value);
    setValue("back_date", null);
  };

  const backDate = currentDate.diff(moment(watch("back_date")), "days");
  console.log("backDate", watch("back_date"));

  return (
    <Stack>
      {/* Header */}
      <Stack>
        <Box
          sx={{
            display: " flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            pl: "5px",
            mb: "15px",
            width: "95%",
          }}
        >
          <Stack flexDirection="row" alignItems="center" gap={1}>
            <CurrencyExchangeRounded size="small" color="secondary" />

            <Typography
              color="secondary.main"
              sx={{
                fontFamily: "Anton",
                fontSize: "1.5rem",
                justifyContent: "flex-start",
                alignSelf: "center",
              }}
            >
              Depreciation
            </Typography>
          </Stack>
        </Box>

        <IconButton
          color="secondary"
          variant="outlined"
          onClick={() => setViewDepre(false)}
          sx={{ top: 10, right: 10, position: "absolute" }}
        >
          <Close size="small" />
        </IconButton>
      </Stack>

      {/* Body */}
      <Stack flexDirection="row">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "auto",
            minWidth: openHistory ? "350px" : "auto",
          }}
        >
          <Stack sx={{ maxHeight: "500px" }}>
            <Box
              sx={{
                display: "flex",
                position: "relative",
                gap: "10px",
                px: "5px",
                flexWrap: "wrap",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "secondary.main",
                  minWidth: "300px",
                  // flexGrow: "1",
                  flex: "1",
                  alignSelf: "stretched",
                  p: "10px 20px",
                  borderRadius: "5px",
                }}
              >
                <Box>
                  <Typography
                    color="secondary.main"
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1rem",
                      color: "primary.main",
                    }}
                  >
                    Information
                  </Typography>

                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      // gap: isSmallScreen ? 0 : "15px",
                    }}
                  >
                    <Box className="tableCard__propertiesCapex">
                      Depreciation Method:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        {data?.depreciation_method}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      Estimated Useful Life:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        {data?.est_useful_life}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      Acquisition Date:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        {data?.acquisition_date}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      Acquisition Cost:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        ₱{formatCost(data?.acquisition_cost)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      Months Depreciated:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        {data?.months_depreciated}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      ATOE Deduction:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        ₱{formatCost(data?.scrap_value)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__propertiesCapex">
                      Depreciable Basis:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        ₱{formatCost(data?.depreciable_basis)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>

              <Box sx={{ flexDirection: "column", flex: "1", minWidth: "300px" }}>
                <Card
                  className="tableCard__card"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1",
                    mb: "10px",
                    height: "100%",
                  }}
                >
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                    Formula
                  </Typography>

                  <Box>
                    <Box className="tableCard__properties">
                      Accumulated Cost:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱{formatCost(data?.accumulated_cost)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Depreciation per Year:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱{formatCost(data?.depreciation_per_year)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Depreciation per Month:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱{formatCost(data?.depreciation_per_month)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Remaining Book Value:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱{formatCost(data?.remaining_book_value)}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Start Depreciation:
                      <Typography className="tableCard__info" fontSize="14px">
                        {data?.start_depreciation}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      End Depreciation:
                      <Typography className="tableCard__info" fontSize="14px">
                        {data?.end_depreciation}
                      </Typography>
                    </Box>
                  </Box>

                  {data?.has_history && (
                    <Chip
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewHistory()}
                      sx={{ mt: 2, ":hover": { bgcolor: "lightgray", cursor: "pointer" } }}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 0.5,
                            p: 0.5,
                          }}
                        >
                          <History sx={{ color: "quaternary.light", py: 0.2, ml: -0.5 }} />
                          <Typography fontSize={"14px"} fontWeight={500}>
                            View History
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                </Card>

                {/* <Card className="tableCard__card">
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                Date Setup
              </Typography>

              <Box className="tableCard__properties">
                Start Date:
                <Typography className="tableCard__info" fontSize="14px">
                  {data.start_depreciation}
                </Typography>
              </Box>

              <Box className="tableCard__properties">
                End Depreciation:
                <Typography className="tableCard__info" fontSize="14px">
                  {data.end_depreciation}
                </Typography>
              </Box>

              <Box className="tableCard__properties" sx={{ flexDirection: "column" }}>
                <Typography fontSize="14px" sx={{ mb: "10px" }}>
                  End Date Value:
                </Typography>

                <CustomDatePicker
                  control={control}
                  name="endDate"
                  label="End Date"
                  size="small"
                  views={["month", "year"]}
                  error={!!errors?.endDate?.message}
                  helperText={errors?.endDate?.message}
                />
              </Box>
            </Card> */}
              </Box>
            </Box>

            <Stack sx={{ flexDirection: "column", flex: "1", minWidth: "300px", px: "5px" }}>
              <Card
                className="tableCard__card"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  mt: "10px",
                  mx: "5px",
                }}
              >
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                  Requestor
                </Typography>

                <Box>
                  <Box className="tableCard__properties">
                    User:
                    <Typography className="tableCard__info" fontSize="14px">
                      {requestor?.employee_id} {requestor?.first_name} {requestor?.last_name}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              <Card
                className="tableCard__card"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  mt: "10px",
                  mx: "5px",
                }}
              >
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                  Initial
                </Typography>

                <Box>
                  <Box className="tableCard__properties">
                    Debit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {data?.initial_debit?.account_title_code} - {data?.initial_debit?.account_title_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Credit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {data?.initial_credit?.account_title_code} - {data?.initial_credit?.account_title_name}
                    </Typography>
                  </Box>
                </Box>
              </Card>
              <Card
                className="tableCard__card"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  mt: "10px",
                  mx: "5px",
                }}
              >
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                  Advances to Employees (ATOE)
                </Typography>

                <Box>
                  <Box className="tableCard__properties">
                    Debit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {data?.atoe_debit?.account_title_code} - {data?.atoe_debit?.account_title_name}
                    </Typography>
                  </Box>

                  <Box className="tableCard__properties">
                    Credit:
                    <Typography className="tableCard__info" fontSize="14px">
                      {data?.atoe_credit?.account_title_code} - {data?.atoe_credit?.account_title_name}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {data?.depreciation_method !== "-" && (
                <>
                  <Card
                    className="tableCard__card"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      mt: "10px",
                      mx: "5px",
                    }}
                  >
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                      Depreciation
                    </Typography>

                    <Box>
                      <Box className="tableCard__properties">
                        Debit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.depreciation_debit?.account_title_code} -{" "}
                          {data?.depreciation_debit?.account_title_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Credit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.depreciation_credit?.account_title_code} -{" "}
                          {data?.depreciation_credit?.account_title_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Adjusted Entries (Debit):
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.second_depreciation_debit?.account_title_code} -{" "}
                          {data?.second_depreciation_debit?.account_title_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Adjusted Entries (Credit):
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.second_depreciation_credit?.account_title_code} -{" "}
                          {data?.second_depreciation_credit?.account_title_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  <Card
                    className="tableCard__card"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      mt: "10px",
                      mx: "5px",
                    }}
                  >
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "rem" }}>
                      Charging Information
                    </Typography>

                    <Box>
                      <Box className="tableCard__properties">
                        One RDF:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.code} - {data?.one_charging?.name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Department:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.department_code || data?.department?.department_code} -{" "}
                          {data?.one_charging?.department_name || data?.department?.department_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Company:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.company_code || data?.company?.company_code} -{" "}
                          {data?.one_charging?.company_name || data?.company?.company_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Business Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.business_unit_code || data?.business_unit?.business_unit_code} -{" "}
                          {data?.one_charging?.business_unit_name || data?.business_unit?.business_unit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.unit_code || data?.unit?.unit_code} -{" "}
                          {data?.one_charging?.unit_name || data?.unit?.unit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Sub Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.subunit_code || data?.sub_unit?.subunit_code} -{" "}
                          {data?.one_charging?.subunit_name || data?.sub_unit?.subunit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Location:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.one_charging?.location_code || data?.location?.location_code} -{" "}
                          {data?.one_charging?.location_name || data?.location?.location_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </>
              )}
            </Stack>
            {isSmallScreen && <HistoryTable />}
            {(data?.depreciation_method === "-" || data?.is_released === 1) && (
              <Stack pb={1}>
                <Card
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    mt: "10px",
                    mx: "5px",
                    p: "20px",
                  }}
                >
                  {" "}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      // justifyContent: "space-between",
                      // alignItems: "center",
                    }}
                  >
                    <FormControl>
                      <FormLabel>
                        <Typography fontSize={"14px"} color={"secondary.main"}>
                          Do you want to add and select backdate?
                        </Typography>
                      </FormLabel>
                      <RadioGroup row name="backdate" value={backDateValue || "no"} onChange={handleChange}>
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                      </RadioGroup>
                    </FormControl>

                    <Box flex={1}>
                      <Typography fontFamily="Anton" color="secondary" mb={1}>
                        Backdate
                      </Typography>
                      <CustomDatePicker
                        autoComplete
                        name="back_date"
                        control={control}
                        size="small"
                        disabled={backDateValue === "no"}
                        maxDate={moment().subtract(1, "days").toDate()}
                        minDate={moment().subtract(7, "days").toDate()}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Card>
                <Card
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    mt: "10px",
                    mx: "5px",
                    p: "20px",
                  }}
                >
                  <Stack gap={2} component="form" onSubmit={handleSubmit(onSubmitHandler)}>
                    <Typography fontFamily="Anton" color="secondary">
                      Depreciation Method
                    </Typography>
                    <CustomAutoComplete
                      autoComplete
                      name="depreciation_method"
                      control={control}
                      options={["One Time", "STL"]}
                      size="small"
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Depreciation Method"
                          error={!!errors?.depreciation_method?.message}
                          helperText={errors?.depreciation_method?.message}
                        />
                      )}
                    />
                    <Typography fontFamily="Anton" color="secondary">
                      Category
                    </Typography>

                    <CustomAutoComplete
                      autoComplete
                      name="major_category_id"
                      disabled
                      control={control}
                      options={majorCategoryData}
                      loading={isMajorCategoryLoading}
                      size="small"
                      getOptionLabel={(option) => option.major_category_name}
                      isOptionEqualToValue={(option, value) =>
                        option.major_category_name === value?.major_category_name
                      }
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Major Category"
                          error={!!errors?.major_category_id?.message}
                          helperText={errors?.major_category_id?.message}
                        />
                      )}
                    />

                    <CustomAutoComplete
                      autoComplete
                      name="minor_category_id"
                      control={control}
                      options={data?.is_small_tools === 1 ? minorCategorySmallToolsData : minorCategoryData}
                      loading={data?.is_small_tools === 1 ? isMinorCategorySmallToolsLoading : isMinorCategoryLoading}
                      onOpen={() =>
                        data?.is_small_tools === 1
                          ? isMinorCategorySmallToolsSuccess
                            ? null
                            : minorCategorySmallToolsTrigger()
                          : isMinorCategorySuccess
                          ? null
                          : minorCategoryTrigger()
                      }
                      size="small"
                      getOptionLabel={(option) => option.minor_category_name}
                      getOptionKey={(option, index) => `${option.id}-${index}`}
                      isOptionEqualToValue={(option, value) =>
                        option.minor_category_name === value?.minor_category_name
                      }
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Minor Category"
                          error={!!errors?.minor_category_id?.message}
                          helperText={errors?.minor_category_id?.message}
                        />
                      )}
                      onChange={(_, value) => {
                        console.log("value", value);
                        if (value) {
                          setValue("major_category_id", value.major_category);
                          setValue("second_depreciation_debit_id", value.initial_debit);
                          setValue("depreciation_credit_id", value.depreciation_credit);
                          setValue("depreciation_debit_id", null);
                        } else {
                          setValue("major_category_id", null);
                          setValue("second_depreciation_debit_id", null);
                          setValue("depreciation_credit_id", data?.depreciation_credit);
                          setValue("depreciation_debit_id", null);
                        }
                        return value;
                      }}
                    />

                    {/* {console.log("watch", watch("second_depreciation_credit_id"))} */}

                    <Typography fontFamily="Anton" color="secondary">
                      Depreciate Asset
                    </Typography>
                    {/* <CustomAutoComplete
                      name="initial_debit_id"
                      // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                      control={control}
                      disabled
                      options={accountTitleData}
                      loading={isAccountTitleLoading}
                      size="small"
                      getOptionLabel={(option) => option?.account_title_code + " - " + option?.account_title_name}
                      isOptionEqualToValue={(option, value) => option?.account_title_code === value?.account_title_code}
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Initial Debit"
                          error={!!errors?.initial_debit_id}
                          helperText={errors?.initial_debit_id?.message}
                        />
                      )}
                    />

                    <CustomAutoComplete
                      autoComplete
                      name="initial_credit_id"
                      disabled
                      // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                      control={control}
                      options={accountTitleData}
                      loading={isAccountTitleLoading}
                      size="small"
                      getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                      isOptionEqualToValue={(option, value) => option.account_title_code === value.account_title_code}
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Initial Credit"
                          error={!!errors?.initial_credit_id}
                          helperText={errors?.initial_credit_id?.message}
                        />
                      )}
                    /> */}

                    <CustomAutoComplete
                      autoComplete
                      name="depreciation_debit_id"
                      // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                      control={control}
                      options={
                        (watch("major_category_id")?.major_category_name !== data?.major_category?.major_category_name
                          ? minorCategoryDepreciationDebit
                          : depreciationDebit) || []
                      }
                      // loading={isAccountTitleLoading}
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

                    <CustomAutoComplete
                      autoComplete
                      name="depreciation_credit_id"
                      // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                      control={control}
                      disabled
                      options={accountTitleData}
                      loading={isAccountTitleLoading}
                      size="small"
                      getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                      isOptionEqualToValue={(option, value) => option.account_title_code === value.account_title_code}
                      renderInput={(params) => (
                        <TextField
                          color="secondary"
                          {...params}
                          label="Depreciation Credit"
                          error={!!errors?.depreciation_credit_id}
                          helperText={errors?.depreciation_credit_id?.message}
                        />
                      )}
                    />

                    {watch("major_category_id")?.major_category_name !== data?.major_category?.major_category_name && (
                      <>
                        <Typography fontFamily="Anton" color="secondary">
                          Adjusted Entries
                        </Typography>

                        <CustomAutoComplete
                          autoComplete
                          name="second_depreciation_debit_id"
                          disabled
                          // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                          control={control}
                          options={watch("second_depreciation_credit_id")?.depreciation_debit || []}
                          // loading={isAccountTitleLoading}
                          size="small"
                          getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                          isOptionEqualToValue={(option, value) =>
                            option.account_title_code === value.account_title_code
                          }
                          renderInput={(params) => (
                            <TextField
                              color="secondary"
                              {...params}
                              label="Asset Account/Adjusted Entries (Debit)"
                              error={!!errors?.second_depreciation_debit_id}
                              helperText={errors?.second_depreciation_debit_id?.message}
                            />
                          )}
                        />
                        <CustomAutoComplete
                          autoComplete
                          name="second_depreciation_credit_id"
                          // onOpen={() => (isAccountTitleSuccess ? null : getAccountTitle())}
                          control={control}
                          disabled
                          options={accountTitleData}
                          loading={isAccountTitleLoading}
                          size="small"
                          getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
                          isOptionEqualToValue={(option, value) =>
                            option.account_title_code === value.account_title_code
                          }
                          renderInput={(params) => (
                            <TextField
                              color="secondary"
                              {...params}
                              label="Asset Account/Adjusted Entries (Credit)"
                              error={!!errors?.second_depreciation_credit_id}
                              helperText={errors?.second_depreciation_credit_id?.message}
                            />
                          )}
                        />

                        <Divider />
                      </>
                    )}

                    <Typography fontFamily="Anton" color="secondary">
                      Charging Information
                    </Typography>

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
                      onOpen={() =>
                        isDepartmentSuccess ? null : (departmentTrigger(), companyTrigger(), businessUnitTrigger())
                      }
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

                    <Stack flexDirection="row" gap={2} sx={{ alignSelf: "end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        startIcon={<TrendingDownTwoTone />}
                        disabled={
                          !isValid ||
                          (watch("minor_category_id")?.minor_category_name !==
                            data?.minor_category?.minor_category_name &&
                            (!watch("second_depreciation_credit_id") || !watch("second_depreciation_debit_id"))) ||
                          (backDateValue === "yes" && !watch("back_date"))
                        }
                        sx={{ alignSelf: "end" }}
                      >
                        Depreciate
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            )}
          </Stack>
        </Box>

        {openHistory && !isSmallScreen && <HistoryTable />}
      </Stack>
    </Stack>
  );
};

export default Depreciation;
