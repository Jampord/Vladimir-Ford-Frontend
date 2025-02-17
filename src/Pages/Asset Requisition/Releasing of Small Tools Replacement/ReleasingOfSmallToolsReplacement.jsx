import { TabContext, TabPanel } from "@mui/lab";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SmallToolsReleasingTable from "./SmallToolsReleasingTable";
import { useGetNotificationApiQuery } from "../../../Redux/Query/Notification";

const ReleasingOfSmallToolsReplacement = () => {
  const [value, setValue] = useState("1");

  const { data: notifData, refetch } = useGetNotificationApiQuery();

  useEffect(() => {
    refetch();
  }, [notifData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "1.6rem" }}>
        Releasing of Small Tools Replacement
      </Typography>

      <Box>
        <TabContext value={value}>
          <Tabs onChange={handleChange} value={value}>
            <Tab
              label={
                <Badge color="error" badgeContent={notifData?.toSmallToolRelease}>
                  For Releasing
                </Badge>
              }
              value="1"
              className={value === "1" ? "tab__background" : null}
            />
            <Tab label="Released" value="2" className={value === "2" ? "tab__background" : null} />
          </Tabs>

          <TabPanel sx={{ p: 0 }} value="1" index="1">
            <SmallToolsReleasingTable />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="2" index="2">
            <SmallToolsReleasingTable released />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default ReleasingOfSmallToolsReplacement;
