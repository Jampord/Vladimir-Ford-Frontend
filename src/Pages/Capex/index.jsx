import "../../Style/parentSidebar.scss";

import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { Box, Typography, useMediaQuery } from "@mui/material";
import { AddBox, Gavel, RequestQuote, Unarchive } from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";
import { useSelector } from "react-redux";

const CapexList = [
  {
    icon: <AddBox />,
    label: "Add Capex",
    description: "Requesting for New Capex",
    path: "/capex/add-capex",
    permission: "add-capex",
  },

  {
    icon: <Gavel />,
    label: "Sub Capex",
    description: "Requesting for Sub Capex",
    path: "/capex/sub-capex",
    permission: "sub-capex",
  },

  {
    icon: <Unarchive />,
    label: "Additional Cost",
    description: "Requesting for Capex Additional Cost",
    path: "/capex/additional-cost",
    permission: "additional-cost",
  },

  {
    icon: <RequestQuote />,
    label: "Add Budget",
    description: "Budget Addition for Capex",
    path: "/capex/add-budget",
    permission: "add-budget",
  },
];

const CapexIndex = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <>
      {location.pathname === "/capex" ? (
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
            Capex
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {CapexList?.map((data, Capex) => {
                  return permissions.split(", ").includes(data.permission) && <Cards data={data} key={Capex} />;
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

export default CapexIndex;
