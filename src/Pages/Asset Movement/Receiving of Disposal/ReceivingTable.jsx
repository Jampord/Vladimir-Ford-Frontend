import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetDisposalReceivingApiQuery,
  usePatchDisposalReceivingApiMutation,
} from "../../../Redux/Query/Movement/Disposal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControlLabel,
  Grow,
  IconButton,
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
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { HighlightAlt, MoveDownOutlined, Visibility, Warning } from "@mui/icons-material";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import moment from "moment";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useFileView } from "../../../Hooks/useFileView";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import RejectDisposal from "./component/RejectDisposal";
import { notificationApi } from "../../../Redux/Query/Notification";

const schema = yup.object().shape({
  disposal_ids: yup.array(),
});

const ReceivingTable = ({ received }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const dialog = useSelector((state) => state.booleanState.dialog);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: receivingData,
    isLoading: receivingLoading,
    isSuccess: receivingSuccess,
    isError: receivingError,
    error: errorData,
    refetch,
  } = useGetDisposalReceivingApiQuery(
    {
      page: page,
      per_page: perPage,
      status: received ? "Received" : "To Receive",
    },
    { refetchOnMountOrArgChange: true }
  );

  const [receiveDisposalApi, { isLoading: isPatchLoading }] = usePatchDisposalReceivingApiMutation();

  const { register, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      disposal_ids: [],
    },
  });

  const disposalIdsAllHandler = (checked) => {
    if (checked) {
      setValue(
        "disposal_ids",
        receivingData.data?.map((item) => item?.id.toString())
      );
    } else {
      reset({ disposal_ids: [] });
    }
  };

  // * Validation for Receiving
  const handleSelectedItems =
    receivingData?.data?.filter((item) => watch("disposal_ids").includes(item.id.toString())).length === 0;

  const validateSelectedItems = () => {
    if (handleSelectedItems) {
      return true;
    }
    return false;
  };

  const handleFileView = (id) => {
    useFileView({ id } || id);
  };

  const handleReceive = () => {
    dispatch(
      openConfirm({
        approval: true,
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
            {watch("disposal_ids").length >= 1 ? " request" : " requests"}?
            {/* <Autocomplete
              multiple
              freeSolo
              options={receivingData?.data
                ?.filter((item) => watch("disposal_ids").includes(item.id.toString()))
                .map((option) => option?.fixed_asset?.vladimir_tag_number + " - " + option.description)}
              value={receivingData?.data
                ?.filter((item) => watch("disposal_ids").includes(item.id.toString()))
                .map((item) => item?.fixed_asset.vladimir_tag_number)}
              readOnly
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ height: "100px", mt: "5px" }}
                  label={`To be Received ${watch("disposal_ids").length <= 1 ? " Asset" : " Assets"}`}
                />
              )}
              sx={{ mt: "15px", maxHeight: "160px", overflowY: "auto" }}
            /> */}
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await receiveDisposalApi({
              disposal_id: watch("disposal_ids").map(Number),
              status: "receive",
            }).unwrap();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
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

        onDismiss: async () => {
          dispatch(openDialog());
        },
      })
    );
  };

  const attachmentSx = {
    textDecoration: "underline",
    cursor: "pointer",
    color: "primary.main",
    fontSize: "12px",
    maxWidth: "200px",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  console.log("👀👀", watch("disposal_ids").map(Number));
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
                startIcon={<HighlightAlt />}
                sx={{ position: "absolute", right: 0, top: -40 }}
                disabled={!watch("disposal_ids") || validateSelectedItems()}
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
                          <Tooltip title="Select All" placement="top" arrow>
                            <FormControlLabel
                              sx={{ margin: "auto", align: "center" }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={
                                    !!receivingData?.data
                                      ?.map((mapItem) => mapItem?.id.toString())
                                      ?.every((item) => watch("disposal_ids").includes(item))
                                  }
                                />
                              }
                              onChange={(e) => {
                                disposalIdsAllHandler(e.target.checked);
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                      )}

                      <TableCell className="tbl-cell">Request #</TableCell>
                      <TableCell className="tbl-cell">Request Description</TableCell>
                      <TableCell className="tbl-cell">Asset</TableCell>
                      <TableCell className="tbl-cell">Remarks</TableCell>
                      <TableCell className="tbl-cell">Chart Of Account </TableCell>
                      <TableCell className="tbl-cell">Pullout Attachments</TableCell>
                      <TableCell className="tbl-cell">Evaluation Attachments</TableCell>
                      <TableCell className="tbl-cell">Disposal Attachments</TableCell>
                      <TableCell className="tbl-cell">Date Requested</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receivingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {receivingSuccess &&
                          receivingData?.data.map((data) => (
                            <TableRow
                              key={data.id}
                              hover
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
                                        {...register("disposal_ids")}
                                        checked={watch("disposal_ids").includes(data.id.toString())}
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
                              <TableCell className="tbl-cell">{data?.description}</TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontWeight={600} fontSize="14px" color="primary.main">
                                  {data?.fixed_asset?.vladimir_tag_number}
                                </Typography>
                                <Typography fontWeight={600} fontSize="14px" color="secondary.main">
                                  {data?.fixed_asset?.description}
                                </Typography>
                                <Typography fontSize="12px" color="text.light">
                                  {data?.fixed_asset?.specification}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">{data?.remarks}</TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontSize={10} color="gray">
                                  ({data?.fixed_asset?.one_charging?.code}) - {data?.fixed_asset?.one_charging?.name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.fixed_asset?.one_charging?.company_code || data.company_code}) -{" "}
                                  {data?.fixed_asset?.one_charging?.company_name || data.company}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${
                                    data?.fixed_asset?.one_charging?.business_unit_code || data.business_unit_code
                                  }) - ${data?.fixed_asset?.one_charging?.business_unit_name || data.business_unit}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.fixed_asset?.one_charging?.department_code || data?.department_code}) - ${
                                    data?.fixed_asset?.one_charging?.department_name || data?.department
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.fixed_asset?.one_charging?.unit_code || data?.unit_code}) - ${
                                    data?.fixed_asset?.one_charging?.unit_name || data?.unit
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.fixed_asset?.one_charging?.subunit_code || data?.sub_unit_code}) - ${
                                    data?.fixed_asset?.one_charging?.subunit_name || data?.sub_unit
                                  }`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.fixed_asset?.one_charging?.location_code || data?.location_code}) -{" "}
                                  {data?.fixed_asset?.one_charging?.location_name || data?.location}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">
                                {data?.pullout_attachments.map((item) => (
                                  <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)} key={item?.id}>
                                    <Tooltip title={"View or Download Pullout Attachment"} arrow>
                                      {item?.name}
                                    </Tooltip>
                                  </Typography>
                                ))}
                              </TableCell>
                              <TableCell className="tbl-cell">
                                {data?.evaluation_attachments.map((item) => (
                                  <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)} key={item?.id}>
                                    <Tooltip title={"View or Download Evaluation Attachment"} arrow>
                                      {item?.name}
                                    </Tooltip>
                                  </Typography>
                                ))}
                              </TableCell>
                              <TableCell className="tbl-cell">
                                {data?.disposal_attachments.map((item) => (
                                  <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)} key={item?.id}>
                                    <Tooltip title={"View or Download Disposal Attachment"} arrow>
                                      {item?.name}
                                    </Tooltip>
                                  </Typography>
                                ))}
                              </TableCell>
                              <TableCell className="tbl-cell">{moment(data?.created_at).format("LL")}</TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <CustomTablePagination
                total={receivingData?.total}
                success={receivingSuccess}
                current_page={receivingData?.current_page}
                per_page={receivingData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <RejectDisposal data={watch("disposal_ids").map(Number)} />
      </Dialog>
    </Stack>
  );
};

export default ReceivingTable;
