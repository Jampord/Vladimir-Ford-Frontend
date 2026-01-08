import { ArrowBackIosRounded, Check, Help, Report, Undo } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
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
  useMediaQuery,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import {
  useGetDisposalByIdApiQuery,
  useLazyGetNextDisposalQuery,
  usePatchDisposalApprovalStatusApiMutation,
} from "../../../Redux/Query/Movement/Disposal";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useRef } from "react";
import moment from "moment";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useFileView } from "../../../Hooks/useFileView";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";

const schema = yup.object().shape({
  description: yup.string().required().label("Description"),
  remarks: yup.string().label("Remarks"),
  attachments: yup.mixed().nullable().label("Attachments"),
  receiving_warehouse_id: yup
    .object()
    .nullable()
    .required("Receiving Warehouse is a Required Field")
    .label("Receiving Warehouse"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string().nullable(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
      created_at: yup.string().nullable(),
      company_id: yup.string().nullable(),
      business_unit_id: yup.string().nullable(),
      department_id: yup.string().nullable(),
      unit_id: yup.string().nullable(),
      sub_unit_id: yup.string().nullable(),
      location_id: yup.string().nullable(),
    })
  ),
});

const ViewDisposal = () => {
  const isSmallScreen = useMediaQuery("(min-width:640px)");
  const { state: transactionData } = useLocation();
  console.log("viewDisposalTD", transactionData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const AttachmentRef = useRef();

  const {
    data: disposalData,
    isLoading: isDisposalLoading,
    isFetching: isDisposalFetching,
    isSuccess: isDisposalSuccess,
    isError: isDisposalError,
    error: errorData,
    refetch,
  } = useGetDisposalByIdApiQuery({ id: transactionData?.id }, { refetchOnMountOrArgChange: true });

  const data = disposalData?.at(0);

  const [patchApprovalStatus, { isLoading: isPatchApprovalLoading }] = usePatchDisposalApprovalStatusApiMutation();
  const [getNextDisposal, { data: nextData, isLoading: isNextDisposalLoading }] = useLazyGetNextDisposalQuery();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isDirty, isValid, isValidating },
    setError,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      description: "",
      remarks: "",
      attachments: null,
      receiving_warehouse_id: null,

      assets: [
        {
          id: null,
          fixed_asset_id: null,
          asset_accountable: "",
          created_at: null,
          company_id: null,
          business_unit_id: null,
          department_id: null,
          unit_id: null,
          sub_unit_id: null,
          location_id: null,
          attachments: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
    //   rules: { required: true, message: "At least one is required" },
  });

  useEffect(() => {
    if (data) {
      // fixedAssetTrigger();
      reset({
        description: disposalData[0]?.description,
        remarks: disposalData[0]?.remarks,
        attachments: disposalData[0]?.disposal_attachments,
        receiving_warehouse_id: disposalData[0]?.receiving_warehouse,

        assets: disposalData[0]?.assets.map((asset) => ({
          id: asset.id,
          fixed_asset_id: asset,
          asset_accountable: asset?.accountable === "-" || asset?.accountable === " " ? "Common" : asset?.accountable,
          created_at:
            moment(asset.created_at).format("MMM. DD, YYYY") || moment(asset.acquisition_date).format("MMM. DD, YYYY"),
          one_charging_id: asset?.one_charging?.name,
          company_id: asset?.one_charging?.company_name,
          business_unit_id: asset?.one_charging?.business_unit_name,
          department_id: asset?.one_charging?.department_name,
          unit_id: asset?.one_charging?.unit_name,
          sub_unit_id: asset?.one_charging?.subunit_name,
          location_id: asset?.one_charging?.location_name,
          attachments: asset?.evaluation_attachments,
        })),
      });
    }
  }, [data]);

  const UpdateField = ({ value, label }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
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

  const handleFileView = (id) => {
    useFileView({ id } || id);
  };

  // CONFIRMATION
  const onApprovalApproveHandler = (disposal_number) => {
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
              dispatch(
                openToast({
                  message: "Request approved successfully!",
                  duration: 5000,
                })
              );
              navigate(`/approving/disposal`);
            } else if (err?.status === 422) {
              navigate(`/approving/disposal`);
            } else if (err?.status !== 422) {
              // dispatch(
              //   openToast({
              //     message: "Something went wrong. Please try again.",
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              navigate(`/approving/disposal`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Approve",
              movement_id: disposal_number,
            }).unwrap();

            dispatch(
              openToast({
                message: result.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextDisposal().unwrap();
            console.log({ next });
            navigate(`/approving/disposal/${next?.id}`, { state: next, replace: true });
          } catch (err) {
            noNextData(err);
          }
        },
      })
    );
  };

  const onApprovalReturnHandler = (disposal_number) => {
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
              dispatch(
                openToast({
                  message: "Request returned successfully!",
                  duration: 5000,
                })
              );
              navigate(`/approving/disposal`);
            } else if (err?.status === 422) {
              navigate(`/approving/disposal`);
            } else if (err?.status !== 422) {
              // dispatch(
              //   openToast({
              //     message: "Something went wrong. Please try again.",
              //     duration: 5000,
              //     variant: "error",
              //   })
              // );
              navigate(`/approving/disposal`);
            }
          };

          try {
            dispatch(onLoading());
            const result = await patchApprovalStatus({
              action: "Return",
              movement_id: disposal_number,
              remarks: data,
            }).unwrap();

            dispatch(
              openToast({
                message: result?.message,
                duration: 5000,
              })
            );

            dispatch(closeConfirm());
            const next = await getNextDisposal().unwrap();
            navigate(`/approving/disposal/${next?.disposal_number}`, { state: next, view, replace: true });
          } catch (err) {
            noNextData(err);
          }
        },
      })
    );
  };

  const attachmentSx = {
    textDecoration: "underline",
    cursor: "pointer",
    color: "primary.main",
    fontSize: "12px",
  };

  return (
    <Box className="mcontainer">
      <Stack flexDirection="row" justifyContent="space-between">
        <Button
          variant="text"
          color="secondary"
          size="small"
          startIcon={<ArrowBackIosRounded color="secondary" />}
          onClick={() => {
            navigate(-1);
          }}
          disableRipple
          sx={{ pl: "20px", ml: "-15px", mt: "-5px", "&:hover": { backgroundColor: "transparent" } }}
        >
          Back
        </Button>
      </Stack>

      {isDisposalLoading && <MasterlistSkeleton />}
      {isDisposalError && <ErrorFetching refetch={refetch} error={errorData} />}
      {disposalData && !isDisposalError && !isDisposalLoading && (
        <Box
          className={isSmallScreen ? "request request__wrapper" : "request__wrapper"}
          p={2}
          component="form"
          // onSubmit={handleSubmit(addDisposalHandler)}
        >
          <Stack>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              {`TRANSACTION No. ${transactionData?.id} `}
            </Typography>

            <Stack id="requestForm" className="request__form" gap={2} pb={1}>
              <Stack gap={2}>
                <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                  DISPOSAL DETAILS
                </Typography>

                <CustomTextField
                  control={control}
                  name="description"
                  label="Description"
                  type="text"
                  error={!!errors?.description}
                  helperText={errors?.description?.message}
                  fullWidth
                  multiline
                  InputProps={{ readOnly: true }}
                />

                <CustomTextField
                  control={control}
                  name="remarks"
                  label="Remarks (Optional)"
                  optional
                  type="text"
                  error={!!errors?.remarks}
                  helperText={errors?.remarks?.message}
                  fullWidth
                  multiline
                  InputProps={{ readOnly: true }}
                />

                <CustomAutoComplete
                  control={control}
                  name="receiving_warehouse_id"
                  options={[]}
                  InputProps={{ readOnly: true }}
                  freeSolo
                  disableClearable
                  getOptionLabel={(option) => option.warehouse_name}
                  getOptionKey={(option) => option.warehouse_code}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      color="secondary"
                      label="Receiving Warehouse"
                      error={!!errors?.receiving_warehouse_id}
                      helperText={errors?.receiving_warehouse_id?.message}
                    />
                  )}
                />

                {watch("attachments") !== null ? (
                  <UpdateField label={"Attachments"} value={watch("attachments")?.length} />
                ) : (
                  <CustomMultipleAttachment
                    control={control}
                    name="attachments"
                    label="Attachments"
                    inputRef={AttachmentRef}
                    error={!!errors?.attachments?.message}
                    helperText={errors?.attachments?.message}
                    requiredField
                    disabled
                  />
                )}

                <Box mt="-13px" ml="10px">
                  {watch("attachments")
                    ? watch("attachments").map((item, index) => (
                        <Typography
                          fontSize="12px"
                          fontWeight="bold"
                          key={index}
                          onClick={() => transactionData?.approving && handleFileView(item?.id)}
                          sx={{
                            cursor: transactionData?.approving && "pointer",
                            textDecoration: transactionData?.approving && "underline",
                            mb: 1,
                          }}
                          maxWidth={"265px"}
                        >
                          • {item?.name}
                        </Typography>
                      ))
                    : null}
                </Box>
              </Stack>

              {!!!isSmallScreen && (
                <Box my={2}>
                  <Divider />
                </Box>
              )}
            </Stack>
          </Stack>

          <Box className="request__table">
            <Box textAlign={"center"}>
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
                ASSET DETAILS
              </Typography>
            </Box>

            <TableContainer className="request__th-body  request__wrapper" sx={{ height: "calc(100vh - 280px)" }}>
              <Table className="request__table " stickyHeader>
                <TableHead>
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
                    <TableCell className="tbl-cell">Chart of Account</TableCell>
                    <TableCell className="tbl-cell">Date Created</TableCell>
                    <TableCell className="tbl-cell">Pullout Attachment</TableCell>
                    <TableCell className="tbl-cell">Evaluation Attachment</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isDisposalFetching ? (
                    <LoadingData />
                  ) : (
                    fields.map((item, index) => (
                      <TableRow>
                        <TableCell className="tbl-cell">
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
                          <Controller
                            control={control}
                            name={`assets.${index}.fixed_asset_id`}
                            render={({ field: { ref, value, onChange } }) => (
                              <Autocomplete
                                options={[]}
                                readOnly
                                size="small"
                                value={value}
                                freeSolo
                                getOptionLabel={(option) =>
                                  `(${option.vladimir_tag_number}) - ${option.asset_description}`
                                }
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                renderInput={(params) => (
                                  <TextField
                                    required
                                    InputProps={{ readOnly: true }}
                                    color="secondary"
                                    {...params}
                                    label="Tag Number"
                                    multiline
                                    maxRows={2}
                                    sx={{
                                      "& .MuiInputBase-inputMultiline": {
                                        minHeight: "10px",
                                      },
                                    }}
                                  />
                                )}
                                sx={{
                                  ".MuiInputBase-root": {
                                    borderRadius: "10px",
                                    minHeight: "63px",
                                  },
                                  ".MuiInputLabel-root.Mui-disabled": {
                                    backgroundColor: "transparent",
                                  },
                                  ".Mui-disabled": {
                                    backgroundColor: "background.light",
                                  },
                                  ".MuiOutlinedInput-notchedOutline": {
                                    bgcolor: "#f5c9861c",
                                  },
                                  "& .MuiFormLabel-root": {
                                    lineHeight: "43px", // Adjust based on the height of the input
                                  },
                                  "& .Mui-focused": {
                                    top: "-10%", // Center vertically
                                  },
                                  "& .MuiFormLabel-filled": {
                                    top: "-10%", // Center vertically
                                  },
                                  ml: "-15px",
                                  minWidth: "230px",
                                  maxWidth: "550px",
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="tbl-cell">
                          <TextField
                            {...register(`assets.${index}.asset_accountable`)}
                            variant="outlined"
                            disabled
                            multiline
                            maxRows={2}
                            type="text"
                            error={!!errors?.accountableAccount}
                            helperText={errors?.accountableAccount?.message}
                            sx={{
                              backgroundColor: "transparent",
                              border: "none",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                              "& .MuiInputBase-input": {
                                backgroundColor: "transparent",
                                textOverflow: "ellipsis",
                                // fontWeight: "500",
                              },
                              "& .MuiInputBase-inputMultiline": {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // textAlign: "center",
                              },

                              ml: "-15px",
                              minWidth: "150px",
                            }}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack width="250px" rowGap={0}>
                            <TextField
                              {...register(`assets.${index}.one_charging_id`)}
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
                        <TableCell className="tbl-cell">
                          <Box width={"120px"}>
                            {watch(`assets.${index}.created_at`) !== null ? (
                              <Chip
                                variant="filled"
                                color="secondary"
                                size="small"
                                sx={{ borderRadius: "20px", ml: "-13px", width: "100%" }}
                                label={watch(`assets.${index}.created_at`)}
                              />
                            ) : (
                              <TextField
                                {...register(`assets.${index}.created_at`)}
                                variant="outlined"
                                disabled
                                sx={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  ml: "-11px",
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      border: "none",
                                    },
                                  },
                                  "& .MuiInputBase-input": {
                                    backgroundColor: "transparent",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell className="tbl-cell">
                          <Stack flexDirection="column" gap={1}>
                            {!!data &&
                              data.assets[index]?.attachments.map((item) => (
                                <Tooltip title={"View or Download Evaluation Attachment"} arrow>
                                  <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)}>
                                    {item?.name}
                                  </Typography>
                                </Tooltip>
                              ))}
                          </Stack>
                        </TableCell>
                        <TableCell className="tbl-cell">
                          <Stack flexDirection="column" gap={0.5}>
                            {!!data &&
                              data.assets[index]?.evaluation_attachments.map((item) => (
                                <Tooltip title={"View or Download Evaluation Attachment"} arrow>
                                  <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)}>
                                    {item?.name}
                                  </Typography>
                                </Tooltip>
                              ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!transactionData?.approved && (
              <Stack flexDirection="row" justifyContent="space-between" alignItems={"center"} mt={1}>
                <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main">
                  Added: {fields.length > 1 ? `${fields.length} Assets` : `${fields.length} Asset`}
                </Typography>
                <Stack flexDirection="row" gap={2}>
                  <Stack flexDirection="row" justifyContent="flex-end" alignItems="center" gap={2}>
                    {
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          color="secondary"
                          disabled={isDisposalLoading || isDisposalFetching}
                          onClick={() =>
                            onApprovalApproveHandler(
                              transactionData?.id ? transactionData?.id : transactionData?.disposal_number
                            )
                          }
                          startIcon={<Check color="primary" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={isDisposalLoading || isDisposalFetching}
                          onClick={() =>
                            onApprovalReturnHandler(
                              transactionData?.id ? transactionData?.id : transactionData?.disposal_number
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
                      </>
                    }
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ViewDisposal;
