import React from "react";
import { Box, Chip } from "@mui/material";
import {
  BuildCircle,
  CheckCircleRounded,
  Delete,
  DeleteForever,
  EditOff,
  FileCopy,
  FindReplace,
  FolderDelete,
  Gavel,
  GavelRounded,
  Inventory,
  Lock,
  Pending,
  Print,
  RadioButtonUncheckedRounded,
  Sell,
  SwapHorizontalCircle,
  ThumbsUpDown,
} from "@mui/icons-material";

const faStatusComponent = ({ faStatus, data, hover }) => {
  if (faStatus === "Good" || faStatus === "Repaired" || faStatus === "Received") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<CheckCircleRounded size="small" color="#00ba34" />}
        label={faStatus}
        sx={{
          backgroundColor: "#e6f8eb",
          color: "#00ba34",

          ":hover": hover && { backgroundColor: "#ADFFC4", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Repair") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<BuildCircle size="small" color="#0288d1" />}
        label="For Repair"
        sx={{
          backgroundColor: "#61c3f831",
          color: "#0288d1",

          p: "0 5px",
        }}
      />
    );
  } else if (
    faStatus === "For Releasing" ||
    faStatus === "Not yet evaluated" ||
    faStatus === "Not yet pick-up" ||
    faStatus === "For Evaluation"
  ) {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<Pending size="small" color="#0288d1" />}
        label={faStatus}
        sx={{
          backgroundColor: "#61c3f831",
          color: "#0288d1",

          ":hover": hover && { backgroundColor: "#A4C7DB", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Disposal" || faStatus === "Disposal" || faStatus === "disposal") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<FolderDelete size="small" color="#d13202" />}
        label="For Disposal"
        sx={{
          backgroundColor: "#fd8e6c3a",
          color: "#d13202",

          ":hover": hover && { backgroundColor: "#FFB098", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "disposed") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<Delete size="small" color="#d13202" />}
        label="Disposed"
        sx={{
          backgroundColor: "#fd8e6c3a",
          color: "#d13202",

          ":hover": hover && { backgroundColor: "#FFB098", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Spare" || faStatus === "spare") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<FileCopy size="small" color="#5102d1" />}
        label="Spare"
        sx={{
          backgroundColor: "#b88ffa41",
          color: "#5102d1",

          ":hover": hover && { backgroundColor: "#CDCCF0", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Write Off") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<EditOff size="small" color="#109790" />}
        label="Write Off"
        sx={{
          backgroundColor: "#7bfff838",
          color: "#109790",

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Sold") {
    return (
      <Chip
        size="small"
        variant="outlined"
        icon={<Sell size="small" color="#00ba34" />}
        label="Sold"
        sx={{
          borderColor: "#00ba34",
          color: "#00ba34",
          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Disposed") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<DeleteForever size="small" color="#a32424" />}
        label="Disposed"
        sx={{
          backgroundColor: "#ff979749",
          color: "#a32424",

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Replaced") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<SwapHorizontalCircle size="small" color="#a32424" />}
        label="Replaced"
        sx={{
          backgroundColor: "#ff979749",
          color: "#a32424",

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "Change Care-of" || faStatus === "Change Care of") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<SwapHorizontalCircle size="small" color="primary.dark" />}
        label="Change Care of"
        sx={{
          backgroundColor: "primary.light",
          color: "primary",

          ":hover": hover && { backgroundColor: "primary.main", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Replacement") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<FindReplace size="small" color="text.dark" />}
        label={faStatus}
        sx={{
          backgroundColor: "#FFC773",
          color: "#905700",

          ":hover": hover && { backgroundColor: "primary.main", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Tagging") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<Print size="small" color="#344955" />}
        label={faStatus}
        sx={{
          backgroundColor: "#678CA2",
          color: "text",

          ":hover": hover && { backgroundColor: "primary.main", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Safe-Keeping" || faStatus === "For Safe-keeping" || faStatus === "For Safekeeping") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<Lock size="small" color="#283e42" />}
        label={faStatus}
        sx={{
          backgroundColor: "#b2d3e7",
          // color: "text",

          ":hover": hover && { backgroundColor: "#93a3a7", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Confirmation") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<ThumbsUpDown size="small" color="#6a7678" />}
        label={faStatus}
        sx={{
          backgroundColor: "#86badb",
          // color: "text",

          ":hover": hover && { backgroundColor: "#a6dce9", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else if (faStatus === "For Bidding") {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<GavelRounded fontSize="small" color="#fdaaaa" />}
        label={faStatus}
        sx={{
          backgroundColor: "#fdaaaa",
          color: "text",

          ":hover": hover && { backgroundColor: "#fccccc", cursor: "pointer" },

          p: "0 5px",
        }}
      />
    );
  } else {
    return (
      <Chip
        size="small"
        variant="contained"
        icon={<RadioButtonUncheckedRounded size="small" />}
        label={faStatus}
        sx={{
          backgroundColor: "#c7c7c742",

          p: "0 5px",
        }}
      />
    );
  }
  // console.log(faStatus);
};

export default faStatusComponent;
