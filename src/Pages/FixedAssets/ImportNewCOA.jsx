import { useEffect, useState } from "react";
import { usePostImportNewCOAApiMutation } from "../../Redux/Query/FixedAsset/AdditionalCost";
import { useDispatch } from "react-redux";
import { closeDialog1 } from "../../Redux/StateManagement/booleanStateSlice";
import { useDownloadExcel } from "../../Hooks/useDownloadExcel";
import { Box, IconButton, Link, Typography } from "@mui/material";
import { BrowserUpdated, Close, SystemUpdateAltRounded } from "@mui/icons-material";
import ErrorsFoundImport from "../ErrorsFoundImport";
import { FileUploader } from "react-drag-drop-files";
import { ImportingData } from "../../Components/LottieFiles/LottieComponents";
import { LoadingButton } from "@mui/lab";
import { openToast } from "../../Redux/StateManagement/toastSlice";

const fileTypes = ["CSV", "XLSX"];
const ImportNewCOA = () => {
  const [importError, setImportError] = useState([]);

  const dispatch = useDispatch();

  const [
    postImport,
    { data: postData, isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError, error: postError },
  ] = usePostImportNewCOAApiMutation();

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
      // console.log(importError);

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
    dispatch(closeDialog1());
  };

  const handleChange = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    // console.log(file.name);
    // console.log(formData);

    // for (const pair of formData.entries()) {
    //   console.log(pair[0], pair[1]);
    // }

    // axios.post("http://127.0.0.1:8000/api/import-masterlist", formData);

    postImport(formData);
  };

  const saveExcel = () => {
    useDownloadExcel({ file: "new-coa-sample-file", name: "New COA Sample File" });
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
          IMPORT NEW COA
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

export default ImportNewCOA;
