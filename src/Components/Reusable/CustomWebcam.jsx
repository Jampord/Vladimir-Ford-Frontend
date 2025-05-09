import { Box, Button } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import WebCamError from "../../Img/SVG/No Webcam.svg";

const CustomWebcam = ({ capturedImage, setCapturedImage, close, cancel, submit, error, setError, back }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
          mt: "10%",
        }}
      >
        {!capturedImage && (
          <>
            {!error && (
              <Webcam
                audio={false}
                height={800}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={1}
                width={1300}
                mirrored={false}
                imageSmoothing={true}
                disablePictureInPicture={true}
                onUserMediaError={(err) => {
                  console.log("webcam error: ", err);
                  setError(true);
                }}
                style={{
                  width: "100%",
                  maxWidth: "800px", // Limit width for larger screens
                  height: "auto", // Maintain aspect ratio
                  borderRadius: "10px", // Add rounded corners
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
                }}
              />
            )}

            {error && (
              <img
                src={WebCamError}
                alt="webcam error"
                style={{ width: "100%", maxWidth: "500px", height: "auto", marginTop: "100px" }}
              />
            )}

            {!error && (
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: "5px", sm: "10px" },
                  flexDirection: { xs: "column", sm: "row" },
                  mt: "20px",
                }}
              >
                <Button onClick={capture} variant="contained" color="secondary">
                  Capture photo
                </Button>

                <Button onClick={cancel} variant="outlined">
                  Cancel
                </Button>
              </Box>
            )}

            {error && (
              <Box sx={{ display: "flex", gap: "10px", flexDirection: "row", mt: "60px" }}>
                <Button onClick={back} color="secondary" variant="contained">
                  Go Back
                </Button>
              </Box>
            )}
          </>
        )}

        {capturedImage && (
          <Box
            sx={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: "100%",
                maxWidth: "1300px", // Limit width for larger screens
                height: "auto", // Maintain aspect ratio
                border: "2px solid #ccc", // Add a subtle border
                borderRadius: "10px", // Add rounded corners
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
              }}
            />

            <Box sx={{ display: "flex", gap: "10px", flexDirection: "row" }}>
              <Button
                onClick={() => setCapturedImage(null)} // Clear the captured image
                variant="contained"
                color="secondary"
                sx={{ marginTop: "10px", width: { xs: "100%", sm: "auto" } }}
              >
                Retake Photo
              </Button>

              <Button
                onClick={submit}
                variant="contained"
                sx={{ marginTop: "10px", width: { xs: "100%", sm: "auto" } }}
              >
                Submit
              </Button>

              <Button onClick={close} variant="outlined" sx={{ marginTop: "10px" }}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default CustomWebcam;
