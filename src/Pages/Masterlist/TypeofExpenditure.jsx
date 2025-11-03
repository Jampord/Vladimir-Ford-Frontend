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
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  useGetTypeOfExpenditureApiQuery,
  usePatchTypeOfExpenditureStatusApiMutation,
} from "../../Redux/Query/Masterlist/TypeofExpenditure";
import { useState } from "react";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { useDispatch, useSelector } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { AddBox, Help, More, ReportProblem, Visibility } from "@mui/icons-material";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import AddTypeofExpenditure from "./AddEdit/AddTypeofExpenditure";
import {
  closeDialog,
  closeDialog1,
  openDialog,
  openDialog1,
  openDrawer,
} from "../../Redux/StateManagement/booleanStateSlice";
import TypeOfExpenditureViewUsers from "./Capex/TypeOfExpenditureViewUsers";

const TypeofExpenditure = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [updateTypeOfExpenditure, setUpdateTypeOfExpenditure] = useState({});

  const dispatch = useDispatch();
  const drawer = useSelector((state) => state.booleanState.drawer);
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const {
    data: typeOfExpenditureData,
    isLoading: typeOfExpenditureLoading,
    isFetching: typeOfExpenditureFetching,
    isSuccess: typeOfExpenditureSuccess,
    isError: typeOfExpenditureError,
    error: errorData,
    refetch: refetch,
  } = useGetTypeOfExpenditureApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [patchTypeOfExpenditureStatusApi, { isLoading }] = usePatchTypeOfExpenditureStatusApiMutation();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleClick = () => {
    dispatch(openDrawer());
  };

  const handleViewUsers = (users) => {
    setTaggedUsers(users);
    dispatch(openDialog1());
  };

  const onUpdateHandler = (props) => {
    const { id, name, users } = props;
    setUpdateTypeOfExpenditure({
      id: id,
      name: name,
      users: users,
      status: true,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateTypeOfExpenditure({
      id: "",
      name: "",
      users: [],
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
            const result = await patchTypeOfExpenditureStatusApi({
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
        Type of Expenditure
      </Typography>

      {typeOfExpenditureLoading && <MasterlistSkeleton onAdd={true} />}
      {typeOfExpenditureError && <ErrorFetching refetch={refetch} error={errorData} />}
      {typeOfExpenditureData && !typeOfExpenditureError && (
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
                    <TableCell className="tbl-cell tr-cen-pad45">Type of Expenditure</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Estimators</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {typeOfExpenditureData.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {typeOfExpenditureSuccess &&
                        typeOfExpenditureData.data.map((data) => (
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

                            <TableCell className="tbl-cell text-weight tr-cen-pad45">{data.name}</TableCell>

                            <TableCell className="tbl-cell text-weight tr-cen-pad45">
                              <IconButton onClick={() => handleViewUsers(data?.users)}>
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
              total={typeOfExpenditureData?.total}
              success={typeOfExpenditureSuccess}
              current_page={typeOfExpenditureData?.current_page}
              per_page={typeOfExpenditureData?.per_page}
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
        <AddTypeofExpenditure data={updateTypeOfExpenditure} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>

      <Dialog
        open={dialog1}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "20px", overflowX: "hidden" } }}
        maxWidth="xs"
        fullWidth
        onClose={() => dispatch(closeDialog1())}
      >
        <TypeOfExpenditureViewUsers taggedUsers={taggedUsers} />
      </Dialog>
    </Box>
  );
};

export default TypeofExpenditure;
