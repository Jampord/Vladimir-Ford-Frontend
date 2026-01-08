import {
  Box,
  Chip,
  Dialog,
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
import React, { useState } from "react";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useGetAssetsToEvaluateApiQuery } from "../../../Redux/Query/Movement/Evaluation";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { Attachment } from "@mui/icons-material";
import FAStatusChange from "../../../Components/Reusable/FaStatusComponent";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import PulloutTimeline from "../PulloutTimeline";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

const ForApprovalEvaluation = ({ tab }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [transactionData, setTransactionData] = useState();

  const dialog = useSelector((state) => state.booleanState.dialog);
  const dispatch = useDispatch();

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    isSuccess: isEvaluationSuccess,
    isError: isEvaluationError,
    isFetching: isEvaluationFetching,
    error: errorData,
    refetch,
  } = useGetAssetsToEvaluateApiQuery(
    {
      page: page,
      per_page: perPage,
      status: tab === "3" ? "For Approval" : tab === "4" ? "Approved" : "",
    },
    { refetchOnMountOrArgChange: true }
  );

  // Table Properties --------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const DlAttachment = (transfer_number) => (
    <Tooltip title="Download Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: transfer_number })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleViewTimeline = (data) => {
    // console.log(data);
    dispatch(openDialog());
    setTransactionData(data);
  };

  return (
    <Stack className="category_height">
      {isEvaluationLoading && <MasterlistSkeleton category />}
      {isEvaluationError && <ErrorFetching refetch={refetch} error={errorData} />}

      {evaluationData && !isEvaluationError && !isEvaluationLoading && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
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
                    <TableCell className="tbl-cell-category" align="center">
                      Request #
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell>
                    <TableCell className="tbl-cell-category">Hepldesk #</TableCell>
                    <TableCell className="tbl-cell-category">Asset</TableCell>
                    <TableCell className="tbl-cell-category">Chart of Accounts</TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Care of
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Evaluation Status
                    </TableCell>

                    <TableCell className="tbl-cell-category" align="center">
                      Remarks
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Date Created
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {evaluationData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {evaluationData?.data.map((item) => (
                        <TableRow
                          key={item?.id}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                          hover
                        >
                          <TableCell className="tbl-cell" align="center">
                            {item?.id}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.description}
                          </TableCell>

                          <TableCell className="tbl-cell ">{item?.helpdesk_number}</TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontWeight={700} fontSize="13px" color="primary">
                              {item?.asset.vladimir_tag_number}
                            </Typography>
                            <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                              {item?.asset.asset_description}
                            </Typography>
                            <Typography
                              fontSize="12px"
                              color="text.light"
                              textOverflow="ellipsis"
                              width="300px"
                              overflow="hidden"
                            >
                              <Tooltip title={item?.asset.asset_specification} placement="bottom" arrow>
                                {item?.asset.asset_specification}
                              </Tooltip>
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.code || "-"}) - ${item?.asset.one_charging?.name || "-"}`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.company_code || item?.asset?.company?.company_code}) - ${
                                item?.asset.one_charging?.company_name || item?.asset?.company?.company_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${
                                item?.asset.one_charging?.business_unit_code ||
                                item?.asset?.business_unit?.business_unit_code
                              }) - ${
                                item?.asset.one_charging?.business_unit_name ||
                                item?.asset?.business_unit?.business_unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${
                                item?.asset.one_charging?.department_code || item?.asset.department?.department_code
                              }) - ${
                                item?.asset.one_charging?.department_name || item?.asset.department?.department_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.unit_code || item?.asset.unit?.unit_code}) - ${
                                item?.asset.one_charging?.unit_name || item?.asset.unit?.unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.subunit_code || item?.asset.subunit?.subunit_code}) - ${
                                item?.asset.one_charging?.subunit_name || item?.asset.subunit?.subunit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.location_code || item?.asset.location?.location_code}) - ${
                                item?.asset.one_charging?.location_name || item?.asset.location?.location_name
                              }`}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            <Typography fontSize="12px" color="black" fontWeight="500">
                              {item?.care_of?.name}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            <Box onClick={() => handleViewTimeline(item)}>
                              <FAStatusChange faStatus={item?.evaluation} hover />
                            </Box>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.remarks === null ? "-" : item?.remarks}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {moment(item?.created_at).format("MMM DD, YYYY")}
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
            total={evaluationData?.total}
            success={isEvaluationSuccess}
            current_page={evaluationData?.current_page}
            per_page={evaluationData?.per_page}
            onPageChange={pageHandler}
            onRowsPerPageChange={perPageHandler}
          />
        </Box>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <PulloutTimeline data={transactionData} />
      </Dialog>
    </Stack>
  );
};

export default ForApprovalEvaluation;
