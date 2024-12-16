import { useState } from "react";
import { useGetAssetsToPickupApiQuery } from "../../../Redux/Query/Movement/Evaluation";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { IosShareRounded, ShoppingCartCheckout, Visibility } from "@mui/icons-material";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import { useNavigate } from "react-router-dom";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";

const ToPickup = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const navigate = useNavigate();

  // Table Properties --------------------------------
  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    isSuccess: isEvaluationSuccess,
    isError: isEvaluationError,
    isFetching: isEvaluationFetching,
    error: errorData,
    refetch,
  } = useGetAssetsToPickupApiQuery(
    {
      page: page,
      per_page: perPage,
    },
    { refetchOnMountOrArgChange: true }
  );
  // console.log("evaldata", ...evaluationData.data);

  const handleViewPickup = (data) => {
    // console.log("data: ", data);
    const view = true;
    navigate(`to-pickup/${data.id}`, {
      state: { ...data, view },
    });
  };

  return (
    <Stack className="category_height">
      {isEvaluationLoading && <MasterlistSkeleton onAdd={true} />}
      {isEvaluationError && <ErrorFetching refetch={refetch} error={errorData} />}
      {evaluationData && !isEvaluationError && !isEvaluationLoading && (
        <Box className="mcontainer__wrapper">
          <MasterlistToolbar
            path="#"
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSetPage={setPage}
            hideArchive
          />

          {/* <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
            <Button
              // onClick={}
              variant="contained"
              startIcon={isSmallScreen ? null : <ShoppingCartCheckout />}
              size="small"
              sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
            >
              {isSmallScreen ? <ShoppingCartCheckout color="black" sx={{ fontSize: "20px" }} /> : "Pickup"}
            </Button>
          </Box> */}

          <Box>
            <TableContainer className="mcontainer__th-body-category">
              <Table className="mcontainer__table" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& > *": {
                        fontWeight: "bold!important",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell className="tbl-cell-category" align="center">
                      Request #
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Care of
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      View Information
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Item Count
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Remarks
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Requestor
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {evaluationData?.data.length === 0 ? (
                    <NoRecordsFound heightData="medium" />
                  ) : (
                    <>
                      {evaluationData?.data.map((item) => (
                        <TableRow
                          key={item?.id}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell className="tbl-cell text-weight" align="center">
                            {item?.id}
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            {item?.description}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            <Typography fontSize="12px" color="black" fontWeight="500">
                              {item?.care_of}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            <Tooltip placement="top" title="View Pullout Information" arrow>
                              <IconButton onClick={() => handleViewPickup(item)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            {item?.asset_count}
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            {item?.remarks === null ? "None" : item.remarks}
                          </TableCell>
                          <TableCell className="tbl-cell" align="center">
                            <Typography fontSize="12px" color="black" fontWeight="bold">
                              {item?.requester?.employee_id}
                            </Typography>
                            <Typography fontSize="12px" color="black">
                              {item?.requester?.first_name} {item?.requester?.last_name}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box className="mcontainer__pagination-export">
            <Button
              className="mcontainer__export"
              variant="outlined"
              size="small"
              color="text"
              startIcon={<IosShareRounded color="primary" />}
              // onClick={handleExport}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 20px",
              }}
            >
              EXPORT
            </Button>

            <CustomTablePagination
              total={evaluationData?.total}
              success={isEvaluationSuccess}
              current_page={evaluationData?.current_page}
              per_page={evaluationData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default ToPickup;
