import React, { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import BiddingTabPanel from "./BiddingTabPanel";

const Bidding = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Bidding
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab label="For Disposal" value="1" className={value === "1" ? "tab__background" : null} />
            <Tab label="Disposed" value="2" className={value === "2" ? "tab__background" : null} />
            <Tab label="For Bid" value="3" className={value === "3" ? "tab__background" : null} />
            <Tab label="Bidding" value="4" className={value === "4" ? "tab__background" : null} />
            <Tab label="Sold" value="5" className={value === "5" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <BiddingTabPanel tab="For Disposal" />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <BiddingTabPanel tab="Disposed" />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="3" index="3">
            <BiddingTabPanel tab="Bid" />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="4" index="4">
            <BiddingTabPanel tab="Bidding" />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="5" index="5">
            <BiddingTabPanel tab="Sold" />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Bidding;
