import {
  Box,
  Button,
  Chip,
  Dialog,
  Grow,
  IconButton,
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
import { useState } from "react";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { RemoveCircle, Report, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDeleteDisposalApiMutation, useGetDisposalApiQuery } from "../../../Redux/Query/Movement/Disposal";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import PulloutTimeline from "../PulloutTimeline";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";

const Disposal = () => {
  // const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [transactionIdData, setTransactionIdData] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  const dialog = useSelector((state) => state.booleanState.dialog);

  const {
    data: disposalData,
    isLoading: disposalLoading,
    isSuccess: disposalSuccess,
    isError: disposalError,
    isFetching: disposalFetching,
    error: errorData,
    refetch,
  } = useGetDisposalApiQuery(
    {
      page: page,
      per_page: perPage,
      // status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteDisposal, { data: deleteDisposalData }] = useDeleteDisposalApiMutation();

  const handleDisposal = () => {
    navigate(`add-disposal`);
  };

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

  const handleViewTimeline = (data) => {
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  const handleViewDisposal = (data) => {
    // console.log("data: ", data);
    const view = true;
    navigate(`add-disposal/${data.id}`, {
      state: { ...data, view },
    });
  };

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
            let result = await deleteDisposal({
              id: id,
            }).unwrap();
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

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Disposal
      </Typography>

      {disposalLoading && <MasterlistSkeleton />}
      {disposalError && <ErrorFetching refetch={refetch} error={errorData} />}
      {disposalData && !disposalError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive />

          {/* <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }}>
          <Button
            onClick={handleDisposal}
            variant="contained"
            startIcon={isSmallScreen ? null : <RemoveCircle />}
            size="small"
            sx={isSmallScreen ? { minWidth: "50px", px: 0 } : { marginRight: "10px" }}
          >
            {isSmallScreen ? <RemoveCircle sx={{ fontSize: "20px" }} /> : "Dispose"}
          </Button>
        </Box> */}

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
                    <TableCell className="tbl-cell">Request #</TableCell>
                    <TableCell className="tbl-cell">Request Description</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">View Information</TableCell>
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Quantity</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell">Date Requested</TableCell>
                    <TableCell className="tbl-cell">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {disposalData?.data?.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : disposalFetching ? (
                    <LoadingData />
                  ) : (
                    disposalSuccess &&
                    disposalData?.data.map((data) => (
                      <TableRow
                        key={data.id}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell className="tbl-cell text-weight">{data.id}</TableCell>
                        <TableCell className="tbl-cell">{data?.description}</TableCell>
                        <TableCell className="tbl-cell tr-cen-pad45">
                          <Tooltip
                            placement="top"
                            title="View 
                      Disposal Information"
                            arrow
                          >
                            <IconButton onClick={() => handleViewDisposal(data)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="tbl-cell">
                          <Typography fontSize={10} color="gray">
                            {`(${data.one_charging?.code || "-"}) - ${data.one_charging?.name || "-"}`}
                          </Typography>
                          <Typography fontSize={10} color="gray">
                            {`(${data.one_charging?.company_code || data?.company?.company_code}) - ${
                              data.one_charging?.company_name || data?.company?.company_name
                            }`}
                          </Typography>
                          <Typography fontSize={10} color="gray">
                            {`(${data.one_charging?.business_unit_code || data?.business_unit?.business_unit_code}) - ${
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
                        <TableCell className="tbl-cell tr-cen-pad45">{data?.quantity}</TableCell>
                        <TableCell className="tbl-cell tr-cen-pad45">{transactionStatus(data)}</TableCell>
                        <TableCell className="tbl-cell">{moment(data?.created_at).format("MMMM DD, YYYY")}</TableCell>
                        <TableCell className="tbl-cell">
                          {data?.status === "For Approval of Approver 1" && (
                            <ActionMenu
                              data={data}
                              editDisposalData={data?.status === "For Approval of Approver 1"}
                              status
                              hideEdit
                              hideArchive
                              showVoid
                              onVoidHandler={onVoidHandler}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <CustomTablePagination
            total={disposalData?.total}
            success={disposalSuccess}
            current_page={disposalData?.current_page}
            per_page={disposalData?.per_page}
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
    </Box>
  );
};

export default Disposal;
