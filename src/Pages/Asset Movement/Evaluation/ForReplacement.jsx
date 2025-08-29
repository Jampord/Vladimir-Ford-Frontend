import { useState } from "react";
import { useGetAssetsForReplacementEvaluateApiQuery } from "../../../Redux/Query/Movement/Evaluation";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  Grow,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import StatusComponent from "../../../Components/Reusable/FaStatusComponent";
import moment from "moment";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Delete, FileCopy, Handyman, More } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, closeDialog1, openDialog, openDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import ForReplacementDialog from "./ForReplacementDialog";
import PulloutTimeline from "../PulloutTimeline";

const schema = yup.object().shape({
  item_id: yup.array(),
});

const ForReplacement = ({ tab }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [transactionData, setTransactionData] = useState();

  const open = Boolean(anchorEl);
  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dispatch = useDispatch();
  const dialog1 = useSelector((state) => state.booleanState.dialog);
  const dialog2 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    isSuccess: isEvaluationSuccess,
    isError: isEvaluationError,
    isFetching: isEvaluationFetching,
    error: errorData,
    refetch,
  } = useGetAssetsForReplacementEvaluateApiQuery(
    {
      page: page,
      per_page: perPage,
      status: tab === "5" ? "For Replacement" : tab === "6" ? "Spare" : "Disposal",
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const { watch, reset, register, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      item_id: [],
    },
  });

  const handleAllHandler = (checked) => {
    if (checked) {
      setValue(
        "item_id",
        evaluationData?.data?.map((item) => item.id?.toString())
      );
    } else {
      reset({ item_id: [] });
    }
  };

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSpareDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setAction("spare");
  };

  const handleOpenDisposalDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setAction("disposal");
  };

  const handleViewTimeline = (data) => {
    dispatch(openDialog());
    setTransactionData(data);
  };

  console.log("watch", watch("item_id"));

  const selectedItems = evaluationData?.data?.filter((item) => watch("item_id").includes(item?.id?.toString()));

  console.log("selectedItems", selectedItems);

  return (
    <Stack className="category_height">
      {isEvaluationLoading && <MasterlistSkeleton onAdd={true} category />}
      {isEvaluationError && <ErrorFetching refetch={refetch} error={errorData} />}
      {evaluationData && !isEvaluationError && !isEvaluationLoading && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

          {(!isEvaluationLoading || !isEvaluationFetching) && tab === "5" && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <More />}
                size="small"
                disabled={watch("item_id").length === 0}
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
              >
                {isSmallScreen ? <More color="black" sx={{ fontSize: "20px" }} /> : "Action"}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem dense onClick={handleOpenSpareDialog}>
                  <ListItemIcon>
                    <FileCopy fontSize="small" sx={{ color: "#5102d1" }} />
                  </ListItemIcon>
                  <ListItemText>Spare</ListItemText>
                </MenuItem>
                <MenuItem dense onClick={handleOpenDisposalDialog}>
                  <ListItemIcon>
                    <Delete fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText>For Disposal</ListItemText>
                </MenuItem>
                {/* <MenuItem onClick={handleOpenEvaluateChangeDialog}>Change Care of</MenuItem> */}
                {/* <MenuItem onClick={handleOpenEvaluateDisposalDialog}>For Disposal</MenuItem> */}
              </Menu>
            </Box>
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
                    {tab === "5" && (
                      <TableCell align="center" className="tbl-cell">
                        <FormControlLabel
                          sx={{ margin: "auto", align: "center" }}
                          control={
                            <Checkbox
                              value=""
                              size="small"
                              checked={
                                !!evaluationData?.data
                                  ?.map((mapItem) => mapItem?.id?.toString())
                                  ?.every((item) => watch("item_id").includes(item?.toString()))
                              }
                              onChange={(e) => {
                                handleAllHandler(e.target.checked);
                                // console.log(e.target.checked);
                              }}
                            />
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className="tbl-cell">Request #</TableCell>
                    <TableCell className="tbl-cell">Description</TableCell>
                    <TableCell className="tbl-cell">Asset</TableCell>
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Evaluation
                    </TableCell>
                    <TableCell className="tbl-cell">Requestor</TableCell>
                    <TableCell className="tbl-cell">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {evaluationData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {evaluationData?.data.map((item) => (
                        <TableRow
                          key={item?.id}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                          hover
                        >
                          {tab === "5" && (
                            <TableCell className="tbl-cell" size="small" align="center">
                              <FormControlLabel
                                value={item?.id}
                                sx={{ margin: "auto" }}
                                control={
                                  <Checkbox
                                    size="small"
                                    {...register("item_id")}
                                    checked={watch("item_id").includes(item?.id?.toString())}
                                  />
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="tbl-cell">{item?.id}</TableCell>
                          <TableCell className="tbl-cell">{item?.description}</TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontWeight={700} fontSize="13px" color="primary">
                              {item?.asset.vladimir_tag_number}
                            </Typography>
                            <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                              {item?.asset.asset_description}
                            </Typography>
                            <Tooltip title={item?.asset.asset_specification} placement="bottom" arrow>
                              <Typography
                                fontSize="12px"
                                color="text.light"
                                textOverflow="ellipsis"
                                width="300px"
                                overflow="hidden"
                              >
                                {item?.asset.asset_specification}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.code || "-"}) - ${item?.asset.one_charging?.name || "-"}`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.company_code || item?.asset?.company?.company_code}) - ${
                                item?.asset.one_charging?.company_name || item?.asset?.company?.company_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${
                                item?.asset.one_charging?.business_unit_code ||
                                item?.asset?.business_unit?.business_unit_code
                              }) - ${
                                item?.asset.one_charging?.business_unit_name ||
                                item?.asset?.business_unit?.business_unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${
                                item?.asset.one_charging?.department_code || item?.asset.department?.department_code
                              }) - ${
                                item?.asset.one_charging?.department_name || item?.asset.department?.department_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.unit_code || item?.asset.unit?.unit_code}) - ${
                                item?.asset.one_charging?.unit_name || item?.asset.unit?.unit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.subunit_code || item?.asset.subunit?.subunit_code}) - ${
                                item?.asset.one_charging?.subunit_name || item?.asset.subunit?.subunit_name
                              }`}
                            </Typography>
                            <Typography fontSize={10} color="gray">
                              {`(${item?.asset.one_charging?.location_code || item?.asset.location?.location_code}) - ${
                                item?.asset.one_charging?.location_name || item?.asset.location?.location_name
                              }`}
                            </Typography>
                          </TableCell>

                          <TableCell className="tbl-cell" align="center">
                            {
                              <Box onClick={() => handleViewTimeline(item)}>
                                <StatusComponent faStatus={item?.evaluation} hover />
                              </Box>
                            }
                          </TableCell>
                          <TableCell className="tbl-cell">
                            <Typography fontSize={12} fontWeight={700} color="primary.main">
                              {item.requester.employee_id}
                            </Typography>
                            <Typography fontSize={11} fontWeight={500} color="secondary.main">
                              {item.requester.first_name}
                            </Typography>
                            <Typography fontSize={11} fontWeight={500} color="secondary.main">
                              {item.requester.last_name}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell">{moment(item?.created_at).format("MMMM DD, YYYY")}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomTablePagination
              total={evaluationData?.total}
              success={isEvaluationSuccess}
              current_page={evaluationData?.current_page}
              per_page={evaluationData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}

      <Dialog
        open={dialog2}
        maxWidth={"xs"}
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "15px" } }}
      >
        <ForReplacementDialog
          item={watch("item_id")}
          action={action}
          setAction={setAction}
          reset={reset}
          selectedItems={selectedItems}
        />
      </Dialog>

      <Dialog
        open={dialog1}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <PulloutTimeline data={transactionData} />
      </Dialog>
    </Stack>
  );
};

export default ForReplacement;
