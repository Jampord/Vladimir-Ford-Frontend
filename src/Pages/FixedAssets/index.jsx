import React from "react";
import { Outlet } from "react-router";

import "../../Style/parentSidebar.scss";
import { useLocation } from "react-router-dom";

import { Box, Typography, useMediaQuery } from "@mui/material";
import { InventoryRounded, PriceChange } from "@mui/icons-material";
import Cards from "../../Components/Reusable/Cards";

const FixedAssetList = [
  {
    icon: <InventoryRounded />,
    label: "Fixed Assets",
    description: "List of Fixed Assets",
    path: "/fixed-asset/fixed-asset",
  },

  {
    icon: <PriceChange />,
    label: "Depreciation",
    description: "List of Fixed Asset Depreciation",
    path: "/fixed-asset/depreciation",
  },
];

const FixedAssetIndex = () => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 590px)");
  // console.log(location);

  return (
    <>
      {location.pathname === "/fixed-asset" ? (
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
            Asset Management
          </Typography>
          <Box className="parentSidebar">
            <Box className="parentSidebar__container">
              <Box className="parentSidebar__wrapper">
                {FixedAssetList?.map((data, index) => {
                  return <Cards data={data} key={index} />;
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

export default FixedAssetIndex;
