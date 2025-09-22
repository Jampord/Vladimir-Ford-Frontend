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
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import { useGetAssetsToEvaluateApiQuery } from "../../../Redux/Query/Movement/Evaluation";
import { useState } from "react";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { Attachment, Construction, FindReplace, IosShareRounded, ScreenSearchDesktop } from "@mui/icons-material";
import { useDownloadTransferAttachment } from "../../../Hooks/useDownloadAttachment";
import ErrorFetching from "../../ErrorFetching";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import ToEvaluate from "./ToEvaluate";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, closeDialog1, openDialog, openDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FaStatusChange from "../../../Components/Reusable/FaStatusComponent";
import PulloutTimeline from "../PulloutTimeline";

const schema = yup.object().shape({
  pullout_ids: yup.array(),
});
const ListOfPullout = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [anchorEl, setAnchorEl] = useState(null);
  const [evaluation, setEvaluation] = useState("");
  const [transactionData, setTransactionData] = useState();

  console.log("evaluationzz", evaluation);

  const open = Boolean(anchorEl);
  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dispatch = useDispatch();

  const dialog = useSelector((state) => state.booleanState.dialog);
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

  const { watch, reset, register, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pullout_ids: [],
    },
  });

  const handleOpenEvaluateReturnDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setEvaluation("Return");
  };

  const handleOpenEvaluateReplacementDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setEvaluation("For Replacement");
  };

  const handleOpenEvaluateChangeDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setEvaluation("Change Care of");
  };

  const handleOpenEvaluateDisposalDialog = () => {
    dispatch(openDialog1());
    setAnchorEl(null);
    setEvaluation("For Disposal");
  };

  const handleAllHandler = (checked) => {
    if (checked) {
      setValue(
        "pullout_ids",
        evaluationData?.data?.map((item) => item.id?.toString())
      );
    } else {
      reset({ pullout_ids: [] });
    }
  };

  // Table Properties --------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    isSuccess: isEvaluationSuccess,
    isError: isEvaluationError,
    isFetching: isEvaluationFetching,
    error: errorData,
    refetch,
  } = useGetAssetsToEvaluateApiQuery(
    {
      page: page,
      per_page: perPage,
      status: "For Evaluation",
    },
    { refetchOnMountOrArgChange: true }
  );

  const DlAttachment = (transfer_number) => (
    <Tooltip title="Download Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: transfer_number })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleDownloadAttachment = (value) =>
    useDownloadTransferAttachment({
      attachments: "attachments",
      transfer_number: value?.asset?.attachments?.id,
    });

  const selectedItems = evaluationData?.data?.filter((item) => watch("pullout_ids").includes(item?.id?.toString()));

  // console.log("🧨🧨", watch("pullout_ids"));
  // console.log("👀", selectedItems);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewTimeline = (data) => {
    // console.log(data);
    dispatch(openDialog());
    setTransactionData(data);
  };

  return (
    <Stack className="category_height">
      {isEvaluationLoading && <MasterlistSkeleton onAdd={true} category />}
      {isEvaluationError && <ErrorFetching refetch={refetch} error={errorData} />}

      {evaluationData && !isEvaluationError && !isEvaluationLoading && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
            hideArchive
          />

          {(!isEvaluationLoading || !isEvaluationFetching) && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <ScreenSearchDesktop />}
                size="small"
                disabled={watch("pullout_ids").length === 0}
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
              >
                {isSmallScreen ? <ScreenSearchDesktop color="black" sx={{ fontSize: "20px" }} /> : "Evaluate"}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem dense onClick={handleOpenEvaluateReturnDialog}>
                  <ListItemIcon>
                    <Construction fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Repaired</ListItemText>
                </MenuItem>
                <MenuItem dense onClick={handleOpenEvaluateReplacementDialog}>
                  <ListItemIcon>
                    <FindReplace fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>For Replacement</ListItemText>
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
                                ?.every((item) => watch("pullout_ids").includes(item?.toString()))
                            }
                            onChange={(e) => {
                              handleAllHandler(e.target.checked);
                              // console.log(e.target.checked);
                            }}
                          />
                        }
                      />
                    </TableCell>
                    <TableCell className="tbl-cell-category">Request #</TableCell>
                    {/* <TableCell className="tbl-cell-category" align="center">
                      Vladimir Tag Number
                    </TableCell> */}
                    <TableCell className="tbl-cell-category">Description</TableCell>
                    <TableCell className="tbl-cell-category">Helpdesk #</TableCell>
                    <TableCell className="tbl-cell-category">Asset</TableCell>
                    <TableCell className="tbl-cell-category">Chart of Accounts</TableCell>
                    {/* <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell> */}
                    <TableCell className="tbl-cell-category" align="center">
                      Care of
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Evaluation Status
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Attachments
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Remarks
                    </TableCell>
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
                          <TableCell className="tbl-cell" size="small" align="center">
                            <FormControlLabel
                              value={item?.id}
                              sx={{ margin: "auto" }}
                              control={
                                <Checkbox
                                  size="small"
                                  {...register("pullout_ids")}
                                  checked={watch("pullout_ids").includes(item?.id?.toString())}
                                />
                              }
                            />
                          </TableCell>
                          <TableCell className="tbl-cell">{item?.id}</TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.description}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.helpdesk_number}
                          </TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontWeight={700} fontSize="13px" color="primary">
                              {item?.asset.vladimir_tag_number}
                            </Typography>
                            <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                              {item?.asset.asset_description}
                            </Typography>
                            <Tooltip title={item?.asset.asset_specification} placement="bottom">
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
                          <TableCell className="tbl-cell " align="center">
                            <Typography fontSize="12px" color="black" fontWeight="500">
                              {item?.care_of}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {
                              <Box onClick={() => handleViewTimeline(item)}>
                                <FaStatusChange faStatus={item?.evaluation} hover />
                              </Box>
                            }
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            <DlAttachment transfer_number={item?.id} />
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.remarks === null ? "-" : item?.remarks}
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
              // onClick={handleExport}
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
        open={dialog1}
        // onClose={() => {
        //   closeDialog();
        //   setEvaluation("");
        // }}
        maxWidth={"xl"}
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "15px" } }}
      >
        <ToEvaluate item={selectedItems} evaluation={evaluation} setEvaluation={setEvaluation} />
      </Dialog>

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
      >
        <PulloutTimeline data={transactionData} />
      </Dialog>
    </Stack>
  );
};

export default ListOfPullout;
