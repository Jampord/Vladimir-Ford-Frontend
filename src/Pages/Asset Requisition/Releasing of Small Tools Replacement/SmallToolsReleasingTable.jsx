import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControlLabel,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import MasterlistToolbar from "../../../Components/Reusable/MasterlistToolbar";
import { useGetSmallToolsReleasingQuery } from "../../../Redux/Query/Request/AssetReleasing";
import CustomTablePagination from "../../../Components/Reusable/CustomTablePagination";
import MasterlistSkeleton from "../../Skeleton/MasterlistSkeleton";
import ErrorFetching from "../../ErrorFetching";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { Output } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog } from "../../../Redux/StateManagement/booleanStateSlice";
import AddSmallToolsReleasingInfo from "./AddSmallToolsReleasingInfo";

const schema = yup.object().shape({
  small_tools_id: yup.array(),
});

const SmallToolsReleasingTable = ({ released }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [smallTools, setSmallTools] = useState([]);

  const dispatch = useDispatch();

  const dialog = useSelector((state) => state.booleanState.dialog);

  const {
    data: releasingData,
    isLoading: releasingLoading,
    isSuccess: releasingSuccess,
    isError: releasingError,
    error: errorData,
    refetch,
  } = useGetSmallToolsReleasingQuery(
    {
      page: page,
      per_page: perPage,
      status: status,
      search: search,
      released: released ? 1 : 0,
    },
    { refetchOnMountOrArgChange: true }
  );

  //   console.log("🧨🧨🧨", releasingData?.data);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setError,
    register,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      small_tools_id: [],
    },
  });

  const perPageHandler = (e) => {
    setPage(1);
    setPerPage(parseInt(e.target.value));
  };

  const pageHandler = (_, page) => {
    // console.log(page + 1);
    setPage(page + 1);
  };

  const handleReleasing = () => {
    setSmallTools({
      small_tools_id: watch("small_tools_id"),
    });
    dispatch(openDialog());
  };

  const smallToolsAllHandler = (checked) => {
    if (checked) {
      setValue(
        "small_tools_id",
        releasingData?.data?.map((item) => item?.id)
      );
    } else {
      reset({ small_tools_id: [] });
    }
  };

  //   console.log("small_tool_id", watch("small_tools_id"));

  return (
    <Stack sx={{ height: "calc(100vh - 250px)" }}>
      {releasingLoading && <MasterlistSkeleton onAdd={true} category />}
      {releasingError && <ErrorFetching refetch={refetch} error={errorData} />}
      {releasingData && !releasingError && (
        <>
          <Box className="mcontainer__wrapper">
            <MasterlistToolbar onStatusChange={setStatus} onSearchChange={setSearch} onSetPage={setPage} hideArchive />

            {!released && (
              <Button
                variant="contained"
                onClick={() => handleReleasing()}
                size="small"
                startIcon={<Output />}
                sx={{ position: "absolute", right: 0, top: -40 }}
                disabled={watch("small_tools_id").length === 0}
              >
                Release
              </Button>
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
                      {!released && (
                        <TableCell align="center" className="tbl-cell">
                          <FormControlLabel
                            sx={{ margin: "auto", align: "center" }}
                            control={
                              <Checkbox
                                value=""
                                size="small"
                                checked={
                                  !!releasingData?.data
                                    ?.map((mapItem) => {
                                      return mapItem.id;
                                    })
                                    ?.every((item) => {
                                      return watch("small_tools_id").includes(item);
                                    })
                                }
                                onChange={(e) => {
                                  smallToolsAllHandler(e.target.checked);
                                  // console.log(e.target.checked);
                                }}
                              />
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="tbl-cell">ID No.</TableCell>
                      <TableCell className="tbl-cell">Vladimir Tag Number</TableCell>
                      <TableCell className="tbl-cell">Item Code</TableCell>
                      <TableCell className="tbl-cell">Item Name</TableCell>
                      <TableCell className="tbl-cell">PR/PO/RR No.</TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Quantity
                      </TableCell>
                      <TableCell className="tbl-cell" align="center">
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {releasingData?.data.length === 0 ? (
                      <NoRecordsFound heightData="small" />
                    ) : (
                      releasingData?.data.map((data) => (
                        <TableRow
                          key={data.id}
                          hover
                          // onClick={() => handleViewData(data)}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              borderBottom: 0,
                            },
                            cursor: "pointer",
                          }}
                        >
                          {/* {console.log("data: ", data)} */}
                          {!released && (
                            <TableCell className="tbl-cell" size="small" align="center">
                              <FormControlLabel
                                value={data?.id}
                                sx={{ margin: "auto" }}
                                disabled={data.action === "view"}
                                control={
                                  <Checkbox
                                    size="small"
                                    // {...register("small_tools_id")}
                                    onChange={(e) => {
                                      const value = data?.id;
                                      const currentValues = watch("small_tools_id") || [];
                                      const newValues = e.target.checked
                                        ? [...currentValues, value]
                                        : currentValues.filter((item) => item !== value);
                                      setValue("small_tools_id", newValues);
                                    }}
                                    checked={watch("small_tools_id").includes(data?.id)}
                                  />
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="tbl-cell text-weight">{data.id}</TableCell>
                          <TableCell className="tbl-cell ">{data.vladimir_tag_number}</TableCell>
                          <TableCell className="tbl-cell ">{data.item_code}</TableCell>
                          <TableCell className="tbl-cell ">{data.item}</TableCell>
                          <TableCell className="tbl-cell ">
                            <Typography fontSize={12} fontWeight={800} color="secondary.light">
                              PR - {data.pr_number}
                            </Typography>
                            <Typography fontSize={12} fontWeight={800} color="secondary.light">
                              PO - {data.po_number}
                            </Typography>
                            <Typography fontSize={12} fontWeight={800} color="secondary.light">
                              RR - {data.rr_number}
                            </Typography>
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {data.quantity}
                          </TableCell>
                          <TableCell className="tbl-cell " align="center">
                            {!released ? (
                              <Chip
                                size="small"
                                variant="contained"
                                sx={{
                                  background: "#f5cc2a2f",
                                  color: "#c59e00",
                                  fontSize: "0.7rem",
                                  px: 1,
                                }}
                                label="Pending"
                              />
                            ) : data.status_description === "Good" ? (
                              <Chip
                                size="small"
                                variant="contained"
                                sx={{
                                  background: "#27ff811f",
                                  color: "active.dark",
                                  fontSize: "0.7rem",
                                  px: 1,
                                }}
                                label={data?.status_description}
                              />
                            ) : data.status_description === "For Releasing" ||
                              data.status_description === "For Replacement" ? (
                              <Chip
                                size="small"
                                variant="contained"
                                sx={{
                                  // border: "1px solid #E9D502",
                                  background: "#FFFFB3",
                                  color: "#C29800",
                                  fontSize: "0.7rem",
                                  px: 1,
                                }}
                                label={data?.status_description}
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="contained"
                                sx={{
                                  background: "#fc3e3e34",
                                  color: "error.light",
                                  fontSize: "0.7rem",
                                  px: 1,
                                }}
                                label={data?.status_description}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <CustomTablePagination
              total={releasingData?.total}
              success={releasingSuccess}
              current_page={releasingData?.current_page}
              per_page={releasingData?.per_page}
              onPageChange={pageHandler}
              onRowsPerPageChange={perPageHandler}
            />
          </Box>
        </>
      )}

      <Dialog
        open={dialog}
        TransitionComponent={Grow}
        onClose={() => dispatch(closeDialog())}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            margin: "0",
            maxWidth: "700px",
            py: "20px",
            px: "10px",
            overflow: "hidden",
            // width: "1500px",
          },
        }}
      >
        <AddSmallToolsReleasingInfo data={releasingData?.data} smallTools={smallTools} />
      </Dialog>
    </Stack>
  );
};

export default SmallToolsReleasingTable;
