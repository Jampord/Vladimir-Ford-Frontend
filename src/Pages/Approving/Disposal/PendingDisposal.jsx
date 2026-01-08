import { useState } from "react";
import { useGetDisposalApprovalApiQuery } from "../../../Redux/Query/Movement/Disposal";
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
  Tooltip,
  Typography,
} from "@mui/material";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { Visibility } from "@mui/icons-material";
import moment from "moment";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import PulloutTimeline from "../../Asset Movement/PulloutTimeline";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";

const PendingDisposal = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("For Approval");
  const [transactionIdData, setTransactionIdData] = useState();

  const dialog = useSelector((state) => state.booleanState.dialog);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: pendingDisposalData,
    isLoading: approvalLoading,
    isFetching: approvalFetching,
    isSuccess: approvalSuccess,
    isError: approvalError,
    error: errorData,
    refetch,
  } = useGetDisposalApprovalApiQuery(
    {
      page: page,
      per_page: perPage,
      search: search,
      status: status,
    },
    { refetchOnMountOrArgChange: true }
  );

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
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

  const handleViewDisposal = (data) => {
    const approving = true;
    navigate(`/approving/disposal/${data?.id}`, {
      state: { ...data, approving },
    });
  };

  const handleViewTimeline = (data) => {
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  return (
    <Stack className="category_height">
      {approvalLoading && <MasterlistSkeleton category={true} />}
      {approvalError && <ErrorFetching refetch={refetch} category={pendingDisposalData} error={errorData} />}
      {pendingDisposalData && !approvalError && (
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
                    <TableCell className="tbl-cell-category">Request #</TableCell>
                    <TableCell className="tbl-cell-category">Request Description</TableCell>
                    <TableCell className="tbl-cell-category">Care of</TableCell>
                    <TableCell className="tbl-cell-category text-center">View</TableCell>
                    <TableCell className="tbl-cell-category tr-cen-pad45">Quantity</TableCell>
                    <TableCell className="tbl-cell-category tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell-category tr-cen-pad45">Timeline & History</TableCell>
                    <TableCell className="tbl-cell-category">Chart of Account</TableCell>
                    <TableCell className="tbl-cell-category">Date Requested</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pendingDisposalData?.data.length === 0 ? (
                    <NoRecordsFound heightData="small" />
                  ) : approvalFetching ? (
                    <LoadingData />
                  ) : (
                    <>
                      {approvalSuccess &&
                        pendingDisposalData?.data.map((data) => (
                          <TableRow
                            key={data?.id}
                            hover={true}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell-category text-weight">{data?.id}</TableCell>
                            <TableCell className="tbl-cell-category ">{data?.description}</TableCell>
                            <TableCell className="tbl-cell-category ">{data?.care_of}</TableCell>
                            <TableCell className="tbl-cell-category text-center">
                              <IconButton onClick={() => handleViewDisposal(data)}>
                                <Visibility color="secondary" />
                              </IconButton>
                            </TableCell>
                            <TableCell className="tbl-cell-category tr-cen-pad45">{data?.quantity}</TableCell>
                            <TableCell className="tbl-cell-category tr-cen-pad45 ">
                              <Chip
                                size="small"
                                variant="contained"
                                sx={{
                                  background: "#f5cc2a2f",
                                  color: "#c59e00",
                                  fontSize: "0.7rem",
                                  px: 1,
                                }}
                                label="PENDING"
                              />
                            </TableCell>
                            <TableCell className="tbl-cell-category tr-cen-pad45 ">{transactionStatus(data)}</TableCell>
                            <TableCell className="tbl-cell-category ">
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.code || "-"}) - ${data.one_charging?.name || "-"}`}
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
                                {`(${data.one_charging?.department_code || data.department?.department_code}) - ${
                                  data.one_charging?.department_name || data.department?.department_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.unit_code || data.unit?.unit_code}) - ${
                                  data.one_charging?.unit_name || data.unit?.unit_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.subunit_code || data.subunit?.subunit_code}) - ${
                                  data.one_charging?.subunit_name || data.subunit?.subunit_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data.one_charging?.location_code || data.location?.location_code}) - ${
                                  data.one_charging?.location_name || data.location?.location_name
                                }`}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell-category ">
                              {moment(data?.created_at).format("MMMM DD, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <CustomTablePagination
            total={pendingDisposalData?.total}
            success={approvalSuccess}
            current_page={pendingDisposalData?.current_page}
            per_page={pendingDisposalData?.per_page}
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
        <PulloutTimeline data={transactionIdData} />
      </Dialog>
    </Stack>
  );
};

export default PendingDisposal;
