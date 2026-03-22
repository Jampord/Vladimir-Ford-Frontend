import React, { useState } from "react";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import BiddingTabPanel from "./BiddingTabPanel";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";

const Bidding = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { data: notifData } = useGetNotificationApiQuery();

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Bidding
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.forBiddingForBookSlipCount}>
                  For Bid
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />
            <Tab label="Sold" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <BiddingTabPanel tab="Bid" />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <BiddingTabPanel tab="Sold" />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Bidding;
