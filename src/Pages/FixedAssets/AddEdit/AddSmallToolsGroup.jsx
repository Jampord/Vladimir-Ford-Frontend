import { Avatar, Box, Button, DialogActions, Divider, Slide, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePostGroupSmallToolsApiMutation } from "../../../Redux/Query/Masterlist/YmirCoa/SmallTools";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { DragIndicator, Help, HomeRepairService } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { closeDialog2 } from "../../../Redux/StateManagement/booleanStateSlice";
import { LoadingButton } from "@mui/lab";
import { closeConfirm, onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import { fixedAssetApi } from "../../../Redux/Query/FixedAsset/FixedAssets";

const schema = yup.object().shape({
  //   main_asset_id: yup.object().required().typeError("Main Asset is required").label("Main Asset"),
  child_asset_ids: yup.array().required().label("Child Asset"),
});
const AddSmallToolsGroup = ({ data }) => {
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [checked, setChecked] = useState(true);

  const dispatch = useDispatch();

  // console.log("ST Data", data);

  const [
    postGroupSmallTools,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostGroupSmallToolsApiMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      child_asset_ids: [],
    },
  });

  // console.log("errors", errors);

  useEffect(() => {
    if (data) {
      setValue(
        "child_asset_ids",
        data?.map((item) => {
          return {
            id: item.id,
            asset: {
              id: item.id,
              asset_description: item.asset_description,
              asset_specification: item.asset_specification,
            },
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (isPostSuccess) {
      reset();
      dispatch(closeDialog2());
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
    }
  }, [isPostSuccess]);

  useEffect(() => {
    if (isPostError) {
      //   reset();
      //   dispatch(closeDialog2());
      dispatch(
        openToast({
          message: postError?.message,
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  //   console.log(
  //     "watch",
  //     data?.map((item) => {
  //       return {
  //         id: item.id,
  //         asset: {
  //           id: item.id,
  //           asset_description: item.asset_description,
  //           asset_specification: item.asset_specification,
  //         },
  //       };
  //     })
  //   );

  const onSubmitHandler = (formData) => {
    console.log("formdata", formData);
    const newFormData = {
      main_asset_id: formData.child_asset_ids[0].id,
      child_asset_ids: formData.child_asset_ids?.map((item) => item?.asset?.id).slice(1),
    };
    console.log("submit", newFormData);

    dispatch(
      openConfirm({
        icon: Help,
        iconColor: "info",
        message: (
          <Box>
            <Typography>Are you sure you want to set</Typography>
            <Typography
              sx={{
                display: "inline-block",
                color: "secondary.main",
                fontWeight: "bold",
                fontFamily: "Raleway",
              }}
            >
              {watch("child_asset_ids")[0]?.asset?.asset_description}
            </Typography>{" "}
            as Main Asset?
            <Typography color="error" fontSize={"14px"}>
              This action is irreversible.
            </Typography>
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            await postGroupSmallTools(newFormData).unwrap();
            dispatch(closeConfirm());
            dispatch(fixedAssetApi.util.invalidateTags(["FixedAsset"]));
            reset();
          } catch (err) {
            console.log(err.data.message);
            if (err?.status === 403 || err?.status === 404 || err?.status === 422) {
              // reset();
            } else if (err?.status !== 422) {
              // reset();
            }
          }
        },
      })
    );
  };

  //   console.log("watch", watch("child_asset_ids")[0]?.asset?.asset_description);

  const onSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    event.stopPropagation(); // Prevent event bubbling to parent forms
    handleSubmit(onSubmitHandler)(event); // Call react-hook-form's handleSubmit
  };

  const setListApprovers = (list) => {
    setValue("child_asset_ids", list);
  };
  return (
    <Box className="add-masterlist" width="550px">
      <Typography
        color="secondary.main"
        sx={{
          fontFamily: "Anton",
          fontSize: "1.5rem",
          alignSelf: "center",
        }}
      >
        Group Small Tools
      </Typography>

      <Box component="form" onSubmit={onSubmit} className="add-masterlist__content" gap={1}>
        {/* <Divider /> */}
        <Stack
          sx={{
            outline: "1px solid lightgray",
            borderRadius: "10px",
            p: 2,
          }}
        >
          <Box
            maxHeight="330px"
            overflow="overlay"
            pr="3px"
            mr="-3px"
            // sx={{ cursor: data?.action === "view" ? "" : "pointer" }}
          >
            <Typography variant="body2" color="secondary.dark">
              Drag item below this text to assign it as Main Asset.
            </Typography>

            <ReactSortable
              // disabled={data?.action === "view"}
              group="groupName"
              animation={200}
              delayOnTouchStart={true}
              delay={2}
              list={watch("child_asset_ids")}
              setList={setListApprovers}
            >
              {watch("child_asset_ids")?.map((data, index) => (
                <Box>
                  {index === 1 && <Divider />}
                  <Stack
                    key={index}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    my={1}
                    sx={{
                      cursor: data?.action === "view" ? "" : "pointer",
                    }}
                  >
                    <Slide
                      direction={data?.action === "view" ? "down" : "left"}
                      in={checked}
                      timeout={500}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Stack
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        p={1}
                        sx={{
                          backgroundColor: "background.light",
                          width: "100%",
                          borderRadius: "8px",
                        }}
                      >
                        <Stack flexDirection="row" alignItems="center" gap={2.5}>
                          <DragIndicator sx={{ color: "black.light" }} />
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor:
                                //    data?.action === "view" ? "gray" :
                                index === 0 ? "primary.main" : "gray",
                              fontSize: "16px",
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Stack>
                            <Typography fontSize={index === 0 ? "16px" : "15px"} fontWeight={index === 0 ? 550 : null}>
                              {data.asset.asset_description}
                            </Typography>
                            <Typography
                              fontSize={index === 0 ? "14px" : "12px"}
                              color={index === 0 ? "primary" : "gray"}
                              fontWeight={index === 0 ? "bold" : null}
                              mt="-2px"
                            >
                              {/* {data.asset.asset_specification} */}
                              {/* Small Tools */}
                              {index === 0 ? "Main Asset ⭐" : "Child Asset"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Slide>
                  </Stack>
                </Box>
              ))}
            </ReactSortable>
          </Box>
        </Stack>

        <DialogActions>
          <LoadingButton
            variant="contained"
            color="secondary"
            type="submit"
            onClick={(event) => event.stopPropagation()}
            disabled={isPostLoading}
            loading={isPostLoading}
            size="small"
            startIcon={<HomeRepairService color="primary" />}
          >
            Group
          </LoadingButton>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              dispatch(closeDialog2());
            }}
            size="small"
          >
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Box>
  );
};

export default AddSmallToolsGroup;
