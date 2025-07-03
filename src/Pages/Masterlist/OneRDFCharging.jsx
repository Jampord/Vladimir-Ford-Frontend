import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useState } from "react";
import { useGetOneRDFChargingAllApiQuery } from "../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import moment from "moment";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";

const OneRDFCharging = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const {
    data: oneChargingApiData,
    isLoading: oneChargingApiLoading,
    isSuccess: oneChargingApiSuccess,
    isFetching: oneChargingApiFetching,
    isError: oneChargingApiError,
    error: errorData,
    refetch: oneChargingApiRefetch,
  } = useGetOneRDFChargingAllApiQuery({
    page: page,
    per_page: perPage,
    status: status,
    search: search,
  });

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        One RDF Charging
      </Typography>

      {oneChargingApiLoading && <MasterlistSkeleton onSync={false} />}
      {oneChargingApiError && <ErrorFetching refetch={oneChargingApiRefetch} error={errorData} />}
      {oneChargingApiData && !oneChargingApiError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar path="#" onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} />

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
                      <TableCell className="tbl-cell text-center">ID</TableCell>
                      <TableCell className="tbl-cell text-center">Code</TableCell>
                      <TableCell className="tbl-cell text-center">Name</TableCell>
                      <TableCell className="tbl-cell ">Chart of Accounts</TableCell>
                      <TableCell className="tbl-cell text-center">Status</TableCell>
                      <TableCell className="tbl-cell text-center">Date Created</TableCell>
                      <TableCell className="tbl-cell text-center">Date Updated</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {oneChargingApiFetching ? (
                      <LoadingData />
                    ) : oneChargingApiData?.data.length === 0 ? (
                      <NoRecordsFound heightData="medium" />
                    ) : (
                      <>
                        {oneChargingApiSuccess &&
                          oneChargingApiData?.data.map((data) => (
                            <TableRow
                              key={data.id}
                              hover={true}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell className="tbl-cell text-center">{data.id}</TableCell>
                              <TableCell className="tbl-cell text-center">{data.code}</TableCell>
                              <TableCell className="tbl-cell text-center">
                                <Typography variant="h6" fontSize="12px" color={"secondary.main"} fontWeight={"bold"}>
                                  {data.name}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell ">
                                <Typography fontSize="10px" color="gray">
                                  {data.company_code}
                                  {" - "} {data.company_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.business_unit_code}
                                  {" - "}
                                  {data.business_unit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.department_code}
                                  {" - "}
                                  {data.department_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.unit_code}
                                  {" - "}
                                  {data.unit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.subunit_code}
                                  {" - "}
                                  {data.subunit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.location_code} {" - "}
                                  {data.location_name}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell text-center">
                                {status === "active" ? (
                                  <Chip
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      background: "#27ff811f",
                                      color: "active.dark",
                                      fontSize: "0.7rem",
                                      px: 1,
                                    }}
                                    label="ACTIVE"
                                  />
                                ) : (
                                  <Chip
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      background: "#fc3e3e34",
                                      color: "error.light",
                                      fontSize: "0.7rem",
                                      px: 1,
                                    }}
                                    label="INACTIVE"
                                  />
                                )}
                              </TableCell>

                              <TableCell className="tbl-cell text-center">
                                {moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>
                              <TableCell className="tbl-cell text-center">
                                {moment(data.updated_at).format("MMM DD, YYYY")}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <CustomTablePagination
                total={oneChargingApiData?.total}
                current_page={oneChargingApiData?.current_page}
                per_page={oneChargingApiData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default OneRDFCharging;
