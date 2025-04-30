import {
  Box,
  Button,
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import { useGetPurchaseRequestReconQuery } from "../../Redux/Query/Reports/PurchaseRequestRecon";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { IosShareRounded } from "@mui/icons-material";
import { openExport } from "../../Redux/StateManagement/booleanStateSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import ExportPurchaseRequestRecon from "./ExportPurchaseRequestRecon";

const PurchaseRequestRecon = () => {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const dispatch = useDispatch();
  const showExport = useSelector((state) => state.booleanState.exportFile);

  const {
    data: purchaseRequestReconData,
    isLoading: ispurchaseRequestReconLoading,
    isSuccess: ispurchaseRequestReconSuccess,
    isError: ispurchaseRequestReconError,
    isFetching: ispurchaseRequestReconFetching,
    error: errorData,
    refetch,
  } = useGetPurchaseRequestReconQuery(
    {
      year_month: selectedDate !== null ? moment(selectedDate).format("YYYY-MM") : moment(new Date()).format("YYYY-MM"),
      page: page,
      per_page: perPage,
      pagination: "",
    },
    { refetchOnMountOrArgChange: true }
  );

  const transactionStatus = (data) => {
    let statusColor, hoverColor, textColor, variant;

    switch (data.status) {
      case "Match":
        statusColor = "success.light";
        hoverColor = "success.main";
        textColor = "white";
        variant = "filled";
        break;

      case "vlad pr missing":
      case "ymir pr missing":
        statusColor = "error.light";
        hoverColor = "error.main";
        variant = "filled";
        break;

      default:
        statusColor = "success.main";
        hoverColor = "none";
        textColor = "success.main";
        variant = "outlined";
    }

    return (
      <Chip
        placement="top"
        size="small"
        variant={variant}
        sx={{
          ...(variant === "filled" && {
            backgroundColor: statusColor,
            color: "white",
          }),
          ...(variant === "outlined" && {
            borderColor: statusColor,
            color: textColor,
          }),
          fontSize: "11px",
          px: 1,
          ":hover": {
            ...(variant === "filled" && { backgroundColor: hoverColor }),
            ...(variant === "outlined" && { borderColor: hoverColor, color: textColor }),
          },
        }}
        label={data.status}
      />
    );
  };

  const openExportDialog = () => {
    dispatch(openExport());
  };

  const isSmallerScreen = useMediaQuery("(max-width: 600px)");

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Purchase Request Recon
      </Typography>

      {ispurchaseRequestReconLoading && <MasterlistSkeleton onAdd={false} />}
      {ispurchaseRequestReconError && <ErrorFetching refetch={refetch} error={errorData} />}
      {purchaseRequestReconData && !ispurchaseRequestReconError && (
        // <Stack height="100%">
        <Box className="mcontainer__wrapper">
          {/* <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive /> */}
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
              onChange={(newValue) => {
                setSelectedDate(newValue);
                setPage(1);
              }} // Update state on change
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
                    <TableCell className="tbl-cell text-center">Ymir PR</TableCell>
                    <TableCell className="tbl-cell text-center">Vladimir PR</TableCell>
                    <TableCell className="tbl-cell text-center">Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {purchaseRequestReconData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : ispurchaseRequestReconLoading || ispurchaseRequestReconFetching ? (
                    <LoadingData />
                  ) : (
                    ispurchaseRequestReconSuccess &&
                    purchaseRequestReconData?.data.map((data, index) => {
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell className="tbl-cell text-center">{data.ymir_pr}</TableCell>
                          <TableCell className="tbl-cell text-center">{data.vlad_pr}</TableCell>
                          <TableCell className="tbl-cell text-center">{transactionStatus(data)}</TableCell>
                        </TableRow>
                      );
                    })
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
              total={purchaseRequestReconData?.total}
              success={purchaseRequestReconData}
              current_page={purchaseRequestReconData?.current_page}
              per_page={purchaseRequestReconData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
        // </Stack>
      )}

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportPurchaseRequestRecon />
      </Dialog>
    </Box>
  );
};

export default PurchaseRequestRecon;
