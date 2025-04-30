import { Box, Button } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const CustomWebcam = ({ capturedImage, setCapturedImage, close, cancel, submit }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);
  return (
    <>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "20px" }}
      >
        {!capturedImage && (
          <>
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
              }}
            />

            <Box sx={{ display: "flex", gap: "10px", flexDirection: "row", mt: "20px" }}>
              <Button onClick={capture} variant="contained" color="secondary">
                Capture photo
              </Button>

              <Button onClick={cancel} variant="outlined">
                Cancel
              </Button>
            </Box>
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
                width: "1050px",
                height: "auto",
                border: "2px solid #ccc",
                borderRadius: "10px",
              }}
            />

            <Box sx={{ display: "flex", gap: "10px", flexDirection: "row" }}>
              <Button
                onClick={() => setCapturedImage(null)} // Clear the captured image
                variant="contained"
                color="secondary"
                sx={{ marginTop: "10px" }}
              >
                Retake Photo
              </Button>

              <Button onClick={submit} variant="contained" sx={{ marginTop: "10px" }}>
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
