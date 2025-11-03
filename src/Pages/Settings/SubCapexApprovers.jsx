import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteSubCapexApproversApiMutation,
  useGetSubCapexApproversApiQuery,
  usePostSubCapexApproversApiMutation,
} from "../../Redux/Query/Settings/SubCapex";
import { openDrawer } from "../../Redux/StateManagement/booleanStateSlice";
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
import AddSubCapexApprovers from "./AddEdit/AddSubCapexApprovers";

const SubCapexApprovers = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [updateSubCapexApprovers, setUpdateSubCapexApprovers] = useState({
    status: false,
    id: null,
    one_charging_id: null,
    requester_id: null,
    approver_id: [],
  });

  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.booleanState.drawer);

  const {
    data: subCapexApproversData,
    isLoading: subCapexApproversLoading,
    isSuccess: subCapexApproversSuccess,
    isError: subCapexApproversError,
    error: errorData,
    refetch,
  } = useGetSubCapexApproversApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [postSubCapexApproversStatusApi, { isLoading: isStatusLoading }] = usePostSubCapexApproversApiMutation();

  const [deleteSubCapexApproversApi, { isLoading }] = useDeleteSubCapexApproversApiMutation();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const onUpdateHandler = (props) => {
    const { id, unit, subunit, approvers, one_charging } = props;
    setUpdateSubCapexApprovers({
      status: true,
      action: "update",
      one_charging,
      unit,
      subunit,
      approvers,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateSubCapexApprovers({
      status: false,
      one_charging_id: null,
      unit_id: null,
      subunit_id: null,
      approvers: [],
    });
  };

  const onViewHandler = (props) => {
    const { unit, subunit, approvers, one_charging } = props;
    setUpdateSubCapexApprovers({
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
            const result = await postSubCapexApproversStatusApi({
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
            let result = await deleteSubCapexApproversApi({ one_charging_id: id }).unwrap();

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
      {subCapexApproversLoading && <MasterlistSkeleton category={true} onAdd={true} />}
      {subCapexApproversError && <ErrorFetching refetch={refetch} category={subCapexApproversData} error={errorData} />}
      {subCapexApproversData && !subCapexApproversError && (
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
                    {subCapexApproversData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {subCapexApproversSuccess &&
                          subCapexApproversData?.data.map((data, index) => (
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
              total={subCapexApproversData?.total}
              success={subCapexApproversSuccess}
              current_page={subCapexApproversData?.current_page}
              per_page={subCapexApproversData?.per_page}
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
        <AddSubCapexApprovers data={updateSubCapexApprovers} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>
    </>
  );
};

export default SubCapexApprovers;
