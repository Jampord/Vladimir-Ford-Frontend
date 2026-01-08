import React, { useState } from "react";
import { useGetBiddingApiQuery, usePostMarkAsSoldApiMutation } from "../../../Redux/Query/Movement/Bidding";
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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import moment from "moment";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Info, MenuBook, More } from "@mui/icons-material";
import AddBookSlip from "./Component/AddBookSlip";
import { openDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { notificationApi } from "../../../Redux/Query/Notification";

const schema = yup.object().shape({
  item_id: yup.array(),
});

const BiddingTabPanel = ({ tab }) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const isMediumScreen = useMediaQuery("(max-width: 1000px)");
  const dispatch = useDispatch();
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

  const {
    data: biddingData,
    isLoading: isBiddingLoading,
    isSuccess: isBiddingSuccess,
    isError: isBiddingError,
    isFetching: isBiddingFetching,
    error: errorData,
    refetch,
  } = useGetBiddingApiQuery(
    {
      page: page,
      per_page: perPage,
      status: tab,
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

  const selectedItems = biddingData?.data?.filter((item) => watch("item_id").includes(item?.id?.toString()));
  const fixed_asset_ids = selectedItems?.map((item) => item?.asset?.id);
  const [postMarkAsSold] = usePostMarkAsSoldApiMutation();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRowClick = (id) => {
    const current = watch("item_id");

    if (current.includes(id)) {
      setValue(
        "item_id",
        current.filter((item) => item !== id)
      );
    } else {
      setValue("item_id", [...current, id]);
    }
  };

  const handleAllHandler = (checked) => {
    if (checked) {
      setValue(
        "item_id",
        biddingData?.data?.map((item) => item.id?.toString())
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

  const handleAddBookSlipClick = () => {
    setAnchorEl(null);
    dispatch(openDialog1());
  };

  const handleMarkAsSoldClick = () => {
    setAnchorEl(null);
    dispatch(
      openConfirm({
        icon: Info,
        iconColor: "info",
        message: (
          <Box>
            <Typography> Are you sure you want to mark this data as</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
              }}
            >
              SOLD
            </Typography>
            ?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const res = await postMarkAsSold({
              fixed_asset_id: fixed_asset_ids,
            }).unwrap();
            dispatch(
              openToast({
                message: res?.message || "Item marked as sold successfully!",
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
      })
    );
  };

  return (
    <Stack className="category_height">
      {isBiddingLoading && <MasterlistSkeleton onAdd category />}
      {isBiddingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {biddingData && !isBiddingError && !isBiddingLoading && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive />

          {(!isBiddingLoading || !isBiddingFetching) && tab === "For Disposal" && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <More />}
                size="small"
                disabled={watch("item_id").length === 0}
                sx={{ minWidth: isSmallScreen && "50px", top: isMediumScreen && -48 }}
              >
                {isSmallScreen ? <More color="black" sx={{ fontSize: "20px" }} /> : "Action"}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem dense onClick={handleAddBookSlipClick}>
                  <ListItemIcon>
                    <MenuBook fontSize="small" color="secondary" />
                  </ListItemIcon>
                  <ListItemText>Add Bookslip</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {(!isBiddingLoading || !isBiddingFetching) && tab === "Bid" && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <More />}
                size="small"
                disabled={watch("item_id").length === 0}
                sx={{ minWidth: isSmallScreen && "50px", top: isMediumScreen && -48 }}
              >
                {isSmallScreen ? <More color="black" sx={{ fontSize: "20px" }} /> : "Action"}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem dense onClick={handleAddBookSlipClick}>
                  <ListItemIcon>
                    <MenuBook fontSize="small" color="secondary" />
                  </ListItemIcon>
                  <ListItemText>Add Bookslip</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {(!isBiddingLoading || !isBiddingFetching) && tab === "Bidding" && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                onClick={handleClick}
                variant="contained"
                startIcon={isSmallScreen ? null : <More />}
                size="small"
                disabled={watch("item_id").length === 0}
                sx={{ minWidth: isSmallScreen && "50px", top: isMediumScreen && -48 }}
              >
                {isSmallScreen ? <More color="black" sx={{ fontSize: "20px" }} /> : "Action"}
              </Button>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem dense onClick={handleMarkAsSoldClick}>
                  <ListItemIcon>
                    <CheckCircle fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Mark as Sold</ListItemText>
                </MenuItem>
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
                    {(tab === "For Disposal" || tab === "Bid" || tab === "Bidding") && (
                      <TableCell align="center" className="tbl-cell">
                        <FormControlLabel
                          sx={{ margin: "auto", align: "center" }}
                          control={
                            <Checkbox
                              value=""
                              size="small"
                              checked={
                                !!biddingData?.data
                                  ?.map((mapItem) => mapItem?.id?.toString())
                                  ?.every((item) => watch("item_id").includes(item?.toString()))
                              }
                              onChange={(e) => {
                                handleAllHandler(e.target.checked);
                              }}
                            />
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className="tbl-cell">Request #</TableCell>
                    <TableCell className="tbl-cell">Description</TableCell>
                    <TableCell className="tbl-cell">Helpdesk #</TableCell>
                    <TableCell className="tbl-cell">Asset</TableCell>
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell">Status</TableCell>
                    <TableCell className="tbl-cell">Requestor</TableCell>
                    <TableCell className="tbl-cell">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {biddingData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : isBiddingFetching ? (
                    <LoadingData />
                  ) : (
                    <>
                      {biddingData?.data.map((item) => (
                        <TableRow
                          key={item?.id}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                          hover
                          onClick={() => handleRowClick(item?.id.toString())}
                        >
                          {(tab === "For Disposal" || tab === "Bid" || tab === "Bidding") && (
                            <TableCell className="tbl-cell" size="small" align="center">
                              <FormControlLabel
                                value={item?.id}
                                sx={{ margin: "auto" }}
                                control={
                                  <Checkbox
                                    size="small"
                                    {...register("item_id")}
                                    checked={watch("item_id").includes(item?.id?.toString())}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="tbl-cell">{item?.id}</TableCell>
                          <TableCell className="tbl-cell">{item?.description}</TableCell>
                          <TableCell className="tbl-cell">{item?.helpdesk_number}</TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontWeight={700} fontSize="13px" color="primary">
                              {item?.asset.vladimir_tag_number}
                            </Typography>
                            <Typography fontWeight={600} fontSize="13px" color="secondary.main">
                              {item?.asset.asset_description}
                            </Typography>
                            <Typography
                              fontSize="12px"
                              color="text.light"
                              textOverflow="ellipsis"
                              width="300px"
                              overflow="hidden"
                            >
                              <Tooltip title={<>{item?.asset.asset_specification}</>} placement="bottom" arrow>
                                {item?.asset.asset_specification}
                              </Tooltip>
                            </Typography>
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
                          <TableCell className="tbl-cell">{item?.remarks}</TableCell>
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

            <Box className="mcontainer__pagination-export">
              <Box />
              {/* {result === false && (
                <Typography noWrap fontSize="13px" color="error">
                  Selected items does not have the same COA.
                </Typography>
              )} */}
              <CustomTablePagination
                total={biddingData?.total}
                success={isBiddingSuccess}
                current_page={biddingData?.current_page}
                per_page={biddingData?.per_page}
                onPageChange={pageHandler}
                onRowsPerPageChange={perPageHandler}
              />
            </Box>
          </Box>
        </Box>
      )}

      <Dialog
        open={dialog1}
        maxWidth={"xs"}
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{ sx: { borderRadius: "15px" } }}
      >
        <AddBookSlip item={watch("item_id")} reset={reset} selectedItems={selectedItems} tab={tab} />
      </Dialog>
    </Stack>
  );
};

export default BiddingTabPanel;
