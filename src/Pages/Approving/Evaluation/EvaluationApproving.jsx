import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { TabContext, TabPanel } from "@mui/lab";
import PendingEvaluation from "./PendingEvaluation";
import ApprovedEvaluation from "./ApprovedEvaluation";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";
import { useEffect, useState } from "react";

const EvaluationApproving = () => {
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
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Evaluation Approval
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toPulloutApproveCount}>
                  Pending Pullout{"  "}
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />

            <Tab label="Approved Pullout" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <PendingEvaluation refetch />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <ApprovedEvaluation />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default EvaluationApproving;
