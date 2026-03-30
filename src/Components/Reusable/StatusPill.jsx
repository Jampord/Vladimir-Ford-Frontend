import { Box } from "@mui/material";
import React from "react";

const StatusPill = ({ value, trueLabel = "Yes", falseLabel = "No", trueColor = "success" }) => {
  const isTrue = value === 1 || value === true;

  const colorMap = {
    success: {
      bg: "success.50",
      text: "success.main",
      dot: "success.main",
      border: "success.200",
    },
    warning: {
      bg: "warning.50",
      text: "warning.main",
      dot: "warning.main",
      border: "warning.200",
    },
    info: {
      bg: "info.50",
      text: "info.main",
      dot: "info.main",
      border: "info.200",
    },
    error: {
      bg: "error.50",
      text: "error.main",
      dot: "error.main",
      border: "error.200",
    },
  };

  const c = colorMap[trueColor];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        height: 22,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 500,
        minWidth: 70,
        justifyContent: "center",

        bgcolor: isTrue ? c.bg : "grey.100",
        color: isTrue ? c.text : "text.secondary",

        border: "1px solid",
        borderColor: isTrue ? c.border : "grey.300",
      }}
    >
      {/* dot */}
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: isTrue ? c.dot : "grey.400",
        }}
      />

      {isTrue ? trueLabel : falseLabel}
    </Box>
  );
};

export default StatusPill;
