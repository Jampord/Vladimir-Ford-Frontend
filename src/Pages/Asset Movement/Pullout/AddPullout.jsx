import {
  Add,
  AddToPhotos,
  ArrowBackIosRounded,
  Create,
  Info,
  MoreVert,
  Remove,
  RemoveCircle,
} from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  Divider,
  Grow,
  IconButton,
  InputAdornment,
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
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";

import AttachmentActive from "../../../Img/SVG/AttachmentActive.svg";
import { LoadingButton } from "@mui/lab";
import { useDispatch, useSelector } from "react-redux";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import {
  pulloutApi,
  useGetPulloutNumberApiQuery,
  useLazyGetFixedAssetPulloutAllApiQuery,
} from "../../../Redux/Query/Movement/Pullout";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import AddPulloutSkeleton from "./Skeleton/AddPulloutSkeleton";
import StatusComponent from "../../../Components/Reusable/FaStatusComponent";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import PulloutTimeline from "../PulloutTimeline";
import { getData } from "../../../Redux/StateManagement/actionMenuSlice";
import ErrorFetching from "../../ErrorFetching";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";

const schema = yup.object().shape({
  id: yup.string(),
  description: yup.string().required().label("Description"),
  care_of: yup.string().required().label("Care of").typeError("Care of is a required field"),
  remarks: yup.string().label("Remarks"),
  helpdesk_number: yup.string().label("Helpdesk Number"),
  attachments: yup.mixed().label("Attachments"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string().nullable(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
      one_charging_id: yup.string().nullable(),
      company_id: yup.string().nullable(),
      business_unit_id: yup.string().nullable(),
      department_id: yup.string().nullable(),
      unit_id: yup.string().nullable(),
      sub_unit_id: yup.string().nullable(),
      location_id: yup.string().nullable(),
    })
  ),
});

