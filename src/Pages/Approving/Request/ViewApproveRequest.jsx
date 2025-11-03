import React, { useState } from "react";
import "../../../Style/Request/request.scss";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";

import {
  Box,
  Button,
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
import { ArrowBackIosRounded, Check, Done, Edit, Help, Report, Undo } from "@mui/icons-material";
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
  useGetApprovalIdApiQuery,
  useLazyGetNextRequestQuery,
  usePatchApprovalStatusApiMutation,
  usePutFinalApprovalEditApiMutation,
} from "../../../Redux/Query/Approving/Approval";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

import { closeDialog1, openDialog1, closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useRemovePurchaseRequestApiMutation } from "../../../Redux/Query/Request/PurchaseRequest";
import ErrorFetching from "../../ErrorFetching";

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
  major_category_id: yup.object().nullable(),
  minor_category_id: yup.object().required().label("Minor Category").typeError("Minor Category is a required field"),
  description: yup.string().required().label("Asset Description"),
  specification: yup.string().required().label("Asset Specification"),
});

const ViewApproveRequest = (props) => {
  const { approving } = props;
  const { state: transactionData } = useLocation();
  console.log("transactionData", transactionData);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const [referenceNumber, setReferenceNumber] = useState("");

  const [isSmallTools, setIsSmallTools] = useState(false);
  console.log("isSmallTools", isSmallTools);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(min-width: 700px)");

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
    isFetching: isApproveFetching,
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

  const [getYmirData, { isSuccess: isYmirDataSuccess }] = useLazyGetYmirPrApiQuery();

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
      major_category_id: null,
      minor_category_id: null,
      description: "",
      specification: "",
    },
  });

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

            if (
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
                  ///************* */
                  console.log("Resubmit - patchYmirData", patchYmirData);
                } else {
                  const postYmirData = await postPr(getYmirDataApi);
                  //*********** */
                  console.log("Submit(Asset Sync) - postYmirData", postYmirData);
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
              } finally {
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
    setFormValue("major_category_id", props.major_category);
    setFormValue("minor_category_id", props.minor_category);
    setFormValue("description", props.asset_description);
    setFormValue("specification", props.asset_specification);
    setIsSmallTools(Boolean(props.type_of_request.type_of_request_name === "Small Tools"));
    dispatch(openDialog1());
  };

  const onSubmitHandler = async (formData) => {
    console.log("formData: ", formData);
    const newFormData = {
      major_category_id: formData.minor_category_id?.major_category?.id,
      minor_category_id: formData.minor_category_id?.id,
      description: formData.description,
      specification: formData.specification,
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
            dispatch(onLoading());
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
    setFormValue("specification", "");
    setIsSmallTools(false);
  };

  // Global cache to track opened windows and their blob URLs
  const blobUrlCache = new Map();

  const handleViewFile = async (id) => {
    try {
      const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/file/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.GL_KEY },
      });
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);

      // Open new window and store reference
      const newWindow = window.open(fileURL, "_blank");

      if (newWindow) {
        // Add to cache and setup cleanup listener
        blobUrlCache.set(newWindow, fileURL);
        newWindow.addEventListener("unload", () => {
          URL.revokeObjectURL(fileURL);
          blobUrlCache.delete(newWindow);
        });
      } else {
        // Revoke immediately if window failed to open
        URL.revokeObjectURL(fileURL);
      }
    } catch (err) {
      console.error("Error handling file view:", err);
    }
  };

  // Cleanup for main window close (optional safety net)
  window.addEventListener("beforeunload", () => {
    blobUrlCache.forEach((url, win) => {
      URL.revokeObjectURL(url);
      blobUrlCache.delete(win);
    });
  });

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
                      {/* <TableCell className="tbl-cell">Ship To</TableCell> */}
                      <TableCell className="tbl-cell">Acquisition Details</TableCell>
                      <TableCell className="tbl-cell">Accounting Entries</TableCell>
                      <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                      <TableCell className="tbl-cell">Accountability</TableCell>
                      <TableCell className="tbl-cell">Asset Information</TableCell>
                      <TableCell className="tbl-cell text-center">Quantity</TableCell>
                      <TableCell className="tbl-cell text-center">UOM</TableCell>
                      <TableCell className="tbl-cell">Cellphone #</TableCell>
                      <TableCell className="tbl-cell">Capex Num / Unit Charging</TableCell>
                      <TableCell className="tbl-cell">Attachments</TableCell>
                      {((!isApproveLoading && approveRequestData?.data[0]?.fa_edit === 1) ||
                        (nextData && nextData[0]?.fa_edit === 1)) &&
                        !transactionData?.approved && <TableCell className="tbl-cell">Action</TableCell>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(isNextRequestLoading || isNextRequestFetching || isApproveLoading || isApproveFetching) && (
                      <LoadingData />
                    )}
                    {approveRequestData?.data?.length === 0 ? (
                      <NoRecordsFound />
                    ) : (
                      <>
                        {!isNextRequestLoading &&
                          !isNextRequestFetching &&
                          !isApproveLoading &&
                          !isApproveFetching &&
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

                              {/* <TableCell className="tbl-cell text-weight">
                                <Typography fontSize={12} fontWeight={600}>
                                  {data.ship_to?.location}
                                </Typography>
                                <Typography fontSize={11}>{data.ship_to?.address}</Typography>
                              </TableCell> */}

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
                                  {`(${data.one_charging?.code || ""}) - ${data.one_charging?.name || ""}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.one_charging?.company_code || data?.company?.company_code}) - ${
                                    data.one_charging?.company_name || data?.company?.company_name
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${
                                    data.one_charging?.business_unit_code || data?.business_unit?.business_unit_code
                                  }) - ${
                                    data.one_charging?.business_unit_name || data?.business_unit?.business_unit_name
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.one_charging?.department_code || data?.department?.department_code}) - ${
                                    data.one_charging?.department_name || data?.department?.department_name
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.one_charging?.unit_code || data?.unit?.unit_code}) - ${
                                    data.one_charging?.unit_name || data?.unit?.unit_name
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.one_charging?.subunit_code || data?.subunit?.subunit_code}) - ${
                                    data.one_charging?.subunit_name || data?.subunit?.subunit_name
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.one_charging?.location_code || data?.location?.location_code}) - ${
                                    data.one_charging?.location_name || data?.location?.location_name
                                  }`}
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

                              <TableCell className="tbl-cell">
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
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => handleViewFile(data?.attachments?.letter_of_request?.id)}
                                    >
                                      <Tooltip title={"View or Download Letter of Request"} arrow>
                                        {data?.attachments?.letter_of_request?.file_name}
                                      </Tooltip>
                                    </Typography>
                                  </Stack>
                                )}

                                {data?.attachments?.quotation && (
                                  <Stack flexDirection="row" gap={1}>
                                    <Typography fontSize={12} fontWeight={600}>
                                      Quotation:
                                    </Typography>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => handleViewFile(data?.attachments?.quotation?.id)}
                                    >
                                      <Tooltip title={"View or Download Quotation"} arrow>
                                        {data?.attachments?.quotation?.file_name}
                                      </Tooltip>
                                    </Typography>
                                  </Stack>
                                )}

                                {data?.attachments?.specification_form && (
                                  <Stack flexDirection="row" gap={1}>
                                    <Typography fontSize={12} fontWeight={600}>
                                      Specification:
                                    </Typography>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => handleViewFile(data?.attachments?.specification_form?.id)}
                                    >
                                      <Tooltip title={"View or Download Specification Form"} arrow>
                                        {data?.attachments?.specification_form?.file_name}
                                      </Tooltip>
                                    </Typography>
                                  </Stack>
                                )}

                                {data?.attachments?.tool_of_trade && (
                                  <Stack flexDirection="row" gap={1}>
                                    <Typography fontSize={12} fontWeight={600}>
                                      Tool of Trade:
                                    </Typography>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => handleViewFile(data?.attachments?.tool_of_trade?.id)}
                                    >
                                      <Tooltip title={"View or Download Tool of Trade"} arrow>
                                        {data?.attachments?.tool_of_trade?.file_name}
                                      </Tooltip>
                                    </Typography>
                                  </Stack>
                                )}

                                {data?.attachments?.other_attachments && (
                                  <Stack flexDirection="row" gap={1}>
                                    <Typography fontSize={12} fontWeight={600}>
                                      Other Attachment:
                                    </Typography>
                                    <Typography
                                      sx={attachmentSx}
                                      onClick={() => handleViewFile(data?.attachments?.other_attachments?.id)}
                                    >
                                      <Tooltip title={"View or Download Other Attachment"} arrow>
                                        {data?.attachments?.other_attachments?.file_name}
                                      </Tooltip>
                                    </Typography>
                                  </Stack>
                                )}
                              </TableCell>
                              {data?.fa_edit === 1 && !transactionData?.approved && (
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
                autoComplete
                name="major_category_id"
                disabled
                control={control}
                options={[]}
                size="small"
                getOptionLabel={(option) => option.major_category_name}
                isOptionEqualToValue={(option, value) => option.major_category_name === value?.major_category_name}
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
                onChange={(_, value) => {
                  console.log("value", value);
                  if (value) {
                    setFormValue("major_category_id", value.major_category);
                  } else {
                    setFormValue("major_category_id", null);
                  }
                  return value;
                }}
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

              <CustomTextField
                control={control}
                name="specification"
                label="Asset Specification"
                type="text"
                allowSpecialCharacters
                error={!!errors?.specification}
                helperText={errors?.specification?.message}
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
        </Box>
      )}
    </>
  );
};

export default ViewApproveRequest;
