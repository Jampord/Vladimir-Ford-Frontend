import React, { useEffect, useRef, useState } from "react";
import "../../Style/Fixed Asset/assetViewing.scss";

import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import {
  useArchiveFixedAssetStatusApiMutation,
  useGetFixedAssetIdApiQuery,
  useLazyGetCalcDepreApiQuery,
} from "../../Redux/Query/FixedAsset/FixedAssets";
import FaStatusChange from "../../Components/Reusable/FaStatusComponent";
import NoDataFile from "../../Img/PNG/no-data.png";
import moment from "moment";
import AddFixedAsset from "./AddEdit/AddFixedAsset";
import Depreciation from "./Depreciation";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  Drawer,
  Grow,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  AddBoxRounded,
  ArrowBackIosRounded,
  Circle,
  CircleTwoTone,
  DescriptionRounded,
  ExpandMore,
  Help,
  PriceChange,
  Print,
  PrintTwoTone,
  ReportProblem,
  Sell,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { usePostPrintApiMutation } from "../../Redux/Query/FixedAsset/FixedAssets";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import { usePostPrintOfflineApiMutation } from "../../Redux/Query/FixedAsset/OfflinePrintingFA";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";

import { openToast } from "../../Redux/StateManagement/toastSlice";
import {
  usePostPrintStalwartDateApiMutation,
  usePostPrintStalwartIdApiMutation,
} from "../../Redux/Query/FixedAsset/StalwartPrintingFA";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import ErrorFetchFA from "./ErrorFetchFA";
import FixedAssetViewSkeleton from "./FixedAssetViewSkeleton";
import { useForm } from "react-hook-form";
import AddCost from "./AddEdit/AddCost";
import {
  useArchiveAdditionalCostApiMutation,
  usePostCalcDepreAddCostApiMutation,
} from "../../Redux/Query/FixedAsset/AdditionalCost";
import useScanDetection from "use-scan-detection-react18";
import { useGetIpApiQuery } from "../../Redux/Query/IpAddressSetup";
import { useReactToPrint } from "react-to-print";
import AssignmentMemo from "./AssignmentMemo";
import {
  closeDialog,
  closeDialog1,
  closeDialog2,
  openDialog,
  openDialog1,
} from "../../Redux/StateManagement/booleanStateSlice";
import AddInclusion from "../Asset Requisition/Received Asset/AddInclusion";
import EditSmallTools from "./AddEdit/EditSmallTools";
import EditAssetDescription from "./AddEdit/EditAssetDescription";

