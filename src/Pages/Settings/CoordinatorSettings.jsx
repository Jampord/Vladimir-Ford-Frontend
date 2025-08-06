import { useState } from "react";
import {
  useGetCoordinatorSettingsApiQuery,
  useLazyGetSingleCoordinatorSettingApiQuery,
  usePatchArchiveCoordinatorSettingsApiMutation,
} from "../../Redux/Query/Settings/CoordinatorSettings";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ErrorFetching from "../ErrorFetching";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import { AddToPhotos, Close, Help, ManageAccounts, Report, ReportProblem, Visibility } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, closeDialog1, openDialog, openDialog1 } from "../../Redux/StateManagement/booleanStateSlice";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import AddCoordinatorSettings from "./AddEdit/AddCoordinatorSettings";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import NoRecordsFound from "../../Layout/NoRecordsFound";

const CoordinatorSettings = () => {
  const [page, setPage] = useState("1");
  const [perPage, setPerPage] = useState("5");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [coordinatorHandlesData, setCoordinatorHandlesData] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const actionMenuData = useSelector((state) => state.actionMenu.actionData);
  console.log("action", actionMenuData);

  const dialog = useSelector((state) => state.booleanState.dialog);
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: coordinatorSettingsData,
    isLoading: coordinatorSettingsLoading,
    isSuccess: coordinatorSettingsSuccess,
    isError: coordinatorSettingsError,
    isFetching: coordinatorSettingsFetching,
    error: errorData,
    refetch,
  } = useGetCoordinatorSettingsApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status === "active" ? 1 : 0,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    coordinatorTrigger,
    {
      data: coordinatorSingleData = [],
      isLoading: isCoordinatorSingleLoading,
      isSuccess: isCoordinatorSingleSuccess,
      isError: isCoordinatorSingleError,
      refetch: isCoordinatorSingleRefetch,
    },
  ] = useLazyGetSingleCoordinatorSettingApiQuery({});

  // console.log("coordinator", coordinatorSettingsData);

  const [patchArchiveCoordinatorSettings] = usePatchArchiveCoordinatorSettingsApiMutation();

  const handleViewData = (data) => {
    dispatch(openDialog());
    setCoordinatorHandlesData(data);
    console.log(coordinatorHandlesData);
  };

  const handleOpenDialog = () => {
    dispatch(openDialog1());
  };

  const onArchiveRestoreHandler = async (id) => {
    console.log(id);
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
            const result = await patchArchiveCoordinatorSettings({
              id: id,
              status: status === "active" ? 0 : 1,
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
        Coordinator Settings
      </Typography>
      {coordinatorSettingsLoading && <MasterlistSkeleton onAdd={true} />}
      {coordinatorSettingsError && <ErrorFetching refetch={refetch} error={errorData} />}
      {coordinatorSettingsData && !coordinatorSettingsError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }}>
              <Button
                onClick={() => handleOpenDialog()}
                variant="contained"
                startIcon={isSmallScreen ? null : <ManageAccounts />}
                size="small"
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : { marginRight: "10px" }}
              >
                {isSmallScreen ? <ManageAccounts color="black" sx={{ fontSize: "20px" }} /> : "Add"}
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
                        Coordinator ID
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Coordinator
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Employee ID
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Status
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Coordinator Information
                      </TableCell>
                      {/* <TableCell className="tbl-cell">Date Created</TableCell> */}
                      <TableCell className="tbl-cell" align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {coordinatorSettingsData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="medium" />
                    ) : coordinatorSettingsFetching ? (
                      <LoadingData />
                    ) : (
                      coordinatorSettingsData?.data.map((item) => (
                        <TableRow key={item?.user.id}>
                          {/* {console.log("item", item)} */}
                          <TableCell className="tbl-cell " align="center">
                            {item?.user?.id}
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            <Typography fontSize={14} fontWeight={600} color="secondary.main">
                              {item.user.first_name}
                            </Typography>
                            <Typography fontSize={12}>{item.user.last_name}</Typography>
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            <Typography fontSize={12} fontWeight={500} color="secondary.main">
                              {item.user.employee_id}
                            </Typography>
                          </TableCell>

                          <TableCell className="tbl-cell text-center">
                            {item.status === 1 ? (
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
                            <Tooltip title="View Coordinator Information" placement="top">
                              <IconButton size="small" onClick={() => handleViewData(item)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          {/* <TableCell className="tbl-cell">{moment(item.created_at).format("MMM. D, YYYY")}</TableCell> */}
                          <TableCell className="tbl-cell" align="center">
                            <ActionMenu
                              status={status}
                              data={item}
                              hideEdit
                              hideArchive
                              // onDeleteHandler={onDeleteHandler}
                              onArchiveRestoreHandler={onArchiveRestoreHandler}
                              onUpdateCoordinatorHandler={coordinatorTrigger}
                              // onResetHandler={onResetHandler}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <CustomTablePagination
              total={coordinatorSettingsData?.total}
              // success={approverSettingsSuccess}
              current_page={coordinatorSettingsData?.current_page}
              per_page={coordinatorSettingsData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", p: 3, maxHeight: "500px" } }}
        maxWidth="md"
      >
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography fontSize={20} fontFamily="Anton" color="secondary">
            Coordinator Information
          </Typography>

          <IconButton sx={{ marginTop: "-10px" }} onClick={() => dispatch(closeDialog())}>
            <Tooltip title="Close" placement="top" arrow>
              <Close />
            </Tooltip>
          </IconButton>
        </Stack>

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
                  One RDF Charging
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Company
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Business Unit
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Department
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Unit
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Subunit
                </TableCell>
                <TableCell className="tbl-cell" align="center">
                  Location
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {coordinatorHandlesData?.handles?.length === 0 ? (
                <NoRecordsFound heightData="medium" />
              ) : (
                coordinatorHandlesData?.handles?.map((item, i) => (
                  <TableRow key={i}>
                    {console.log("item", item)}
                    <TableCell className="tbl-cell " align="center">
                      <Typography
                        fontSize={"11px"}
                        fontWeight={550}
                        color={"primary.main"}
                      >{`(${item.one_charging.code}) - ${item.one_charging.name}`}</Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}> {`(${item.company.code}) - ${item.company.name}`}</Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}>
                        {`(${item.business_unit.code}) - ${item.business_unit.name}`}
                      </Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}>{`(${item.department.code}) - ${item.department.name}`}</Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}> {`(${item.unit.code}) - ${item.unit.name}`}</Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}> {`(${item.subunit.code}) - ${item.subunit.name}`}</Typography>
                    </TableCell>
                    <TableCell className="tbl-cell " align="center">
                      <Typography fontSize={"11px"}>{`(${item.location.code}) - ${item.location.name}`}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Dialog>

      <Dialog
        open={dialog1}
        TransitionComponent={Grow}
        // onClose={() => dispatch(closeDialog1())}
        PaperProps={{ sx: { maxWidth: "1200px", minWidth: "700px", borderRadius: "10px", p: 3 } }}
      >
        <AddCoordinatorSettings data={actionMenuData} />
      </Dialog>
    </Box>
  );
};

export default CoordinatorSettings;
