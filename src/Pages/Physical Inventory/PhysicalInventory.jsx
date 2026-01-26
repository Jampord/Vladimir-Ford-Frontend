import React, { useState } from "react";
import "../../Style/Physical Inventory/physicalInventory.scss";
import { AppBar, Box, Button, Card, CardContent, Chip, Container, Toolbar, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

const PhysicalInventory = () => {
  const sessions = [
    {
      id: 1,
      name: "Warehouse A – Morning Count",
      date: "Jan 25, 2026",
      status: "active",
      scanned: 124,
    },
    {
      id: 2,
      name: "Store Room B",
      date: "Jan 23, 2026",
      status: "completed",
      scanned: 342,
    },
  ];
  return (
    <Box className="session-list">
      {/* Header */}
      <AppBar position="sticky" elevation={0} className="session-list__appbar">
        <Toolbar className="session-list__toolbar">
          <Typography className="mcontainer__title" sx={{ fontFamily: "Anton", fontSize: "2rem", color: "text.light" }}>
            Sessions
          </Typography>
          <Button variant="contained" size="small" startIcon={<Add />}>
            New Session
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container className="session-list__content">
        {sessions.map((session) => (
          <Card key={session.id} className="session-card">
            <CardContent className="session-card__content">
              <div className="session-card__info">
                <Typography className="session-card__title">{session.name}</Typography>
                <Typography className="session-card__date">{session.date}</Typography>
              </div>

              <div className="session-card__meta">
                <Chip size="small" label={session.status} className={`status-chip ${session.status}`} />
                <Typography className="session-card__count">{session.scanned} scanned</Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
};

export default PhysicalInventory;
