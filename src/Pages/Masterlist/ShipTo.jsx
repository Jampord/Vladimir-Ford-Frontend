import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useGetShipToApiQuery, usePostShipToApiMutation } from "../../Redux/Query/Masterlist/YmirCoa/ShipTo";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import { useLazyGetYmirShipToAllApiQuery } from "../../Redux/Query/Masterlist/YmirCoa/YmirApi";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { Help } from "@mui/icons-material";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { useDispatch } from "react-redux";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

const ShipTo = () => {
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
      data: ymirShipToApi,
      isLoading: ymirShipToApiLoading,
      isSuccess: ymirShipToApiSuccess,
      isFetching: ymirShipToApiFetching,
      isError: ymirShipToApiError,

      refetch: ymirShipToApiRefetch,
    },
  ] = useLazyGetYmirShipToAllApiQuery();

  const {
    data: shipToApiData,
    isLoading: shipToApiLoading,
    isSuccess: shipToApiSuccess,
    isFetching: shipToApiFetching,
    isError: shipToApiError,
    error: errorData,
    refetch: shipToApiRefetch,
  } = useGetShipToApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [
    postShipTo,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostShipToApiMutation();

  useEffect(() => {
    if (ymirShipToApiSuccess) {
      postShipTo(ymirShipToApi);
    }
  }, [ymirShipToApiSuccess, ymirShipToApiFetching]);

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
            // shipToApiRefetch();
            dispatch(
              openToast({
                message: postData?.message,
                duration: 5000,
              })
            );
            dispatch(closeConfirm());
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
        Ship To
      </Typography>

      {shipToApiLoading && <MasterlistSkeleton onSync={true} />}
      {shipToApiError && <ErrorFetching refetch={shipToApiRefetch} error={errorData} />}
      {shipToApiData && !shipToApiError && (
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
                    <TableCell className="tbl-cell text-center">ID No.</TableCell>
                    <TableCell className="tbl-cell text-center">Location</TableCell>
                    <TableCell className="tbl-cell text-center">Address</TableCell>
                    <TableCell className="tbl-cell text-center">Status</TableCell>
                    <TableCell className="tbl-cell text-center">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {shipToApiData?.data?.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {shipToApiSuccess &&
                        shipToApiData?.data?.map((data) => (
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

                            <TableCell className="tbl-cell text-center">{data.location}</TableCell>

                            <TableCell className="tbl-cell text-center">{data.address}</TableCell>

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
                              {moment(data.created_at).format("MMM DD, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomTablePagination
              total={shipToApiData?.total}
              success={shipToApiSuccess}
              current_page={shipToApiData?.current_page}
              per_page={shipToApiData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShipTo;
