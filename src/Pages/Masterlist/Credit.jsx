import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import { useGetCreditQuery, usePostCreditApiMutation } from "../../Redux/Query/Masterlist/YmirCoa/Credit";
import { useLazyGetCreditAllYmirQuery } from "../../Redux/Query/Masterlist/YmirCoa/YmirApi";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { Help } from "@mui/icons-material";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import moment from "moment";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

const Credit = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();

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
      data: ymirCreditApi,
      isLoading: ymirCreditApiLoading,
      isSuccess: ymirCreditApiSuccess,
      isFetching: ymirCreditApiFetching,
      isError: ymirCreditApiError,

      refetch: ymirCreditApiRefetch,
    },
  ] = useLazyGetCreditAllYmirQuery();

  const {
    data: creditData,
    isLoading: creditLoading,
    isSuccess: creditSuccess,
    isError: creditError,
    error: errorData,
    refetch: creditApiRefetch,
  } = useGetCreditQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  console.log("creditData: ", creditData);

  const [
    postCredit,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostCreditApiMutation();

  useEffect(() => {
    if (ymirCreditApiSuccess) {
      postCredit(ymirCreditApi);
    }
  }, [ymirCreditApiSuccess, ymirCreditApiFetching]);

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
            creditApiRefetch();
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

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Credit
      </Typography>

      <Box className="mcontainer__wrapper">
        <MasterlistToolbar
          path="#"
          onStatusChange={setStatus}
          onSearchChange={setSearch}
          onSetPage={setPage}
          onSyncHandler={onSyncHandler}
          onSync={() => {}}
          hideArchive
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
                  <TableCell className="tbl-cell " align="center">
                    ID No.
                  </TableCell>
                  <TableCell className="tbl-cell text-center">Credit Name</TableCell>
                  <TableCell className="tbl-cell text-center">Credit Code</TableCell>
                  <TableCell className="tbl-cell text-center">Status</TableCell>
                  <TableCell className="tbl-cell text-center">Date Updated</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {creditData?.data.length === 0 ? (
                  <NoRecordsFound heightData="medium" />
                ) : (
                  <>
                    {creditSuccess &&
                      [...creditData?.data].map((data) => (
                        <TableRow
                          key={data.id}
                          hover={true}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell className="tbl-cell tr-cen-pad45  tbl-coa " align="center">
                            {" "}
                            {data?.id}
                          </TableCell>
                          <TableCell className="tbl-cell text-weight" align="center">
                            {data?.credit_name}
                          </TableCell>
                          <TableCell className="tbl-cell text-center"> {data?.credit_code}</TableCell>
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
                          <TableCell className="tbl-cell text-center">
                            {" "}
                            {moment(data.updated_at).format("MMM DD, YYYY")}
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
          total={creditData?.total}
          success={creditSuccess}
          current_page={creditData?.current_page}
          per_page={creditData?.per_page}
          onPageChange={pageHandler}
          onRowsPerPageChange={perPageHandler}
        />
      </Box>
    </Box>
  );
};

export default Credit;
