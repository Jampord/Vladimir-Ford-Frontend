import { IosShareRounded, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  Grow,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import React, { useState } from "react";
import { useGetGeneralLedgerReportApiQuery } from "../../Redux/Query/Reports/GeneralLedgerReport";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import { useDispatch, useSelector } from "react-redux";
import ExportGeneralLedgerReports from "./ExportGeneralLedgerReports";
import { openExport } from "../../Redux/StateManagement/booleanStateSlice";
import { useGetDepreciationMonthlyReportApiQuery } from "../../Redux/Query/FixedAsset/FixedAssets";
import ExportDepreciationMonthlyReport from "./ExportDepreciationMonthlyReport";

const DepreciationMonthlyReport = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const isSmallerScreen = useMediaQuery("(max-width: 600px)");
  const isSmallestScreen = useMediaQuery("(max-width: 455px)");

  const dispatch = useDispatch();
  const showExport = useSelector((state) => state.booleanState.exportFile);

  const {
    data: depreciationReportData,
    isLoading: depreciationReportLoading,
    isFetching: depreciationReportFetching,
    isSuccess: depreciationReportSuccess,
    isError: depreciationReportError,
    error: errorData,
    refetch,
  } = useGetDepreciationMonthlyReportApiQuery(
    {
      page: page,
      per_page: perPage,
      year_month: selectedDate !== null ? moment(selectedDate).format("YYYY-MM") : moment(new Date()).format("YYYY-MM"),
    }
    // { refetchOnMountOrArgChange: true }
  );

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log("Selected Date:", moment(selectedDate).format("YYYY-MM")); // Log the selected date
    // depreciationReportTrigger({
    //   page: page,
    //   per_page: perPage,
    //   adjustment_date: moment(selectedDate).format("YYYY-MM"),
    // });
  };

  const openExportDialog = () => {
    dispatch(openExport());
  };

  return (
    <Box className="mcontainer" component={"form"} onSubmit={handleSubmit}>
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Depreciation Monthly Report
      </Typography>

      {depreciationReportLoading && <MasterlistSkeleton onAdd={false} />}
      {depreciationReportError && <ErrorFetching refetch={refetch} error={errorData} />}
      {depreciationReportData && !depreciationReportError && (
        <Box className="mcontainer__wrapper">
          <Stack
            flexDirection="row"
            gap={isSmallerScreen ? 1 : 2}
            justifyContent="right"
            flexWrap={isSmallerScreen ? "wrap" : null}
            mt={1}
          >
            <DatePicker
              label={"Month and Year"}
              views={["month", "year"]}
              maxDate={new Date()}
              value={selectedDate || new Date()} // Bind the state to the DatePicker
              onChange={(newValue) => setSelectedDate(newValue)} // Update state on change
              closeOnSelect={false}
              // slotProps={{
              //   textField: {
              //     helperText: selectedDate === null && "Select a Month and Year to fetch data.",
              //     FormHelperTextProps: {
              //       style: { color: "red" }, // Change helper text color to red
              //     },
              //   },
              // }}
            />
          </Stack>

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
                    <TableCell className="tbl-cell">Vladimir Tag Number</TableCell>
                    <TableCell className="tbl-cell">Asset Description</TableCell>
                    <TableCell className="tbl-cell">Asset Specification</TableCell>
                    <TableCell className="tbl-cell">Acquisition Cost</TableCell>
                    <TableCell className="tbl-cell">Depreciation Basis</TableCell>
                    <TableCell className="tbl-cell">Depreciated Date</TableCell>
                    <TableCell className="tbl-cell">Months Depreciated</TableCell>
                    <TableCell className="tbl-cell">Monthly Depreciation</TableCell>
                    <TableCell className="tbl-cell">Yearly Depreciation</TableCell>
                    <TableCell className="tbl-cell">Accumulated Depreciation</TableCell>
                    <TableCell className="tbl-cell">Remaining Book Value</TableCell>
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell">Accounting Entries</TableCell>
                    <TableCell className="tbl-cell">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {depreciationReportData?.data?.length === 0 || depreciationReportData?.data === null ? (
                    <NoRecordsFound heightData="small" />
                  ) : depreciationReportFetching ? (
                    <LoadingData />
                  ) : (
                    depreciationReportSuccess && (
                      <>
                        {depreciationReportData?.data.map((data, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell">
                              <Typography fontSize="13px" fontWeight={700} color="black">
                                {data?.vladimir_tag_number}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">{data?.asset_description}</TableCell>
                            <TableCell className="tbl-cell">{data?.asset_specification}</TableCell>
                            <TableCell className="tbl-cell" align="center">
                              ₱{data?.acquisition_cost}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              {data?.depreciation_basis || "-"}
                            </TableCell>
                            <TableCell className="tbl-cell">{data?.depreciated_date}</TableCell>
                            <TableCell className="tbl-cell" align="center">
                              {data?.months_depreciated}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              ₱{data?.monthly_depreciation}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              ₱{data?.yearly_depreciation}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              ₱{data?.accumulated_depreciation}
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              ₱{data?.remaining_book_value}
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize="10px" color="gray">
                                {data?.company?.company_code} - {data?.company?.company_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data?.business_unit?.business_unit_code} - {data?.business_unit?.business_unit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data?.department?.department_code} - {data?.department?.department_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data?.unit?.unit_code} - {data?.unit?.unit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data?.sub_unit?.sub_unit_code} - {data?.sub_unit?.sub_unit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data?.location?.location_code} - {data?.location?.location_name}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize="10px" color="gray">
                                Initial Debit: {data?.initial_debit?.debit_code} - {data?.initial_debit?.debit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                Initial Credit: {data?.initial_credit?.credit_code} -{" "}
                                {data?.initial_credit?.credit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                Depreciation Debit: {data?.depreciation_debit?.debit_code} -{" "}
                                {data?.depreciation_debit?.debit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                Depreciation Credit: {data?.depreciation_credit?.credit_code} -{" "}
                                {data?.depreciation_credit?.credit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                Secondary Depreciation Debit: {data?.secondary_depreciation_debit?.debit_code} -{" "}
                                {data?.secondary_depreciation_debit?.debit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                Secondary Depreciation Credit: {data?.secondary_depreciation_credit?.credit_code} -{" "}
                                {data?.secondary_depreciation_credit?.credit_name}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">
                              {moment(data?.created_at).format("MMMM DD, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box className="mcontainer__pagination-export">
            <Button
              className="mcontainer__export"
              variant="outlined"
              size="small"
              color="text"
              startIcon={<IosShareRounded color="primary" />}
              onClick={openExportDialog}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 20px",
              }}
            >
              EXPORT
            </Button>

            <CustomTablePagination
              total={depreciationReportData?.total}
              success={depreciationReportSuccess}
              current_page={depreciationReportData?.current_page}
              per_page={depreciationReportData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportDepreciationMonthlyReport />
      </Dialog>
    </Box>
  );
};

export default DepreciationMonthlyReport;
