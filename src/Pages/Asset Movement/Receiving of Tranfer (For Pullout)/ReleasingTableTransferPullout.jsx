import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useGetPulloutTransferReceivingApiQuery } from "../../../Redux/Query/Movement/Pullout";
import { useState } from "react";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { MoveDownOutlined } from "@mui/icons-material";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";
import moment from "moment";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useDispatch, useSelector } from "react-redux";
import ReleasingModal from "./ReleasingModal";
import { openDialog } from "../../../Redux/StateManagement/booleanStateSlice";

const schema = yup.object().shape({
  transfer_ids: yup.array(),
});

const ReleasingTableTransferPullout = ({ received }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState.dialog);

  const {
    data: receivingData,
    isLoading: receivingLoading,
    isSuccess: receivingSuccess,
    isError: receivingError,
    error: errorData,
    refetch,
  } = useGetPulloutTransferReceivingApiQuery(
    {
      page: page,
      per_page: perPage,
      status: received ? "Released" : "For Release",
    },
    { refetchOnMountOrArgChange: true }
  );

  const { register, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      transfer_ids: [],
    },
  });

  const transferIdsAllHandler = (checked) => {
    if (checked) {
      setValue(
        "transfer_ids",
        receivingData.data?.map((item) => item?.id.toString())
      );
    } else {
      reset({ transfer_ids: [] });
    }
  };

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  // * Validation for Receiving
  const handleSelectedItems =
    receivingData?.data?.filter((item) => watch("transfer_ids").includes(item.id.toString())).length === 0;

  const validateSelectedItems = () => {
    if (handleSelectedItems) {
      return true;
    }
    return false;
  };

  const handleRelease = () => {
    dispatch(openDialog());
  };

  const areAllCOASame = (assets) => {
    if (assets) {
      if (assets?.length === 0) return true; // No assets to compare

      const oneCharging = assets[0]?.to_one_charging?.id;

      for (let i = 1; i < assets.length; i++) {
        if (assets[i]?.to_one_charging?.id !== oneCharging) {
          return false; // Found a different one charging
        }
      }
      return true; // All COA are the same
    }
  };

  const selectedItems = receivingData?.data?.filter((item) => watch("transfer_ids").includes(item?.id?.toString()));
  const result = areAllCOASame(selectedItems);

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {receivingLoading && <MasterlistSkeleton onAdd={true} category />}
      {receivingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {receivingData && !receivingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            {!received && (
              <Button
                variant="contained"
                onClick={handleRelease}
                size="small"
                startIcon={<MoveDownOutlined />}
                sx={{ position: "absolute", right: 0, top: -40 }}
                disabled={!watch("transfer_ids") || validateSelectedItems() || result === false}
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
                      {!received && (
                        <TableCell className="tbl-cell">
                          <Tooltip title="Select All" placement="top" arrow>
                            <FormControlLabel
                              sx={{ margin: "auto", align: "center" }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={
                                    !!receivingData?.data
                                      ?.map((mapItem) => mapItem?.id.toString())
                                      ?.every((item) => watch("transfer_ids").includes(item))
                                  }
                                />
                              }
                              onChange={(e) => {
                                transferIdsAllHandler(e.target.checked);
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell className="tbl-cell">Transaction #</TableCell>
                      <TableCell className="tbl-cell">Asset</TableCell>
                      <TableCell className="tbl-cell">Custodian</TableCell>
                      <TableCell className="tbl-cell">From</TableCell>
                      <TableCell className="tbl-cell">To</TableCell>
                      <TableCell className="tbl-cell">Asset Status</TableCell>
                      <TableCell className="tbl-cell">Date Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {receivingData?.data?.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      <>
                        {receivingSuccess &&
                          [...receivingData?.data].map((data) => (
                            <TableRow
                              key={data.id}
                              hover
                              // onClick={() => handleTableData(data)}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderBottom: 0,
                                },
                                cursor: "pointer",
                              }}
                            >
                              {!received && (
                                <TableCell className="tbl-cell" onClick={(e) => e.stopPropagation()}>
                                  <FormControlLabel
                                    value={data.id.toString()}
                                    sx={{ margin: "auto" }}
                                    // disabled={data.action === "view"}
                                    control={
                                      <Checkbox
                                        size="small"
                                        {...register("transfer_ids")}
                                        checked={watch("transfer_ids").includes(data.id.toString())}
                                      />
                                    }
                                  />
                                </TableCell>
                              )}
                              <TableCell className="tbl-cell">
                                <Chip
                                  size="small"
                                  variant="filled"
                                  sx={{
                                    color: "white",
                                    font: "bold 12px Roboto",
                                    backgroundColor: "quaternary.light",
                                  }}
                                  label={data.id}
                                />
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.vladimir_tag_number}
                                </Typography>
                                <Typography fontSize={12} fontWeight={600} color="secondary.light">
                                  {data?.description}
                                </Typography>
                              </TableCell>
                              <TableCell className="tbl-cell">
                                <Typography fontSize={14} fontWeight={600} color="secondary.main">
                                  {data?.accountable}
                                </Typography>

                                <Typography fontSize={13} fontWeight={400} color="secondary.main">
                                  {data?.accountability}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={10} color="gray">
                                  ({data?.from_one_charging?.code}) - {data?.from_one_charging?.name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.from_one_charging?.company_code}) - {data?.from_one_charging?.company_name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.from_one_charging?.business_unit_code}) - ${data?.from_one_charging?.business_unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.from_one_charging?.department_code}) - ${data?.from_one_charging?.department_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.from_one_charging?.unit_code}) - ${data?.from_one_charging?.unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.from_one_charging?.subunit_code}) - ${data?.from_one_charging?.subunit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.from_one_charging?.location_code}) - {data?.from_one_charging?.location_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography fontSize={10} color="gray">
                                  ({data?.to_one_charging?.code}) - {data?.to_one_charging?.name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.to_one_charging?.company_code}) - {data?.to_one_charging?.company_name}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.to_one_charging?.business_unit_code}) - ${data?.to_one_charging?.business_unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.to_one_charging?.department_code}) - ${data?.to_one_charging?.department_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.to_one_charging?.unit_code}) - ${data?.to_one_charging?.unit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  {`(${data?.to_one_charging?.subunit_code}) - ${data?.to_one_charging?.subunit_name}`}
                                </Typography>
                                <Typography fontSize={10} color="gray">
                                  ({data?.to_one_charging?.location_code}) - {data?.to_one_charging?.location_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <FaStatusChange faStatus={data?.status} data={data?.status} />
                              </TableCell>
                              <TableCell className="tbl-cell">{moment(data?.created_at).format("LL")}</TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <CustomTablePagination
                total={receivingData?.total}
                success={receivingSuccess}
                current_page={receivingData?.current_page}
                per_page={receivingData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </>
      )}

      <Dialog open={dialog} maxWidth="sm">
        <ReleasingModal selectedItems={selectedItems} />
      </Dialog>
    </Stack>
  );
};

export default ReleasingTableTransferPullout;
