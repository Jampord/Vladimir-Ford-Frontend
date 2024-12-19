import React, { useEffect, useRef, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
// import AddMajorCategory from "../AddEdit/AddMajorCategory";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import NoRecordsFound from "../../../Layout/NoRecordsFound";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { closeConfirm, openConfirm, onLoading } from "../../../Redux/StateManagement/confirmSlice";

// MUI
import {
  Box,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { Attachment, Help, Report, Visibility } from "@mui/icons-material";
import { usePatchApprovalStatusApiMutation } from "../../../Redux/Query/Approving/Approval";
import { useNavigate } from "react-router-dom";

import { notificationApi } from "../../../Redux/Query/Notification";
import { useGetTransferApprovalApiQuery } from "../../../Redux/Query/Movement/Transfer";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { usePatchTransferApprovalStatusApiMutation } from "../../../Redux/Query/Approving/TransferApproval";
import { useDownloadTransferAttachment } from "../../../Hooks/useDownloadAttachment";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import TransferTimeline from "../../Asset Movement/TransferTimeline";

const ApprovedTransfer = (props) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Approved");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [transactionIdData, setTransactionIdData] = useState("");

  const dialog = useSelector((state) => state.booleanState.dialog);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Table Sorting --------------------------------

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  // const [remarks, setRemarks] = useState("");

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

  // Table Properties --------------------------------

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const onSetPage = () => {
    setPage(1);
  };

  // CRUD -------------------------------------------

  const {
    data: approvedTransferData,
    isLoading: approvalLoading,
    isSuccess: approvalSuccess,
    isError: approvalError,
    error: errorData,
    refetch,
  } = useGetTransferApprovalApiQuery(
    {
      page: page,
      per_page: perPage,
      search: search,
      status: status,
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleViewTransfer = (data) => {
    const view = true;
    const approved = true;

    navigate(`/approving/transfer/${data?.id}`, {
      state: { ...data, view, approved },
    });
  };

  const DlAttachment = (transfer_number) => (
    <Tooltip title="Download Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: transfer_number })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleDownloadAttachment = (value) =>
    useDownloadTransferAttachment({
      attachments: "attachments",
      transfer_number: value?.transfer_number?.transfer_number,
    });

  const handleViewTimeline = (data) => {
    // console.log(data);
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  const transactionStatus = (data) => {
    let statusColor, hoverColor, textColor, variant;

    switch (data.status) {
      case "Waiting to be Received":
        statusColor = "success.light";
        hoverColor = "success.main";
        textColor = "white";
        variant = "filled";
        break;

      case "Received":
        statusColor = "success.dark";
        hoverColor = "success.dark";
        variant = "filled";
        break;

      case "Returned":
      case "Cancelled":
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
      <>
        <Tooltip title={data?.current_approver} placement="top" arrow>
          <Chip
            placement="top"
            onClick={() => handleViewTimeline(data)}
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
              ":hover": {
                ...(variant === "filled" && { backgroundColor: hoverColor }),
                ...(variant === "outlined" && { borderColor: hoverColor, color: textColor }),
              },
            }}
            label={data.status}
          />
        </Tooltip>
      </>
    );
  };

  return (
    <Stack className="category_height">
      {approvalLoading && <MasterlistSkeleton category={true} onAdd={true} />}
      {approvalError && <ErrorFetching refetch={refetch} category={approvedTransferData} error={errorData} />}
      {approvedTransferData && !approvalError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
            // onAdd={() => {}}
            hideArchive
          />

          <Box>
            <TableContainer className="mcontainer__th-body-category">
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
                    <TableCell className="tbl-cell-category">
                      {/* <TableSortLabel
                        active={orderBy === `id`}
                        direction={orderBy === `id` ? order : `asc`}
                        onClick={() => onSort(`id`)}
                      > */}
                      Transfer No.
                      {/* </TableSortLabel> */}
                    </TableCell>

                    <TableCell className="tbl-cell-category">Description</TableCell>

                    <TableCell className="tbl-cell-category">
                      {/* <TableSortLabel
                        active={orderBy === `requestor`}
                        direction={orderBy === `requestor` ? order : `asc`}
                        onClick={() => onSort(`requestor`)}
                      > */}
                      Requestor
                      {/* </TableSortLabel> */}
                    </TableCell>
                    {/* 
                    <TableCell className="tbl-cell-category">
                      <TableSortLabel
                        active={orderBy === `requestor`}
                        direction={orderBy === `requestor` ? order : `asc`}
                        onClick={() => onSort(`requestor`)}
                      >
                        Approver
                      </TableSortLabel>
                    </TableCell> */}

                    <TableCell className="tbl-cell-category" align="center">
                      {/* <TableSortLabel
                        active={orderBy === `quantity`}
                        direction={orderBy === `quantity` ? order : `asc`}
                        onClick={() => onSort(`quantity`)}
                      > */}
                      Quantity
                      {/* </TableSortLabel> */}
                    </TableCell>

                    <TableCell className="tbl-cell-category" align="center">
                      View
                    </TableCell>

                    <TableCell className="tbl-cell-category" align="center">
                      Status
                    </TableCell>

                    <TableCell className="tbl-cell-category" align="center">
                      Timeline & History
                    </TableCell>

                    <TableCell className="tbl-cell-category" align="center">
                      Attachments
                    </TableCell>

                    <TableCell className="tbl-cell-category text-center">
                      {/* <TableSortLabel
                        active={orderBy === `date_requested`}
                        direction={orderBy === `date_requested` ? order : `asc`}
                        onClick={() => onSort(`date_requested`)}
                      > */}
                      Date Requested
                      {/* </TableSortLabel> */}
                    </TableCell>

                    {/* <TableCell className="tbl-cell-category  text-center">Action</TableCell> */}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {approvedTransferData?.data.length === 0 ? (
                    <NoRecordsFound approvedTransferData={approvedTransferData} heightData="small" />
                  ) : (
                    <>
                      {approvalSuccess &&
                        [...approvedTransferData.data]
                          // .sort(comparator(order, orderBy))
                          ?.map((data) => (
                            <TableRow
                              key={data?.id}
                              hover={true}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell-category">{data?.id}</TableCell>

                              <TableCell className="tbl-cell-category ">{data?.description}</TableCell>

                              <TableCell className="tbl-cell-category">
                                <Typography fontSize={14} fontWeight={600} color={"secondary"} noWrap>
                                  {data.requester?.employee_id}
                                </Typography>
                                <Typography fontSize={12} color={"gray"}>
                                  {data.requester?.firstname}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell-category tr-cen-pad45">{data.quantity}</TableCell>

                              <TableCell className="tbl-cell-category text-center">
                                <IconButton onClick={() => handleViewTransfer(data)}>
                                  <Visibility color="secondary" />
                                </IconButton>
                              </TableCell>

                              <TableCell className="tbl-cell-category text-center capitalized">
                                <Chip
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    background: "#27ff811f",
                                    color: "active.dark",
                                    fontSize: "0.7rem",
                                    px: 1,
                                  }}
                                  label="APPROVED"
                                />
                              </TableCell>

                              <TableCell className="tbl-cell" align="center">
                                {transactionStatus(data)}
                              </TableCell>

                              <TableCell className="tbl-cell" align="center">
                                <DlAttachment transfer_number={data?.id} />
                              </TableCell>

                              <TableCell className="tbl-cell-category tr-cen-pad45">
                                {Moment(data.asset_request?.date_requested).format("MMM DD, YYYY")}
                              </TableCell>

                              {/* <TableCell className="tbl-cell-category text-center">
                              <ActionMenu status={status} data={data} showApprover hideArchive />
                            </TableCell> */}
                            </TableRow>
                          ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <CustomTablePagination
            total={approvedTransferData?.total}
            success={approvalSuccess}
            current_page={approvedTransferData?.current_page}
            per_page={approvedTransferData?.per_page}
            onPageChange={pageHandler}
            onRowsPerPageChange={perPageHandler}
          />
        </Box>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <TransferTimeline data={transactionIdData} />
      </Dialog>
    </Stack>
  );
};

export default ApprovedTransfer;
