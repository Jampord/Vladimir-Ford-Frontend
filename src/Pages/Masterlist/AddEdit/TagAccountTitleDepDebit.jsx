import { LoadingButton } from "@mui/lab";
import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeDrawer } from "../../../Redux/StateManagement/booleanStateSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetAccountTitleAllApiQuery,
  usePutAccountTitleDepreciationDebitTaggingApiMutation,
} from "../../../Redux/Query/Masterlist/YmirCoa/AccountTitle";
import CustomAutoComplete from "../../../Components/Reusable/CustomAutoComplete";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { useEffect } from "react";
import { openToast } from "../../../Redux/StateManagement/toastSlice";

const schema = yup.object().shape({
  depreciation_debit_id: yup.array().required().label("Depreciation Debit").typeError("Depreciation Debit is required"),
  account_title_name: yup.string().nullable().label("Account Title Name"),
});

const TagAccountTitleDepDebit = ({ data }) => {
  console.log("data", data);
  const dispatch = useDispatch();
  const icon = <CheckBoxOutlineBlank fontSize="small" />;
  const checkedIcon = <CheckBox fontSize="small" />;

  const [
    putAccountTitle,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePutAccountTitleDepreciationDebitTaggingApiMutation();

  const {
    data: accountTitleData = [],
    isLoading: isAccountTitleLoading,
    isSuccess: isAccountTitleSuccess,
    isError: isAccountTitleError,
    refetch: isAccountTitleRefetch,
  } = useGetAccountTitleAllApiQuery();

  //   console.log("äsdasd", accountTitleData);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      depreciation_debit_id: data?.depreciation_debit || [],
      account_title_name: data?.account_title_name || "",
    },
  });

  console.log("👀👀👀", watch("depreciation_debit_id"));

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);
    const depreciation_debit_id = formData.depreciation_debit_id.map((item) => item.sync_id);
    console.log("depDebit", depreciation_debit_id);
    putAccountTitle({ id: data?.sync_id, depreciation_debit_id: depreciation_debit_id });
  };

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      dispatch(closeDrawer());
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );

      // dispatch(departmentApi.util.invalidateTags(["Department"]));

      // setTimeout(() => {
      //   onUpdateResetHandler();
      // }, 500);
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (isPostError) {
      reset();
      dispatch(closeDrawer());
      dispatch(
        openToast({
          variant: "error",
          message: "Something went wrong. Please try again.",
          duration: 5000,
        })
      );
    }
  }, [isPostError]);

  return (
    <Box className="add-masterlist">
      <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
        {data?.depreciation_debit.length === 0 ? "Add Account Title" : "Edit Account Title"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} className="add-masterlist__content">
        <CustomAutoComplete
          //   readOnly={data.action === "view"}
          // freeSolo={data.action === "view"}
          //   disabled={data.action === "view" && data.location.length === 0}
          autoComplete
          multiple
          disableCloseOnSelect
          name="depreciation_debit_id"
          control={control}
          options={accountTitleData}
          loading={isAccountTitleLoading}
          size="small"
          getOptionLabel={(option) => `${option.account_title_code} - ${option.account_title_name}`}
          //   getOptionDisabled={(option) => !data?.location?.some((item) => item?.id !== option?.id)}
          //   getOptionDisabled={(option) =>
          //     option?.warehouse !== null && !data?.location?.some((item) => item?.sync_id === option?.sync_id)
          //   }
          isOptionEqualToValue={(option, value) => option.sync_id === value.sync_id}
          slotProps={{
            popper: {
              placement: "top",
              modifiers: [
                {
                  name: "flip",
                  enabled: true,
                  options: {
                    altBoundary: true,
                    rootBoundary: "document",
                    // padding: 8,
                  },
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                  options: {
                    altAxis: true,
                    altBoundary: false,
                    tether: false,
                    rootBoundary: "document",
                    // padding: 8,
                  },
                },
              ],
            },
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
              {`${option.account_title_code} - ${option.account_title_name}`}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              color="secondary"
              {...params}
              //   label={data.action === "view" && data.location.length === 0 ? "No Tagged Location" : "Location"}
              label="Depreciation Debit"
              error={!!errors?.depreciation_debit_id?.message}
              helperText={errors?.depreciation_debit_id?.message}
            />
          )}
        />

        <CustomTextField
          disabled={data.status === true}
          control={control}
          name="account_title_name"
          label="Account Title"
          type="text"
          color="secondary"
          size="small"
          error={!!errors?.account_title_name}
          helperText={errors?.account_title_name?.message}
          fullWidth
        />

        <Box className="add-masterlist__buttons">
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            // loading={isPostLoading}
            // disabled={!isValid || watch("depreciation_debit_id").length === 0}
            // sx={data.action === "view" ? { display: "none" } : null}
          >
            {data?.depreciation_debit.length === 0 ? "Tag" : "Update"}
          </LoadingButton>

          <Button
            // variant={data.action === "view" ? "contained" : "outlined"}
            color="secondary"
            size="small"
            onClick={() => dispatch(closeDrawer())}
            // disabled={isPostLoading === true}
            // fullWidth={data.action === "view" ? true : false}
          >
            {/* {data.action === "view" ? "Close" : "Cancel"} */}
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TagAccountTitleDepDebit;
