import { Autocomplete, Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import CustomTextField from "../../../Components/Reusable/CustomTextField";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePostAddCostTaggingApiMutation } from "../../../Redux/Query/FixedAsset/AdditionalCost";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { usePutElixirAssetTagMutation } from "../../../Redux/Query/Systems/Elixir";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  added_useful_life: yup
    .number("Input must be a number!")
    .required("Add Useful Life is required!")
    .typeError("Input must be a number!"),
});

const AddTag = ({ data, tag, handleCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [
    postAddCostTag,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostAddCostTaggingApiMutation();

  const [
    putElixirAssetTag,
    { isLoading: isPutLoading, isSuccess: isPutSuccess, isError: isPutError, error: putError },
  ] = usePutElixirAssetTagMutation();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { added_useful_life: "" },
  });

  const assetTagId = data
    ?.filter((item) => tag?.tag_id?.includes(item?.id))
    .map((item) => {
      return { id: item.id };
    });

  console.log("assetTagID", assetTagId);

  const assetTag =
    data
      ?.filter((item) => tag?.tag_id?.includes(item?.id))
      .map((item) => {
        const {
          //renaming object keys of elixir data to match vladimir api
          unit_Price: unitPrice,
          release_Date: releasedDate,
          company_Code: companyId,
          business_Unit_Code: businessUnitId,
          department_Code: departmentId,
          unit_Code: unitId,
          sub_Unit_Code: subUnitId,
          location_Code: locationId,
          major_Category_Name: majorCategoryName,
          minor_Category_Name: minorCategoryName,
          //--------------------------
          //removing unnecessary data of elixir data
          account_Title_Code,
          account_Title_Name,
          business_Unit_Name,
          company_Name,
          department_Name,
          empId,
          fullname,
          id,
          location_Name,
          sub_Unit_Name,
          unit_Name,
          //--------------------------------
          ...restItems
        } = item;

        return {
          unitPrice,
          releasedDate,
          companyId,
          businessUnitId,
          departmentId,
          unitId,
          subUnitId,
          locationId,
          majorCategoryName,
          minorCategoryName,
          ...restItems,
        };
      }) || [];

  console.log("assetTag", assetTag);

  // console.log("data", data);
  // console.log("tag", tag);

  const onSubmitHandler = async (formData) => {
    const body = { assetTag, ...formData };

    // console.log("body", body);
    // console.log("data", data);
    console.log("formdata", formData);
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
              TAG
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            await postAddCostTag(body).unwrap();
            reset();
            navigate(-1);
            dispatch(
              openToast({
                message: "Additional Cost Tagged Successfully",
                duration: 5000,
              })
            );
          } catch (err) {
            console.log(err);
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.data?.errors?.detail || err.data.message,
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
    // try {
    //   await postAddCostTag(body).unwrap();
    //   reset();
    // } catch (error) {
    //   console.log(error);
    //   dispatch(
    //     openToast({
    //       message: error?.data?.message,
    //       duration: 5000,
    //       variant: "error",
    //     })
    //   );
    // }
  };

  useEffect(() => {
    if (isPostSuccess) {
      dispatch(
        openToast({
          message: postData.message,
          duration: 5000,
        })
      );
      putElixirAssetTag(assetTagId);
      handleCancel();
    }
  }, [isPostSuccess]);

  return (
    <Box
      component="form"
      gap={1}
      px={3}
      overflow="auto"
      width={450}
      sx={{ mt: "10px" }}
      onSubmit={handleSubmit(onSubmitHandler)}
    >
      <Typography
        color="secondary.main"
        sx={{ fontFamily: "Anton", fontSize: "1.5rem", justifySelf: "center", mb: "10px" }}
      >
        Tagging
      </Typography>

      <Autocomplete
        multiple
        id="tags-readOnly"
        options={assetTag.map((option) => option.assetTag + " - " + option.itemCode)}
        value={assetTag.map((item) => item.assetTag + " - " + item.itemCode)}
        readOnly
        renderInput={(params) => <TextField {...params} label="Selected Assets" />}
        sx={{ mb: "10px" }}
      />

      <CustomTextField
        control={control}
        name="added_useful_life"
        label="Add Useful Life"
        type="number"
        color="secondary"
        size="small"
        error={!!errors?.added_useful_life}
        helperText={errors?.added_useful_life?.message}
        fullWidth
        onKeyDown={(e) => (e.keyCode === 69 || e.keyCode === 190) && e.preventDefault()} //prevents input of "e" and "."
      />

      <Stack flexDirection="row" justifyContent="flex-end" gap={2} sx={{ mb: "10px", mt: "10px" }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="small"
          // loading={isUpdateLoading || isPostLoading}
          // disabled={!isValid}
          // sx={data.action === "view" ? { display: "none" } : null}
        >
          Tag
        </LoadingButton>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={handleCancel}
          // disabled={(isPostLoading || isUpdateLoading) === true}
          // fullWidth={data.action === "view" ? true : false}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

export default AddTag;
