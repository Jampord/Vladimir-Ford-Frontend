import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetEvaluationApprovalApiQuery } from "../../../Redux/Query/Approving/EvaluationApproval";
import {
  Box,
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
import { Attachment } from "@mui/icons-material";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import moment from "moment";
import ViewEvaluationApproving from "./ViewEvaluationApproving";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";

const ApprovedEvaluation = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Approved");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [rowData, setRowData] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dialog = useSelector((state) => state.booleanState.dialog);

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

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const DlAttachment = (id) => (
    <Tooltip title="Download Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        // onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: id })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleRowClick = (data) => {
    console.log("Row clicked:", data);
    dispatch(openDialog());
    setRowData(data);
  };

  const handleCloseDialog = () => {
    dispatch(closeDialog());
    setRowData({});
  };

  return (
    <Stack className="category_height">
      {approvalLoading && <MasterlistSkeleton category={true} onAdd={true} />}
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
                    <TableCell className="tbl-cell-category">Evaluation No.</TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Requestor
                    </TableCell>
                    <TableCell className="tbl-cell-category">Asset</TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Chart of Accounts
                    </TableCell>
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
                      <TableCell
                        className="tbl-cell-category"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={12} fontWeight={700} color="secondary.main">
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
                        <Typography fontSize={12} fontWeight={700} color="secondary.main">
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
                        <Typography fontSize={11} fontWeight={600} color="secondary.main">
                          {data.requester.first_name}
                        </Typography>
                        <Typography fontSize={11} fontWeight={600} color="secondary.main">
                          {data.requester.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={12} fontWeight={600} color="secondary.main">
                          {data.asset.asset_description}
                        </Typography>
                        <Typography fontSize={11} fontWeight={500} color="secondary.main">
                          {data.asset.asset_specification}
                        </Typography>
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
                        <DlAttachment id={data.id} />
                      </TableCell>
                      <TableCell
                        className="tbl-cell-category"
                        align="center"
                        onClick={(e) => {
                          handleRowClick(data);
                        }}
                      >
                        <Typography fontSize={13} fontWeight={500} color="secondary.main">
                          {moment(data?.created_at).format("MMM DD, YYYY")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
          // onApprovalApproveHandler={onApprovalApproveHandler}
          // onApprovalReturnHandler={onApprovalReturnHandler}
          viewMode
        />
      </Dialog>
    </Stack>
  );
};

export default ApprovedEvaluation;
