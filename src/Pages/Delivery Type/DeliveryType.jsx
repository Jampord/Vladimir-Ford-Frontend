import React, { useState } from "react";
import {
  useGetDeliveryTypeApiQuery,
  usePostDeliveryTypeApiMutation,
} from "../../Redux/Query/Delivery Type/DeliveryType";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import MasterlistSkeleton from "../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../ErrorFetching";
import MasterlistToolbar from "../../Components/Reusable/MasterlistToolbar";
import CustomTablePagination from "../../Components/Reusable/CustomTablePagination";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NoRecordsFound from "../../Layout/NoRecordsFound";
import FaStatusChange from "../../Components/Reusable/FaStatusComponent";
import moment from "moment";
import { LoadingData } from "../../Components/LottieFiles/LottieComponents";
import { FmdGood, More, Warehouse, Warning } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../Redux/StateManagement/toastSlice";
import { notificationApi } from "../../Redux/Query/Notification";

const schema = yup.object().shape({
  fixed_assets: yup.array(),
});

const DeliveryType = () => {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();

  const {
    data: deliveryTypeData,
    isLoading: isDeliveryTypeLoading,
    isFetching: isDeliveryTypeFetching,
    isSuccess: isDeliveryTypeSuccess,
    isError: isDeliveryTypeError,
    error: errorData,
    refetch,
  } = useGetDeliveryTypeApiQuery(
    {
      page: page,
      per_page: perPage,
      search: search,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [postDeliveryType, { isLoading: isPatchLoading }] = usePostDeliveryTypeApiMutation();

  const { register, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fixed_assets: [],
    },
  });

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const fixedAssetAllHandler = (checked) => {
    if (checked) {
      setValue(
        "fixed_assets",
        deliveryTypeData.data?.map((item) => item?.id.toString())
      );
    } else {
      reset({ fixed_assets: [] });
    }
  };

  const handleRowClick = (id) => {
    const current = watch("fixed_assets");

    if (current.includes(id)) {
      // remove
      setValue(
        "fixed_assets",
        current.filter((item) => item !== id)
      );
    } else {
      // add
      setValue("fixed_assets", [...current, id]);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log("123", watch("fixed_assets").map(Number));

  const handleActionClick = (data) => {
    dispatch(
      openConfirm({
        icon: Warning,
        iconColor: "warning",
        message: (
          <Box>
            <Typography>
              {" "}
              Are you sure you want to tag {watch("fixed_assets").length >= 1 ? "this" : "these"} as
            </Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {data} Delivery
            </Typography>
            ?
          </Box>
        ),

        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const result = await postDeliveryType({
              delivery_type: data,
              fixed_asset_id: watch("fixed_assets").map(Number),
            }).unwrap();
            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            dispatch(closeConfirm());
          } catch (err) {
            console.log("err", err);
            if (err?.status === 404) {
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err.data.errors?.detail,
                  duration: 5000,
                  variant: "error",
                })
              );
            } else if (err?.status !== 422) {
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
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Delivery Type
      </Typography>

      {isDeliveryTypeLoading && <MasterlistSkeleton onAdd={true} />}
      {isDeliveryTypeError && <ErrorFetching refetch={refetch} error={errorData} />}
      {deliveryTypeData && !isDeliveryTypeError && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar path="#" onSearchChange={setSearch} onSetPage={setPage} hideArchive />

          <Button
            variant="contained"
            onClick={handleClick}
            size="small"
            startIcon={<More />}
            sx={{ position: "absolute", right: 0, top: -40 }}
            disabled={watch("fixed_assets").length === 0}
          >
            <Tooltip title="Select Delivery Type" placement="top" arrow>
              Action
            </Tooltip>
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem dense onClick={() => handleActionClick("Direct")}>
              <ListItemIcon>
                <FmdGood fontSize="small" sx={{ color: "link.dark" }} />
              </ListItemIcon>
              <ListItemText>Direct Delivery</ListItemText>
            </MenuItem>
            <MenuItem dense onClick={() => handleActionClick("Warehouse")}>
              <ListItemIcon>
                <Warehouse fontSize="small" sx={{ color: "error.dark" }} />
              </ListItemIcon>
              <ListItemText>Warehouse Delivery</ListItemText>
            </MenuItem>
          </Menu>

          <Box>
            <TableContainer className="mcontainer__th-body">
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
                      <Tooltip title="Select All" placement="top" arrow>
                        <FormControlLabel
                          sx={{ margin: "auto", align: "center" }}
                          control={
                            <Checkbox
                              size="small"
                              checked={
                                !!deliveryTypeData?.data
                                  ?.map((mapItem) => mapItem?.id.toString())
                                  ?.every((item) => watch("fixed_assets").includes(item))
                              }
                            />
                          }
                          onChange={(e) => {
                            fixedAssetAllHandler(e.target.checked);
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Transaction Number</TableCell>
                    <TableCell className="tbl-cell ">Asset</TableCell>
                    <TableCell className="tbl-cell ">PR/PO/PR/Ref. Number</TableCell>
                    <TableCell className="tbl-cell ">One Charging</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Accountability</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Category</TableCell>
                    <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isDeliveryTypeFetching ? (
                    <LoadingData />
                  ) : deliveryTypeData?.data?.length === 0 ? (
                    <NoRecordsFound heightData="small" />
                  ) : (
                    <>
                      {isDeliveryTypeSuccess &&
                        deliveryTypeData?.data.map((data) => (
                          <TableRow
                            key={data.id}
                            hover
                            onClick={() => handleRowClick(data.id.toString())}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                borderBottom: 0,
                              },
                              cursor: "pointer",
                            }}
                          >
                            <TableCell className="tbl-cell">
                              <FormControlLabel
                                value={data.id.toString()}
                                sx={{ margin: "auto" }}
                                control={
                                  <Checkbox
                                    size="small"
                                    {...register("fixed_assets")}
                                    checked={watch("fixed_assets").includes(data.id.toString())}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                }
                              />
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              <Chip
                                size="small"
                                variant="filled"
                                sx={{
                                  color: "white",
                                  font: "bold 12px Roboto",
                                  backgroundColor: "quaternary.light",
                                }}
                                label={data.transaction_number}
                              />
                            </TableCell>

                            <TableCell className="tbl-cell ">
                              <Typography
                                variant="h6"
                                fontSize="15px"
                                color={data.is_additional_cost ? "text.light" : "secondary.main"}
                                fontWeight={data.is_additional_cost ? null : "bold"}
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
                              <Typography fontSize="12px" color="primary.main" fontWeight="bold">
                                {data.type_of_request.type_of_request_name.toUpperCase()}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell">
                              <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                PR - {data.ymir_pr_number}
                              </Typography>
                              <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                PO - {data.po_number}
                              </Typography>
                              <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                RR - {data.rr_number}
                              </Typography>
                              <Typography noWrap fontSize="11px" fontWeight="700" color="gray">
                                Reference No. - {data.ymir_ref_number}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell">
                              <Typography fontSize="10px" color="gray">
                                {data?.one_charging?.code}
                                {" - "} {data?.one_charging?.name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.company_code}
                                {" - "} {data.one_charging.company_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.business_unit_code}
                                {" - "}
                                {data.one_charging.business_unit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.department_code}
                                {" - "}
                                {data.one_charging.department_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.unit_code}
                                {" - "}
                                {data.one_charging.unit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.subunit_code}
                                {" - "}
                                {data.one_charging.subunit_name}
                              </Typography>
                              <Typography fontSize="10px" color="gray">
                                {data.one_charging.location_code} {" - "}
                                {data.one_charging.location_name}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              <Typography noWrap variant="h3" fontSize="12px" color="secondary" fontWeight="bold">
                                {data.accountable}
                              </Typography>
                              <Typography noWrap fontSize="11px" color="gray">
                                {data.accountability}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              <FaStatusChange faStatus={data.asset_status.asset_status_name} />
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              <Typography fontSize="11px" fontWeight="bold">
                                {data?.minor_category?.minor_category_name}
                              </Typography>
                              <Typography fontSize="11px" color="gray">
                                {data?.major_category?.major_category_name}
                              </Typography>
                            </TableCell>

                            <TableCell className="tbl-cell tr-cen-pad45">
                              {moment(data.created_at).format("MMMM DD, YYYY")}
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomTablePagination
              total={deliveryTypeData?.total}
              success={isDeliveryTypeSuccess}
              current_page={deliveryTypeData?.current_page}
              per_page={deliveryTypeData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DeliveryType;
