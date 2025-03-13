import React, { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";

import PendingRequest from "./PendingRequest";
import ApprovedRequest from "./ApprovedRequest";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useSelector } from "react-redux";
import FinalApproval from "./FinalApproval";

const RequestApproving = () => {
  const [value, setValue] = useState("1");
  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    // console.log("refetched data");
    refetch();
  }, [notifData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Request Approval
      </Typography>

      <Box>
        {permissions.includes("final-approving") ? (
          <TabContext value={value}>
            <Tabs onChange={handleChange} value={value}>
              <Tab
                label={
                  <Badge color="error" badgeContent={notifData?.toApproveCount}>
                    First Approving
                  </Badge>
                }
                value="1"
                className={value === "1" ? "tab__background" : null}
              />
              <Tab
                label={
                  <Badge color="error" badgeContent={notifData?.toAcquisitionFaApproval}>
                    Second Approving
                  </Badge>
                }
                value="2"
                className={value === "2" ? "tab__background" : null}
              />

              <Tab label="Approved Request" value="3" className={value === "3" ? "tab__background" : null} />
            </Tabs>

            <TabPanel sx={{ p: 0 }} value="1" index="1">
              <FinalApproval />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="2" index="2">
              <FinalApproval final />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="3" index="3">
              <ApprovedRequest />
            </TabPanel>
          </TabContext>
        ) : (
          <TabContext value={value}>
            <Tabs onChange={handleChange} value={value}>
              <Tab
                label={
                  <Badge color="error" badgeContent={notifData?.toApproveCount}>
                    Pending Request
                  </Badge>
                }
                value="1"
                className={value === "1" ? "tab__background" : null}
              />

              <Tab label="Approved Request" value="2" className={value === "2" ? "tab__background" : null} />
            </Tabs>

            <TabPanel sx={{ p: 0 }} value="1" index="1">
              <PendingRequest refetch />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="2" index="2">
              <ApprovedRequest />
            </TabPanel>
          </TabContext>
        )}
      </Box>
    </Box>
  );
};

export default RequestApproving;
