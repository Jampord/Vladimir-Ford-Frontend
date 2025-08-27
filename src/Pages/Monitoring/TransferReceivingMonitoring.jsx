import {
  Box,
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
import { useGetTransferReceivingMonitoringApiQuery } from "../../Redux/Query/Movement/Transfer";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import moment from "moment";

const TransferReceivingMonitoring = () => {
  const [search, setSearch] = useState("");

  const {
    data: transferData,
    isLoading: isTransferLoading,
    isFetching: isTransferFetching,
    isSuccess: isTransferSuccess,
    isError: isTransferError,
    error: errorData,
    refetch,
  } = useGetTransferReceivingMonitoringApiQuery(
    {
      pagination: "none",
      status: "For Receiving",
    },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Transfer Receiving Monitoring
      </Typography>
      <Stack height="100%">
        {isTransferLoading && <MasterlistSkeleton onAdd={false} />}
        {isTransferError && <ErrorFetching refetch={refetch} error={errorData} />}

        {transferData && !isTransferError && (
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onSearchChange={setSearch} hideArchive />

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
                      <TableCell className="tbl-cell">ID</TableCell>
                      <TableCell className="tbl-cell">Asset</TableCell>
                      <TableCell className="tbl-cell">Chart of Account</TableCell>
                      <TableCell className="tbl-cell">Depreciation Debit</TableCell>
                      <TableCell className="tbl-cell">Receiver</TableCell>
                      <TableCell className="tbl-cell">Date Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {transferData?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : isTransferFetching ? (
                      <LoadingData />
                    ) : (
                      transferData.map((data) => (
                        <TableRow key={data?.id}>
                          <TableCell className="tbl-cell">{data?.id}</TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontWeight={700} fontSize="13px" color="primary">
                              {data?.vladimir_tag_number}
                            </Typography>
                            <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                              {data?.description}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.code || "-"}) - ${data?.one_charging?.name || "-"}`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.company_code || data?.company?.company_code}) - ${
                                data?.one_charging?.company_name || data?.company?.company_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${
                                data?.one_charging?.business_unit_code || data?.business_unit?.business_unit_code
                              }) - ${
                                data?.one_charging?.business_unit_name || data?.business_unit?.business_unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.department_code || data?.department?.department_code}) - ${
                                data?.one_charging?.department_name || data?.department?.department_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.unit_code || data?.unit?.unit_code}) - ${
                                data?.one_charging?.unit_name || data?.unit?.unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.subunit_code || data?.subunit?.subunit_code}) - ${
                                data?.one_charging?.subunit_name || data?.subunit?.subunit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${data?.one_charging?.location_code || data?.location?.location_code}) - ${
                                data?.one_charging?.location_name || data?.location?.location_name
                              }`}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell">
                            <Typography fontSize="12px" color="secondary.main">
                              {`(${data?.depreciation_debit_code}) - ${data?.depreciation_debit}`}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell">{data?.receiver}</TableCell>
                          <TableCell className="tbl-cell">{moment(data?.created_at).format("MMMM DD, YYYY")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TransferReceivingMonitoring;
