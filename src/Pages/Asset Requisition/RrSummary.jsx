import React, { useEffect, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import ErrorFetching from "../ErrorFetching";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { openConfirm, closeConfirm, onLoading } from "../../Redux/StateManagement/confirmSlice";
import {
  useGetByTransactionApiQuery,
  useGetRequisitionApiQuery,
  usePatchRequisitionStatusApiMutation,
  useVoidRequisitionApiMutation,
} from "../../Redux/Query/Request/Requisition";

// MUI
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  Grow,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Close, Help, Report, SyncOutlined, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetAssetReceivingApiQuery,
  useGetAssetReceivedApiQuery,
  usePostReceivingSyncApiMutation,
  useGetRrSummaryApiQuery,
} from "../../Redux/Query/Request/AssetReceiving";
import { closeDialog, openDialog } from "../../Redux/StateManagement/booleanStateSlice";
import { useCancelRrVladimirApiMutation, useCancelRrYmirApiMutation } from "../../Redux/Query/Request/ReceivedReceipt";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";

const RrSummary = (props) => {
  const { received } = props;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const [vladimirTag, setVladimirTag] = useState([]);
  const [reference, setReference] = useState([]);
  const [requestDetails, setRequestDetails] = useState();
  const [isVladimirTag, setIsVladimirTag] = useState(true);

  const userData = JSON.parse(localStorage.getItem("user"));

  const dialog = useSelector((state) => state.booleanState.dialog);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  //* Table Sorting -------------------------------------------------------
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

  //* Table Properties ---------------------------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: receivedReceiptData,
    isLoading: receivedReceiptLoading,
    isSuccess: receivedReceiptSuccess,
    isError: receivedReceiptError,
    isFetching: receivedReceiptFetching,
    error: errorData,
    refetch,
  } = useGetRrSummaryApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  // console.log("recieved ", receivedReceiptData);

  const [cancelVladimirRr, {}] = useCancelRrVladimirApiMutation();
  const [cancelYmirRr, {}] = useCancelRrYmirApiMutation();

  const handleViewData = (data) => {
    dispatch(openDialog());
    setVladimirTag(data);
    setReference(data);
  };

  const handleCancelRR = (data) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
        message: (
          <Box>
            <Typography>
              Are you sure you want to{" "}
              <Typography
                variant="span"
                sx={{
                  color: "secondary.main",
                  fontWeight: "bold",
                }}
              >
                CANCEL
              </Typography>{" "}
              this RR Data?
            </Typography>
          </Box>
        ),
        remarks: true,

        onConfirm: async (remarks) => {
          try {
            dispatch(onLoading());
            let vladimirCancel = await cancelVladimirRr({
              rr_number: data,
              reason: remarks,
            }).unwrap();
            // console.log(vladimirCancel);

            let ymirCancel = await cancelYmirRr({
              rr_number: data,
              v_name: `${userData?.firstname} ${userData?.lastname}`,
              rdf_id: userData?.employee_id,
              reason: remarks,
            }).unwrap();
            // console.log(ymirCancel);

            dispatch(
              openToast({
                message: (vladimirCancel || ymirCancel).message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
            refetch();
          } catch (err) {
            console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.errors.detail || err.data.message,
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

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        RR Summary
      </Typography>
      <Stack height="100%">
        {receivedReceiptLoading && <MasterlistSkeleton onAdd={true} />}
        {receivedReceiptError && <ErrorFetching refetch={refetch} error={errorData} />}
        {receivedReceiptData && !receivedReceiptError && (
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

            <Box>
              <TableContainer className="mcontainer__th-body">
                <Table className="mcontainer__table" stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& > *": {
                          fontWeight: "bold!important",
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell className="tbl-cell">RR ID No.</TableCell>

                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `transaction_number`}
                          direction={orderBy === `transaction_number` ? order : `asc`}
                          onClick={() => onSort(`transaction_number`)}
                        >
                          RR No.
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell">Transaction Number</TableCell>

                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `po_number`}
                          direction={orderBy === `po_number` ? order : `asc`}
                          onClick={() => onSort(`po_number`)}
                        >
                          PR/PO Number
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell" align="center">
                        Quantity
                      </TableCell>

                      <TableCell className="tbl-cell" align="center">
                        View Tagged
                      </TableCell>

                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `created_at`}
                          direction={orderBy === `created_at` ? order : `asc`}
                          onClick={() => onSort(`created_at`)}
                        >
                          Date Approved
                        </TableSortLabel>
                      </TableCell>

                      {status === "active" && <TableCell className="tbl-cell">Action</TableCell>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receivedReceiptFetching ? (
                      <LoadingData />
                    ) : receivedReceiptData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {receivedReceiptSuccess &&
                          [...receivedReceiptData?.data]?.sort(comparator(order, orderBy))?.map((data, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell">
                                <Chip
                                  size="small"
                                  color={data?.status === "active" ? "primary" : "error"}
                                  label={
                                    <Typography fontWeight={600} fontSize="12px">
                                      {data.rr_id}
                                    </Typography>
                                  }
                                />
                              </TableCell>

                              <TableCell className="tbl-cell">
                                <Chip
                                  size="small"
                                  color={data?.status === "active" ? "primary" : "error"}
                                  label={
                                    <Typography fontWeight={600} fontSize="12px">
                                      {data.rr_number}
                                    </Typography>
                                  }
                                />
                              </TableCell>

                              <TableCell className="tbl-cell">{data?.transaction_number}</TableCell>

                              <TableCell className="tbl-cell ">
                                <Typography fontSize="12px" color="secondary.main">
                                  {`PR - ${data.ymir_pr_number}`}
                                </Typography>
                                <Typography fontSize="12px" color="secondary.main">
                                  {`PO - ${data.po_number.replace(/,/g, ", ")}`}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell" align="center">
                                {data?.item_count}
                              </TableCell>

                              <TableCell className="tbl-cell" align="center">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      handleViewData();
                                      setVladimirTag(data.vladimir_tag_number);
                                      setReference(data.reference_number);
                                      setRequestDetails(data.request_details);
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell tr-cen-pad45">
                                {Moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>

                              {status === "active" && (
                                <TableCell className="tbl-cell">
                                  {data?.can_cancel === 1 && (
                                    <ActionMenu
                                      hideEdit
                                      data={data?.rr_id}
                                      showCancelRr={true}
                                      handleCancelRR={handleCancelRR}
                                    />
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <CustomTablePagination
              total={receivedReceiptData?.total}
              success={receivedReceiptSuccess}
              current_page={receivedReceiptData?.current_page}
              per_page={receivedReceiptData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        )}
      </Stack>

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", minWidth: "60%", p: 3 } }}
      >
        <Stack gap={2}>
          <Typography fontSize={24} fontFamily="Anton" color="secondary" align="center">
            Tagged Items
          </Typography>

          <Stack gap={3}>
            <TableContainer className="mcontainer">
              <Table className="mcontainer__table" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& > *": {
                        fontWeight: "bold!important",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell className="tbl-cell">ID</TableCell>

                    <TableCell className="tbl-cell">Vladimir Tag Number</TableCell>

                    <TableCell className="tbl-cell">Asset Description</TableCell>

                    <TableCell className="tbl-cell">Asset Specification</TableCell>

                    <TableCell className="tbl-cell" align="center">
                      Quantity
                    </TableCell>

                    <TableCell className="tbl-cell" align="center">
                      Acquisition Cost
                    </TableCell>

                    <TableCell className="tbl-cell text-center">Type of Request</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {requestDetails === 0 ? (
                    <NoRecordsFound heightData="small" />
                  ) : (
                    <>
                      {requestDetails?.map((data, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell className="tbl-cell">
                            <Chip
                              size="small"
                              color={"primary"}
                              label={
                                <Typography fontWeight={600} fontSize="12px">
                                  {data.id}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell className="tbl-cell">{data?.vladimir_tag_number}</TableCell>

                          <TableCell className="tbl-cell ">
                            <Typography fontSize="12px" color="secondary.main">
                              {data.asset_description}
                            </Typography>
                          </TableCell>

                          <TableCell className="tbl-cell ">
                            <Typography fontSize="12px" color="secondary.main">
                              {data.asset_specification}
                            </Typography>
                          </TableCell>

                          <TableCell className="tbl-cell tr-cen-pad45" align="center">
                            {data?.quantity}
                          </TableCell>

                          <TableCell className="tbl-cell" align="center">
                            ₱{data?.acquisition_cost}
                          </TableCell>

                          <TableCell className="tbl-cell tr-cen-pad45" align="center">
                            {data?.type_of_request}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => {
              dispatch(closeDialog());
              setRequestDetails(null);
            }}
          >
            Close
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
};

export default RrSummary;
