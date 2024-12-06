import {
  Box,
  Button,
  Chip,
  Dialog,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useGetTransferHistoryReportApiQuery } from "../../../Redux/Query/Movement/AssetMovementReports";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import moment from "moment";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { IosShareRounded } from "@mui/icons-material";
import { closeExport, openExport } from "../../../Redux/StateManagement/booleanStateSlice";
import ExportTransfer from "../../Asset Movement/Transfer/ExportTransfer";
import { useDispatch, useSelector } from "react-redux";

const TransferHistoryReport = () => {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [transfer, setTransfer] = useState([]);

  const showExport = useSelector((state) => state.booleanState.exportFile);
  const dispatch = useDispatch();

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

  //* Pagination -------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: transferHistoryData,
    isLoading: istransferHistoryLoading,
    isSuccess: istransferHistorySuccess,
    isError: istransferHistoryError,
    isFetching: istransferHistoryFetching,
    error: errorData,
    refetch,
  } = useGetTransferHistoryReportApiQuery(
    {
      page: page,
      per_page: perPage,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const openExportDialog = (data) => {
    dispatch(openExport());
    setTransfer(data);
  };

  const transactionStatus = (data) => {
    let statusColor, hoverColor, textColor, variant;

    switch (data.status) {
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

      case "Sent to Ymir":
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
          ":hover": {
            ...(variant === "filled" && { backgroundColor: hoverColor }),
            ...(variant === "outlined" && { borderColor: hoverColor, color: textColor }),
          },
        }}
        label={data.status}
      />
    );
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Transfer History Report
      </Typography>
      <Stack height="100%">
        {istransferHistoryLoading && <MasterlistSkeleton />}
        {istransferHistoryError && <ErrorFetching refetch={refetch} error={errorData} />}
        {transferHistoryData && !istransferHistoryError && (
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive></MasterlistToolbar>

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
                      <TableCell className="tbl-cell">Transfer No.</TableCell>
                      <TableCell className="tbl-cell">Vladimir Tag Number</TableCell>
                      <TableCell className="tbl-cell">Asset Description</TableCell>
                      <TableCell className="tbl-cell">Status</TableCell>
                      <TableCell className="tbl-cell">Asset From</TableCell>
                      <TableCell className="tbl-cell">Asset To</TableCell>
                      <TableCell className="tbl-cell">Date Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {transferHistoryData?.data?.length === 0 ? (
                      <NoRecordsFound />
                    ) : (
                      <>
                        {istransferHistorySuccess &&
                          transferHistoryData?.data.map((data, index) => {
                            const userFromSplit = data?.from.split(" - ");
                            const userToSplit = data?.to.split(" - ");
                            const description =
                              data?.asset_description.charAt(0).toUpperCase() + data?.asset_description.slice(1);

                            return (
                              <TableRow
                                key={data.id}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    borderBottom: 0,
                                  },
                                }}
                              >
                                <TableCell className="tbl-cell">
                                  <Typography fontWeight={600} fontSize="14px">
                                    {data.id}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell">
                                  <Typography fontWeight={500} fontSize="14px">
                                    {data.vladimir_tag_number}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell">{" " + description}</TableCell>

                                <TableCell className="tbl-cell">{transactionStatus(data)}</TableCell>

                                <TableCell className="tbl-cell">
                                  <Typography fontSize="13px" fontWeight="bold" color="black">
                                    {userFromSplit[0]}
                                  </Typography>
                                  <Typography fontSize="13px" color="black">
                                    {userFromSplit[1]}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell">
                                  <Typography fontSize="13px" fontWeight="bold" color="black">
                                    {userToSplit[0]}
                                  </Typography>
                                  <Typography fontSize="13px" color="black">
                                    {userToSplit[1]}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell ">
                                  {moment(data.created_at).format("MMM DD, YYYY")}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box className="mcontainer__pagination-export">
              <Button
                className="mcontainer__export"
                variant="outlined"
                size="small"
                color="text"
                startIcon={<IosShareRounded color="primary" />}
                onClick={openExportDialog}
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
                total={transferHistoryData?.total}
                success={istransferHistorySuccess}
                current_page={transferHistoryData?.current_page}
                per_page={transferHistoryData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        )}
      </Stack>

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeExport())}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportTransfer />
      </Dialog>
    </Box>
  );
};

export default TransferHistoryReport;
