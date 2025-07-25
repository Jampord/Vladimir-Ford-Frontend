import React, { useEffect, useState } from "react";
import Moment from "moment";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import ErrorFetching from "../../ErrorFetching";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";

// RTK
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { openConfirm, closeConfirm, onLoading } from "../../../Redux/StateManagement/confirmSlice";

// MUI
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControlLabel,
  Grow,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Help, IosShareRounded, LibraryAdd, Output, Report, ReportProblem, Visibility } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { closeDialog, closeExport, openDialog, openExport } from "../../../Redux/StateManagement/booleanStateSlice";

import { useGetAssetReleasingQuery } from "../../../Redux/Query/Request/AssetReleasing";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AddReleasingInfo from "./AddReleasingInfo";
import ExportReleasingOfAsset from "./ExportReleasingOfAsset";

const schema = yup.object().shape({
  warehouse_number_id: yup.array(),
});

const ReleasingTable = (props) => {
  const { released } = props;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [wNumber, setWNumber] = useState([]);

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  const dialog = useSelector((state) => state.booleanState.dialog);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setError,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      warehouse_number_id: [],
    },
  });

  //* Table Sorting -------------------------------------------------------
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

  //* Table Properties ---------------------------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

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
      released: released ? 1 : 0,
    },
    { refetchOnMountOrArgChange: true }
  );

  const dispatch = useDispatch();

  const handleReleasing = () => {
    setWNumber({
      warehouse_number_id: watch("warehouse_number_id"),
    });
    dispatch(openDialog());
  };

  // console.log("👀👀👀", watch("warehouse_number_id"));

  const handleViewData = (data) => {
    navigate(`/asset-requisition/requisition-releasing/${data.warehouse_number?.warehouse_number}`, {
      state: { ...data },
    });
  };

  const warehouseNumberAllHandler = (checked) => {
    if (checked) {
      setValue(
        "warehouse_number_id",
        releasingData?.data?.map((item) => item.warehouse_number?.warehouse_number)
      );
    } else {
      reset({ warehouse_number_id: [] });
    }
  };

  const onSetPage = () => {
    setPage(1);
  };

  // * Validation for Releasing
  const handleSelectedItems = releasingData?.data?.filter((item) =>
    watch("warehouse_number_id").includes(item.warehouse_number?.warehouse_number)
  );

  const selectedItem = handleSelectedItems ? handleSelectedItems[0] : null;

  // console.log("handleSelectedItems", allEqual(handleSelectedItems));
  // console.log("handleSelectedItems", handleSelectedItems);
  // console.log("selectedItem", selectedItem);

  //**Validation for Department of Selected Items
  const commonData = [...new Set(handleSelectedItems?.map((item) => item.location.id))].length === 1;
  //**Validation for Location of Selected Items
  const personalData = [...new Set(handleSelectedItems?.map((item) => item.department.id))].length === 1;

  // const personalData = handleSelectedItems?.every((item) => item?.accountability !== "Common");

  // console.log("commonData", commonData);

  // const validateSelectedItems = () => {
  //   if (commonData && personalData) {
  //     return true;
  //   }
  //   return !commonData && !personalData;
  // };
  // * -------------------------------------------------------------------

  // console.log("releasingData", releasingData?.data);
  // console.log("wnumber", wNumber);

  const showExport = useSelector((state) => state.booleanState.exportFile);

  const openExportDialog = () => {
    dispatch(openExport());
    // setPrItems(data);
  };

  const areAllCOASame = (assets) => {
    if (assets) {
      if (assets?.length === 0) return true; // No assets to compare

      const firstDepartment = assets[0]?.department?.department_name;
      const firstBusinessUnit = assets[0]?.business_unit?.business_unit_name;
      const firstCompany = assets[0]?.company?.company_name;
      const firstUnit = assets[0]?.unit?.unit_name;
      const firstSubunit = assets[0]?.subunit?.subunit_name;
      const firstLocation = assets[0]?.location?.location_name;

      for (let i = 1; i < assets.length; i++) {
        if (assets[i]?.department?.department_name !== firstDepartment) {
          return false; // Found a different department
        }
        if (assets[i]?.business_unit?.business_unit_name !== firstBusinessUnit) {
          return false; // Found a different business unit
        }
        if (assets[i]?.company?.company_name !== firstCompany) {
          return false; // Found a different company
        }
        if (assets[i]?.unit?.unit_name !== firstUnit) {
          return false; // Found a different unit
        }
        if (assets[i]?.subunit?.subunit_name !== firstSubunit) {
          return false; // Found a different subunit
        }
        if (assets[i]?.location?.location_name !== firstLocation) {
          return false; // Found a different location
        }
      }
      return true; // All COA are the same
    }
  };

  const result = areAllCOASame(handleSelectedItems);
  // console.log("result: ", result);

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {releasingLoading && <MasterlistSkeleton onAdd={true} category />}
      {releasingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {releasingData && !releasingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />
            {!released && (
              <Button
                variant="contained"
                onClick={() => handleReleasing()}
                size="small"
                startIcon={<Output />}
                sx={{ position: "absolute", right: 0, top: -40 }}
                disabled={
                  !watch("warehouse_number_id") ||
                  // || validateSelectedItems()
                  (commonData === false && personalData === false) ||
                  result === false
                }
              >
                Release
              </Button>
            )}

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
                      {!released && (
                        <TableCell align="center" className="tbl-cell">
                          <FormControlLabel
                            sx={{ margin: "auto", align: "center" }}
                            control={
                              <Checkbox
                                value=""
                                size="small"
                                checked={
                                  !!releasingData?.data
                                    ?.map((mapItem) => mapItem?.warehouse_number?.warehouse_number)
                                    ?.every((item) => watch("warehouse_number_id").includes(item))
                                }
                                onChange={(e) => {
                                  warehouseNumberAllHandler(e.target.checked);
                                  // console.log(e.target.checked);
                                }}
                              />
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `warehouse_number`}
                          direction={orderBy === `warehouse_number` ? order : `asc`}
                          onClick={() => onSort(`warehouse_number`)}
                        >
                          WH Transaction #
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `vladimir_tag_number`}
                          direction={orderBy === `vladimir_tag_number` ? order : `asc`}
                          onClick={() => onSort(`vladimir_tag_number`)}
                        >
                          Vladimir Tag #
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `asset_description`}
                          direction={orderBy === `asset_description` ? order : `asc`}
                          onClick={() => onSort(`asset_description`)}
                        >
                          Type of Request
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="tbl-cell">Oracle No.</TableCell>
                      <TableCell className="tbl-cell">Chart of Accounts</TableCell>

                      <TableCell className="tbl-cell">
                        <TableSortLabel
                          active={orderBy === `requestor`}
                          direction={orderBy === `requestor` ? order : `asc`}
                          onClick={() => onSort(`requestor`)}
                        >
                          Requestor
                        </TableSortLabel>
                      </TableCell>

                      {released && (
                        <TableCell className="tbl-cell">
                          <TableSortLabel
                            active={orderBy === `received_by`}
                            direction={orderBy === `received_by` ? order : `asc`}
                            onClick={() => onSort(`received_by`)}
                          >
                            Received By
                          </TableSortLabel>
                        </TableCell>
                      )}

                      <TableCell className="tbl-cell">Accountability</TableCell>

                      {released && <TableCell className="tbl-cell">Date Released</TableCell>}
                      <TableCell className="tbl-cell">
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
                    {releasingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {releasingSuccess &&
                          [...releasingData?.data]?.sort(comparator(order, orderBy))?.map((data) => (
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
                              {!released && (
                                <TableCell className="tbl-cell" size="small" align="center">
                                  <FormControlLabel
                                    value={data.warehouse_number?.warehouse_number}
                                    sx={{ margin: "auto" }}
                                    disabled={data.action === "view"}
                                    control={
                                      <Checkbox
                                        size="small"
                                        {...register("warehouse_number_id")}
                                        checked={watch("warehouse_number_id").includes(
                                          data.warehouse_number?.warehouse_number
                                        )}
                                      />
                                    }
                                  />
                                </TableCell>
                              )}
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
                                {/* <Typography fontSize={14} fontWeight={600} color="quaternary.main">
                                  {data.warehouse_number?.warehouse_number}
                                </Typography> */}
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

                                <Tooltip title={data.asset_specification} placement="bottom-start" arrow>
                                  <Typography
                                    fontSize={12}
                                    fontWeight={400}
                                    width="350px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    color="text.light"
                                    noWrap
                                  >
                                    {data.asset_specification}
                                  </Typography>
                                </Tooltip>

                                <Typography fontSize={12} fontWeight={600} color="primary.main">
                                  {data.type_of_request?.type_of_request_name.toUpperCase()}
                                </Typography>
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={12} color="text.light">
                                  PR - {data.ymir_pr_number}
                                  {/* PR - {data.pr_number} */}
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
                                {/* <Typography fontSize={10} color="gray">
                                  ({data.account_title?.account_title_code}) - {data.account_title?.account_title_name}
                                </Typography> */}
                              </TableCell>

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell ">
                                <Typography fontSize={14} fontWeight={600}>
                                  {data.requestor?.employee_id}
                                </Typography>
                                <Typography
                                  fontSize={12}
                                >{`${data.requestor?.firstname} ${data.requestor?.lastname}`}</Typography>
                              </TableCell>

                              {released && (
                                <TableCell onClick={() => handleViewData(data)} className="tbl-cell ">
                                  {data.received_by}
                                </TableCell>
                              )}

                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell">
                                <Typography fontSize={14} fontWeight={data.accountability === "Common" ? 400 : 600}>
                                  {data.accountability}
                                </Typography>
                                {data.accountability !== "Common" && (
                                  <Typography fontSize={12}>{data.accountable}</Typography>
                                )}
                              </TableCell>
                              {released && (
                                <TableCell onClick={() => handleViewData(data)} className="tbl-cell tr-cen-pad45">
                                  {Moment(data.release_date).format("MMM DD, YYYY")}
                                </TableCell>
                              )}
                              <TableCell onClick={() => handleViewData(data)} className="tbl-cell tr-cen-pad45">
                                {Moment(data.created_at).format("MMM DD, YYYY")}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
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

              {result === false && (
                <Typography noWrap fontSize="13px" color="error">
                  Selected items does not have the same COA.
                </Typography>
              )}

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
        </>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            margin: "0",
            maxWidth: "700px",
            py: "20px",
            px: "10px",
            overflow: "hidden",
            // width: "2000px",
          },
        }}
      >
        <AddReleasingInfo
          data={releasingData?.data}
          warehouseNumber={wNumber}
          commonData={commonData}
          // personalData={personalData}
          selectedItems={selectedItem}
        />
      </Dialog>

      <Dialog
        open={showExport}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeExport())}
        PaperProps={{ sx: { maxWidth: "1320px", borderRadius: "10px", p: 3 } }}
      >
        <ExportReleasingOfAsset released={!!released} />
      </Dialog>
    </Stack>
  );
};

export default ReleasingTable;
