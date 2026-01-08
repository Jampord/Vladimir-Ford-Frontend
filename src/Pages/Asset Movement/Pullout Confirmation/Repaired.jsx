import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControlLabel,
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
  useMediaQuery,
} from "@mui/material";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import {
  useGetPulloutConfirmationApiQuery,
  usePostPulloutConfirmationApiMutation,
} from "../../../Redux/Query/Movement/Pullout";
import ErrorFetching from "../../ErrorFetching";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import moment from "moment";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { Attachment, Info, ThumbUpAlt } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useFileView } from "../../../Hooks/useFileView";
import StatusComponent from "../../../Components/Reusable/FaStatusComponent";
import { notificationApi } from "../../../Redux/Query/Notification";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import RejectRepaired from "./component/RejectRepaired";

const schema = yup.object().shape({
  pullout_ids: yup.array(),
});
const Repaired = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dispatch = useDispatch();
  const dialog = useSelector((state) => state.booleanState.dialog);

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pullout_ids: [],
    },
  });

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
    },
    { refetchOnMountOrArgChange: true }
  );

  const [postConfirm, { isLoading }] = usePostPulloutConfirmationApiMutation();

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
        onClick={() => handleFileView({ id: id })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleFileView = (id) => {
    useFileView(id);
  };

  const handleAllHandler = (checked) => {
    if (checked) {
      setValue(
        "pullout_ids",
        pulloutData?.data?.map((item) => item.id?.toString())
      );
    } else {
      reset({ pullout_ids: [] });
    }
  };

  const handleConfirmClick = () => {
    dispatch(
      openConfirm({
        approval: true,
        icon: Info,
        iconColor: "info",
        message: (
          <Box>
            {/* <Typography> Are you sure you want to</Typography> */}
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
              }}
            >
              Confirm
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const test = await postConfirm({
              item_id: watch("pullout_ids"),
              type_of_evaluation: "repaired",
              is_received: 1,
            }).unwrap();
            console.log("test", test);
            dispatch(
              openToast({
                message: "Pullout Repair Confirmed Successfully!",
                duration: 5000,
              })
            );
            reset();
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.response?.data?.errors?.detail || err?.message,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
              console.error(err);
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
            }
          }
        },

        onDismiss: async () => {
          dispatch(openDialog());
        },
      })
    );
  };

  const handleRowClick = (id) => {
    const current = watch("pullout_ids");

    if (current.includes(id)) {
      // remove
      setValue(
        "pullout_ids",
        current.filter((item) => item !== id)
      );
    } else {
      // add
      setValue("pullout_ids", [...current, id]);
    }
  };

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {pulloutLoading && <MasterlistSkeleton category />}
      {pulloutError && <ErrorFetching refetch={refetch} error={errorData} />}
      {pulloutData && !pulloutError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleConfirmClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <ThumbUpAlt />}
                size="small"
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
                disabled={watch("pullout_ids").length === 0}
              >
                {isSmallScreen ? <ThumbUpAlt color="black" sx={{ fontSize: "20px" }} /> : "Confirm"}
              </Button>
            </Box>

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
                                !!pulloutData?.data
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
                      <TableCell className="tbl-cell">Date Created</TableCell>
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
                          onClick={() => handleRowClick(data?.id.toString())}
                        >
                          <TableCell className="tbl-cell" size="small" align="center">
                            <FormControlLabel
                              value={data?.id}
                              sx={{ margin: "auto" }}
                              control={
                                <Checkbox
                                  size="small"
                                  {...register("pullout_ids")}
                                  checked={watch("pullout_ids").includes(data?.id?.toString())}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                            />
                          </TableCell>
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
                              {`(${data?.asset.one_charging?.code || "-"}) - ${data?.asset.one_charging?.name || "-"}`}
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
                              {`(${data?.asset.one_charging?.location_code || data?.asset.location?.location_code}) - ${
                                data?.asset.one_charging?.location_name || data?.asset.location?.location_name
                              }`}
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
                          <TableCell className="tbl-cell">{moment(data?.created_at).format("MMMM DD, YYYY")}</TableCell>
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
        </>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <RejectRepaired data={watch("pullout_ids").map(Number)} />
      </Dialog>
    </Stack>
  );
};

export default Repaired;
