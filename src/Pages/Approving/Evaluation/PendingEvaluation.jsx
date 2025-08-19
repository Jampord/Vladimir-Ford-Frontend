import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetEvaluationApprovalApiQuery,
  usePostEvaluateApprovalApiMutation,
} from "../../../Redux/Query/Approving/EvaluationApproval";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { Attachment, Check, Help, Report, Undo } from "@mui/icons-material";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";
import ViewEvaluationApproving from "./ViewEvaluationApproving";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  evaluation_id: yup.array(),
});
const PendingEvaluation = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("For Approval");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [rowData, setRowData] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dialog = useSelector((state) => state.booleanState.dialog);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setError,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      evaluation_id: [],
    },
  });

  const {
    data: approvalData,
    isLoading: approvalLoading,
    isSuccess: approvalSuccess,
    isError: approvalError,
    error: errorData,
    refetch,
  } = useGetEvaluationApprovalApiQuery(
    {
      page: page,
      per_page: perPage,
      search: search,
      status: status,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [postEvaluateApproval] = usePostEvaluateApprovalApiMutation();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const handleViewFile = async (id) => {
    try {
      const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/file/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.GL_KEY },
      });
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);

      // Open new window and store reference
      const newWindow = window.open(fileURL, "_blank");

      if (newWindow) {
        // Add to cache and setup cleanup listener
        blobUrlCache.set(newWindow, fileURL);
        newWindow.addEventListener("unload", () => {
          URL.revokeObjectURL(fileURL);
          blobUrlCache.delete(newWindow);
        });
      } else {
        // Revoke immediately if window failed to open
        URL.revokeObjectURL(fileURL);
      }
    } catch (err) {
      console.error("Error handling file view:", err);
    }
  };

  // Cleanup for main window close (optional safety net)
  window.addEventListener("beforeunload", () => {
    blobUrlCache.forEach((url, win) => {
      URL.revokeObjectURL(url);
      blobUrlCache.delete(win);
    });
  });

  const DlAttachment = (id) => (
    <Tooltip title="View Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        // onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: id })}
        onClick={() => handleViewFile(id?.id[0]?.id)}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const evaluationIdAllHandler = (checked) => {
    if (checked) {
      setValue(
        "evaluation_id",
        approvalData?.data?.map((item) => item.id.toString())
      );
    } else {
      reset({ evaluation_id: [] });
    }
  };

  const handleRowClick = (data) => {
    console.log("Row clicked:", data);
    dispatch(openDialog());
    setRowData(data);
  };

  const handleCloseDialog = () => {
    dispatch(closeDialog());
    setRowData({});
  };

  const onApprovalApproveHandler = (id) => {
    console.log({ id });
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
                fontFamily: "Raleway",
              }}
            >
              APPROVE
            </Typography>{" "}
            this request?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());

            const result = await postEvaluateApproval({
              action: "approve",
              item_id: id,
            }).unwrap();
            reset();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(closeDialog());
          } catch (err) {
            console.log("error in approving", err);
            dispatch(
              openToast({
                message: err?.data?.message || "Error evaluation approving!",
                duration: 5000,
                variant: "error",
              })
            );
          }
        },
      })
    );
  };

  const onApprovalReturnHandler = (id) => {
    console.log({ id });
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
        message: (
          <Stack gap={2}>
            <Typography>
              Are you sure you want to{" "}
              <Typography
                variant="span"
                sx={{
                  display: "inline-block",
                  color: "secondary.main",
                  fontWeight: "bold",
                  fontFamily: "Raleway",
                }}
              >
                RETURN
              </Typography>{" "}
              this request?
            </Typography>
          </Stack>
        ),
        remarks: true,

        onConfirm: async (data) => {
          try {
            dispatch(onLoading());
            const result = await postEvaluateApproval({
              action: "Return",
              item_id: id,
              remarks: data,
            }).unwrap();
            reset();
            dispatch(
              openToast({
                message: result.message || "Request returned successfully!",
                duration: 5000,
              })
            );

            dispatch(closeDialog());
          } catch (err) {
            console.log("error", err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
                  message: err?.data?.errors?.detail,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || "Something went wrong. Please try again.",
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

  const evaluation_ids = watch("evaluation_id");

  console.log("watch evaluation_id:", evaluation_ids);
  return (
    <Stack className="category_height">
      {approvalLoading && <MasterlistSkeleton category={true} />}
      {approvalError && <ErrorFetching refetch={refetch} category={approvalData} error={errorData} />}
      {approvalData && !approvalError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
            // onAdd={() => {}}
            hideArchive
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
                    <TableCell align="center" className="tbl-cell">
                      <FormControlLabel
                        sx={{ margin: "auto", align: "center" }}
                        control={
                          <Checkbox
                            value=""
                            size="small"
                            checked={
                              !!approvalData?.data
                                ?.map((mapItem) => mapItem?.id.toString())
                                ?.every((item) => watch("evaluation_id").includes(item))
                            }
                            onChange={(e) => {
                              evaluationIdAllHandler(e.target.checked);
                              // console.log(e.target.checked);
                            }}
                          />
                        }
                      />
                    </TableCell>
                    <TableCell className="tbl-cell-category">Evaluation No.</TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Requestor
                    </TableCell>
                    <TableCell className="tbl-cell-category">Asset</TableCell>
                    <TableCell className="tbl-cell-category">Chart of Accounts</TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Attachments
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Date Requested
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {approvalData?.data?.map((data) => (
                    <TableRow key={data.id} hover={true}>
                      <TableCell className="tbl-cell" size="small" align="center">
                        <FormControlLabel
                          value={data?.id}
                          sx={{ margin: "auto" }}
                          // disabled={data.action === "view"}
                          control={
                            <Checkbox
                              size="small"
                              {...register("evaluation_id")}
                              checked={watch("evaluation_id").includes(data?.id.toString())}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={12} color="secondary.main">
                          {data?.id}
                        </Typography>
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        align="center"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={12} color="secondary.main">
                          {data?.description}
                        </Typography>
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        align="center"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={12} fontWeight={700} color="secondary.main">
                          {data.requester.employee_id}
                        </Typography>
                        <Typography fontSize={11} fontWeight={500} color="secondary.main">
                          {data.requester.first_name}
                        </Typography>
                        <Typography fontSize={11} fontWeight={500} color="secondary.main">
                          {data.requester.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontWeight={700} fontSize="13px" color="primary">
                          {data?.asset.vladimir_tag_number}
                        </Typography>
                        <Typography fontWeight={600} fontSize="14px" color="secondary.main">
                          {data?.asset.asset_description}
                        </Typography>
                        <Tooltip title={data?.asset.asset_specification} placement="bottom" arrow>
                          <Typography
                            fontSize="12px"
                            color="text.light"
                            textOverflow="ellipsis"
                            width="300px"
                            overflow="hidden"
                          >
                            {data?.asset.asset_specification}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell
                        className="tbl-cell-category"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.code || "-"}) - ${data?.asset.one_charging?.name || "-"}`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.company_code || data?.company?.company_code}) - ${
                            data?.asset.one_charging?.company_name || data?.company?.company_name
                          }`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${
                            data?.asset.one_charging?.business_unit_code || data?.business_unit?.business_unit_code
                          }) - ${
                            data?.asset.one_charging?.business_unit_name || data?.business_unit?.business_unit_name
                          }`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.department_code || data.department?.department_code}) - ${
                            data?.asset.one_charging?.department_name || data.department?.department_name
                          }`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.unit_code || data.unit?.unit_code}) - ${
                            data?.asset.one_charging?.unit_name || data.unit?.unit_name
                          }`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.subunit_code || data.subunit?.subunit_code}) - ${
                            data?.asset.one_charging?.subunit_name || data.subunit?.subunit_name
                          }`}
                        </Typography>
                        <Typography fontSize={10} color="gray">
                          {`(${data?.asset.one_charging?.location_code || data.location?.location_code}) - ${
                            data?.asset.one_charging?.location_name || data.location?.location_name
                          }`}
                        </Typography>
                      </TableCell>
                      <TableCell className="tbl-cell-category" align="center">
                        <DlAttachment id={data?.evaluation_attachments} />
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        align="center"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={13} color="secondary.main">
                          {moment(data?.created_at).format("MMM DD, YYYY")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* <Box /> */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                // justifyContent: "flex-end",
                alignItems: "center",
                pr: 1,
                gap: 1,
                // top: "-5px",
                right: "-5px",
                // flexWrap: "nowrap",
              }}
            >
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => onApprovalApproveHandler(evaluation_ids)}
                startIcon={<Check color="primary" />}
                disabled={!watch("evaluation_id").length}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onApprovalReturnHandler(evaluation_ids)}
                startIcon={<Undo sx={{ color: "#5f3030" }} />}
                sx={{
                  color: "white",
                  backgroundColor: "error.main",
                  ":hover": { backgroundColor: "error.dark" },
                }}
                disabled={!watch("evaluation_id").length}
              >
                Return
              </Button>
            </Box>

            <CustomTablePagination
              total={approvalData?.total}
              success={approvalSuccess}
              current_page={approvalData?.current_page}
              per_page={approvalData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "10px" } }}
        maxWidth="sm"
        fullWidth
        // onClose={handleCloseDialog}
      >
        <ViewEvaluationApproving
          data={rowData}
          handleCloseDialog={handleCloseDialog}
          onApprovalApproveHandler={onApprovalApproveHandler}
          onApprovalReturnHandler={onApprovalReturnHandler}
        />
      </Dialog>
    </Stack>
  );
};

export default PendingEvaluation;
