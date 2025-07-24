import { Box, Skeleton, Stack } from "@mui/material";

const ApprovalViewTransferSkeleton = () => {
  return (
    <Stack>
      <Skeleton variant="text" width={160} height={60} />

      <Box mt={1} />

      <Box>
        <Skeleton variant="text" width={100} height={35} />
      </Box>

      <Stack direction="column" spacing={1} mt={1}>
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Stack gap={0.2}>
          <Skeleton variant="text" width={180} height={10} />
          <Skeleton variant="text" width={180} height={10} />
          <Skeleton variant="text" width={180} height={10} />
        </Stack>
      </Stack>

      <Stack mt={3}>
        <Skeleton variant="text" width={110} height={35} />
      </Stack>

      <Stack direction="column" spacing={1} mt={1}>
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
        <Skeleton variant="rounded" width={210} height={30} />
      </Stack>

      <Stack mt={3}>
        <Skeleton variant="text" width={120} height={40} />
      </Stack>

      <Stack direction="column" mt={0}>
        <Skeleton variant="rounded" width={210} height={30} />
      </Stack>
    </Stack>
  );
};

export default ApprovalViewTransferSkeleton;
