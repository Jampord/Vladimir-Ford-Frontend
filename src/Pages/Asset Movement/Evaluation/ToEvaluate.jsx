import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { closeDialog, closeDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import {
  Button,
  Stack,
  TableContainer,
  Table,
  TableHead,
  Typography,
  TableCell,
  TableRow,
  Box,
  TableBody,
  Autocomplete,
  TextField,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import "../../../Style/AssetMovement/toEvaluate.scss";
import { Delete, Info, KeyboardReturn, Remove, ScreenSearchDesktop, SwapHorizontalCircle } from "@mui/icons-material";
import {
  evaluationApi,
  useGetAssetsToEvaluateApiQuery,
  usePostEvaluateAssetApiMutation,
} from "../../../Redux/Query/Movement/Evaluation";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import ErrorFetching from "../../ErrorFetching";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomAttachmentArray from "../../../Components/Reusable/CustomAttachmentArray";
import { onLoading, openConfirm } from "../../../Redux/StateManagement/confirmSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import axios from "axios";
import StatusComponent from "../../../Components/Reusable/FaStatusComponent";

const schema = yup.object().shape({
  attachments: yup.mixed().label("Attachment"),
});

const ToEvaluate = ({ item, evaluation, setEvaluation }) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log("item", item);
  console.log("evaluation", evaluation);

  const dispatch = useDispatch();

  const attachmentRef = useRef([]);
  const attachmentRefs = useRef(item.map(() => React.createRef()));

  console.log("attachmentRef", attachmentRef);

  const handleCloseDialog = () => {
    dispatch(closeDialog1());
    setEvaluation("");
  };

  const [postEvaluate] = usePostEvaluateAssetApiMutation();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isValid },
    setError,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      attachments: item.map(() => null), // Initialize attachment for each items
    },
  });

  const onSubmitHandler = (formData) => {
    console.log("formData", formData);

    const submitFormData = new FormData();

    const newFormData = {
      ...formData,
      evaluation: evaluation === "Return" ? "Repaired" : evaluation,
      care_of: item[0]?.care_of,
      pullout_ids: item.map((data) => data.id),
    };

    newFormData.attachments.forEach((id) => {
      submitFormData.append("attachments[]", id);
    });
    submitFormData.append("evaluation", newFormData?.evaluation);
    evaluation === "Change Care of"
      ? submitFormData.append(
          "care_of",
          newFormData?.care_of === "Hardware and Maintenance" ? "Machinery & Equipment" : "Hardware and Maintenance"
        )
      : submitFormData.append("care_of", newFormData?.care_of);
    newFormData.pullout_ids.forEach((id) => {
      submitFormData.append("pullout_ids[]", id);
    });

    console.log("newFormData", newFormData);
    // console.log("submitFormData", submitFormData);

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
              SUBMIT
            </Typography>{" "}
            this Data?
          </Box>
        ),
        onConfirm: async () => {
          try {
            dispatch(onLoading());
            const test = await postEvaluate(submitFormData).unwrap();
            console.log("test", test);
            dispatch(
              openToast({
                message: "Evaluated Successfully",
                duration: 5000,
              })
            );

            setIsLoading(false);
            reset();
            handleCloseDialog();
            dispatch(evaluationApi.util.invalidateTags(["Evaluation"]));
          } catch (err) {
            console.log({ err });
            if (err?.status === 422) {
              dispatch(
                openToast({
                  message: err?.response?.data?.errors?.detail || err?.message,
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

  console.log(
    "watch",
    watch("attachments").every((file) => file !== null)
  );

  const RemoveFile = ({ itemId }) => {
    return (
      <Tooltip title={`Remove Attachment`} arrow>
        <IconButton
          onClick={() => {
            setValue(`attachments.${itemId}`, null);
            if (attachmentRefs.current[itemId] && attachmentRefs.current[itemId].current) {
              // If using React ref object (created with useRef())
              attachmentRefs.current[itemId].current.value = "";
            } else if (attachmentRefs.current[itemId]) {
              // If using direct DOM element reference
              attachmentRefs.current[itemId].value = "";
            }
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

  return (
    <>
      <Box component={"form"} onSubmit={handleSubmit(onSubmitHandler)}>
        <Stack className="evaluation">
          <Typography
            color="secondary.main"
            sx={{ fontFamily: "Anton", fontSize: "25px", borderBottom: "2px solid #344955" }}
          >
            {/* <ScreenSearchDesktop color="primary" fontSize="medium" /> To Evaluate */}
            {evaluation === "Return" && <KeyboardReturn color="primary" fontSize="medium" />}
            {evaluation === "Change Care of" && <SwapHorizontalCircle color="primary" fontSize="medium" />}
            {evaluation === "For Disposal" && <Delete color="primary" fontSize="medium" />}
            {evaluation}
          </Typography>

          <Box marginRight="-15px">
            {/* <MasterlistToolbar onSearchChange={setSearch} onSetPage={setPage} hideArchive /> */}
          </Box>

          <Box className="evaluation__table">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#344955" }}>
                    <TableCell sx={{ color: "white" }} align="center">
                      Evaluation #
                    </TableCell>
                    <TableCell sx={{ color: "white" }} align="center">
                      Request Description
                    </TableCell>
                    <TableCell sx={{ color: "white" }} align="center">
                      Vladimir Tag Number
                    </TableCell>
                    <TableCell sx={{ color: "white" }} align="center">
                      Care of
                    </TableCell>

                    {/* <TableCell sx={{ color: "white" }} align="center">
                      Remarks
                    </TableCell> */}
                    <TableCell sx={{ color: "white" }} align="center">
                      Attachment
                    </TableCell>
                    <TableCell sx={{ color: "white", width: 220 }} align="center">
                      Evaluation
                    </TableCell>
                    {evaluation === "Change Care of" && (
                      <TableCell sx={{ color: "white" }} align="center">
                        Change Care of to
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {item.map((data, index) => (
                    <TableRow key={data.id}>
                      <TableCell align="center">
                        <Typography fontSize="14px" color="black">
                          {data?.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{data?.description}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={700} fontSize="14px" color="primary.main">
                          {data?.asset.vladimir_tag_number}
                        </Typography>
                        <Typography fontWeight={600} fontSize="12px" color="secondary.main">
                          {data?.asset.asset_description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontSize="14px" fontWeight={500} color="black">
                          {data?.care_of}
                        </Typography>
                      </TableCell>

                      {/* <TableCell align="center">{data?.remarks || "-"}</TableCell> */}
                      <TableCell align="center">
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
                          <CustomAttachmentArray
                            control={control}
                            name={`attachments.${index}`}
                            label=""
                            inputRef={attachmentRefs.current[index]}
                            // inputProps={{ id: `attachment-${index}` }}
                          />
                          {watch(`attachments.${index}`) && <RemoveFile itemId={index} />}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Typography fontSize="14px" fontWeight={500} color="black">
                          {/* <Chip
                            label={evaluation === "Return" ? "Repaired" : evaluation}
                            color={
                              evaluation === "Return"
                                ? "success"
                                : "primary"
                                ? evaluation === "For Disposal"
                                  ? "warning"
                                  : "primary"
                                : "primary"
                            }
                          /> */}
                          <StatusComponent faStatus={evaluation === "Return" ? "Repaired" : evaluation} />
                        </Typography>
                      </TableCell>
                      {evaluation === "Change Care of" && (
                        <TableCell align="center">
                          <Typography
                            fontSize="14px"
                            fontWeight={500}
                            color="black"
                            // sx={{ textDecoration: "underline" }}
                          >
                            {data?.care_of === "Hardware and Maintenance"
                              ? "Machinery & Equipment"
                              : "Hardware and Maintenance"}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
        <Stack flexDirection="row" justifyContent="flex-end" marginTop={3} gap={2} margin="15px">
          <Button variant="outlined" color="secondary" size="small" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            type="submit"
            disabled={!item.length || watch("attachments").every((file) => file !== null) === false}
          >
            Submit
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default ToEvaluate;
