import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteAdditionalCostApproversApiMutation,
  useGetAdditionalCostApproversApiQuery,
  usePostAdditionalCostApproversApiMutation,
} from "../../Redux/Query/Settings/AdditionalCost";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { Help, Report, ReportProblem, Visibility } from "@mui/icons-material";
import {
  Box,
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
} from "@mui/material";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AddAdditionalCostApprovers from "./AddEdit/AddAdditionalCostApprovers";

const AdditionalCostApprovers = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [updateAdditionalCostApprovers, setUpdateAdditionalCostApprovers] = useState({
    status: false,
    id: null,
    one_charging_id: null,
    requester_id: null,
    approver_id: [],
  });

  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.booleanState.drawer);

  const {
    data: additionalCostApproversData,
    isLoading: additionalCostApproversLoading,
    isSuccess: additionalCostApproversSuccess,
    isError: additionalCostApproversError,
    error: errorData,
    refetch,
  } = useGetAdditionalCostApproversApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [postAdditionalCostApproversStatusApi, { isLoading: isStatusLoading }] =
    usePostAdditionalCostApproversApiMutation();

  const [deleteAdditionalCostApproversApi, { isLoading }] = useDeleteAdditionalCostApproversApiMutation();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const onUpdateHandler = (props) => {
    const { id, unit, subunit, approvers, one_charging } = props;
    setUpdateAdditionalCostApprovers({
      status: true,
      action: "update",
      one_charging,
      unit,
      subunit,
      approvers,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateAdditionalCostApprovers({
      status: false,
      one_charging_id: null,
      unit_id: null,
      subunit_id: null,
      approvers: [],
    });
  };

  const onViewHandler = (props) => {
    const { unit, subunit, approvers, one_charging } = props;
    setUpdateAdditionalCostApprovers({
      status: true,
      action: "view",
      one_charging,
      unit,
      subunit,
      approvers,
    });
  };

  const handleViewApprovers = (data) => {
    onViewHandler(data);
    dispatch(openDrawer());
    dispatch(closeConfirm());
  };

  const onArchiveRestoreHandler = async (id, action = "update") => {
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
            const result = await postAdditionalCostApproversStatusApi({
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

  const onDeleteHandler = async (id) => {
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
              DELETE
            </Typography>{" "}
            this Data?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            let result = await deleteAdditionalCostApproversApi({ one_charging_id: id }).unwrap();

            setPage(1);
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
    <>
      {additionalCostApproversLoading && <MasterlistSkeleton category={true} onAdd={true} />}
      {additionalCostApproversError && (
        <ErrorFetching refetch={refetch} category={additionalCostApproversData} error={errorData} />
      )}
      {additionalCostApproversData && !additionalCostApproversError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar
              path="#"
              onStatusChange={setStatus}
              onSearchChange={setSearch}
              onSetPage={setPage}
              onAdd={() => {}}
              hideArchive={true}
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
                      <TableCell className="tbl-cell">Index</TableCell>
                      <TableCell className="tbl-cell">One Charging</TableCell>

                      <TableCell align="center" className="tbl-cell">
                        Approvers
                      </TableCell>

                      <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>

                      <TableCell className="tbl-cell">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {additionalCostApproversData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {additionalCostApproversSuccess &&
                          additionalCostApproversData?.data.map((data, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell capitalized">{index + 1}</TableCell>
                              <TableCell className="tbl-cell capitalized">
                                <Typography fontSize={12} fontWeight={570} color="secondary">
                                  {`(${data?.one_charging?.code})`} - {data?.one_charging?.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" className="tbl-cell text-weight capitalized">
                                <Tooltip title="View Role" placement="top" arrow>
                                  <IconButton size="small" onClick={() => handleViewApprovers(data)}>
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>

                              <TableCell className="tbl-cell tr-cen-pad45">
                                {moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>

                              <TableCell className="tbl-cell ">
                                <ActionMenu
                                  status={status}
                                  data={data}
                                  hideArchive={true}
                                  showDelete={true}
                                  onUpdateHandler={onUpdateHandler}
                                  onArchiveRestoreHandler={onArchiveRestoreHandler}
                                  onDeleteHandler={onDeleteHandler}
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
              total={additionalCostApproversData?.total}
              success={additionalCostApproversSuccess}
              current_page={additionalCostApproversData?.current_page}
              per_page={additionalCostApproversData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </>
      )}

      <Dialog
        open={drawer}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "1300px", width: "40%", minWidth: "300px" } }}
      >
        <AddAdditionalCostApprovers data={updateAdditionalCostApprovers} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>
    </>
  );
};

export default AdditionalCostApprovers;
