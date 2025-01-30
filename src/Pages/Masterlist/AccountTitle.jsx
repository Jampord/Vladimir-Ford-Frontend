import React, { useEffect, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ErrorFetching from "../ErrorFetching";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";

import { openConfirm, closeConfirm, onLoading } from "../../Redux/StateManagement/confirmSlice";

// MUI
import {
  Autocomplete,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Close, Help, ReportProblem, Visibility } from "@mui/icons-material";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { useLazyGetYmirAccountTitleAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/YmirApi";
import {
  useGetAccountTitleApiQuery,
  usePatchAccountTitleStatusApiMutation,
  usePostAccountTitleApiMutation,
} from "../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import CustomAutoComplete from "../../Components/Reusable/CustomAutoComplete";
import TagAccountTitleDepDebit from "./AddEdit/TagAccountTitleDepDebit";

const AccountTitle = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [accountTitleData, setAccountTitleData] = useState([]);

  const [open, setOpen] = useState(false);
  const [dialogData, setDialogData] = useState();

  const drawer = useSelector((state) => state.booleanState.drawer);

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
      data: ymirAccountTitleApi,
      isLoading: ymirAccountTitleApiLoading,
      isSuccess: ymirAccountTitleApiSuccess,
      isFetching: ymirAccountTitleApiFetching,
      isError: ymirAccountTitleApiError,
      refetch: ymirAccountTitleApiRefetch,
    },
  ] = useLazyGetYmirAccountTitleAllApiQuery();

  const {
    data: accountTitleApiData,
    isLoading: accountTitleApiLoading,
    isSuccess: accountTitleApiSuccess,
    isFetching: accountTitleApiFetching,
    isError: accountTitleApiError,
    error: errorData,
    refetch: accountTitleApiRefetch,
  } = useGetAccountTitleApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    postAccountTitle,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostAccountTitleApiMutation();

  const [patchAccountTitleStatus, { isLoading }] = usePatchAccountTitleStatusApiMutation();

  useEffect(() => {
    if (ymirAccountTitleApiSuccess) {
      postAccountTitle(ymirAccountTitleApi);
    }
  }, [ymirAccountTitleApiSuccess, ymirAccountTitleApiFetching]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isPostSuccess) {
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
      dispatch(closeConfirm());
    }
  }, [isPostSuccess]);

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
            const result = await patchAccountTitleStatus({
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
            accountTitleApiRefetch();
          } catch (err) {
            console.log(err.message);
          }
        },
      })
    );
  };

  useEffect(() => {
    if (isPostError && postError?.status === 404) {
      dispatch(
        openToast({
          message: "Data Not Found.",
          duration: 5000,
          variant: "error",
        })
      );
    } else if (isPostError) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  const onSetPage = () => {
    setPage(1);
  };

  const handleViewDialog = (data) => {
    setOpen(true);
    setDialogData(data);
    console.log(dialogData);
    console.log(open);
  };

  const onUpdateHandler = (props) => {
    const { sync_id, account_title_name, depreciation_debit } = props;
    setAccountTitleData({
      status: true,
      sync_id: sync_id,
      depreciation_debit: depreciation_debit,
      account_title_name: account_title_name,
    });
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Account Title
      </Typography>
      {accountTitleApiLoading && <MasterlistSkeleton onSync={true} />}
      {accountTitleApiError && <ErrorFetching refetch={accountTitleApiRefetch} error={errorData} />}
      {accountTitleApiData && !accountTitleApiError && (
        <>
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
                          active={orderBy === `account_title_code`}
                          direction={orderBy === `account_title_code` ? order : `asc`}
                          onClick={() => onSort(`account_title_code`)}
                        >
                          Account Title Code
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `account_title_name`}
                          direction={orderBy === `account_title_name` ? order : `asc`}
                          onClick={() => onSort(`account_title_name`)}
                        >
                          Account Title Name
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell text-center">View Information</TableCell>

                      <TableCell className="tbl-cell text-center">Status</TableCell>

                      <TableCell className="tbl-cell text-center">
                        <TableSortLabel
                          active={orderBy === `updated_at`}
                          direction={orderBy === `updated_at` ? order : `asc`}
                          onClick={() => onSort(`updated_at`)}
                        >
                          Date Updated
                        </TableSortLabel>
                      </TableCell>

                      <TableCell className="tbl-cell text-center">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {accountTitleApiData.data.length === 0 ? (
                      <NoRecordsFound heightData="medium" />
                    ) : (
                      <>
                        {accountTitleApiSuccess &&
                          [...accountTitleApiData.data].sort(comparator(order, orderBy))?.map((data) => (
                            <TableRow
                              key={data.id}
                              hover={true}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell tr-cen-pad45 tbl-coa">{data.id}</TableCell>

                              <TableCell className="tbl-cell">{data.account_title_code}</TableCell>

                              <TableCell className="tbl-cell">{data.account_title_name}</TableCell>

                              <TableCell className="tbl-cell" align="center">
                                <Tooltip title="View Account Title Information" placement="top" arrow>
                                  <IconButton onClick={() => handleViewDialog(data)}>
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
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
                                {Moment(data.updated_at).format("MMM DD, YYYY")}
                              </TableCell>

                              <TableCell className="tbl-cell text-center">
                                <ActionMenu data={data} onUpdateHandler={onUpdateHandler} />
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
              total={accountTitleApiData?.total}
              success={accountTitleApiSuccess}
              current_page={accountTitleApiData?.current_page}
              per_page={accountTitleApiData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </>
      )}
      <Dialog
        open={open}
        TransitionComponent={Grow}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <Box className="add-masterlist">
          {/* <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", top: 10, right: 10 }}>
            <Close />
          </IconButton> */}
          <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
            View Account Title
          </Typography>

          {dialogData?.depreciation_debit?.length ? (
            <Autocomplete
              multiple
              id="tags-readOnly"
              options={accountTitleApiData?.data}
              defaultValue={dialogData?.depreciation_debit || null}
              getOptionLabel={(option) => option.account_title_code + " - " + option.account_title_name}
              readOnly
              freeSolo
              fullWidth
              // disabled
              renderInput={(params) => <TextField {...params} color="secondary" label="Depreciation Debit" />}
              sx={{ ".MuiInputBase-root": { borderRadius: "10px" } }}
            />
          ) : (
            <>
              <NoRecordsFound size="small" />
            </>
          )}
          <Button variant="contained" color="secondary" size="small" onClick={() => setOpen(false)} fullWidth>
            Close
          </Button>
        </Box>
      </Dialog>

      <Dialog open={drawer} TransitionComponent={Grow} PaperProps={{ sx: { borderRadius: "10px" } }}>
        <TagAccountTitleDepDebit data={accountTitleData} />
      </Dialog>
    </Box>
  );
};

export default AccountTitle;
