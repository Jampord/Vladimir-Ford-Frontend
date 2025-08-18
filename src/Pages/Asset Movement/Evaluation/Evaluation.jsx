import { TabContext, TabPanel } from "@mui/lab";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";

import ToPickup from "./ToPickup";
import ListOfPullout from "./ListOfPullout";
import ForApprovalEvaluation from "./ForApprovalEvaluation";
import ForReplacement from "./ForReplacement";

const Evaluation = () => {
  const [value, setValue] = useState("1");

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };
  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Evaluation
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab label="To Pickup" value="1" className={value === "1" ? "tab__background" : null} />
            <Tab label="List of Pullout" value="2" className={value === "2" ? "tab__background" : null} />
            {/* <Tab label="For Approval" value="3" className={value === "3" ? "tab__background" : null} /> */}
            <Tab label="Repaired" value="4" className={value === "4" ? "tab__background" : null} />
            <Tab label="For Replacement" value="5" className={value === "5" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ToPickup />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ListOfPullout />
          </TabPanel>

          {/* <TabPanel sx={{ p: 0 }} value="3" index="3">
            <ForApprovalEvaluation tab={value} />
          </TabPanel> */}

          <TabPanel sx={{ p: 0 }} value="4" index="4">
            <ForApprovalEvaluation tab={value} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="5" index="5">
            <ForReplacement />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Evaluation;
