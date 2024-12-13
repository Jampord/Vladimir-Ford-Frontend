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
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import { IosShareRounded, Logout, Report, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useGetPulloutApiQuery, usePatchVoidPulloutApiMutation } from "../../../Redux/Query/Movement/Pullout";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import moment from "moment";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useDispatch, useSelector } from "react-redux";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import PulloutTimeline from "../PulloutTimeline";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";

const Pullout = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState([]);
  const [transactionIdData, setTransactionIdData] = useState(""); //

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dialog = useSelector((state) => state.booleanState.dialog);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePullout = () => {
    navigate(`add-pull-out`);
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
    data: pulloutData,
    isLoading: isPulloutLoading,
    isSuccess: isPulloutSuccess,
    isError: isPulloutError,
    isFetching: isPulloutFetching,
    error: errorData,
    refetch,
  } = useGetPulloutApiQuery(
    {
      page: page,
      per_page: perPage,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [voidPullout] = usePatchVoidPulloutApiMutation();

  const transactionStatus = (data) => {
    let statusColor, hoverColor, textColor, variant;

    switch (data.status) {
      case "Waiting to be Received":
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

      // case "Sent to ymir for PO":
      //   statusColor = "ymir.light";
      //   hoverColor = "ymir.main";
      //   variant = "filled";
      //   break;

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

  const onVoidHandler = async (id) => {
    console.log("id", id);
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
            let result = await voidPullout({
              movement_id: id,
            }).unwrap();
            console.log(result);
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

  console.log("data", pulloutData);

  const handleViewTransfer = (data) => {
    // console.log("data: ", data);
    const view = true;
    navigate(`add-pull-out/${data.id}`, {
      state: { ...data, view },
    });
  };

  const handleViewTimeline = (data) => {
    // console.log(data);
    dispatch(openDialog());
    setTransactionIdData(data);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Pull Out
      </Typography>

      {isPulloutLoading && <MasterlistSkeleton onAdd={true} />}
      {isPulloutError && <ErrorFetching refetch={refetch} error={errorData} />}
      {pulloutData && !isPulloutError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handlePullout}
                variant="contained"
                startIcon={isSmallScreen ? null : <Logout sx={{ transform: "rotate(270deg)" }} />}
                size="small"
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
              >
                {isSmallScreen ? (
                  <Logout color="black" sx={{ fontSize: "20px", transform: "rotate(270deg)" }} />
                ) : (
                  "Pull out"
                )}
              </Button>
            </Box>

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
                      <TableCell className="tbl-cell" align="center">
                        Request #
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Request Description
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Care of
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Quantity
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        View Information
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Status
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Date Requested
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pulloutData?.data.length === 0 ? (
                      <NoRecordsFound heightData="medium" />
                    ) : (
                      <>
                        {pulloutData?.data?.map((item) => (
                          <TableRow
                            key={item?.id}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell text-weight" align="center">
                              {item?.id}
                            </TableCell>
                            <TableCell className="tbl-cell " align="center">
                              {item?.description}
                            </TableCell>
                            <TableCell className="tbl-cell text-weight" align="center">
                              {item?.care_of}
                            </TableCell>
                            <TableCell className="tbl-cell tr-cen-pad45" align="center">
                              {item?.quantity}
                            </TableCell>
                            <TableCell className="tbl-cell text-weight text-center">
                              <Tooltip placement="top" title="View Pullout Information" arrow>
                                <IconButton onClick={() => handleViewTransfer(item)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="tbl-cel" align="center">
                              {transactionStatus(item)}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              {moment(item?.created_at).format("MMM DD, YYYY")}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              {(item?.can_delete === 1 || item?.can_edit === 1) && (
                                <ActionMenu
                                  data={item}
                                  status={item?.status}
                                  hideArchive
                                  showVoid={item?.can_delete === 1}
                                  editPulloutData={item?.can_edit === 1}
                                  onVoidHandler={onVoidHandler}
                                />
                              )}
                            </TableCell>
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
                // onClick={handleExport}
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
                total={pulloutData?.total}
                success={isPulloutSuccess}
                current_page={pulloutData?.current_page}
                per_page={pulloutData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </>
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

export default Pullout;
