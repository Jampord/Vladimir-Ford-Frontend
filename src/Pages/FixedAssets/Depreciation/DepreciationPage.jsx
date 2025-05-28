import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import Depreciation from "../Depreciation";
import ForDepreciation from "./ForDepreciation";
import RunningDepreciation from "./RunningDepreciation";
import FullyDepreciated from "./FullyDepreciated";
import { useDispatch, useSelector } from "react-redux";
import { setDepreciationPageTabValue } from "../../../Redux/StateManagement/tabSlice";

const DepreciationPage = () => {
  const dispatch = useDispatch();
  const tabValue = useSelector((state) => state.tab.depreciationPageTabValue);

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    // console.log("refetched data", notifData);
    refetch();
  }, [notifData]);

  const handleChange = (_, newValue) => {
    dispatch(setDepreciationPageTabValue(newValue));
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Depreciation
      </Typography>

      <Box>
        <TabContext value={tabValue}>
          <Tabs onChange={handleChange} value={tabValue}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toPulloutApproveCount}>
                  For Depreciation
                </Badge>
              }
              value="1"
              className={tabValue === "1" ? "tab__background" : null}
            />

            <Tab label="Running Depreciation" value="2" className={tabValue === "2" ? "tab__background" : null} />
            <Tab label="Fully Depreciated" value="3" className={tabValue === "3" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ForDepreciation />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <RunningDepreciation />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="3" index="3">
            <FullyDepreciated />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default DepreciationPage;
