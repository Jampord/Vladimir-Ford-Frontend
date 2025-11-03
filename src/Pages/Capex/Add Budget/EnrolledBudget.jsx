import {
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { Help, LibraryAdd, ReportProblem, SystemUpdateAltRounded, Visibility } from "@mui/icons-material";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useDispatch, useSelector } from "react-redux";
import { closeImport, openImport } from "../../../Redux/StateManagement/booleanStateSlice";
import { LoadingButton } from "@mui/lab";
import ImportBudget from "./ImportBudget";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import {
  useGetEnrolledBudgetApiQuery,
  usePatchEnrolledBudgetStatusApiMutation,
} from "../../../Redux/Query/Capex/AddBudget";

const EnrolledBudget = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dispatch = useDispatch();
  const importFile = useSelector((state) => state.booleanState.importFile);

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
    <Stack className="category_height">
      <Box className="mcontainer__wrapper">
        <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

        <Box className="masterlist-toolbar__addBtn" sx={{ mt: "4px", mr: "10px" }}>
          <LoadingButton
            onClick={() => dispatch(openImport())}
            variant="contained"
            startIcon={isSmallScreen ? null : <SystemUpdateAltRounded color="primary" sx={{ fontSize: "20px" }} />}
            size="small"
            color="secondary"
            sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
          >
            {isSmallScreen ? <SystemUpdateAltRounded color="primary" sx={{ fontSize: "20px" }} /> : "Import"}
          </LoadingButton>
          <Button
            // onClick={handleOpenAdd}
            variant="contained"
            startIcon={isSmallScreen ? null : <LibraryAdd />}
            size="small"
            sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
          >
            {isSmallScreen ? <LibraryAdd color="black" sx={{ fontSize: "20px" }} /> : "Add"}
          </Button>
        </Box>

        <Box>
          <TableContainer className="mcontainer__th-body-category">
            <Table className="mcontainer__table" stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& > *": {
                      whiteSpace: "nowrap",
                      color: "secondary.main",
                      position: "relative",
                    },
                  }}
                >
                  <TableCell className="tbl-cell tr-cen-pad45">
                    <Typography variant="inherit" mb={-1}>
                      Transaction
                    </Typography>
                    <Typography variant="inherit">Number</Typography>
                  </TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">One Charging</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Description</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Asset</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Years</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Quantity</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Unit Cost</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Amount</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Remarks</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Date Applied</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Cost Applied</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">View</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {enrolledBudgetData?.data.length === 0 ? (
                  <NoRecordsFound heightData="medium" />
                ) : (
                  <>
                    {enrolledBudgetSuccess &&
                      enrolledBudgetData?.data.map((data) => (
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
                          <TableCell className="tbl-cell  tr-cen-pad45">{`${data.name}`}</TableCell>
                          <TableCell className="tbl-cell  tr-cen-pad45">{`${data.name}`}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">{data?.asset}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">{data?.year}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">{data?.quantity}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">₱{formatCost(data?.unit_cost)}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">₱{formatCost(data?.amount)}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">{data?.remarks}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">
                            {moment(data?.date_applied).format("MMM. DD, YYYY")}
                          </TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">₱{formatCost(data?.cost__applied)}</TableCell>

                          <TableCell className="tbl-cell tr-cen-pad45">
                            <IconButton>
                              <Visibility />
                            </IconButton>
                          </TableCell>
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
        </Box>

        <CustomTablePagination
          total={enrolledBudgetData?.total}
          success={enrolledBudgetSuccess}
          current_page={enrolledBudgetData?.current_page}
          per_page={enrolledBudgetData?.per_page}
          onPageChange={pageHandler}
          onRowsPerPageChange={perPageHandler}
        />
      </Box>

      <Dialog
        open={importFile}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeImport())}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            padding: "5px 20px",
            minWidth: "30%",
            width: "80%",
            overflow: "hidden",
          },
        }}
      >
        <ImportBudget />
      </Dialog>
    </Stack>
  );
};

export default EnrolledBudget;
