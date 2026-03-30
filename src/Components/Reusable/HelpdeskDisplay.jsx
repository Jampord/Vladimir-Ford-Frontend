import { ConfirmationNumberOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React from "react";

const HelpdeskDisplay = ({ id }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <ConfirmationNumberOutlined sx={{ fontSize: 16, color: "#036d70" }} />
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "#344955",
        }}
      >
        {id || "N/A"}
      </Typography>
    </Box>
  );
};

export default HelpdeskDisplay;
