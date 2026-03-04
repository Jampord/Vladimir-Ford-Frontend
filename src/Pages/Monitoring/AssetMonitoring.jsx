import { useCallback, useEffect, useState } from "react";
import FaStatusComponent from "../../Components/Reusable/FaStatusComponent";
import {
  Box,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryParams } from "../../Hooks/useQueryParams";
import { TabContext } from "@mui/lab";
import { useGetAssetMonitoringApiQuery } from "../../Redux/Query/Request/Requisition";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import { Visibility } from "@mui/icons-material";
import moment from "moment";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";

const AssetMonitoring = () => {
  const { getParam, getNumericParam, setMultipleParams } = useQueryParams();

  const [search, setSearch] = useState(getParam("search") || "");
  const [status, setStatus] = useState(getParam("status") || "active");
  const [perPage, setPerPage] = useState(getNumericParam("per_page", 25));
  const [page, setPage] = useState(getNumericParam("page", 1));
  const [filterValue, setFilterValue] = useState(getParam("filterValue") || "1");

  const {
    data: requisitionData,
    isLoading: requisitionLoading,
    isSuccess: requisitionSuccess,
    isError: requisitionError,
    isFetching: requisitionFetching,
    error: errorData,
    refetch,
  } = useGetAssetMonitoringApiQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      movement_type:
        filterValue === "2"
          ? "Transfer"
          : filterValue === "3"
          ? "Pullout"
          : filterValue === "4"
          ? "Spare"
          : filterValue === "5"
          ? "For Bidding"
          : filterValue === "6"
          ? "For Disposal"
          : filterValue === "7"
          ? "For Safe-Keeping"
          : filterValue === "8"
          ? "Repair"
          : "",
    },
    { refetchOnMountOrArgChange: true }
  );

  // Update URL when state changes
  // Memoize the update function
  const updateUrlParams = useCallback(() => {
    setMultipleParams({
      page: page,
      per_page: perPage,
      search: search,
      status: status,
      tab: filterValue,
    });
  }, [page, perPage, search, status, filterValue, setMultipleParams]);

  // Update URL when state changes - but only when values actually change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]); // Now this only runs when the dependencies of updateUrlParams change

  // Table Sorting --------------------------------
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("id");

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const comparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const onSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Table Properties --------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleChange = (event, newValue) => {
    setFilterValue(newValue);
    setPage(1);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Asset Monitoring
      </Typography>

      <Box>
        <TabContext value={filterValue}>
          <Tabs onChange={handleChange} value={filterValue} variant="scrollable" scrollButtons="auto">
            <Tab label="ALL" value="1" className={filterValue === "1" ? "tab__background" : null} />
            <Tab label="Transfer" value="2" className={filterValue === "2" ? "tab__background" : null} />
            <Tab label="Pullout" value="3" className={filterValue === "3" ? "tab__background" : null} />
            <Tab label="Spare" value="4" className={filterValue === "4" ? "tab__background" : null} />
            <Tab label="For Bidding" value="5" className={filterValue === "5" ? "tab__background" : null} />
            <Tab label="For Disposal" value="6" className={filterValue === "6" ? "tab__background" : null} />
            <Tab label="For Safekeeping" value="7" className={filterValue === "7" ? "tab__background" : null} />
            <Tab label="Repair" value="8" className={filterValue === "8" ? "tab__background" : null} />
          </Tabs>
        </TabContext>

        <Stack className="category_height">
          {requisitionLoading && <MasterlistSkeleton category={true} />}
          {requisitionError && <ErrorFetching refetch={refetch} error={errorData} />}
          {requisitionData && !requisitionError && (
            <Box className="mcontainer__wrapper">
              <MasterlistToolbar
                onStatusChange={setStatus}
                onSearchChange={setSearch}
                onSetPage={setPage}
                // setRequestFilter={setRequestFilter}
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
                        <TableCell className="tbl-cell">
                          <TableSortLabel
                            active={orderBy === `transaction_number`}
                            direction={orderBy === `transaction_number` ? order : `asc`}
                            onClick={() => onSort(`transaction_number`)}
                          >
                            Transaction No.
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell tr-cen-pad45">Requestor</TableCell>

                        <TableCell className="tbl-cell">
                          <TableSortLabel
                            active={orderBy === `acquisition_details`}
                            direction={orderBy === `acquisition_details` ? order : `asc`}
                            onClick={() => onSort(`acquisition_details`)}
                          >
                            Asset Details
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell tr-cen-pad45">
                          <TableSortLabel
                            active={orderBy === `pr_number`}
                            direction={orderBy === `pr_number` ? order : `asc`}
                            onClick={() => onSort(`pr_number`)}
                          >
                            PR Number
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell tr-cen-pad45">
                          <TableSortLabel
                            active={orderBy === `item_count`}
                            direction={orderBy === `item_count` ? order : `asc`}
                            onClick={() => onSort(`item_count`)}
                          >
                            Quantity
                          </TableSortLabel>
                        </TableCell>

                        <TableCell className="tbl-cell tr-cen-pad45">Accountability</TableCell>

                        <TableCell className="tbl-cell tr-cen-pad45">Care of</TableCell>

                        {filterValue == "2" && <TableCell className="tbl-cell tr-cen-pad45">Transfer From</TableCell>}
                        {filterValue == "2" && <TableCell className="tbl-cell tr-cen-pad45">Transfer To</TableCell>}

                        <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>

                        {filterValue == "2" && <TableCell className="tbl-cell tr-cen-pad45">Date Received</TableCell>}
                        <TableCell className="tbl-cell tr-cen-pad45">
                          <TableSortLabel
                            active={orderBy === `created_at`}
                            direction={orderBy === `created_at` ? order : `asc`}
                            onClick={() => onSort(`created_at`)}
                          >
                            Date Created
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {requisitionData?.data?.length === 0 ? (
                        <NoRecordsFound heightData="medium" />
                      ) : (
                        <>
                          {requisitionFetching || requisitionLoading ? (
                            <LoadingData />
                          ) : (
                            requisitionSuccess &&
                            [...requisitionData?.data]?.sort(comparator(order, orderBy))?.map((data) => (
                              <TableRow
                                key={data.id}
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    borderBottom: 0,
                                  },
                                }}
                              >
                                <TableCell className="tbl-cell text-weight">{data.transaction_number || "-"}</TableCell>
                                <TableCell className="tbl-cell">
                                  <Typography fontSize={12} fontWeight={700} color="secondary.main">
                                    {data.requestor?.firstname || "-"}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={600} color="secondary.main">
                                    {data.requestor?.lastname || "-"}
                                  </Typography>
                                  <Typography fontSize={11} fontWeight={500} color="info.main">
                                    {data.requestor?.username || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell className="tbl-cell">
                                  <Typography fontSize={12} fontWeight={600} color="primary">
                                    {data.vladimir_tag_number || "-"}
                                  </Typography>
                                  <Typography
                                    fontSize={14}
                                    fontWeight={600}
                                    maxWidth="440px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    color="secondary.main"
                                  >
                                    <Tooltip title={<>{data.asset_specification}</>} placement="top-start" arrow>
                                      {data.asset_description}
                                    </Tooltip>
                                  </Typography>
                                  <Typography fontSize={12} color="secondary.light">
                                    {data?.warehouse
                                      ? `(${data.warehouse?.id}) - ${data.warehouse?.warehouse_name}`
                                      : "-"}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell">
                                  <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                    {data.ymir_pr_number || "-"}
                                  </Typography>
                                </TableCell>

                                <TableCell className="tbl-cell tr-cen-pad45">{data.quantity}</TableCell>
                                <TableCell className="tbl-cell tr-cen-pad45">
                                  <Typography fontSize={12} fontWeight={600} color="secondary.main">
                                    {data.accountability || "-"}
                                  </Typography>
                                  <Typography fontSize={12} fontWeight={400} color="secondary.main">
                                    {data.accountable || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell className="tbl-cell tr-cen-pad45">
                                  <Typography fontSize={12} fontWeight={500} color="secondary.main">
                                    {data.care_of || "-"}
                                  </Typography>
                                </TableCell>
                                {filterValue == "2" && (
                                  <TableCell className="tbl-cell tr-cen-pad45">
                                    <Typography fontSize={12} fontWeight={450} color="secondary.main">
                                      {data?.one_charging?.name || "-"}
                                    </Typography>
                                  </TableCell>
                                )}
                                {filterValue == "2" && (
                                  <TableCell className="tbl-cell tr-cen-pad45">
                                    <Typography fontSize={12} fontWeight={450} color="secondary.main">
                                      {data?.transfer[0]?.one_charging?.name || "-"}
                                    </Typography>
                                  </TableCell>
                                )}
                                <TableCell className="tbl-cell tr-cen-pad45">
                                  {<FaStatusComponent faStatus={data?.asset_status?.asset_status_name} />}
                                </TableCell>

                                {filterValue == "2" && (
                                  <TableCell className="tbl-cell tr-cen-pad45">
                                    {moment(data?.transfer[0]?.created_at || "-").format("MMM DD, YYYY")}
                                  </TableCell>
                                )}
                                <TableCell className="tbl-cell tr-cen-pad45">
                                  {moment(data.created_at).format("MMM DD, YYYY")}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <CustomTablePagination
                  total={requisitionData?.total}
                  success={requisitionSuccess}
                  current_page={requisitionData?.current_page}
                  per_page={requisitionData?.per_page}
                  onPageChange={pageHandler}
                  onRowsPerPageChange={perPageHandler}
                />
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default AssetMonitoring;
