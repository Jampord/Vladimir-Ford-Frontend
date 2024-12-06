import { Add, ArrowBackIosRounded, RemoveCircle } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  IconButton,
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
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import CustomMultipleAttachment from "../../../Components/CustomMultipleAttachment";
import { useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLazyGetFixedAssetTransferAllApiQuery } from "../../../Redux/Query/Movement/Transfer";

const schema = yup.object().shape({
  id: yup.string(),
  description: yup.string().required().label("Description"),
  care_of: yup.object().required().label("Care of").typeError("Care of is a required field"),
  remarks: yup.string().label("Remarks"),
  attachments: yup.mixed().required().label("Attachments"),
  assets: yup.array().of(
    yup.object().shape({
      asset_id: yup.string().nullable(),
      fixed_asset_id: yup.object().required("Fixed Asset is a Required Field"),
      asset_accountable: yup.string(),
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
  const navigate = useNavigate();
  const attachmentRef = useRef(null);

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

  const { control, register, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: "",
      description: "",
      care_of: null,
      remarks: "",
      attachments: null,
      assets: [
        {
          asset_id: null,
          fixed_asset_id: null,
          asset_accountable: "",
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

      <Box
        className="request request__wrapper"
        p={2}
        component="form"
        // onSubmit={handleSubmit(addTransferHandler)}
      >
        <Stack>
          <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
            ADD PULLOUT REQUEST
          </Typography>

          <Stack id="requestForm" className="request__form" gap={2} pb={1}>
            <Stack gap={2}>
              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                REQUEST DETAILS
              </Typography>

              <CustomTextField
                control={control}
                name="description"
                // disabled={edit ? false : transactionData?.view}
                label="Request Description"
                type="text"
                // error={!!errors?.description}
                // helperText={errors?.description?.message}
                fullWidth
                multiline
              />

              <CustomTextField
                control={control}
                name="care_of"
                // disabled={edit ? false : transactionData?.view}
                label="Care of"
                type="text"
                // error={!!errors?.description}
                // helperText={errors?.description?.message}
                fullWidth
                multiline
              />

              <CustomTextField
                control={control}
                name="remarks"
                // disabled={edit ? false : transactionData?.view}
                label="Remarks (Optional)"
                type="text"
                // error={!!errors?.description}
                // helperText={errors?.description?.message}
                fullWidth
                multiline
                optional
              />

              <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "16px" }}>
                ATTACHMENTS
              </Typography>

              <CustomMultipleAttachment
                control={control}
                name="attachments"
                // disabled={edit ? false : transactionData?.view}
                label="SR Form"
                inputRef={attachmentRef}
                // error={!!errors?.attachments?.message}
                // helperText={errors?.attachments?.message}
              />
            </Stack>
          </Stack>
        </Stack>

        <Box className="request__table">
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
                  <TableCell className="tbl-cell">Assets</TableCell>
                  <TableCell className="tbl-cell">Accountability</TableCell>
                  <TableCell className="tbl-cell">Chart of Accounts</TableCell>
                  <TableCell className="tbl-cell" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {fields.map((item, index) => (
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

                    <TableCell>
                      <Controller
                        control={control}
                        name={`assets.${index}.fixed_asset_id`}
                        render={({ field: { ref, value, onChange } }) => (
                          <Autocomplete
                            options={vTagNumberData}
                            onOpen={() => (isVTagNumberSuccess ? null : fixedAssetTrigger())}
                            loading={isVTagNumberLoading}
                            // disabled={edit ? false : transactionData?.view}
                            size="small"
                            value={value}
                            // filterOptions={filterOptions}
                            getOptionLabel={(option) => `(${option.vladimir_tag_number}) - ${option.asset_description}`}
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
                                setValue(
                                  `assets.${index}.business_unit_id`,
                                  newValue.business_unit?.business_unit_name
                                );
                                setValue(`assets.${index}.department_id`, newValue.department?.department_name);
                                setValue(`assets.${index}.unit_id`, newValue.unit?.unit_name);
                                setValue(`assets.${index}.sub_unit_id`, newValue.subunit?.subunit_name);
                                setValue(`assets.${index}.location_id`, newValue.location?.location_name);
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
                            border: "none",
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
                            border: "none",
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                border: "none",
                              },
                            },
                            "& .MuiInputBase-input": {
                              backgroundColor: "transparent",
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

                    <TableCell>
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

                    <TableCell>
                      <IconButton
                        onClick={() => remove(index)}
                        disabled={
                          // edit ? false :
                          fields.length === 1
                          // || transactionData?.view
                        }
                      >
                        <Tooltip title="Delete Row" placement="top" arrow>
                          <RemoveCircle
                            color={
                              // fields.length === 1 || transactionData?.view ? (edit ? "warning" : "gray") :
                              "warning"
                            }
                          />
                        </Tooltip>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={99}>
                    <Stack flexDirection="row" gap={2}>
                      {/* {!isTransferLoading && !isTransferFetching && ( */}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => handleAppendItem()}
                        disabled={
                          watch(`assets`).some((item) => item?.fixed_asset_id === null)
                          //     ? true
                          //     : edit
                          //     ? false
                          //     : transactionData?.view
                        }
                      >
                        Add Row
                      </Button>
                      {/* )} */}
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default AddPullout;
