import React, { useEffect, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../Components/Reusable/ActionMenu";

// RTK
import { useDispatch } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { openConfirm, closeConfirm, onLoading } from "../../Redux/StateManagement/confirmSlice";

import { useLazyGetYmirWarehouseAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/YmirApi";
import {
  useGetWarehouseApiQuery,
  usePostWarehouseApiMutation,
  usePostWarehouseStatusApiMutation,
} from "../../Redux/Query/Masterlist/Warehouse";

import { useSelector } from "react-redux";

// MUI
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
  TableSortLabel,
  Typography,
} from "@mui/material";
import { Help, ReportProblem, Visibility } from "@mui/icons-material";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import AddWarehouse from "./AddEdit/AddWarehouse";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { openDrawer } from "../../Redux/StateManagement/booleanStateSlice";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import TagWarehouseLocation from "./AddEdit/TagWarehouseLocation";
import TagWarehouseDepartment from "./AddEdit/TagWarehouseDepartment";

const Warehouse = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const [updateWarehouse, setUpdateWarehouse] = useState();

  const drawer = useSelector((state) => state.booleanState.drawer);
  const dispatch = useDispatch();

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

  const [
    trigger,
    {
      data: ymirWarehouseApi,
      isLoading: ymirWarehouseApiLoading,
      isSuccess: ymirWarehouseApiSuccess,
      isFetching: ymirWarehouseApiFetching,
      isError: ymirWarehouseApiError,

      refetch: ymirWarehouseApiRefetch,
    },
  ] = useLazyGetYmirWarehouseAllApiQuery();

  const {
    data: warehouseData,
    isLoading: warehouseLoading,
    isSuccess: warehouseSuccess,
    isError: warehouseError,
    error: errorData,
    refetch: refetch,
  } = useGetWarehouseApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    postWarehouse,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostWarehouseApiMutation();

  const [postWarehouseStatusApi, { isLoading }] = usePostWarehouseStatusApiMutation();

  useEffect(() => {
    if (ymirWarehouseApiSuccess) {
      postWarehouse(ymirWarehouseApi);
    }
  }, [ymirWarehouseApiSuccess, ymirWarehouseApiFetching]);

  useEffect(() => {
    if (isPostError) {
      let message = "Something went wrong. Please try again.";
      let variant = "error";

      if (postError?.status === 404 || postError?.status === 422) {
        message = postError?.data?.errors.detail || postError?.data?.message;
        if (postError?.status === 422) {
          console.log(postError);
          dispatch(closeConfirm());
        }
      }

      dispatch(openToast({ message, duration: 5000, variant }));
    }
  }, [isPostError]);

  useEffect(() => {
    if (isPostSuccess && !isPostLoading) {
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
      dispatch(closeConfirm());
    }
  }, [isPostSuccess, isPostLoading]);

  const onSyncHandler = async () => {
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
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
              SYNC
            </Typography>{" "}
            the data?
          </Box>
        ),
        autoClose: true,

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            await trigger();
            // warehouseApiRefetch();
            refetch();
          } catch (err) {
            console.log(err.message);
            dispatch(
              openToast({
                message: postData?.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
          }
        },
      })
    );
  };

  const onSetPage = () => {
    setPage(1);
  };

  // console.log(warehouseData);
  console.log("wdata", warehouseData);

  const onUpdateHandler = (props) => {
    console.log("props", props);
    const { id, warehouse_name, one_charging, sync_id } = props;
    setUpdateWarehouse({
      status: true,
      id: id,
      sync_id: sync_id,
      one_charging: one_charging,
      warehouse_name: warehouse_name,
    });
  };

  const onViewDepartmentHandler = (props) => {
    const { id, warehouse_name, one_charging, sync_id } = props;
    setUpdateWarehouse({
      status: true,
      action: "view",
      id: id,
      sync_id: sync_id,
      one_charging: one_charging,
      warehouse_name: warehouse_name,
    });
  };

  const handleViewDepartment = (data) => {
    onViewDepartmentHandler(data);
    dispatch(openDrawer());
    dispatch(closeConfirm());
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
            const result = await postWarehouseStatusApi({
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

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Warehouse
      </Typography>

      {warehouseLoading && <MasterlistSkeleton onSync={true} />}
      {warehouseError && <ErrorFetching refetch={refetch} error={errorData} />}
      {warehouseData && !warehouseError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
            onSyncHandler={onSyncHandler}
            onSync={() => {}}
          />

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
                    <TableCell className="tbl-cell text-center">
                      <TableSortLabel
                        active={orderBy === `id`}
                        direction={orderBy === `id` ? order : `asc`}
                        onClick={() => onSort(`id`)}
                      >
                        ID No.
                      </TableSortLabel>
                    </TableCell>

                    <TableCell className="tbl-cell">
                      <TableSortLabel
                        active={orderBy === `warehouse_name`}
                        direction={orderBy === `warehouse_name` ? order : `asc`}
                        onClick={() => onSort(`warehouse_name`)}
                      >
                        Warehouse
                      </TableSortLabel>
                    </TableCell>

                    <TableCell className="tbl-cell">Code</TableCell>

                    <TableCell className="tbl-cell text-center">View Information</TableCell>

                    <TableCell className="tbl-cell text-center">Status</TableCell>

                    <TableCell className="tbl-cell text-center">
                      <TableSortLabel
                        active={orderBy === `created_at`}
                        direction={orderBy === `created_at` ? order : `asc`}
                        onClick={() => onSort(`created_at`)}
                      >
                        Date Updated
                      </TableSortLabel>
                    </TableCell>

                    <TableCell className="tbl-cell text-center">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {warehouseData.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {warehouseSuccess &&
                        [...warehouseData.data].sort(comparator(order, orderBy)).map((data) => (
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

                            <TableCell className="tbl-cell text-weight">{data.warehouse_name}</TableCell>

                            <TableCell className="tbl-cell">{data.warehouse_code}</TableCell>

                            <TableCell className="tbl-cell" align="center">
                              <IconButton size="small" onClick={() => handleViewDepartment(data)}>
                                <Visibility />
                              </IconButton>
                            </TableCell>

                            <TableCell className="tbl-cell text-center">
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
                              {Moment(data.created_at).format("MMM DD, YYYY")}
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
          </Box>

          <CustomTablePagination
            total={warehouseData?.total}
            success={warehouseSuccess}
            current_page={warehouseData?.current_page}
            per_page={warehouseData?.per_page}
            onPageChange={pageHandler}
            onRowsPerPageChange={perPageHandler}
          />
        </Box>
      )}

      <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <TagWarehouseDepartment data={updateWarehouse} />
      </Dialog>
    </Box>
  );
};

export default Warehouse;

// ******************************* PREVIOUS WAREHOUSE *******************************
// const [updateWarehouse, setUpdateWarehouse] = useState({
//   status: false,
//   id: null,
//   sync_id: null,
//   warehouse_name: "",
// });

// const [postWarehouseStatusApi, { isLoading }] = usePostWarehouseStatusApiMutation();

// console.log(warehouseData);

// const onArchiveRestoreHandler = async (id) => {
//   dispatch(
//     openConfirm({
//       icon: status === "active" ? ReportProblem : Help,
//       iconColor: status === "active" ? "alert" : "info",
//       message: (
//         <Box>
//           <Typography> Are you sure you want to</Typography>
//           <Typography
//             sx={{
//               display: "inline-block",
//               color: "secondary.main",
//               fontWeight: "bold",
//               fontFamily: "Raleway",
//             }}
//           >
//             {status === "active" ? "ARCHIVE" : "ACTIVATE"}
//           </Typography>{" "}
//           this data?
//         </Box>
//       ),

//       onConfirm: async () => {
//         try {
//           dispatch(onLoading());
//           const result = await postWarehouseStatusApi({
//             id: id,
//             status: status === "active" ? false : true,
//           }).unwrap();

//           dispatch(
//             openToast({
//               message: result.message,
//               duration: 5000,
//             })
//           );
//           dispatch(closeConfirm());
//         } catch (err) {
//           if (err?.status === 422) {
//             dispatch(
//               openToast({
//                 message: err.data.errors?.detail,
//                 duration: 5000,
//                 variant: "error",
//               })
//             );
//           } else if (err?.status !== 422) {
//             dispatch(
//               openToast({
//                 message: "Something went wrong. Please try again.",
//                 duration: 5000,
//                 variant: "error",
//               })
//             );
//           }
//         }
//       },
//     })
//   );
// };

// const onUpdateHandler = (props) => {
//   const { id, warehouse_name, sync_id, location } = props;
//   setUpdateWarehouse({
//     status: true,
//     id: id,
//     sync_id: sync_id,
//     location: location,
//     warehouse_name: warehouse_name,
//   });
// };

// const onUpdateResetHandler = () => {
//   setUpdateWarehouse({
//     status: false,
//     id: null,
//     sync_id: [],
//     location_id: [],
//     warehouse_name: "",
//   });
// };

// const onViewDepartmentHandler = (props) => {
//   const { id, warehouse_name, sync_id } = props;
//   setUpdateWarehouse({
//     status: true,
//     action: "view",
//     id: id,
//     sync_id: sync_id,
//     warehouse_name: warehouse_name,
//   });
// };

//****************RETURN************************ */

{
  /* <TableCell className="tbl-cell">Action</TableCell> */
}

{
  /* <TableCell className="tbl-cell ">
                              <ActionMenu
                                status={status}
                                data={data}
                                onUpdateHandler={onUpdateHandler}
                                onArchiveRestoreHandler={onArchiveRestoreHandler}
                              />
                            </TableCell> */
}

{
  /* <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <AddWarehouse data={updateWarehouse} refetch={refetch} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog> */
}
