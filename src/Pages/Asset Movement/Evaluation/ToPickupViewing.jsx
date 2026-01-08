import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetAssetToPickupByIdApiQuery,
  usePatchPickupAssetApiMutation,
} from "../../../Redux/Query/Movement/Evaluation";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ArrowBackIosRounded, Cancel, CoPresent, Help, ReportProblem, ShoppingCartCheckout } from "@mui/icons-material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import StatusChange from "../../../Components/Reusable/FaStatusComponent";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { notificationApi } from "../../../Redux/Query/Notification";
import ToPickupSkeleton from "./Skeleton/ToPickupSkeleton";

const schema = yup.object().shape({
  item_id: yup.array(),
});

const ToPickupViewing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state: pickupData } = useLocation();

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const isMediumScreen = useMediaQuery("(max-width: 640px)");

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    isSuccess: isEvaluationSuccess,
    isError: isEvaluationError,
    isFetching: isEvaluationFetching,
    error: errorData,
    refetch,
  } = useGetAssetToPickupByIdApiQuery({
    id: pickupData?.id,
  });

  const [pickUpTrigger] = usePatchPickupAssetApiMutation();

  const { control, watch, reset, register, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      item_id: [],
      description: pickupData?.description || null,
      care_of: pickupData?.care_of?.name || null,
      helpdesk_number: pickupData?.helpdesk_number || null,
      requestor:
        `${pickupData?.requester?.employee_id} - ${pickupData?.requester?.first_name} ${pickupData?.requester?.last_name}` ||
        null,
    },
  });

  const handleRowClick = (id) => {
    const current = watch("item_id");

    if (current.includes(id)) {
      // remove
      setValue(
        "item_id",
        current.filter((item) => item !== id)
      );
    } else {
      // add
      setValue("item_id", [...current, id]);
    }
  };

  const handleAllHandler = (checked) => {
    if (checked) {
      setValue(
        "item_id",
        evaluationData?.assets?.map((item) => item.pullout_id?.toString())
      );
    } else {
      reset({ item_id: [] });
    }
  };

  //   useEffect(() => {
  //     if (evaluationData) {
  //       setValue("description", pickupData?.description);
  //       setValue("care_of", pickupData?.care_of);
  //       setValue("requestor", pickupData?.requester?.employee_id);
  //     }
  //   }, [pickupData, evaluationData]);

  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    pb: "10px",
  };

  const onPickupHandler = (data) => {
    console.log("pickuphandler data", data);
    dispatch(
      openConfirm({
        icon: data?.action === "Cancel" ? ReportProblem : Help,
        iconColor: data?.action === "Cancel" ? "warning" : "info",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {data.action.toUpperCase()}
            </Typography>{" "}
            this asset?
          </Box>
        ),

        onConfirm: async () => {
          const noNextData = (err) => {
            if (err?.status === 404) {
              navigate(`/asset-movement/evaluation`);
            } else if (err?.status === 422) {
              dispatch(
                openToast({
                  // message: err.data.message,
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

              navigate(`/asset-movement/evaluation`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await pickUpTrigger(data).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );
            dispatch(notificationApi.util.invalidateTags(["Notif"]));
            dispatch(closeConfirm());
            navigate(`/asset-movement/evaluation`);
          } catch (err) {
            noNextData(err);

            // navigate(`/approving/pull-out`);
          }
        },
      })
    );
  };

  return (
    <>
      <Box className="mcontainer" sx={{ height: "calc(100vh - 380px)" }}>
        <Stack flexDirection="row" justifyContent="space-between" marginBottom={1}>
          <Button
            variant="text"
            color="secondary"
            size="small"
            startIcon={<ArrowBackIosRounded color="secondary" />}
            onClick={() => {
              navigate(-1);
              // setApprovingValue("2");
            }}
            disableRipple
            sx={{ width: "90px", marginLeft: "-15px", "&:hover": { backgroundColor: "transparent" } }}
          >
            Back
          </Button>
          {isEvaluationLoading || isEvaluationFetching ? (
            <Skeleton variant="rounded" width={80} height={30} />
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() =>
                  onPickupHandler({
                    id: evaluationData?.id,
                    movement_id: [evaluationData?.id],
                    pullout_id: watch("item_id"),
                    action: "Pick-up",
                  })
                }
                variant="contained"
                startIcon={!isSmallScreen && <ShoppingCartCheckout color={"primary"} />}
                size="small"
                color="secondary"
                disabled={watch("item_id").length === 0}
              >
                Pickup
              </Button>
              <Button
                onClick={() =>
                  onPickupHandler({
                    id: evaluationData?.id,
                    movement_id: [evaluationData?.id],
                    pullout_id: watch("item_id"),
                    action: "On-site",
                  })
                }
                variant="contained"
                startIcon={!isSmallScreen && <CoPresent color="secondary" />}
                size="small"
                color="primary"
                disabled={watch("item_id").length === 0}
              >
                on-site
              </Button>
              <Button
                onClick={() =>
                  onPickupHandler({
                    id: evaluationData?.id,
                    movement_id: [evaluationData?.id],
                    pullout_id: watch("item_id"),
                    action: "Cancel",
                  })
                }
                variant="contained"
                startIcon={!isSmallScreen && <Cancel color="#973131" />}
                size="small"
                color="warning"
                disabled={watch("item_id").length === 0}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Stack>

        <Box
          className={"mcontainer__wrapper"}
          p={2}
          sx={{
            display: "flex",
            flexDirection: isMediumScreen ? "column" : "row",
            gap: 2,
          }}
        >
          {isMediumScreen && (
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              TRANSACTION No. {pickupData && pickupData?.id}
            </Typography>
          )}
          <Box
            id="requestForm"
            className="request__form"
            sx={{ order: isMediumScreen ? 2 : 1, flex: 1, borderTop: isMediumScreen && 1, borderColor: "divider" }}
          >
            {!isMediumScreen && (
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }} mb={2}>
                TRANSACTION No. {pickupData && pickupData?.id}
              </Typography>
            )}
            <Typography
              color="secondary.main"
              sx={{ fontFamily: "Anton", fontSize: "15px", marginTop: isMediumScreen && 2 }}
            >
              REQUEST DETAILS
            </Typography>
            <Stack gap={2} py={1}>
              {isEvaluationLoading ? (
                <ToPickupSkeleton />
              ) : (
                <Box sx={BoxStyle}>
                  <CustomTextField
                    control={control}
                    name="description"
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                    inputProps={{ readOnly: true }}
                  />
                  <CustomTextField
                    control={control}
                    name="helpdesk_number"
                    label="Helpdesk Number"
                    type="text"
                    fullWidth
                    multiline
                    inputProps={{ readOnly: true }}
                  />

                  <CustomTextField
                    control={control}
                    name="care_of"
                    label="Care Of"
                    type="text"
                    fullWidth
                    multiline
                    inputProps={{ readOnly: true }}
                  />
                  <CustomTextField
                    control={control}
                    name="requestor"
                    label="Requestor"
                    type="text"
                    fullWidth
                    multiline
                    inputProps={{ readOnly: true }}
                  />
                </Box>
              )}
            </Stack>
          </Box>

          <Box className="request__table" sx={{ order: isMediumScreen ? 1 : 2 }}>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }} textAlign={"center"}>
              ASSET DETAILS
            </Typography>
            <TableContainer
              className="mcontainer__th-body  mcontainer__wrapper"
              // sx={{ height: transactionData?.approved ? "calc(100vh - 230px)" : "calc(100vh - 280px)", pt: 0 }}
            >
              <Table className="mcontainer__table " stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& > *": {
                        fontWeight: "bold",
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
                              !!evaluationData?.assets
                                ?.map((mapItem) => mapItem?.pullout_id?.toString())
                                ?.every((item) => watch("item_id").includes(item?.toString()))
                            }
                            onChange={(e) => {
                              handleAllHandler(e.target.checked);
                            }}
                          />
                        }
                      />
                    </TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Id
                    </TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Vladimir Tag Number
                    </TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Accountability
                    </TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Accountable
                    </TableCell>
                    <TableCell className="tbl-cell" align="center">
                      Evaluation
                    </TableCell>
                    <TableCell className="tbl-cell">Chart Of Account</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isEvaluationLoading ? (
                    <LoadingData />
                  ) : (
                    evaluationData?.assets?.map((item) => (
                      <TableRow key={item.id} hover onClick={() => handleRowClick(item?.pullout_id.toString())}>
                        <TableCell className="tbl-cell" size="small" align="center">
                          <FormControlLabel
                            value={item?.pullout_id}
                            sx={{ margin: "auto" }}
                            control={
                              <Checkbox
                                size="small"
                                {...register("item_id")}
                                checked={watch("item_id").includes(item?.pullout_id?.toString())}
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                          />
                        </TableCell>
                        <TableCell className="tbl-cell text-weight" align="center">
                          {item.id}
                        </TableCell>
                        <TableCell className="tbl-cell" align="center">
                          <Typography fontSize="12px" color="black" fontWeight="bold">
                            {item?.vladimir_tag_number}
                          </Typography>
                          <Typography fontSize="12px" color="gray" fontWeight="500">
                            {item?.asset_description}
                          </Typography>
                        </TableCell>
                        <TableCell className="tbl-cell" align="center">
                          {item.accountability}
                        </TableCell>
                        <TableCell className="tbl-cell" align="center">
                          {item.accountable}
                        </TableCell>
                        <TableCell className="tbl-cell" align="center">
                          <StatusChange faStatus={item.evaluation} />
                        </TableCell>
                        <TableCell className="tbl-cell">
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.code}
                            {" - "} {item?.one_charging.name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.company_code || item?.company.company_code}
                            {" - "} {item?.one_charging.company_name || item?.company.company_name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.business_unit_code || item?.business_unit?.business_unit_code}
                            {" - "}
                            {item?.one_charging.business_unit_name || item?.business_unit?.business_unit_name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.department_code || item?.department.department_code}
                            {" - "}
                            {item?.one_charging.department_name || item?.department.department_name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.unit_code || item?.unit?.unit_code}
                            {" - "}
                            {item?.one_charging.unit_name || item?.unit?.unit_name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.codsubunit_codee || item?.subunit?.subunit_code}
                            {" - "}
                            {item?.one_charging.subunit_name || item?.subunit?.subunit_name}
                          </Typography>
                          <Typography fontSize="10px" color="gray">
                            {item?.one_charging.location_code || item?.location.location_code} {" - "}
                            {item?.one_charging.location_name || item?.location.location_name}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ justifyContent: "space-between", display: "flex", mt: 1 }}>
              <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main" pt="10px">
                Selected: {watch("item_id").length} {watch("item_id").length >= 2 ? "Assets" : "Asset"}
              </Typography>

              <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main" pt="10px">
                No. of Asset in Request: {evaluationData?.assets.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ToPickupViewing;
