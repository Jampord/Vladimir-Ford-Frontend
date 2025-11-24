import React, { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Button, Tab, Tabs, Typography } from "@mui/material";

import ReleasingTable from "./ReleasingTable";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useDispatch, useSelector } from "react-redux";
import { setReleasingOfAssetTabValue } from "../../../Redux/StateManagement/tabSlice";

const ReleasingOfAsset = () => {
  const dispatch = useDispatch();
  const tabValue = useSelector((state) => state.tab.releasingOfAssetTabValue);

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    refetch();
  }, [notifData]);

  const handleChange = (event, newValue) => {
    dispatch(setReleasingOfAssetTabValue(newValue));
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Releasing of Asset
      </Typography>

      <Box>
        <TabContext value={tabValue}>
          <Tabs onChange={handleChange} value={tabValue} scrollButtons="auto" variant="scrollable">
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toRelease}>
                  For Releasing (All)
                </Badge>
              }
              value="1"
              className={tabValue === "1" ? "tab__background" : null}
            />

            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.directDeliveryCount} variant="dot">
                  Direct Delivery
                </Badge>
              }
              value="2"
              className={tabValue === "2" ? "tab__background" : null}
            />
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.warehouseDeliveryCount} variant="dot">
                  Warehouse Delivery
                </Badge>
              }
              value="3"
              className={tabValue === "3" ? "tab__background" : null}
            />
            <Tab label="Released" value="4" className={tabValue === "4" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ReleasingTable />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ReleasingTable direct />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="3" index="3">
            <ReleasingTable warehouse />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="4" index="4">
            <ReleasingTable released />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default ReleasingOfAsset;
