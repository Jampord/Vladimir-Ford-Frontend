import React, { useEffect, useRef, useState } from "react";
import "../../../Style/Request/request.scss";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  Divider,
  Grow,
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
import {
  ArrowBackIosRounded,
  Cancel,
  Check,
  Description,
  Done,
  Download,
  Edit,
  Help,
  InsertDriveFile,
  RemoveShoppingCart,
  Report,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { requisitionApi, useGetByTransactionApiQuery } from "../../../Redux/Query/Request/Requisition";

import { useLocation, useNavigate } from "react-router-dom";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { useGetRequestContainerAllApiQuery } from "../../../Redux/Query/Request/RequestContainer";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import {
  approvalApi,
  useGetApprovalIdApiQuery,
  useGetNextRequestQuery,
  useLazyDlAttachmentQuery,
  useLazyGetNextRequestQuery,
  usePatchApprovalStatusApiMutation,
  usePutFinalApprovalEditApiMutation,
} from "../../../Redux/Query/Approving/Approval";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import {
  closeDialog,
  openDialog,
  closeDialog1,
  openDialog1,
  closeDrawer,
} from "../../../Redux/StateManagement/booleanStateSlice";
import { useRemovePurchaseRequestApiMutation } from "../../../Redux/Query/Request/PurchaseRequest";
import ErrorFetching from "../../ErrorFetching";
import { useDownloadAttachment } from "../../../Hooks/useDownloadAttachment";
import { usePatchPrYmirApiMutation, usePostPrYmirApiMutation } from "../../../Redux/Query/Masterlist/YmirCoa/YmirApi";
import { useGetYmirPrApiQuery, useLazyGetYmirPrApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/YmirPr";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import {
  useLazyGetMinorCategoryAllApiQuery,
  useLazyGetMinorCategorySmallToolsApiQuery,
} from "../../../Redux/Query/Masterlist/Category/MinorCategory";
import CustomTextField from "../../../Components/Reusable/CustomTextField";

const schema = yup.object().shape({
  minor_category_id: yup.object().required().label("Minor Category").typeError("Minor Category is a required field"),
  description: yup.string().required().label("Asset Description"),
});

const ViewApproveRequest = (props) => {
  const { approving } = props;
  const { state: transactionData } = useLocation();
  // console.log("transactionData", transactionData);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [attachment, setAttachment] = useState("");
  const [base64, setBase64] = useState("");
  const [image, setImage] = useState(false);
  const [value, setValue] = useState();
  const [name, setName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [scale, setScale] = useState(1);
  const [isSmallTools, setIsSmallTools] = useState(false);
  console.log("isSmallTools", isSmallTools);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(min-width: 700px)");

  const dialog = useSelector((state) => state.booleanState.dialog);
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

  const [patchApprovalStatus, { isLoading }] = usePatchApprovalStatusApiMutation();
  const [postPr, { data: postedYmirData, isLoading: isPostYmirLoading }] = usePostPrYmirApiMutation();
  const [patchPr, { data: patchYmirData, isLoading: isPatchYmirLoading }] = usePatchPrYmirApiMutation();
  const [
    getNextRequest,
    { data: nextData, isLoading: isNextRequestLoading, isFetching: isNextRequestFetching, error: nextRequestError },
  ] = useLazyGetNextRequestQuery();
  console.log("nextData", nextData);
  const [removePrNumber] = useRemovePurchaseRequestApiMutation();

  // CONTAINER
  const {
    data: approveRequestData = [],
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    isError: isError,
    error: errorData,
    refetch: isApproveRefetch,
  } = useGetApprovalIdApiQuery(
    { page: page, per_page: perPage, transaction_number: transactionData?.transaction_number },
    { refetchOnMountOrArgChange: true }
  );

  console.log("approve request", approveRequestData?.data);

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

  // console.log("approveRequest", approveRequestData);

  // const {
  //   data: ymirData,
  //   isLoading: isYmirDataLoading,
  //   isSuccess: isYmirDataSuccess,
  //   refetch: isYmirDataRefetch,
  // } = useGetYmirPrApiQuery(
  //   // { page: page, per_page: perPage, transaction_number: transactionData?.transaction_number },
  //   { transaction_number: transactionData?.transaction_number },
  //   { refetchOnMountOrArgChange: true }
  // );

  const [getYmirData, { isSuccess: isYmirDataSuccess }] = useLazyGetYmirPrApiQuery();

  const [downloadAttachment] = useLazyDlAttachmentQuery({ attachment: attachment, id: approveRequestData?.id });

  const [putFinalApproval, { data: postData }] = usePutFinalApprovalEditApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid },
    setError,
    reset,
    watch,
    setValue: setFormValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      minor_category_id: null,
      description: "",
    },
  });

  // Table Sorting --------------------------------
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  const descendingComparator = (a, b, orderBy) => {
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
  // console.log(approveRequestData?.data?.map((data) => data?.fa_approval).includes(1));
  // console.log(requestData.is_pr_returned);

  const onApprovalApproveHandler = (transaction_number) => {
    const nextData = dispatch(
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
              navigate(`/approving/request`);
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
                  message: err.data.errors?.detail,
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
          };
          try {
            dispatch(onLoading());

            const result = await patchApprovalStatus({
              action: "Approve",
              transaction_number: transaction_number,
            }).unwrap();

            // console.log("Responsesssssss", approveRequestData?.data);
            // const refetchResult = await isApproveRefetch({ force: true });
            // console.log("refetchResult", refetchResult);
            // const updatedData = refetchResult?.data;
            // console.log("updatedData", updatedData?.data);
            // console.log(
            //   "Response",
            //   updatedData?.data.map((item) => item.fa_approval)
            // );

            if (
              // updatedData?.data.map((data) => data?.fa_approval).includes(1) ||
              // updatedData?.data.map((data) => data?.final_approval).includes(1)
              // || approveRequestData?.data.map((data) => data?.fa_approval).includes(1) ||
              approveRequestData?.data.map((data) => data?.final_approval).includes(1) ||
              transactionData?.final === true
            ) {
              const requestData = approveRequestData?.data[0];
              // console.log("requestData", requestData);
              try {
                const getYmirDataApi = await getYmirData({ transaction_number }).unwrap();
                // console.log("getYmirDataApi", getYmirDataApi);
                if (requestData.is_pr_returned === 1) {
                  const patchYmirData = await patchPr({
                    ...getYmirDataApi,
                    pr_number: requestData.pr_number,
                    pr_description: requestData.acquisition_details,
                  });
                  // console.log("patchYmirData", patchYmirData);
                } else {
                  const postYmirData = await postPr(getYmirDataApi);
                  // console.log("postYmirData", postYmirData);
                }

                const next = await getNextRequest({
                  final_approval: transactionData?.final || requestData?.final_approval === 1 ? 1 : 0,
                }).unwrap();

                return navigate(`/approving/request/${next?.[0].transaction_number}`, {
                  state: next?.[0],
                  replace: true,
                });
              } catch (err) {
                noNextData(err);
                console.log("error in pr return", err);
                dispatch(
                  openToast({
                    message: result.message,
                    duration: 5000,
                  })
                );
              }
            } else {
              const requestData = approveRequestData?.data[0];
              const next = await getNextRequest({
                final_approval: transactionData?.final || requestData?.final_approval === 1 ? 1 : 0,
              }).unwrap();
              navigate(`/approving/request/${next?.[0].transaction_number}`, { state: next?.[0], replace: true });
              // console.log("ERROR:", requestData);
            }

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
          } catch (err) {
            noNextData(err);
            console.log("error in approving", err);
            if (err?.status === 404) {
              dispatch(
                openToast({
                  message: "Request approved successfully!",
                  duration: 5000,
                })
              );
            }
          }
        },
      })
    );
  };

  const onApprovalReturnHandler = (transaction_number) => {
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
          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Return",
              transaction_number: transaction_number,
              remarks: data,
            }).unwrap();

            const requestData = approveRequestData?.data[0];

            const next = await getNextRequest({
              final_approval: transactionData?.final || requestData?.final_approval === 1 ? 1 : 0,
            }).unwrap();
            navigate(`/approving/request/${next?.[0].transaction_number}`, { state: next?.[0], replace: true });
            // dispatch(requisitionApi.util.invalidateTags(["Requisition"]));

            console.log("nextRequestError", nextRequestError);

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
          } catch (err) {
            console.log("error", err);
            if (err?.status === 404) {
              navigate(`/approving/request`);
              dispatch(
                openToast({
                  message: "Request returned successfully!",
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
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
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
        },
      })
    );
  };

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

  const handleOpenDialog = (value) => {
    // console.log("valueeeeeee", value);

    const blob = base64ToBlob(value?.value?.base64, value?.value?.mime_type);
    const url = URL.createObjectURL(blob);

    dispatch(openDialog());
    setBase64(url);
    (value?.value?.file_name.includes("jpg") ||
      value?.value?.file_name.includes("png") ||
      value?.value?.file_name.includes("jpeg")) &&
      setImage(true);
    setValue(value.data);
    setName(value.name);
  };

  const handleCloseDialog = () => {
    dispatch(closeDialog()) || dispatch(closeDialog1());
    setBase64("");
    setImage(false);
    setValue(null);
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

  // const perPageHandler = (e) => {
  //   setPage(1);
  //   setPerPage(parseInt(e.target.value));
  // };

  // const pageHandler = (_, page) => {
  //   // console.log(page + 1);
  //   setPage(page + 1);
  // };

  const attachmentSx = {
    textDecoration: "underline",
    cursor: "pointer",
    color: "primary.main",
    fontSize: "12px",
  };

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

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const onUpdateHandler = (props) => {
    console.log("props", props);
    setReferenceNumber(props.reference_number);
    setFormValue("minor_category_id", props.minor_category);
    setFormValue("description", props.asset_description);
    setIsSmallTools(Boolean(props.type_of_request.type_of_request_name === "Small Tools"));
    dispatch(openDialog1());
  };

  const onSubmitHandler = async (formData) => {
    console.log("formData: ", formData);
    const newFormData = {
      major_category_id: formData.minor_category_id?.major_category?.id,
      minor_category_id: formData.minor_category_id?.id,
      description: formData.description,
      id: referenceNumber,
    };
    console.log("newFormData: ", newFormData);

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
              UPDATE
            </Typography>{" "}
            this data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            // const res = await postToken(formData).unwrap();
            await putFinalApproval(newFormData).unwrap();
            reset();
            dispatch(
              openToast({
                message: postData?.message || "Final approval update successful!",
                duration: 5000,
              })
            );
            dispatch(closeDialog1());
          } catch (error) {
            console.log(error);
            dispatch(
              openToast({
                message: error?.data?.message,
                duration: 5000,
                variant: "error",
              })
            );
          }
        },
      })
    );
  };

  const onCloseHandler = () => {
    dispatch(closeDialog1());
    dispatch(closeDrawer());
    setReferenceNumber("");
    setFormValue("minor_category_id", null);
    setFormValue("description", "");
    setIsSmallTools(false);
  };

  return (
    <>
      {isError && <ErrorFetching refetch={isApproveRefetch} error={errorData} />}
      {!isError && (
        <Box className="mcontainer" sx={{ height: "calc(100vh - 380px)" }}>
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<ArrowBackIosRounded color="secondary" />}
            onClick={() => {
              navigate("/approving/request");
              // setApprovingValue("2");
            }}
            disableRipple
            sx={{ width: "90px", marginLeft: "-15px", "&:hover": { backgroundColor: "transparent" } }}
          >
            Back
          </Button>

          <Box className="request mcontainer__wrapper" p={2} pb={0}>
            {/* TABLE */}
            <Box className="request__table">
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
                TRANSACTION {transactionData && transactionData?.transaction_number}
              </Typography>

              <TableContainer
                className="mcontainer__th-body  mcontainer__wrapper"
                sx={{ height: "calc(100vh - 320px)", pt: 0 }}
              >
                <Table className="mcontainer__table " stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          fontWeight: "bold!important",
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell className="tbl-cell">Ref. No.</TableCell>
                      <TableCell className="tbl-cell">Type of Request</TableCell>
                      <TableCell className="tbl-cell">Warehouse</TableCell>
                      <TableCell className="tbl-cell">Acquisition Details</TableCell>
                      <TableCell className="tbl-cell">Accounting Entries</TableCell>
                      <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                      <TableCell className="tbl-cell">Accountability</TableCell>
                      <TableCell className="tbl-cell">Asset Information</TableCell>
                      <TableCell className="tbl-cell text-center">Quantity</TableCell>
                      <TableCell className="tbl-cell text-center">UOM</TableCell>
                      <TableCell className="tbl-cell">Cellphone #</TableCell>
                      <TableCell className="tbl-cell">Remarks</TableCell>
                      <TableCell className="tbl-cell">Attachments</TableCell>
                      {transactionData?.final && <TableCell className="tbl-cell">Action</TableCell>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(isNextRequestLoading || isNextRequestFetching || isApproveLoading) && <LoadingData />}
                    {approveRequestData?.data?.length === 0 ? (
                      <NoRecordsFound />
                    ) : (
                      <>
                        {!isNextRequestLoading &&
                          !isNextRequestFetching &&
                          !isApproveLoading &&
                          approveRequestData?.data?.map((data, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell tr-cen-pad45 text-weight">
                                {data.reference_number}
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontWeight={600}>{data.type_of_request?.type_of_request_name}</Typography>
                                <Typography
                                  fontWeight={400}
                                  fontSize={12}
                                  color={data.attachment_type === "Budgeted" ? "success.main" : "primary.dark"}
                                >
                                  {data.attachment_type}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell text-weight">{data.warehouse.warehouse_name}</TableCell>

                              <TableCell className="tbl-cell">{data.acquisition_details}</TableCell>

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

                              <TableCell className="tbl-cell">
                                <Typography fontSize={10} color="gray">
                                  {`(${data.company?.company_code}) - ${data.company?.company_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.business_unit?.business_unit_code}) - ${data.business_unit?.business_unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.department?.department_code}) - ${data.department?.department_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.unit?.unit_code}) - ${data.unit?.unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.subunit?.subunit_code}) - ${data.subunit?.subunit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.location?.location_code}) - ${data.location?.location_name}`}
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

                              <TableCell className="tbl-cell">
                                <Typography fontWeight={600} fontSize="14px" color="secondary.main">
                                  {data.asset_description}
                                </Typography>
                                <Typography fontSize="12px" color="text.light">
                                  {data.asset_specification}
                                </Typography>
                                <Typography fontSize="12px" fontWeight={600} color="primary">
                                  STATUS - {data.item_status}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell text-center">{data.quantity}</TableCell>

                              <TableCell className="tbl-cell text-center">{data.unit_of_measure.uom_name}</TableCell>

                              <TableCell className="tbl-cell">{data.cellphone_number}</TableCell>

                              <TableCell className="tbl-cell">{data.remarks}</TableCell>

                              <TableCell className="tbl-cell">
                                {/* {data?.attachments?.letter_of_request && (
                                  <Stack flexDirection="row" gap={1}>
                                    <Typography fontSize={12} fontWeight={600}>
                                      Letter of Request:
                                    </Typography>
                                    <Tooltip title="View Letter of Request" arrow>
                                      <Typography
                                        sx={attachmentSx}
                                        // onClick={() =>
                                        //   handleDownloadAttachment({ value: "letter_of_request", id: data?.id })
                                        // }
                                        onClick={() => {
                                          data.attachments.letter_of_request.base64.includes("data:")
                                            ? handleOpenDialog({
                                                value: data.attachments.letter_of_request.base64,
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
                                )} */}

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
                                          data.attachments.letter_of_request.file_name.includes("svg") ||
                                          data.attachments.letter_of_request.file_name.includes("png")
                                            ? handleOpenDialog({
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
                                          data.attachments.quotation.file_name.includes("svg") ||
                                          data.attachments.quotation.file_name.includes("png")
                                            ? handleOpenDialog({
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
                                          data.attachments.specification_form.file_name.includes("svg") ||
                                          data.attachments.specification_form.file_name.includes("png")
                                            ? handleOpenDialog({
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
                                          data.attachments.tool_of_trade.file_name.includes("svg") ||
                                          data.attachments.tool_of_trade.file_name.includes("png")
                                            ? handleOpenDialog({
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
                                          data.attachments.other_attachments.file_name.includes("svg") ||
                                          data.attachments.other_attachments.file_name.includes("png")
                                            ? handleOpenDialog({
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
                              {transactionData?.final && (
                                <TableCell className="tbl-cell">
                                  <ActionMenu onUpdateHandler={onUpdateHandler} data={data} />
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Buttons */}
              <Stack flexDirection="row" justifyContent="space-between" alignItems="center" pb={2}>
                <Typography
                  fontFamily="Anton, Impact, Roboto"
                  fontSize="18px"
                  color="secondary.main"
                  sx={{ pt: "10px" }}
                >
                  Transaction: {approveRequestData?.data?.length}{" "}
                  {approveRequestData?.data?.length >= 2 ? "requests" : "request"}
                </Typography>

                <CustomTablePagination
                  total={approveRequestData?.total}
                  success={isApproveSuccess}
                  current_page={approveRequestData?.current_page}
                  per_page={approveRequestData?.per_page}
                  onPageChange={pageHandler}
                  onRowsPerPageChange={perPageHandler}
                  removeShadow
                />
                {!transactionData?.approved && (
                  <Stack flexDirection="row" justifyContent="flex-end" gap={2} sx={{ pt: "10px" }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      onClick={() => onApprovalApproveHandler(transactionData?.transaction_number)}
                      startIcon={<Check color="primary" />}
                      disabled={isApproveLoading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onApprovalReturnHandler(transactionData?.transaction_number)}
                      startIcon={<Undo sx={{ color: "#5f3030" }} />}
                      sx={{
                        color: "white",
                        backgroundColor: "error.main",
                        ":hover": { backgroundColor: "error.dark" },
                      }}
                      disabled={isApproveLoading}
                    >
                      Return
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Box>

          <Dialog open={dialog1} TransitionComponent={Grow} onClose={onCloseHandler}>
            <Stack
              flexDirection="Column"
              gap="10px"
              padding="20px "
              component="form"
              onSubmit={handleSubmit(onSubmitHandler)}
            >
              <Stack flexDirection="row" alignItems="center">
                <Edit color="secondary" sx={{ fontSize: "25px" }} />
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
                  Edit Minor Category and Asset Description
                </Typography>
              </Stack>

              <Divider />

              <CustomAutoComplete
                name="minor_category_id"
                control={control}
                options={isSmallTools === true ? minorCategorySmallToolsData : minorCategoryData}
                onOpen={() =>
                  isSmallTools === true
                    ? isMinorCategorySmallToolsSuccess
                      ? null
                      : minorCategorySmallToolsTrigger()
                    : isMinorCategorySuccess
                    ? null
                    : minorCategoryTrigger()
                }
                loading={isSmallTools === true ? isMinorCategorySmallToolsLoading : isMinorCategoryLoading}
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

              <CustomTextField
                control={control}
                name="description"
                label="Asset Description"
                type="text"
                allowSpecialCharacters
                error={!!errors?.description}
                helperText={errors?.description?.message}
                fullWidth
                multiline
                maxRows={5}
              />

              <DialogActions>
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={<Done color="primary" />}
                  type="submit"
                >
                  Update
                </Button>
                <Button variant="outlined" onClick={onCloseHandler} size="small" color="secondary">
                  Cancel
                </Button>
              </DialogActions>
            </Stack>
          </Dialog>

          <Dialog
            open={dialog}
            TransitionComponent={Grow}
            // PaperProps={{ sx: { borderRadius: "10px" } }}
            onClose={handleCloseDialog}
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
                    border: "1px solid black",
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
                    {!isSmallScreen ? "-" : "Zoom -"}
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    onClick={handleZoomIn}
                    startIcon={<ZoomIn color="primary" />}
                  >
                    {!isSmallScreen ? "+" : "Zoom +"}
                  </Button>
                </Box>
              )}

              <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <DialogActions>
                  <Button
                    variant="outlined"
                    // size="small"
                    color="secondary"
                    onClick={handleCloseDialog}
                    sx={{ backgroundColor: "white" }}
                  >
                    Close
                  </Button>

                  <Button
                    variant="contained"
                    // size="small"
                    color="secondary"
                    startIcon={<Download color="primary" />}
                    onClick={() => handleDownloadAttachment({ value: name, id: value?.id })}
                  >
                    Download
                  </Button>
                </DialogActions>
              </Box>
            </Box>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default ViewApproveRequest;
