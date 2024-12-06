import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useState } from "react";
import { Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useGetPulloutApiQuery } from "../../../Redux/Query/Movement/Pullout";
import NoRecordsFound from "../../../Layout/NoRecordsFound";

const Pullout = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState([]);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  const navigate = useNavigate();

  const handlePullout = () => {
    navigate(`add-pull-out`);
  };

  const {
    data: pulloutData,
    isLoading: pulloutLoading,
    isSuccess: pulloutSuccess,
    isError: pulloutError,
    error: errorData,
    refetch,
  } = useGetPulloutApiQuery(
    {
      page: page,
      per_page: perPage,
    },
    { refetchOnMountOrArgChange: true }
  );

  console.log("data", pulloutData);

  return (
    <Box className="mcontainer">
      <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem" }}>
        Pull out
      </Typography>

      <Box className="mcontainer__wrapper">
        <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

        <Box className="masterlist-toolbar__addBtn" sx={{ mt: 0.8 }}>
          <Button
            onClick={handlePullout}
            variant="contained"
            startIcon={isSmallScreen ? null : <Logout sx={{ transform: "rotate(270deg)" }} />}
            size="small"
            sx={isSmallScreen ? { minWidth: "50px", px: 0 } : null}
          >
            {isSmallScreen ? (
              <Logout color="black" sx={{ fontSize: "20px", transform: "rotate(270deg)" }} />
            ) : (
              "Pull out"
            )}
          </Button>
        </Box>

        <Box>
          <TableContainer className="mcontainer__th-body">
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
                  <TableCell className="tbl-cell">Request #</TableCell>
                  <TableCell className="tbl-cell">Request Description</TableCell>
                  <TableCell className="tbl-cell">Care of</TableCell>
                  <TableCell className="tbl-cell">Quantity</TableCell>
                  <TableCell className="tbl-cell">Status</TableCell>
                  <TableCell className="tbl-cell">Date Requested</TableCell>
                  <TableCell className="tbl-cell">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pulloutData?.data.length === 0 ? (
                  <NoRecordsFound heightData="medium" />
                ) : (
                  <TableRow>
                    {pulloutData?.data?.map((item) => (
                      <TableCell className="tbl-cell">{item?.id}</TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Pullout;
