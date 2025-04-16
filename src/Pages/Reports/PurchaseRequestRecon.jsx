import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import { useGetPurchaseRequestReconQuery } from "../../Redux/Query/Reports/PurchaseRequestRecon";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";

const PurchaseRequestRecon = () => {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: purchaseRequestReconData,
    isLoading: ispurchaseRequestReconLoading,
    isSuccess: ispurchaseRequestReconSuccess,
    isError: ispurchaseRequestReconError,
    isFetching: ispurchaseRequestReconFetching,
    error: errorData,
    refetch,
  } = useGetPurchaseRequestReconQuery({}, { refetchOnMountOrArgChange: true });

  console.log("purchaseRequestReconData", purchaseRequestReconData);

  const transactionStatus = (data) => {
    console.log({ data });
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

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Purchase Request Recon
      </Typography>

      {ispurchaseRequestReconLoading && <MasterlistSkeleton onAdd={false} />}
      {ispurchaseRequestReconError && <ErrorFetching refetch={refetch} error={errorData} />}
      {purchaseRequestReconData && !ispurchaseRequestReconError && (
        <Stack height="100%">
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive />

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
                    {purchaseRequestReconData?.length === 0 ? (
                      <NoRecordsFound />
                    ) : ispurchaseRequestReconLoading || ispurchaseRequestReconFetching ? (
                      <LoadingData />
                    ) : (
                      ispurchaseRequestReconSuccess &&
                      purchaseRequestReconData.map((data, index) => {
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
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default PurchaseRequestRecon;
