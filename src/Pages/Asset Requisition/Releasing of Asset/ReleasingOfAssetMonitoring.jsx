import { TabContext, TabPanel } from "@mui/lab";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import ReleasingTable from "./ReleasingTable";
import { useState } from "react";
import ReleasingTableMonitoring from "./ReleasingTableMonitoring";

const ReleasingOfAssetMonitoring = () => {
  const [tabValue] = useState("1");
  const dispatch = useDispatch();

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Releasing of Asset Monitoring
      </Typography>

      <Box>
        <TabContext value={tabValue}>
          <Tabs value={tabValue}>
            <Tab label={`For Releasing`} value="1" className={tabValue === "1" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ReleasingTableMonitoring />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default ReleasingOfAssetMonitoring;
