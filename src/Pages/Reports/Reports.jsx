import React from "react";
import "../../Style/parentSidebar.scss";

import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { Box, Typography, useMediaQuery } from "@mui/material";
import {
  Addchart,
  Analytics,
  PlaylistRemoveRounded,
  RemoveFromQueue,
  RuleFolder,
  TransferWithinAStation,
} from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";
import { useSelector } from "react-redux";

const ReportList = [
  {
    icon: <AssessmentIcon />,
    label: "PR Reports",
    description: "List of  PR Reports",
    path: "/reports/pr-report",
    permission: "pr-report",
  },

  {
    icon: <Addchart />,
    label: "Transfer History Reports",
    description: "List of Asset Transfers",
    path: "/reports/transfer-report",
    permission: "transfer-report",
  },
  {
    icon: <Analytics />,
    label: "General Ledger Reports",
    description: "List of GL Reports",
    path: "/reports/general-ledger-report",
    permission: "general-ledger-report",
  },

  // {
  //   icon: <RuleFolder />,
  //   label: "Evaluation",
  //   description: "Requesting for Asset Evaluation",
  //   path: "/asset-movement/evaluation",
  // },

  //   {
  //     icon: <PlaylistRemoveRounded />,
  //     label: "Disposal",
  //     description: "List of For Disposal Items",
  //     path: "/asset-movement/disposal",
  //   },
];

const Reports = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");
  // console.log(location.pathname);

  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  return (
    <>
      {location.pathname === "/reports" ? (
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
            Reports
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {ReportList?.map((data, index) => {
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

export default Reports;
