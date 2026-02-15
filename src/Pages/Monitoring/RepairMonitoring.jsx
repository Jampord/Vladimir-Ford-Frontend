import { TabContext } from "@mui/lab";
import {
  Box,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useGetPulloutConfirmationApiQuery } from "../../Redux/Query/Movement/Pullout";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { useFileView } from "../../Hooks/useFileView";
import { Attachment } from "@mui/icons-material";
import StatusComponent from "../../Components/Reusable/FaStatusComponent";
import moment from "moment";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

const RepairMonitoring = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const {
    data: pulloutData,
    isLoading: pulloutLoading,
    isFetching: pulloutFetching,
    isSuccess: pulloutSuccess,
    isError: pulloutError,
    error: errorData,
    refetch,
  } = useGetPulloutConfirmationApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      type_of_evaluation: "repaired",
      for_monitoring: 1,
      is_received: value === "1" ? 0 : 1,
    },
    { refetchOnMountOrArgChange: true }
  );

  const DlAttachment = (id) => (
    <Tooltip title="View Attachment" placement="top">
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
          ml: 3,
        }}
        onClick={() => useFileView({ id: id })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };
  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Repair Monitoring
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab label="For Receiving" value="1" className={value === "1" ? "tab__background" : null} />

            <Tab label="Received" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>
        </TabContext>

        <Box className="category_height">
          {pulloutLoading && <MasterlistSkeleton onAdd={false} />}
          {pulloutError && <ErrorFetching refetch={refetch} error={errorData} />}

          {pulloutData && !pulloutError && (
            <Box className="mcontainer__wrapper">
              <MasterlistToolbar onSearchChange={setSearch} hideArchive />

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
                        <TableCell className="tbl-cell">Pull Out No.</TableCell>
                        <TableCell className="tbl-cell">Description</TableCell>
                        <TableCell className="tbl-cell">Asset</TableCell>
                        <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                        <TableCell className="tbl-cell" align="center">
                          Care of
                        </TableCell>
                        <TableCell className="tbl-cell">Attachments</TableCell>
                        <TableCell className="tbl-cell" align="center">
                          Status
                        </TableCell>
                        <TableCell className="tbl-cell">{value === "2" ? "Date Received" : "Date Created"}</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {pulloutFetching ? (
                        <LoadingData />
                      ) : pulloutData?.data.length === 0 ? (
                        <NoRecordsFound heightData="medium" />
                      ) : (
                        pulloutData?.data?.map((data) => (
                          <TableRow
                            key={data.id}
                            sx={{
                              "& > *": {
                                whiteSpace: "nowrap",
                              },
                            }}
                            hover
                          >
                            <TableCell className="tbl-cell">{data?.id}</TableCell>
                            <TableCell className="tbl-cell">{data?.description}</TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontWeight={700} fontSize="13px" color="primary">
                                {data?.asset.vladimir_tag_number}
                              </Typography>
                              <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                                {data?.asset.asset_description}
                              </Typography>
                              <Typography
                                fontSize="12px"
                                color="text.light"
                                textOverflow="ellipsis"
                                width="300px"
                                overflow="hidden"
                              >
                                <Tooltip title={data?.asset.asset_specification} placement="bottom" arrow>
                                  {data?.asset.asset_specification}
                                </Tooltip>
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <Typography fontSize={10} color="gray">
                                {`(${data?.asset.one_charging?.code || "-"}) - ${
                                  data?.asset.one_charging?.name || "-"
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data?.asset.one_charging?.company_code || data?.asset?.company?.company_code}) - ${
                                  data?.asset.one_charging?.company_name || data?.asset?.company?.company_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${
                                  data?.asset.one_charging?.business_unit_code ||
                                  data?.asset?.business_unit?.business_unit_code
                                }) - ${
                                  data?.asset.one_charging?.business_unit_name ||
                                  data?.asset?.business_unit?.business_unit_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${
                                  data?.asset.one_charging?.department_code || data?.asset.department?.department_code
                                }) - ${
                                  data?.asset.one_charging?.department_name || data?.asset.department?.department_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data?.asset.one_charging?.unit_code || data?.asset.unit?.unit_code}) - ${
                                  data?.asset.one_charging?.unit_name || data?.asset.unit?.unit_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${data?.asset.one_charging?.subunit_code || data?.asset.subunit?.subunit_code}) - ${
                                  data?.asset.one_charging?.subunit_name || data?.asset.subunit?.subunit_name
                                }`}
                              </Typography>
                              <Typography fontSize={10} color="gray">
                                {`(${
                                  data?.asset.one_charging?.location_code || data?.asset.location?.location_code
                                }) - ${data?.asset.one_charging?.location_name || data?.asset.location?.location_name}`}
                              </Typography>
                            </TableCell>
                            <TableCell className="tbl-cell" align="center">
                              {data?.care_of?.name}
                            </TableCell>
                            <TableCell className="tbl-cell">
                              {DlAttachment(data?.evaluation_attachments[0]?.id)}
                            </TableCell>
                            <TableCell className="tbl-cell">
                              <StatusComponent faStatus="Repaired" />
                            </TableCell>
                            <TableCell className="tbl-cell">
                              {moment(data?.created_at).format("MMMM DD, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <CustomTablePagination
                  total={pulloutData?.total}
                  success={pulloutSuccess}
                  current_page={pulloutData?.current_page}
                  per_page={pulloutData?.per_page}
                  onPageChange={pageHandler}
                  onRowsPerPageChange={perPageHandler}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RepairMonitoring;
