import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useArchiveReceiverSettingsApiMutation,
  useGetReceiverSettingsApiQuery,
} from "../../Redux/Query/Settings/ReceiverSettings";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import {
  Box,
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
} from "@mui/material";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import { Help, ReportProblem } from "@mui/icons-material";
import AddReceiverSettings from "./AddEdit/AddReceiverSettings";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

const ReceiverSettings = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.booleanState.drawer);

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: receiverSettingsData,
    isLoading: receiverSettingsLoading,
    isSuccess: receiverSettingsSuccess,
    isError: receiverSettingsError,
    isFetching: receiverSettingsFetching,
    error: errorData,
    refetch,
  } = useGetReceiverSettingsApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [archiveReceiverSettings] = useArchiveReceiverSettingsApiMutation();

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
            const result = await archiveReceiverSettings({
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
        Receiver Settings
      </Typography>

      {receiverSettingsLoading && <MasterlistSkeleton onAdd={true} />}
      {receiverSettingsError && <ErrorFetching refetch={refetch} error={errorData} />}
      {receiverSettingsData && !receiverSettingsError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar
              path="#"
              onStatusChange={setStatus}
              onSearchChange={setSearch}
              onSetPage={setPage}
              onAddReceiver={() => {}}
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
                      <TableCell className="tbl-cell">Id</TableCell>
                      <TableCell className="tbl-cell">Receiver</TableCell>
                      <TableCell className="tbl-cell text-center">Status</TableCell>
                      <TableCell className="tbl-cell " align="center">
                        Date Created
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receiverSettingsData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="medium" />
                    ) : (
                      <>
                        {receiverSettingsFetching ? (
                          <LoadingData />
                        ) : (
                          receiverSettingsSuccess &&
                          [...receiverSettingsData?.data].map((item) => (
                            <TableRow
                              key={item.id}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell">{item.id}</TableCell>

                              <TableCell className="tbl-cell text-weight">
                                {item.user?.firstname} {item.user?.lastname}
                                <Typography
                                  fontSize={12}
                                  fontWeight={400}
                                  color="secondary.light"
                                >{`${item.department?.department_code} - ${item.department?.department_name}`}</Typography>
                              </TableCell>

                              <TableCell className="tbl-cell text-center">
                                {item.is_active === 1 ? (
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

                              <TableCell className="tbl-cell" align="center">
                                {moment(item.created_at).format("MMM DD, YYYY")}
                              </TableCell>

                              {console.log("item", item)}

                              <TableCell className="tbl-cell " align="center">
                                <ActionMenu
                                  status={status}
                                  data={item}
                                  hideEdit={true}
                                  receiverSettings
                                  onArchiveRestoreHandler={onArchiveRestoreHandler}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box className="mcontainer__pagination-export" justifyContent="flex-end">
              <CustomTablePagination
                total={receiverSettingsData?.total}
                success={receiverSettingsSuccess}
                current_page={receiverSettingsData?.current_page}
                per_page={receiverSettingsData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </>
      )}

      <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <AddReceiverSettings />
      </Dialog>
    </Box>
  );
};

export default ReceiverSettings;
