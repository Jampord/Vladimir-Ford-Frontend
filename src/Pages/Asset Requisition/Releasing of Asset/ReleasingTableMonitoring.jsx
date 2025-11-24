import { useState } from "react";
import { useGetAssetReleasingQuery } from "../../../Redux/Query/Request/AssetReleasing";
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
  Tooltip,
  Typography,
} from "@mui/material";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { closeExport, openExport } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch, useSelector } from "react-redux";
import { IosShareRounded } from "@mui/icons-material";
import ExportReleasingOfAsset from "./ExportReleasingOfAsset";

const ReleasingTableMonitoring = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showExport = useSelector((state) => state.booleanState.exportFile);

  const {
    data: releasingData,
    isLoading: releasingLoading,
    isSuccess: releasingSuccess,
    isError: releasingError,
    error: errorData,
    refetch,
  } = useGetAssetReleasingQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      isReleased: 0,
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleViewData = (data) => {
    // const view = true;
    navigate(`/asset-requisition/requisition-releasing-monitoring/${data.warehouse_number?.warehouse_number}`, {
      state: { ...data },
    });
  };

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const openExportDialog = () => {
    dispatch(openExport());
    // setPrItems(data);
  };

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {releasingLoading && <MasterlistSkeleton onAdd={true} category />}
      {releasingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {releasingData && !releasingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

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
                      <TableCell className="tbl-cell">WH Transaction #</TableCell>
                      <TableCell className="tbl-cell">Vladimir Tag #</TableCell>
                      <TableCell className="tbl-cell">Type of Request</TableCell>
                      <TableCell className="tbl-cell">Oracle No.</TableCell>
                      <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                      <TableCell className="tbl-cell">Requestor</TableCell>
                      <TableCell className="tbl-cell">Accountability</TableCell>
                      <TableCell className="tbl-cell">Date Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {releasingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {releasingSuccess &&
                          [...releasingData?.data].map((data) => (
                            <TableRow
                              key={data.id}
                              hover
                              // onClick={() => handleViewData(data)}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                cursor: "pointer",
                              }}
                            >
                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Chip
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    color: "white",
                                    font: "bold 12px Roboto",
                                    backgroundColor: "quaternary.light",
                                  }}
                                  label={data.warehouse_number?.warehouse_number}
                                />
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data.is_printable === 1 ? data.vladimir_tag_number : "NON PRINTABLE"}
                                </Typography>
                                <Typography fontSize={12} color="secondary.light">
                                  ({data.warehouse?.id}) - {data.warehouse?.warehouse_name}
                                </Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600}>
                                  {data.asset_description}
                                </Typography>

                                <Typography
                                  fontSize={12}
                                  fontWeight={400}
                                  width="350px"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  color="text.light"
                                  noWrap
                                >
                                  <Tooltip title={data.asset_specification} placement="bottom" arrow>
                                    {data.asset_specification}
                                  </Tooltip>
                                </Typography>

                                <Typography fontSize={12} fontWeight={600} color="primary.main">
                                  {data.type_of_request?.type_of_request_name.toUpperCase()}
                                </Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={12} color="text.light">
                                  PR - {data.ymir_pr_number}
                                </Typography>
                                <Typography fontSize={12} color="text.light">
                                  PO - {data.po_number}
                                </Typography>
                                <Typography fontSize={12} color="text.light">
                                  RR - {data.rr_number}
                                </Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={10} color="gray">
                                  ({data?.one_charging?.code}) - {data?.one_charging?.name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data.company?.company_code}) - {data.company?.company_name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.business_unit?.business_unit_code}) - ${data.business_unit?.business_unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.department?.department_code}) - ${data.department?.department_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.unit?.unit_code}) - ${data.unit?.unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data.subunit?.subunit_code}) - ${data.subunit?.subunit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data.location?.location_code}) - {data.location?.location_name}
                                </Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell ">
                                <Typography fontSize={14} fontWeight={600}>
                                  {data.requestor?.employee_id}
                                </Typography>
                                <Typography
                                  fontSize={12}
                                >{`${data.requestor?.firstname} ${data.requestor?.lastname}`}</Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={14} fontWeight={data.accountability === "Common" ? 400 : 600}>
                                  {data.accountability}
                                </Typography>
                                {data.accountability !== "Common" && (
                                  <Typography fontSize={12}>{data.accountable}</Typography>
                                )}
                              </TableCell>
                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell tr-cen-pad45">
                                {moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

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
                  total={releasingData?.total}
                  success={releasingSuccess}
                  current_page={releasingData?.current_page}
                  per_page={releasingData?.per_page}
                  onPageChange={pageHandler}
                  onRowsPerPageChange={perPageHandler}
                />
              </Box>
            </Box>
          </Box>
        </>
      )}

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeExport())}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportReleasingOfAsset released={false} />
      </Dialog>
    </Stack>
  );
};

export default ReleasingTableMonitoring;