const AddPullout = () => {
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timelineData, setTimelineData] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const isSmallScreen = useMediaQuery("(min-width: 700px)");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const attachmentRef = useRef(null);
  const { state: transactionData } = useLocation();

  const dialog = useSelector((state) => state.booleanState.dialog);

  const [
    fixedAssetTrigger,
    {
      data: vTagNumberData = [],
      isLoading: isVTagNumberLoading,
      isSuccess: isVTagNumberSuccess,
      isError: isVTagNumberError,
      error: vTagNumberError,
    },
  ] = useLazyGetFixedAssetPulloutAllApiQuery({}, { refetchOnMountOrArgChange: true });

  const {
    data: pulloutData = [],
    isLoading: isPulloutLoading,
    isSuccess: isPulloutSuccess,
    isError: isPulloutError,
    isFetching: isPulloutFetching,
    refetch,
    error: errorData,
  } = useGetPulloutNumberApiQuery({ pullout_number: transactionData?.id }, { refetchOnMountOrArgChange: true });

  const data = pulloutData?.at(0);

  const {
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      description: "",
      care_of: null,
      remarks: "",
      helpdesk_number: "",
      attachments: null,
      assets: [
        {
          asset_id: null,
          fixed_asset_id: null,
          asset_accountable: "",
          one_charging_id: null,
          company_id: null,
          business_unit_id: null,
          department_id: null,
          unit_id: null,
          sub_unit_id: null,
          location_id: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
    rules: { required: true, message: "At least one is required" },
  });
  const handleAppendItem = () =>
    append({
      id: null,
      fixed_asset_id: null,
      asset_accountable: "",
      created_at: null,
      one_charging_id: null,
      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      sub_unit_id: null,
      location_id: null,
      accountability: null,
      accountable: null,
      receiver_id: null,
    });

  useEffect(() => {
    if (data) {
      fixedAssetTrigger();
      reset({
        description: data?.description,
        remarks: data?.remarks || "",
        helpdesk_number: data?.helpdesk_number,
        attachments: data?.attachments,
        care_of: data?.care_of,

        assets: data?.assets.map((asset) => ({
          id: asset.id,
          fixed_asset_id: asset,
          asset_accountable: asset.accountable,
          asset_accountability: asset.accountability,
          created_at: asset.created_at || asset.acquisition_date,
          one_charging_id: asset.one_charging?.name,
          company_id: asset.one_charging?.company_name || asset.company?.company_name,
          business_unit_id: asset.one_charging?.business_unit_name || asset.business_unit?.business_unit_name,
          department_id: asset.one_charging?.department_name || asset.department?.department_name,
          unit_id: asset.one_charging?.unit_name || asset.unit?.unit_name,
          sub_unit_id: asset.one_charging?.subunit_name || asset.subunit?.subunit_name,
          location_id: asset.one_charging?.location_name || asset.location?.location_name,
        })),
      });
    }
  }, [data, edit]);

  //* Form functions ----------------------------------------------------------------
  const addPulloutHandler = (formData) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const data = {
      ...formData,
      description: formData?.description.toString(),
      care_of: formData?.care_of.toString(),
      remarks: formData?.remarks.toString(),
      helpdesk_number: formData?.helpdesk_number.toString(),

      attachments: formData?.attachments,

      assets: formData?.assets?.map((item) => ({
        fixed_asset_id: item.fixed_asset_id.id,
      })),
    };

    const submitData = () => {
      setIsLoading(true);
      return axios.post(
        `${process.env.VLADIMIR_BASE_URL}/${
          edit || transactionData?.edit ? `pullout-update/${transactionData?.id}` : "pullout"
        }`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
              {transactionData?.status === "Returned"
                ? "RESUBMIT"
                : edit || transactionData?.edit
                ? "UPDATE"
                : "CREATE"}
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const test = await submitData();
            console.log("test", test);
            dispatch(
              openToast({
                message: "Pullout Request Successfully Added",
                duration: 5000,
              })
            );

            setIsLoading(false);
            transactionData && reset();

            navigate("/asset-movement/pull-out");
            dispatch(pulloutApi.util.invalidateTags(["Pullout"]));
          } catch (err) {
            // console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err?.message,
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

  const RemoveFile = ({ title, value }) => {
    return (
      <Tooltip title="Remove attachment" arrow>
        <IconButton
          onClick={() => {
            setValue(value, null);
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

  const UpdateField = ({ value, label, requiredField }) => {
    return (
      <Stack flexDirection="row" gap={1} alignItems="center">
        <TextField
          type="text"
          size="small"
          label={label}
          autoComplete="off"
          color="secondary"
          disabled={edit ? false : transactionData?.view}
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
      </Stack>
    );
  };

  const handleViewFile = async (id) => {
    try {
      const response = await fetch(`${process.env.VLADIMIR_BASE_URL}/file/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.GL_KEY },
      });
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);

      // Open new window and store reference
      const newWindow = window.open(fileURL, "_blank");

      if (newWindow) {
        // Add to cache and setup cleanup listener
        blobUrlCache.set(newWindow, fileURL);
        newWindow.addEventListener("unload", () => {
          URL.revokeObjectURL(fileURL);
          blobUrlCache.delete(newWindow);
        });
      } else {
        // Revoke immediately if window failed to open
        URL.revokeObjectURL(fileURL);
      }
    } catch (err) {
      console.error("Error handling file view:", err);
    }
  };

  // Cleanup for main window close (optional safety net)
  window.addEventListener("beforeunload", () => {
    blobUrlCache.forEach((url, win) => {
      URL.revokeObjectURL(url);
      blobUrlCache.delete(win);
    });
  });

  const handleViewTimeline = (data) => {
    // console.log(data);
    dispatch(openDialog());
    setTimelineData(data);
  };

  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const handleRequestNavigateClick = (data) => {
    dispatch(getData(data));
    navigate("/asset-requisition/requisition/add-requisition", {
      // state: { ...data, pullout: true },
      // replace: true,
    });
    setAnchorEl(null);
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
          }}
          disableRipple
          sx={{ mt: "-5px", "&:hover": { backgroundColor: "transparent" } }}
        >
          Back
        </Button>
      </Stack>

      {isPulloutLoading && <MasterlistSkeleton />}
      {isPulloutError && <ErrorFetching refetch={refetch} error={errorData} />}
      {pulloutData && !isPulloutError && !isPulloutLoading && (
        <Box
          className={isSmallScreen ? "request request__wrapper" : "request__wrapper"}
          p={2}
          component="form"
          onSubmit={handleSubmit(addPulloutHandler)}
        >
          {isPulloutLoading || isPulloutFetching ? (
            <AddPulloutSkeleton />
          ) : (
            <Stack>
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
                {transactionData?.view ? "VIEW PULLOUT REQUEST" : "ADD PULLOUT REQUEST"}
              </Typography>

              <Stack id="requestForm" className="request__form" gap={1} pb={1}>
                <Stack gap={1.5}>
                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                    REQUEST DETAILS
                  </Typography>

                  <CustomTextField
                    control={control}
                    name="description"
                    disabled={edit ? false : transactionData?.view}
                    label="Request Description"
                    type="text"
                    error={!!errors?.description}
                    helperText={errors?.description?.message}
                    fullWidth
                    multiline
                  />

                  <CustomAutoComplete
                    autoComplete
                    name="care_of"
                    control={control}
                    options={["Hardware and Maintenance", "Machinery & Equipment"]}
                    disabled={edit ? false : transactionData?.view}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="secondary"
                        label="Care of"
                        multiline
                        error={!!errors?.accountability}
                        helperText={errors?.accountability?.message}
                      />
                    )}
                  />

                  <CustomTextField
                    control={control}
                    name="remarks"
                    disabled={edit ? false : transactionData?.view}
                    label="Remarks (Optional)"
                    type="text"
                    error={!!errors?.description}
                    helperText={errors?.description?.message}
                    fullWidth
                    multiline
                    optional
                  />

                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                    HELPDESK
                  </Typography>

                  <CustomTextField
                    control={control}
                    name="helpdesk_number"
                    disabled={edit ? false : transactionData?.view}
                    label="Helpdesk Number (Optional)"
                    type="text"
                    error={!!errors?.helpdesk_number}
                    helperText={errors?.helpdesk_number?.message}
                    fullWidth
                    multiline
                    optional
                  />

                  <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                    ATTACHMENTS
                  </Typography>
                  <Stack flexDirection="row" gap={1} alignItems="center">
                    {watch("attachments") !== null ? (
                      <UpdateField label={"SR Form"} value={watch("attachments")?.length} />
                    ) : (
                      <CustomMultipleAttachment
                        control={control}
                        name="attachments"
                        disabled={edit ? false : transactionData?.view}
                        label="SR Form (Optional)"
                        inputRef={attachmentRef}
                        error={!!errors?.attachments?.message}
                        helperText={errors?.attachments?.message}
                        fullWidth
                      />
                    )}

                    {watch("attachments") !== null && (!transactionData?.view || edit) && (
                      <RemoveFile title="SR Form" value="attachments" />
                    )}
                  </Stack>

                  <Box mt="-13px" ml="10px">
                    {watch("attachments")
                      ? watch("attachments").map((item, index) => (
                          <Typography
                            fontSize="12px"
                            fontWeight="bold"
                            key={index}
                            onClick={() => handleViewFile(item?.id)}
                            maxWidth={"265px"}
                            sx={{
                              cursor: "pointer",
                              textDecoration: "underline",
                              mb: 1,
                            }}
                          >
                            {item.name}
                          </Typography>
                        ))
                      : null}
                  </Box>
                </Stack>
              </Stack>
            </Stack>
          )}

          {!!!isSmallScreen && (
            <Box my={2}>
              <Divider />
            </Box>
          )}

          <Box className="request__table">
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
              {`${transactionData ? `TRANSACTION NO. ${transactionData?.id}` : "FIXED ASSET"}`}
            </Typography>

            <TableContainer className="request__th-body request__wrapper" sx={{ height: "calc(100vh - 280px)" }}>
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
                    <TableCell className="tbl-cell">Assets</TableCell>
                    <TableCell className="tbl-cell">Accountability</TableCell>
                    {transactionData?.view && <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>}
                    <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                    {/* {transactionData && (
                    <TableCell className="tbl-cell" align="center">
                      Action
                    </TableCell>
                  )} */}
                    <TableCell className="tbl-cell">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isPulloutLoading || isPulloutFetching ? (
                    <LoadingData />
                  ) : (
                    fields.map((item, index) => (
                      <TableRow key={item.id} id="appendedRow" className={`rowItem ${item.id ? "animateRow" : ""}`}>
                        <TableCell sx={{ pl: "30px" }} className="tbl-cell">
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
                                onOpen={() => (isVTagNumberSuccess ? null : fixedAssetTrigger())}
                                loading={isVTagNumberLoading}
                                disabled={edit ? false : transactionData?.view}
                                size="small"
                                value={value}
                                // filterOptions={filterOptions}
                                disableClearable
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
                                    maxRows={5}
                                    sx={{
                                      "& .MuiInputBase-inputMultiline": {
                                        minHeight: "10px",
                                      },
                                    }}
                                  />
                                )}
                                getOptionDisabled={
                                  (option) => !!fields.find((item) => item?.fixed_asset_id?.id === option.id)
                                  // ||
                                  // option.transfer === 1
                                }
                                onChange={(_, newValue) => {
                                  if (newValue) {
                                    // onChange(newValue);
                                    console.log("newValue: ", newValue);
                                    onChange(newValue);
                                    setValue(
                                      `assets.${index}.asset_accountability`,
                                      newValue.accountability === "-" ? "Common" : newValue.accountability
                                    );
                                    setValue(
                                      `assets.${index}.asset_accountable`,
                                      // newValue.accountable === "-" ? "" :
                                      newValue.accountable
                                    );
                                    setValue(`assets.${index}.id`, newValue.id);
                                    setValue(`assets.${index}.company_id`, newValue.company?.company_name);
                                    setValue(`assets.${index}.one_charging_id`, newValue.one_charging?.name);
                                    setValue(
                                      `assets.${index}.business_unit_id`,
                                      newValue.one_charging?.business_unit_name ||
                                        newValue.business_unit?.business_unit_name
                                    );
                                    setValue(
                                      `assets.${index}.department_id`,
                                      newValue.one_charging?.department_name || newValue.department?.department_name
                                    );
                                    setValue(
                                      `assets.${index}.unit_id`,
                                      newValue.one_charging?.unit_name || newValue.unit?.unit_name
                                    );
                                    setValue(
                                      `assets.${index}.sub_unit_id`,
                                      newValue.one_charging?.subunit_name || newValue.subunit?.subunit_name
                                    );
                                    setValue(
                                      `assets.${index}.location_id`,
                                      newValue.one_charging?.location_name || newValue.location?.location_name
                                    );
                                  } else {
                                    onChange(null);
                                    setValue(`assets.${index}.asset_accountable`, "");
                                  }

                                  return newValue;
                                }}
                                sx={{
                                  ".MuiInputBase-root": {
                                    borderRadius: "10px",
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
                                  ml: "-15px",
                                  minWidth: "230px",
                                  maxWidth: "550px",
                                }}
                              />
                            )}
                          />
                        </TableCell>

                        <TableCell className="tbl-cell">
                          <Stack width="250px">
                            <TextField
                              {...register(`assets.${index}.asset_accountability`)}
                              variant="outlined"
                              disabled
                              type="text"
                              // error={!!errors?.accountableAccount}
                              // helperText={errors?.accountableAccount?.message}
                              sx={{
                                backgroundColor: "transparent",

                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  textOverflow: "ellipsis",
                                },

                                ml: "-15px",
                                minWidth: "250px",
                                // marginTop: "-10px",
                              }}
                              inputProps={{ color: "red" }}
                            />

                            <TextField
                              {...register(`assets.${index}.asset_accountable`)}
                              variant="outlined"
                              disabled
                              type="text"
                              multiline
                              // error={!!errors?.accountableAccount}
                              // helperText={errors?.accountableAccount?.message}
                              sx={{
                                backgroundColor: "transparent",

                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "500",
                                  fontSize: "13px",
                                  // textOverflow: "ellipsis",
                                },

                                ml: "-15px",
                                minWidth: "250px",
                                marginTop: "-30px",
                              }}
                              inputProps={{ color: "red" }}
                            />
                          </Stack>
                        </TableCell>

                        {transactionData?.view && (
                          <TableCell className="tbl-cell tr-cen-pad45">
                            {data?.assets[index]?.pullout_status && (
                              <Box onClick={() => handleViewTimeline(data?.assets[index])}>
                                <StatusComponent faStatus={data?.assets[index]?.pullout_status} hover />
                              </Box>
                            )}
                          </TableCell>
                        )}

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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
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

                                ml: "-10px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    border: "none",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  textOverflow: "ellipsis",
                                },

                                marginTop: "-15px",
                                marginBottom: "-10px",
                              }}
                            />
                          </Stack>
                        </TableCell>

                        <TableCell className="tbl-cell">
                          {!!!transactionData?.view ? (
                            <IconButton
                              onClick={() => remove(index)}
                              disabled={edit ? false : fields.length === 1 || transactionData?.view}
                            >
                              <Tooltip title="Delete Row" placement="top" arrow>
                                <RemoveCircle
                                  color={
                                    fields.length === 1 || transactionData?.view
                                      ? edit
                                        ? "warning"
                                        : "gray"
                                      : "warning"
                                  }
                                />
                              </Tooltip>
                            </IconButton>
                          ) : (
                            item?.fixed_asset_id?.pullout_status === "For Replacement" && (
                              <IconButton onClick={(e) => handleClick(e, index)}>
                                <MoreVert color="secondary" />
                              </IconButton>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {!!!transactionData?.view && (
                    <TableRow>
                      <TableCell colSpan={99}>
                        <Stack flexDirection="row" gap={2}>
                          {!isPulloutLoading && !isPulloutFetching && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Add />}
                              onClick={() => handleAppendItem()}
                              disabled={
                                watch(`assets`).some((item) => item?.fixed_asset_id === null)
                                  ? true
                                  : edit
                                  ? false
                                  : transactionData?.view
                              }
                            >
                              Add Row
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
              <Typography fontFamily="Anton, Impact, Roboto" fontSize="16px" color="secondary.main" pt="10px">
                Added: {fields.length} Asset{fields.length >= 2 ? "s" : null}
              </Typography>

              {console.log("errors", errors)}

              <Stack flexDirection="row" justifyContent="flex-end" gap={2}>
                {(!transactionData?.view || edit) && (
                  <>
                    {edit && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        // startIcon={<Cancel color="secondary" />}
                        onClick={() => setEdit(false)}
                        sx={{ color: "secondary.main", mt: "10px" }}
                      >
                        Cancel
                      </Button>
                    )}
                    <LoadingButton
                      // onClick={onSubmitHandler}
                      type="submit"
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<Create color={"primary"} />}
                      // loading={isPostLoading || isUpdateLoading}
                      disabled={!isValid || !isDirty || isPulloutLoading || isPulloutFetching}
                      sx={{ mt: "10px" }}
                    >
                      {transactionData?.status === "Returned"
                        ? "Resubmit"
                        : edit || transactionData?.edit
                        ? "Update"
                        : "Create"}
                    </LoadingButton>
                  </>
                )}

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} dense>
                  <MenuItem onClick={() => handleRequestNavigateClick(data?.assets[selectedIndex])}>
                    <ListItemIcon>
                      <AddToPhotos />
                    </ListItemIcon>
                    <ListItemText> Request</ListItemText>
                  </MenuItem>
                </Menu>

                <Dialog
                  open={dialog}
                  TransitionComponent={Grow}
                  onClose={() => dispatch(closeDialog())}
                  PaperProps={{ sx: { borderRadius: "10px", maxWidth: "700px" } }}
                >
                  <PulloutTimeline data={timelineData} />
                </Dialog>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddPullout;
