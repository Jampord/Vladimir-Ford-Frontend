import {
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
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetOperationApiQuery, usePatchOperationStatusApiMutation } from "../../Redux/Query/Masterlist/Operation";
import { openDialog } from "../../Redux/StateManagement/booleanStateSlice";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { AddBox, Help, ReportProblem } from "@mui/icons-material";
import { Box } from "@mui/system";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AddOperation from "./AddEdit/AddOperation";

const Operation = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [updateOperation, setUpdateOperation] = useState({});

  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.booleanState.drawer);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const {
    data: operationData,
    isLoading: operationLoading,
    isFetching: operationFetching,
    isSuccess: operationSuccess,
    isError: operationError,
    error: errorData,
    refetch: refetch,
  } = useGetOperationApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [patchOperationStatusApi, { isLoading }] = usePatchOperationStatusApiMutation();

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

  const onUpdateHandler = (props) => {
    const { id, operation_name } = props;
    setUpdateOperation({
      id: id,
      operation_name: operation_name,
      status: true,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateOperation({
      id: "",
      operation_name: "",
      status: false,
    });
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
            const result = await patchOperationStatusApi({
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
        Operation
      </Typography>

      {operationLoading && <MasterlistSkeleton onAdd={true} />}
      {operationError && <ErrorFetching refetch={refetch} error={errorData} />}
      {operationData && !operationError && (
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
                    <TableCell className="tbl-cell tr-cen-pad45">Operation Name</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Operation Code</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Operation Type</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {operationData.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {operationSuccess &&
                        operationData.data.map((data) => (
                          <TableRow
                            key={data.id}
                            hover={true}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell tr-cen-pad45">{data.id}</TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">{`${data.operation_name}`}</TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">{`${data.operation_code}`}</TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">{`${data.operation_type}`}</TableCell>

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
                                onUpdateHandler={onUpdateHandler}
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
              total={operationData?.total}
              success={operationSuccess}
              current_page={operationData?.current_page}
              per_page={operationData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={drawer}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "10px" } }}
        maxWidth="xs"
        fullWidth
      >
        <AddOperation data={updateOperation} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>
    </Box>
  );
};

export default Operation;
