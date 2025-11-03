import React, { useState } from "react";
import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import UnitApprovers from "./UnitApprovers";
import AssetTransfer from "./AssetTransfer";
import AssetPullout from "./AssetPullout";
import AssetDisposal from "./AssetDisposal";
import AssetEvaluation from "./AssetEvaluation";
import AssetTransferPullout from "./AssetTransferPullout";
import CapexApprovers from "./CapexApprovers";
import EstimationApprovers from "./EstimationApprovers";
import SubCapexApprovers from "./SubCapexApprovers";
import AdditionalCostApprovers from "./AdditionalCostApprovers";

const FormSettings = () => {
  const [value, setValue] = useState("option1");

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const views = {
    option1: <UnitApprovers />,
    option2: <AssetTransfer />,
    option3: <AssetTransferPullout />,
    option4: <AssetPullout />,
    option5: <AssetEvaluation />,
    option6: <AssetDisposal />,
    option7: <CapexApprovers />,
    option8: <EstimationApprovers />,
    option9: <SubCapexApprovers />,
    option10: <AdditionalCostApprovers />,
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton, Roboto, Helvetica", fontSize: "1.6rem" }}>
        Form Settings
      </Typography>

      <Stack>
        <Select
          size="small"
          value={value}
          onChange={handleChange}
          sx={{
            minWidth: "230px",
            width: "30%",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid #c7c7c70e",
            my: "5px",
            fontWeight: "bold",
            color: "secondary.main",
          }}
        >
          <MenuItem value="option1">Asset Requisition</MenuItem>
          <MenuItem value="option2">Asset Transfer</MenuItem>
          <MenuItem value="option3">Asset Transfer (For Pullout)</MenuItem>
          <MenuItem value="option4">Asset Pullout</MenuItem>
          <MenuItem value="option5">Asset Evaluation</MenuItem>
          <MenuItem value="option6">Asset Disposal</MenuItem>
          <MenuItem value="option7">Capex</MenuItem>
          <MenuItem value="option8">Capex Estimation</MenuItem>
          <MenuItem value="option9">Sub Capex</MenuItem>
          <MenuItem value="option10">Additional Cost (Capex)</MenuItem>
        </Select>
        {views[value]}
      </Stack>
    </Box>
  );
};

export default FormSettings;
