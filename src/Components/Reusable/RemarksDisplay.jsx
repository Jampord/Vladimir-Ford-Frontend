import { Box, Typography } from "@mui/material";
import React from "react";

const RemarksDisplay = ({ remarks }) => {
  return (
    <Box
      sx={{
        maxWidth: 180,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: "#f5c9861c", // your bg tint
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#24333b", // secondaryDark
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center",
        }}
      >
        {remarks || "No remarks"}
      </Typography>
    </Box>
  );
};

export default RemarksDisplay;
