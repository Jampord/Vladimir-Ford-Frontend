import { Box, Skeleton, Stack } from "@mui/material";

const ToPickupSkeleton = () => {
  return (
    <Stack>
      <Stack direction="column" spacing={1} mt={1}>
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
        <Skeleton variant="rounded" width={240} height={30} />
      </Stack>
    </Stack>
  );
};

export default ToPickupSkeleton;
