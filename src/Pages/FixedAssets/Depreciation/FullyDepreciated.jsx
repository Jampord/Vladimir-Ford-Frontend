import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import { useGetFixedAssetApiQuery } from "../../../Redux/Query/FixedAsset/FixedAssets";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import moment from "moment";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useNavigate } from "react-router-dom";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";

const FullyDepreciated = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("For Approval");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const {
    data: fixedAssetData,
    isLoading: fixedAssetLoading,
    isFetching: fixedAssetFetching,
    isSuccess: fixedAssetSuccess,
    isError: fixedAssetError,
    error: errorData,
    refetch,
  } = useGetFixedAssetApiQuery({
    search: search,
    status: status,
    per_page: perPage,
    page: page,
    filter: "Fully Depreciated",
  });

  const handleTableData = (data) => {
    navigate(`/fixed-asset/depreciation/${data.vladimir_tag_number}`, {
      state: { ...data, status },
    });
  };

  return (
    <Stack className="category_height">
      {fixedAssetLoading && <MasterlistSkeleton onAdd={false} />}
      {fixedAssetError && <ErrorFetching refetch={refetch} error={errorData} />}
      {fixedAssetData && !fixedAssetError && (
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
                    <TableCell className="tbl-cell-category ">Vladimir Tag #</TableCell>
                    <TableCell className="tbl-cell-category ">Chart of Account</TableCell>
                    <TableCell className="tbl-cell-category ">Accounting Entries</TableCell>
                    <TableCell className="tbl-cell-category text-center">Status</TableCell>
                    <TableCell className="tbl-cell-category text-center">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {fixedAssetData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {fixedAssetFetching ? (
                        <LoadingData />
                      ) : (
                        fixedAssetSuccess &&
                        [...fixedAssetData.data]?.map((data, index) => {
                          return (
                            <TableRow
                              key={index}
                              hover
                              onClick={() => handleTableData(data)}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                cursor: "pointer",
                              }}
                            >
                              {/* <TableCell sx={{ display: "none" }}>
                                    {data.id}
                                  </TableCell> */}

                              <TableCell className="tbl-cell-fa">
                                <Typography
                                  variant="h6"
                                  fontSize="15px"
                                  color={data?.is_additional_cost ? "text.light" : "secondary.main"}
                                  fontWeight={data?.is_additional_cost ? null : "bold"}
                                >
                                  {data.is_additional_cost === 0 ? (
                                    data.is_printable === 1 ? (
                                      data.vladimir_tag_number
                                    ) : (
                                      <Typography fontSize="14px" fontWeight={500} color="secondary">
                                        NON-PRINTABLE
                                      </Typography>
                                    )
                                  ) : (
                                    data.vladimir_tag_number
                                  )}
                                  {data.is_additional_cost === 1 ? `-${data.add_cost_sequence}` : null}
                                </Typography>
                                <Typography fontSize="12px" color="gray">
                                  {data.asset_description}
                                </Typography>
                                <Typography
                                  fontSize="12px"
                                  fontWeight={data.is_additional_cost ? null : "bold"}
                                  color={data.is_additional_cost === 0 ? "quaternary.main" : "quaternary.light"}
                                >
                                  {/* {data.is_printable === 1
                                      ? data.is_additional_cost === 0
                                        ? `MAIN ASSET - ${data.additional_cost_count}`
                                        : `(ADDITIONAL COST)`
                                      : null} */}
                                  {data.is_additional_cost === 0
                                    ? `MAIN ASSET - ${data.additional_cost_count}`
                                    : `(ADDITIONAL COST)`}
                                </Typography>
                                <Typography fontSize="12px" color="primary.main" fontWeight="bold">
                                  {data.type_of_request.type_of_request_name.toUpperCase()}
                                </Typography>
                              </TableCell>

                              {/* <TableCell className="tbl-cell-fa">
                                <Typography variant="p" fontSize="14px" color="secondary" fontWeight="bold">
                                  {data.capex.capex}
                                </Typography>
                                <Typography fontSize="12px" color="gray">
                                  {data.capex.project_name}
                                </Typography>
  
                                <Typography variant="p" fontSize="12px" color="secondary.light" fontWeight="bold">
                                  {data.sub_capex.sub_capex} ({data.sub_capex.sub_project})
                                </Typography>
                              </TableCell>
  
                              <TableCell className="tbl-cell-fa">
                                <Typography fontSize="14px" color="secondary">
                                  {data.division.division_name}
                                </Typography>
                              </TableCell> */}

                              <TableCell className="tbl-cell-fa">
                                <Typography fontSize="10px" color="gray">
                                  {data.company.company_code}
                                  {" - "} {data.company.company_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.business_unit?.business_unit_code}
                                  {" - "}
                                  {data.business_unit?.business_unit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.department.department_code}
                                  {" - "}
                                  {data.department.department_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.unit?.unit_code}
                                  {" - "}
                                  {data.unit?.unit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.subunit?.subunit_code}
                                  {" - "}
                                  {data.subunit?.subunit_name}
                                </Typography>
                                <Typography fontSize="10px" color="gray">
                                  {data.location.location_code} {" - "}
                                  {data.location.location_name}
                                </Typography>
                                {/* <Typography fontSize="10px" color="gray">
                                    {data.account_title.account_title_code}
                                    {" - "}
                                    {data.account_title.account_title_name}
                                  </Typography> */}
                              </TableCell>

                              <TableCell className="tbl-cell-category capitalized">
                                <Typography fontSize={11} color="secondary.light" noWrap>
                                  Inital Debit : ({data.initial_debit?.account_title_code})-
                                  {data.initial_debit?.account_title_name}
                                </Typography>
                                <Typography fontSize={11} color="secondary.light" noWrap>
                                  Inital Credit : ({data.initial_credit?.account_title_code})-{" "}
                                  {data.initial_credit?.account_title_name}
                                </Typography>
                                <Typography fontSize={11} color="secondary.light" noWrap>
                                  Depreciation Debit : ({data.depreciation_debit?.account_title_code})-
                                  {data.depreciation_debit?.account_title_name}
                                </Typography>
                                <Typography fontSize={11} color="secondary.light" noWrap>
                                  Depreciation Credit : ({data.depreciation_credit?.account_title_code})-{" "}
                                  {data.depreciation_credit?.account_title_name}
                                </Typography>
                              </TableCell>

                              <TableCell className="tbl-cell-fa tr-cen-pad45">
                                <FaStatusChange
                                  faStatus={data.asset_status.asset_status_name}
                                  data={data.asset_status.asset_status_name}
                                />
                              </TableCell>

                              <TableCell className="tbl-cell-fa tr-cen-pad45">
                                {moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <CustomTablePagination
            total={fixedAssetData?.total}
            success={fixedAssetSuccess}
            current_page={fixedAssetData?.current_page}
            per_page={fixedAssetData?.per_page}
            onPageChange={pageHandler}
            onRowsPerPageChange={perPageHandler}
            removeShadow
          />
        </Box>
      )}
    </Stack>
  );
};

export default FullyDepreciated;
