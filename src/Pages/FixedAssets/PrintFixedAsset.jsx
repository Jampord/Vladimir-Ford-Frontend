import React, { useEffect, useState } from "react";
import moment from "moment";
import CustomAutoComplete from "../../Components/Reusable/CustomAutoComplete";
import FaStatusChange from "../../Components/Reusable/FaStatusComponent";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  Fade,
  FormControlLabel,
  FormGroup,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  DataArrayTwoTone,
  Filter,
  FilterAlt,
  FilterList,
  Help,
  HomeRepairService,
  IosShareRounded,
  PriceChange,
  Print,
  PrintDisabled,
  ResetTv,
  Search,
  Warning,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton, TabContext, TabPanel } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useDispatch, useSelector } from "react-redux";

import {
  closeDatePicker,
  closeDialog1,
  closeDialog2,
  closeDialog3,
  closeExport,
  closePrint,
  openDialog1,
  openDialog2,
  openDialog3,
  openDialog4,
  openExport,
} from "../../Redux/StateManagement/booleanStateSlice";
import {
  useGetFixedAssetApiQuery,
  useGetPrintViewingApiQuery,
  usePostPrintApiMutation,
  usePostLocalPrintApiMutation,
  usePutMemoPrintApiMutation,
  usePutSmallToolsPrintableApiMutation,
  usePutUngroupSmallToolsApiMutation,
  usePostGroupFixedAssetApiMutation,
} from "../../Redux/Query/FixedAsset/FixedAssets";
import { usePostPrintOfflineApiMutation } from "../../Redux/Query/FixedAsset/OfflinePrintingFA";
import { usePostPrintStalwartDateApiMutation } from "../../Redux/Query/FixedAsset/StalwartPrintingFA";
import { useGetTypeOfRequestAllApiQuery } from "../../Redux/Query/Masterlist/TypeOfRequest";
import CustomDatePicker from "../../Components/Reusable/CustomDatePicker";
import CustomTextField from "../../Components/Reusable/CustomTextField";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { useGetIpApiQuery } from "../../Redux/Query/IpAddressSetup";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AssignmentMemo from "./AssignmentMemo";
import { notificationApi, useGetNotificationApiQuery } from "../../Redux/Query/Notification";
import AddSmallToolsGroup from "./AddEdit/AddSmallToolsGroup";
import AddTagAddCost from "./AddEdit/AddTagAddCost";
import ExportPrintFixedAsset from "./ExportPrintFixedAsset";

const schema = yup.object().shape({
  id: yup.string(),
  // tagNumber: yup
  //   .string()
  //   .transform((value) => {
  //     return value?.id.toString();
  //   })
  //   .required()
  //   .label("Type of Request"),
  // search: yup.string().nullable(),
  // startDate: yup.string().nullable(),
  // endDate: yup.string().nullable(),

  tagNumber: yup.array().required(),
  search: yup.string().nullable(),
  startDate: yup.date().nullable(),
  endDate: yup.date().nullable(),
});

