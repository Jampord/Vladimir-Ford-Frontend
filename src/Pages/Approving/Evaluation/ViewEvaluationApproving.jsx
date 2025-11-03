import { Check, Close, Undo } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import StatusComponent from "../../../Components/Reusable/FaStatusComponent";

const ViewEvaluationApproving = ({
  data,
  handleCloseDialog,
  onApprovalApproveHandler,
  onApprovalReturnHandler,
  viewMode,
}) => {
  console.log("ViewEvaluationApproving data:", data);

  const dialogContentStyle = { display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 0.5 };

  return (
    <Box>
      <DialogTitle
        sx={{ color: "secondary.main", mb: -1, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography fontFamily={"Anton"} fontSize={"20px"}>
          Evaluation No. {data?.id}
        </Typography>

        <IconButton size="small" onClick={handleCloseDialog}>
          <Close color="black" />
        </IconButton>
      </DialogTitle>
      <Divider variant="middle" sx={{ border: "1px solid", borderColor: "secondary.light" }} />

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1, color: "secondary.main" }}>
        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Asset:
          </Typography>
          <Box overflow="hidden">
            <Tooltip
              title={
                <>
                  {data?.asset?.asset_description} - {data?.asset?.asset_specification}
                </>
              }
              placement="left"
              arrow
            >
              <Typography
                fontWeight={600}
                fontSize="13px"
                textOverflow="ellipsis"
                // width="400px"
                overflow="hidden"
                color="secondary.main"
                noWrap
              >
                {data?.asset?.asset_description}
              </Typography>
              <Typography
                fontSize="12px"
                color="secondary.light"
                textOverflow="ellipsis"
                // width="400px"
                overflow="hidden"
                noWrap
              >
                {data?.asset?.asset_specification}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Description:
          </Typography>
          <Typography fontSize="13px" fontWeight={500}>
            {data?.description}
          </Typography>
        </Box>

        <Divider />

        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Care of:
          </Typography>
          <Typography fontSize="13px" fontWeight={500}>
            {data?.care_of}
          </Typography>
        </Box>

        <Divider />

        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Evaluation:
          </Typography>
          {/* <Typography fontSize="13px">{data?.evaluation}</Typography> */}
          <Stack gap={0.5}>
            {/* <Chip
              label={data?.evaluation}
              size="small"
              color={
                data?.evaluation === "Repaired"
                  ? "success"
                  : data?.evaluation === "For Disposal"
                  ? "warning"
                  : "primary"
              }
            /> */}
            <StatusComponent faStatus={data?.evaluation} />
            {data?.evaluation === "Change Care-of" && (
              <>
                <Typography fontSize="11px" fontWeight={500}>
                  Change to:{" "}
                  {data?.care_of === "Hardware and Maintenance" ? "Machinery & Equipment" : "Hardware and Maintenance"}
                </Typography>
              </>
            )}
          </Stack>
        </Box>

        <Divider />

        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Remarks:
          </Typography>
          <Typography fontSize="13px" fontWeight={500}>
            {data?.remarks ? data?.remarks : "-"}
          </Typography>
        </Box>

        <Divider />

        <Box sx={dialogContentStyle}>
          <Typography fontSize="14px" fontWeight={600}>
            Date Created:
          </Typography>
          <Typography fontSize="13px" fontWeight={500}>
            {moment(data?.created_at).format("MMMM DD, YYYY")}
          </Typography>
        </Box>
      </DialogContent>

      <Divider variant="middle" sx={{ border: "1px solid", borderColor: "secondary.light", mb: viewMode && 1.5 }} />
      {!viewMode && (
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => onApprovalApproveHandler([data?.id])}
            startIcon={<Check color="primary" />}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onApprovalReturnHandler([data?.id])}
            startIcon={<Undo sx={{ color: "#5f3030" }} />}
            sx={{
              color: "white",
              backgroundColor: "error.main",
              ":hover": { backgroundColor: "error.dark" },
              mr: 1,
            }}
          >
            Return
          </Button>
        </DialogActions>
      )}
    </Box>
  );
};

export default ViewEvaluationApproving;
