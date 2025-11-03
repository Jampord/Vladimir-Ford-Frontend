import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { closeDialog1 } from "../../../../Redux/StateManagement/booleanStateSlice";
import CustomAutoComplete from "../../../../Components/Reusable/CustomAutoComplete";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLazyGetOneRDFChargingAllApiQuery } from "../../../../Redux/Query/Masterlist/OneRDF/OneRDFCharging";
import { useLazyGetTypeOfExpenditureApiQuery } from "../../../../Redux/Query/Masterlist/TypeofExpenditure";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CustomTextField from "../../../../Components/Reusable/CustomTextField";

const schema = yup.object().shape({
  one_charging_id: yup.object().required().label("One RDF Charging").typeError("One RDF Charging is a required field"),
  department_id: yup.object().required().label("Department").typeError("Department is a required field"),
  company_id: yup.object().required().label("Company").typeError("Company is a required field"),
  business_unit_id: yup.object().required().label("Business Unit").typeError("Business Unit is a required field"),
  unit_id: yup.object().required().label("Unit").typeError("Unit is a required field"),
  subunit_id: yup.object().required().label("Subunit").typeError("Subunit is a required field"),
  location_id: yup.object().required().label("Location").typeError("Location is a required field"),
  type_of_expenditure_id: yup
    .array()
    .min(1, "At least one Type of Expenditure must be selected")
    .label("Type of Expenditure")
    .typeError("Type of Expenditure is a required field"),
  budget_type: yup.string().required().label("Budget Type").typeError("Budget Type is a required field"),
  name: yup.string().required().label("Capex Name").typeError("Capex Name is a required field"),
  description: yup
    .string()
    .required()
    .label("Project Description")
    .typeError("Project Description is a required field"),
});