const PrintFixedAsset = (props) => {
  const { isRequest } = props;

  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");
  const [filter, setFilter] = useState([]);
  const [printMemo, setPrintMemo] = useState(false);
  const [printAssignmentMemo, setPrintAssignmentMemo] = useState(false);
  const [faFilter, setFaFilter] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [faData, setFaData] = useState(null);

  const dispatch = useDispatch();

  const dialog = useSelector((state) => state.booleanState.dialogMultiple.dialog2);
  const dialog2 = useSelector((state) => state.booleanState.dialogMultiple.dialog3);
  const dialog3 = useSelector((state) => state.booleanState.dialogMultiple.dialog4);

  const isSmallerScreen = useMediaQuery("(max-width: 600px)");
  const isSmallScreen = useMediaQuery("(max-width: 850px)");

  // Tabs -----------------
  const [tabValue, setTabValue] = useState("1");
  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    refetch();
  }, [notifData]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    // setPrintMemo(false);
    reset();
    refetch();
    setPage(1);
  };

  // Table Sorting --------------------------------

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  const descendingComparator = (a, b, orderBy) => {
    const multiple = orderBy.split(".").length > 1;
    if (multiple) {
      const [orderBy1, orderBy2] = orderBy.split(".");
      if (b[orderBy1][orderBy2] < a[orderBy1][orderBy2]) {
        return -1;
      }
      if (b[orderBy1][orderBy2] > a[orderBy1][orderBy2]) {
        return 1;
      }
      return 0;
    }

    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const comparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const onSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const {
    data: ip,
    isLoading: isIpLoading,
    isFetching: isIpFetching,
  } = useGetIpApiQuery({}, { refetchOnMountOrArgChange: true });

  const [printAsset, { data: printData, isLoading, isError: isPostError, isSuccess: isPostSuccess, error: postError }] =
    usePostPrintApiMutation();

  const [
    putMemo,
    { data: memoData, isLoading: isMemoLoading, isError: isMemoError, isSuccess: isMemoSuccess, error: memoError },
  ] = usePutMemoPrintApiMutation();

  const [
    putSmallToolsPrintable,
    { data: putData, isLoading: isPutLoading, isError: isPutError, isSuccess: isPutSuccess, error: putError },
  ] = usePutSmallToolsPrintableApiMutation();

  const [
    putUngroupSmallTools,
    {
      data: putUngroupData,
      isLoading: isPutUngroupLoading,
      isError: isPutUngroupError,
      isSuccess: isPutUngroupSuccess,
      error: putUngroupError,
    },
  ] = usePutUngroupSmallToolsApiMutation();

  const [
    postGroupFixedAsset,
    {
      data: postFixedAssetData,
      isLoading: isPostFixedAssetLoading,
      isSuccess: isPostFixedAssetSuccess,
      isError: isPostFixedAssetError,
      error: postFixedAssetError,
    },
  ] = usePostGroupFixedAssetApiMutation();

  const {
    data: fixedAssetData,
    isLoading: fixedAssetLoading,
    isSuccess: fixedAssetSuccess,
    isError: fixedAssetError,
    isFetching: fixedAssetFetching,
    error: errorData,
    refetch: fixedAssetRefetch,
  } = useGetPrintViewingApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      startDate: startDate,
      endDate: endDate,
      isRequest: isRequest ? 1 : 0,
      printMemo: isRequest ? (printMemo ? 1 : 0) : null,
      smallTool: tabValue === "2" ? 1 : 0,
    },
    { refetchOnMountOrArgChange: true }
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setError,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      tagNumber: [],
      search: "",
      startDate: null,
      endDate: null,
      // endDate: new Date(),
    },
  });

  const resetHandler = () => {
    reset();
  };

  useEffect(() => {
    if (isPostSuccess || isMemoSuccess || isPutSuccess || isPutUngroupSuccess || isPostFixedAssetSuccess) {
      dispatch(
        openToast({
          message:
            printData?.message ||
            memoData?.message ||
            putData?.message ||
            putUngroupData?.message ||
            postFixedAssetData?.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess, isMemoSuccess, isPutSuccess, isPutUngroupSuccess, isPostFixedAssetSuccess]);

  useEffect(() => {
    if (
      (isPostError || isMemoError || isPutError || isPutUngroupError) &&
      (putError?.status === 422 ||
        memoError?.status === 422 ||
        postError?.status === 422 ||
        putUngroupError?.status === 422)
    ) {
      setError("search", {
        type: "validate",
        message:
          postError?.data?.message ||
          memoError?.data?.message ||
          putError?.data?.message ||
          putUngroupError?.data?.message,
      });

      dispatch(
        openToast({
          message: postError?.data?.message || memoError?.data?.message || putError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (
      (isPostError || isMemoError || isPutError || isPutUngroupError) &&
      (putError?.status === 403 ||
        memoError?.status === 403 ||
        postError?.status === 403 ||
        putUngroupError?.status === 403)
    ) {
      dispatch(
        openToast({
          message:
            postError?.data?.message ||
            memoError?.data?.message ||
            putError?.data?.message ||
            putUngroupError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (
      (isPostError || isMemoError || isPutError || isPutUngroupError) &&
      (putError?.status === 404 || memoError?.status === 404 || postError?.status === 404 || putUngroupError === 404)
    ) {
      dispatch(
        openToast({
          message:
            postError?.data?.message ||
            memoError?.data?.message ||
            putError?.data?.message ||
            putUngroupError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (
      (isPostError || isMemoError || isPutError || isPutUngroupError) &&
      (putError?.status !== 422 ||
        memoError?.status !== 422 ||
        postError?.status !== 422 ||
        putUngroupError?.status !== 422)
    ) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError, isMemoError, isPutError, isPutUngroupError]);

  const onPrintHandler = (formData) => {
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to print</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {watch("tagNumber").length === 0 ? "ALL" : "SELECTED"}
            </Typography>{" "}
            Barcode?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await printAsset({
              ip: ip.data,
              tagNumber: formData?.tagNumber,
            }).unwrap();
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            dispatch(closeConfirm());
            reset();
            refetch();
          } catch (err) {
            reset();
          }
        },
      })
    );
  };

  const onPrintMemoHandler = async (formData) => {
    setFaData(fixedAssetData?.data);
    setSelectedMemo(formData?.tagNumber);
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to print</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              ASSIGNMENT MEMO?
            </Typography>
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const res = await putMemo({
              fixed_asset_id: formData?.tagNumber,
            }).unwrap();
            setPrintAssignmentMemo(true);
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            reset();
            refetch();
          } catch (err) {
            if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err.data?.message,
                  duration: 5000,
                  variant: "error",
                })
              );
              // dispatch(
              //   openToast({
              //     message: "Succesfully printed.",
              //     duration: 5000,
              //   })
              // );
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
              // dispatch(
              //   openToast({
              //     message: "Succesfully printed.",
              //     duration: 5000,
              //   })
              // );
            }
          }
        },
      })
    );
  };

  const onTagNonPrintableAssetHandler = (formData) => {
    const id = smallToolsData.map((data) => data.id);
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to tag</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {watch("tagNumber").length === 0 ? "ALL" : "SELECTED"}
            </Typography>{" "}
            Asset as{" "}
            <Typography
              sx={{
                // display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              NON-PRINTABLE?
            </Typography>
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await putSmallToolsPrintable({
              fixed_asset_id: id,
              is_printable: 0,
            }).unwrap();

            // dispatch(
            //   openToast({
            //     message: result.message,
            //     duration: 5000,
            //   })
            // );
            // dispatch(
            //   openToast({
            //     message: "Printed successfully.",
            //     duration: 5000,
            //   })
            // );
            dispatch(closeConfirm());
            reset();
            refetch();
          } catch (err) {
            if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
            } else if (err?.status !== 422) {
            }
          }
        },
      })
    );
  };

  const onTagNonPrintableHandler = (formData) => {
    const id = smallToolsData.map((data) => data.id);
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to tag</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {watch("tagNumber").length === 0 ? "ALL" : "SELECTED"}
            </Typography>{" "}
            Small Tools as{" "}
            <Typography
              sx={{
                // display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              NON-PRINTABLE?
            </Typography>
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await putSmallToolsPrintable({
              fixed_asset_id: id,
              is_printable: 0,
            }).unwrap();

            // dispatch(
            //   openToast({
            //     message: result.message,
            //     duration: 5000,
            //   })
            // );
            // dispatch(
            //   openToast({
            //     message: "Printed successfully.",
            //     duration: 5000,
            //   })
            // );
            dispatch(closeConfirm());
            reset();
            refetch();
          } catch (err) {
            if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
            } else if (err?.status !== 422) {
            }
          }
        },
      })
    );
  };

  const onUngroupSmallToolsHandler = (formData) => {
    const id = smallToolsData.map((data) => data.id);

    dispatch(
      openConfirm({
        icon: Warning,
        iconColor: "warning",
        message: (
          <Box>
            <Typography>Are you sure you want to</Typography>
            <Typography
              sx={{
                // display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              UNGROUP
            </Typography>{" "}
            selected {tabValue === "1" ? "Fixed Asset" : "Small Tools"}?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result =
              tabValue === "1"
                ? await postGroupFixedAsset({ main_asset_id: id, action: "ungroup" }).unwrap()
                : await putUngroupSmallTools({
                    id: id,
                  }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            refetch();
            reset();
            resetHandler();
          } catch (err) {
            dispatch(
              openToast({
                message: err.data.message || "Something went wrong! Please try again or contact support.",
                duration: 5000,
                variant: "error",
              })
            );
          }
        },
      })
    );
  };

  const handleClose = () => {
    dispatch(closePrint());
  };

  const handleCloseMenu = () => {
    setAnchorElFaFilter(null);
  };

  const searchHandler = (e) => {
    if (e.key === "Enter") {
      setSearch(e.target.value);
      e.preventDefault();
    }
  };

  const handleSearchClick = () => {
    setSearch(watch("search"));

    if (!watch("startDate")) {
      setStartDate(null);
    } else {
      setStartDate(moment(watch("startDate")).format("YYYY-MM-DD"));
    }

    if (!watch("endDate")) {
      setEndDate(null);
    } else {
      setEndDate(moment(watch("endDate")).format("YYYY-MM-DD"));
    }
  };

  const tagNumberAllHandler = (checked) => {
    if (checked) {
      setValue(
        "tagNumber",
        fixedAssetData.data?.map((item) => item.vladimir_tag_number)
      );
    } else {
      reset({ tagNumber: [] });
    }
  };

  const handleRowClick = (id) => {
    const current = watch("tagNumber");

    if (current.includes(id)) {
      // remove
      setValue(
        "tagNumber",
        current.filter((item) => item !== id)
      );
    } else {
      // add
      setValue("tagNumber", [...current, id]);
    }
  };

  console.log("watch tag number:", watch("tagNumber"));

  const smallToolsData = fixedAssetData?.data.filter((data) => watch("tagNumber").includes(data.vladimir_tag_number));
  const printable = smallToolsData?.map((data) => data?.is_parent).includes(1);
  const isMainAsset = smallToolsData?.map((data) => data?.is_main).includes(1);

  //Validations for Small Tools Grouping
  const areAllCOASame = (assets) => {
    if (assets) {
      if (assets?.length === 0) return true; // No assets to compare

      const firstDepartment = assets[0]?.department?.department_name;
      const firstBusinessUnit = assets[0]?.business_unit?.business_unit_name;
      const firstCompany = assets[0]?.company?.company_name;
      const firstUnit = assets[0]?.unit?.unit_name;
      const firstSubunit = assets[0]?.subunit?.subunit_name;
      const firstLocation = assets[0]?.location?.location_name;

      for (let i = 1; i < assets.length; i++) {
        if (assets[i]?.department?.department_name !== firstDepartment) {
          return false; // Found a different department
        }
        if (assets[i]?.business_unit?.business_unit_name !== firstBusinessUnit) {
          return false; // Found a different business unit
        }
        if (assets[i]?.company?.company_name !== firstCompany) {
          return false; // Found a different company
        }
        if (assets[i]?.unit?.unit_name !== firstUnit) {
          return false; // Found a different unit
        }
        if (assets[i]?.subunit?.subunit_name !== firstSubunit) {
          return false; // Found a different subunit
        }
        if (assets[i]?.location?.location_name !== firstLocation) {
          return false; // Found a different location
        }
      }
      return true; // All COA are the same
    }
  };

  const result = areAllCOASame(smallToolsData);

  const containerSx = {
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",

    position: "relative",
    // padding: 0 10px;
    // color: $secondary;
    margin: "0 10px",
    width: "100%",
    maxWidth: "1800px",

    // height: 250px;
    // height: 100vh;
    flex: 1,
  };

  const tabBackgroundSx = {
    background: "#f9aa33",
    boxShadow: "0px -3px 19px -10px rgba(166, 166, 166, 0.4)",
    fontWeight: "bold",
    borderRadius: "5px 5px 0px 0px",
    border: "1px solid #dedede",
    color: "#fefeee !important",
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={printMemo ? handleSubmit(onPrintMemoHandler) : handleSubmit(onPrintHandler)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "10px",
          // width: "100%",
        }}
      >
        <Stack flexDirection="row" justifyContent="space-between" width="100%">
          <Stack flexDirection="row" alignItems="center" pl="10px" gap={1.5}>
            <Print color="primary" fontSize={isSmallerScreen ? "small" : "large"} />
            <Typography
              noWrap
              variant={isSmallerScreen ? "body2" : "h5"}
              color="secondary"
              sx={{
                fontFamily: "Anton",
              }}
            >
              {isRequest ? "Print Request" : "Print Asset"}
            </Typography>
          </Stack>

          {/* {!!isRequest && ( */}
          {!!isRequest && (
            <FormControlLabel
              label={"Assignment Memo"}
              control={
                <Checkbox
                  size="small"
                  color="primary"
                  checked={printMemo}
                  onChange={() => {
                    setPrintMemo(!printMemo);
                    reset();
                  }}
                  sx={{ p: 0, px: 1 }}
                />
              }
              sx={{
                pr: 2,
                pl: 0.5,
                borderRadius: 3,
                outline: isSmallerScreen ? "1px solid" : "2px solid",
                outlineColor: printMemo ? "primary.main" : "secondary.main",

                ".MuiFormControlLabel-label": {
                  fontSize: isSmallerScreen && "10px",
                  // fontWeight: isSmallerScreen && 700,
                },
              }}
            />
          )}
        </Stack>
        <Divider width="100%" sx={{ boxShadow: "1px solid black" }} />

        {!isRequest ? (
          <>
            <Stack
              py={0.5}
              px={1}
              flexDirection={isSmallScreen ? "column" : "row"}
              // flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              gap={1}
            >
              <Stack flexDirection="row" width="100%">
                <CustomTextField
                  control={control}
                  name="search"
                  label="Search"
                  type="text"
                  optional
                  color="secondary"
                  onKeyDown={searchHandler}
                  fullWidth={isSmallScreen ? true : false}
                />
              </Stack>

              <Stack
                flexDirection="row"
                gap={isSmallScreen ? 1 : 2}
                justifyContent="center"
                flexWrap={isSmallScreen ? "wrap" : null}
              >
                <Stack
                  flexDirection="row"
                  gap={1}
                  width={isSmallScreen ? "100%" : null}
                  flexWrap={isSmallerScreen ? "wrap" : "noWrap"}
                >
                  <CustomDatePicker
                    control={control}
                    name="startDate"
                    label="Start Date"
                    size="small"
                    fullWidth
                    optional
                    disableFuture
                    reduceAnimations
                    onChange={(newValue) => {
                      setValue("endDate", null);
                      return newValue;
                    }}
                  />

                  <CustomDatePicker
                    control={control}
                    name="endDate"
                    label="End Date"
                    size="small"
                    // views={["year", "month", "day"]}
                    minDate={watch("startDate")}
                    fullWidth
                    optional
                    disableFuture
                    reduceAnimations
                    disabled={watch("startDate") === null || watch("startDate") === ""}
                  />
                </Stack>

                {isSmallScreen ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSearchClick}
                    sx={{
                      backgroundColor: "primary",
                      width: isSmallScreen && "100%",
                      // maxWidth: "100%",
                    }}
                  >
                    <Search /> {"  "}Search
                  </Button>
                ) : (
                  <IconButton
                    onClick={handleSearchClick}
                    sx={{ bgcolor: "primary.main", ":hover": { bgcolor: "primary.dark" } }}
                  >
                    <Search />
                  </IconButton>
                )}
              </Stack>
            </Stack>
            <Box
              sx={{
                border: "1px solid lightgray",
                borderRadius: "10px",
                width: "100%",
                // maxWidth: "850px",
              }}
            >
              <TableContainer
                sx={{
                  height: isSmallScreen ? "35vh" : "45vh",
                  borderRadius: "10px",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          whiteSpace: "nowrap",
                          backgroundColor: "secondary.main",
                          ".MuiButtonBase-root": { color: "white" },
                          ".MuiTableSortLabel-icon": { color: "white!important" },
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ backgroundColor: "secondary.main", p: 0 }}>
                        <FormControlLabel
                          sx={{ margin: "auto", align: "center" }}
                          control={
                            <Checkbox
                              value=""
                              size="small"
                              sx={{ color: "primary" }}
                              checked={
                                !!fixedAssetData?.data
                                  ?.map((mapItem) => mapItem.vladimir_tag_number)
                                  .every((item) => watch("tagNumber").includes(item))
                              }
                              onChange={(e) => {
                                tagNumberAllHandler(e.target.checked);
                              }}
                            />
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableSortLabel
                          active={orderBy === `vladimir_tag_number`}
                          direction={orderBy === `vladimir_tag_number` ? order : `asc`}
                          onClick={() => onSort(`vladimir_tag_number`)}
                        >
                          Vladimir Tag #
                        </TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel disabled>PR/PO/RR/Reference No.</TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel disabled>Acquisition Cost</TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel disabled>Requestor</TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel disabled>Chart Of Accounts</TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel disabled>Accountability</TableSortLabel>
                      </TableCell>

                      <TableCell
                        sx={{
                          textAlign: "center",
                          backgroundColor: "secondary.main",
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === `asset_status.asset_status_name`}
                          direction={orderBy === `asset_status.asset_status_name` ? order : `asc`}
                          onClick={() => onSort(`asset_status.asset_status_name`)}
                        >
                          Asset Status
                        </TableSortLabel>
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "secondary.main",
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === `acquisition_date`}
                          direction={orderBy === `acquisition_date` ? order : `asc`}
                          onClick={() => onSort(`acquisition_date`)}
                        >
                          Date Created
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {fixedAssetSuccess && fixedAssetData.data.length === 0 ? (
                      <NoRecordsFound heightData="xs" />
                    ) : (
                      <>
                        {fixedAssetSuccess &&
                          [...fixedAssetData.data].sort(comparator(order, orderBy))?.map((data) => {
                            return (
                              <TableRow
                                key={data.id}
                                hover
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    borderBottom: 0,
                                  },
                                  overflow: "auto",
                                }}
                                onClick={() => handleRowClick(data.vladimir_tag_number)}
                              >
                                <TableCell align="center">
                                  <FormControlLabel
                                    value={data.vladimir_tag_number}
                                    sx={{ margin: "auto" }}
                                    disabled={data.action === "view"}
                                    control={
                                      <Checkbox
                                        size="small"
                                        {...register("tagNumber")}
                                        checked={watch("tagNumber").includes(data.vladimir_tag_number)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    }
                                  />
                                </TableCell>

                                <TableCell>
                                  <Typography noWrap variant="h6" fontSize="16px" color="secondary" fontWeight="bold">
                                    {data?.is_printable === 0 ? "NON-PRINTABLE" : data.vladimir_tag_number}
                                  </Typography>

                                  <Typography
                                    fontSize={"13px"}
                                    fontWeight={400}
                                    width="300px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    color="secondary.main"
                                    noWrap
                                  >
                                    {data.asset_description}
                                  </Typography>

                                  <Typography
                                    fontSize={12}
                                    fontWeight={400}
                                    width="300px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    color="text.light"
                                    noWrap
                                  >
                                    <Tooltip title={data.asset_specification} placement="bottom" arrow>
                                      {data.asset_specification}
                                    </Tooltip>
                                  </Typography>

                                  <Typography noWrap fontSize="12px" color="primary" fontWeight="bold">
                                    {data.type_of_request.type_of_request_name.toUpperCase()}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                    PR - {data.pr_number}
                                  </Typography>
                                  <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                    PO - {data.po_number}
                                  </Typography>
                                  <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                    RR - {data.rr_number}
                                  </Typography>
                                  <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                    Reference No. - {data.ymir_ref_number}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  {" "}
                                  <Typography noWrap fontSize="13px" color="secondary.main">
                                    ₱{data?.acquisition_cost || " "}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography fontSize={12} fontWeight={600} color="secondary.main">
                                    {data.requestor.employee_id}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                    {data.requestor.first_name}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                    {data.requestor.last_name}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data?.one_charging?.code}
                                    {" - "} {data?.one_charging?.name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.company.company_code}
                                    {" - "} {data.company.company_name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.business_unit.business_unit_code}
                                    {" - "} {data.business_unit.business_unit_name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.department.department_code}
                                    {" - "}
                                    {data.department.department_name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.unit.unit_code}
                                    {" - "} {data.unit.unit_name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.subunit.subunit_code}
                                    {" - "} {data.subunit.subunit_name}
                                  </Typography>
                                  <Typography noWrap fontSize="10px" color="gray">
                                    {data.location.location_code} {" - "}
                                    {data.location.location_name}
                                  </Typography>
                                  {/* <Typography noWrap fontSize="10px" color="gray">
                    {data.account_title.account_title_code}
                    {" - "}
                    {data.account_title.account_title_name}
                  </Typography> */}
                                </TableCell>

                                <TableCell>
                                  <Typography noWrap variant="h3" fontSize="12px" color="secondary" fontWeight="bold">
                                    {data.accountable}
                                  </Typography>
                                  <Typography noWrap fontSize="11px" color="gray">
                                    {data.accountability}
                                  </Typography>
                                </TableCell>

                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    pr: "35px",
                                  }}
                                >
                                  <FaStatusChange
                                    faStatus={data.asset_status.asset_status_name}
                                    data={data.asset_status.asset_status_name}
                                  />
                                </TableCell>

                                <TableCell align="center">
                                  <Typography noWrap fontSize="13px" paddingRight="15px">
                                    {moment(data.created_at).format("MMM-DD-YYYY")}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <CustomTablePagination
                total={fixedAssetData?.total}
                success={fixedAssetSuccess}
                current_page={fixedAssetData?.current_page}
                per_page={fixedAssetData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
                removeShadow
              />
            </Box>

            <Stack flexDirection="row" width="100%" justifyContent="space-between" flexWrap="wrap" alignItems="center">
              <Box sx={{ pl: "5px" }}>
                <Typography fontFamily="Anton, Impact, Roboto" fontSize="18px" color="secondary.main">
                  Selected: {watch("tagNumber").length}
                </Typography>
              </Box>

              <Stack gap={1.2} flexDirection="row" alignSelf="flex-end" mt={1} mb={1}>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={isLoading || isIpFetching || isIpLoading}
                  startIcon={isLoading ? null : <Print color={watch("tagNumber").length === 0 ? "gray" : "primary"} />}
                  disabled={watch("tagNumber").length === 0}
                  type="submit"
                  color={printMemo ? "tertiary" : "secondary"}
                  sx={{ color: "white" }}
                >
                  {printMemo ? "Print Assignment Memo" : "Print"}
                </LoadingButton>

                <Button variant="outlined" size="small" color="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </>
        ) : (
          <Box sx={containerSx}>
            <TabContext value={tabValue}>
              <Tabs onChange={handleChange} value={tabValue}>
                <Tab
                  label={
                    <Badge color="error" badgeContent={notifData?.toTagCount}>
                      Fixed Asset
                    </Badge>
                  }
                  value="1"
                  sx={tabValue === "1" ? tabBackgroundSx : null}
                />

                <Tab
                  label={
                    <Badge color="error" badgeContent={notifData?.toSmallToolTagging}>
                      Small Tools
                    </Badge>
                  }
                  value="2"
                  sx={tabValue === "2" ? tabBackgroundSx : null}
                />
              </Tabs>

              <TabPanel sx={{ p: 0 }} value="1" index="1">
                <Stack>
                  <Box className="mcontainer__wrapper">
                    <Stack
                      py={0.5}
                      px={1}
                      flexDirection={isSmallScreen ? "column" : "row"}
                      // flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                      gap={1}
                    >
                      <Stack flexDirection="row" width="100%">
                        <CustomTextField
                          control={control}
                          name="search"
                          label="Search"
                          type="text"
                          optional
                          color="secondary"
                          onKeyDown={searchHandler}
                          fullWidth={isSmallScreen ? true : false}
                        />
                      </Stack>

                      <Stack
                        flexDirection="row"
                        gap={isSmallScreen ? 1 : 2}
                        justifyContent="center"
                        flexWrap={isSmallScreen ? "wrap" : null}
                      >
                        <Stack
                          flexDirection="row"
                          gap={1}
                          width={isSmallScreen ? "100%" : null}
                          flexWrap={isSmallerScreen ? "wrap" : "noWrap"}
                        >
                          <CustomDatePicker
                            control={control}
                            name="startDate"
                            label="Start Date"
                            size="small"
                            fullWidth
                            optional
                            disableFuture
                            reduceAnimations
                            onChange={(newValue) => {
                              setValue("endDate", null);
                              return newValue;
                            }}
                          />

                          <CustomDatePicker
                            control={control}
                            name="endDate"
                            label="End Date"
                            size="small"
                            // views={["year", "month", "day"]}
                            minDate={watch("startDate")}
                            fullWidth
                            optional
                            disableFuture
                            reduceAnimations
                            disabled={watch("startDate") === null || watch("startDate") === ""}
                          />
                        </Stack>

                        {isSmallScreen ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleSearchClick}
                            sx={{
                              backgroundColor: "primary",
                              width: isSmallScreen && "100%",
                              // maxWidth: "100%",
                            }}
                          >
                            <Search /> {"  "}Search
                          </Button>
                        ) : (
                          <IconButton
                            onClick={handleSearchClick}
                            sx={{ bgcolor: "primary.main", ":hover": { bgcolor: "primary.dark" } }}
                          >
                            <Search />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                    <Box
                      sx={{
                        border: "1px solid lightgray",
                        borderRadius: "10px",
                        width: "100%",
                        // maxWidth: "850px",
                      }}
                    >
                      <TableContainer
                        sx={{
                          height: isSmallScreen ? "35vh" : "45vh",
                          borderRadius: "10px",
                        }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow
                              sx={{
                                "& > *": {
                                  whiteSpace: "nowrap",
                                  backgroundColor: "secondary.main",
                                  ".MuiButtonBase-root": { color: "white" },
                                  ".MuiTableSortLabel-icon": { color: "white!important" },
                                },
                              }}
                            >
                              <TableCell align="center" sx={{ backgroundColor: "secondary.main", p: 0 }}>
                                <FormControlLabel
                                  sx={{ margin: "auto", align: "center" }}
                                  control={
                                    <Checkbox
                                      value=""
                                      size="small"
                                      sx={{ color: "primary" }}
                                      checked={
                                        !!fixedAssetData?.data
                                          ?.map((mapItem) => mapItem.vladimir_tag_number)
                                          .every((item) => watch("tagNumber").includes(item))
                                      }
                                      onChange={(e) => {
                                        tagNumberAllHandler(e.target.checked);
                                      }}
                                    />
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <TableSortLabel
                                  active={orderBy === `vladimir_tag_number`}
                                  direction={orderBy === `vladimir_tag_number` ? order : `asc`}
                                  onClick={() => onSort(`vladimir_tag_number`)}
                                >
                                  Vladimir Tag #
                                </TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>PR/PO/RR/Reference No.</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Acquisition Cost</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Requestor</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Chart Of Accounts</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Accountability</TableSortLabel>
                              </TableCell>

                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  backgroundColor: "secondary.main",
                                }}
                              >
                                <TableSortLabel
                                  active={orderBy === `asset_status.asset_status_name`}
                                  direction={orderBy === `asset_status.asset_status_name` ? order : `asc`}
                                  onClick={() => onSort(`asset_status.asset_status_name`)}
                                >
                                  Asset Status
                                </TableSortLabel>
                              </TableCell>

                              <TableCell
                                align="center"
                                sx={{
                                  backgroundColor: "secondary.main",
                                }}
                              >
                                <TableSortLabel
                                  active={orderBy === `acquisition_date`}
                                  direction={orderBy === `acquisition_date` ? order : `asc`}
                                  onClick={() => onSort(`acquisition_date`)}
                                >
                                  Date Created
                                </TableSortLabel>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {fixedAssetSuccess && fixedAssetData.data.length === 0 ? (
                              <NoRecordsFound heightData="xs" />
                            ) : (
                              <>
                                {fixedAssetSuccess &&
                                  [...fixedAssetData.data].sort(comparator(order, orderBy))?.map((data) => {
                                    return (
                                      <TableRow
                                        key={data.id}
                                        hover
                                        sx={{
                                          "&:last-child td, &:last-child th": {
                                            borderBottom: 0,
                                          },
                                          overflow: "auto",
                                        }}
                                        onClick={() => handleRowClick(data.vladimir_tag_number)}
                                      >
                                        <TableCell align="center">
                                          <FormControlLabel
                                            value={data.vladimir_tag_number}
                                            sx={{ margin: "auto" }}
                                            disabled={data.action === "view"}
                                            control={
                                              <Checkbox
                                                size="small"
                                                {...register("tagNumber")}
                                                checked={watch("tagNumber").includes(data.vladimir_tag_number)}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            }
                                          />
                                        </TableCell>

                                        <TableCell>
                                          <Typography
                                            noWrap
                                            variant="h6"
                                            fontSize="16px"
                                            color="secondary"
                                            fontWeight="bold"
                                          >
                                            {data?.is_printable === 0 ? "NON-PRINTABLE" : data.vladimir_tag_number}
                                          </Typography>

                                          <Typography
                                            fontSize={"13px"}
                                            fontWeight={400}
                                            width="300px"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            color="secondary.main"
                                            noWrap
                                          >
                                            {data.asset_description}
                                          </Typography>

                                          <Typography
                                            fontSize={12}
                                            fontWeight={400}
                                            width="300px"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            color="text.light"
                                            noWrap
                                          >
                                            <Tooltip title={data.asset_specification} placement="bottom" arrow>
                                              {data.asset_specification}
                                            </Tooltip>
                                          </Typography>

                                          <Typography noWrap fontSize="12px" color="primary" fontWeight="bold">
                                            {data.type_of_request.type_of_request_name.toUpperCase()}{" "}
                                            {data?.is_main ? "(Grouped)" : null}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            PR - {data.pr_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            PO - {data.po_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            RR - {data.rr_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            Reference No. - {data.ymir_ref_number}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography noWrap fontSize="13px" color="secondary.main">
                                            ₱{data?.acquisition_cost || " "}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography fontSize={12} fontWeight={600} color="secondary.main">
                                            {data.requestor.employee_id}
                                          </Typography>
                                          <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                            {data.requestor.first_name}
                                          </Typography>
                                          <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                            {data.requestor.last_name}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data?.one_charging?.code}
                                            {" - "} {data?.one_charging?.name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.company.company_code}
                                            {" - "} {data.company.company_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.business_unit.business_unit_code}
                                            {" - "} {data.business_unit.business_unit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.department.department_code}
                                            {" - "}
                                            {data.department.department_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.unit.unit_code}
                                            {" - "} {data.unit.unit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.subunit.subunit_code}
                                            {" - "} {data.subunit.subunit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.location.location_code} {" - "}
                                            {data.location.location_name}
                                          </Typography>
                                          {/* <Typography noWrap fontSize="10px" color="gray">
                                {data.account_title.account_title_code}
                                {" - "}
                                {data.account_title.account_title_name}
                              </Typography> */}
                                        </TableCell>

                                        <TableCell>
                                          <Typography
                                            noWrap
                                            variant="h3"
                                            fontSize="12px"
                                            color="secondary"
                                            fontWeight="bold"
                                          >
                                            {data.accountable}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" color="gray">
                                            {data.accountability}
                                          </Typography>
                                        </TableCell>

                                        <TableCell
                                          sx={{
                                            textAlign: "center",
                                            pr: "35px",
                                          }}
                                        >
                                          <FaStatusChange
                                            faStatus={data.asset_status.asset_status_name}
                                            data={data.asset_status.asset_status_name}
                                          />
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography noWrap fontSize="13px" paddingRight="15px">
                                            {moment(data.created_at).format("MMM-DD-YYYY")}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                              </>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box className="mcontainer__pagination-export">
                        <Button
                          className="mcontainer__export"
                          variant="outlined"
                          size="small"
                          color="text"
                          startIcon={<IosShareRounded color="primary" />}
                          // onClick={handleExport}
                          onClick={() => dispatch(openDialog4())}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "10px 20px",
                          }}
                        >
                          EXPORT
                        </Button>

                        <CustomTablePagination
                          total={fixedAssetData?.total}
                          success={fixedAssetSuccess}
                          current_page={fixedAssetData?.current_page}
                          per_page={fixedAssetData?.per_page}
                          onPageChange={pageHandler}
                          onRowsPerPageChange={perPageHandler}
                          removeShadow
                        />
                      </Box>
                    </Box>

                    <Stack
                      flexDirection="row"
                      width="100%"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      alignItems="center"
                    >
                      <Box sx={{ pl: "5px" }}>
                        <Typography fontFamily="Anton, Impact, Roboto" fontSize="18px" color="secondary.main">
                          Selected: {watch("tagNumber").length}
                        </Typography>
                      </Box>

                      {result === false && (
                        <Typography noWrap fontSize="11px" color="error">
                          Selected items does not have the same COA.
                        </Typography>
                      )}

                      <Stack gap={1.2} flexDirection="row" alignSelf="flex-end" mt={1} mb={1}>
                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <PriceChange
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    printable === true ||
                                    result === false ||
                                    isMainAsset === true
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 ||
                              printable === true ||
                              result === false ||
                              isMainAsset === true
                            }
                            onClick={() => dispatch(openDialog3())}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Tag as Add Cost"}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <HomeRepairService
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    watch("tagNumber").length === 1 ||
                                    result === false
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 || watch("tagNumber").length === 1 || result === false
                            }
                            onClick={() => dispatch(openDialog2())}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Group "}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <HomeRepairService
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    watch("tagNumber").length > 1 ||
                                    isMainAsset === false
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 || watch("tagNumber").length > 1 || isMainAsset === false
                            }
                            onClick={onUngroupSmallToolsHandler}
                            color={printMemo ? "tertiary" : "warning"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Ungroup "}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <PrintDisabled
                                  color={
                                    watch("tagNumber").length === 0 || printable === true || isMainAsset === true
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={watch("tagNumber").length === 0 || printable === true || isMainAsset === true}
                            onClick={onTagNonPrintableAssetHandler}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Tag as Non-Printable"}
                          </LoadingButton>
                        )}

                        <LoadingButton
                          size="small"
                          variant="contained"
                          loading={isLoading || isIpFetching || isIpLoading}
                          startIcon={
                            isLoading ? null : <Print color={watch("tagNumber").length === 0 ? "gray" : "primary"} />
                          }
                          disabled={watch("tagNumber").length === 0}
                          type="submit"
                          color={printMemo ? "tertiary" : "secondary"}
                          sx={{ color: "white" }}
                        >
                          {printMemo ? "Print Assignment Memo" : "Print"}
                        </LoadingButton>

                        <Button variant="outlined" size="small" color="secondary" onClick={handleClose}>
                          Close
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel sx={{ p: 0 }} value="2" index="2">
                <Stack>
                  <Box className="mcontainer__wrapper">
                    <Stack
                      py={0.5}
                      px={1}
                      flexDirection={isSmallScreen ? "column" : "row"}
                      // flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                      gap={1}
                    >
                      <Stack flexDirection="row" width="100%">
                        <CustomTextField
                          control={control}
                          name="search"
                          label="Search"
                          type="text"
                          optional
                          color="secondary"
                          onKeyDown={searchHandler}
                          fullWidth={isSmallScreen ? true : false}
                        />
                      </Stack>

                      <Stack
                        flexDirection="row"
                        gap={isSmallScreen ? 1 : 2}
                        justifyContent="center"
                        flexWrap={isSmallScreen ? "wrap" : null}
                      >
                        <Stack
                          flexDirection="row"
                          gap={1}
                          width={isSmallScreen ? "100%" : null}
                          flexWrap={isSmallerScreen ? "wrap" : "noWrap"}
                        >
                          <CustomDatePicker
                            control={control}
                            name="startDate"
                            label="Start Date"
                            size="small"
                            fullWidth
                            optional
                            disableFuture
                            reduceAnimations
                            onChange={(newValue) => {
                              setValue("endDate", null);
                              return newValue;
                            }}
                          />

                          <CustomDatePicker
                            control={control}
                            name="endDate"
                            label="End Date"
                            size="small"
                            // views={["year", "month", "day"]}
                            minDate={watch("startDate")}
                            fullWidth
                            optional
                            disableFuture
                            reduceAnimations
                            disabled={watch("startDate") === null || watch("startDate") === ""}
                          />
                        </Stack>

                        {isSmallScreen ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleSearchClick}
                            sx={{
                              backgroundColor: "primary",
                              width: isSmallScreen && "100%",
                              // maxWidth: "100%",
                            }}
                          >
                            <Search /> {"  "}Search
                          </Button>
                        ) : (
                          <IconButton
                            onClick={handleSearchClick}
                            sx={{ bgcolor: "primary.main", ":hover": { bgcolor: "primary.dark" } }}
                          >
                            <Search />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                    <Box
                      sx={{
                        border: "1px solid lightgray",
                        borderRadius: "10px",
                        width: "100%",
                        // maxWidth: "850px",
                      }}
                    >
                      <TableContainer
                        sx={{
                          height: isSmallScreen ? "35vh" : "45vh",
                          borderRadius: "10px",
                        }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow
                              sx={{
                                "& > *": {
                                  whiteSpace: "nowrap",
                                  backgroundColor: "secondary.main",
                                  ".MuiButtonBase-root": { color: "white" },
                                  ".MuiTableSortLabel-icon": { color: "white!important" },
                                },
                              }}
                            >
                              <TableCell align="center" sx={{ backgroundColor: "secondary.main", p: 0 }}>
                                <FormControlLabel
                                  sx={{ margin: "auto", align: "center" }}
                                  control={
                                    <Checkbox
                                      value=""
                                      size="small"
                                      sx={{ color: "primary" }}
                                      checked={
                                        !!fixedAssetData?.data
                                          ?.map((mapItem) => mapItem.vladimir_tag_number)
                                          .every((item) => watch("tagNumber").includes(item))
                                      }
                                      onChange={(e) => {
                                        tagNumberAllHandler(e.target.checked);
                                      }}
                                    />
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <TableSortLabel
                                  active={orderBy === `vladimir_tag_number`}
                                  direction={orderBy === `vladimir_tag_number` ? order : `asc`}
                                  onClick={() => onSort(`vladimir_tag_number`)}
                                >
                                  Small Tools
                                </TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>PR/PO/RR/Reference No.</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Acquisition Cost</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Requestor</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Chart Of Accounts</TableSortLabel>
                              </TableCell>

                              <TableCell>
                                <TableSortLabel disabled>Accountability</TableSortLabel>
                              </TableCell>

                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  backgroundColor: "secondary.main",
                                }}
                              >
                                <TableSortLabel
                                  active={orderBy === `asset_status.asset_status_name`}
                                  direction={orderBy === `asset_status.asset_status_name` ? order : `asc`}
                                  onClick={() => onSort(`asset_status.asset_status_name`)}
                                >
                                  Asset Status
                                </TableSortLabel>
                              </TableCell>

                              <TableCell
                                align="center"
                                sx={{
                                  backgroundColor: "secondary.main",
                                }}
                              >
                                <TableSortLabel
                                  active={orderBy === `acquisition_date`}
                                  direction={orderBy === `acquisition_date` ? order : `asc`}
                                  onClick={() => onSort(`acquisition_date`)}
                                >
                                  Date Created
                                </TableSortLabel>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {fixedAssetSuccess && fixedAssetData.data.length === 0 ? (
                              <NoRecordsFound heightData="xs" />
                            ) : (
                              <>
                                {fixedAssetSuccess &&
                                  [...fixedAssetData.data].sort(comparator(order, orderBy))?.map((data) => {
                                    return (
                                      <TableRow
                                        key={data.id}
                                        hover
                                        sx={{
                                          "&:last-child td, &:last-child th": {
                                            borderBottom: 0,
                                          },
                                          overflow: "auto",
                                        }}
                                        onClick={() => handleRowClick(data.vladimir_tag_number)}
                                      >
                                        <TableCell align="center">
                                          <FormControlLabel
                                            value={data.vladimir_tag_number}
                                            sx={{ margin: "auto" }}
                                            disabled={data.action === "view"}
                                            control={
                                              <Checkbox
                                                size="small"
                                                {...register("tagNumber")}
                                                checked={watch("tagNumber").includes(data.vladimir_tag_number)}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            }
                                          />
                                        </TableCell>

                                        <TableCell>
                                          <Typography
                                            noWrap
                                            variant="h6"
                                            fontSize="14px"
                                            color="secondary.light"
                                            fontWeight="bold"
                                          >
                                            {data?.is_parent === 1 && data.vladimir_tag_number}
                                          </Typography>

                                          {/* <Typography noWrap fontSize="13px" color="gray">
                                            {data.asset_description}
                                          </Typography> */}

                                          <Typography
                                            noWrap
                                            variant="h3"
                                            fontSize="14px"
                                            color="secondary.main"
                                            fontWeight="bold"
                                          >
                                            {data.asset_description}
                                          </Typography>

                                          <Typography
                                            fontSize="12px"
                                            color="text.light"
                                            textOverflow="ellipsis"
                                            width="300px"
                                            overflow="hidden"
                                            noWrap
                                          >
                                            <Tooltip title={data.asset_specification} placement="bottom" arrow>
                                              {data.asset_specification}
                                            </Tooltip>
                                          </Typography>

                                          <Typography noWrap fontSize="10px" color="primary" fontWeight="bold">
                                            {data.type_of_request.type_of_request_name.toUpperCase()}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            PR - {data.pr_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            PO - {data.po_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            RR - {data.rr_number}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                            Reference No. - {data.ymir_ref_number}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          {" "}
                                          <Typography noWrap fontSize="13px" color="secondary.main">
                                            ₱{data?.acquisition_cost || " "}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography fontSize={12} fontWeight={600} color="secondary.main">
                                            {data.requestor.employee_id}
                                          </Typography>
                                          <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                            {data.requestor.first_name}
                                          </Typography>
                                          <Typography fontSize={11} fontWeight={500} color="secondary.main">
                                            {data.requestor.last_name}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data?.one_charging?.code}
                                            {" - "} {data?.one_charging?.name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.company.company_code}
                                            {" - "} {data.company.company_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.business_unit.business_unit_code}
                                            {" - "} {data.business_unit.business_unit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.department.department_code}
                                            {" - "}
                                            {data.department.department_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.unit.unit_code}
                                            {" - "} {data.unit.unit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.subunit.subunit_code}
                                            {" - "} {data.subunit.subunit_name}
                                          </Typography>
                                          <Typography noWrap fontSize="10px" color="gray">
                                            {data.location.location_code} {" - "}
                                            {data.location.location_name}
                                          </Typography>
                                          {/* <Typography noWrap fontSize="10px" color="gray">
                                {data.account_title.account_title_code}
                                {" - "}
                                {data.account_title.account_title_name}
                              </Typography> */}
                                        </TableCell>

                                        <TableCell>
                                          <Typography
                                            noWrap
                                            variant="h3"
                                            fontSize="12px"
                                            color="secondary"
                                            fontWeight="bold"
                                          >
                                            {data.accountable}
                                          </Typography>
                                          <Typography noWrap fontSize="11px" color="gray">
                                            {data.accountability}
                                          </Typography>
                                        </TableCell>

                                        <TableCell
                                          sx={{
                                            textAlign: "center",
                                            pr: "35px",
                                          }}
                                        >
                                          <FaStatusChange
                                            faStatus={data.asset_status.asset_status_name}
                                            data={data.asset_status.asset_status_name}
                                          />
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography noWrap fontSize="13px" paddingRight="15px">
                                            {moment(data.created_at).format("MMM-DD-YYYY")}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                              </>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box className="mcontainer__pagination-export">
                        <Button
                          className="mcontainer__export"
                          variant="outlined"
                          size="small"
                          color="text"
                          startIcon={<IosShareRounded color="primary" />}
                          // onClick={handleExport}
                          onClick={() => dispatch(openDialog4())}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "10px 20px",
                          }}
                        >
                          EXPORT
                        </Button>

                        <CustomTablePagination
                          total={fixedAssetData?.total}
                          success={fixedAssetSuccess}
                          current_page={fixedAssetData?.current_page}
                          per_page={fixedAssetData?.per_page}
                          onPageChange={pageHandler}
                          onRowsPerPageChange={perPageHandler}
                          removeShadow
                        />
                      </Box>
                    </Box>

                    <Stack
                      flexDirection="row"
                      width="100%"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      alignItems="center"
                    >
                      <Box sx={{ pl: "5px" }}>
                        <Typography fontFamily="Anton, Impact, Roboto" fontSize="18px" color="secondary.main">
                          Selected: {watch("tagNumber").length}
                        </Typography>
                      </Box>

                      {result === false && (
                        <Typography noWrap fontSize="11px" color="error">
                          Selected items does not have the same COA.
                        </Typography>
                      )}

                      <Stack gap={1.2} flexDirection="row" alignSelf="flex-end" mt={1} mb={1}>
                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <PriceChange
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    printable === true ||
                                    result === false ||
                                    isMainAsset === true
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 ||
                              printable === true ||
                              result === false ||
                              isMainAsset === true
                            }
                            onClick={() => dispatch(openDialog3())}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Tag as Add Cost"}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <HomeRepairService
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    watch("tagNumber").length === 1 ||
                                    result === false
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 || watch("tagNumber").length === 1 || result === false
                            }
                            onClick={() => dispatch(openDialog2())}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Group "}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <HomeRepairService
                                  color={
                                    watch("tagNumber").length === 0 ||
                                    watch("tagNumber").length > 1 ||
                                    printable === false
                                      ? "gray"
                                      : "primary"
                                  }
                                />
                              )
                            }
                            disabled={
                              watch("tagNumber").length === 0 || watch("tagNumber").length > 1 || printable === false
                            }
                            onClick={onUngroupSmallToolsHandler}
                            color={printMemo ? "tertiary" : "warning"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Ungroup "}
                          </LoadingButton>
                        )}

                        {!printMemo && (
                          <LoadingButton
                            size="small"
                            variant="contained"
                            loading={isLoading}
                            startIcon={
                              isLoading ? null : (
                                <PrintDisabled
                                  color={watch("tagNumber").length === 0 || printable === true ? "gray" : "primary"}
                                />
                              )
                            }
                            disabled={watch("tagNumber").length === 0 || printable === true}
                            onClick={onTagNonPrintableHandler}
                            color={printMemo ? "tertiary" : "secondary"}
                            sx={{ color: "white" }}
                          >
                            {isSmallScreen ? null : "Tag as Non-Printable"}
                          </LoadingButton>
                        )}

                        <LoadingButton
                          size="small"
                          variant="contained"
                          loading={isLoading || isIpFetching || isIpLoading}
                          startIcon={
                            isLoading ? null : <Print color={watch("tagNumber").length === 0 ? "gray" : "primary"} />
                          }
                          disabled={watch("tagNumber").length === 0}
                          type="submit"
                          color={printMemo ? "tertiary" : "secondary"}
                          sx={{ color: "white" }}
                        >
                          {printMemo ? "Print Assignment Memo" : "Print"}
                        </LoadingButton>

                        <Button variant="outlined" size="small" color="secondary" onClick={handleClose}>
                          Close
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>
            </TabContext>
          </Box>
        )}

        <Dialog
          open={printAssignmentMemo}
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
          <Box>
            <AssignmentMemo
              data={faData}
              setPrintAssignmentMemo={setPrintAssignmentMemo}
              memoData={memoData}
              selectedMemo={selectedMemo}
              fixedAssetRefetch={fixedAssetRefetch}
            />
          </Box>
        </Dialog>

        <Dialog
          open={dialog}
          onClose={() => dispatch(closeDialog2())}
          TransitionComponent={Grow}
          PaperProps={{
            sx: {
              borderRadius: "10px",
              margin: "0",
              maxWidth: "100%",
              padding: "10px",
              // overflow: "hidden",
              bgcolor: "background.light",
            },
          }}
        >
          <AddSmallToolsGroup data={smallToolsData} resetHandler={reset} refetch={refetch} tabValue={tabValue} />
        </Dialog>

        <Dialog
          open={dialog2}
          onClose={() => dispatch(closeDialog3())}
          TransitionComponent={Grow}
          PaperProps={{
            sx: {
              borderRadius: "10px",
              margin: "0",
              maxWidth: "100%",
              // padding: "10px",
              // overflow: "hidden",
              bgcolor: "background.light",
            },
          }}
        >
          <AddTagAddCost data={smallToolsData} resetHandler={reset} tabValue={tabValue} />
        </Dialog>

        <Dialog
          open={dialog3}
          TransitionComponent={Grow}
          onClose={() => dispatch(closeDialog3())}
          PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
        >
          <ExportPrintFixedAsset tabValue={tabValue} />
        </Dialog>
      </Box>
    </>
  );
};

export default PrintFixedAsset;
