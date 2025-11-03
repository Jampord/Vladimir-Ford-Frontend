import { BrowserUpdated, Close, SystemUpdateAltRounded } from "@mui/icons-material";
import { Box, IconButton, Link, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { usePostImportEnrolledBudgetApiMutation } from "../../../Redux/Query/Capex/AddBudget";
import { useDownloadExcel } from "../../../Hooks/useDownloadExcel";
import { closeImport } from "../../../Redux/StateManagement/booleanStateSlice";
import { openToast } from "../../../Redux/StateManagement/toastSlice";
import ErrorsFoundImport from "../../ErrorsFoundImport";
import { FileUploader } from "react-drag-drop-files";
import { ImportingData } from "../../../Components/LottieFiles/LottieComponents";
import { LoadingButton } from "@mui/lab";

const fileTypes = ["CSV", "XLSX"];
const ImportBudget = () => {
  const [importError, setImportError] = useState([]);

  const dispatch = useDispatch();

  const [
    postImport,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostImportEnrolledBudgetApiMutation();

  useEffect(() => {
    if (isPostError && postError?.status === 422) {
      const errorArray = Object.entries(postError.data.errors)?.map(([key, value]) => {
        const [row, column] = key.split(".");
        const [message] = value;

        return {
          row,
          column,
          message,
        };
      });
      setImportError(errorArray);

      dispatch(
        openToast({
          message: postError?.data?.message,
          duration: 5000,
          variant: "error",
        })
      );
    } else if (isPostError && postError?.status !== 422) {
      dispatch(
        openToast({
          message: "Something went wrong. Please try again.",
          duration: 5000,
          variant: "error",
        })
      );
    }
  }, [isPostError]);

  useEffect(() => {
    if (isPostSuccess) {
      dispatch(
        openToast({
          message: postData?.message,
          duration: 5000,
        })
      );
      handleCloseImport();
    }
  }, [isPostSuccess]);

  const handleCloseImport = () => {
    dispatch(closeImport());
  };

  const handleChange = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    postImport(formData);
  };

  const saveExcel = () => {
    useDownloadExcel({ file: "add-budget-sample-file", name: "Add Budget Sample File" });
  };

  return (
    <Box className="importFixedAsset" component="form">
      <IconButton
        sx={{
          alignSelf: "flex-end",
          right: 10,
          top: 10,
          position: "absolute",
        }}
        size="small"
        color="secondary"
        disabled={isPostLoading}
        onClick={handleCloseImport}
      >
        <Close size="small" />
      </IconButton>

      <Box>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.4rem" }}>
          IMPORT ADD BUDGET
        </Typography>

        {isPostError ? null : (
          <Typography color="secondary.main" sx={{ fontFamily: "Raleway", fontSize: "14px" }}>
            Download sample document {""}
            <Link sx={{ cursor: "pointer" }} onClick={saveExcel}>
              Here
            </Link>
          </Typography>
        )}
      </Box>

      {isPostError ? (
        <ErrorsFoundImport importError={importError} isPostError={isPostError} />
      ) : (
        <Box sx={{ pb: "20px" }}>
          <FileUploader handleChange={handleChange} name="file" types={fileTypes}>
            <Box className="importBoxContainer">
              {isPostLoading ? (
                <ImportingData />
              ) : (
                <>
                  <BrowserUpdated
                    sx={{
                      fontSize: "75px",
                      color: "gray",
                    }}
                  />
                  <Typography
                    className="importDrop"
                    sx={{
                      fontFamily: "Raleway, Poppins, Roboto",
                    }}
                  >
                    Drop a CSV/XLSX file or
                  </Typography>
                </>
              )}

              <LoadingButton
                sx={{
                  width: "110px",
                  maxWidth: "150px",
                  borderRadius: "20px",
                  padding: "8px",
                  marginTop: isPostLoading ? "120px" : "5px",
                  zIndex: "2",
                }}
                variant="contained"
                size="small"
                loading={isPostLoading}
                loadingPosition="start"
                startIcon={<SystemUpdateAltRounded color="text" />}
                htmlFor="importInputFile"
              >
                <Typography fontFamily={"Raleway"} fontSize={12} fontWeight={"bold"}>
                  {isPostLoading ? "IMPORTING..." : "IMPORT"}
                </Typography>
              </LoadingButton>
            </Box>
          </FileUploader>
        </Box>
      )}
    </Box>
  );
};

export default ImportBudget;
