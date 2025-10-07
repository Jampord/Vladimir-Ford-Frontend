import { TabContext, TabPanel } from "@mui/lab";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setCapexTabValue } from "../../../Redux/StateManagement/tabSlice";
import ForEstimate from "./ForEstimate";
import Estimated from "./Estimated";
import Approved from "./Approved";

const AddCapexIndex = () => {
  const dispatch = useDispatch();
  const tabValue = useSelector((state) => state.tab.capexTabValue);

  const handleChange = (event, newValue) => {
    dispatch(setCapexTabValue(newValue));
  };
  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Capex
      </Typography>

      <TabContext value={tabValue}>
        <Tabs onChange={handleChange} value={tabValue}>
          <Tab label={"For Estimate"} value="1" className={tabValue === "1" ? "tab__background" : null} />

          <Tab
            label={"Estimated"}
            value="2"
            claimed="claimed"
            className={tabValue === "2" ? "tab__background" : null}
          />

          <Tab label={"Approved"} value="3" className={tabValue === "3" ? "tab__background" : null} />
        </Tabs>

        <TabPanel sx={{ p: 0 }} value="1" index="1">
          <ForEstimate addCapex />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="2" index="2">
          <ForEstimate />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="3" index="3">
          <ForEstimate />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default AddCapexIndex;
