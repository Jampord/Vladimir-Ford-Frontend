import { TabContext, TabPanel } from "@mui/lab";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import EnrolledBudget from "./EnrolledBudget";

const AddBudgetIndex = () => {
  const [tabValue, setTabValue] = useState("1");

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Add Budget
      </Typography>

      <TabContext value={tabValue}>
        <Tabs onChange={handleChange} value={tabValue}>
          <Tab label={"Enrolled Budget"} value="1" className={tabValue === "1" ? "tab__background" : null} />

          <Tab label={"Applied Budget"} value="2" className={tabValue === "2" ? "tab__background" : null} />
        </Tabs>

        <TabPanel sx={{ p: 0 }} value="1" index="1">
          <EnrolledBudget />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="2" index="2">
          <EnrolledBudget />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default AddBudgetIndex;
