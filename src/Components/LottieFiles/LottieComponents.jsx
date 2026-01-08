import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import LoadingAnimation from "../../assets/Lottie/LoadingAnimation";
import ImportLoading from "../../assets/Lottie/ImportLoading";
import DashboardAnimation from "../../assets/Lottie/DashboardAnimation";
import Ramen from "../../assets/Lottie/Ramen";
import { Box, keyframes, TableCell, TableRow, Typography } from "@mui/material";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const jump = keyframes`
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-6px); }
  60%  { transform: translateY(0); }
  100% { transform: translateY(0); }
`;

export const ImportingData = ({ text }) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "250px",
        ml: "5px",
        // width: "350px",
        position: "absolute",
        overflow: "hidden",
      }}
    >
      <Lottie animationData={ImportLoading} style={{ padding: 0, margin: 0, marginTop: "-40px" }} />
      {text && (
        <Typography fontSize="2rem" color="white" mt={2}>
          {text ? text : ""}
        </Typography>
      )}
    </Box>
  );
};

const JumpingText = ({ text, delay }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Box display="flex" justifyContent="center">
      {text.split("").map((char, index) => (
        <Typography
          key={index}
          component="span"
          fontFamily="Anton"
          fontSize="1.5rem"
          color="secondary.dark"
          sx={{
            display: "inline-block",
            animation: animate ? `${jump} 1.2s ease-in-out infinite` : "none",
            animationDelay: animate ? `${index * 0.1}s` : "0s",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </Typography>
      ))}
    </Box>
  );
};

export const LoadingData = ({ category, dialog }) => {
  return (
    <>
      <TableRow>
        <TableCell
          colSpan={999}
          rowSpan={999}
          sx={{
            borderBottom: "none",
            height: dialog ? "calc(100vh - 600px)" : "calc(100vh - 400px)",
          }}
        >
          <Box className="tblLoading" sx={category ? { marginTop: "-20px!important" } : null}>
            <Lottie animationData={LoadingAnimation} style={category ? { marginTop: "-20px!important" } : null} />
            {/* <Typography
              fontSize="1.5rem"
              fontFamily={"Anton"}
              color="secondary.dark"
              textAlign={"center"}
              sx={{
                animation: `${fadeUp} 0.7s ease-out`,
                }}
                >
                Loading...
                </Typography> */}
            <JumpingText text="Loading..." delay={1500} />
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

export const DashboardAnimate = () => {
  return (
    <>
      <Lottie animationData={Ramen} />
    </>
  );
};
