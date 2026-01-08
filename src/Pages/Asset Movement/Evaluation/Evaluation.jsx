import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ToPickup from "./ToPickup";
import ListOfPullout from "./ListOfPullout";
import ForApprovalEvaluation from "./ForApprovalEvaluation";
import EvaluatedPullout from "./EvaluatedPullout";
import { useDispatch, useSelector } from "react-redux";
import { setEvaluationTabValue } from "../../../Redux/StateManagement/tabSlice";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";

const Evaluation = () => {
  // const [value, setValue] = useState("1");

  const dispatch = useDispatch();
  const value = useSelector((state) => state.tab.evaluationTabValue);

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  // useEffect(() => {
  //   refetch();
  // }, [notifData]);

  const handleChange = (_, newValue) => {
    // setValue(newValue);
    dispatch(setEvaluationTabValue(newValue));
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const hasPermission = user?.role?.access_permission.includes("evaluation");

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Evaluation
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value} variant="scrollable" scrollButtons="auto">
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toPickUpCount}>
                  To Pickup
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toEvaluateCount}>
                  List of Pullout
                </Badge>
              }
              value="2"
              className={value === "2" ? "tab__background" : null}
            />
            {/* <Tab label="For Approval" value="3" className={value === "3" ? "tab__background" : null} /> */}
            <Tab label="Repaired" value="4" className={value === "4" ? "tab__background" : null} />
            {hasPermission && (
              <Tab
                label={
                  <Badge color="error" badgeContent={0}>
                    For Safekeeping
                  </Badge>
                }
                value="5"
                className={value === "5" ? "tab__background" : null}
              />
            )}
            {hasPermission && (
              <Tab
                label={
                  <Badge color="error" badgeContent={0}>
                    Spare
                  </Badge>
                }
                value="6"
                className={value === "6" ? "tab__background" : null}
              />
            )}
            {hasPermission && (
              <Tab
                label={
                  <Badge color="error" badgeContent={0}>
                    For Disposal
                  </Badge>
                }
                value="7"
                className={value === "7" ? "tab__background" : null}
              />
            )}
            {hasPermission && (
              <Tab
                label={
                  <Badge color="error" badgeContent={0}>
                    For Bidding
                  </Badge>
                }
                value="8"
                className={value === "8" ? "tab__background" : null}
              />
            )}
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <ToPickup />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ListOfPullout />
          </TabPanel>

          {/* <TabPanel sx={{ p: 0 }} value="3" index="3">
            <ForApprovalEvaluation tab={value} />
          </TabPanel> */}

          <TabPanel sx={{ p: 0 }} value="4" index="4">
            <ForApprovalEvaluation tab={value} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="5" index="5">
            <EvaluatedPullout tab={"For Safe-Keeping"} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="6" index="6">
            <EvaluatedPullout tab={"Spare"} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="7" index="7">
            <EvaluatedPullout tab={"For Disposal"} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="8" index="8">
            <EvaluatedPullout tab={"For Bidding"} />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Evaluation;
