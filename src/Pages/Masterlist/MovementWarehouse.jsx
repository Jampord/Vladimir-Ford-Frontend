import { useState } from "react";
import {
  useGetMovementWarehouseApiQuery,
  usePatchMovementWarehouseApiMutation,
} from "../../Redux/Query/Masterlist/Warehouse";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Dialog,
  Grow,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import moment from "moment";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import AddMovementWarehouse from "./AddEdit/AddMovementWarehouse";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { Help, ReportProblem } from "@mui/icons-material";
import { openToast } from "../../Redux/StateManagement/toastSlice";

const MovementWarehouse = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [updateMovementWarehouse, setUpdateMovementWarehouse] = useState({
    status: false,
    id: null,
    name: "",
  });

  const drawer = useSelector((state) => state.booleanState.drawer);
  const dispatch = useDispatch();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const {
    data: movementWarehouseData,
    isLoading: movementWarehouseLoading,
    isFetching: movementWarehouseFetching,
    isSuccess: movementWarehouseSuccess,
    isError: movementWarehouseError,
    error: errorData,
    refetch,
  } = useGetMovementWarehouseApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [patchMovementWarehouseStatusApi, { isLoading }] = usePatchMovementWarehouseApiMutation();

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
            const result = await patchMovementWarehouseStatusApi({
              id: id,
              status: status === "active" ? false : true,
            }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          } catch (err) {
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

  const onUpdateHandler = (props) => {
    const { id, name } = props;
    setUpdateMovementWarehouse({
      status: true,
      id: id,
      name: name,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateMovementWarehouse({
      status: false,
      id: null,
      name: "",
    });
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Movement Warehouse
      </Typography>

      {movementWarehouseLoading && <MasterlistSkeleton onAdd={true} />}
      {movementWarehouseError && <ErrorFetching refetch={refetch} error={errorData} />}
      {movementWarehouseData && !movementWarehouseError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} onAdd />

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
                    <TableCell className="tbl-cell tr-cen-pad45">ID No.</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Movement Warehouse</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Code</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {movementWarehouseFetching ? (
                    <LoadingData />
                  ) : movementWarehouseData?.data?.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {movementWarehouseSuccess &&
                        movementWarehouseData?.data?.map((data) => (
                          <TableRow
                            key={data.id}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell tr-cen-pad45">{data.id}</TableCell>
                            <TableCell className="tbl-cell tr-cen-pad45">{data.name}</TableCell>
                            <TableCell className="tbl-cell tr-cen-pad45">{data.code}</TableCell>
                            <TableCell className="tbl-cell tr-cen-pad45">
                              {moment(data.created_at).format("MMMM DD, YYYY")}
                            </TableCell>
                            <TableCell className="tbl-cell tr-cen-pad45">
                              <ActionMenu
                                status={status}
                                data={data}
                                onUpdateHandler={onUpdateHandler}
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
              total={movementWarehouseData?.total}
              success={movementWarehouseSuccess}
              current_page={movementWarehouseData?.current_page}
              per_page={movementWarehouseData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <AddMovementWarehouse data={updateMovementWarehouse} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>
    </Box>
  );
};

export default MovementWarehouse;
