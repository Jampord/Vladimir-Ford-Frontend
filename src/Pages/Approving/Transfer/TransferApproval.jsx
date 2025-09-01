import React, { useEffect, useState } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";

import PendingTransfer from "./PendingTransfer";
import ApprovedTransfer from "./ApprovedTransfer";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useDispatch, useSelector } from "react-redux";
import FinalApprovalTransfer from "./FinalApprovalTransfer";
import {
  setTransferApprovalTabValue,
  setTransferSingleApprovalTabValue,
} from "../../../Redux/StateManagement/tabSlice";

const TransferApproving = () => {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.tab.transferApprovalTabValue);
  const tabValue = useSelector((state) => state.tab.transferSingleApprovalTabValue);
  const { data: notifData, refetch } = useGetNotificationApiQuery();
  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  useEffect(() => {
    refetch();
  }, [notifData]);

  const handleChange = (event, newValue) => {
    // permissions.includes("final-approving")
    //   ? dispatch(setTransferApprovalTabValue(newValue))
    //   :
    dispatch(setTransferSingleApprovalTabValue(newValue));
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Transfer Approval
      </Typography>

      <Box>
        {
          // permissions.includes("final-approving") ? (
          //   <TabContext value={value}>
          //     <Tabs onChange={handleChange} value={value}>
          //       <Tab
          //         label={
          //           <Badge color="error" badgeContent={notifData?.toTransferApproveCount}>
          //             First Approving
          //           </Badge>
          //         }
          //         value="1"
          //         className={value === "1" ? "tab__background" : null}
          //       />
          //       <Tab
          //         label={
          //           <Badge color="error" badgeContent={notifData?.toTransferFaApproval}>
          //             Second Approving
          //           </Badge>
          //         }
          //         value="2"
          //         className={value === "2" ? "tab__background" : null}
          //       />

          //       <Tab label="Approved Transfer" value="3" className={value === "3" ? "tab__background" : null} />
          //     </Tabs>

          //     <TabPanel sx={{ p: 0 }} value="1" index="1">
          //       <FinalApprovalTransfer />
          //     </TabPanel>

          //     <TabPanel sx={{ p: 0 }} value="2" index="2">
          //       <FinalApprovalTransfer final />
          //     </TabPanel>

          //     <TabPanel sx={{ p: 0 }} value="3" index="3">
          //       <ApprovedTransfer />
          //     </TabPanel>
          //   </TabContext>
          // ) :
          <TabContext value={tabValue}>
            <Tabs onChange={handleChange} value={tabValue} variant="scrollable" scrollButtons="auto">
              <Tab
                label={
                  <Badge color="error" badgeContent={notifData?.toTransferApproveCount}>
                    Pending Transfer
                  </Badge>
                }
                value="1"
                className={tabValue === "1" ? "tab__background" : null}
              />

              <Tab label="Approved Transfer" value="2" className={tabValue === "2" ? "tab__background" : null} />
            </Tabs>

            <TabPanel sx={{ p: 0 }} value="1" index="1">
              <PendingTransfer refetch />
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value="2" index="2">
              <ApprovedTransfer />
            </TabPanel>
          </TabContext>
        }
      </Box>
    </Box>
  );
};

export default TransferApproving;
