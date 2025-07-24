import { Box, Skeleton, Stack } from "@mui/material";

const AddPulloutSkeleton = () => {
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
      </Stack>

      <Stack mt={3}>
        <Skeleton variant="text" width={120} height={40} />
      </Stack>
      <Skeleton variant="rounded" width={210} height={30} />
      <Stack gap={0.2} mt={1}>
        <Skeleton variant="text" width={180} height={10} />
        <Skeleton variant="text" width={180} height={10} />
        <Skeleton variant="text" width={180} height={10} />
      </Stack>
    </Stack>
  );
};

export default AddPulloutSkeleton;