const AddCapexDialog = () => {
  const dispatch = useDispatch();

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
      one_charging_id: null,
      company_id: null,
      business_unit_id: null,
      department_id: null,
      unit_id: null,
      subunit_id: null,
      location_id: null,
      type_of_expenditure_id: [],
      budget_type: null,
      name: "",
      description: "",
    },
  });

  const [
    oneChargingTrigger,
    {
      data: oneChargingData = [],
      isLoading: isOneChargingLoading,
      isSuccess: isOneChargingSuccess,
      isError: isOneChargingError,
      refetch: isOneChargingRefetch,
    },
  ] = useLazyGetOneRDFChargingAllApiQuery();

  const [
    typeOfExpenditureTrigger,
    {
      data: typeOfExpenditureData = [],
      isLoading: isTypeOfExpenditureLoading,
      isSuccess: isTypeOfExpenditureSuccess,
      isError: isTypeOfExpenditureError,
      refetch: isTypeOfExpenditureRefetch,
    },
  ] = useLazyGetTypeOfExpenditureApiQuery();

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
  };

  const sxSubtitle = {
    fontWeight: "bold",
    color: "secondary.main",
    fontFamily: "Anton",
    fontSize: "18px",
    mb: 1,
  };

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Box component={"form"} onSubmit={handleSubmit(onSubmitHandler)}>
      <DialogTitle
        sx={{
          fontFamily: "Anton",
          fontSize: "1.7rem",
          textAlign: "center",
          backgroundColor: "#354856",
          color: "#ffffff",
        }}
      >
        Capital Expenditure Approval Request and Justification Form
      </DialogTitle>

      <DialogContent>
        <Typography sx={sxSubtitle} mt={2.5}>
          Charging Information
        </Typography>
        <Stack spacing={2} mb={2} justifyContent={"space-between"}>
          <Stack direction="row" spacing={2} justifyContent={"space-between"}>
            <CustomAutoComplete
              autoComplete
              control={control}
              name="one_charging_id"
              // disabled={updateRequest && disable}
              options={oneChargingData || []}
              onOpen={() => (isOneChargingSuccess ? null : oneChargingTrigger({ pagination: "none" }))}
              loading={isOneChargingLoading}
              size="small"
              getOptionLabel={(option) => option.code + " - " + option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="One RDF Charging"
                  error={!!errors?.one_charging_id}
                  helperText={errors?.one_charging_id?.message}
                />
              )}
              onChange={(_, value) => {
                if (value) {
                  setValue("department_id", value);
                  setValue("company_id", value);
                  setValue("business_unit_id", value);
                  setValue("unit_id", value);
                  setValue("subunit_id", value);
                  setValue("location_id", value);
                } else {
                  setValue("department_id", null);
                  setValue("company_id", null);
                  setValue("business_unit_id", null);
                  setValue("unit_id", null);
                  setValue("subunit_id", null);
                  setValue("location_id", null);
                }
                return value;
              }}
            />

            <CustomAutoComplete
              autoComplete
              control={control}
              name="department_id"
              disabled
              options={[]}
              size="small"
              getOptionLabel={(option) => option.department_code + " - " + option.department_name}
              isOptionEqualToValue={(option, value) => option.department_id === value.department_id}
              getOptionKey={(option, index) => `${option.id}-${index}`}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Department"
                  error={!!errors?.department_id}
                  helperText={errors?.department_id?.message}
                />
              )}
            />

            <CustomAutoComplete
              autoComplete
              name="company_id"
              control={control}
              options={[]}
              size="small"
              getOptionLabel={(option) => option.company_code + " - " + option.company_name}
              isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Company"
                  error={!!errors?.company_id}
                  helperText={errors?.company_id?.message}
                />
              )}
              disabled
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent={"space-between"}>
            <CustomAutoComplete
              autoComplete
              name="business_unit_id"
              control={control}
              options={[]}
              size="small"
              getOptionLabel={(option) => option.business_unit_code + " - " + option.business_unit_name}
              isOptionEqualToValue={(option, value) => option.business_unit_id === value.business_unit_id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Business Unit"
                  error={!!errors?.business_unit_id}
                  helperText={errors?.business_unit_id?.message}
                />
              )}
              disabled
            />

            <CustomAutoComplete
              autoComplete
              name="unit_id"
              control={control}
              disabled
              options={[]}
              size="small"
              getOptionLabel={(option) => option.unit_code + " - " + option.unit_name}
              isOptionEqualToValue={(option, value) => option?.unit_id === value?.unit_id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Unit"
                  error={!!errors?.unit_id}
                  helperText={errors?.unit_id?.message}
                />
              )}
            />

            <CustomAutoComplete
              autoComplete
              name="subunit_id"
              control={control}
              disabled
              options={[]}
              size="small"
              getOptionLabel={(option) => option.subunit_code + " - " + option.subunit_name}
              isOptionEqualToValue={(option, value) => option.subunit_id === value.subunit_id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  label="Sub Unit"
                  error={!!errors?.subunit_id}
                  helperText={errors?.subunit_id?.message}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent={"space-between"} sx={{ "& > *": { flex: 1 } }}>
            <CustomAutoComplete
              autoComplete
              name="location_id"
              control={control}
              disabled
              options={[]}
              size="small"
              getOptionLabel={(option) => option.location_code + " - " + option.location_name}
              isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
              fullWidth
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

            <Box />
            <Box />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1 }} />

        <Typography sx={sxSubtitle}>Capex Information</Typography>

        <Stack spacing={2} justifyContent={"space-between"}>
          <Stack direction="row" spacing={2} justifyContent={"space-between"}>
            <CustomAutoComplete
              control={control}
              name="type_of_expenditure_id"
              options={typeOfExpenditureData || []}
              disableClearable
              disableCloseOnSelect
              multiple
              onOpen={() => (isTypeOfExpenditureSuccess ? null : typeOfExpenditureTrigger({ pagination: "none" }))}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={isTypeOfExpenditureLoading}
              fullWidth
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 0 }} checked={selected} />
                  <Typography>{option.name}</Typography>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  color="secondary"
                  label="Type of Expenditure"
                  error={!!errors?.type_of_expenditure_id}
                  helperText={errors?.type_of_expenditure_id?.message}
                />
              )}
            />

            <CustomAutoComplete
              control={control}
              name="budget_type"
              options={["Budgeted", "Unbudgeted"]}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  color="secondary"
                  label="Budget Type"
                  error={!!errors?.budget_type}
                  helperText={errors?.budget_type?.message}
                />
              )}
            />

            <CustomAutoComplete
              control={control}
              name="enrolled_budget"
              options={[]}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  color="secondary"
                  label="Enrolled Budget"
                  error={!!errors?.enrolled_budget}
                  helperText={errors?.enrolled_budget?.message}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent={"space-between"} sx={{ "& > *": { flex: 1 } }}>
            <CustomTextField
              control={control}
              name="name"
              label="Capex Name"
              type="text"
              allowSpecialCharacters
              error={!!errors?.name}
              helperText={errors?.name?.message}
              fullWidth
              multiline
              maxRows={3}
            />

            <CustomTextField
              control={control}
              name="description"
              label="Project Description"
              type="text"
              error={!!errors?.description}
              helperText={errors?.description?.message}
              fullWidth
              multiline
              maxRows={3}
            />

            <Box />
          </Stack>
        </Stack>
        <Divider sx={{ mt: 3 }} />
      </DialogContent>

      <DialogActions sx={{ mb: 1, mr: 2, gap: 0.5 }}>
        <Button variant="contained" size="small" color="secondary" startIcon={<Add color="primary" />} type="submit">
          Create
        </Button>
        <Button variant="outlined" onClick={() => dispatch(closeDialog1())} size="small" color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AddCapexDialog;
