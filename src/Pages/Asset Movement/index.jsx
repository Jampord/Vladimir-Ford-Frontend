import React from "react";
import "../../Style/parentSidebar.scss";

import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { Box, Typography, useMediaQuery } from "@mui/material";
import {
  MoveDownOutlined,
  PlaylistRemoveRounded,
  RemoveFromQueue,
  RuleFolder,
  TransferWithinAStation,
} from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";
import { useSelector } from "react-redux";

const MovementList = [
  {
    icon: <TransferWithinAStation />,
    label: "Transfer",
    description: "Requesting for Asset Transfer",
    path: "/asset-movement/transfer",
    permission: "transfer",
  },

  {
    icon: <RemoveFromQueue />,
    label: "Pull-Out",
    description: "Requesting for Asset Pull-Out",
    path: "/asset-movement/pull-out",
    permission: "pull-out",
  },

  // {
  //   icon: <RuleFolder />,
  //   label: "Evaluation",
  //   description: "Requesting for Asset Evaluation",
  //   path: "/asset-movement/evaluation",
  // },

  {
    icon: <PlaylistRemoveRounded />,
    label: "Disposal",
    description: "List of For Disposal Items",
    path: "/asset-movement/disposal",
    permission: "disposal",
  },

  {
    icon: <MoveDownOutlined />,
    label: "Receiving of Transfer",
    description: "List of For Receiving and Received Transfers",
    path: "/asset-movement/transfer-receiving",
    permission: "transfer-receiving",
  },
];

const AssetMovement = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");
  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <>
      {location.pathname === "/asset-movement" ? (
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
            Asset Movement
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {MovementList?.map((data, index) => {
                  return permissions.split(", ").includes(data?.permission) && <Cards data={data} key={index} />;
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

export default AssetMovement;
