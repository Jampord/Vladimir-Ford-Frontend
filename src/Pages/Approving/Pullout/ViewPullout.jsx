import { ArrowBackIosRounded, Check, Create, Help, Report, Undo } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetPulloutNumberApiQuery } from "../../../Redux/Query/Movement/Pullout";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  useLazyGetNextPulloutRequestQuery,
  usePatchPulloutApprovalStatusApiMutation,
} from "../../../Redux/Query/Approving/PulloutApproval";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { LoadingButton } from "@mui/lab";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  description: yup.string().required().label("Acquisition Details"),
  care_of: yup.string().typeError("Accountability is a required field").required().label("Accountability"),
  remarks: yup.string().label("Remarks"),
  attachments: yup.mixed().required().label("Attachments"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
      created_at: yup.date(),
      company_id: yup.string(),
      business_unit_id: yup.string(),
      department_id: yup.string(),
      unit_id: yup.string(),
      sub_unit_id: yup.string(),
      location_id: yup.string(),
    })
  ),
});

const ViewPullout = () => {
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state: transactionData } = useLocation();

  const AttachmentRef = useRef(null);

  const {
    data: pulloutData = [],
    isLoading: isPulloutLoading,
    isSuccess: isPulloutSuccess,
    isError: isPulloutError,
    isFetching: isPulloutFetching,
    refetch: isPulloutRefetch,
  } = useGetPulloutNumberApiQuery(
    { pullout_number: transactionData?.id ? transactionData?.id : transactionData?.pullout_number },
    { refetchOnMountOrArgChange: true }
  );

  // console.log(pulloutData);

  const [patchApprovalStatus, { isLoading: isPatchApprovalLoading }] = usePatchPulloutApprovalStatusApiMutation();
  const [getNextPullout, { data: nextData, isLoading: isNextPulloutLoading }] = useLazyGetNextPulloutRequestQuery();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      description: "",
      care_of: null,
      remarks: "",
      attachments: null,

      assets: [{ id: null, fixed_asset_id: null, asset_accountable: "", created_at: null }],
    },
  });

  useEffect(() => {
    const pulloutNumberData = pulloutData.at(0);
    if (pulloutData) {
      const attachmentFormat = pulloutNumberData?.attachments === null ? "" : pulloutNumberData?.attachments;

      setValue("description", pulloutNumberData?.description);
      setValue("care_of", pulloutNumberData?.care_of);
      setValue("remarks", pulloutNumberData?.remarks);
      setValue("attachments", attachmentFormat);
      setValue(
        "assets",
        pulloutNumberData?.assets?.map((asset) => ({
          id: asset.id,
          fixed_asset_id: +asset.vladimir_tag_number + " - " + asset.asset_description,
          asset_accountable: asset.accountable === "-" ? "Common" : asset.accountable,
          created_at: asset.created_at || asset.acquisition_date,
          company_id: asset.company?.company_name,
          business_unit_id: asset.business_unit?.business_unit_name,
          department_id: asset.department?.department_name,
          unit_id: asset.unit?.unit_name,
          sub_unit_id: asset.subunit?.subunit_name,
          location_id: asset.location?.location_name,
          accountability: asset?.new_accountability,
          accountable: asset?.new_accountable,
          receiver_id: asset?.receiver,
        }))
      );
    }
  }, [pulloutData, transactionData]);

  const UpdateField = ({ value, label }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
          disabled
          value={value > 1 ? `${value} files selected` : value <= 1 ? `${value} file selected` : null}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={AttachmentActive} width="20px" />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            ".MuiInputBase-root": {
              borderRadius: "10px",
              width: "242px",
              // color: "#636363",
            },

            ".MuiInputLabel-root.Mui-disabled": {
              backgroundColor: "transparent",
              color: "text.main",
            },

            ".Mui-disabled": {
              backgroundColor: "background.light",
              borderRadius: "10px",
              color: "text.main",
            },
          }}
        />
      </Stack>
    );
  };

  // CONFIRMATION
  const onApprovalApproveHandler = (id) => {
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
              APPROVE
            </Typography>{" "}
            this request?
          </Box>
        ),

        onConfirm: async () => {
          const noNextData = (err) => {
            if (err?.status === 404) {
              navigate(`/approving/pull-out`);
            } else if (err?.status === 422) {
              // dispatch(
              //   openToast({
              //     // message: err.data.message,
              //     message: err.data.errors?.detail,
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              console.log("💣");
              navigate(`/approving/pull-out`);
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );

              navigate(`/approving/pull-out`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Approve",
              movement_id: id,
            }).unwrap();

            isPulloutRefetch();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextPullout().unwrap();
            console.log("next: ", next);
            navigate(`/approving/pull-out/${next?.id}`, { state: next, replace: true });
          } catch (err) {
            noNextData(err);

            // navigate(`/approving/pull-out`);
          }
        },
      })
    );
  };

  const onApprovalReturnHandler = (id) => {
    dispatch(
      openConfirm({
        icon: Report,
        iconColor: "warning",
        message: (
          <Stack gap={2}>
            <Typography>
              Are you sure you want to{" "}
              <Typography
                variant="span"
                sx={{
                  display: "inline-block",
                  color: "secondary.main",
                  fontWeight: "bold",
                  fontFamily: "Raleway",
                }}
              >
                RETURN
              </Typography>{" "}
              this request?
            </Typography>
          </Stack>
        ),
        remarks: true,

        onConfirm: async (data) => {
          const noNextData = (err) => {
            if (err?.status === 404) {
              navigate(`/approving/pull-out`);
            } else if (err?.status === 422) {
              // dispatch(
              //   openToast({
              //     // message: err.data.message,
              //     message: err.data.errors?.detail,
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              navigate(`/approving/pull-out`);
            } else if (err?.status !== 422) {
              dispatch(
                openToast({
                  message: "Something went wrong. Please try again.",
                  duration: 5000,
                  variant: "error",
                })
              );
              navigate(`/approving/pull-out`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Return",
              movement_id: id,
              remarks: data,
            }).unwrap();

            dispatch(
              openToast({
                message: result?.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextPullout().unwrap();
            navigate(`/approving/pull-out/${next?.id}`, { state: next, view, replace: true });
          } catch (err) {
            noNextData(err);
          }
        },
      })
    );
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
  });

  //* Styles ----------------------------------------------------------------
  const BoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    pb: "10px",
  };

  return (
    <>
      <Box className="mcontainer" sx={{ height: "calc(100vh - 380px)" }}>
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

        <Box className="request mcontainer__wrapper" p={2}>
          <Box>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              TRANSACTION No. {transactionData && transactionData?.id}
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
                    label="Care of"
                    type="text"
                    fullWidth
                    multiline
                  />

                  <CustomTextField
                    control={control}
                    name="remarks"
                    disabled
                    label="Remarks (Optional)"
                    optional
                    type="text"
                    fullWidth
                    multiline
                  />

                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "15px" }}>
                    ATTACHMENTS
                  </Typography>

                  <Stack flexDirection="row" gap={1} alignItems="center">
                    {watch("attachments") !== null ? (
                      <UpdateField label={"Attachments"} value={watch("attachments")?.length} />
                    ) : (
                      <CustomMultipleAttachment
                        control={control}
                        name="attachments"
                        disabled
                        label="Attachments"
                        inputRef={AttachmentRef}
                        error={!!errors?.attachments?.message}
                        helperText={errors?.attachments?.message}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box className="request__table">
            <TableContainer
              className="mcontainer__th-body  mcontainer__wrapper"
              sx={{ height: transactionData?.approved ? "calc(100vh - 230px)" : "calc(100vh - 280px)", pt: 0 }}
            >
              <Table className="mcontainer__table " stickyHeader>
                {" "}
                <TableHead>
                  {" "}
                  <TableRow
                    sx={{
                      "& > *": {
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell className="tbl-cell">Index</TableCell>
                    <TableCell className="tbl-cell">Asset</TableCell>
                    <TableCell className="tbl-cell">Accountability</TableCell>
                    <TableCell className="tbl-cell">Chart Of Accounts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isPulloutLoading || isPulloutFetching ? (
                    <LoadingData />
                  ) : (
                    fields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="tbl-cell" align="center">
                          {" "}
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: "primary.main",
                              fontSize: "14px",
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.fixed_asset_id`)}
                            variant="outlined"
                            disabled
                            type="text"
                            size="small"
                            multiline
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",

                              ml: "-10px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                                fontWeight: "bold",
                                fontSize: "14px",
                                textOverflow: "ellipsis",
                              },
                              "& .Mui-disabled": {
                                color: "red",
                              },
                              marginTop: "-15px",
                            }}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.asset_accountable`)}
                            variant="outlined"
                            disabled
                            type="text"
                            size="small"
                            multiline
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",
                              ml: "-10px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                                fontWeight: "bold",
                                fontSize: "14px",
                                textOverflow: "ellipsis",
                              },
                              "& .Mui-disabled": {
                                color: "red",
                              },
                              marginTop: "-15px",
                            }}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack width="250px" rowGap={0}>
                            <TextField
                              {...register(`assets.${index}.company_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.business_unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.department_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.sub_unit_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                              }}
                            />

                            <TextField
                              {...register(`assets.${index}.location_id`)}
                              variant="outlined"
                              disabled
                              type="text"
                              size="small"
                              sx={{
                                backgroundColor: "transparent",
                                border: "none",
                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  backgroundColor: "transparent",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },
                                "& .Mui-disabled": {
                                  color: "red",
                                },
                                marginTop: "-15px",
                                marginBottom: "-10px",
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!transactionData?.approved && (
              <Stack flexDirection="row" justifyContent="space-between" alignItems={"center"}>
                <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main">
                  Added: {fields.length > 1 ? `${fields.length} Assets` : `${fields.length} Asset`}
                </Typography>
                <Stack flexDirection="row" gap={2}>
                  <Stack flexDirection="row" justifyContent="flex-end" alignItems="center" gap={2}>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      disabled={isPulloutLoading || isPulloutFetching}
                      onClick={() =>
                        onApprovalApproveHandler(
                          transactionData?.id ? transactionData?.id : transactionData?.pullout_number
                        )
                      }
                      startIcon={<Check color="primary" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isPulloutLoading || isPulloutFetching}
                      onClick={() =>
                        onApprovalReturnHandler(
                          transactionData?.id ? transactionData?.id : transactionData?.pullout_number
                        )
                      }
                      startIcon={<Undo sx={{ color: "#5f3030" }} />}
                      sx={{
                        color: "white",
                        backgroundColor: "error.main",
                        ":hover": { backgroundColor: "error.dark" },
                      }}
                    >
                      Return
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ViewPullout;
