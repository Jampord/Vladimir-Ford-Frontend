import {
  Box,
  Button,
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
import { LoadingData } from "../../../Components/LottieFiles/LottieComponents";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import { useGetAssetsToEvaluateApiQuery } from "../../../Redux/Query/Movement/Evaluation";
import { useState } from "react";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { Attachment, IosShareRounded, ScreenSearchDesktop } from "@mui/icons-material";
import { useDownloadTransferAttachment } from "../../../Hooks/useDownloadAttachment";
import ErrorFetching from "../../ErrorFetching";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";

const ListOfPullout = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");

  const isSmallScreen = useMediaQuery("(max-width: 500px)");

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
  } = useGetAssetsToEvaluateApiQuery(
    {
      page: page,
      per_page: perPage,
    },
    { refetchOnMountOrArgChange: true }
  );

  console.log(evaluationData?.data);

  const DlAttachment = (transfer_number) => (
    <Tooltip title="Download Attachment" placement="top" arrow>
      <Box
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "primary.main",
          fontSize: "12px",
        }}
        onClick={() => handleDownloadAttachment({ value: "attachments", transfer_number: transfer_number })}
      >
        <Attachment />
      </Box>
    </Tooltip>
  );

  const handleDownloadAttachment = (value) =>
    useDownloadTransferAttachment({
      attachments: "attachments",
      transfer_number: value?.asset?.attachments?.id,
    });

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

          {(!isEvaluationLoading || !isEvaluationFetching) && (
            <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }} mr="10px">
              <Button
                // onClick={}
                variant="contained"
                startIcon={isSmallScreen ? null : <ScreenSearchDesktop />}
                size="small"
                disabled
                sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
              >
                {isSmallScreen ? <ScreenSearchDesktop color="black" sx={{ fontSize: "20px" }} /> : "Evaluate"}
              </Button>
            </Box>
          )}

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
                      Vladimir Tag Number
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Asset Specification
                    </TableCell>
                    {/* <TableCell className="tbl-cell-category" align="center">
                      Description
                    </TableCell> */}
                    <TableCell className="tbl-cell-category" align="center">
                      Care of
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Evaluation Status
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Attachments
                    </TableCell>
                    <TableCell className="tbl-cell-category" align="center">
                      Remarks
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
                          <TableCell className="tbl-cell text-weight" align="center">
                            <Typography fontSize="12px" color="black" fontWeight="bold">
                              {item?.asset?.vladimir_tag_number}
                            </Typography>
                            <Typography fontSize="12px" color="gray" fontWeight="500">
                              {item?.asset?.asset_description}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.asset?.asset_specification}
                          </TableCell>
                          {/* <TableCell className="tbl-cell " align="center">
                              {item?.description}
                            </TableCell> */}
                          <TableCell className="tbl-cell " align="center">
                            <Typography fontSize="12px" color="black" fontWeight="500">
                              {item?.care_of}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.evaluation}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            <DlAttachment transfer_number={item?.id} />
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {item?.remarks === null ? "none" : item?.remarks}
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

export default ListOfPullout;
