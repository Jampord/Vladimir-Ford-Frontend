import React, { useEffect } from "react";
import "../../Style/parentSidebar.scss";

import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";

import { Box, Typography, useMediaQuery } from "@mui/material";
import {
  AssignmentTurnedIn,
  CallReceived,
  HighlightAlt,
  History,
  MoveDownOutlined,
  PlaylistRemoveRounded,
  RemoveFromQueue,
  RuleFolder,
  ScreenSearchDesktop,
  TransferWithinAStation,
} from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";
import { useSelector } from "react-redux";
import { useGetNotificationApiQuery } from "../../Redux/Query/Notification";

const AssetMovement = () => {
  const { data: notifData, refetch } = useGetNotificationApiQuery();
  useEffect(() => {
    refetch();
  }, [notifData]);

  const MovementList = [
    {
      icon: <TransferWithinAStation />,
      label: "Transfer",
      description: "Requesting for Asset Transfer",
      path: "/asset-movement/transfer",
      permission: "transfer",
    },
    {
      icon: <MoveDownOutlined />,
      label: "Receiving of Transfer",
      description: "List of For Receiving and Received Transfers",
      path: "/asset-movement/transfer-receiving",
      permission: "transfer-receiving",
      notification: notifData?.toTransferReceiving,
    },
    {
      icon: <CallReceived />,
      label: "Transfer Releasing",
      description: "List of For Releasing Transfers",
      path: "/asset-movement/transfer-pullout-releasing",
      permission: "transfer-pullout-releasing",
      notification: notifData?.pulloutTransferReleasingCount,
    },
    {
      icon: <RemoveFromQueue />,
      label: "Pullout",
      description: "Requesting for Asset Pullout",
      path: "/asset-movement/pull-out",
      permission: "pull-out",
    },
    {
      icon: <ScreenSearchDesktop />,
      label: "Evaluation",
      description: "List and Details of Asset Evaluation",
      path: "/asset-movement/evaluation",
      permission: "evaluation",
      notification:
        notifData?.toPickUpCount +
        notifData?.toEvaluateCount +
        notifData?.toReplaceCount +
        notifData?.spareCount +
        notifData?.disposalCount,
    },
    {
      icon: <AssignmentTurnedIn />,
      label: "Pullout Confirmation",
      description: "List of For Confirmation Items",
      path: "/asset-movement/pull-out-confirmation",
      permission: "pull-out",
      notification: notifData?.repairedCount,
    },
    {
      icon: <PlaylistRemoveRounded />,
      label: "Disposal",
      description: "List of For Disposal Items",
      path: "/asset-movement/disposal",
      permission: "disposal",
    },
    {
      icon: <HighlightAlt />,
      label: "Receiving of Disposal",
      description: "List of For Receiving and Received Disposal Items",
      path: "/asset-movement/disposal-receiving",
      permission: "disposal-receiving",
      notification: notifData?.disposalReceivingCount,
    },
  ];
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
