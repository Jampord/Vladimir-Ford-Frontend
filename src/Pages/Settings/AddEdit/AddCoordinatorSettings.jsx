import { Add, ArrowBackIosRounded, Delete, Info, MoreVert, RemoveCircle, Warning } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Fade,
  IconButton,
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
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { useLazyGetLocationAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Location";
import { useLazyGetSubUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/SubUnit";
import { useLazyGetUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Unit";
import { useLazyGetDepartmentAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Department";
import { useLazyGetBusinessUnitAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/BusinessUnit";
import { useLazyGetCompanyAllApiQuery } from "../../../Redux/Query/Masterlist/YmirCoa/Company";
import { useLazyGetCoordinatorAccountApiQuery } from "../../../Redux/Query/UserManagement/UserAccountsApi";
import { useEffect, useState } from "react";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import ActionMenu from "../../../Components/Reusable/ActionMenu";
import { LoadingButton } from "@mui/lab";
import { closeDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  usePostCoordinatorSettingsApiMutation,
  useUpdateCoordinatorSettingsApiMutation,
} from "../../../Redux/Query/Settings/CoordinatorSettings";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { resetGetData } from "../../../Redux/StateManagement/actionMenuSlice";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";

const schema = yup.object().shape({
  user_id: yup.object().required().label("Coordinator").typeError("Coordinator is required"),
  // handles: yup.array().of(
  //   yup.object().shape({
  company_id: yup.number().nullable(),
  business_unit_id: yup.number().nullable(),
  department_id: yup.number().nullable(),
  unit_id: yup.number().nullable(),
  subunit_id: yup.object().nullable(),
  location_id: yup.object().nullable(),
  //   })
  // ),
});
const AddCoordinatorSettings = ({ data }) => {
  const [handles, setHandles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  // console.log("handles", handles);
  // console.log("data", data);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [
    coordinatorTrigger,
    {
      data: coordinatorData = [],
      isLoading: isCoordinatorLoading,
      isSuccess: isCoordinatorSuccess,
      isError: isCoordinatorError,
      refetch: isCoordinatorRefetch,
    },
  ] = useLazyGetCoordinatorAccountApiQuery();

  const [
    companyTrigger,
    {
      data: companyData = [],
      isLoading: isCompanyLoading,
      isSuccess: isCompanySuccess,
      isError: isCompanyError,
      refetch: isCompanyRefetch,
    },
  ] = useLazyGetCompanyAllApiQuery();

  const [
    businessUnitTrigger,
    {
      data: businessUnitData = [],
      isLoading: isBusinessUnitLoading,
      isSuccess: isBusinessUnitSuccess,
      isError: isBusinessUnitError,
      refetch: isBusinessUnitRefetch,
    },
  ] = useLazyGetBusinessUnitAllApiQuery();

  const [
    departmentTrigger,
    {
      data: departmentData = [],
      isLoading: isDepartmentLoading,
      isSuccess: isDepartmentSuccess,
      isError: isDepartmentError,
      refetch: isDepartmentRefetch,
    },
  ] = useLazyGetDepartmentAllApiQuery();
  // console.log("deptData: ", departmentData);

  const [
    unitTrigger,
    {
      data: unitData = [],
      isLoading: isUnitLoading,
      isSuccess: isUnitSuccess,
      isError: isUnitError,
      refetch: isUnitRefetch,
    },
  ] = useLazyGetUnitAllApiQuery();

  const [
    subunitTrigger,
    {
      data: subUnitData = [],
      isLoading: isSubUnitLoading,
      isSuccess: isSubUnitSuccess,
      isError: isSubUnitError,
      refetch: isSubUnitRefetch,
    },
  ] = useLazyGetSubUnitAllApiQuery();

  const [
    locationTrigger,
    {
      data: locationData = [],
      isLoading: isLocationLoading,
      isSuccess: isLocationSuccess,
      isError: isLocationError,
      refetch: isLocationRefetch,
    },
  ] = useLazyGetLocationAllApiQuery();

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
    resetField,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      user_id: null,
      // handles: [
      //   {
      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      //   },
      // ],
    },
  });

  const [
    postCoordinator,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostCoordinatorSettingsApiMutation();

  // console.log("datauser", data?.user?.id);

  const [
    updateCoordinator,
    {
      data: updateData,
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateCoordinatorSettingsApiMutation();

  // console.log(watch(`user_id`));
  // console.log("subunit", watch(`subunit_id`));
  // console.log("errrrrrr", updateError);

  const addHandle = () => {
    const newHandle = {
      company_id: watch(`company_id`)?.id,
      business_unit_id: watch(`business_unit_id`).id,
      department_id: watch(`department_id`).id,
      unit_id: watch(`unit_id`).id,
      subunit_id: watch(`subunit_id`).id,
      location_id: watch(`location_id`).id,
    };

    setHandles((prevHandles) => [...prevHandles, newHandle]);

    setValue("department_id", null);
    setValue("company_id", null);
    setValue("business_unit_id", null);
    setValue("unit_id", null);
    setValue("subunit_id", null);
    setValue("location_id", null);
  };

  const onSubmitHandler = (formData) => {
    const newFormData = { user_id: formData.user_id.id, handles };

    console.log("onSubmit", newFormData);

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
              {data ? "UPDATE" : "CREATE"}
            </Typography>{" "}
            this Coordinator?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            {
              data
                ? await updateCoordinator({ id: data?.user?.id, ...newFormData })
                : await postCoordinator(newFormData);
            }
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

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const removeIndexHandler = (index) => {
    dispatch(
      openConfirm({
        icon: Warning,
        iconColor: "alert",
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
              REMOVE
            </Typography>{" "}
            this item?
          </Box>
        ),
        onConfirm: async () => {
          // dispatch(onLoading());
          setHandles((prevHandles) => prevHandles.filter((_, i) => i !== index));

          dispatch(
            openToast({
              message: "Successfully Removed",
              duration: 2500,
            })
          );
          handleClose();
        },
      })
    );
  };

  useEffect(() => {
    if (isPostSuccess || isUpdateSuccess) {
      reset();
      dispatch(
        openToast({
          message: (postData || updateData)?.message,
          duration: 5000,
        })
      );
      dispatch(closeDialog1());
      dispatch(resetGetData());
    }
  }, [isPostSuccess, isUpdateSuccess]);

  useEffect(() => {
    if (isPostError || (isUpdateError && (postError || updateError)?.status === 422)) {
      dispatch(
        openToast({
          message: (postError || updateError)?.data.message,
          duration: 5000,
          variant: "error",
        })
      );
      // setError("new_password", {
      //   type: "validate",
      //   message: postError?.data?.message,
      // });
    } else if ((isPostError || isUpdateError) && (postError || updateError)?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError, isUpdateError]);

  useEffect(() => {
    if (data) {
      companyTrigger(), businessUnitTrigger(), departmentTrigger(), unitTrigger(), subunitTrigger(), locationTrigger();
      setHandles(
        data.handles.map((handle) => ({
          company_id: handle.company.id,
          business_unit_id: handle.business_unit.id,
          department_id: handle.department.id,
          unit_id: handle.unit.id,
          subunit_id: handle.subunit.id,
          location_id: handle.location.id,
        }))
      );
      setValue("user_id", data.user);
    }
  }, [data, setValue]);

  return (
    <Box className="mcontainer">
      {/* <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
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
      </Stack> */}

      <Box className="request request__wrapper" p={2} component="form" onSubmit={handleSubmit(onSubmitHandler)}>
        <Stack>
          <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.4rem" }}>
            {data ? "EDIT " : "ADD "}
            COORDINATOR SETTINGS
          </Typography>

          <Stack id="requestForm" className="request__form" gap={2} pb={1}>
            <Stack gap={2}>
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                COORDINATOR DETAILS
              </Typography>

              <CustomAutoComplete
                name="user_id"
                control={control}
                disablePortal
                disabled={data && true}
                options={coordinatorData}
                onOpen={() => (isCoordinatorSuccess ? null : coordinatorTrigger())}
                loading={isCoordinatorLoading}
                getOptionLabel={(option) => option.full_id_number_full_name}
                isOptionEqualToValue={(option, value) => option.full_id_number === value.full_id_number}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    color="secondary"
                    label="Coordinator"
                    error={!!errors?.user_id?.message}
                    helperText={errors?.user_id?.message}
                  />
                )}
              />
            </Stack>
            <Stack gap={2}>
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px", mb: "-10px" }}>
                CHART OF ACCOUNT
              </Typography>

              <CustomAutoComplete
                autoComplete
                control={control}
                name={`department_id`}
                // disabled={edit ? false : transactionData?.view}
                options={departmentData}
                onOpen={() =>
                  isDepartmentSuccess ? null : (departmentTrigger(), companyTrigger(), businessUnitTrigger())
                }
                loading={isDepartmentLoading}
                size="small"
                // clearIcon={null}
                getOptionLabel={(option) => option.department_code + " - " + option.department_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Department"
                    // error={!!errors?.department_id}
                    // helperText={errors?.department_id?.message}
                  />
                )}
                onChange={(_, value) => {
                  if (value) {
                    const companyID = companyData?.find((item) => item.sync_id === value.company.company_sync_id);
                    const businessUnitID = businessUnitData?.find(
                      (item) => item.sync_id === value.business_unit.business_unit_sync_id
                    );
                    setValue(`company_id`, companyID);
                    setValue(`business_unit_id`, businessUnitID);
                  } else if (value === null) {
                    setValue(`company_id`, null);
                    setValue(`business_unit_id`, null);
                  }
                  setValue(`unit_id`, null);
                  setValue(`subunit_id`, null);
                  setValue(`location_id`, null);

                  return value;
                }}
              />

              <CustomAutoComplete
                autoComplete
                control={control}
                name={`company_id`}
                disabled
                options={companyData}
                loading={isCompanyLoading}
                size="small"
                // clearIcon={null}
                getOptionLabel={(option) => option.company_code + " - " + option.company_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Company"
                    // error={!!errors?.department_id}
                    // helperText={errors?.department_id?.message}
                  />
                )}
              />

              <CustomAutoComplete
                autoComplete
                control={control}
                name={`business_unit_id`}
                disabled
                options={businessUnitData}
                loading={isBusinessUnitLoading}
                size="small"
                // clearIcon={null}
                getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Business Unit"
                    // error={!!errors?.department_id}
                    // helperText={errors?.department_id?.message}
                  />
                )}
              />

              <CustomAutoComplete
                autoComplete
                name={`unit_id`}
                // disabled={edit ? false : transactionData?.view}
                control={control}
                options={departmentData?.filter((obj) => obj?.id === watch(`department_id`)?.id)[0]?.unit || []}
                onOpen={() => (isUnitSuccess ? null : (unitTrigger(), subunitTrigger(), locationTrigger()))}
                // onChange={() => userAccountTrigger({ unit: watch("unit_id")?.id })}
                loading={isUnitLoading}
                size="small"
                getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Unit"
                    // error={!!errors?.unit_id}
                    // helperText={errors?.unit_id?.message}
                  />
                )}
                onChange={(_, value) => {
                  setValue(`subunit_id`, null);
                  setValue(`location_id`, null);

                  return value;
                }}
              />

              <CustomAutoComplete
                autoComplete
                name={`subunit_id`}
                // disabled={edit ? false : transactionData?.view}
                control={control}
                options={unitData?.filter((obj) => obj?.id === watch(`unit_id`)?.id)[0]?.subunit || []}
                loading={isSubUnitLoading}
                size="small"
                getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Sub Unit"
                    error={!!errors?.subunit_id}
                    helperText={errors?.subunit_id?.message}
                  />
                )}
                onChange={(_, value) => {
                  setValue(`location_id`, null);

                  return value;
                }}
              />

              <CustomAutoComplete
                autoComplete
                name={`location_id`}
                // disabled={edit ? false : transactionData?.view}
                control={control}
                options={locationData?.filter((item) => {
                  return item.subunit.some((subunit) => {
                    return subunit?.sync_id === watch(`subunit_id`)?.sync_id;
                  });
                })}
                loading={isLocationLoading}
                size="small"
                getOptionLabel={(option) => option.location_code + " - " + option.location_name}
                isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
                renderInput={(params) => (
                  <TextField
                    color="secondary"
                    {...params}
                    label="Location"
                    error={!!errors?.location_id}
                    helperText={errors?.location_id?.message}
                  />
                )}
              />
            </Stack>

            <Button
              variant="contained"
              size="small"
              disabled={watch("location_id") === null}
              startIcon={<Add />}
              onClick={() => addHandle()}
            >
              Add COA
            </Button>
          </Stack>
        </Stack>

        <Box className="request__table">
          <TableContainer className="request__th-body  request__wrapper" sx={{ height: "calc(100vh - 280px)" }}>
            <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "20px" }}>
              SELECTED CHART OF ACCOUNT
            </Typography>
            <Table className="request__table ">
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
                  <TableCell className="tbl-cell">Department</TableCell>
                  <TableCell className="tbl-cell">Company</TableCell>
                  <TableCell className="tbl-cell">Business Unit</TableCell>
                  <TableCell className="tbl-cell">Unit</TableCell>
                  <TableCell className="tbl-cell">Subunit</TableCell>
                  <TableCell className="tbl-cell">Location</TableCell>
                  <TableCell className="tbl-cell" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(isDepartmentLoading ||
                  isCompanyLoading ||
                  isBusinessUnitLoading ||
                  isUnitLoading ||
                  isSubUnitLoading ||
                  isLocationLoading) &&
                data ? (
                  <LoadingData />
                ) : (
                  handles.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="tbl-cell text-weight">{index + 1}</TableCell>
                      <TableCell className="tbl-cell">
                        {departmentData.find((data) => data.id === item.department_id)?.department_name}
                      </TableCell>
                      <TableCell className="tbl-cell">
                        {companyData.find((data) => data.id === item.company_id)?.company_name}
                      </TableCell>
                      <TableCell className="tbl-cell">
                        {businessUnitData.find((data) => data.id === item.business_unit_id)?.business_unit_name}
                      </TableCell>
                      <TableCell className="tbl-cell">
                        {unitData.find((data) => data.id === item.unit_id)?.unit_name}
                      </TableCell>
                      <TableCell className="tbl-cell">
                        {subUnitData.find((data) => data.id === item.subunit_id)?.subunit_name}
                      </TableCell>
                      <TableCell className="tbl-cell">
                        {" "}
                        {locationData.find((data) => data.id === item.location_id)?.location_name}
                      </TableCell>
                      <TableCell className="tbl-cell" align="center" placement="top">
                        {
                          <IconButton onClick={() => removeIndexHandler(index)} disableRipple>
                            <Tooltip title="Remove" placement="top" arrow>
                              <RemoveCircle color="warning" />
                            </Tooltip>
                          </IconButton>
                        }
                        {/* <>
                          <IconButton onClick={handleOpen}>
                            <MoreVert />
                          </IconButton>

                          <Menu
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            // transformOrigin={{
                            //   vertical: "top",
                            //   horizontal: "left",
                            // }}
                            anchorEl={anchorEl}
                            open={anchorEl && true}
                            onClose={handleClose}
                            TransitionComponent={Fade}
                            // disablePortal
                          >
                            <MenuItem onClick={() => removeIndexHandler(index)} dense>
                              <ListItemIcon>
                                <Delete />
                              </ListItemIcon>
                              <ListItemText disableTypography align="left">
                                Delete
                              </ListItemText>
                            </MenuItem>
                          </Menu>
                        </> */}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack flexDirection="row" justifyContent="flex-end" gap="20px" sx={{ pt: "15px" }}>
            <Button
              // variant={data.action === "view" ? "contained" : "outlined"}
              variant={"outlined"}
              color="secondary"
              size="small"
              onClick={() => {
                dispatch(closeDialog1());
                dispatch(resetGetData());
              }}
              // disabled={(isPostLoading || isUpdateLoading) === true}
              disabled={isPostLoading === true}
              // fullWidth={data.action === "view" ? true : false}
            >
              {/* {!data.status ? "Cancel" : data.action === "view" ? "Close" : "Cancel"} */}
              Cancel
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              // loading={isUpdateLoading || isPostLoading}
              loading={isPostLoading}
              disabled={handles.length === 0 || watch("user_id") === null}
              // sx={data.action === "view" ? { display: "none" } : null}
            >
              {/* {!data.status ? "Create" : "Update"} */}
              {data ? "Update" : "Create"}
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AddCoordinatorSettings;
