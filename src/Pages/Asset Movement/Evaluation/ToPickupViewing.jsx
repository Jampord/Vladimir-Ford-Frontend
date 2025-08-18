import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetAssetToPickupByIdApiQuery,
  usePatchPickupAssetApiMutation,
} from "../../../Redux/Query/Movement/Evaluation";
import {
  Box,
  Button,
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
import { ArrowBackIosRounded, Help, ShoppingCartCheckout } from "@mui/icons-material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import StatusChange from "../../../Components/Reusable/FaStatusComponent";

const ToPickupViewing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state: pickupData } = useLocation();
  console.log("pickupData", pickupData);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");

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
  console.log("evaluationData", evaluationData);

  const [pickUpTrigger] = usePatchPickupAssetApiMutation();

  const { control, setValue } = useForm({
    defaultValues: {
      description: pickupData?.description || null,
      care_of: pickupData?.care_of || null,
      requestor:
        `${pickupData?.requester?.employee_id} - ${pickupData?.requester?.first_name} ${pickupData?.requester?.last_name}` ||
        null,
    },
  });

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

  const onPickupHandler = (id) => {
    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
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
              PICKUP
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
            const result = await pickUpTrigger({ id }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

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
          <Box sx={{}}>
            <Button
              onClick={() => onPickupHandler(evaluationData?.id)}
              variant="contained"
              startIcon={isSmallScreen ? null : <ShoppingCartCheckout color="primary" />}
              size="small"
              color="secondary"
              sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
            >
              {isSmallScreen ? (
                <ShoppingCartCheckout color="primary" sx={{ color: "primary.main", fontSize: "20px" }} />
              ) : (
                "Pickup"
              )}
            </Button>
          </Box>
        </Stack>

        <Box className="request mcontainer__wrapper" p={2}>
          <Box>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              TRANSACTION No. {pickupData && pickupData?.id}
            </Typography>

            <Box id="requestForm" className="request__form">
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "15px" }}>
                REQUEST DETAILS
              </Typography>
              <Stack gap={2} py={1}>
                <Box sx={BoxStyle}>
                  <CustomTextField
                    control={control}
                    name="description"
                    disabled
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                  />

                  <CustomTextField
                    control={control}
                    name="care_of"
                    disabled
                    label="Care Of"
                    type="text"
                    fullWidth
                    multiline
                  />
                  <CustomTextField
                    control={control}
                    name="requestor"
                    disabled
                    label="Requestor"
                    type="text"
                    fullWidth
                    multiline
                  />
                </Box>
              </Stack>
            </Box>
          </Box>
          <Box className="request__table">
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
                  {evaluationData?.assets?.map((item) => (
                    <TableRow key={item.id}>
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ToPickupViewing;
