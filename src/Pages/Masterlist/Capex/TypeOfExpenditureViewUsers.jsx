import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import React from "react";
import NoRecordsFound from "../../../Layout/NoRecordsFound";
import { closeDialog1 } from "../../../Redux/StateManagement/booleanStateSlice";
import { useDispatch } from "react-redux";

const TypeOfExpenditureViewUsers = ({ taggedUsers }) => {
  console.log(taggedUsers);

  const dispatch = useDispatch();
  return (
    <>
      <DialogTitle sx={{ textAlign: "center", m: -0.5 }}>
        <Typography color="secondary.main" sx={{ fontFamily: "Anton", fontSize: "1.5rem" }}>
          ESTIMATORS
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
        dividers
      >
        <Box
          sx={{
            width: "100%",
            maxHeight: 300,
            overflowY: "auto",
            borderRadius: 2,
            p: 1,
          }}
          flex={1}
        >
          {taggedUsers && taggedUsers.length > 0 ? (
            taggedUsers.map((user, index) => (
              <Box
                key={user.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  transition: "background 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  borderBottom: index !== taggedUsers.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#344955",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  {user.firstname[0]}
                  {user.lastname[0]}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
                    {user.firstname} {user.lastname}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "13px" }}>({user.employee_id})</Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ justifyContent: "center", display: "flex", alignItems: "center" }}>
              <NoRecordsFound heightData={"xs"} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ mb: 0.5, mr: 2, ml: 2 }}>
        <Button variant="contained" color="secondary" fullWidth onClick={() => dispatch(closeDialog1())}>
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default TypeOfExpenditureViewUsers;
