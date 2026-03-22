import { TablePagination, Box, TextField, IconButton, Typography, useMediaQuery } from "@mui/material";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import React, { useState } from "react";

const CustomTablePagination = (props) => {
  const {
    total,
    current_page,
    per_page,
    perPage,
    onPageChange,
    onRowsPerPageChange,
    removeShadow,
    useUrlParams = false,
    onUrlParamsChange,
    enableJumpToPage,
  } = props;

  const isSmallScreen = useMediaQuery("(min-width: 1000px)");

  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    }

    if (useUrlParams && onUrlParamsChange) {
      onUrlParamsChange("page", newPage + 1); // MUI uses 0-indexed, we want 1-indexed in URL
    }
  };

  const rowsPerPage = parseInt(per_page || perPage) || 5;
  const totalPages = Math.ceil((total || 0) / rowsPerPage);

  const [jumpPage, setJumpPage] = useState("");

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    onPageChange?.(null, page - 1);

    if (useUrlParams && onUrlParamsChange) {
      onUrlParamsChange("page", page);
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);

    onRowsPerPageChange?.(event);

    if (useUrlParams && onUrlParamsChange) {
      onUrlParamsChange("per_page", newPerPage);
      onUrlParamsChange("page", 1);
    }
  };

  const handleJump = () => {
    const page = parseInt(jumpPage);
    if (!page) return;

    goToPage(page);
    setJumpPage("");
  };

  return (
    <Box
      className={removeShadow ? "" : "mcontainer__pagination"}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        px: 2,
      }}
    >
      {isSmallScreen ? (
        <>
          {/* LEFT: Rows per page */}
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25, 100]}
            count={total || 0}
            page={current_page - 1 || 0}
            rowsPerPage={rowsPerPage}
            onPageChange={() => {}}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelDisplayedRows={() => ""}
            sx={{
              ".MuiTablePagination-actions": {
                display: "none",
              },
            }}
          />

          {/* CENTER: Pagination Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => goToPage(1)} disabled={current_page === 1}>
              <FirstPage />
            </IconButton>

            <IconButton onClick={() => goToPage(current_page - 1)} disabled={current_page === 1}>
              <KeyboardArrowLeft />
            </IconButton>

            <Typography fontSize={14}>
              Page {current_page} of {totalPages}
            </Typography>

            <IconButton onClick={() => goToPage(current_page + 1)} disabled={current_page === totalPages}>
              <KeyboardArrowRight />
            </IconButton>

            <IconButton onClick={() => goToPage(totalPages)} disabled={current_page === totalPages}>
              <LastPage />
            </IconButton>
          </Box>

          {/* RIGHT: Jump to page */}
          {enableJumpToPage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography fontSize={14}>Jump to</Typography>

              <TextField
                size="small"
                type="number"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJump();
                }}
                sx={{ width: 70 }}
              />

              <Typography fontSize={14}>/ {totalPages}</Typography>
            </Box>
          )}
        </>
      ) : (
        <TablePagination
          className={removeShadow ? "" : "mcontainer__pagination"}
          component="div"
          rowsPerPageOptions={[5, 10, 25, 100]}
          count={total || 0}
          page={current_page - 1 || 0}
          rowsPerPage={parseInt(per_page || perPage) || 5}
          // onPageChange={onPageChange}
          // onRowsPerPageChange={onRowsPerPageChange}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Box>
  );
};

export default CustomTablePagination;
