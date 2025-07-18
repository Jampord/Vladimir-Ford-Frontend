import React, { useEffect, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import ErrorFetching from "../ErrorFetching";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AddRequisition from "./Add Requisition/AddRequest";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { openConfirm, closeConfirm, onLoading } from "../../Redux/StateManagement/confirmSlice";
import {
  useGetRequisitionApiQuery,
  usePatchRequisitionStatusApiMutation,
  useVoidRequisitionApiMutation,
} from "../../Redux/Query/Request/Requisition";

// MUI
import {
  Box,
  Button,
  Chip,
  Dialog,
  Fade,
  Grow,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Slide,
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
import {
  AddBox,
  AddCircleSharp,
  Help,
  HelpTwoTone,
  IosShareRounded,
  LibraryAdd,
  Money,
  Report,
  ReportProblem,
  Visibility,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { closeDialog, closeExport, openDialog, openExport } from "../../Redux/StateManagement/booleanStateSlice";
import RequestTimeline from "./RequestTimeline";
import { useDeleteRequestContainerAllApiMutation } from "../../Redux/Query/Request/RequestContainer";
import ExportRequisition from "./ExportRequisition";
import { TabContext, TabPanel } from "@mui/lab";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import { setRequisitionTabValue } from "../../Redux/StateManagement/tabSlice";

const Requisition = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [requestFilter, setRequestFilter] = useState([]);
  const [claimed, setClaimed] = useState("");

  const viewData = true;

  const dispatch = useDispatch();
  const tabValue = useSelector((state) => state.tab.requisitionTabValue);
  const dialog = useSelector((state) => state.booleanState.dialog);

  const handleChange = (event, newValue) => {
    dispatch(setRequisitionTabValue(newValue));
    newValue === "1" ? setClaimed("") : setClaimed("Claimed");
  };

  // const enableForm = true;

  const [transactionIdData, setTransactionIdData] = useState();

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  // const drawer = useSelector((state) => state.booleanState.drawer);

  const [postRequisitionStatusApi, { isLoading }] = usePatchRequisitionStatusApiMutation();
  const [voidRequisitionApi, { isVoidLoading }] = useVoidRequisitionApiMutation();
  const [deleteAllRequest, { data: deleteAllRequestData }] = useDeleteRequestContainerAllApiMutation();

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
    error: errorData,
    isFetching: requisitionFetching,
    refetch,
  } = useGetRequisitionApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      filter: requestFilter,
      claimed: claimed,
    },
    { refetchOnMountOrArgChange: true }
  );

  // console.log("requisitiondata", requisitionData);

  const onVoidHandler = async (id) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
              }}
            >
              VOID
            </Typography>{" "}
            this Data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await voidRequisitionApi({
              id: id,
              transaction_number: id,
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
            console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data.message,
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

  const onSetPage = () => {
    setPage(1);
  };

  const handleViewTimeline = (data) => {
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  // * Add Button Settings
  const [anchorElAdd, setAnchorElAdd] = useState(null);
  const openAdd = Boolean(anchorElAdd);

  const handleOpenAdd = (event) => {
    // deleteAllRequest();
    setAnchorElAdd(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElAdd(null);
  };

  const handleEditRequisition = (data) => {
    // data?.is_addcost === 1
    //   ? navigate(`/asset-requisition/requisition/additional-cost/${data.transaction_number}`, {
    //       state: { ...data, viewData },
    //     })
    //   :
    navigate(`/asset-requisition/requisition/view-requisition/${data.transaction_number}`, {
      state: { ...data, viewData },
    });
    // console.log("data", data);
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

  const showExport = useSelector((state) => state.booleanState.exportFile);
  const openExportDialog = (data) => {
    dispatch(openExport());
    // setPrItems(data);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Requisition
      </Typography>

      <Box>
        <TabContext value={tabValue}>
          <Tabs onChange={handleChange} value={tabValue}>
            <Tab
              label={isSmallScreen ? "Pending" : "Pending Request"}
              value="1"
              claimed=""
              className={tabValue === "1" ? "tab__background" : null}
            />

            <Tab
              label={isSmallScreen ? "Claimed" : "Claimed Request"}
              value="2"
              claimed="claimed"
              className={tabValue === "2" ? "tab__background" : null}
            />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" claimed="" index="1">
            <Stack className="category_height">
              {requisitionLoading && <MasterlistSkeleton onAdd={true} onExport={false} />}
              {requisitionError && <ErrorFetching refetch={refetch} error={errorData} />}
              {requisitionData && !requisitionError && (
                <>
                  <Box className="mcontainer__wrapper">
                    <MasterlistToolbar
                      onStatusChange={setStatus}
                      onSearchChange={setSearch}
                      onSetPage={setPage}
                      setRequestFilter={setRequestFilter}
                      requestFilter={requestFilter}
                    />

                    <Box className="masterlist-toolbar__addBtn" sx={{ mt: "4px", mr: "10px" }}>
                      <Button
                        onClick={handleOpenAdd}
                        variant="contained"
                        startIcon={isSmallScreen ? null : <LibraryAdd />}
                        size="small"
                        sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
                      >
                        {isSmallScreen ? <LibraryAdd color="black" sx={{ fontSize: "20px" }} /> : "Add"}
                      </Button>

                      <Menu
                        anchorEl={anchorElAdd}
                        open={openAdd}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                        disablePortal
                      >
                        <MenuItem onClick={() => navigate(`add-requisition`)} dense>
                          <ListItemIcon>
                            <AddBox />
                          </ListItemIcon>
                          <ListItemText>Request</ListItemText>
                        </MenuItem>

                        {/* <MenuItem onClick={() => navigate(`additional-cost`)} dense disabled>
                          <ListItemIcon>
                            <AddCircleSharp />
                          </ListItemIcon>
                          <ListItemText>Additional Cost</ListItemText>
                        </MenuItem> */}
                      </Menu>
                    </Box>

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
                              {!isCancelled && <TableCell className="tbl-cell">Action</TableCell>}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {requisitionFetching ? (
                              <LoadingData />
                            ) : requisitionData?.data?.length === 0 ? (
                              <NoRecordsFound heightData="medium" />
                            ) : (
                              <>
                                {requisitionSuccess &&
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
                                        <Typography
                                          fontSize={14}
                                          fontWeight={600}
                                          maxWidth="440px"
                                          overflow="hidden"
                                          textOverflow="ellipsis"
                                          color="secondary.main"
                                        >
                                          <Tooltip
                                            title={data.acquisition_details}
                                            placement="top-start"
                                            arrow
                                            // slots={{
                                            //   transition: Zoom,
                                            // }}
                                          >
                                            <>{data.acquisition_details}</>
                                          </Tooltip>
                                        </Typography>
                                        <Typography fontSize={12} color="secondary.light">
                                          ({data.warehouse?.id}) - {data.warehouse?.warehouse_name}
                                        </Typography>
                                        {/* <Typography fontSize={12} color="primary.main" fontWeight={400}>
                                  {data.is_addcost === 1 && "Additional Cost"}
                                </Typography> */}
                                      </TableCell>

                                      <TableCell className="tbl-cell text-center">
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
                                      {!isCancelled && (
                                        <TableCell className="tbl-cell ">
                                          {(data.status === "For Approval of Approver 1" ||
                                            data.status === "Returned" ||
                                            data.status === "Returned From Ymir") && (
                                            <ActionMenu
                                              status={data.status}
                                              data={data}
                                              showVoid
                                              onVoidHandler={onVoidHandler}
                                              hideArchive
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
                </>
              )}
            </Stack>
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <Stack className="category_height">
              {requisitionLoading && <MasterlistSkeleton onAdd={true} onExport={false} />}
              {requisitionError && <ErrorFetching refetch={refetch} error={errorData} />}
              {requisitionData && !requisitionError && (
                <>
                  <Box className="mcontainer__wrapper">
                    <MasterlistToolbar
                      onStatusChange={setStatus}
                      onSearchChange={setSearch}
                      onSetPage={setPage}
                      hideArchive
                      // setRequestFilter={setRequestFilter}
                      // requestFilter={requestFilter}
                    />

                    <Box className="masterlist-toolbar__addBtn" sx={{ mt: "4px", mr: "10px" }}>
                      <Button
                        onClick={handleOpenAdd}
                        variant="contained"
                        startIcon={isSmallScreen ? null : <LibraryAdd />}
                        size="small"
                        sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
                      >
                        {isSmallScreen ? <LibraryAdd color="black" sx={{ fontSize: "20px" }} /> : "Add"}
                      </Button>

                      <Menu
                        anchorEl={anchorElAdd}
                        open={openAdd}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                        disablePortal
                      >
                        <MenuItem onClick={() => navigate(`add-requisition`)} dense>
                          <ListItemIcon>
                            <AddBox />
                          </ListItemIcon>
                          <ListItemText>Request</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={() => navigate(`additional-cost`)} dense disabled>
                          <ListItemIcon>
                            <AddCircleSharp />
                          </ListItemIcon>
                          <ListItemText>Additional Cost</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>

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
                              {!isCancelled && <TableCell className="tbl-cell">Action</TableCell>}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {requisitionFetching ? (
                              <LoadingData />
                            ) : requisitionData?.data?.length === 0 ? (
                              <NoRecordsFound heightData="medium" />
                            ) : (
                              <>
                                {requisitionSuccess &&
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
                                        <Typography
                                          fontSize={14}
                                          fontWeight={600}
                                          maxWidth="440px"
                                          overflow="hidden"
                                          textOverflow="ellipsis"
                                          color="secondary.main"
                                        >
                                          <Tooltip
                                            title={data.acquisition_details}
                                            placement="top-start"
                                            arrow
                                            // slots={{
                                            //   transition: Zoom,
                                            // }}
                                          >
                                            <>{data.acquisition_details}</>
                                          </Tooltip>
                                        </Typography>
                                        <Typography fontSize={12} color="secondary.light">
                                          ({data.warehouse?.id}) - {data.warehouse?.warehouse_name}
                                        </Typography>
                                        {/* <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                          {data.acquisition_details}
                                        </Typography>
                                        <Typography fontSize={12} color="secondary.light">
                                          ({data.warehouse?.id}) - {data.warehouse?.warehouse_name}
                                        </Typography> */}
                                        {/* <Typography fontSize={12} color="primary.main" fontWeight={400}>
                                  {data.is_addcost === 1 && "Additional Cost"}
                                </Typography> */}
                                      </TableCell>

                                      <TableCell className="tbl-cell text-center">
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
                                      {!isCancelled && (
                                        <TableCell className="tbl-cell ">
                                          {(data.status === "For Approval of Approver 1" ||
                                            data.status === "Returned" ||
                                            data.status === "Returned From Ymir") && (
                                            <ActionMenu
                                              status={data.status}
                                              data={data}
                                              showVoid
                                              onVoidHandler={onVoidHandler}
                                              hideArchive
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
                </>
              )}
            </Stack>
          </TabPanel>
        </TabContext>
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
        onClose={() => dispatch(closeExport())}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportRequisition />
      </Dialog>
    </Box>
  );
};

export default Requisition;
