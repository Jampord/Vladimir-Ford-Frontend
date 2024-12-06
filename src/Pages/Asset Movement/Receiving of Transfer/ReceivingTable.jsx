import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useGetTransferReceiverApiQuery,
  usePatchTransferReceivingApiMutation,
} from "../../../Redux/Query/Movement/Transfer";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import Moment from "moment";
import { useNavigate } from "react-router-dom";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MoveDownOutlined, Warning } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  transfer_ids: yup.array(),
});
const ReceivingTable = ({ received }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: receivingData,
    isLoading: receivingLoading,
    isSuccess: receivingSuccess,
    isError: receivingError,
    error: errorData,
    refetch,
  } = useGetTransferReceiverApiQuery(
    {
      page: page,
      per_page: perPage,
      status: received ? "Received" : "To Receive",
    },
    { refetchOnMountOrArgChange: true }
  );

  const [receiveTransferApi, { isLoading: isPatchLoading }] = usePatchTransferReceivingApiMutation();

  const handleTableData = (data) => {
    navigate(`/asset-movement/transfer-receiving/${data.vladimir_tag_number}`, {
      state: { ...data, status },
    });
  };

  const { register, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      transfer_ids: [],
    },
  });

  const transferIdsAllHandler = (checked) => {
    if (checked) {
      setValue(
        "transfer_ids",
        receivingData.data?.map((item) => item?.id.toString())
      );
    } else {
      reset({ transfer_ids: [] });
    }
  };

  // console.log("transfer_ids: ", watch("transfer_ids"));

  // * Validation for Receiving
  const handleSelectedItems =
    receivingData?.data?.filter((item) => watch("transfer_ids").includes(item.id.toString())).length === 0;

  // const tagData = handleSelectedItems?.every((item) => item?.accountability === "Common");

  const validateSelectedItems = () => {
    if (handleSelectedItems) {
      return true;
    }
    return false;
  };
  // * -------------------------------------------------------------------

  const handleReceive = () => {
    console.log({ transfer_ids: watch("transfer_ids").map(Number) });
    dispatch(
      openConfirm({
        icon: Warning,
        iconColor: "warning",
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
              RECEIVE
            </Typography>{" "}
            this
            {watch("transfer_ids").length >= 1 ? " request" : " requests"}
            ?
            <Autocomplete
              multiple
              id="assets-readOnly"
              options={receivingData?.data
                ?.filter((item) => watch("transfer_ids").includes(item.id.toString()))
                .map((option) => option.vladimir_tag_number + " - " + option.description)}
              value={receivingData?.data
                ?.filter((item) => watch("transfer_ids").includes(item.id.toString()))
                .map((item) => item.vladimir_tag_number + " - " + item.description)}
              readOnly
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`To be Received ${watch("transfer_ids").length >= 1 ? " Asset" : " Assets"}`}
                />
              )}
              sx={{ mt: "15px" }}
            />
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await receiveTransferApi({ transfer_ids: watch("transfer_ids").map(Number) }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
          } catch (err) {
            console.log("err", err);
            if (err?.status === 404) {
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
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
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {receivingLoading && <MasterlistSkeleton onAdd={true} category />}
      {receivingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {receivingData && !receivingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            {!received && (
              <Button
                variant="contained"
                onClick={handleReceive}
                size="small"
                startIcon={<MoveDownOutlined />}
                sx={{ position: "absolute", right: 0, top: -40 }}
                disabled={!watch("transfer_ids") || validateSelectedItems()}
              >
                Receive
              </Button>
            )}
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
                      {!received && (
                        <TableCell className="tbl-cell">
                          {" "}
                          <Tooltip title="Select All" placement="top" arrow>
                            <FormControlLabel
                              sx={{ margin: "auto", align: "center" }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={
                                    !!receivingData?.data
                                      ?.map((mapItem) => mapItem?.id.toString())
                                      ?.every((item) => watch("transfer_ids").includes(item))
                                  }
                                />
                              }
                              onChange={(e) => {
                                transferIdsAllHandler(e.target.checked);
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell className="tbl-cell">Request #</TableCell>
                      <TableCell className="tbl-cell">Vladimir Tag #</TableCell>
                      <TableCell className="tbl-cell">New Custodian</TableCell>
                      <TableCell className="tbl-cell">COA (New Custodian)</TableCell>
                      <TableCell className="tbl-cell">Asset Status</TableCell>
                      <TableCell className="tbl-cell">Date Requested</TableCell>
                      {/* <TableCell className="tbl-cell">Action</TableCell> */}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receivingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {receivingSuccess &&
                          [...receivingData?.data].map((data) => (
                            <TableRow
                              key={data.id}
                              hover
                              onClick={() => handleTableData(data)}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                cursor: "pointer",
                              }}
                            >
                              {!received && (
                                <TableCell className="tbl-cell" onClick={(e) => e.stopPropagation()}>
                                  <FormControlLabel
                                    value={data.id.toString()}
                                    sx={{ margin: "auto" }}
                                    // disabled={data.action === "view"}
                                    control={
                                      <Checkbox
                                        size="small"
                                        {...register("transfer_ids")}
                                        checked={watch("transfer_ids").includes(data.id.toString())}
                                      />
                                    }
                                  />
                                </TableCell>
                              )}
                              <TableCell className="tbl-cell">
                                <Chip
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    color: "white",
                                    font: "bold 12px Roboto",
                                    backgroundColor: "quaternary.light",
                                  }}
                                  label={data.id}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.vladimir_tag_number}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.accountable}
                                </Typography>

                                <Typography fontSize={13} fontWeight={400} color="secondary.main">
                                  {data?.accountability}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={10} color="gray">
                                  ({data.company_code}) - {data.company}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.business_unit_code}) - ${data.business_unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.department_code}) - ${data?.department}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.unit_code}) - ${data?.unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.sub_unit_code}) - ${data?.sub_unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.location_code}) - {data?.location}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <FaStatusChange faStatus={data?.status} data={data?.status} />
                              </TableCell>
                              <TableCell className="tbl-cell">{Moment(data?.created_at).format("LL")}</TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
};

export default ReceivingTable;
