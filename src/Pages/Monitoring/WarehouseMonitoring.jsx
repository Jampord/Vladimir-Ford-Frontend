import React, { useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ErrorFetching from "../ErrorFetching";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { useGetWarehouseRequisitionMonitoringApiQuery } from "../../Redux/Query/Request/Requisition";

// MUI
import {
  Box,
  Button,
  Chip,
  Dialog,
  Grow,
  IconButton,
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
  Tooltip,
  Typography,
  useMediaQuery,
  Zoom,
} from "@mui/material";
import { AddBox, AddCircleSharp, IosShareRounded, LibraryAdd, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { closeDialog, closeExport, openDialog, openExport } from "../../Redux/StateManagement/booleanStateSlice";
import useExcel from "../../Hooks/Xlsx";
import moment from "moment";
import ExportRequestMonitoring from "../Monitoring/ExportRequestMonitoring";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import { TabContext } from "@mui/lab";
import ExportWarehouseMonitoring from "./ExportWarehouseMonitoring";
import { setWarehouseMonitoringTabValue } from "../../Redux/StateManagement/tabSlice";
import RequestTimeline from "../Asset Requisition/RequestTimeline";

const WarehouseMonitoring = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [requestFilter, setRequestFilter] = useState([]);
  const [transactionIdData, setTransactionIdData] = useState();
  // const [filterValue, setFilterValue] = useState("2");
  const viewData = true;
  const warehouseMonitoring = true;

  const dispatch = useDispatch();
  const filterValue = useSelector((state) => state.tab.warehouseMonitoringTabValue);

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dialog = useSelector((state) => state.booleanState.dialog);
  const showExport = useSelector((state) => state.booleanState.exportFile);

  const { excelExport } = useExcel();

  const handleChange = (event, newValue) => {
    // setFilterValue(newValue);
    dispatch(setWarehouseMonitoringTabValue(newValue));
    setPage(1);
  };

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

  // Table Properties --------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: requisitionData,
    isLoading: requisitionLoading,
    isSuccess: requisitionSuccess,
    isError: requisitionError,
    isFetching: requisitionFetching,
    error: errorData,
    refetch,
  } = useGetWarehouseRequisitionMonitoringApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      // filter: requestFilter,
      filter:
        filterValue === "2"
          ? "For Approval"
          : filterValue === "3"
          ? "For FA Approval"
          : filterValue === "4"
          ? "Sent To Ymir"
          : filterValue === "5"
          ? "For Tagging"
          : filterValue === "6"
          ? "For Pickup"
          : filterValue === "7"
          ? "Returned"
          : filterValue === "8"
          ? "Claimed"
          : null,
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleViewTimeline = (data) => {
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  // * Add Button Settings
  const [anchorElAdd, setAnchorElAdd] = useState(null);

  const handleEditRequisition = (data) => {
    navigate(`/warehouse-monitoring/${data.transaction_number}`, {
      state: { ...data, viewData, warehouseMonitoring },
    });
  };

  const isAdditionalCost = requisitionData?.data.map((item) => item.is_addcost);

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

      case "Sent to ymir for PO":
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

  const isCancelled = requisitionData?.data?.map((item) => item.status).includes("Cancelled");

  const openExportDialog = () => {
    dispatch(openExport());
    // setPrItems(data);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Warehouse Monitoring
      </Typography>

      <Box>
        <TabContext value={filterValue}>
          <Tabs onChange={handleChange} value={filterValue} variant="scrollable" scrollButtons="auto">
            <Tab label="ALL" value="1" className={filterValue === "1" ? "tab__background" : null} />
            <Tab label="For Approval" value="2" className={filterValue === "2" ? "tab__background" : null} />
            <Tab label="For FA Approval" value="3" className={filterValue === "3" ? "tab__background" : null} />
            <Tab label="Sent to Ymir" value="4" className={filterValue === "4" ? "tab__background" : null} />
            <Tab label="For Asset Tagging" value="5" className={filterValue === "5" ? "tab__background" : null} />
            <Tab label="For Pickup" value="6" className={filterValue === "6" ? "tab__background" : null} />
            <Tab label="Returned" value="7" className={filterValue === "7" ? "tab__background" : null} />
            <Tab label="Claimed" value="8" className={filterValue === "8" ? "tab__background" : null} />
          </Tabs>
        </TabContext>

        <Stack className="category_height">
          {requisitionLoading && <MasterlistSkeleton category={true} />}
          {requisitionError && <ErrorFetching refetch={refetch} error={errorData} />}
          {requisitionData && !requisitionError && (
            <Box className="mcontainer__wrapper">
              <MasterlistToolbar
                onStatusChange={setStatus}
                onSearchChange={setSearch}
                onSetPage={setPage}
                setRequestFilter={setRequestFilter}
                // requestFilter={requestFilter}
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
                        {/* <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `id`}
                          direction={orderBy === `id` ? order : `asc`}
                          onClick={() => onSort(`id`)}
                        >
                          ID No.
                        </TableSortLabel>
                      </TableCell> */}

                        <TableCell className="tbl-cell">
                          <TableSortLabel
                            active={orderBy === `transaction_number`}
                            direction={orderBy === `transaction_number` ? order : `asc`}
                            onClick={() => onSort(`transaction_number`)}
                          >
                            Transaction No.
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell">Requestor</TableCell>

                        <TableCell className="tbl-cell">
                          <TableSortLabel
                            active={orderBy === `acquisition_details`}
                            direction={orderBy === `acquisition_details` ? order : `asc`}
                            onClick={() => onSort(`acquisition_details`)}
                          >
                            Acquisition Details
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell text-center">
                          <TableSortLabel
                            active={orderBy === `pr_number`}
                            direction={orderBy === `pr_number` ? order : `asc`}
                            onClick={() => onSort(`pr_number`)}
                          >
                            PR Number
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell text-center">
                          <TableSortLabel
                            active={orderBy === `item_count`}
                            direction={orderBy === `item_count` ? order : `asc`}
                            onClick={() => onSort(`item_count`)}
                          >
                            Quantity
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell text-center">View Information</TableCell>

                        <TableCell className="tbl-cell text-center">
                          <TableSortLabel
                            active={orderBy === `status`}
                            direction={orderBy === `status` ? order : `asc`}
                            onClick={() => onSort(`status`)}
                          >
                            View Status
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell text-center">
                          <TableSortLabel
                            active={orderBy === `created_at`}
                            direction={orderBy === `created_at` ? order : `asc`}
                            onClick={() => onSort(`created_at`)}
                          >
                            Date Created
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {requisitionData?.data?.length === 0 ? (
                        <NoRecordsFound heightData="medium" />
                      ) : (
                        <>
                          {requisitionFetching || requisitionLoading ? (
                            <LoadingData />
                          ) : (
                            requisitionSuccess &&
                            [...requisitionData?.data]?.sort(comparator(order, orderBy))?.map((data) => (
                              <TableRow
                                key={data.id}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    borderBottom: 0,
                                  },
                                }}
                              >
                                {/* <TableCell className="tbl-cell tr-cen-pad45">
                                  {data.id}
                                </TableCell> */}
                                <TableCell className="tbl-cell text-weight">{data.transaction_number}</TableCell>
                                <TableCell className="tbl-cell">
                                  <Typography fontSize={12} fontWeight={700} color="secondary.main">
                                    {data.requestor.firstname}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={600} color="secondary.main">
                                    {data.requestor.lastname}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={500} color="primary">
                                    {data.requestor.username}
                                  </Typography>
                                </TableCell>
                                <TableCell className="tbl-cell">
                                  <Typography
                                    fontSize={14}
                                    fontWeight={600}
                                    maxWidth="440px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    color="secondary.main"
                                  >
                                    <Tooltip
                                      title={<>{data.acquisition_details}</>}
                                      placement="top-start"
                                      arrow
                                      // slots={{
                                      //   transition: Zoom,
                                      // }}
                                    >
                                      {data.acquisition_details}
                                    </Tooltip>
                                  </Typography>
                                  <Typography fontSize={12} color="secondary.light">
                                    ({data.warehouse?.id}) - {data.warehouse?.warehouse_name}
                                  </Typography>
                                  {/* <Typography fontSize={12} color="primary.main" fontWeight={400}>
                                  {data.is_addcost === 1 && "Additional Cost"}
                                </Typography> */}
                                </TableCell>

                                <TableCell className="tbl-cell">
                                  <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                    {data.ymir_pr_number}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell tr-cen-pad45">{data.item_count}</TableCell>
                                <TableCell className="tbl-cell text-center">
                                  <Tooltip placement="top" title="View Request Information" arrow>
                                    <IconButton onClick={() => handleEditRequisition(data)}>
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                                <TableCell className="tbl-cell tr-cen-pad45">{transactionStatus(data)}</TableCell>
                                <TableCell className="tbl-cell tr-cen-pad45">
                                  {data.status === "Cancelled"
                                    ? Moment(data.deleted_at).format("MMM DD, YYYY")
                                    : Moment(data.created_at).format("MMM DD, YYYY")}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
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
                  total={requisitionData?.total}
                  success={requisitionSuccess}
                  current_page={requisitionData?.current_page}
                  per_page={requisitionData?.per_page}
                  onPageChange={pageHandler}
                  onRowsPerPageChange={perPageHandler}
                />
              </Box>
            </Box>
          )}
        </Stack>
      </Box>

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <RequestTimeline data={transactionIdData} />
      </Dialog>

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        // onClose={() => dispatch(closeExport())}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportWarehouseMonitoring />
      </Dialog>
    </Box>
  );
};

export default WarehouseMonitoring;
