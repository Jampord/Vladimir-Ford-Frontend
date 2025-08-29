import { Typography, useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Cards from "../../Components/Reusable/Cards";
import { PostAdd, QueuePlayNext, Warehouse } from "@mui/icons-material";

const MonitoringList = [
  {
    icon: <PostAdd />,
    label: "Request Monitoring",
    description: "List of Asset Requests for Monitoring",
    path: "/monitoring/request-monitoring",
    permission: "request-monitoring",
  },

  {
    icon: <Warehouse />,
    label: "Warehouse Monitoring",
    description: "List of Asset Requests for Monitoring for Specific Warehouse",
    path: "/monitoring/warehouse-monitoring",
    permission: "warehouse-monitoring",
  },
  {
    icon: <QueuePlayNext />,
    label: "Transfer Receiving Monitoring",
    description: "List of For Receiving of Asset Transfers for Monitoring",
    path: "/monitoring/transfer-receiving-monitoring",
    permission: "transfer-receiving-monitoring",
  },
];

const Monitoring = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <>
      {location.pathname === "/monitoring" ? (
        <>
          <Typography
            color="secondary"
            sx={{
              fontFamily: "Anton, Roboto, Impact, Helvetica",
              fontSize: "25px",
              alignSelf: isSmallScreen ? "center" : "flex-start",
              marginLeft: isSmallScreen ? null : "30px",
            }}
          >
            Monitoring
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {MonitoringList?.map((data, index) => {
                  return permissions.split(", ").includes(data.permission) && <Cards data={data} key={index} />;
                })}
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Monitoring;
