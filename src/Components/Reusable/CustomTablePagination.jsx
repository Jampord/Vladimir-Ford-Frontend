import { TablePagination } from "@mui/material";
import React from "react";

const CustomTablePagination = (props) => {
  const {
    total,
    current_page,
    per_page,
    perPage,
    onPageChange,
    onRowsPerPageChange,
    removeShadow,
    // New props for URL integration
    useUrlParams = false,
    onUrlParamsChange,
  } = props;

  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    }

    if (useUrlParams && onUrlParamsChange) {
      onUrlParamsChange("page", newPage + 1); // MUI uses 0-indexed, we want 1-indexed in URL
    }
  };

  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);

    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    }

    if (useUrlParams && onUrlParamsChange) {
      // Reset to first page when changing rows per page
      onUrlParamsChange("per_page", newPerPage);
      onUrlParamsChange("page", 1);
    }
  };

  return (
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
  );
};

export default CustomTablePagination;
