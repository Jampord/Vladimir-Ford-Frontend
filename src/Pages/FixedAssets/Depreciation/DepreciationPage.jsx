import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import Depreciation from "../Depreciation";
import ForDepreciation from "./ForDepreciation";

const DepreciationPage = () => {
  const [value, setValue] = useState("1");
  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    // console.log("refetched data", notifData);
    refetch();
  }, [notifData]);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Depreciation
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toPulloutApproveCount}>
                  For Depreciation
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />

            {/* <Tab label="Running Depreciation" value="2" className={value === "2" ? "tab__background" : null} />
            <Tab label="Depreciated" value="3" className={value === "3" ? "tab__background" : null} /> */}
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ForDepreciation />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            {/* <ApprovedPullout /> */}
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="3" index="3">
            {/* <ApprovedPullout /> */}
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default DepreciationPage;
