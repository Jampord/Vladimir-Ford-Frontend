import React from "react";
import { Stack, Box, Typography, Tooltip } from "@mui/material";
import { InsertDriveFile, PictureAsPdf, Image, TableChart, Download } from "@mui/icons-material";

const getFileIcon = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return <PictureAsPdf sx={{ color: "#DC2626", fontSize: 16 }} />;
  if (lower.match(/\.(jpg|jpeg|png|gif|webp)/)) return <Image sx={{ color: "#2563EB", fontSize: 16 }} />;
  if (lower.match(/\.(xls|xlsx|csv)/)) return <TableChart sx={{ color: "#2E8E63", fontSize: 16 }} />;
  return <InsertDriveFile sx={{ color: "#90A0AA", fontSize: 16 }} />;
};

const AttachmentList = ({
  sources = [], // array of arrays
  onFileClick,
  maxVisible,
  emptyText = "No attachments",
}) => {
  // merge all sources safely
  const attachments = sources.flat().filter(Boolean);

  const visibleFiles = maxVisible ? attachments.slice(0, maxVisible) : attachments;
  const remaining = maxVisible ? attachments.length - maxVisible : 0;

  return (
    <Stack spacing={0.8}>
      {visibleFiles.length > 0 ? (
        visibleFiles.map((file) => (
          <Tooltip key={file?.id} title="View or download attachment" arrow>
            <Box
              onClick={() => onFileClick?.(file)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                px: 1,
                py: 0.7,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                maxWidth: 240,

                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                },

                "&:hover .download-icon": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              }}
            >
              {/* LEFT */}
              <Stack direction="row" spacing={1} alignItems="center">
                {getFileIcon(file?.name)}

                <Typography
                  fontSize={12}
                  fontWeight={500}
                  noWrap
                  sx={{
                    maxWidth: 140,
                    color: "#2C3639",
                  }}
                >
                  {file?.name}
                </Typography>
              </Stack>

              {/* RIGHT */}
              <Download
                className="download-icon"
                sx={{
                  fontSize: 16,
                  color: "#5C6D77",
                  opacity: 0,
                  transform: "translateX(6px)",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
        ))
      ) : (
        <Typography fontSize={11} color="#90A0AA">
          {emptyText}
        </Typography>
      )}

      {/* Remaining indicator */}
      {remaining > 0 && (
        <Typography fontSize={11} color="#036D70">
          +{remaining} more
        </Typography>
      )}
    </Stack>
  );
};

export default AttachmentList;

// ===== USAGE EXAMPLE =====
// <AttachmentList
//   sources={[
//     actionMenuData?.[index]?.attachments || [],
//     data?.assets?.[index]?.attachments || [],
//   ]}
//   onFileClick={(file) => handleFileView(file?.id)}
//   maxVisible={2}
// />