const FixedAssetView = (props) => {
  const [search, setSearch] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewDepre, setViewDepre] = useState(false);
  const [printAssignmentMemo, setPrintAssignmentMemo] = useState(false);
  const [statusChange, setStatusChange] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expanded, setExpanded] = useState(false);
  const [inclusionData, setInclusionData] = useState([]);
  const [smallToolsData, setSmallToolsData] = useState();
  const [updateFixedAsset, setUpdateFixedAsset] = useState({
    status: false,
    id: "",
    fixed_asset_id: null,
    is_additional_cost: 0,
    type_of_request_id: null,
    sub_capex_id: "",

    is_old_asset: null,
    tag_number: "",
    tag_number_old: "",

    // division_id: null,
    major_category_id: null,
    minor_category_id: null,
    company_id: null,
    department_id: null,
    location_id: null,
    account_title_id: null,

    asset_description: "",
    asset_specification: "",
    acquisition_date: null,
    accountability: null,
    accountable: "",
    cellphone_number: "",
    brand: "",
    care_of: "",
    voucher: "",
    voucher_date: null,
    receipt: "",
    quantity: "",
    unit_of_measure: null,
    asset_status_id: null,
    cycle_count_status_id: null,
    movement_status_id: null,

    depreciation_method: null,
    est_useful_life: "",
    release_date: "",
    depreciation_status_id: null,
    acquisition_cost: "",
    months_depreciated: "",
    scrap_value: "",
    depreciable_basis: "",
    accumulated_cost: "",
    start_depreciation: "",
    end_depreciation: null,
    depreciation_per_year: "",
    depreciation_per_month: "",
    remaining_book_value: "",

    print_count: null,
  });

  const { state: data } = useLocation();
  const { tag_number } = useParams();

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);
  const isSmallScreen = useMediaQuery("(max-width: 350px)");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const drawer = useSelector((state) => state.booleanState.drawer);
  const dialog = useSelector((state) => state.booleanState.dialog);
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);
  const dialog2 = useSelector((state) => state.booleanState.dialogMultiple.dialog2);

  const {
    data: dataApi,
    isLoading: dataApiLoading,
    isSuccess: dataApiSuccess,
    isFetching: dataApiFetching,
    isError: dataApiError,
    refetch: dataApiRefetch,
  } = useGetFixedAssetIdApiQuery(data, {
    refetchOnMountOrArgChange: true,
  });

  console.log("FAData", dataApi);
  // console.log("Data", data);

  const [getCalcDepreApi, { data: calcDepreApi, refetch: calcDepreApiRefetch }] = useLazyGetCalcDepreApiQuery();
  const [postCalcDepreAddCostApi, { data: calcDepreAddCostApi }] = usePostCalcDepreAddCostApiMutation();
  const [patchFixedAssetStatusApi, { isLoading: isPatchLoading }] = useArchiveFixedAssetStatusApiMutation();
  const [patchAdditionalCostStatusApi, { isLoading: isAdditionalCostLoading }] = useArchiveAdditionalCostApiMutation();

  const { data: ip } = useGetIpApiQuery();

  // const isLocalIp = process.env.VLADIMIR_BASE_URL === `http://127.0.0.1:8000/VladimirPrinting/public/index.php/api`;

  const [
    printAsset,
    { data: postData, isLoading: isPrintLoading, isSuccess: isPostSuccess, isError: isPostError, errors: postError },
  ] = usePostPrintApiMutation();

  // Printing -------------------------------------------------------
  const {
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    setSearch(dataApi?.data?.vladimir_tag_number);
  }, [dataApi]);

  useEffect(() => {
    if (isPostError && postError?.status === 422) {
      dispatch(
        openToast({
          message: postError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (isPostError && postError?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  useEffect(() => {
    setInclusionData(dataApi?.data?.inclusion?.map((data) => data));
  }, [dataApiSuccess, dataApi]);
  // console.log(dataApi);

  // const onPrintHandler = () => {
  //   printAsset({
  //     search: search,
  //     startDate: "",
  //     endDate: "",
  //   });
  // };

  const onPrintHandler = () => {
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              PRINT
            </Typography>{" "}
            this Barcode?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await printAsset({
              search: search,
              startDate: "",
              endDate: "",
              ip: ip.data,
              tagNumber: [data.vladimir_tag_number],
            }).unwrap();

            // console.log(result);

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log(err.data.message);
            if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data?.message,
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

  useEffect(() => {
    if (isPostSuccess) {
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess]);

  const onUpdateHandler = (props) => {
    const {
      id,
      fixed_asset,
      is_additional_cost,
      type_of_request,
      capex,
      sub_capex,
      is_old_asset,
      tag_number,
      tag_number_old,

      division,
      major_category,
      minor_category,

      company,
      business_unit,
      department,
      unit,
      subunit,
      location,
      account_title,
      asset_description,
      asset_specification,
      acquisition_date,
      accountability,
      accountable,
      cellphone_number,
      brand,
      care_of,
      voucher,
      voucher_date,
      receipt,
      po_number,
      quantity,
      unit_of_measure,
      asset_status,
      movement_status,
      cycle_count_status,
      depreciation_method,
      est_useful_life,
      release_date,
      depreciation_status,
      acquisition_cost,
      months_depreciated,
      scrap_value,
      depreciable_basis,
      accumulated_cost,
      start_depreciation,
      end_depreciation,
      depreciation_per_year,
      depreciation_per_month,
      remaining_book_value,

      print_count,

      can_update,
    } = props;

    setUpdateFixedAsset({
      status: true,
      id: id,

      fixed_asset,
      is_additional_cost,
      type_of_request,
      capex,
      sub_capex,

      is_old_asset,
      tag_number,
      tag_number_old,

      division,
      major_category,
      minor_category,

      company,
      business_unit,
      department,
      unit,
      subunit,
      location,
      account_title,

      asset_description,
      asset_specification,
      acquisition_date,
      accountability,
      accountable,
      cellphone_number,
      brand,
      care_of,
      voucher,
      voucher_date,
      receipt,
      po_number,
      quantity: quantity,
      unit_of_measure,
      asset_status,
      movement_status,
      cycle_count_status,

      depreciation_method,
      est_useful_life,
      release_date,
      depreciation_status,

      acquisition_cost,
      months_depreciated,
      scrap_value,
      depreciable_basis,
      accumulated_cost,
      start_depreciation,
      end_depreciation,
      depreciation_per_year,
      depreciation_per_month,
      remaining_book_value,

      print_count,

      can_update,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateFixedAsset({
      status: false,
      id: "",
      tag_number: "",
      tag_number_old: "",
      capex: "",
      project_name: "",

      division_id: null,
      division_name: "",
      major_category_id: null,
      major_category_name: "",
      minor_category_id: null,
      minor_category_name: "",

      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      account_title_id: null,

      type_of_request_id: "",
      type_of_request_name: "",
      asset_description: "",
      asset_specification: "",
      accountability: null,
      accountable: "",
      cellphone_number: null,
      brand: "",
      care_of: "",
      voucher: "",
      voucher_date: null,
      receipt: "",
      quantity: "",
      unit_of_measure: null,
      asset_status_id: "",

      depreciation_method: null,
      est_useful_life: "",
      acquisition_date: null,
      acquisition_cost: "",
      months_depreciated: "",
      scrap_value: "",
      depreciable_basis: "",
      accumulated_cost: "",
      start_depreciation: "",
      end_depreciation: null,
      depreciation_per_year: "",
      depreciation_per_month: "",
      remaining_book_value: "",

      print_count: null,
    });
  };

  const onUpdateSmallToolsHandler = (props) => {
    const { status_description, id, item_name, quantity, fixed_asset_id } = props;
    setSmallToolsData({
      id: id,
      status_description: status_description,
      item_name: item_name,
      quantity: quantity,
      fixed_asset_id: fixed_asset_id,
    });
  };

  const handleDepreciation = (id) => {
    getCalcDepreApi({ id, date: moment(new Date(currentDate)).format("YYYY-MM") });
    // console.log("calcDepreApiiiiiiiiiiiiiiiiiiiii", calcDepreApi);

    setViewDepre(true);

    // console.log("dataApi.data", dataApi?.data.main?.id);
  };

  const handleTableData = (data) => {
    navigate(`/fixed-asset/fixed-asset/${data.vladimir_tag_number || tag_number}`, {
      // state: { ...data, status },
      state: { ...data, tag_number },
    });

    // console.log("mapData", data);
  };

  useScanDetection({
    onComplete: (code) => {
      handleTableData({
        vladimir_tag_number: code,
      });
      // console.log(code);
    },
    averageWaitTime: 16,
    minLength: 11,
  });

  const onBackHandler = () => {
    dataApi.data?.is_additional_cost === 0 ? navigate("/fixed-asset/fixed-asset") : navigate(-1);
  };

  const handleOpenInclusion = () => {
    dispatch(openDialog());
  };

  const handleOpenSmallTools = () => {
    dispatch(openDialog1());
  };

  return (
    <>
      {dataApiLoading && <FixedAssetViewSkeleton onAdd={true} onImport={true} onPrint={true} />}

      {dataApiError && <ErrorFetchFA refetch={dataApiRefetch} error={postError} />}

      {dataApi && !dataApiError && (
        <Box className="mcontainer">
          <Box className="tableCard">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <IconButton sx={{ mt: "5px" }} size="small" onClick={onBackHandler}>
                  <ArrowBackIosRounded size="small" />
                </IconButton>

                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1.4rem",
                      pl: "10px",
                      pb: "5px",
                      lineHeight: "1",
                    }}
                    color="primary.main"
                  >
                    VLADIMIR TAG NUMBER
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      mt: "-5px",
                      pb: "5px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Anton",
                        fontSize: "1.2rem",
                        p: "0 10px",
                        pr: "15px",
                      }}
                      color="secondary.main"
                    >
                      {data.is_printable === 1 ? `#${data.vladimir_tag_number}` : "NON PRINTABLE"}
                    </Typography>
                    <FaStatusChange faStatus={dataApi?.data?.asset_status?.asset_status_name} />
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  pl: "10px",
                  pb: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignSelf: "flex-end",
                  gap: 1,
                  overflow: "auto",
                }}
              >
                {/* <Tooltip title="Print Assignment Memo" placement="top" arrow>
                  <span>
                    <IconButton
                      variant="contained"
                      size="small"
                      color="quaternary"
                      onClick={() => setPrintAssignmentMemo(true)}
                      disabled={dataApi.data?.accountability === "Common"}
                    >
                      <PrintTwoTone color={dataApi.data?.accountability === "Common" ? "gray" : "tertiary"} />
                    </IconButton>
                  </span>
                </Tooltip> */}

                {
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() =>
                      handleDepreciation(
                        dataApi.data?.is_additional_cost === 1 ? dataApi?.data.main?.id : dataApi?.data.id
                      )
                    }
                    startIcon={
                      isSmallScreen ? null : (
                        <PriceChange
                          color={
                            dataApi.data?.depreciation_status?.depreciation_status_name !== "For Depreciation" &&
                            dataApi.data?.est_useful_life === "0.0"
                              ? "lightgray"
                              : "primary"
                          }
                        />
                      )
                    }
                    disabled={
                      dataApi.data?.depreciation_status?.depreciation_status_name !== "For Depreciation" &&
                      dataApi.data?.est_useful_life === "0.0"
                    }
                  >
                    {isSmallScreen ? <PriceChange color={"primary"} /> : "Depreciation"}
                  </Button>
                }

                {permissions?.split(", ").includes("print-fa") &&
                  dataApi.data?.is_additional_cost === 0 &&
                  dataApi.data?.type_of_request?.type_of_request_name !== "Capex" &&
                  dataApi.data?.is_printable !== 0 && (
                    <LoadingButton
                      variant="contained"
                      size="small"
                      // loading={isPrintLoading}
                      startIcon={isSmallScreen ? null : <Print />}
                      onClick={onPrintHandler}
                    >
                      {isSmallScreen ? <Print /> : dataApi.data?.print_count >= 1 ? "Re-print" : "Print"}
                    </LoadingButton>
                  )}

                {dataApi?.data?.can_update === 1 && (
                  <ActionMenu
                    data={dataApi?.data}
                    setStatusChange={setStatusChange}
                    onUpdateHandler={onUpdateHandler}
                  />
                )}

                {dataApi?.data?.is_depreciated === 1 && dataApi?.data?.can_update !== 1 && (
                  <ActionMenu data={dataApi?.data} editAssetDescription hideEdit />
                )}
              </Box>
            </Box>

            <Box className="tableCard__container">
              <Stack alignItems="center">
                {dataApi.data?.is_additional_cost === 1 && (
                  <Chip
                    variant="contained"
                    size="small"
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1rem",
                      color: "secondary.main",
                      mb: "5px",
                      backgroundColor: "primary.light",
                      width: "90%",
                      height: "25px",
                    }}
                    label="ADDITIONAL COST"
                  />
                )}
                <Card className="tableCard__cardCapex" sx={{ bgcolor: "primary.main" }}>
                  <Typography
                    color="secondary.main"
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1rem",
                      color: "secondary.main",
                    }}
                  >
                    Requestor
                  </Typography>

                  <Box sx={{ py: "5px" }}>
                    <Box className="tableCard__requestor">
                      <Typography fontSize="14px" color={"secondary.main"}>
                        User:
                      </Typography>
                      <Typography
                        className="tableCard__infoCapex"
                        fontSize="14px"
                        fontWeight={700}
                        color={"secondary.main"}
                      >
                        {dataApi?.data?.requestor?.employee_id} {dataApi?.data?.requestor?.first_name}{" "}
                        {dataApi?.data?.requestor?.last_name}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card className="tableCard__cardCapex" sx={{ bgcolor: "secondary.main" }}>
                  <Typography
                    color="secondary.main"
                    sx={{
                      fontFamily: "Anton",
                      fontSize: "1rem",
                      color: "primary.main",
                    }}
                  >
                    Type of Request
                  </Typography>

                  <Box sx={{ py: "5px" }}>
                    <Box className="tableCard__propertiesCapex">
                      Type of Request:
                      <Typography className="tableCard__infoCapex" fontSize="14px">
                        {dataApi?.data?.type_of_request?.type_of_request_name}
                      </Typography>
                    </Box>

                    {dataApi?.data?.sub_capex?.sub_capex !== "-" && (
                      <>
                        <Box className="tableCard__propertiesCapex">
                          Capex:
                          <Typography className="tableCard__infoCapex" fontSize="14px">
                            {dataApi?.data?.sub_capex?.sub_capex}
                          </Typography>
                        </Box>

                        <Box className="tableCard__propertiesCapex">
                          Project Name:
                          <Typography className="tableCard__infoCapex" fontSize="14px">
                            {dataApi?.data?.sub_capex?.sub_project}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Card>

                <Card className="tableCard__cardCapex" sx={{ bgcolor: "white", py: "10.5px" }}>
                  <Box>
                    <Typography
                      color="secondary.main"
                      sx={{
                        fontFamily: "Anton",
                        fontSize: "1rem",
                      }}
                    >
                      TAG NUMBER
                    </Typography>

                    <Box className="tableCard__properties">
                      Tag Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.tag_number}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Old Tag Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.tag_number_old}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card className="tableCard__cardCapex" sx={{ bgcolor: "white", py: "10.5px" }}>
                  <Box color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                    CATEGORY
                  </Box>
                  <Box>
                    <Box className="tableCard__properties">
                      Division:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.division.division_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Major Category:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.major_category.major_category_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Minor Category:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.minor_category.minor_category_name}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {(dataApi?.data?.total_cost || dataApi?.data?.total_adcost) && (
                  <Card className="tableCard__cardCapex" sx={{ bgcolor: "white", py: "10.5px" }}>
                    <Stack
                      flexDirection="column"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 0.5,
                      }}
                    >
                      <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={1}>
                        <Typography fontSize="14px" fontWeight="bold" color="secondary.light">
                          Main Cost:
                        </Typography>
                        <Typography color="secondary.light">
                          ₱
                          {dataApi?.data?.acquisition_cost === (0 || null)
                            ? 0
                            : dataApi?.data?.acquisition_cost.toLocaleString()}
                        </Typography>
                      </Stack>
                      {`+`}
                      <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={1}>
                        <Typography fontSize="14px" fontWeight="bold" color="secondary.light">
                          Total Additional Cost:
                        </Typography>
                        <Typography color="secondary.light">
                          ₱
                          {dataApi?.data?.total_adcost === (0 || null)
                            ? 0
                            : dataApi?.data?.total_adcost.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      width="100%"
                      sx={{
                        px: 2,
                        py: 1,
                        pb: 1,
                        borderTop: "1px solid lightgray",
                        // borderBottom: "1px solid lightgray",
                      }}
                    >
                      <Typography fontSize="16px" fontFamily="Anton, Poppins, Sans Serif" color="secondary.main">
                        TOTAL COST:
                      </Typography>
                      <Typography fontWeight="bold" color="secondary.main">
                        ₱{dataApi?.data?.total_cost === (0 || null) ? 0 : dataApi?.data?.total_cost.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Card>
                )}
              </Stack>

              <Box className="tableCard__wrapper" sx={{ pb: "2px" }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                      CHART OF ACCOUNT
                    </Typography>
                  </AccordionSummary>

                  <Divider />

                  <AccordionDetails>
                    <Box className="tableCard__properties">
                      One RDF:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.one_charging?.code} - ${dataApi?.data?.one_charging?.name}`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Company:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.one_charging?.company_code || dataApi?.data?.company.company_code} - ${
                          dataApi?.data?.one_charging?.company_name || dataApi?.data?.company.company_name
                        }`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Business Unit:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${
                          dataApi?.data?.one_charging?.business_unit_code ||
                          dataApi?.data?.business_unit.business_unit_code
                        } - ${
                          dataApi?.data?.one_charging?.business_unit_name ||
                          dataApi?.data?.business_unit.business_unit_name
                        }`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Department:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${
                          dataApi?.data?.one_charging?.department_code || dataApi?.data?.department.department_code
                        } - ${
                          dataApi?.data?.one_charging?.department_name || dataApi?.data?.department.department_name
                        }`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Unit:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.one_charging?.unit_code || dataApi?.data?.unit.unit_code} - ${
                          dataApi?.data?.one_charging?.unit_name || dataApi?.data?.unit.unit_name
                        }`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Subunit:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.one_charging?.subunit_code || dataApi?.data?.subunit?.subunit_code} - ${
                          dataApi?.data?.one_charging?.subunit_name || dataApi?.data?.subunit?.subunit_name
                        }`}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Location:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.one_charging?.location_code || dataApi?.data?.location.location_code} - ${
                          dataApi?.data?.one_charging?.location_name || dataApi?.data?.location.location_name
                        }`}
                      </Typography>
                    </Box>

                    {/* <Box className="tableCard__properties">
                      Account Title:
                      <Typography className="tableCard__info" fontSize="14px">
                        {`${dataApi?.data?.account_title.account_title_code} - ${dataApi?.data?.account_title.account_title_name}`}
                      </Typography>
                    </Box> */}
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: "secondary.main" }} />}
                    sx={{ bgcolor: "white" }}
                  >
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                      ASSET INFORMATION
                    </Typography>
                  </AccordionSummary>

                  <Divider />

                  <AccordionDetails className="tableCard__border">
                    <Box className="tableCard__properties">
                      Asset Description:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.asset_description}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Asset Specification:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.asset_specification}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Accountability:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.accountability}
                      </Typography>
                    </Box>

                    {dataApi?.data?.accountability === "Common" ? null : (
                      <>
                        <Box className="tableCard__properties">
                          Accountable:
                          <Typography className="tableCard__info" fontSize="14px">
                            {dataApi?.data?.accountable}
                          </Typography>
                        </Box>
                      </>
                    )}

                    <Box className="tableCard__properties">
                      Acquisition Date:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.acquisition_date}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Cellphone Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.cellphone_number}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Brand:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.brand}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Care of:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.care_of}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Voucher:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.voucher}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Voucher Date:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.voucher_date}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      PR Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.ymir_pr_number}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      PO Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.po_number}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      RR Number:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.rr_number}
                      </Typography>
                    </Box>
                    <Box className="tableCard__properties">
                      Supplier:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.supplier?.supplier_code} - {dataApi?.data?.supplier?.supplier_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Quantity:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.quantity}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      UOM:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.unit_of_measure?.uom_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Asset Status:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.asset_status?.asset_status_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Asset Movement Status:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.movement_status?.movement_status_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Cycle Count Status:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.cycle_count_status?.cycle_count_status_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Remarks:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.remarks ? dataApi?.data?.remarks : "-"}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                      DEPRECIATION
                    </Typography>
                  </AccordionSummary>

                  <Divider />

                  <AccordionDetails>
                    <Box className="tableCard__properties">
                      Depreciation Status:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.depreciation_status?.depreciation_status_name}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Acquisition Cost:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱
                        {dataApi?.data?.acquisition_cost === (0 || null)
                          ? 0
                          : dataApi?.data?.acquisition_cost.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Release Date:
                      <Typography className="tableCard__info" fontSize="14px">
                        {dataApi?.data?.release_date}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Scrap Value:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱{dataApi?.data?.scrap_value === (0 || null) ? 0 : dataApi?.data?.scrap_value.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box className="tableCard__properties">
                      Depreciable Basis:
                      <Typography className="tableCard__info" fontSize="14px">
                        ₱
                        {dataApi?.data?.depreciable_basis === (0 || null)
                          ? 0
                          : dataApi?.data?.depreciable_basis.toLocaleString()}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* {inclusionData && ( */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                      INCLUSIONS
                    </Typography>
                  </AccordionSummary>

                  <Divider />

                  <AccordionDetails>
                    <TableContainer>
                      <Table>
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
                            <TableCell className="tbl-cell">Description</TableCell>
                            <TableCell className="tbl-cell" align="center">
                              Quantity
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody
                          sx={{
                            overflow: "auto",
                          }}
                          colSpan={9}
                        >
                          {inclusionData?.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {/* <Typography fontSize="10px" color="gray">
                                    Index
                                  </Typography> */}
                                <Typography fontSize="14px" fontWeight="bold" color="tertiary.light">
                                  {dataApi?.data?.vladimir_tag_number}-{data?.id}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                {/* <Typography fontSize="10px" color="gray">
                                    Description
                                  </Typography> */}
                                <Typography fontSize="14px" fontWeight="bold" noWrap color="secondary.main">
                                  {data?.description}
                                </Typography>
                                <Typography fontSize="12px" color="secondary.light" noWrap>
                                  {data?.specification}
                                </Typography>
                              </TableCell>

                              <TableCell align="center">
                                {/* <Typography fontSize="10px" color="gray">
                                    Quantity
                                  </Typography> */}
                                <Typography fontSize="14px">{data?.quantity}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddBoxRounded />}
                      onClick={handleOpenInclusion}
                      sx={{ mt: 2 }}
                    >
                      {inclusionData?.length === 0 ? "ADD ITEM" : "ADD/DELETE ITEM"}
                    </Button>
                  </AccordionDetails>
                </Accordion>
                {/* )} */}

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                      SMALL TOOLS
                    </Typography>
                  </AccordionSummary>

                  <Divider />

                  {dataApi?.data?.small_tools?.length === 0 || !dataApi?.data?.small_tools ? (
                    <AccordionDetails>
                      <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="5px">
                        <img src={NoDataFile} alt="" width="35px" />
                        <Typography
                          variant="p"
                          sx={{
                            fontFamily: "Anton, Roboto, Helvetica",
                            color: "secondary.main",
                            fontSize: "1.2rem",
                          }}
                        >
                          No Data Found
                        </Typography>
                      </Stack>
                    </AccordionDetails>
                  ) : (
                    <AccordionDetails className="tableCard__border">
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow
                              sx={{
                                "& > *": {
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            >
                              {/* <TableCell className="tbl-cell">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Item ID
                                </Typography>
                              </TableCell> */}
                              <TableCell className="tbl-cell">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Item Description
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Item Specification
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell" align="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                  PR/PO/RR Number
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell" align="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Quantity
                                </Typography>
                              </TableCell>
                              {/* <TableCell className="tbl-cell" align="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Acquisition Cost
                                </Typography>
                              </TableCell> */}
                              <TableCell className="tbl-cell" align="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Status
                                </Typography>
                              </TableCell>
                              {/* <TableCell className="tbl-cell" align="center">
                                <Typography fontWeight="bold" fontSize={14}>
                                  Action
                                </Typography>
                              </TableCell> */}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {dataApi?.data?.small_tools?.map((item, index) => {
                              return (
                                <TableRow key={index}>
                                  {/* <TableCell className="tbl-cell">
                                    <Typography fontSize={13}>{item.id}</Typography>
                                  </TableCell> */}
                                  <TableCell className="tbl-cell">
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.main"}>
                                      {item.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell className="tbl-cell">
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.light"}>
                                      {item.specification}
                                    </Typography>
                                  </TableCell>
                                  <TableCell className="tbl-cell" align="center">
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.light"}>
                                      {item.pr_number}
                                    </Typography>
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.light"}>
                                      {item.po_number}
                                    </Typography>
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.light"}>
                                      {item.rr_number}
                                    </Typography>
                                  </TableCell>{" "}
                                  <TableCell className="tbl-cell" align="center">
                                    <Typography fontSize={13}>{item.quantity}</Typography>
                                  </TableCell>
                                  {/* <TableCell className="tbl-cell" align="center">
                                    <Typography fontSize={13} fontWeight="bold" color={"secondary.light"}>
                                      ₱{item.acquisition_cost}
                                    </Typography>
                                  </TableCell> */}
                                  <TableCell className="tbl-cell" align="center">
                                    <Typography fontSize={13}>
                                      {item.status_description === "Good" ? (
                                        <Chip
                                          size="small"
                                          variant="contained"
                                          sx={{
                                            background: "#27ff811f",
                                            color: "active.dark",
                                            fontSize: "0.7rem",
                                            px: 1,
                                          }}
                                          label={item?.status_description}
                                        />
                                      ) : item.status_description === "For Releasing" ||
                                        item.status_description === "For Replacement" ? (
                                        <Chip
                                          size="small"
                                          variant="contained"
                                          sx={{
                                            // border: "1px solid #E9D502",
                                            background: "#FFFFB3",
                                            color: "#C29800",
                                            fontSize: "0.7rem",
                                            px: 1,
                                          }}
                                          label={item?.status_description}
                                        />
                                      ) : (
                                        <Chip
                                          size="small"
                                          variant="contained"
                                          sx={{
                                            background: "#fc3e3e34",
                                            color: "error.light",
                                            fontSize: "0.7rem",
                                            px: 1,
                                          }}
                                          label={item?.status_description}
                                        />
                                      )}
                                    </Typography>
                                  </TableCell>
                                  {/* <TableCell className="tbl-cell" align="center">
                                    {item?.status_description !== "For Releasing" && (
                                      <ActionMenu
                                        data={item}
                                        onUpdateSmallToolsHandler={onUpdateSmallToolsHandler}
                                        updateSmallTools
                                        hideEdit
                                      />
                                    )}
                                  </TableCell> */}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  )}
                </Accordion>

                {dataApi.data?.is_additional_cost === 0 ? (
                  <Accordion
                  // expanded={expanded}
                  // onChange={() => setExpanded(!expanded)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: "secondary.main" }} />}
                      sx={{ bgcolor: "white" }}
                    >
                      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                        ADDITIONAL COST
                      </Typography>
                    </AccordionSummary>

                    <Divider />

                    {dataApi?.data?.additional_cost?.length === 0 ? (
                      <AccordionDetails>
                        <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="5px">
                          <img src={NoDataFile} alt="" width="35px" />
                          <Typography
                            variant="p"
                            sx={{
                              fontFamily: "Anton, Roboto, Helvetica",
                              color: "secondary.main",
                              fontSize: "1.2rem",
                            }}
                          >
                            No Data Found
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableBody>
                            {dataApi.data.additional_cost?.map((mapData, index) => {
                              return (
                                <TableRow
                                  key={index}
                                  sx={{
                                    ":hover": {
                                      backgroundColor: "background.light",
                                      cursor: "pointer",
                                    },
                                  }}
                                  colSpan={9}
                                  onClick={() => handleTableData(mapData)}
                                >
                                  <TableCell width={80} align="center">
                                    <DescriptionRounded color="primary" />
                                  </TableCell>

                                  <TableCell align="left">
                                    <Typography fontSize="14px" fontWeight="bold" noWrap align="left">
                                      {mapData.asset_description}
                                    </Typography>

                                    <Typography fontSize="10px" color="text.light" noWrap>
                                      {mapData.asset_specification}
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Typography fontSize="12px" fontWeight="bold" noWrap>
                                      {`₱${
                                        mapData?.data?.acquisition_cost === (0 || null)
                                          ? 0
                                          : mapData?.acquisition_cost.toLocaleString()
                                      }`}
                                    </Typography>
                                    <Typography fontSize="10px" color="gray" noWrap>
                                      Acquisition Cost
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Typography fontSize="12px" fontWeight="bold" noWrap>
                                      {mapData.type_of_request?.type_of_request_name}
                                    </Typography>
                                    <Typography fontSize="10px" color="gray" noWrap>
                                      Asset Classification
                                    </Typography>
                                  </TableCell>

                                  <TableCell align="center">
                                    <FaStatusChange
                                      faStatus={mapData.asset_status.asset_status_name}
                                      data={mapData.asset_status.asset_status_name}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>

                        <Stack
                          flexDirection="column"
                          alignItems="center"
                          sx={{
                            px: 2,
                            py: 0.5,
                          }}
                        >
                          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={1}>
                            <Typography fontSize="14px" fontWeight="bold" color="secondary.light">
                              Main Cost:
                            </Typography>
                            <Typography color="secondary.light">
                              ₱
                              {dataApi?.data?.acquisition_cost === (0 || null)
                                ? 0
                                : dataApi?.data?.acquisition_cost.toLocaleString()}
                            </Typography>
                          </Stack>
                          {`+`}
                          <Stack flexDirection="row" alignItems="center" justifyContent="center" gap={1}>
                            <Typography fontSize="14px" fontWeight="bold" color="secondary.light">
                              Total Additional Cost:
                            </Typography>
                            <Typography color="secondary.light">
                              ₱
                              {dataApi?.data?.total_adcost === (0 || null)
                                ? 0
                                : dataApi?.data?.total_adcost.toLocaleString()}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack
                          flexDirection="row"
                          alignItems="center"
                          justifyContent="center"
                          gap={1}
                          width="100%"
                          sx={{
                            px: 2,
                            py: 1,
                            pb: 2,
                            borderTop: "1px solid lightgray",
                          }}
                        >
                          <Typography fontSize="16px" fontFamily="Anton, Poppins, Sans Serif" color="secondary.main">
                            TOTAL COST:
                          </Typography>
                          <Typography fontWeight="bold" color="secondary.main">
                            ₱
                            {dataApi?.data?.total_cost === (0 || null) ? 0 : dataApi?.data?.total_cost.toLocaleString()}
                          </Typography>
                        </Stack>
                      </TableContainer>
                    )}
                  </Accordion>
                ) : (
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: "secondary.main" }} />}
                      sx={{ bgcolor: "white" }}
                    >
                      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1rem" }}>
                        MAIN ASSET
                      </Typography>
                    </AccordionSummary>

                    <Divider />

                    <TableContainer>
                      <Table>
                        <TableBody
                          sx={{
                            overflow: "auto",
                          }}
                          colSpan={9}
                        >
                          <TableRow
                            sx={{
                              ":hover": {
                                backgroundColor: "background.light",
                                cursor: "pointer",
                              },
                            }}
                            onClick={() => {
                              handleTableData(dataApi?.data?.main);
                            }}
                          >
                            <TableCell width={80} align="center">
                              <DescriptionRounded color="secondary" />
                            </TableCell>

                            <TableCell width="550px" sx={{ minWidth: "200px" }} align="left">
                              <Typography fontSize="14px" fontWeight="bold" noWrap align="left">
                                {dataApi?.data?.main?.asset_description}
                              </Typography>

                              <Typography fontSize="10px" color="text.light">
                                {dataApi?.data?.main?.asset_specification}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography fontSize="12px" fontWeight="bold">
                                {dataApi?.data?.acquisition_cost}
                              </Typography>
                              <Typography fontSize="10px" color="gray" noWrap>
                                Acquisition Cost
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography fontSize="12px" fontWeight="bold">
                                {dataApi?.data?.type_of_request?.type_of_request_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray" noWrap>
                                Asset Classification
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <FaStatusChange
                                faStatus={dataApi?.data?.asset_status.asset_status_name}
                                data={dataApi?.data?.asset_status.asset_status_name}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Accordion>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Dialog
        open={viewDepre}
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            margin: "0",
            maxWidth: "90%",
            padding: "20px",
            // overflow: "hidden",
            bgcolor: "background.light",
          },
        }}
      >
        <Depreciation
          calcDepreApi={calcDepreApi || calcDepreAddCostApi}
          setViewDepre={setViewDepre}
          refetch={calcDepreApiRefetch}
          vladimirTag={dataApi?.data?.vladimir_tag_number}
          requestor={dataApi?.data?.requestor}
        />
      </Dialog>

      {/* <Dialog
        open={printAssignmentMemo}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            margin: "0",
            maxWidth: "90%",
            padding: "20px",
            // overflow: "hidden",
            bgcolor: "background.light",
          },
        }}
      >
        <Box>
          <AssignmentMemo dataId={dataApi?.data} setPrintAssignmentMemo={setPrintAssignmentMemo} />
        </Box>
      </Dialog> */}

      <Drawer
        open={drawer}
        anchor="right"
        PaperProps={{
          sx: { borderRadius: "10px", padding: "20px" },
        }}
      >
        {dataApi?.data?.is_additional_cost === 1 ? (
          <AddCost
            data={updateFixedAsset}
            dataApiRefetch={dataApiRefetch}
            onUpdateResetHandler={onUpdateResetHandler}
            voucher
            disableItems
          />
        ) : (
          <AddFixedAsset
            data={updateFixedAsset}
            dataApiRefetch={dataApiRefetch}
            onUpdateResetHandler={onUpdateResetHandler}
            voucher
            disableItems
          />
        )}
      </Drawer>

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        sx={{
          ".MuiPaper-root": {
            padding: "20px",
            margin: 0,
            gap: "5px",
            // minWidth: "700px",
            maxWidth: "900px",
            borderRadius: "10px",
            width: "90%",
          },
        }}
      >
        <AddInclusion data={inclusionData} fixedAsset={dataApi?.data} />
      </Dialog>

      <Dialog
        open={dialog1}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog1())}
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <EditSmallTools data={smallToolsData} />
      </Dialog>

      <Dialog
        open={dialog2}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog2())}
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <EditAssetDescription data={dataApi?.data} />
      </Dialog>
    </>
  );
};

export default FixedAssetView;
