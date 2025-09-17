import React, { useState } from "react";

import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import ReleasingTableTransferPullout from "./ReleasingTableTransferPullout";

const PulloutReleasing = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Transfer Pullout Releasing
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge
                  color="error"
                  // badgeContent={notifData?.toTransferReceiving}
                >
                  For Releasing
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />

            <Tab label="Released" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ReleasingTableTransferPullout />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ReleasingTableTransferPullout received />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default PulloutReleasing;
