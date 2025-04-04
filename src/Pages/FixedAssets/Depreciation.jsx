import React, { useEffect, useState } from "react";
import moment from "moment";
import { useLocation, useParams } from "react-router-dom";
import {
  fixedAssetApi,
  useGetDepreciationHistoryApiQuery,
  useLazyGetDepreciationHistoryApiQuery,
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
  Grow,
  IconButton,
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
  const { setViewDepre, calcDepreApi, vladimirTag, refetch } = props;

  console.log("calcDepreApi", calcDepreApi);

  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const [openHistory, setOpenHistory] = useState(false);

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
      department_id: null,
      company_id: null,
      business_unit_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
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
    postDepreciation,
    { data: depreciationData, isLoading: isDepreciationLoading, isSuccess: isDepreciationSuccess },
  ] = usePostDepreciateApiMutation();

  const data = calcDepreApi?.data;
  const depreciationDebit = calcDepreApi?.data?.initial_debit?.depreciation_debit;
  // console.log("dataaaaaaaaaaa", data);
  // console.log("👀👀👀", depreciationDebit);
  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

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
    // console.log("data", data);
    if (data) {
      setValue("initial_debit_id", data?.initial_debit);
      setValue("initial_credit_id", data?.initial_credit);
      setValue("depreciation_credit_id", data?.depreciation_credit);
      setValue("department_id", data?.department);
      setValue("company_id", data?.company);
      setValue("business_unit_id", data?.business_unit);
      setValue("unit_id", data?.unit);
      setValue("subunit_id", data?.sub_unit);
      setValue("location_id", data?.location);
    }
  }, [data]);

  useEffect(() => {
    if ((!departmentData || departmentData.length === 0) && data?.depreciation_method === "-") {
      departmentTrigger();
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
  }, [departmentData, unitData, subUnitData, locationData, data]);

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
    // console.log("formData", formData);

    const newFormData = {
      ...formData,
      department_id: formData.department_id.id,
      company_id: formData.company_id.id,
      business_unit_id: formData.business_unit_id.id,
      unit_id: formData.unit_id.id,
      subunit_id: formData.subunit_id.id,
      location_id: formData.location_id.id,
    };

    // console.log("newFormData", newFormData);
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

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            refetch();
            dispatch(fixedAssetApi.util.invalidateTags(["FixedAsset"]));
            setViewDepre(false);
          } catch (err) {
            console.log(err);
            if (err?.status === 404) {
              navigate(`/approving/request`);
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
                      Scrap Value:
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
                        Department:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.department?.department_code} - {data?.department?.department_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Company:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.company?.company_code} - {data?.company?.company_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Business Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.business_unit?.business_unit_code} - {data?.business_unit?.business_unit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.unit?.unit_code} - {data?.unit?.unit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Sub Unit:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.sub_unit?.subunit_code} - {data?.sub_unit?.subunit_name}
                        </Typography>
                      </Box>
                      <Box className="tableCard__properties">
                        Location:
                        <Typography className="tableCard__info" fontSize="14px">
                          {data?.location?.location_code} - {data?.location?.location_name}
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
                  <Stack gap={2} component="form" onSubmit={handleSubmit(onSubmitHandler)}>
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
                      options={depreciationDebit}
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

                    <Typography fontFamily="Anton" color="secondary">
                      Charging Information
                    </Typography>

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
                      // disabled
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
                      onChange={(_, value) => {
                        const companyID = companyData?.find((item) => item.sync_id === value.company.company_sync_id);
                        const businessUnitID = businessUnitData?.find(
                          (item) => item.sync_id === value.business_unit.business_unit_sync_id
                        );

                        if (value) {
                          setValue("company_id", companyID);
                          setValue("business_unit_id", businessUnitID);
                        } else {
                          setValue("company_id", null);
                          setValue("business_unit_id", null);
                        }
                        setValue("unit_id", null);
                        setValue("subunit_id", null);
                        setValue("location_id", null);
                        return value;
                      }}
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
                      // disabled
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
                      options={unitData?.filter((obj) => obj?.id === watch("unit_id")?.id)[0]?.subunit || []}
                      loading={isSubUnitLoading}
                      // disabled={handleSaveValidation()}
                      // disabled
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
                      // disabled
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
                        disabled={!isValid}
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
