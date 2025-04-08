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

const GeneralLedgerReports = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const isSmallerScreen = useMediaQuery("(max-width: 600px)");
  const isSmallestScreen = useMediaQuery("(max-width: 455px)");

  const dispatch = useDispatch();
  const showExport = useSelector((state) => state.booleanState.exportFile);

  const {
    data: glData,
    isLoading: glLoading,
    isFetching: glFetching,
    isSuccess: glSuccess,
    isError: glError,
    error: errorData,
    refetch,
  } = useGetGeneralLedgerReportApiQuery(
    {
      page: page,
      per_page: perPage,
      adjustment_date: selectedDate !== null ? moment(selectedDate).format("YYYY-MM") : "",
    },
    { refetchOnMountOrArgChange: true }
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
    // glTrigger({
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
        General Ledger Report
      </Typography>

      {glLoading && <MasterlistSkeleton onAdd={false} />}
      {glError && <ErrorFetching refetch={refetch} error={errorData} />}
      {glData && !glError && (
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
              value={selectedDate} // Bind the state to the DatePicker
              onChange={(newValue) => setSelectedDate(newValue)} // Update state on change
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
                    <TableCell className="tbl-cell">Transaction Date</TableCell>
                    <TableCell className="tbl-cell">DR / CR</TableCell>
                    <TableCell className="tbl-cell">Vladimir Tag Number (Asset CIP)</TableCell>
                    <TableCell className="tbl-cell">Item Description</TableCell>
                    <TableCell className="tbl-cell">Quantity</TableCell>
                    <TableCell className="tbl-cell">Unit Price</TableCell>
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell">PO/RR Number</TableCell>
                    <TableCell className="tbl-cell">Account Title</TableCell>
                    <TableCell className="tbl-cell">Client Supplier</TableCell>
                    <TableCell className="tbl-cell">BOA</TableCell>
                    <TableCell className="tbl-cell">Books</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {glData?.data?.length === 0 || glData?.data === null ? (
                    <NoRecordsFound heightData="small" />
                  ) : glFetching ? (
                    <LoadingData />
                  ) : (
                    glSuccess && (
                      <>
                        {glData?.data.map((data, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <TableCell className="tbl-cell">{data?.transactionDate}</TableCell>
                            <TableCell className="tbl-cell">{data?.drcr}</TableCell>
                            <TableCell className="tbl-cell">{data?.assetCIP}</TableCell>
                            <TableCell className="tbl-cell">{data?.itemDescription}</TableCell>
                            <TableCell className="tbl-cell">{`${data?.quantity} - ${data?.uom}`}</TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize="13px" color={data?.unitPrice < 0 ? "red" : "black"}>
                                ₱{data?.unitPrice}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize="10px" color="gray">
                                {data.companyCode} - {data.company}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.divisionCode} - {data.division}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.departmentCode} - {data.department}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.unitCode} - {data.unit}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.subUnitCode} - {data.subUnit}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.locationCode} - {data.location}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize="12px">PO - {data.poNumber}</Typography>
                              <Typography fontSize="12px">RR - {data.rrNumber}</Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">{`${data?.accountTitleCode} - ${data?.accountTitle}`}</TableCell>
                            <TableCell className="tbl-cell">{data?.clientSupplier}</TableCell>
                            <TableCell className="tbl-cell">{data?.boa}</TableCell>
                            <TableCell className="tbl-cell">{data?.books}</TableCell>
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
              total={glData?.total}
              success={glSuccess}
              current_page={glData?.current_page}
              per_page={glData?.per_page}
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
        <ExportGeneralLedgerReports />
      </Dialog>
    </Box>
  );
};

export default GeneralLedgerReports;
