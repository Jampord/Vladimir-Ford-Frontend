import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import Repaired from "./Repaired";
import ChangeCareof from "./ChangeCareof";
import ForDisposal from "./ForDisposal";

const PulloutConfirmation = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    refetch();
  }, [notifData]);

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Pullout Confirmation
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.repairedCount}>
                  Repaired
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />

            {/* <Tab label="Change Care of" value="2" className={value === "2" ? "tab__background" : null} /> */}
            {/* <Tab label="For Disposal" value="3" className={value === "3" ? "tab__background" : null} /> */}
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <Repaired />
          </TabPanel>

          {/* <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ChangeCareof />
          </TabPanel> */}

          {/* <TabPanel sx={{ p: 0 }} value="3" index="3">
            <ForDisposal />
          </TabPanel> */}
        </TabContext>
      </Box>
    </Box>
  );
};

export default PulloutConfirmation;
