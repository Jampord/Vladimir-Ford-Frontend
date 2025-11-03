import {
  Box,
  Button,
  Chip,
  Dialog,
  Grow,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  useGetEnrolledBudgetApiQuery,
  usePatchEnrolledBudgetStatusApiMutation,
} from "../../Redux/Query/Masterlist/EnrolledBudget";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddBox, Help, ReportProblem } from "@mui/icons-material";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import ErrorFetching from "../ErrorFetching";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AddEnrolledBudget from "./AddEdit/AddEnrolledBudget";
import { openDialog } from "../../Redux/StateManagement/booleanStateSlice";

const EnrolledBudget = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState.dialog);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const {
    data: enrolledBudgetData,
    isLoading: enrolledBudgetLoading,
    isFetching: enrolledBudgetFetching,
    isSuccess: enrolledBudgetSuccess,
    isError: enrolledBudgetError,
    error: errorData,
    refetch: refetch,
  } = useGetEnrolledBudgetApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [patchEnrolledBudgetStatusApi, { isLoading }] = usePatchEnrolledBudgetStatusApiMutation();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleClick = () => {
    dispatch(openDialog());
  };

  const formatCost = (value) => {
    const unitCost = Number(value);
    return unitCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const onArchiveRestoreHandler = async (id) => {
    dispatch(
      openConfirm({
        icon: status === "active" ? ReportProblem : Help,
        iconColor: status === "active" ? "alert" : "info",
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
              {status === "active" ? "ARCHIVE" : "ACTIVATE"}
            </Typography>{" "}
            this data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await patchEnrolledBudgetStatusApi({
              id: id,
              status: status === "active" ? false : true,
            }).unwrap();

            dispatch(
              openToast({
                message: result?.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
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
          }
        },
      })
    );
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Enrolled Budget
      </Typography>

      {enrolledBudgetLoading && <MasterlistSkeleton onAdd={true} />}
      {enrolledBudgetError && <ErrorFetching refetch={refetch} error={errorData} />}
      {enrolledBudgetData && !enrolledBudgetError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

          <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
            <Button
              onClick={handleClick}
              variant="contained"
              startIcon={isSmallScreen ? null : <AddBox />}
              size="small"
              sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
            >
              {isSmallScreen ? <AddBox color="black" sx={{ fontSize: "20px" }} /> : "Add"}
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
                    <TableCell className="tbl-cell tr-cen-pad45">Id</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Enrolled Budget</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Budget</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {enrolledBudgetData.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {enrolledBudgetSuccess &&
                        enrolledBudgetData.data.map((data) => (
                          <TableRow
                            key={data.id}
                            hover={true}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell tr-cen-pad45  tbl-coa">{data.id}</TableCell>

                            <TableCell className="tbl-cell text-weight tr-cen-pad45">{`${data.name}`}</TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">₱{formatCost(data?.budget)}</TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              {data.is_active ? (
                                <Chip
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    background: "#27ff811f",
                                    color: "active.dark",
                                    fontSize: "0.7rem",
                                    px: 1,
                                  }}
                                  label="ACTIVE"
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    background: "#fc3e3e34",
                                    color: "error.light",
                                    fontSize: "0.7rem",
                                    px: 1,
                                  }}
                                  label="INACTIVE"
                                />
                              )}
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              {moment(data.created_at).format("MMM. DD, YYYY")}
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              <ActionMenu
                                data={data}
                                hideEdit
                                // onUpdateHandler={onUpdateHandler}
                                status={status}
                                onArchiveRestoreHandler={onArchiveRestoreHandler}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomTablePagination
              total={enrolledBudgetData?.total}
              success={enrolledBudgetSuccess}
              current_page={enrolledBudgetData?.current_page}
              per_page={enrolledBudgetData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "10px" } }}
        maxWidth="xs"
        fullWidth
      >
        <AddEnrolledBudget />
      </Dialog>
    </Box>
  );
};

export default EnrolledBudget;
