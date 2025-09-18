import { Add, ArrowBackIosRounded, Create, Info, Remove, RemoveCircle } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  createFilterOptions,
  Divider,
  IconButton,
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
import { useLocation, useNavigate } from "react-router-dom";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { createRef, useEffect, useRef, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import { useFileView } from "../../../Hooks/useFileView";
import { useLazyGetFixedAssetTransferAllApiQuery } from "../../../Redux/Query/Movement/Transfer";
import CustomAttachmentArray from "../../../Components/Reusable/CustomAttachmentArray";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { resetGetData } from "../../../Redux/StateManagement/actionMenuSlice";
import { assetDisposalApi } from "../../../Redux/Query/Settings/AssetDisposal";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { useLazyGetWarehouseAllApiQuery } from "../../../Redux/Query/Masterlist/Warehouse";
import { disposalApi, useGetDisposalByIdApiQuery } from "../../../Redux/Query/Movement/Disposal";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";

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
const AddDisposal = () => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(min-width: 700px)");
  const { state: transactionData } = useLocation();
  const AttachmentRef = useRef(null);
  const actionMenuData = useSelector((state) => state?.actionMenu?.actionData);
  const dispatch = useDispatch();
  console.log("actionMenuData: ", actionMenuData);
  console.log("transactionData: ", transactionData);

  const {
    data: disposalData,
    isLoading: isDisposalLoading,
    isFetching: isDisposalFetching,
    isSuccess: isDisposalSuccess,
    isError: isDisposalError,
    error: disposalError,
    refetch,
  } = useGetDisposalByIdApiQuery({ id: transactionData?.id }, { refetchOnMountOrArgChange: true });

  const data = disposalData?.at(0);
  console.log("data", data);

  const [
    fixedAssetTrigger,
    {
      data: vTagNumberData = [],
      isLoading: isVTagNumberLoading,
      isSuccess: isVTagNumberSuccess,
      isError: isVTagNumberError,
      error: vTagNumberError,
    },
  ] = useLazyGetFixedAssetTransferAllApiQuery({}, { refetchOnMountOrArgChange: true });

  const [
    warehouseTrigger,
    {
      data: warehouseData = [],
      isLoading: isWarehouseLoading,
      isSuccess: isWarehouseSuccess,
      isError: isWarehouseError,
      refetch: isWarehouseRefetch,
    },
  ] = useLazyGetWarehouseAllApiQuery();

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
    rules: { required: true, message: "At least one is required" },
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
          asset_accountable: asset?.accountable === "-" ? "Common" : asset?.accountable,
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

  useEffect(() => {
    if (actionMenuData) {
      // fixedAssetTrigger();
      reset({
        description: "",
        remarks: "",
        attachments: null,

        assets: actionMenuData?.map((asset) => ({
          id: asset.id,
          fixed_asset_id: asset?.asset,
          asset_accountable:
            asset?.asset?.accountable === "-" || asset?.asset?.accountable === " "
              ? "Common"
              : asset?.asset?.accountable,
          created_at:
            moment(asset.created_at).format("MMM. DD, YYYY") || moment(asset.acquisition_date).format("MMM. DD, YYYY"),
          one_charging_id: asset?.asset.one_charging?.name,
          company_id: asset?.asset.one_charging?.company_name,
          business_unit_id: asset?.asset.one_charging?.business_unit_name,
          department_id: asset?.asset.one_charging?.department_name,
          unit_id: asset?.asset.one_charging?.unit_name,
          sub_unit_id: asset?.asset.one_charging?.subunit_name,
          location_id: asset?.asset.one_charging?.location_name,
          attachments: asset?.evaluation_attachments,
        })),
      });
    }
  }, [actionMenuData]);

  const handleAppendItem = () =>
    append({
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
    });

  const RemoveFile = ({ title, value }) => {
    return (
      <Tooltip title="Remove attachment" arrow>
        <IconButton
          onClick={() => {
            setValue(value, null);
            // ref.current.files = [];
          }}
          size="small"
          sx={{
            backgroundColor: "error.main",
            color: "white",
            ":hover": { backgroundColor: "error.main" },
            height: "25px",
            width: "25px",
          }}
        >
          <Remove />
        </IconButton>
      </Tooltip>
    );
  };

  // const RemoveFileArray = ({ itemId }) => {
  //   return (
  //     <Tooltip title={`Remove Attachment`} arrow>
  //       <IconButton
  //         onClick={() => {
  //           setValue(`assets.${itemId}.attachments`, null);
  //           if (attachmentRefs.current[itemId] && attachmentRefs.current[itemId].current) {
  //             // If using React ref object (created with useRef())
  //             attachmentRefs.current[itemId].current.value = "";
  //           } else if (attachmentRefs.current[itemId]) {
  //             // If using direct DOM element reference
  //             attachmentRefs.current[itemId].value = "";
  //           }
  //         }}
  //         size="small"
  //         sx={{
  //           backgroundColor: "error.main",
  //           color: "white",
  //           ":hover": { backgroundColor: "error.main" },
  //           height: "25px",
  //           width: "25px",
  //         }}
  //       >
  //         <Remove />
  //       </IconButton>
  //     </Tooltip>
  //   );
  // };

  const UpdateField = ({ value, label, requiredField }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
          disabled={transactionData?.view}
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
              bgcolor: requiredField && "#f5c9861c",
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

        {watch("attachments") !== null && !transactionData?.view && (
          <RemoveFile title="Evaluation Form" value="attachments" />
        )}
      </Stack>
    );
  };

  const handleFileView = (id) => {
    useFileView({ id } || id);
  };

  const filterOptions = createFilterOptions({
    limit: 100,
    matchFrom: "any",
  });

  console.log("errors", errors);
  const addDisposalHandler = (formData, e) => {
    console.log("formData", formData);
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = {
      // // ...formData,
      description: formData?.description,
      remarks: formData?.remarks,
      attachments: formData?.attachments,
      receiving_warehouse_id: formData?.receiving_warehouse_id?.sync_id,
      assets: formData?.assets?.map((item) => ({
        fixed_asset_id: item.fixed_asset_id.id,
        pullout_id: item?.id,
      })),
    };

    console.log("data", data);

    const submitData = () => {
      return axios.post(`${process.env.VLADIMIR_BASE_URL}/disposal`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    };

    dispatch(
      openConfirm({
        icon: Info,
        iconColor: "info",
        message: (
          <Box>
            <Typography> Are you sure you want to</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
              }}
            >
              CREATE
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const test = await submitData();
            dispatch(
              openToast({
                message: "Disposal Request Successfully Added",
                duration: 5000,
              })
            );
            dispatch(resetGetData());

            navigate("/asset-movement/disposal");
            dispatch(disposalApi.util.invalidateTags(["Disposal"]));
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.response?.data?.message || err?.message,
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

  const attachmentSx = {
    textDecoration: "underline",
    cursor: "pointer",
    color: "primary.main",
    fontSize: "12px",
  };

  return (
    <Box className="mcontainer">
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
        <Button
          variant="text"
          color="secondary"
          size="small"
          startIcon={<ArrowBackIosRounded color="secondary" />}
          onClick={() => {
            navigate(-1);
            dispatch(resetGetData());
          }}
          disableRipple
          sx={{ mt: "-5px", "&:hover": { backgroundColor: "transparent" } }}
        >
          Back
        </Button>
      </Stack>

      <Box
        className={isSmallScreen ? "request request__wrapper" : "request__wrapper"}
        p={2}
        component="form"
        onSubmit={handleSubmit(addDisposalHandler)}
      >
        <Stack>
          <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
            {`${transactionData?.view ? "VIEW INFORMATION" : "ADD DISPOSAL REQUEST"} `}
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
                disabled={transactionData?.view}
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
                disabled={transactionData?.view}
              />

              <CustomAutoComplete
                control={control}
                name="receiving_warehouse_id"
                options={warehouseData}
                onOpen={() => (isWarehouseSuccess ? null : warehouseTrigger(0))}
                loading={isWarehouseLoading}
                disabled={transactionData?.view}
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
                />
              )}

              <Box mt="-13px" ml="10px">
                {watch("attachments")
                  ? watch("attachments").map((item, index) => (
                      <Typography
                        fontSize="12px"
                        fontWeight="bold"
                        key={index}
                        onClick={() => transactionData?.view && handleFileView(item?.id)}
                        sx={{
                          cursor: transactionData?.view && "pointer",
                          textDecoration: transactionData?.view && "underline",
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
          <Box textAlign={!transactionData?.view && "center"}>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              {transactionData?.view ? `TRANSACTION No. ${transactionData?.id}` : "DISPOSAL REQUEST FORM"}
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
                  {!transactionData?.view && <TableCell className="tbl-cell">Action</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {transactionData?.view && isDisposalFetching ? (
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
                              options={vTagNumberData}
                              onOpen={() => (isVTagNumberSuccess ? null : fixedAssetTrigger({ is_spare: 0 }))}
                              loading={isVTagNumberLoading}
                              // disabled={transactionData?.view}
                              disabled
                              size="small"
                              value={value}
                              // disableClearable
                              filterOptions={filterOptions}
                              getOptionLabel={(option) =>
                                `(${option.vladimir_tag_number}) - ${option.asset_description}`
                              }
                              isOptionEqualToValue={(option, value) => option?.id === value?.id}
                              renderInput={(params) => (
                                <TextField
                                  required
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
                              getOptionDisabled={(option) =>
                                !!fields.find((item) => item?.fixed_asset_id?.id === option.id)
                              }
                              onChange={(_, newValue) => {
                                if (newValue) {
                                  // console.log("newValue: ", newValue);
                                  onChange(newValue);
                                  setValue(
                                    `assets.${index}.asset_accountable`,
                                    newValue.accountable === "-" ? "Common" : newValue.accountable
                                  );
                                  setValue(`assets.${index}.id`, newValue.id);
                                  setValue(
                                    `assets.${index}.created_at`,
                                    moment(newValue.created_at).format("MMM. DD, YYYY")
                                  );
                                  setValue(`assets.${index}.one_charging_id`, newValue.one_charging?.name);
                                  setValue(`assets.${index}.company_id`, newValue.one_charging?.company_name);
                                  setValue(
                                    `assets.${index}.business_unit_id`,
                                    newValue.one_charging?.business_unit_name
                                  );
                                  setValue(`assets.${index}.department_id`, newValue.one_charging?.department_name);
                                  setValue(`assets.${index}.unit_id`, newValue.one_charging?.unit_name);
                                  setValue(`assets.${index}.sub_unit_id`, newValue.one_charging?.subunit_name);
                                  setValue(`assets.${index}.location_id`, newValue.one_charging?.location_name);
                                } else {
                                  onChange(null);
                                  setValue(`assets.${index}.asset_accountable`, "");
                                  setValue(`assets.${index}.remaining_book_value`, "");
                                  setValue(`assets.${index}.created_at`, null);
                                  setValue(`assets.${index}.one_charging_id`, "");
                                  setValue(`assets.${index}.company_id`, "");
                                  setValue(`assets.${index}.business_unit_id`, "");
                                  setValue(`assets.${index}.department_id`, "");
                                  setValue(`assets.${index}.unit_id`, "");
                                  setValue(`assets.${index}.sub_unit_id`, "");
                                  setValue(`assets.${index}.location_id`, "");
                                }

                                return newValue;
                              }}
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
                          {actionMenuData &&
                            actionMenuData[index]?.attachments.map((item) => (
                              <Tooltip title={"View or Download Evaluation Attachment"} arrow>
                                <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)}>
                                  {item?.name}
                                </Typography>
                              </Tooltip>
                            ))}
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
                        <Stack flexDirection="column" gap={1}>
                          {actionMenuData &&
                            actionMenuData[index]?.evaluation_attachments.map((item) => (
                              <Tooltip title={"View or Download Evaluation Attachment"} arrow>
                                <Typography sx={attachmentSx} onClick={() => handleFileView(item?.id)}>
                                  {item?.name}
                                </Typography>
                              </Tooltip>
                            ))}

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

                      {!transactionData?.view && (
                        <TableCell align="center" className="tbl-cell">
                          <IconButton onClick={() => remove(index)} disabled={fields.length === 1}>
                            <Tooltip title="Delete Row" placement="top" arrow>
                              <RemoveCircle color={fields.length === 1 ? "gray" : "warning"} />
                            </Tooltip>
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}

                {/* <TableRow>
                  <TableCell colSpan={99}>
                    <Stack flexDirection="row" gap={2}>
                      {
                        // !isTransferLoading && !isTransferFetching &&
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAppendItem()}
                          // disabled={
                          //   watch(`assets`).some((item) => item?.fixed_asset_id === null) ? true : transactionData?.view
                          // }
                        >
                          Add Row
                        </Button>
                      }
                    </Stack>
                  </TableCell>
                </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main" pt="10px">
              Added: {fields.length} Asset{fields.length >= 2 ? "s" : null}
            </Typography>
            <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
              {!transactionData?.view && (
                <>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="small"
                    color="secondary"
                    startIcon={<Create color={"primary"} />}
                    // loading={isPostLoading || isUpdateLoading}
                    // disabled={!isValid || !isDirty}
                    sx={{ mt: "10px" }}
                  >
                    Create
                  </LoadingButton>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AddDisposal;
