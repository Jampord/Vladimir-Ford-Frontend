import {
  Box,
  Button,
  Dialog,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { ExpandCircleDown, LibraryAdd } from "@mui/icons-material";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog1, openDialog, openDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import AddCapexDialog from "./AddEdit/AddCapexDialog";
import AddCapexApprovalDialog from "../ApprovalCapex/AddCapexApprovalDialog";
import { useGetAddCapexApiQuery } from "../../../Redux/Query/Capex/AddCapex";
import NoRecordsFound from "../../../Layout/NoRecordsFound";

const ForEstimate = ({ addCapex }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const dispatch = useDispatch();
  const dialog1 = useSelector((state) => state.booleanState.dialogMultiple.dialog1);

  const {
    data: addCapexData,
    isLoading: addCapexLoading,
    isFetching: addCapexFetching,
    isSuccess: addCapexSuccess,
    isError: addCapexError,
    error: errorData,
    refetch: refetch,
  } = useGetAddCapexApiQuery({
    page: page,
    per_page: perPage,
    status: status,
    search: search,
  });

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    setPage(page + 1);
  };

  const handleOpenAdd = () => {
    dispatch(openDialog1());
  };

  return (
    <Stack className="category_height">
      <Box className="mcontainer__wrapper">
        <MasterlistToolbar
          path="#"
          onStatusChange={setStatus}
          onSearchChange={setSearch}
          onSetPage={setPage}
          hideArchive
        />

        {addCapex && (
          <Box className="masterlist-toolbar__addBtn" sx={{ mt: "4px", mr: "10px" }}>
            <Button
              onClick={handleOpenAdd}
              variant="contained"
              startIcon={isSmallScreen ? null : <LibraryAdd />}
              size="small"
              sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
            >
              {isSmallScreen ? <LibraryAdd color="black" sx={{ fontSize: "20px" }} /> : "Add Capex"}
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
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      color: "secondary.main",
                      position: "relative",
                    },
                  }}
                >
                  <TableCell className="tbl-cell tr-cen-pad45">
                    <ExpandCircleDown
                      sx={{
                        position: "absolute",
                        inset: 0,
                        margin: "auto",
                        color: "secondary.main",
                      }}
                    />
                  </TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">
                    <Typography variant="inherit" mb={-1}>
                      Transaction
                    </Typography>{" "}
                    <Typography variant="inherit">Number</Typography>
                  </TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Capex Number</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Capex Name</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Project Description</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Active Sub Capex</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Attachment Type</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Enrolled Budget</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">
                    <Typography variant="inherit" mb={-1}>
                      Estimated
                    </Typography>{" "}
                    <Typography variant="inherit">Amount</Typography>
                  </TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">
                    <Typography variant="inherit" mb={-1}>
                      Remaining
                    </Typography>{" "}
                    <Typography variant="inherit">Amount</Typography>
                  </TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Active Sub Capex</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Type of Expenditure</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Category of Assets</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                  <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {addCapexData?.data.length === 0 ? (
                  <NoRecordsFound heightData="medium" />
                ) : (
                  <>
                    {addCapexSuccess &&
                      addCapexData?.data.map((data) => (
                        <TableRow
                          sx={{
                            "& > *": {
                              whiteSpace: "nowrap",
                              color: "secondary.main",
                              position: "relative",
                            },
                          }}
                        >
                          <TableCell className="tbl-cell tr-cen-pad45">
                            <ExpandCircleDown
                              sx={{
                                position: "absolute",
                                inset: 0,
                                margin: "auto",
                                color: "gray",
                              }}
                            />
                          </TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">{data?.id}</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Capex Number</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Capex Name</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Project Description</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Status</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Active Sub Capex</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Attachment Type</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Enrolled Budget</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">
                            <Typography variant="inherit" mb={-1}>
                              Estimated
                            </Typography>{" "}
                            <Typography variant="inherit">Amount</Typography>
                          </TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">
                            <Typography variant="inherit" mb={-1}>
                              Remaining
                            </Typography>{" "}
                            <Typography variant="inherit">Amount</Typography>
                          </TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Active Sub Capex</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Type of Expenditure</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Category of Assets</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Date Created</TableCell>
                          <TableCell className="tbl-cell tr-cen-pad45">Action</TableCell>
                        </TableRow>
                      ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <CustomTablePagination
          total={addCapexData?.total}
          success={addCapexSuccess}
          current_page={addCapexData?.current_page}
          per_page={addCapexData?.per_page}
          onPageChange={pageHandler}
          onRowsPerPageChange={perPageHandler}
        />
      </Box>

      <Dialog
        open={dialog1}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog1())}
        PaperProps={{ sx: { borderRadius: "10px" } }}
        maxWidth="md"
        fullWidth
      >
        <AddCapexDialog />
        {/* <AddCapexApprovalDialog /> */}
      </Dialog>
    </Stack>
  );
};

export default ForEstimate;
