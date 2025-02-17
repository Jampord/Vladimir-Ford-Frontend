import React from "react";
import "../../Style/parentSidebar.scss";

import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { Box, Typography, useMediaQuery } from "@mui/material";
import { PlaylistRemoveRounded, RemoveFromQueue, RuleFolder, TransferWithinAStation } from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";
import { useSelector } from "react-redux";

const ApprovingList = [
  {
    icon: <RuleFolder />,
    label: "Request",
    description: "Requesting for Asset Evaluation",
    path: "/approving/request",
    permission: "approving-request",
  },

  {
    icon: <TransferWithinAStation />,
    label: "Transfer",
    description: "Requesting for Asset Transfer",
    path: "/approving/transfer",
    permission: "approving-transfer",
  },

  {
    icon: <RemoveFromQueue />,
    label: "Pull-Out",
    description: "Requesting for Asset Pull-Out",
    path: "/approving/pull-out",
    permission: "approving-pullout",
  },

  {
    icon: <PlaylistRemoveRounded />,
    label: "Disposal",
    description: "List of For Disposal Items",
    path: "/approving/disposal",
    permission: "approving-disposal",
  },
];

const Approving = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");
  // console.log(location.pathname);

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <>
      {location.pathname === "/approving" ? (
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
            Approving
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {ApprovingList?.map((data, index) => {
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
    // <Outlet />
  );
};

export default Approving;
