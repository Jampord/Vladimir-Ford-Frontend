import React, { useState } from "react";
import {
  useDeleteAssetTransferPulloutApiMutation,
  useGetAssetTransferPulloutApiQuery,
  usePostAssetTransferPulloutApiMutation,
} from "../../Redux/Query/Settings/AssetTransferPullout";
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../Redux/StateManagement/toastSlice";
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
import { Report, Visibility } from "@mui/icons-material";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../Components/Reusable/ActionMenu";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import moment from "moment";
import { openDrawer } from "../../Redux/StateManagement/booleanStateSlice";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import AddAssetTransferPullout from "./AddEdit/AddAssetTransferPullout";
import NoRecordsFound from "../../Layout/NoRecordsFound";

const AssetTransferPullout = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [updateAssetTransferPullout, setUpdateAssetTransferPullout] = useState({
    status: false,
    id: null,
    one_charging_id: null,
    requester_id: null,
    approver_id: [],
  });

  const drawer = useSelector((state) => state.booleanState.drawer);
  const dispatch = useDispatch();

  const {
    data: assetTransferPulloutData,
    isLoading: assetTransferPulloutLoading,
    isSuccess: assetTransferPulloutSuccess,
    isError: assetTransferPulloutError,
    isFetching: assetTransferPulloutFetching,
    error: errorData,
    refetch,
  } = useGetAssetTransferPulloutApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  console.log("assetTransferPulloutData", assetTransferPulloutData);

  const [deleteAssetTransferPulloutApi, { isLoading }] = useDeleteAssetTransferPulloutApiMutation();

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
            let result = await deleteAssetTransferPulloutApi({ one_charging_id: id }).unwrap();
            // console.log(result);
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

  const onUpdateHandler = (props) => {
    const { id, unit, subunit, approvers, one_charging } = props;
    setUpdateAssetTransferPullout({
      status: true,
      action: "update",
      one_charging,
      unit,
      subunit,
      approvers,
    });
  };

  const onUpdateResetHandler = () => {
    setUpdateAssetTransferPullout({
      status: false,
      // action: "view",
      one_charging_id: null,
      unit_id: null,
      subunit_id: null,
      approvers: [],
    });
  };

  const onViewHandler = (props) => {
    const { unit, subunit, approvers, one_charging } = props;
    console.log("view", props);
    setUpdateAssetTransferPullout({
      status: true,
      action: "view",
      one_charging,
      unit,
      subunit,
      approvers,
    });
  };

  const handleViewApprovers = (data) => {
    console.log("data", data);
    onViewHandler(data);
    dispatch(openDrawer());
    dispatch(closeConfirm());
  };

  return (
    <>
      {assetTransferPulloutLoading && <MasterlistSkeleton category={true} onAdd={true} />}
      {assetTransferPulloutError && (
        <ErrorFetching refetch={refetch} category={assetTransferPulloutData} error={errorData} />
      )}
      {assetTransferPulloutData && !assetTransferPulloutError && (
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

                      <TableCell className="tbl-cell text-center">Date Created</TableCell>

                      <TableCell className="tbl-cell">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {assetTransferPulloutData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {assetTransferPulloutFetching ? (
                          <LoadingData />
                        ) : (
                          assetTransferPulloutSuccess &&
                          [...assetTransferPulloutData?.data]?.map((data, index) => (
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
                                  onDeleteHandler={onDeleteHandler}
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
          </Box>
        </>
      )}

      <Dialog
        open={drawer}
        TransitionComponent={Grow}
        PaperProps={{
          sx: { borderRadius: "10px", maxWidth: "1300px", width: "40%", minWidth: "300px", maxHeight: "90vh" },
        }}
      >
        <AddAssetTransferPullout data={updateAssetTransferPullout} onUpdateResetHandler={onUpdateResetHandler} />
      </Dialog>
    </>
  );
};

export default AssetTransferPullout;
